import { useState, useEffect, useMemo } from 'react';
import { Card, Table, Tag, Button, Space, message, Modal, Empty, Avatar, Typography, Tooltip, Tabs, Input, DatePicker, Row, Col } from 'antd';
import {
    CalendarOutlined, ClockCircleOutlined, EyeOutlined, CloseCircleOutlined,
    PlusOutlined, UserOutlined, CheckCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';


import { fetchMyAppointments, cancelExistingAppointment, selectAllAppointments, selectAppointmentLoading } from '../../store/slices/appointmentSlice';
import { fetchAllSpecialities, selectAllSpecialities } from '../../store/slices/specialitySlice';

dayjs.locale('tr');
const { Text, Title } = Typography;

const MyAppointments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);
    const specialities = useSelector(selectAllSpecialities);

    
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    
    
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchText, setSearchText] = useState('');
    const [searchDate, setSearchDate] = useState(null);

    
    useEffect(() => {
        dispatch(fetchMyAppointments());
        dispatch(fetchAllSpecialities());
    }, [dispatch]);

    const getSpecialityName = (doctor) => {
        if (!doctor) return '';
        if (doctor.specialityNavigation?.name) return doctor.specialityNavigation.name;
        if (specialities.length > 0) {
            const found = specialities.find(s => s.id == doctor.speciality);
            if (found) return found.name;
        }
        return doctor.speciality;
    };

    
    const filteredAppointments = useMemo(() => {
        let list = [...appointments];
        const today = dayjs().startOf('day');

        
        if (activeTab === 'upcoming') {
            list = list.filter(a => (dayjs(a.date).isSame(today) || dayjs(a.date).isAfter(today)) && a.status !== 'cancelled' && a.status !== 'completed');
        } else if (activeTab === 'completed') {
            list = list.filter(a => a.status === 'completed' || (dayjs(a.date).isBefore(today) && a.status !== 'cancelled'));
        } else if (activeTab === 'cancelled') {
            list = list.filter(a => a.status === 'cancelled');
        }

        
        if (searchText) {
            const lowerText = searchText.toLowerCase();
            list = list.filter(a => 
                a.doctor?.user?.name?.toLowerCase().includes(lowerText) ||
                getSpecialityName(a.doctor)?.toLowerCase().includes(lowerText)
            );
        }

        
        if (searchDate) {
            list = list.filter(a => dayjs(a.date).isSame(searchDate, 'day'));
        }

        
        return list.sort((a, b) => {
            return activeTab === 'upcoming' 
                ? dayjs(a.date).unix() - dayjs(b.date).unix()
                : dayjs(b.date).unix() - dayjs(a.date).unix();
        });
    }, [appointments, activeTab, searchText, searchDate, specialities]);

    const handleCancel = (id) => {
        Modal.confirm({
            title: 'Randevu İptali',
            content: 'Bu randevuyu iptal etmek istediğinize emin misiniz?',
            okText: 'Evet, İptal Et',
            okType: 'danger',
            cancelText: 'Vazgeç',
            centered: true,
            onOk: async () => {
                setCancelling(true);
                try {
                    await dispatch(cancelExistingAppointment(id));
                    message.success('Randevu iptal edildi');
                    dispatch(fetchMyAppointments());
                } catch (err) {
                    message.error('İptal işlemi başarısız');
                } finally {
                    setCancelling(false);
                }
            }
        });
    };

    const statusConfig = {
        booked: { color: 'blue', text: 'Rezerve' },
        pending: { color: 'orange', text: 'Beklemede' },
        cancelled: { color: 'red', text: 'İptal' },
        completed: { color: 'green', text: 'Tamamlandı' }
    };

    const columns = [
        {
            title: 'Doktor',
            dataIndex: 'doctor',
            key: 'doctor',
            render: (doctor) => (
                <div className="flex items-center gap-3">
                    <Avatar src={doctor?.user?.avatar} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                    <div>
                        <div className="font-medium text-gray-800">Dr. {doctor?.user?.name}</div>
                        <div className="text-xs text-gray-500">{getSpecialityName(doctor)}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Tarih & Saat',
            key: 'datetime',
            render: (record) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-700">
                        <CalendarOutlined className="text-blue-500" />
                        <span>{dayjs(record.date).format('DD MMMM YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <ClockCircleOutlined />
                        <span>{record.start.slice(0, 5)} - {record.end.slice(0, 5)}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const conf = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={conf.color} className="rounded-full px-3 font-medium border-0">{conf.text}</Tag>;
            }
        },
        {
            title: 'İşlemler',
            key: 'actions',
            align: 'right',
            render: (record) => (
                <Space>
                    <Tooltip title="Detaylar">
                        <Button shape="circle" icon={<EyeOutlined />} onClick={() => { setSelectedAppointment(record); setIsModalVisible(true); }} className="text-blue-500 border-blue-100 bg-blue-50 hover:bg-blue-100" />
                    </Tooltip>
                    {(record.status === 'booked' || record.status === 'pending') && (
                        <Tooltip title="İptal Et">
                            <Button shape="circle" danger icon={<CloseCircleOutlined />} onClick={() => handleCancel(record.id)} loading={cancelling} className="bg-red-50 border-red-100 hover:bg-red-100" />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    const tabItems = [
        { key: 'upcoming', label: <span className="flex items-center gap-2"><ClockCircleOutlined /> Yaklaşan</span> },
        { key: 'completed', label: <span className="flex items-center gap-2"><CheckCircleOutlined /> Geçmiş / Tamamlanan</span> },
        { key: 'cancelled', label: <span className="flex items-center gap-2"><CloseCircleOutlined /> İptal Edilen</span> },
        { key: 'all', label: 'Tümü' }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-10 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 mt-4">
                <div>
                    <Title level={2} className="!mb-1 !text-gray-800">Randevularım</Title>
                    <Text type="secondary">Geçmiş ve gelecek tüm randevularınızı yönetin</Text>
                </div>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('../create-appointment')} className="rounded-xl shadow-blue-200 shadow-md">
                    Yeni Randevu
                </Button>
            </div>

            <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                {/* Filtre Alanı */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/30">
                    <Tabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab} 
                        items={tabItems} 
                        className="mb-4"
                        type="card"
                    />
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={16}>
                            <Input 
                                placeholder="Doktor adı veya branş ara..." 
                                prefix={<SearchOutlined className="text-gray-400" />} 
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="rounded-lg py-2"
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <DatePicker 
                                placeholder="Tarihe Göre Filtrele" 
                                className="w-full rounded-lg py-2"
                                format="DD.MM.YYYY"
                                onChange={(date) => setSearchDate(date)}
                                allowClear
                            />
                        </Col>
                    </Row>
                </div>

                {/* Masaüstü Tablo */}
                <div className="hidden md:block">
                    <Table 
                        columns={columns} 
                        dataSource={filteredAppointments} 
                        rowKey="id" 
                        loading={loading} 
                        pagination={{ pageSize: 8 }} 
                        locale={{ emptyText: <Empty description="Bu filtreye uygun randevu bulunamadı." /> }} 
                    />
                </div>

                {/* Mobil Kart Görünümü */}
                <div className="md:hidden space-y-4 p-4 bg-gray-50 min-h-[300px]">
                    {loading ? <div className="text-center py-8">Yükleniyor...</div> : (
                        filteredAppointments.length > 0 ? filteredAppointments.map(app => (
                            <Card key={app.id} className="border border-gray-100 shadow-sm rounded-xl">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={app.doctor?.user?.avatar} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                                        <div>
                                            <div className="font-bold text-gray-800">Dr. {app.doctor?.user?.name}</div>
                                            <div className="text-xs text-gray-500">{getSpecialityName(app.doctor)}</div>
                                        </div>
                                    </div>
                                    <Tag color={statusConfig[app.status]?.color}>{statusConfig[app.status]?.text}</Tag>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div className="flex items-center gap-2 text-gray-600"><CalendarOutlined className="text-blue-500" />{dayjs(app.date).format('DD/MM/YYYY')}</div>
                                    <div className="flex items-center gap-2 text-gray-600"><ClockCircleOutlined className="text-orange-500" />{app.start.slice(0, 5)} - {app.end.slice(0, 5)}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button block icon={<EyeOutlined />} onClick={() => { setSelectedAppointment(app); setIsModalVisible(true); }}>Detay</Button>
                                    {(app.status === 'booked' || app.status === 'pending') && 
                                        <Button block danger icon={<CloseCircleOutlined />} onClick={() => handleCancel(app.id)}>İptal</Button>
                                    }
                                </div>
                            </Card>
                        )) : <Empty description="Randevu yok" />
                    )}
                </div>
            </Card>

            {/* Modal Bileşeni (Değişmedi, aynı kalabilir) */}
            <Modal title="Randevu Detayı" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={[<Button key="close" onClick={() => setIsModalVisible(false)}>Kapat</Button>]} centered>
                {selectedAppointment && (
                    <div className="flex flex-col gap-4 pt-2">
                         <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <Avatar size={64} src={selectedAppointment.doctor?.user?.avatar} icon={<UserOutlined />} />
                            <div>
                                <h3 className="font-bold text-lg m-0">Dr. {selectedAppointment.doctor?.user?.name}</h3>
                                <p className="text-gray-700 m-0">{selectedAppointment.doctor?.fullLocation || selectedAppointment.doctor?.location}</p>
                                <p className="text-blue-600 m-0">{getSpecialityName(selectedAppointment.doctor)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border rounded-lg"><span className="text-gray-400 text-xs block uppercase">Tarih</span><span className="font-medium">{dayjs(selectedAppointment.date).format('DD.MM.YYYY')}</span></div>
                            <div className="p-3 border rounded-lg"><span className="text-gray-400 text-xs block uppercase">Saat</span><span className="font-medium">{selectedAppointment.start.slice(0, 5)} - {selectedAppointment.end.slice(0, 5)}</span></div>
                        </div>
                        {selectedAppointment.notes && <div className="p-3 border rounded-lg bg-gray-50"><span className="text-gray-400 text-xs block uppercase mb-1">Randevu Notunuz</span><p className="text-sm text-gray-700 m-0">{selectedAppointment.notes}</p></div>}
                        {selectedAppointment.status === 'completed' && selectedAppointment.healthHistory && (
                            <div className="bg-white border-l-4 border-green-500 shadow-sm p-4 rounded-r-lg mt-2">
                                <h4 className="text-green-700 font-bold mb-3 flex items-center gap-2"><CheckCircleOutlined /> Muayene Raporu</h4>
                                <div className="grid gap-3">
                                    <div className="bg-green-50/50 p-2 rounded"><span className="text-xs font-bold text-green-600 uppercase block mb-1">Teşhis</span><span className="text-gray-800 font-medium">{selectedAppointment.healthHistory.diagnosis}</span></div>
                                    <div className="bg-green-50/50 p-2 rounded"><span className="text-xs font-bold text-green-600 uppercase block mb-1">Tedavi</span><span className="text-gray-800">{selectedAppointment.healthHistory.treatment}</span></div>
                                    {selectedAppointment.healthHistory.notes && <div className="bg-green-50/50 p-2 rounded"><span className="text-xs font-bold text-green-600 uppercase block mb-1">Doktor Notu</span><span className="text-gray-700 italic">{selectedAppointment.healthHistory.notes}</span></div>}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyAppointments;