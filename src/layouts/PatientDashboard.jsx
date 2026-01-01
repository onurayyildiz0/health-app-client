import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Table, Tag, Avatar, Spin, Empty, Modal } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    StarFilled,
    EyeOutlined,
    RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { fetchMyAppointments, selectAllAppointments, selectAppointmentLoading } from '../store/slices/appointmentSlice';
import { fetchFavoriteDoctors, selectFavoriteDoctors, selectUserLoading } from '../store/slices/userSlice';
import { selectUser } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const PatientDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

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
        const loadData = async () => {
            if (isMounted && (!appointments || appointments.length === 0)) {
                await dispatch(fetchMyAppointments()).catch(() => { });
            }
            // Favorilerin yüklenmesini biraz geciktirerek UI takılmasını önle
            setTimeout(() => {
                if (isMounted) {
                    dispatch(fetchFavoriteDoctors()).catch(() => { });
                }
            }, 1000);
        };
        loadData();
        return () => { isMounted = false; };
    }, [dispatch]); // dependencies array düzeltildi

    useEffect(() => {
        if (appointments?.length > 0) {
            const today = dayjs().startOf('day');
            const nextWeek = today.add(7, 'day');
            const upcomingCount = appointments.filter(app => {
                const appointmentDate = dayjs(app.date);
                return (appointmentDate.isAfter(today) || appointmentDate.isSame(today, 'day')) 
                    && appointmentDate.isBefore(nextWeek) 
                    && app.status === 'booked';
            }).length;

            setStats({
                totalAppointments: appointments.length,
                completedAppointments: appointments.filter(a => a.status === 'completed').length,
                upcomingAppointments: upcomingCount,
                cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length
            });
        }
    }, [appointments]);

    // Tarih formatı
    const todayStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Bugünkü randevular
    const todayAppointments = appointments?.filter(app => {
        const appointmentDate = dayjs(app.date).format('YYYY-MM-DD');
        const todayDate = dayjs().format('YYYY-MM-DD');
        return appointmentDate === todayDate && app.status === 'booked';
    }) || [];

    // Yaklaşan randevular (Table için)
    const upcomingAppointments = appointments?.filter(app => {
        const appointmentDate = dayjs(app.date);
        const today = dayjs().startOf('day');
        return (appointmentDate.isAfter(today) || appointmentDate.isSame(today, 'day')) && app.status === 'booked';
    }).sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()).slice(0, 5) || [];

    // Table Kolonları
    const columns = [
        {
            title: 'Doktor',
            dataIndex: 'doctor',
            key: 'doctor',
            render: (doctor) => (
                <div className="flex items-center gap-3">
                    <Avatar src={doctor?.user?.avatar} icon={<UserOutlined />} />
                    <div>
                        <div className="font-medium text-gray-800">Dr. {doctor?.user?.name}</div>
                        <div className="text-xs text-gray-500">{doctor?.speciality}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Tarih',
            dataIndex: 'date',
            key: 'date',
            render: (date) => <span className="text-gray-600">{dayjs(date).format('DD/MM/YYYY')}</span>
        },
        {
            title: 'Saat',
            key: 'time',
            render: (record) => (
                <Tag icon={<ClockCircleOutlined />} color="blue" className="rounded-full px-2 border-0 bg-blue-50 text-blue-600">
                    {record.start.slice(0, 5)} - {record.end.slice(0, 5)}
                </Tag>
            )
        },
        {
            title: '',
            key: 'action',
            render: (record) => (
                <Button 
                    type="text" 
                    icon={<EyeOutlined className="text-gray-400 hover:text-blue-500" />} 
                    onClick={() => { setSelectedAppointment(record); setIsModalVisible(true); }} 
                />
            )
        }
    ];

    // İstatistik Kartı Bileşeni
    const StatCard = ({ title, value, icon, bgClass }) => (
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl h-full">
            <div className="flex items-center justify-between">
                <div>
                    <Text type="secondary" className="text-gray-500 font-medium">{title}</Text>
                    <Title level={2} className="!mb-0 !mt-1 !font-bold text-gray-800">{value}</Title>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen pb-10">
            {/* Header Section */}
            <div className="mb-8 bg-gradient-to-r from-white to-blue-50 p-6 rounded-3xl shadow-sm border border-blue-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Title level={2} className="!mb-1 !text-gray-800">
                            Hoş Geldiniz, {user?.name} 👋
                        </Title>
                        <Text className="text-gray-500 text-lg">{todayStr}</Text>
                    </div>
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate('create-appointment')}
                        className="rounded-xl px-6 h-12 shadow-blue-200 shadow-lg"
                    >
                        Randevu Al
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Bugünkü Randevular" 
                        value={todayAppointments.length} 
                        icon={<CalendarOutlined className="text-xl text-blue-600" />} 
                        bgClass="bg-blue-100"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Yaklaşan" 
                        value={stats.upcomingAppointments} 
                        icon={<ClockCircleOutlined className="text-xl text-orange-500" />} 
                        bgClass="bg-orange-100"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Tamamlanan" 
                        value={stats.completedAppointments} 
                        icon={<CheckCircleOutlined className="text-xl text-green-500" />} 
                        bgClass="bg-green-100"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Favori Doktorlar" 
                        value={favoriteDoctors?.length || 0} 
                        icon={<StarFilled className="text-xl text-yellow-500" />} 
                        bgClass="bg-yellow-100"
                    />
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Left Content */}
                <Col xs={24} lg={16}>
                    {/* Today's Appointments */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <Title level={4} className="!mb-0 text-gray-800">Bugünkü Programım</Title>
                        </div>
                        
                        {appointmentLoading ? (
                            <div className="text-center py-10"><Spin /></div>
                        ) : todayAppointments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {todayAppointments.map(app => (
                                    // DÜZELTME BURADA YAPILDI: key={app.id || app._id}
                                    <Card 
                                        key={app.id || app._id} 
                                        className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-all bg-blue-600 text-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar size={54} src={app.doctor?.user?.avatar} className="border-2 border-white/30" icon={<UserOutlined />} />
                                            <div className="flex-1">
                                                <div className="font-bold text-lg">Dr. {app.doctor?.user?.name}</div>
                                                <div className="text-gray-700 text-sm">{app.doctor?.location}</div>
                                                <div className="text-blue-400 text-sm">{app.doctor?.speciality}</div>
                                                <div className="mt-2 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                                    <ClockCircleOutlined /> <span>{app.start.slice(0, 5)} - {app.end.slice(0, 5)}</span>
                                                </div>
                                            </div>
                                            <Button 
                                                shape="circle" 
                                                icon={<RightOutlined />} 
                                                className="bg-white/20 border-0 text-white hover:bg-white hover:text-blue-600"
                                                onClick={() => { setSelectedAppointment(app); setIsModalVisible(true); }}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Empty 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                description="Bugün için randevunuz bulunmuyor." 
                                className="bg-white p-8 rounded-2xl shadow-sm border-0"
                            />
                        )}
                    </div>

                    {/* Upcoming Table */}
                    <Card className="border-0 shadow-sm rounded-2xl" title={<span className="font-bold text-gray-700">Yaklaşan Randevular</span>}>
                        <Table
                            columns={columns}
                            dataSource={upcomingAppointments}
                            // DÜZELTME BURADA YAPILDI: rowKey={(record) => record.id || record._id}
                            rowKey={(record) => record.id || record._id}
                            pagination={false}
                            loading={appointmentLoading}
                            locale={{ emptyText: 'Yaklaşan randevu yok' }}
                            className="ant-table-rounded"
                        />
                        <Button type="link" block className="mt-2 text-gray-500 hover:text-blue-600" onClick={() => navigate('appointments')}>
                            Tümünü Gör
                        </Button>
                    </Card>
                </Col>

                {/* Right Sidebar */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={<span className="font-bold text-gray-700 flex items-center gap-2"><StarFilled className="text-yellow-400" /> Favorilerim</span>} 
                        className="border-0 shadow-sm rounded-2xl h-full"
                        extra={<Button type="link" onClick={() => navigate('favorites')}>Tümü</Button>}
                    >
                        {userLoading ? <Spin className="w-full py-4" /> : (
                            <div className="space-y-4">
                                {favoriteDoctors?.slice(0, 4).map(doc => (
                                    <div 
                                        key={doc.id || doc._id} 
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                                        onClick={() => navigate(`/dashboard/patient/doctors/${doc.id || doc._id}`)}
                                    >
                                        <Avatar size={48} src={doc.user?.avatar} icon={<UserOutlined />} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-800 truncate">Dr. {doc.user?.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{doc.speciality}</div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                            <StarFilled className="text-yellow-400 text-xs" />
                                            <span className="text-xs font-bold text-yellow-600">{doc.rating || '5.0'}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!favoriteDoctors || favoriteDoctors.length === 0) && (
                                    <Empty description="Favori doktor yok" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Detail Modal */}
            <Modal
                title="Randevu Detayları"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                centered
            >
                {selectedAppointment && (
                    <div className="flex flex-col items-center p-4">
                        <Avatar size={80} src={selectedAppointment.doctor?.user?.avatar} icon={<UserOutlined />} className="mb-3 border-2 border-blue-100" />
                        <Title level={4} className="!mb-0">Dr. {selectedAppointment.doctor?.user?.name}</Title>
                        <Text type="secondary" className="mb-6">{selectedAppointment.doctor?.speciality}</Text>
                        
                        <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between border-b pb-2 border-gray-200">
                                <span className="text-gray-500">Tarih</span>
                                <span className="font-medium text-gray-800">{dayjs(selectedAppointment.date).format('DD MMMM YYYY')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 border-gray-200">
                                <span className="text-gray-500">Saat</span>
                                <span className="font-medium text-gray-800">{selectedAppointment.start.slice(0, 5)} - {selectedAppointment.end.slice(0, 5)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Durum</span>
                                <Tag color={selectedAppointment.status === 'booked' ? 'blue' : selectedAppointment.status === 'completed' ? 'green' : 'red'}>
                                    {selectedAppointment.status.toUpperCase()}
                                </Tag>
                            </div>
                            {selectedAppointment.notes && (
                                <div className="pt-2">
                                    <span className="text-gray-500 block mb-1">Notlar</span>
                                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">{selectedAppointment.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PatientDashboard;