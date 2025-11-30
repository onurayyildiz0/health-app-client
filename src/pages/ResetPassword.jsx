import { useState } from 'react';
import { Card, Form, Input, Button, message, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/authService';

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form] = Form.useForm();
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await resetPassword(token, values.password);
            setSuccess(true);
            message.success('Şifreniz başarıyla sıfırlandı!');

            // 3 saniye sonra login sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                'Şifre sıfırlama başarısız. Link geçersiz veya süresi dolmuş olabilir.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <Result
                        status="success"
                        title="Şifre Başarıyla Sıfırlandı!"
                        subTitle="Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz. 3 saniye sonra giriş sayfasına yönlendirileceksiniz..."
                        extra={[
                            <Link to="/login" key="login">
                                <Button type="primary" icon={<CheckCircleOutlined />}>
                                    Giriş Yap
                                </Button>
                            </Link>
                        ]}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <LockOutlined className="text-3xl text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Yeni Şifre Belirle</h2>
                    <p className="text-gray-600 mt-2">
                        Lütfen yeni şifrenizi girin
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        name="password"
                        label="Yeni Şifre"
                        rules={[
                            { required: true, message: 'Şifre gerekli' },
                            { min: 6, message: 'Şifre en az 6 karakter olmalı' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                message: 'Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir'
                            }
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Yeni şifrenizi girin"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Şifre Tekrar"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Lütfen şifrenizi tekrar girin' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                                }
                            })
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Şifrenizi tekrar girin"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className="mt-4"
                        >
                            Şifremi Sıfırla
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-4">
                    <Link to="/login" className="text-blue-600 hover:text-blue-800">
                        Giriş sayfasına dön
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default ResetPassword;
