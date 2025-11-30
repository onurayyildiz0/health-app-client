import { Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4'>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    height: '100%',
                    width: '100%'
                }} />
            </div>

            <div className='relative z-10 text-center max-w-2xl mx-auto'>
                {/* Logo */}
                <div className='mb-8'>
                    <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full shadow-2xl mb-6'>
                        <HeartOutlined className='text-white text-3xl' />
                    </div>
                </div>

                {/* 404 Number */}
                <div className='mb-8'>
                    <div className='text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500 leading-none'>
                        404
                    </div>
                </div>

                {/* Title */}
                <Title level={1} className='!text-gray-800 !mb-4'>
                    Sayfa Bulunamadı
                </Title>

                {/* Description */}
                <Paragraph className='text-gray-600 text-lg mb-8 max-w-md mx-auto'>
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                    Ana sayfaya dönebilir veya arama yapabilirsiniz.
                </Paragraph>

                {/* Decorative Icons */}
                <div className='flex justify-center gap-4 mb-8 text-6xl opacity-20'>
                    <span>🏥</span>
                    <span>💊</span>
                    <span>⚕️</span>
                    <span>🩺</span>
                </div>

                {/* Action Buttons */}
                <Space size="large" wrap className='justify-center'>
                    <Button
                        type="primary"
                        size="large"
                        icon={<HomeOutlined />}
                        className='bg-gradient-to-r from-blue-500 to-green-500 border-0 h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
                        onClick={() => navigate('/')}
                    >
                        Ana Sayfaya Dön
                    </Button>

                    <Button
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        className='h-12 px-8 font-semibold border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-200'
                        onClick={() => navigate(-1)}
                    >
                        Geri Dön
                    </Button>
                </Space>

                {/* Help Text */}
                <div className='mt-12 pt-8 border-t border-gray-200'>
                    <Paragraph className='text-gray-500 text-sm'>
                        Yardıma mı ihtiyacınız var?{' '}
                        <a href="/login" className='text-blue-600 hover:text-blue-800 font-semibold transition-colors'>
                            Giriş yapın
                        </a>
                        {' '}veya{' '}
                        <a href="/register" className='text-blue-600 hover:text-blue-800 font-semibold transition-colors'>
                            hesap oluşturun
                        </a>
                    </Paragraph>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
