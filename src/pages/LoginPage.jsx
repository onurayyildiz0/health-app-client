import { Formik } from 'formik';
import { Form, Input, Button, Card, message, Divider, Alert } from 'antd';
import { LoginSchema } from '../validations/AuthValidations';
import { UserOutlined, LockOutlined, MailOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../api/authService';
import { loginStart, loginSuccess, loginFailure, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);


    const handleLogin = async (values, { setSubmitting }) => {

        dispatch(loginStart())
        try {
            const response = await authService.login(values);

            // Backend'den gelen yapı: response.data = { user, tokens: { accessToken, refreshToken } }
            dispatch(loginSuccess({
                user: response.data.user,
                token: response.data.tokens.accessToken
            }));

            message.success('Giriş başarılı! Yönlendiriliyorsunuz...')

            // Dashboard'a yönlendirmeden önce biraz bekle (rate limit için)
            setTimeout(() => {
                if (response.data.user.role === 'admin') {
                    navigate('/dashboard/admin');
                } else if (response.data.user.role === 'doctor') {
                    navigate('/dashboard/doctor');
                } else {
                    navigate('/dashboard/patient');
                }
            }, 1500)
        } catch (error) {
            let errorMessage = 'Giriş başarısız!';

            if (error.message && error.message.includes('timeout')) {
                errorMessage = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.';
            } else if (error.message && error.message.includes('Network Error')) {
                errorMessage = 'Ağ hatası. Backend sunucusuna erişilemiyor.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            dispatch(loginFailure(errorMessage));
            message.error(errorMessage, 5);

        } finally { setSubmitting(false) }
    };


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

            <div className='w-full max-w-md relative z-10'>
                {/* Logo/Brand Section */}
                <div className='text-center mb-8'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4 shadow-lg'>
                        <HeartOutlined className='text-white text-2xl' />
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>HealthApp</h1>
                    <p className='text-gray-600'>Sağlığınız bizim önceliğimiz</p>
                </div>

                {/* Login Card */}
                <Card
                    className='shadow-2xl border-0 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90'
                    styles={{ body: { padding: '2rem' } }}
                >
                    <div className='text-center mb-6'>
                        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Hoş Geldiniz</h2>
                        <p className='text-gray-600'>Hesabınıza giriş yapın</p>
                    </div>

                    {error && (
                        <Alert
                            message="Giriş Hatası"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            className='mb-4'
                        />
                    )}

                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={LoginSchema}
                        onSubmit={handleLogin}
                    >

                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                            <Form onFinish={handleSubmit} className='space-y-4'>
                                <Form.Item
                                    validateStatus={touched.email && errors.email ? 'error' : ''}
                                    help={touched.email && errors.email ? errors.email : null}
                                    className='mb-6'
                                >
                                    <Input
                                        name='email'
                                        prefix={<MailOutlined className='text-gray-400' />}
                                        placeholder='E-posta adresiniz'
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        size='large'
                                        className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500'
                                    />
                                </Form.Item>

                                <Form.Item
                                    validateStatus={touched.password && errors.password ? 'error' : ''}
                                    help={touched.password && errors.password ? errors.password : null}
                                    className='mb-6'
                                >
                                    <Input.Password
                                        name="password"
                                        prefix={<LockOutlined className='text-gray-400' />}
                                        placeholder="Şifreniz"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        size='large'
                                        className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500'
                                    />
                                </Form.Item>

                                <Form.Item className='mb-4'>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size='large'
                                        className='w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 border-0 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200'
                                        loading={isSubmitting || loading}
                                    >
                                        {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                    </Button>
                                </Form.Item>

                                <div className='text-center'>
                                    <Link to="/forgot-password" className='text-blue-600 hover:text-blue-800 text-sm transition-colors duration-200'>
                                        Şifrenizi mi unuttunuz?
                                    </Link>
                                </div>

                                <Divider className='my-6'>
                                    <span className='text-gray-400 text-sm'>veya</span>
                                </Divider>

                                <div className='text-center'>
                                    <p className='text-gray-600 text-sm mb-4'>
                                        Henüz hesabınız yok mu?
                                    </p>
                                    <Button
                                        type="default"
                                        size='large'
                                        className='w-full h-12 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200'
                                        onClick={() => navigate('/register')}
                                    >
                                        Hesap Oluştur
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>

                {/* Footer */}
                <div className='text-center mt-8 text-gray-500 text-sm'>
                    <p>&copy; 2025 HealthApp. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage