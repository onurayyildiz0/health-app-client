import { useState, useEffect, useMemo } from 'react';
import { Card, Table, Tag, Button, Modal, message, Avatar, Typography, Tooltip, Row, Col, Statistic, Popconfirm, Form, Input, Tabs, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, EyeOutlined, SearchOutlined, StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

// Slices
import { 
    fetchDoctorAppointments, 
    updateAppointmentStatus, 
    cancelExistingAppointment,
    completeAppointment,
    selectAllAppointments, 
    selectAppointmentLoading 
} from '../../store/slices/appointmentSlice';

dayjs.locale('tr');
const { Title, Text } = Typography;

const DoctorAppointments = () => {
    const dispatch = useDispatch();
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);

    // Local State
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // Filters
    const [activeTab, setActiveTab] = useState('upcoming'); // Varsayılan: Gelecek randevular
    const [searchText, setSearchText] = useState('');
    
    // Complete Modal
    const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
    const [completionForm] = Form.useForm();
    const [completingAppointmentId, setCompletingAppointmentId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    // --- FİLTRELEME MANTIĞI ---
    const filteredList = useMemo(() => {
        let list = [...appointments];
        const today = dayjs().startOf('day');

        // 1. Tab Filtresi
        if (activeTab === 'pending') {
            list = list.filter(a => a.status === 'pending');
        } else if (activeTab === 'upcoming') {
            // Gelecek = Tarihi bugün veya sonra olan VE iptal/tamamlanmış olmayanlar
            list = list.filter(a => (dayjs(a.date).isSame(today) || dayjs(a.date).isAfter(today)) && a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'pending');
        } else if (activeTab === 'today') {
            list = list.filter(a => dayjs(a.date).isSame(today, 'day') && a.status !== 'cancelled');
        } else if (activeTab === 'completed') {
            list = list.filter(a => a.status === 'completed');
        } else if (activeTab === 'cancelled') {
            list = list.filter(a => a.status === 'cancelled');
        }

        // 2. Arama Filtresi (Hasta Adı)
        if (searchText) {
            const lower = searchText.toLowerCase();
            list = list.filter(a => a.patient?.name?.toLowerCase().includes(lower) || a.patient?.email?.toLowerCase().includes(lower));
        }

        // Sıralama
        return list.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
    }, [appointments, activeTab, searchText]);

    const handleUpdateStatus = async (id, status) => {
        setActionLoading(true);
        try {
            await dispatch(updateAppointmentStatus({ id, status }));
            message.success('Randevu durumu güncellendi');
            if (isModalVisible) setIsModalVisible(false);
        } catch {
            message.error('Güncelleme başarısız');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (id) => {
        setActionLoading(true);
        try {
            await dispatch(cancelExistingAppointment(id));
            message.success('Randevu iptal edildi');
            if (isModalVisible) setIsModalVisible(false);
        } catch {
            message.error('İptal işlemi başarısız');
        } finally {
            setActionLoading(false);
        }
    };

    const openCompletionModal = (record) => {
        setCompletingAppointmentId(record.id);
        setIsCompleteModalVisible(true);
    };

    const handleCompleteSubmit = async (values) => {
        setActionLoading(true);
        try {
            await dispatch(completeAppointment(completingAppointmentId, values));
            message.success('Randevu tamamlandı ve rapor oluşturuldu.');
            setIsCompleteModalVisible(false);
            completionForm.resetFields();
            if(isModalVisible) setIsModalVisible(false);
        } catch (err) {
            message.error(err.response?.data?.message || err.message || 'İşlem başarısız');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (s) => ({ pending: 'orange', booked: 'blue', confirmed: 'blue', cancelled: 'red', completed: 'green' }[s] || 'default');
    const getStatusText = (s) => ({ pending: 'Onay Bekliyor', booked: 'Rezerve', confirmed: 'Rezerve', cancelled: 'İptal', completed: 'Tamamlandı' }[s] || s);

    const columns = [
        {
            title: 'Hasta', key: 'patient', fixed: 'left', width: 250,
            render: (r) => (
                <div className="flex items-center gap-3">
                    <Avatar size={40} icon={<UserOutlined />} src={r.patient?.avatar} className="bg-orange-100 text-orange-600"/>
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-gray-800">{r.patient?.name || 'Bilinmeyen'}</span>
                        <span className="text-xs text-gray-500 truncate">{r.patient?.email}</span>
                    </div>
                </div>
            )
        },
        { title: 'Tarih', dataIndex: 'date', width: 160, render: (d) => <span className="font-medium text-gray-600"><CalendarOutlined className="mr-2 text-blue-500"/>{dayjs(d).format('DD MMMM YYYY')}</span> },
        { title: 'Saat', key: 'time', width: 140, render: (r) => <Tag color="blue" className="rounded px-2"><ClockCircleOutlined className="mr-1"/>{r.start.slice(0,5)} - {r.end.slice(0,5)}</Tag> },
        { title: 'Durum', dataIndex: 'status', width: 140, render: (s) => <Tag color={getStatusColor(s)} className="rounded-full px-3 border-0 font-medium">{getStatusText(s)}</Tag> },
        {
            title: 'İşlemler', key: 'actions', fixed: 'right', width: 160, align: 'right',
            render: (r) => (
                <Space size="small">
                    <Tooltip title="Detay"><Button shape="circle" icon={<EyeOutlined />} onClick={() => { setSelectedAppointment(r); setIsModalVisible(true); }} className="text-blue-500 bg-blue-50 border-blue-100" /></Tooltip>
                    
                    {r.status === 'pending' && (
                        <>
                            <Tooltip title="Onayla"><Button shape="circle" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleUpdateStatus(r.id, 'booked')} loading={actionLoading && completingAppointmentId === r.id} className="bg-green-500" /></Tooltip>
                            <Popconfirm title="Reddetmek istiyor musunuz?" onConfirm={() => handleCancel(r.id)} okText="Evet" cancelText="Hayır"><Button shape="circle" danger icon={<CloseCircleOutlined />} className="bg-red-50" /></Popconfirm>
                        </>
                    )}
                    
                    {(r.status === 'booked' || r.status === 'confirmed') && (
                        <>
                            <Tooltip title="Muayeneyi Tamamla"><Button shape="circle" type="primary" icon={<CheckCircleOutlined />} onClick={() => openCompletionModal(r)} className="bg-green-600" /></Tooltip>
                            <Popconfirm title="İptal etmek istiyor musunuz?" onConfirm={() => handleCancel(r.id)} okText="Evet" cancelText="Hayır"><Button shape="circle" danger icon={<StopOutlined />} className="bg-red-50" /></Popconfirm>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const tabItems = [
        { key: 'upcoming', label: 'Yaklaşan' },
        { key: 'today', label: 'Bugün' },
        { key: 'completed', label: 'Tamamlanan' },
        { key: 'all', label: 'Tümü' }
    ];

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div><Title level={2} className="!mb-1">Randevu Yönetimi</Title><Text type="secondary">Toplam {appointments.length} kayıt içerisinden yönetiliyor</Text></div>
            </div>
            
            {/* İstatistik Kartları */}
            <Row gutter={[20, 20]} className="mb-8">
                <Col xs={24} sm={8}><Card bordered={false} className="rounded-2xl shadow-sm bg-blue-50"><Statistic title="Bugünkü Randevular" value={appointments.filter(a => dayjs(a.date).isSame(dayjs(), 'day')).length} prefix={<CalendarOutlined className="text-blue-500"/>} valueStyle={{ color: '#2563eb', fontWeight: 'bold' }} /></Card></Col>
                <Col xs={24} sm={8}><Card bordered={false} className="rounded-2xl shadow-sm bg-green-50"><Statistic title="Tamamlanan" value={appointments.filter(a => a.status === 'completed').length} prefix={<CheckCircleOutlined className="text-green-500"/>} valueStyle={{ color: '#16a34a', fontWeight: 'bold' }} /></Card></Col>
            </Row>

            <Card bordered={false} className="shadow-lg rounded-2xl overflow-hidden border-0">
                <div className="p-4 border-b border-gray-100 bg-gray-50/30">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="mb-4" type="card" />
                    <Input 
                        placeholder="Hasta adı ile ara..." 
                        prefix={<SearchOutlined className="text-gray-400" />} 
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="max-w-md rounded-lg py-2"
                        allowClear
                    />
                </div>
                
                <Table 
                    columns={columns} 
                    dataSource={filteredList} 
                    rowKey="id" 
                    loading={loading} 
                    pagination={{ pageSize: 8 }} 
                    scroll={{ x: 800 }} 
                    locale={{ emptyText: <div className="py-8 text-gray-400">Bu kategoride randevu bulunmuyor.</div> }}
                />
            </Card>

            {/* Tamamlama Modalı */}
            <Modal title="Randevu Tamamla & Raporla" open={isCompleteModalVisible} onCancel={() => setIsCompleteModalVisible(false)} footer={null} centered destroyOnClose>
                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700">
                    Muayene tamamlandı olarak işaretlenecek ve hasta geçmişine eklenecektir.
                </div>
                <Form form={completionForm} layout="vertical" onFinish={handleCompleteSubmit}>
                    <Form.Item name="diagnosis" label="Teşhis" rules={[{ required: true, message: 'Teşhis girmek zorunludur' }]}><Input placeholder="Örn: Akut Farenjit" className="rounded-lg" /></Form.Item>
                    <Form.Item name="treatment" label="Uygulanan Tedavi / Reçete" rules={[{ required: true, message: 'Tedavi bilgisi zorunludur' }]}><Input.TextArea rows={3} placeholder="İlaçlar ve öneriler..." className="rounded-lg" /></Form.Item>
                    <Form.Item name="notes" label="Doktor Notu (Opsiyonel)"><Input.TextArea rows={2} className="rounded-lg" /></Form.Item>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsCompleteModalVisible(false)} className="rounded-lg">Vazgeç</Button>
                        <Button type="primary" htmlType="submit" loading={actionLoading} className="rounded-lg">Raporu Kaydet</Button>
                    </div>
                </Form>
            </Modal>

            {/* Detay Modalı */}
            <Modal title="Randevu Detayı" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} centered>
                {selectedAppointment && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <Avatar size={64} src={selectedAppointment.patient?.avatar} icon={<UserOutlined />} className="bg-orange-100 text-orange-600"/>
                            <div>
                                <h3 className="font-bold text-lg m-0">{selectedAppointment.patient?.name}</h3>
                                <p className="m-0 text-gray-500">{selectedAppointment.patient?.email}</p>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-100 space-y-2">
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Tarih</span><span className="font-medium">{dayjs(selectedAppointment.date).format('DD MMMM YYYY')}</span></div>
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Saat</span><span className="font-medium text-blue-600">{selectedAppointment.start} - {selectedAppointment.end}</span></div>
                            <div className="flex flex-col gap-1 pt-1"><span className="text-gray-500">Hasta Notu</span><div className="bg-gray-50 p-2 rounded text-sm text-gray-700">{selectedAppointment.notes || 'Not yok'}</div></div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DoctorAppointments;