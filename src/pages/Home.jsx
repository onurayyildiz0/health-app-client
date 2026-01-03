import { Card, Row, Col, Typography, Avatar, Statistic, Button, Tag, Rate } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
    CalendarOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    ClockCircleOutlined,
    UserOutlined,
    HeartOutlined,
    ArrowRightOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';
import { getAllDoctors } from '../api/doctorService';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    const [topDoctors, setTopDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/dashboard/${user.role}`);
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await getAllDoctors({ limit: 3 });
                setTopDoctors(data.data.doctors || data);
            } catch {
                setTopDoctors([]);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    const features = [
        { icon: <CalendarOutlined className='text-4xl text-blue-500' />, title: 'Kolay Randevu', description: 'Saniyeler içinde randevunuzu planlayın.' },
        { icon: <TeamOutlined className='text-4xl text-green-500' />, title: 'Uzman Kadro', description: 'Alanında en iyi doktorlarla tanışın.' },
        { icon: <SafetyCertificateOutlined className='text-4xl text-purple-500' />, title: 'Güvenilir Hizmet', description: 'Verileriniz ve sağlığınız güvende.' },
        { icon: <ClockCircleOutlined className='text-4xl text-orange-500' />, title: '7/24 Destek', description: 'Kesintisiz sağlık desteği yanınızda.' },
    ];

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-gray-50 overflow-x-hidden'>
                {/* Hero Section */}
                <div className='relative bg-gradient-to-r from-blue-800 via-blue-700 to-teal-600 pt-20 pb-24 lg:pt-32 lg:pb-40 mb-8 rounded-b-[3rem] shadow-xl'>
                    <div className="absolute inset-0 opacity-10 pattern-dots" />
                    <div className='container mx-auto px-6 relative z-10'>
                        <Row gutter={[48, 48]} align="middle">
                            <Col xs={24} lg={12} className="text-center lg:text-left">
                                <Title className='!text-white !text-4xl md:!text-5xl lg:!text-6xl font-extrabold tracking-tight leading-tight mb-6'>
                                    Sağlığınız İçin <br />
                                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400'>
                                        Modern Çözümler
                                    </span>
                                </Title>
                                <Paragraph className='!text-blue-50 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed'>
                                    Uzman doktorlarımızla online randevu alın, tahlil sonuçlarınızı takip edin ve sağlık geçmişinizi güvenle saklayın.
                                </Paragraph>
                                <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                                    <Button type="primary" size="large" className="h-14 px-8 text-lg rounded-xl bg-white text-blue-600 hover:!bg-blue-50 border-none font-bold shadow-lg" onClick={() => navigate('/register')}>
                                        Hemen Başla
                                    </Button>
                                    <Button size="large" ghost className="h-14 px-8 text-lg rounded-xl !border-white !text-white hover:!bg-white/10 font-semibold" icon={<ArrowRightOutlined />} onClick={() => navigate('/about')}>
                                        Daha Fazla Bilgi
                                    </Button>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div className='grid grid-cols-2 gap-4 md:gap-6 max-w-lg mx-auto'>
                                    {[
                                        { label: 'Mutlu Hasta', val: '15K+', color: '#10B981' },
                                        { label: 'Uzman Doktor', val: '250+', color: '#3B82F6' },
                                        { label: 'Poliklinik', val: '45+', color: '#F59E0B' },
                                        { label: 'Memnuniyet', val: '%99', color: '#8B5CF6' }
                                    ].map((stat, i) => (
                                        <Card key={i} className='text-center border-0 shadow-lg bg-white/95 backdrop-blur rounded-2xl hover:-translate-y-1 transition-transform duration-300'>
                                            <Statistic title={stat.label} value={stat.val} valueStyle={{ color: stat.color, fontWeight: 'bold', fontSize: '2rem' }} />
                                        </Card>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Features */}
                <div className='container mx-auto px-6 py-20 -mt-16 relative z-20'>
                    <Row gutter={[24, 24]}>
                        {features.map((f, i) => (
                            <Col xs={24} md={12} lg={6} key={i}>
                                <Card className='h-full text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white' styles={{ body: { padding: '2rem' } }}>
                                    <div className='mb-6 bg-gray-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center'>{f.icon}</div>
                                    <Title level={4} className='!mb-3'>{f.title}</Title>
                                    <Paragraph className='text-gray-500 mb-0'>{f.description}</Paragraph>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Top Doctors */}
                <div className='py-20 bg-white'>
                    <div className='container mx-auto px-6'>
                        <div className='text-center max-w-3xl mx-auto mb-16'>
                            <Text className="text-blue-600 font-bold uppercase tracking-wider">Kadro</Text>
                            <Title level={2} className='mt-2 mb-4'>Öne Çıkan Doktorlarımız</Title>
                            <Paragraph className='text-gray-500 text-lg'>Sizler için seçtiğimiz, en yüksek puan alan uzmanlarımız.</Paragraph>
                        </div>

                        <Row gutter={[32, 32]}>
                            {loadingDoctors ? (
                                <Col span={24} className="text-center py-10">Yükleniyor...</Col>
                            ) : topDoctors.map((doc) => (
                                <Col xs={24} md={12} lg={8} key={doc._id || doc.id}>
                                    <Card
                                        hoverable
                                        className="h-full border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group"
                                        bodyStyle={{ padding: 0 }}
                                    >
                                        <div className="p-6 text-center bg-white group-hover:bg-blue-50 transition-colors duration-300">
                                            <Avatar
                                                size={100}
                                                src={doc.user?.avatar}
                                                className="mb-4 shadow-md border-4 border-white"
                                                icon={<UserOutlined />}
                                            />
                                            <Title level={4} className="mb-1 !text-gray-800">{doc.user?.name || 'Doktor'}</Title>
                                            <Tag color="blue" className="mb-3 rounded-full border-0">{doc.specialityNavigation?.name || 'Uzmanlık Belirtilmedi'}</Tag>
                                            <div className='flex justify-center my-2'>
                                                <Rate disabled defaultValue={doc.rating || 0} className='text-sm text-yellow-400' />
                                            </div>
                                        </div>
                                        <div className="px-6 pb-6 bg-white group-hover:bg-blue-50 transition-colors duration-300">
                                            {(doc.fullLocation || doc.location) && (
                                                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-4">
                                                    <EnvironmentOutlined />
                                                    <span className="text-wrap truncate max-w-[200px]">{doc.fullLocation || doc.location}</span>
                                                </div>
                                            )}
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                className="rounded-xl font-semibold shadow-blue-200 shadow-lg"
                                                icon={<CalendarOutlined />}
                                                onClick={() => navigate('/login')}
                                            >
                                                Randevu Al
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <div className='text-center mt-12'>
                            <Button type="default" size="large" className="rounded-full px-8" onClick={() => navigate('/doctors')}>Tüm Doktorları Gör</Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className='bg-slate-900 text-white py-16 rounded-t-[3rem]'>
                    <div className='container mx-auto px-6'>
                        <Row gutter={[48, 48]}>
                            <Col xs={24} md={12} lg={8}>
                                <div className='flex items-center gap-2 mb-6'>
                                    <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'><HeartOutlined className='text-xl' /></div>
                                    <span className='text-2xl font-bold'>HealthApp</span>
                                </div>
                                <p className='text-slate-400 leading-relaxed'>Sağlığınız bizim için her şeyden önemli. Teknolojinin gücüyle sağlık hizmetlerini parmaklarınızın ucuna getiriyoruz.</p>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                                <h4 className='text-lg font-bold mb-6'>Hızlı Erişim</h4>
                                <div className='grid grid-cols-1 gap-3'>
                                    <Link to="/doctors" className='text-slate-400 hover:text-white transition-colors'>Doktorlar</Link>
                                    <Link to="/about" className='text-slate-400 hover:text-white transition-colors'>Hakkımızda</Link>
                                    <Link to="/login" className='text-slate-400 hover:text-white transition-colors'>Giriş Yap</Link>
                                </div>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                                <h4 className='text-lg font-bold mb-6'>İletişim</h4>
                                <p className='text-slate-400 mb-2'>support@healthapp.com</p>
                                <p className='text-slate-400'>+90 212 555 00 00</p>
                            </Col>
                        </Row>
                        <div className='border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm'>
                            &copy; 2025 HealthApp. Tüm hakları saklıdır.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Home;