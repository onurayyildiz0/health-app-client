import { Card, Button, Row, Col, Typography, Avatar, Badge, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import {
    HeartOutlined,
    CalendarOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
    StarFilled,
    SafetyCertificateOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';
import { getAllDoctors } from '../api/doctorService';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    // Login olduysa dashboard'a yönlendir
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/dashboard/${user.role}`);
        }
    }, [isAuthenticated, user, navigate]);

    // Dinamik doktorlar
    const [topDoctors, setTopDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await getAllDoctors({ limit: 3 });
                setTopDoctors(data.doctors || data);
            } catch {
                setTopDoctors([]);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    // Özellikler
    const features = [
        {
            icon: <CalendarOutlined className='text-4xl text-blue-500' />,
            title: 'Kolay Randevu',
            description: 'Online randevu sistemi ile hızlı ve kolay randevu alın'
        },
        {
            icon: <TeamOutlined className='text-4xl text-green-500' />,
            title: 'Uzman Doktorlar',
            description: 'Alanında uzman doktorlarımızla sağlığınız güvende'
        },
        {
            icon: <SafetyCertificateOutlined className='text-4xl text-purple-500' />,
            title: 'Güvenilir Hizmet',
            description: '7/24 güvenilir sağlık hizmeti sunuyoruz'
        },
        {
            icon: <ClockCircleOutlined className='text-4xl text-orange-500' />,
            title: '24/7 Destek',
            description: 'Her zaman yanınızdayız, kesintisiz destek'
        },
    ];

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50'>
                {/* Hero Section */}
                <div className='relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-500 text-white'>
                    <div className='absolute inset-0 opacity-20'>
                        <div style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            height: '100%',
                            width: '100%'
                        }} />
                    </div>

                    <div className='container mx-auto px-4 py-20 relative z-10'>
                        <Row align='middle' gutter={[48, 48]}>
                            <Col xs={24} md={12}>
                                <div className='space-y-6'>
                                    <Badge.Ribbon text="Yeni" color="green">
                                        <div className='inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full'>
                                            <Text className='text-white font-semibold'>
                                                🎉 Online Randevu Sistemi Açıldı
                                            </Text>
                                        </div>
                                    </Badge.Ribbon>

                                    <Title level={1} className='!text-white !mb-4 !text-5xl'>
                                        Sağlığınız Bizim <br />
                                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300'>
                                            Önceliğimiz
                                        </span>
                                    </Title>

                                    <Paragraph className='!text-white/90 text-lg'>
                                        Modern sağlık hizmetleri ile hayatınızı kolaylaştırıyoruz.
                                        Uzman doktorlarımızla online randevu alın, sağlık geçmişinizi takip edin.
                                    </Paragraph>


                                </div>
                            </Col>

                            <Col xs={24} md={12}>
                                <div className='grid grid-cols-2 gap-4'>
                                    <Card className='text-center border-0 shadow-xl bg-white/90 backdrop-blur-sm'>
                                        <Statistic
                                            title="Mutlu Hasta"
                                            value={15000}
                                            suffix="+"
                                            valueStyle={{ color: '#10B981' }}
                                        />
                                    </Card>
                                    <Card className='text-center border-0 shadow-xl bg-white/90 backdrop-blur-sm'>
                                        <Statistic
                                            title="Uzman Doktor"
                                            value={250}
                                            suffix="+"
                                            valueStyle={{ color: '#3B82F6' }}
                                        />
                                    </Card>
                                    <Card className='text-center border-0 shadow-xl bg-white/90 backdrop-blur-sm'>
                                        <Statistic
                                            title="Branş"
                                            value={45}
                                            suffix="+"
                                            valueStyle={{ color: '#F59E0B' }}
                                        />
                                    </Card>
                                    <Card className='text-center border-0 shadow-xl bg-white/90 backdrop-blur-sm'>
                                        <Statistic
                                            title="Memnuniyet"
                                            value={98}
                                            suffix="%"
                                            valueStyle={{ color: '#8B5CF6' }}
                                        />
                                    </Card>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Features Section */}
                <div className='container mx-auto px-4 py-20'>
                    <div className='text-center mb-16'>
                        <Title level={2} className='!mb-4'>
                            Neden <span className='text-blue-600'>HealthApp</span>?
                        </Title>
                        <Paragraph className='text-gray-600 text-lg max-w-2xl mx-auto'>
                            Modern teknoloji ile sağlık hizmetlerini bir araya getirerek size en iyi deneyimi sunuyoruz
                        </Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        {features.map((feature, index) => (
                            <Col xs={24} sm={12} lg={6} key={index}>
                                <Card
                                    className='text-center h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer'
                                    styles={{ body: { padding: '2rem' } }}
                                >
                                    <div className='mb-4'>
                                        {feature.icon}
                                    </div>
                                    <Title level={4} className='!mb-2'>
                                        {feature.title}
                                    </Title>
                                    <Paragraph className='text-gray-600'>
                                        {feature.description}
                                    </Paragraph>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Top Doctors Section */}
                <div className='bg-gradient-to-br from-gray-50 to-blue-50 py-20'>
                    <div className='container mx-auto px-4'>
                        <div className='text-center mb-16'>
                            <Title level={2} className='!mb-4'>
                                <span className='text-blue-600'>Doktorlarımız</span>
                            </Title>
                            <Paragraph className='text-gray-600 text-lg'>
                                Alanında uzman, deneyimli doktorlara ihtiyaç duyduğunuz zaman erişin
                            </Paragraph>
                        </div>

                        <Row gutter={[32, 32]}>
                            {loadingDoctors ? (
                                <Col span={24} className="text-center">
                                    <p>Doktorlar yükleniyor...</p>
                                </Col>
                            ) : topDoctors.length === 0 ? (
                                <Col span={24} className="text-center">
                                    <p>Gösterilecek doktor bulunamadı.</p>
                                </Col>
                            ) : (
                                topDoctors.map((doctor) => (
                                    <Col xs={24} sm={12} lg={8} key={doctor._id || doctor.id}>
                                        <Card
                                            className='border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'
                                            styles={{ body: { padding: '2rem' } }}
                                        >
                                            <div className='text-center'>
                                                <div className='mb-4'>
                                                    <Avatar
                                                        size={100}
                                                        src={
                                                            doctor.user && doctor.user.avatar
                                                                ? doctor.user.avatar
                                                                : undefined
                                                        }
                                                        className='bg-gradient-to-r from-blue-500 to-green-500'
                                                        style={{ fontSize: '48px' }}
                                                    >
                                                        {(!doctor.user || !doctor.user.avatar) && (doctor.name ? doctor.name[0] : (doctor.user && doctor.user.name ? doctor.user.name[0] : 'D'))}
                                                    </Avatar>
                                                </div>
                                                <Title level={4} className='!mb-1'>
                                                    {doctor.name || (doctor.user && doctor.user.name) || 'Doktor'}
                                                </Title>
                                                <Text className='text-gray-600 block mb-3'>
                                                    {doctor.specialty || doctor.speciality || '-'}
                                                </Text>
                                                <div className='flex justify-center items-center gap-4 mb-4'>
                                                    <div className='flex items-center gap-1'>
                                                        <StarFilled className='text-yellow-500' />
                                                        <Text strong>{doctor.rating || 0}</Text>
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                        <UserOutlined className='text-blue-500' />
                                                        <Text>{doctor.patients || doctor.reviewCount || 0}+ hasta</Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>


                    </div>
                </div>



                {/* Footer */}
                <div className='bg-gray-800 text-white py-12'>
                    <div className='container mx-auto px-4'>
                        <Row gutter={[32, 32]} className='flex justify-between'>
                            <Col xs={24} md={8}>
                                <div className='flex items-center gap-2 mb-4'>
                                    <HeartOutlined className='text-2xl text-green-400' />
                                    <Title level={3} className='!text-white !mb-0'>HealthApp</Title>
                                </div>
                                <Paragraph className='!text-gray-400'>
                                    Sağlığınız bizim önceliğimiz. Modern teknoloji ile
                                    sağlık hizmetlerini bir araya getiriyoruz.
                                </Paragraph>
                            </Col>
                            <Col xs={24} md={8}>
                                <Title level={4} className='!text-white !mb-4'>Hızlı Linkler</Title>
                                <div className='space-y-2'>
                                    <div><Link to="/doctors" className='text-gray-400 hover:text-white transition-colors'>Doktorlarımız</Link></div>
                                    <div><Link to="/about" className='text-gray-400 hover:text-white transition-colors'>Hakkımızda</Link></div>

                                </div>
                            </Col>

                        </Row>
                        <div className='border-t border-gray-700 mt-8 pt-8 text-center text-gray-400'>
                            <Paragraph className='!text-gray-400 !mb-0'>
                                &copy; 2025 HealthApp. Tüm hakları saklıdır.
                            </Paragraph>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home