import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Table, Tag, Avatar, Statistic, Progress, Empty, Spin, Modal } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    PlusOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    StarFilled,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { fetchMyAppointments, selectAllAppointments, selectAppointmentLoading } from '../store/slices/appointmentSlice';
import { fetchFavoriteDoctors, selectFavoriteDoctors, selectUserLoading } from '../store/slices/userSlice';


const { Title, Text, Paragraph } = Typography;

const PatientDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const appointments = useSelector(selectAllAppointments);
    const favoriteDoctors = useSelector(selectFavoriteDoctors);
    const appointmentLoading = useSelector(selectAppointmentLoading);
    const userLoading = useSelector(selectUserLoading);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [stats, setStats] = useState({
        totalAppointments: 0,
        completedAppointments: 0,
        upcomingAppointments: 0,
        cancelledAppointments: 0
    });

    useEffect(() => {
        let isMounted = true;
        let favoritesLoaded = false;

        const loadData = async () => {
            try {
                // Sadece veriler boşsa yükle (cache kontrolü)
                if (isMounted && (!appointments || appointments.length === 0)) {
                    await dispatch(fetchMyAppointments()).catch(() => { });
                }

                // Favoriler için daha uzun bekleme süresi (rate limit için)
                setTimeout(() => {
                    if (isMounted && !favoritesLoaded) {
                        dispatch(fetchFavoriteDoctors()).catch(() => { });
                        favoritesLoaded = true;
                    }
                }, 2500);
            } catch {
                // Hata durumunda sessizce devam et
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (appointments?.length > 0) {
            // Yaklaşan randevular: bugünden itibaren 7 gün içindeki booked randevular
            const today = dayjs().startOf('day');
            const nextWeek = today.add(7, 'day');
            const upcomingAppointmentsCount = appointments.filter(app => {
                const appointmentDate = dayjs(app.date);
                return (appointmentDate.isAfter(today) || appointmentDate.isSame(today, 'day')) && appointmentDate.isBefore(nextWeek) && app.status === 'booked';
            }).length;
            setStats({
                totalAppointments: appointments.length,
                completedAppointments: appointments.filter(a => a.status === 'completed').length,
                upcomingAppointments: upcomingAppointmentsCount,
                cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length
            });
        }
    }, [appointments]);

    // Bugünün tarihi
    const today = new Date().toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Bugünkü randevular
    const todayAppointments = appointments?.filter(app => {
        const appointmentDate = dayjs(app.date).format('YYYY-MM-DD');
        const todayDate = dayjs().format('YYYY-MM-DD');
        return appointmentDate === todayDate && app.status === 'booked';
    }) || [];

    // Yaklaşan randevular (bugün dahil, gelecek 7 gün)
    const upcomingAppointments = appointments?.filter(app => {
        const appointmentDate = dayjs(app.date);
        const today = dayjs().startOf('day');
        const nextWeek = today.add(7, 'day');
        return (appointmentDate.isAfter(today) || appointmentDate.isSame(today, 'day')) && appointmentDate.isBefore(nextWeek) && app.status === 'booked';
    }).slice(0, 5) || [];

    // Tablo kolonları
    const columns = [
        {
            title: 'Doktor',
            dataIndex: 'doctor',
            key: 'doctor',
            render: (doctor) => <Text strong>Dr. {doctor?.user?.name || 'Bilinmiyor'}</Text>
        },
        {
            title: 'Branş',
            dataIndex: 'doctor',
            key: 'specialty',
            render: (doctor) => <Text type="secondary">{doctor?.speciality || '-'}</Text>
        },
        {
            title: 'Tarih',
            dataIndex: 'date',
            key: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Saat',
            key: 'time',
            render: (record) => (
                <Tag icon={<ClockCircleOutlined />} color="blue">
                    {record.start} 
                </Tag>
            )
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusMap = {
                    'booked': { color: 'blue', text: 'Rezerve Edildi' },
                    'cancelled': { color: 'red', text: 'İptal Edildi' },
                    'completed': { color: 'green', text: 'Tamamlandı' }
                };
                const statusInfo = statusMap[status] || { color: 'default', text: status };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            }
        },
        {
            title: 'İşlem',
            key: 'action',
            render: (record) => (
                <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedAppointment(record);
                        setIsModalVisible(true);
                    }}
                >
                    Detay
                </Button>
            )
        }
    ];

    // Durum renkleri
    const getStatusColor = (status) => {
        const statusMap = {
            'booked': 'blue',
            'cancelled': 'red',
            'completed': 'green'
        };
        return statusMap[status] || 'default';
    };

    // Durum metinleri
    const getStatusText = (status) => {
        const statusMap = {
            'booked': 'Rezerve Edildi',
            'cancelled': 'İptal Edildi',
            'completed': 'Tamamlandı'
        };
        return statusMap[status] || status;
    };

    return (
        <div className="min-h-screen">
            {/* Hoş Geldin Bölümü */}
            <div className='mb-6'>
                <Title level={2} className='!mb-2'>
                    Hoş Geldiniz! 👋
                </Title>
                <Text type="secondary" className='text-lg'>
                    {today}
                </Text>
            </div>

            {/* İstatistikler */}
            <Row gutter={[16, 16]} className='mb-6'>
                <Col xs={24} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Bugünkü Randevular"
                            value={todayAppointments.length}
                            prefix={<CalendarOutlined className='text-blue-500' />}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Yaklaşan Randevular"
                            value={stats.upcomingAppointments}
                            prefix={<ClockCircleOutlined className='text-orange-500' />}
                            valueStyle={{ color: '#f97316' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Tamamlanan"
                            value={stats.completedAppointments}
                            prefix={<CheckCircleOutlined className='text-green-500' />}
                            valueStyle={{ color: '#10b981' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Favori Doktorlar"
                            value={favoriteDoctors?.length || 0}
                            prefix={<HeartOutlined className='text-red-500' />}
                            valueStyle={{ color: '#ef4444' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Bugünkü Randevular */}
                <Col xs={24} lg={16} xl={18}>
                    <Card
                        title={
                            <div className='flex items-center gap-2'>
                                <CalendarOutlined className='text-blue-500' />
                                <span>Bugünkü Randevularım</span>
                            </div>
                        }
                        className='shadow-md'
                    >
                        {appointmentLoading ? (
                            <div className='text-center py-8'>
                                <Spin size="large" />
                            </div>
                        ) : todayAppointments.length > 0 ? (
                            <div className='space-y-4'>
                                {todayAppointments.map((appointment) => (
                                    <Card
                                        key={appointment._id}
                                        className='border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200'
                                    >
                                        <div className='flex items-center justify-between flex-wrap gap-4'>
                                            <div className='flex items-center gap-4'>
                                                <Avatar
                                                    size={64}
                                                    icon={<UserOutlined />}
                                                    src={appointment.doctor?.user?.avatar}
                                                    className='bg-blue-500'
                                                />
                                                <div>
                                                    <Title level={5} className='!mb-1'>
                                                        Dr. {appointment.doctor?.user?.name || 'Bilinmiyor'}
                                                    </Title>
                                                    <Text type="secondary">{appointment.doctor?.speciality || '-'}</Text>
                                                    <div className='mt-2'>
                                                        <Tag icon={<ClockCircleOutlined />} color="blue">
                                                            {appointment.start} - {appointment.end}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                description="Bugün randevunuz bulunmamaktadır"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate('create-appointment')}
                                >
                                    Randevu Oluştur
                                </Button>
                            </Empty>
                        )}
                    </Card>
                    <br />
                    {/* Yaklaşan Randevular Tablosu */}
                    <Card
                        title={
                            <div className='flex items-center gap-2'>
                                <ClockCircleOutlined className='text-orange-500' />
                                <span>Yaklaşan Randevular</span>
                            </div>
                        }
                        className='shadow-md mt-8'
                    >
                        <Table
                            columns={columns}
                            dataSource={upcomingAppointments}
                            rowKey="_id"
                            scroll={{ x: 700 }}
                            loading={appointmentLoading}
                            pagination={{
                                pageSize: 5,
                                responsive: true
                            }}
                            locale={{
                                emptyText: 'Yaklaşan randevunuz bulunmuyor'
                            }}
                        />
                    </Card>
                </Col>

                {/* Sağ Sidebar */}
                <Col xs={24} lg={8} xl={6}>


                    {/* Favori Doktorlar */}
                    <Card
                        title={
                            <div className='flex items-center gap-2'>
                                <StarFilled className='text-yellow-500' />
                                <span>Favori Doktorlarım</span>
                            </div>
                        }
                        className='shadow-md'
                        extra={
                            <Button size="small" type="link" onClick={() => navigate('/patient/favorites')}>
                                Tümü
                            </Button>
                        }
                    >
                        {userLoading ? (
                            <div className='text-center py-4'>
                                <Spin />
                            </div>
                        ) : favoriteDoctors?.length > 0 ? (
                            <div className='space-y-3'>
                                {favoriteDoctors
                                    .filter(doctor => doctor && doctor._id) // undefined değerleri filtrele
                                    .slice(0, 3)
                                    .map((doctor) => (
                                        <div
                                            key={doctor._id}
                                            className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200'
                                            onClick={() => navigate(`/doctors/${doctor._id}`)}
                                        >
                                            <Avatar size={48} icon={<UserOutlined />} src={doctor.user?.avatar} className='bg-gradient-to-r from-blue-500 to-green-500' />
                                            <div className='flex-1'>
                                                <Text strong className='block'>
                                                    Dr. {doctor.user?.name || 'İsimsiz'}
                                                </Text>
                                                <Text type="secondary" className='text-xs'>
                                                    {doctor.speciality || doctor.specialty || 'Branş Yok'}
                                                </Text>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <StarFilled className='text-yellow-500 text-xs' />
                                                <Text strong className='text-xs'>
                                                    {doctor.rating?.toFixed(1) || '0.0'}
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <Empty description="Henüz favori doktorunuz yok" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Randevu Detayları Modal */}
            <Modal
                title="Randevu Detayları"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Kapat
                    </Button>
                ]}
            >
                {selectedAppointment && (
                    <div className="space-y-4">
                        <div>
                            <span className="font-medium">Doktor:</span> Dr. {selectedAppointment.doctor?.user?.name || 'Bilinmiyor'}
                        </div>
                        <div>
                            <span className="font-medium">Branş:</span> {selectedAppointment.doctor?.speciality || '-'}
                        </div>
                        <div>
                            <span className="font-medium">Tarih:</span> {dayjs(selectedAppointment.date).format('DD/MM/YYYY')}
                        </div>
                        <div>
                            <span className="font-medium">Saat:</span> {selectedAppointment.start} - {selectedAppointment.end}
                        </div>
                        <div>
                            <span className="font-medium">Durum:</span>{' '}
                            <Tag color={getStatusColor(selectedAppointment.status)}>
                                {getStatusText(selectedAppointment.status)}
                            </Tag>
                        </div>
                        {selectedAppointment.notes && (
                            <div>
                                <span className="font-medium">Notlar:</span>
                                <p className="mt-1 text-gray-600">{selectedAppointment.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div >
    );
};

export default PatientDashboard;
