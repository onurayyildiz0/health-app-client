import { useState } from 'react';
import { Card, Form, Input, Button, message, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/userService';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await forgotPassword(values.email);
            setEmailSent(true);
        } catch (error) {
            message.error('İşlem başarısız. Lütfen tekrar deneyin.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl rounded-3xl border-0" styles={{ body: { padding: '2.5rem' } }}>
                {!emailSent ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-3xl"><MailOutlined /></div>
                            <h2 className="text-2xl font-bold text-gray-800">Şifremi Unuttum</h2>
                            <p className="text-gray-500 mt-2">Email adresinizi girin, sıfırlama linki gönderelim.</p>
                        </div>
                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Geçerli bir email girin' }]}>
                                <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="ornek@email.com" size="large" className="rounded-xl py-3" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large" className="h-12 rounded-xl bg-blue-600 font-bold shadow-lg">Link Gönder</Button>
                        </Form>
                        <div className="text-center mt-6">
                            <Link to="/login" className="text-gray-500 hover:text-gray-800 flex items-center justify-center gap-2"><ArrowLeftOutlined /> Giriş'e dön</Link>
                        </div>
                    </>
                ) : (
                    <Result status="success" title="Email Gönderildi!" subTitle="Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin." extra={[
                        <Link key="login" to="/login"><Button type="primary" className="rounded-xl">Giriş Yap</Button></Link>
                    ]} />
                )}
            </Card>
        </div>
    );
};
export default ForgotPassword;