import { Card, Row, Col, Typography, Space, Divider } from 'antd';
import {
    HeartOutlined, TeamOutlined, SafetyOutlined, ClockCircleOutlined,
    MedicineBoxOutlined, CheckCircleOutlined, StarOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';

const { Title, Paragraph, Text } = Typography;

const About = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/dashboard/${user.role}`);
        }
    }, [isAuthenticated, user, navigate]);

    const stats = [
        { number: '10K+', label: 'Mutlu Hasta' },
        { number: '150+', label: 'Uzman Doktor' },
        { number: '50+', label: 'Tıbbi Branş' },
        { number: '24/7', label: 'Canlı Destek' }
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                {/* Hero */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 text-white py-24 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <Title level={1} className="!text-white mb-6 font-bold">Biz Kimiz?</Title>
                        <Paragraph className="text-xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
                            Teknoloji ve sağlığı birleştirerek, herkes için erişilebilir, hızlı ve güvenilir sağlık hizmeti sunan yeni nesil dijital sağlık platformuyuz.
                        </Paragraph>
                    </div>
                </div>

                <div className="container mx-auto px-6 my-16 relative z-20">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-16">
                        {stats.map((stat, index) => (
                            <Card key={index} className="text-center shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl bg-white/90 backdrop-blur">
                                <Title level={2} className="!mb-1 !text-blue-600 font-extrabold">{stat.number}</Title>
                                <Text className="text-gray-500 font-medium">{stat.label}</Text>
                            </Card>
                        ))}
                    </div>

                    {/* Mission/Vision */}
                    <Card className="shadow-lg border-0 rounded-3xl mb-16 p-6 md:p-10">
                        <Row gutter={[48, 48]} align="middle">
                            <Col xs={24} md={12}>
                                <div className="bg-blue-50 p-8 rounded-2xl h-full">
                                    <Title level={3} className="flex items-center gap-2 !text-blue-700">
                                        <StarOutlined /> Misyonumuz
                                    </Title>
                                    <Paragraph className="text-gray-600 text-lg leading-relaxed">
                                        Hastalarımızın sağlık hizmetlerine ulaşımını kolaylaştırmak, bekleme sürelerini ortadan kaldırmak ve en doğru doktorla en hızlı şekilde buluşmalarını sağlamak.
                                    </Paragraph>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="bg-green-50 p-8 rounded-2xl h-full">
                                    <Title level={3} className="flex items-center gap-2 !text-green-700">
                                        <SafetyOutlined /> Vizyonumuz
                                    </Title>
                                    <Paragraph className="text-gray-600 text-lg leading-relaxed">
                                        Türkiye'nin ve bölgenin en kapsamlı dijital sağlık ekosistemi olmak; sağlıkta dijital dönüşümün öncüsü olarak kalite standartlarını belirlemek.
                                    </Paragraph>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Values Grid */}
                    <div className="my-16">
                        <Title level={2} className="text-center py-8 mb-16">Değerlerimiz & Özelliklerimiz</Title>
                        <Row gutter={[24, 24]}>
                            {[
                                { icon: <HeartOutlined className="text-red-500" />, title: 'Hasta Odaklı', desc: 'Her kararımızda önce sizin sağlığınızı düşünürüz.' },
                                { icon: <TeamOutlined className="text-blue-500" />, title: 'Uzman Kadro', desc: 'Sadece alanında kanıtlanmış uzmanlarla çalışırız.' },
                                { icon: <ClockCircleOutlined className="text-orange-500" />, title: '7/24 Hizmet', desc: 'Zaman kavramı olmaksızın yanınızdayız.' },
                                { icon: <SafetyOutlined className="text-green-500" />, title: 'Güvenlik', desc: 'Kişisel verileriniz uluslararası standartlarda korunur.' },
                                { icon: <MedicineBoxOutlined className="text-purple-500" />, title: 'Modern Teknoloji', desc: 'En yeni tıbbi teknolojileri takip ederiz.' },
                                { icon: <CheckCircleOutlined className="text-teal-500" />, title: 'Şeffaflık', desc: 'Süreçlerimizde açık ve anlaşılırız.' }
                            ].map((item, i) => (
                                <Col xs={24} sm={12} lg={8} key={i}>
                                    <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
                                        <div className="flex flex-col items-center text-center p-4">
                                            <div className="text-4xl mb-4 p-4 bg-gray-50 rounded-full">{item.icon}</div>
                                            <Title level={4} className="!mb-2">{item.title}</Title>
                                            <Paragraph className="text-gray-500 mb-0">{item.desc}</Paragraph>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
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

export default About;