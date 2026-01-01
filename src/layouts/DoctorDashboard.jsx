import { useEffect, useState } from 'react';
import { 
    Card, 
    Row, 
    Col, 
    Typography, 
    Button, 
    Statistic, 
    Empty, 
    Avatar, 
    message, 
    Modal, 
    DatePicker, 
    Input, 
    Form,
    Tag
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TeamOutlined,
    UserOutlined,
    RestOutlined,
    RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import {
    selectAllAppointments,
    selectAppointmentLoading,
    fetchAppointmentsStart,
    fetchAppointmentsSuccess,
    fetchAppointmentsFailure
} from '../store/slices/appointmentSlice';
import axiosInstance from '../api/axios';
import * as appointmentService from '../api/appointmentService';
import * as doctorService from '../api/doctorService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);

    // Modal State'leri
    const [isTimeOffModalVisible, setIsTimeOffModalVisible] = useState(false);
    const [timeOffLoading, setTimeOffLoading] = useState(false);
    const [timeOffForm] = Form.useForm();

    // Randevu Durumu Güncelleme
    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, status);
            const statusText = status === 'completed' ? 'tamamlandı' : 'iptal edildi';
            message.success(`Randevu ${statusText}`);
            const response = await axiosInstance.get('/appointments/doctor');
            dispatch(fetchAppointmentsSuccess(response.data.data || response.data || []));
        } catch {
            message.error('Randevu durumu güncellenirken hata oluştu');
        }
    };

    // İzin Ekleme
    const handleAddTimeOff = async (values) => {
        try {
            setTimeOffLoading(true);
            await doctorService.addUnavailableDate({
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                reason: values.reason
            });
            message.success('İzin dönemi başarıyla eklendi');
            setIsTimeOffModalVisible(false);
            timeOffForm.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'İzin eklenirken hata oluştu');
        } finally {
            setTimeOffLoading(false);
        }
    };

    const today = new Date().toLocaleDateString('tr-TR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                dispatch(fetchAppointmentsStart());
                const response = await axiosInstance.get('/appointments/doctor', {
                    validateStatus: (status) => status < 500
                });

                if (response.status === 404) {
                    try {
                        await axiosInstance.post('/doctors', {
                            user: user.id,
                            speciality: 'Genel Pratisyen',
                            clocks: {}
                        });
                        const retryResponse = await axiosInstance.get('/appointments/doctor');
                        dispatch(fetchAppointmentsSuccess(retryResponse.data.data || []));
                    } catch {
                        dispatch(fetchAppointmentsSuccess([]));
                    }
                } else {
                    dispatch(fetchAppointmentsSuccess(response.data.data || []));
                }
            } catch (err) {
                dispatch(fetchAppointmentsFailure(err.message));
            }
        };
        fetchAppointments();
        // eslint-disable-next-line
    }, []);

    const todayAppointments = appointments.filter(apt =>
        dayjs(apt.date).isSame(dayjs(), 'day')
    );

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Title level={2} className='!mb-1 !text-2xl md:!text-3xl text-gray-800'>
                        Hoş Geldiniz, Dr. {user?.name} 👋
                    </Title>
                    <Text type="secondary" className='text-base'>
                        {today} • İyi çalışmalar dileriz.
                    </Text>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                        size="large"
                        icon={<RestOutlined />} 
                        onClick={() => setIsTimeOffModalVisible(true)}
                        className="flex-1 md:flex-none shadow-sm"
                    >
                        İzin Ekle
                    </Button>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<ClockCircleOutlined />} 
                        onClick={() => navigate('/dashboard/doctor/schedule')}
                        className="flex-1 md:flex-none shadow-md bg-blue-600"
                    >
                        Saatleri Düzenle
                    </Button>
                </div>
            </div>

            {/* İstatistikler */}
            <Row gutter={[20, 20]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic
                            title="Bugünkü Randevular"
                            value={todayAppointments.length}
                            prefix={<CalendarOutlined className="text-blue-500 bg-blue-50 p-2.5 rounded-lg mr-2" />}
                            valueStyle={{ fontWeight: 700, color: '#1f2937' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic
                            title="Tamamlanan"
                            value={todayAppointments.filter(a => a.status === 'completed').length}
                            prefix={<CheckCircleOutlined className="text-green-500 bg-green-50 p-2.5 rounded-lg mr-2" />}
                            valueStyle={{ fontWeight: 700, color: '#1f2937' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic
                            title="Bekleyen"
                            value={todayAppointments.filter(a => a.status === 'pending').length}
                            prefix={<ClockCircleOutlined className="text-orange-500 bg-orange-50 p-2.5 rounded-lg mr-2" />}
                            valueStyle={{ fontWeight: 700, color: '#1f2937' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic
                            title="Toplam Hasta"
                            value={appointments.length}
                            prefix={<TeamOutlined className="text-purple-500 bg-purple-50 p-2.5 rounded-lg mr-2" />}
                            valueStyle={{ fontWeight: 700, color: '#1f2937' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bugünkü Randevular Listesi */}
            <Card
                bordered={false}
                className="shadow-md rounded-xl"
                title={
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <CalendarOutlined className="text-blue-600" />
                        <span>Bugünkü Randevularım</span>
                        <Tag color="blue" className="ml-2 rounded-full px-3 border-0 bg-blue-50 text-blue-600">
                            {todayAppointments.length}
                        </Tag>
                    </div>
                }
                extra={
                    <Button type="text" className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => navigate('/dashboard/doctor/appointments')}>
                        Tümünü Gör <RightOutlined className="text-xs" />
                    </Button>
                }
            >
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
                ) : todayAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {todayAppointments.map((appointment) => (
                            <Card
                                key={appointment.id}
                                bordered={false}
                                className="bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl"
                                bodyStyle={{ padding: '20px' }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4 items-center">
                                        <Avatar 
                                            size={54} 
                                            icon={<UserOutlined />} 
                                            src={appointment.patient?.avatar}
                                            className="border-2 border-white shadow-sm"
                                        />
                                        <div>
                                            <div className="font-bold text-gray-800 text-base mb-0.5">{appointment.patient?.name}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <ClockCircleOutlined className="text-blue-500" />
                                                {appointment.start.slice(0, 5)} - {appointment.end.slice(0, 5)}
                                            </div>
                                        </div>
                                    </div>
                                    <Tag 
                                        color={
                                            appointment.status === 'completed' ? 'success' :
                                            appointment.status === 'cancelled' ? 'error' :
                                            'processing'
                                        } 
                                        className="m-0 rounded-full px-3 border-0"
                                    >
                                        {appointment.status === 'booked' ? 'Aktif' : appointment.status}
                                    </Tag>
                                </div>
                                
                                {appointment.notes && (
                                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 mb-4">
                                        <span className="font-medium text-gray-900">Not:</span> {appointment.notes}
                                    </div>
                                )}

                                {appointment.status === 'booked' && (
                                    <div className="flex gap-3 mt-auto pt-2 border-t border-gray-100">
                                        <Button 
                                            type="primary" 
                                            className="flex-1 bg-green-500 hover:bg-green-600 border-0 shadow-sm"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                        >
                                            Tamamla
                                        </Button>
                                        <Button 
                                            danger 
                                            className="flex-1"
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                        >
                                            İptal
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Bugün için planlanmış randevunuz bulunmamaktadır."
                        className="py-12"
                    >
                        <Button type="primary" onClick={() => navigate('/dashboard/doctor/schedule')}>
                            Çalışma Saatlerini Kontrol Et
                        </Button>
                    </Empty>
                )}
            </Card>

            {/* İzin Ekleme Modalı */}
            <Modal
                title="İzin Dönemi Ekle"
                open={isTimeOffModalVisible}
                onCancel={() => setIsTimeOffModalVisible(false)}
                footer={null}
                centered
            >
                <Form form={timeOffForm} layout="vertical" onFinish={handleAddTimeOff}>
                    <Form.Item 
                        name="dateRange" 
                        label="Tarih Aralığı" 
                        rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
                    >
                        <DatePicker.RangePicker className="w-full" size="large" disabledDate={(current) => current && current < dayjs().endOf('day')} />
                    </Form.Item>
                    <Form.Item name="reason" label="Sebep">
                        <Input.TextArea rows={3} placeholder="Yıllık izin, konferans, hastalık vb." />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setIsTimeOffModalVisible(false)} size="large">İptal</Button>
                        <Button type="primary" htmlType="submit" loading={timeOffLoading} size="large">Kaydet</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;