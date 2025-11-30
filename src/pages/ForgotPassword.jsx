import { useState } from 'react';
import { Card, Form, Input, Button, message, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authService';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await forgotPassword(values.email);
            setEmailSent(true);
            message.success('Şifre sıfırlama linki email adresinize gönderildi');
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                'Bir hata oluştu. Lütfen tekrar deneyin.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <Result
                        status="success"
                        title="Email Gönderildi!"
                        subTitle="Şifre sıfırlama linki email adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin. Link 1 saat geçerlidir."
                        extra={[
                            <Link to="/login" key="login">
                                <Button type="primary" icon={<ArrowLeftOutlined />}>
                                    Giriş Sayfasına Dön
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
                        <MailOutlined className="text-3xl text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Şifremi Unuttum</h2>
                    <p className="text-gray-600 mt-2">
                        Email adresinizi girin, size şifre sıfırlama linki gönderelim
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        name="email"
                        label="Email Adresi"
                        rules={[
                            { required: true, message: 'Email adresi gerekli' },
                            { type: 'email', message: 'Geçerli bir email adresi girin' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="ornek@email.com"
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
                            Sıfırlama Linki Gönder
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-4">
                    <Link to="/login" className="text-blue-600 hover:text-blue-800">
                        <ArrowLeftOutlined /> Giriş sayfasına dön
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPassword;
