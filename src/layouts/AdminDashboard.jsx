import { useEffect } from 'react';
import { Card, Row, Col, Typography, Statistic, Spin, message } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
    CheckCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import {
    fetchStatsStart,
    fetchStatsSuccess,
    fetchStatsFailure,
    selectAdminStats,
    selectAdminLoading
} from '../store/slices/adminSlice';
import * as adminService from '../api/adminService';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    const user = useSelector(selectUser);
    const stats = useSelector(selectAdminStats);
    const loading = useSelector(selectAdminLoading);
    const dispatch = useDispatch();

    // Bugünün tarihi
    const today = new Date().toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // İstatistikleri yükle
    useEffect(() => {
        const fetchStats = async () => {
            try {
                dispatch(fetchStatsStart());
                // Backend'de stats endpoint'i yok, getAllUsers kullan
                const usersResponse = await adminService.getAllUsers();
                const users = usersResponse.data || usersResponse;

                // İstatistikleri frontend'de hesapla
                const stats = {
                    totalUsers: users.length,
                    totalPatients: users.filter(u => u.role === 'patient').length,
                    totalDoctors: users.filter(u => u.role === 'doctor').length,
                    totalAdmins: users.filter(u => u.role === 'admin').length,
                    pendingDoctors: users.filter(u => u.role === 'doctor' && !u.isDoctorApproved).length,
                    approvedDoctors: users.filter(u => u.role === 'doctor' && u.isDoctorApproved).length,
                };

                dispatch(fetchStatsSuccess(stats));
            } catch (err) {
                dispatch(fetchStatsFailure(err.message));
                message.error('İstatistikler yüklenirken hata oluştu');
            }
        };

        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Spin size="large" tip="İstatistikler yükleniyor...">
                    <div style={{ padding: 50 }} />
                </Spin>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hoş Geldin Bölümü */}
            <div className='mb-6'>
                <Title level={2} className='!mb-2'>
                    Hoş Geldiniz {user?.name}! 👋
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
                            title="Toplam Kullanıcı"
                            value={stats.totalUsers || 0}
                            prefix={<UserOutlined className='text-blue-500' />}
                            valueStyle={{ color: '#3b82f6' }}
                            suffix="Kişi"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Doktorlar"
                            value={stats.totalDoctors || 0}
                            prefix={<MedicineBoxOutlined className='text-green-500' />}
                            valueStyle={{ color: '#10b981' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Hastalar"
                            value={stats.totalPatients || 0}
                            prefix={<TeamOutlined className='text-purple-500' />}
                            valueStyle={{ color: '#a855f7' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Bekleyen Onaylar"
                            value={stats.pendingDoctors || 0}
                            prefix={<CheckCircleOutlined className='text-orange-500' />}
                            valueStyle={{ color: '#f97316' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Ek İstatistikler */}
            <Row gutter={[16, 16]} className='mb-6'>
                <Col xs={24} sm={12}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Toplam Randevu"
                            value={stats.totalAppointments || 0}
                            prefix={<CalendarOutlined className='text-indigo-500' />}
                            valueStyle={{ color: '#6366f1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className='shadow-sm hover:shadow-md transition-all duration-200'>
                        <Statistic
                            title="Bugünkü Randevular"
                            value={stats.todayAppointments || 0}
                            prefix={<CalendarOutlined className='text-pink-500' />}
                            valueStyle={{ color: '#ec4899' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* İçerik Kartları */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card className='shadow-md'>
                        <Title level={4}>Sistem Özeti</Title>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <Text type="secondary">Toplam Kullanıcı</Text>
                                <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                            </div>
                            <div>
                                <Text type="secondary">Aktif Doktorlar</Text>
                                <div className="text-2xl font-bold">{stats.totalDoctors || 0}</div>
                            </div>
                            <div>
                                <Text type="secondary">Kayıtlı Hastalar</Text>
                                <div className="text-2xl font-bold">{stats.totalPatients || 0}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
