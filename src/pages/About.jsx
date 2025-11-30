import { Card, Row, Col, Typography, Space, Divider } from 'antd';
import {
    HeartOutlined,
    TeamOutlined,
    SafetyOutlined,
    ClockCircleOutlined,
    MedicineBoxOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';

const { Title, Paragraph, Text } = Typography;

const About = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    // Login olduysa dashboard'a yönlendir
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/dashboard/${user.role}`);
        }
    }, [isAuthenticated, user, navigate]);
    const features = [
        {
            icon: <HeartOutlined className="text-4xl text-blue-500" />,
            title: 'Sağlık Odaklı',
            description: 'Hastalarımızın sağlık ihtiyaçlarını en üst düzeyde karşılamak için çalışıyoruz.'
        },
        {
            icon: <TeamOutlined className="text-4xl text-green-500" />,
            title: 'Uzman Kadro',
            description: 'Alanında uzman doktorlar ve sağlık profesyonelleri ile hizmet veriyoruz.'
        },
        {
            icon: <ClockCircleOutlined className="text-4xl text-purple-500" />,
            title: '7/24 Hizmet',
            description: 'Acil durumlar için 7 gün 24 saat kesintisiz sağlık hizmeti sunuyoruz.'
        },
        {
            icon: <SafetyOutlined className="text-4xl text-red-500" />,
            title: 'Güvenli Platform',
            description: 'Verileriniz en yüksek güvenlik standartlarıyla korunmaktadır.'
        },
        {
            icon: <MedicineBoxOutlined className="text-4xl text-orange-500" />,
            title: 'Modern Teknoloji',
            description: 'Son teknoloji tıbbi cihazlar ve dijital sağlık çözümleri kullanıyoruz.'
        },
        {
            icon: <CheckCircleOutlined className="text-4xl text-teal-500" />,
            title: 'Kaliteli Hizmet',
            description: 'Hasta memnuniyeti odaklı, kaliteli ve güvenilir sağlık hizmeti.'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Mutlu Hasta' },
        { number: '150+', label: 'Uzman Doktor' },
        { number: '50+', label: 'Branş' },
        { number: '24/7', label: 'Destek' }
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <Title level={1} className="!text-white mb-4">
                                Hakkımızda
                            </Title>
                            <Paragraph className="text-xl !text-white opacity-90">
                                Sağlığınız için en iyi çözümleri sunuyoruz
                            </Paragraph>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-16">
                    {/* Mission Section */}
                    <div className="max-w-5xl mx-auto mb-16">
                        <Card className="shadow-lg border-0 rounded-2xl">
                            <Space direction="vertical" size="large" className="w-full">
                                <div className="text-center">
                                    <Title level={2} className="!mb-4">
                                        Misyonumuz
                                    </Title>
                                    <Paragraph className="text-lg text-gray-600 leading-relaxed">
                                        Health App olarak, modern teknoloji ile sağlık hizmetlerini bir araya getirerek
                                        hastalarımıza en kaliteli ve erişilebilir sağlık hizmetini sunmayı amaçlıyoruz.
                                        Dijital platformumuz sayesinde, hastalarımız istedikleri zaman istedikleri yerden
                                        sağlık hizmetlerine ulaşabilir, randevu alabilir ve sağlık durumlarını takip edebilirler.
                                    </Paragraph>
                                </div>

                                <Divider />

                                <div className="text-center">
                                    <Title level={2} className="!mb-4">
                                        Vizyonumuz
                                    </Title>
                                    <Paragraph className="text-lg text-gray-600 leading-relaxed">
                                        Türkiye'nin en güvenilir ve tercih edilen dijital sağlık platformu olmak.
                                        Sağlık hizmetlerini teknoloji ile birleştirerek, herkesin kaliteli sağlık
                                        hizmetlerine kolay erişimini sağlamak ve sağlık sektöründe dijital dönüşümün
                                        öncüsü olmaktır.
                                    </Paragraph>
                                </div>
                            </Space>
                        </Card>
                    </div>

                    {/* Stats Section */}
                    <div className="max-w-6xl mx-auto mb-16">
                        <Row gutter={[32, 32]}>
                            {stats.map((stat, index) => (
                                <Col xs={12} sm={12} md={6} key={index}>
                                    <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300 border-0 rounded-xl bg-gradient-to-br from-white to-blue-50">
                                        <Title level={2} className="!mb-2 !text-blue-600">
                                            {stat.number}
                                        </Title>
                                        <Text className="text-gray-600 text-lg font-medium">
                                            {stat.label}
                                        </Text>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* Features Section */}
                    <div className="max-w-6xl mx-auto">
                        <Title level={2} className="text-center mb-12">
                            Neden Bizi Tercih Etmelisiniz?
                        </Title>
                        <Row gutter={[24, 24]}>
                            {features.map((feature, index) => (
                                <Col xs={24} sm={12} lg={8} key={index}>
                                    <Card
                                        className="h-full shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl hover:-translate-y-1"
                                        hoverable
                                    >
                                        <div className="text-center">
                                            <div className="mb-4">
                                                {feature.icon}
                                            </div>
                                            <Title level={4} className="!mb-3">
                                                {feature.title}
                                            </Title>
                                            <Paragraph className="text-gray-600">
                                                {feature.description}
                                            </Paragraph>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* Values Section */}
                    <div className="max-w-5xl mx-auto mt-16">
                        <Card className="shadow-lg border-0 rounded-2xl bg-gradient-to-br from-blue-50 to-white">
                            <Title level={2} className="text-center !mb-8">
                                Değerlerimiz
                            </Title>
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <Space direction="vertical" size="middle" className="w-full">
                                        <div>
                                            <Text strong className="text-lg text-blue-600">
                                                <CheckCircleOutlined /> Güvenilirlik
                                            </Text>
                                            <Paragraph className="!mt-2 text-gray-600">
                                                Hastalarımıza en güvenilir ve doğru sağlık bilgisini sunuyoruz.
                                            </Paragraph>
                                        </div>
                                        <div>
                                            <Text strong className="text-lg text-blue-600">
                                                <CheckCircleOutlined /> Şeffaflık
                                            </Text>
                                            <Paragraph className="!mt-2 text-gray-600">
                                                Tüm süreçlerimizde açık ve şeffaf bir yaklaşım benimsiyoruz.
                                            </Paragraph>
                                        </div>
                                        <div>
                                            <Text strong className="text-lg text-blue-600">
                                                <CheckCircleOutlined /> İnovasyon
                                            </Text>
                                            <Paragraph className="!mt-2 text-gray-600">
                                                Sürekli gelişen teknoloji ile hizmet kalitemizi artırıyoruz.
                                            </Paragraph>
                                        </div>
                                    </Space>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Space direction="vertical" size="middle" className="w-full">
                                        <div>
                                            <Text strong className="text-lg text-blue-600">
                                                <CheckCircleOutlined /> Hasta Odaklılık
                                            </Text>
                                            <Paragraph className="!mt-2 text-gray-600">
                                                Hasta memnuniyeti her zaman önceliğimizdir.
                                            </Paragraph>
                                        </div>
                                        <div>
                                            <Text strong className="text-lg text-blue-600">
                                                <CheckCircleOutlined /> Etik
                                            </Text>
                                            <Paragraph className="!mt-2 text-gray-600">
                                                Tıbbi etik kurallara tam uyum içinde hizmet veriyoruz.
                                            </Paragraph>
                                        </div>
                                        <div>
                                            <Text strong className="text-lg text-blue-600">
                                                <CheckCircleOutlined /> Erişilebilirlik
                                            </Text>
                                            <Paragraph className="!mt-2 text-gray-600">
                                                Sağlık hizmetlerini herkes için erişilebilir kılıyoruz.
                                            </Paragraph>
                                        </div>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </div>


                </div>
            </div>
        </>

    );
};

export default About;
