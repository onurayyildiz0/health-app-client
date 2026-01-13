import { useState } from 'react';
import { Card, Form, Input, Button, message, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';


import { resetPassword } from '../api/userService'; 

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await resetPassword(token, values.password);
            
            setSuccess(true);
            message.success('Şifreniz başarıyla güncellendi.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error(error); 
            const errorMsg = error.response?.data?.message || error.message || 'Şifre sıfırlama başarısız oldu.';
            message.error(errorMsg);
        } finally { 
            setLoading(false); 
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md shadow-xl rounded-3xl border-0">
                    <Result 
                        status="success" 
                        title="Şifre Sıfırlandı!" 
                        subTitle="Giriş sayfasına yönlendiriliyorsunuz..." 
                        extra={[
                            <Link key="l" to="/login">
                                <Button type="primary">Giriş Yap</Button>
                            </Link>
                        ]} 
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl rounded-3xl border-0" styles={{ body: { padding: '2.5rem' } }}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-3xl">
                        <LockOutlined />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Yeni Şifre Belirle</h2>
                </div>
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item 
                        name="password" 
                        rules={[{ required: true, min: 6, message: 'En az 6 karakter olmalı' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Yeni Şifre" 
                            size="large" 
                            className="rounded-xl py-3" 
                        />
                    </Form.Item>
                    <Form.Item 
                        name="confirm" 
                        dependencies={['password']} 
                        rules={[
                            { required: true, message: 'Şifre tekrarı gerekli' }, 
                            ({ getFieldValue }) => ({ 
                                validator(_, value) { 
                                    return !value || getFieldValue('password') === value 
                                        ? Promise.resolve() 
                                        : Promise.reject(new Error('Şifreler eşleşmiyor!')); 
                                } 
                            })
                        ]}
                    >
                        <Input.Password 
                            prefix={<CheckCircleOutlined />} 
                            placeholder="Şifre Tekrar" 
                            size="large" 
                            className="rounded-xl py-3" 
                        />
                    </Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading} 
                        block 
                        size="large" 
                        className="h-12 rounded-xl font-bold bg-green-600 shadow-lg"
                    >
                        Kaydet
                    </Button>
                </Form>
            </Card>
        </div>
    );
};
export default ResetPassword;