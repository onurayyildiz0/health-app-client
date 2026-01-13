import { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Statistic, Empty, Avatar, message, Modal, DatePicker, Input, Form, Tag, Spin } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, TeamOutlined, UserOutlined, RestOutlined, RightOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';


import { selectUser } from '../store/slices/authSlice';
import { 
    fetchDoctorAppointments, 
    updateAppointmentStatus, 
    completeAppointment,
    selectAllAppointments, 
    selectAppointmentLoading 
} from '../store/slices/appointmentSlice';
import { addUnavailableDate, selectDoctorLoading } from '../store/slices/doctorSlice';

const { Title, Text } = Typography;

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    
    
    const appointments = useSelector(selectAllAppointments);
    const appLoading = useSelector(selectAppointmentLoading);
    const docLoading = useSelector(selectDoctorLoading);

    
    const [isTimeOffModalVisible, setIsTimeOffModalVisible] = useState(false);
    const [timeOffForm] = Form.useForm();
    const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
    const [completionForm] = Form.useForm();
    const [completingAppointmentId, setCompletingAppointmentId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false); 

    const todayStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    
    useEffect(() => {
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    
    const handleCancelAppointment = async (appointmentId) => {
        try {
            await dispatch(updateAppointmentStatus({ id: appointmentId, status: 'cancelled' }));
            message.success('Randevu iptal edildi.');
            dispatch(fetchDoctorAppointments());
        } catch (error) {
            message.error('İptal işlemi başarısız.');
        }
    };

    
    const openCompletionModal = (appointmentId) => {
        setCompletingAppointmentId(appointmentId);
        setIsCompleteModalVisible(true);
    };

    const handleCompleteSubmit = async (values) => {
        setActionLoading(true);
        try {
            
            await dispatch(completeAppointment(completingAppointmentId, values));
            
            message.success('Randevu başarıyla tamamlandı ve rapor oluşturuldu.');
            setIsCompleteModalVisible(false);
            completionForm.resetFields();
            
            
            dispatch(fetchDoctorAppointments()); 
        } catch (err) {
            
            message.error(err.response?.data?.message || err.message || 'İşlem başarısız');
        } finally {
            setActionLoading(false);
        }
    };

    
    const handleAddTimeOff = async (values) => {
        try {
            await dispatch(addUnavailableDate({
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                reason: values.reason
            }));
            message.success('İzin dönemi eklendi.');
            setIsTimeOffModalVisible(false);
            timeOffForm.resetFields();
        } catch (error) {
            
        }
    };

    const todayAppointments = appointments.filter(apt => dayjs(apt.date).isSame(dayjs(), 'day'));

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Title level={2} className='!mb-1 !text-2xl md:!text-3xl text-gray-800'>Hoş Geldiniz, Dr. {user?.name} 👋</Title>
                    <Text type="secondary" className='text-base'>Bugün {todayStr} • İyi çalışmalar dileriz.</Text>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button size="large" icon={<RestOutlined />} onClick={() => setIsTimeOffModalVisible(true)} className="flex-1 md:flex-none shadow-sm">İzin Ekle</Button>
                    <Button type="primary" size="large" icon={<ClockCircleOutlined />} onClick={() => navigate('/dashboard/doctor/schedule')} className="flex-1 md:flex-none shadow-md bg-blue-600">Saatleri Düzenle</Button>
                </div>
            </div>

            {/* İstatistikler */}
            <Row gutter={[20, 20]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic title="Bugünkü Randevular" value={todayAppointments.length} prefix={<CalendarOutlined className="text-blue-500 bg-blue-50 p-2.5 rounded-lg mr-2" />} valueStyle={{ fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic title="Tamamlanan" value={todayAppointments.filter(a => a.status === 'completed').length} prefix={<CheckCircleOutlined className="text-green-500 bg-green-50 p-2.5 rounded-lg mr-2" />} valueStyle={{ fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic title="Bekleyen" value={todayAppointments.filter(a => a.status === 'booked').length} prefix={<ClockCircleOutlined className="text-orange-500 bg-orange-50 p-2.5 rounded-lg mr-2" />} valueStyle={{ fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic title="Toplam Hasta" value={appointments.length} prefix={<TeamOutlined className="text-purple-500 bg-purple-50 p-2.5 rounded-lg mr-2" />} valueStyle={{ fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            {/* Liste */}
            <Card bordered={false} className="shadow-md rounded-xl" title={<div className="flex items-center gap-2 text-lg font-semibold text-gray-800"><CalendarOutlined className="text-blue-600" /><span>Bugünkü Randevularım</span><Tag color="blue" className="ml-2 rounded-full px-3 border-0 bg-blue-50 text-blue-600">{todayAppointments.length}</Tag></div>} extra={<Button type="text" className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => navigate('/dashboard/doctor/appointments')}>Tümünü Gör <RightOutlined className="text-xs" /></Button>}>
                {appLoading ? <div className="text-center py-12"><Spin /></div> : todayAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {todayAppointments.map((appointment) => (
                            <Card key={appointment.id} bordered={false} className="bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl" bodyStyle={{ padding: '20px' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4 items-center">
                                        <Avatar size={54} icon={<UserOutlined />} src={appointment.patient?.avatar} className="border-2 border-white shadow-sm" />
                                        <div><div className="font-bold text-gray-800 text-base mb-0.5">{appointment.patient?.name}</div><div className="text-sm text-gray-500 flex items-center gap-1"><ClockCircleOutlined className="text-blue-500" />{appointment.start.slice(0, 5)} - {appointment.end.slice(0, 5)}</div></div>
                                    </div>
                                    <Tag color={appointment.status === 'completed' ? 'success' : appointment.status === 'cancelled' ? 'error' : 'processing'} className="m-0 rounded-full px-3 border-0">{appointment.status === 'booked' ? 'Aktif' : appointment.status}</Tag>
                                </div>
                                {appointment.notes && <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 mb-4"><span className="font-medium text-gray-900">Not:</span> {appointment.notes}</div>}
                                
                                {appointment.status === 'booked' && (
                                    <div className="flex gap-3 mt-auto pt-2 border-t border-gray-100">
                                        
                                        <Button type="primary" className="flex-1 bg-green-500 hover:bg-green-600 border-0 shadow-sm" icon={<CheckCircleOutlined />} onClick={() => openCompletionModal(appointment.id)}>Tamamla</Button>
                                        <Button danger className="flex-1" icon={<CloseCircleOutlined />} onClick={() => handleCancelAppointment(appointment.id)}>İptal</Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bugün için randevu yok." className="py-12"><Button type="primary" onClick={() => navigate('/dashboard/doctor/schedule')}>Çalışma Saatlerini Kontrol Et</Button></Empty>}
            </Card>

            
            <Modal 
                title="Randevu Tamamla & Raporla" 
                open={isCompleteModalVisible} 
                onCancel={() => setIsCompleteModalVisible(false)} 
                footer={null} 
                centered 
                destroyOnClose
            >
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

            {/* İzin Modalı */}
            <Modal title="İzin Dönemi Ekle" open={isTimeOffModalVisible} onCancel={() => setIsTimeOffModalVisible(false)} footer={null} centered>
                <Form form={timeOffForm} layout="vertical" onFinish={handleAddTimeOff}>
                    <Form.Item name="dateRange" label="Tarih Aralığı" rules={[{ required: true, message: 'Lütfen tarih seçin' }]}><DatePicker.RangePicker className="w-full" size="large" disabledDate={(current) => current && current < dayjs().endOf('day')} /></Form.Item>
                    <Form.Item name="reason" label="Sebep"><Input.TextArea rows={3} placeholder="Yıllık izin, konferans, hastalık vb." /></Form.Item>
                    <div className="flex justify-end gap-2 mt-6"><Button onClick={() => setIsTimeOffModalVisible(false)} size="large">İptal</Button><Button type="primary" htmlType="submit" loading={docLoading} size="large">Kaydet</Button></div>
                </Form>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;