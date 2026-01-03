import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import { Form, Input, Button, Card, message, Radio, Alert, Upload, Row, Col, Divider } from 'antd';
import { RegisterSchema } from '../validations/AuthValidations';
import {
    UserOutlined, LockOutlined, MailOutlined,
    TeamOutlined, UploadOutlined, HeartFilled,
    MedicineBoxOutlined, IdcardOutlined // Idcard ikonu eklendi
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerStart, registerFailure, registerSuccess, selectAuthLoading } from '../store/slices/authSlice';
import authService from '../api/authService';
import specialityService from '../api/specialityService';

// Not: RegisterSchema validasyon dosyasına tc için yup validasyonu eklemeyi unutmayın.
// Örn: tc: Yup.string().length(11, 'TC 11 hane olmalı').required('Zorunlu')

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector(selectAuthLoading);
    const [specialities, setSpecialities] = useState([]);

    useEffect(() => {
        const fetchSpecialities = async () => {
            try {
                const response = await specialityService.getAllSpecialities();
                setSpecialities(response.data || response || []);
            } catch (error) {
                // Sessiz hata
            }
        };
        fetchSpecialities();
    }, []);

    const handleRegister = async (values, { setSubmitting }) => {
        dispatch(registerStart());
        try {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
                    formData.append(key, values[key]);
                }
            });

            await authService.register(formData);

            dispatch(registerSuccess());
            message.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.', 5);
            setTimeout(() => navigate('/login'), 2000);

        } catch (error) {
            console.error("Kayıt Hatası Detayı:", error);
            let errorMsg = 'Kayıt başarısız';
            if(error.response && error.response.data && error.response.data.message)
                errorMsg = error.response.data.message;
            else if(error.message)
                errorMsg = error.message;
            
            dispatch(registerFailure(errorMsg));
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-4 py-10 relative overflow-hidden'>
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `radial-gradient(#3b82f6 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>

            <div className='w-full max-w-3xl relative z-10'>
                <div className='text-center mb-8 animate-fade-in-down'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl rotate-3 shadow-lg mb-4'>
                        <HeartFilled onClick={() => navigate("/")} className='text-white text-3xl -rotate-3' />
                    </div>
                    <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>Aramıza Katılın</h1>
                    <p className='text-gray-500 mt-2'>Sağlık yolculuğunuz burada başlıyor</p>
                </div>

                <Card className='shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-xl' styles={{ body: { padding: '2.5rem' } }}>
                    <Formik
                        initialValues={{ 
                            name: '', email: '', password: '', confirmPassword: '', 
                            role: 'patient', documents: null, speciality: '', 
                            tc: '' // TC eklendi
                        }}
                        validationSchema={RegisterSchema}
                        onSubmit={handleRegister}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
                            <Form onFinish={handleSubmit} layout="vertical">
                                
                                <div className="mb-8">
                                    <label className="block text-gray-700 font-bold mb-3 text-center">Hesap Türünü Seçin</label>
                                    <Radio.Group value={values.role} onChange={e => setFieldValue('role', e.target.value)} className="w-full">
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12}>
                                                <div 
                                                    onClick={() => setFieldValue('role', 'patient')} 
                                                    className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all duration-300 transform hover:scale-[1.02] ${values.role === 'patient' ? 'border-blue-500 bg-blue-50/80 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
                                                >
                                                    <TeamOutlined className={`text-3xl mb-2 ${values.role === 'patient' ? 'text-blue-500' : 'text-gray-400'}`} />
                                                    <div className={`font-bold ${values.role === 'patient' ? 'text-blue-700' : 'text-gray-600'}`}>Hasta</div>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <div 
                                                    onClick={() => setFieldValue('role', 'doctor')} 
                                                    className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all duration-300 transform hover:scale-[1.02] ${values.role === 'doctor' ? 'border-green-500 bg-green-50/80 shadow-md' : 'border-gray-100 hover:border-green-200'}`}
                                                >
                                                    <MedicineBoxOutlined className={`text-3xl mb-2 ${values.role === 'doctor' ? 'text-green-500' : 'text-gray-400'}`} />
                                                    <div className={`font-bold ${values.role === 'doctor' ? 'text-green-700' : 'text-gray-600'}`}>Doktor</div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Radio.Group>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item help={touched.name && errors.name} validateStatus={touched.name && errors.name ? 'error' : ''}>
                                        <Input size='large' name='name' prefix={<UserOutlined className="text-gray-400" />} placeholder='Ad Soyad' value={values.name} onChange={handleChange} onBlur={handleBlur} className='rounded-xl py-3' />
                                    </Form.Item>
                                    
                                    {/* TC KİMLİK INPUT */}
                                    <Form.Item help={touched.tc && errors.tc} validateStatus={touched.tc && errors.tc ? 'error' : ''}>
                                        <Input 
                                            size='large' 
                                            name='tc' 
                                            prefix={<IdcardOutlined className="text-gray-400" />} 
                                            placeholder='TC Kimlik No' 
                                            value={values.tc} 
                                            onChange={(e) => {
                                                // Sadece rakam girilmesini sağla
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val) && val.length <= 11) {
                                                    handleChange(e);
                                                }
                                            }}
                                            onBlur={handleBlur} 
                                            className='rounded-xl py-3' 
                                        />
                                    </Form.Item>
                                </div>

                                <Form.Item help={touched.email && errors.email} validateStatus={touched.email && errors.email ? 'error' : ''}>
                                    <Input size='large' name='email' prefix={<MailOutlined className="text-gray-400" />} placeholder='E-posta' value={values.email} onChange={handleChange} onBlur={handleBlur} className='rounded-xl py-3' />
                                </Form.Item>

                                {/* Doktor Özel Alanları */}
                                {values.role === 'doctor' && (
                                    <div className="bg-green-50/50 p-6 rounded-2xl mb-6 border border-green-100 animate-fade-in">
                                        <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                                            <MedicineBoxOutlined /> Doktor Bilgileri
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                            <Form.Item help={touched.speciality && errors.speciality} validateStatus={touched.speciality && errors.speciality ? 'error' : ''}>
                                                <select 
                                                    name="speciality" 
                                                    value={values.speciality} 
                                                    onChange={handleChange} 
                                                    onBlur={handleBlur} 
                                                    className="w-full h-[50px] px-3 rounded-xl border border-gray-300 focus:border-green-500 outline-none bg-white text-gray-700 transition-all hover:border-green-400"
                                                >
                                                    <option value="">Branş Seçin</option>
                                                    {specialities.map(spec => (
                                                        <option key={spec.id} value={spec.id}>
                                                            {spec.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Form.Item>
                                            {/* Not: Location burada sorulmuyor, profil ayarlarında detaylı girilecek */}
                                        </div>
                                        <Form.Item help={touched.documents && errors.documents} validateStatus={touched.documents && errors.documents ? 'error' : ''} className="mb-2">
                                            <Upload maxCount={1} beforeUpload={file => { setFieldValue('documents', file); return false; }} onRemove={() => setFieldValue('documents', null)} accept=".pdf">
                                                <Button size="large" icon={<UploadOutlined />} block className="rounded-xl h-12 border-dashed border-2 border-green-300 text-green-600 hover:text-green-700 hover:border-green-500 bg-white">
                                                    Diploma Yükle (PDF)
                                                </Button>
                                            </Upload>
                                        </Form.Item>
                                        <Alert message="Belgeleriniz incelendikten sonra hesabınız onaylanacaktır." type="info" showIcon className="rounded-xl text-xs bg-white border-green-100 text-gray-500" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item help={touched.password && errors.password} validateStatus={touched.password && errors.password ? 'error' : ''}>
                                        <Input.Password size='large' name="password" prefix={<LockOutlined className="text-gray-400" />} placeholder="Şifre" value={values.password} onChange={handleChange} onBlur={handleBlur} className='rounded-xl py-3' />
                                    </Form.Item>
                                    <Form.Item help={touched.confirmPassword && errors.confirmPassword} validateStatus={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}>
                                        <Input.Password size='large' name="confirmPassword" prefix={<LockOutlined className="text-gray-400" />} placeholder="Şifre Tekrar" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} className='rounded-xl py-3' />
                                    </Form.Item>
                                </div>

                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    size='large' 
                                    block 
                                    loading={isSubmitting || loading} 
                                    className={`h-14 mt-2 rounded-xl border-0 font-bold text-lg shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 ${
                                        values.role === 'doctor' 
                                        ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-green-200' 
                                        : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-200'
                                    }`}
                                >
                                    Kayıt Ol
                                </Button>

                                <Divider plain className='text-gray-400 text-sm my-6'>Hesabınız var mı?</Divider>

                                <Button 
                                    block 
                                    size='large' 
                                    className='h-12 rounded-xl border-2 border-gray-100 font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-600' 
                                    onClick={() => navigate('/login')}
                                >
                                    Giriş Yap
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
export default Register;