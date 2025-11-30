import { useEffect } from 'react';

import { Card, Row, Col, Typography, Button, Statistic, Empty, Avatar, message } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
    UserOutlined
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
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);

    // Randevu durumunu güncelle
    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, status);
            const statusText = status === 'completed' ? 'tamamlandı' : 'iptal edildi';
            message.success(`Randevu ${statusText}`);

            // Randevuları yeniden yükle
            const response = await axiosInstance.get('/appointments/doctor');
            dispatch(fetchAppointmentsSuccess(response.data.data || response.data || []));
        } catch {
            message.error('Randevu durumu güncellenirken hata oluştu');
        }
    };

    // Bugünün tarihi
    const today = new Date().toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Randevuları çek
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                dispatch(fetchAppointmentsStart());
                const response = await axiosInstance.get('/appointments/doctor', {
                    validateStatus: (status) => {
                        // 404'ü de success olarak kabul et (doktor henüz kayıtlı değil)
                        return status >= 200 && status < 300 || status === 404;
                    }
                });

                // 404 durumunda Doctor kaydı oluştur
                if (response.status === 404) {
                    try {
                        // Doctor kaydı oluştur
                        await axiosInstance.post('/doctors', {
                            user: user._id, // User ID (backend validation için)
                            speciality: 'Genel Pratisyen', // Varsayılan
                            clocks: {} // Boş obje (backend validation için)
                        });
                        // Tekrar randevuları çek
                        const retryResponse = await axiosInstance.get('/appointments/doctor');
                        dispatch(fetchAppointmentsSuccess(retryResponse.data.data || retryResponse.data || []));
                    } catch {
                        // Doctor kaydı oluşturulamazsa boş array
                        dispatch(fetchAppointmentsSuccess([]));
                    }
                } else {
                    dispatch(fetchAppointmentsSuccess(response.data.data || response.data || []));
                }
            } catch (err) {
                dispatch(fetchAppointmentsFailure(err.message));
            }
        };

        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Bugünkü randevular
    const todayAppointments = appointments.filter(apt =>
        dayjs(apt.date).isSame(dayjs(), 'day')
    );

    return (
        <div className="min-h-screen">
            {/* Hoş Geldin Bölümü */}
            <div className='mb-4 md:mb-6'>
                <Title level={2} className='!mb-2 !text-xl md:!text-2xl lg:!text-3xl'>
                    Hoş Geldiniz Dr. {user?.name}! 👨‍⚕️
                </Title>
                <Text type="secondary" className='text-sm md:text-base lg:text-lg'>
                    {today}
                </Text>
            </div>
            {/* İstatistikler */}
            <Row gutter={[12, 12]} className='mb-4 md:mb-6'>
                <Col xs={12} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Bugünkü Randevular"
                            value={todayAppointments.length}
                            prefix={<CalendarOutlined className='text-blue-500' />}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Tamamlanan"
                            value={todayAppointments.filter(a => a.status === 'completed').length}
                            prefix={<CheckCircleOutlined className='text-green-500' />}
                            valueStyle={{ color: '#10b981' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Bekleyen"
                            value={todayAppointments.filter(a => a.status === 'pending').length}
                            prefix={<ClockCircleOutlined className='text-orange-500' />}
                            valueStyle={{ color: '#f97316' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Toplam Randevu"
                            value={appointments.length}
                            prefix={<TeamOutlined className='text-purple-500' />}
                            valueStyle={{ color: '#a855f7' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bugünkü Randevular */}
            <Card
                title={
                    <div className='flex items-center gap-2'>
                        <CalendarOutlined className='text-blue-500' />
                        <span className='text-sm md:text-base'>Bugünkü Randevularım</span>
                    </div>
                }
                className='shadow-md mb-4 md:mb-6'
                extra={
                    <Button
                        type="primary"
                        size="small"
                        className='md:!h-8'
                        onClick={() => navigate('/dashboard/doctor/appointments')}
                    >
                        <span className='hidden sm:inline'>Tüm Randevular</span>
                        <span className='sm:hidden'>Tümü</span>
                    </Button>
                }
            >
                {loading ? (
                    <div className='text-center py-8'>Yükleniyor...</div>
                ) : todayAppointments.length > 0 ? (
                    <div className='space-y-3'>
                        {todayAppointments.map((appointment) => (
                            <Card
                                key={appointment._id}
                                className='border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200'
                                size="small"
                            >
                                {/* Desktop View */}
                                <div className='hidden sm:flex sm:items-center sm:justify-between gap-3'>
                                    <div className='flex items-center gap-4 flex-1 min-w-0'>
                                        <Avatar
                                            size={48}
                                            icon={<UserOutlined />}
                                            src={appointment.patient?.avatar}
                                            className='flex-shrink-0'
                                        />
                                        <div className='flex flex-col items-center justify-center bg-blue-50 px-3 py-2 rounded-lg flex-shrink-0'>
                                            <Text type="secondary" className='text-xs'>Saat</Text>
                                            <Text strong className='text-lg'>{appointment.start}</Text>
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <Title level={5} className='!mb-0 truncate'>
                                                {appointment.patient?.name || 'Bilinmiyor'}
                                            </Title>
                                            <Text type="secondary" className='text-sm line-clamp-1'>
                                                {appointment.notes || 'Not yok'}
                                            </Text>
                                        </div>
                                    </div>
                                    <div className='flex gap-2 flex-shrink-0'>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                                        >
                                            Tamamlandı
                                        </Button>
                                        <Button
                                            danger
                                            size="small"
                                            onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                        >
                                            Gelmedi
                                        </Button>
                                    </div>
                                </div>

                                {/* Mobile View */}
                                <div className='sm:hidden space-y-3'>
                                    {/* Hasta Bilgisi */}
                                    <div className='flex items-center gap-3 pb-3 border-b'>
                                        <Avatar
                                            size={48}
                                            icon={<UserOutlined />}
                                            src={appointment.patient?.avatar}
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <div className='font-semibold text-sm truncate'>
                                                {appointment.patient?.name || 'Bilinmiyor'}
                                            </div>
                                            {appointment.notes && (
                                                <Text type="secondary" className='text-xs line-clamp-1'>
                                                    {appointment.notes}
                                                </Text>
                                            )}
                                        </div>
                                    </div>

                                    {/* Saat Bilgisi */}
                                    <div className='flex items-center justify-center bg-blue-50 px-3 py-2 rounded-lg'>
                                        <ClockCircleOutlined className='text-blue-500 mr-2' />
                                        <Text strong className='text-base'>{appointment.start}</Text>
                                    </div>

                                    {/* İşlem Butonları */}
                                    <div className='flex gap-2 pt-2 border-t'>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                                            block
                                        >
                                            Tamamlandı
                                        </Button>
                                        <Button
                                            danger
                                            size="small"
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                            block
                                        >
                                            Gelmedi
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Empty
                        description="Bugün randevunuz bulunmamaktadır"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>
        </div>
    );
};

export default DoctorDashboard;
