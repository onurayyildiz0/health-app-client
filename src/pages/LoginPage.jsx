import { Formik } from 'formik';
import { Form, Input, Button, Card, message, Divider, Alert } from 'antd';
import { LoginSchema } from '../validations/AuthValidations';
import { LockOutlined, MailOutlined, HeartFilled } from '@ant-design/icons';
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
        dispatch(loginStart());
        try {
            const response = await authService.login(values);
            dispatch(loginSuccess({ user: response.data.user, token: response.data.tokens.accessToken }));
            message.success('Giriş başarılı! Yönlendiriliyorsunuz...');
            setTimeout(() => {
                const role = response.data.user.role;
                navigate(role === 'admin' ? '/dashboard/admin' : role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
            }, 1500);
        } catch (error) {
            const msg = error.message || 'Giriş yapılamadı.';
            dispatch(loginFailure(msg));
            message.error(msg);
        } finally { setSubmitting(false); }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-4 relative overflow-hidden'>
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `radial-gradient(#3b82f6 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>
            
            <div className='w-full max-w-md relative z-10'>
                <div className='text-center mb-8 animate-fade-in-down'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl rotate-3 shadow-lg mb-4'>
                        <HeartFilled onClick={() => navigate("/")} className='text-white text-3xl -rotate-3' />
                    </div>
                    <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>HealthApp</h1>
                    <p className='text-gray-500 mt-2'>Sağlıklı yarınlar için giriş yapın</p>
                </div>

                <Card className='shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-xl' styles={{ body: { padding: '2.5rem' } }}>
                    <h2 className='text-xl font-bold text-gray-800 mb-6 text-center'>Hoş Geldiniz</h2>
                    
                    <Formik initialValues={{ email: '', password: '' }} validationSchema={LoginSchema} onSubmit={handleLogin}>
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                            <Form onFinish={handleSubmit} layout="vertical">
                                <Form.Item help={touched.email && errors.email} validateStatus={touched.email && errors.email ? 'error' : ''} className='mb-4'>
                                    <Input size='large' name='email' prefix={<MailOutlined className="text-gray-400" />} placeholder='E-posta' value={values.email} onChange={handleChange} onBlur={handleBlur} className='rounded-xl py-3' />
                                </Form.Item>
                                <Form.Item help={touched.password && errors.password} validateStatus={touched.password && errors.password ? 'error' : ''} className='mb-2'>
                                    <Input.Password size='large' name="password" prefix={<LockOutlined className="text-gray-400" />} placeholder="Şifre" value={values.password} onChange={handleChange} onBlur={handleBlur} className='rounded-xl py-3' />
                                </Form.Item>
                                
                                <div className='flex justify-end mb-6'>
                                    <Link to="/forgot-password" className='text-sm text-blue-600 hover:text-blue-800 font-medium'>Şifremi Unuttum?</Link>
                                </div>

                                <Button type="primary" htmlType="submit" size='large' block loading={isSubmitting || loading} className='h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 border-0 font-bold shadow-lg shadow-blue-200'>
                                    Giriş Yap
                                </Button>

                                <Divider plain className='text-gray-400 text-sm my-6'>veya</Divider>

                                <Button block size='large' className='h-12 rounded-xl border-2 border-gray-100 font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-600' onClick={() => navigate('/register')}>
                                    Hesap Oluştur
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Card>
                <div className='text-center mt-8 text-gray-400 text-xs'>&copy; 2025 HealthApp. Tüm hakları saklıdır.</div>
            </div>
        </div>
    );
};
export default LoginPage;