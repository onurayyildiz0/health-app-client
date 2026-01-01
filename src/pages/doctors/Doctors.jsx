import React, { useEffect, useState } from 'react';
import { getAllDoctors } from '../../api/doctorService';
import { Card, Row, Col, Typography, Avatar, Button, Tag, Rate } from 'antd';
import { UserOutlined, CalendarOutlined, EnvironmentOutlined, HeartOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        getAllDoctors({ limit: 24 })
            .then(res => setDoctors(res.data.doctors || []))
            .catch(() => setDoctors([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                {/* Public Header */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 text-white py-16 md:py-24 rounded-b-[2rem] shadow-lg mb-12">
                    <div className="container mx-auto px-4 text-center">
                        <Title level={1} className="!text-white !mb-4">Uzman Doktorlarımız</Title>
                        <Paragraph className="!text-blue-100 text-lg max-w-2xl mx-auto">
                            Sağlığınız için en iyi uzmanlarla çalışıyoruz. Aşağıdaki listeden doktorlarımızı inceleyebilir ve hemen randevu alabilirsiniz.
                        </Paragraph>
                    </div>
                </div>

                <div className="container mx-auto px-4 pb-20">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Yükleniyor...</div>
                    ) : (
                        <Row gutter={[24, 24]}>
                            {doctors.length === 0 ? (
                                <Col span={24} className="text-center text-gray-500">Kayıtlı doktor bulunamadı.</Col>
                            ) : (
                                doctors.map((doctor) => (
                                    <Col xs={24} sm={12} lg={8} xl={6} key={doctor.id}>
                                        <Card
                                            hoverable
                                            className="h-full border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group"
                                            bodyStyle={{ padding: 0 }}
                                        >
                                            <div className="p-6 text-center bg-white group-hover:bg-blue-50 transition-colors duration-300">
                                                <Avatar
                                                    size={100}
                                                    src={doctor.user?.avatar}
                                                    className="mb-4 shadow-md border-4 border-white"
                                                    icon={<UserOutlined />}
                                                />
                                                <Title level={4} className="!mb-1 !text-gray-800">{doctor.user?.name || 'Doktor'}</Title>
                                                <Tag color="blue" className="mb-3 rounded-full border-0">{doctor.speciality}</Tag>
                                                <div className='flex justify-center mb-1'>
                                                    <Rate disabled defaultValue={doctor.rating || 5} className='text-sm text-yellow-400' />
                                                </div>
                                            </div>
                                            <div className="px-6 pb-6 bg-white group-hover:bg-blue-50 transition-colors duration-300">
                                                {doctor.location && (
                                                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-4">
                                                        <EnvironmentOutlined />
                                                        <span className="truncate max-w-[200px]">{doctor.location}</span>
                                                    </div>
                                                )}
                                                <Button
                                                    type="primary"
                                                    block
                                                    size="large"
                                                    className="rounded-xl font-semibold shadow-blue-200 shadow-lg"
                                                    icon={<CalendarOutlined />}
                                                    onClick={() => navigate('/login')}
                                                >
                                                    Randevu Al
                                                </Button>
                                            </div>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>
                    )}
                </div>
                {/* Footer */}
                                <footer className='bg-slate-900 text-white py-16 rounded-t-[3rem]'>
                                    <div className='container mx-auto px-6'>
                                        <Row gutter={[48, 48]}>
                                            <Col xs={24} md={12} lg={8}>
                                                <div className='flex items-center gap-2 mb-6'>
                                                    <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'><HeartOutlined className='text-xl' /></div>
                                                    <span className='text-2xl font-bold'>HealthApp</span>
                                                </div>
                                                <p className='text-slate-400 leading-relaxed'>Sağlığınız bizim için her şeyden önemli. Teknolojinin gücüyle sağlık hizmetlerini parmaklarınızın ucuna getiriyoruz.</p>
                                            </Col>
                                            <Col xs={24} md={12} lg={8}>
                                                <h4 className='text-lg font-bold mb-6'>Hızlı Erişim</h4>
                                                <div className='grid grid-cols-1 gap-3'>
                                                    <Link to="/doctors" className='text-slate-400 hover:text-white transition-colors'>Doktorlar</Link>
                                                    <Link to="/about" className='text-slate-400 hover:text-white transition-colors'>Hakkımızda</Link>
                                                    <Link to="/login" className='text-slate-400 hover:text-white transition-colors'>Giriş Yap</Link>
                                                </div>
                                            </Col>
                                            <Col xs={24} md={12} lg={8}>
                                                <h4 className='text-lg font-bold mb-6'>İletişim</h4>
                                                <p className='text-slate-400 mb-2'>support@healthapp.com</p>
                                                <p className='text-slate-400'>+90 212 555 00 00</p>
                                            </Col>
                                        </Row>
                                        <div className='border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm'>
                                            &copy; 2025 HealthApp. Tüm hakları saklıdır.
                                        </div>
                                    </div>
                                </footer>
            </div>
        </>
    );
};

export default Doctors;