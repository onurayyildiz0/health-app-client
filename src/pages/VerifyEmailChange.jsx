// src/pages/VerifyEmailChange.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Card } from 'antd';
import { confirmEmailChange } from '../api/userService';

const VerifyEmailChange = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [msg, setMsg] = useState('İşlem yapılıyor...');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await confirmEmailChange(token);
                setStatus('success');
                setMsg(response.message || 'E-posta adresiniz başarıyla değiştirildi.');
                localStorage.removeItem("token");
            } catch (error) {
                setStatus('error');
                setMsg(error.response?.data?.message || 'Link geçersiz veya süresi (1 dakika) dolmuş.');
            }
        };

        if (token) verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl">
                {status === 'loading' && <Spin tip="Doğrulanıyor..." size="large" className="w-full py-10" />}
                
                {status === 'success' && (
                    <Result
                        status="success"
                        title="Başarılı!"
                        subTitle={msg}
                        extra={[
                            <Button type="primary" key="login" onClick={() => navigate('/login')}>
                                Giriş Yap
                            </Button>
                        ]}
                    />
                )}

                {status === 'error' && (
                    <Result
                        status="error"
                        title="Hata"
                        subTitle={msg}
                        extra={[
                            <Button key="home" onClick={() => navigate('/')}>
                                Ana Sayfa
                            </Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default VerifyEmailChange;