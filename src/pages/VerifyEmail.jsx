import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Card, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, MailOutlined } from '@ant-design/icons';
import { verifyEmail } from '../api/userService'; 

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('E-posta adresiniz doğrulanıyor, lütfen bekleyin...');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Geçersiz doğrulama bağlantısı.');
                return;
            }
            
            try {
                const response = await verifyEmail(token);

                setStatus('success');
                setMessage(response.message || 'E-posta adresiniz başarıyla doğrulandı!');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
             {/* Arkaplan Deseni */}
             <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `radial-gradient(#3b82f6 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>

            <Card className="w-full max-w-md shadow-2xl rounded-3xl border-0 relative z-10" styles={{ body: { padding: '2.5rem' } }}>
                
                {/* YÜKLENİYOR DURUMU */}
                {status === 'loading' && (
                    <div className="text-center py-10">
                        <Spin size="large" />
                        <h2 className="mt-6 text-xl font-semibold text-gray-700">Doğrulanıyor...</h2>
                        <p className="text-gray-500 mt-2">Lütfen pencereyi kapatmayın.</p>
                    </div>
                )}

                {/* BAŞARILI DURUMU */}
                {status === 'success' && (
                    <Result
                        icon={<CheckCircleFilled className="text-green-500" />}
                        status="success"
                        title="Tebrikler!"
                        subTitle={message}
                        extra={[
                            <Button 
                                type="primary" 
                                key="login" 
                                size="large"
                                className="w-full h-12 rounded-xl bg-green-600 font-bold shadow-lg hover:bg-green-500 border-0"
                                onClick={() => navigate('/login')}
                            >
                                Giriş Yap
                            </Button>
                        ]}
                    />
                )}

                {/* HATA DURUMU */}
                {status === 'error' && (
                    <Result
                        icon={<CloseCircleFilled className="text-red-500" />}
                        status="error"
                        title="Doğrulama Başarısız"
                        subTitle={message}
                        extra={[
                            <Button 
                                type="primary" 
                                key="home" 
                                size="large"
                                className="w-full h-12 rounded-xl bg-blue-600 font-bold shadow-lg border-0 mb-3"
                                onClick={() => navigate('/')}
                            >
                                Ana Sayfa
                            </Button>,
                            <Button 
                                key="login" 
                                size="large"
                                className="w-full h-12 rounded-xl"
                                onClick={() => navigate('/login')}
                            >
                                Giriş Sayfası
                            </Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default VerifyEmail;