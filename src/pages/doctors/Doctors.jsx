import React, { useEffect, useState } from 'react';
import { getAllDoctors } from '../../api/doctorService';
import { Card, Row, Col, Typography, Avatar, Button } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const { Title, Paragraph, Text } = Typography;

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getAllDoctors({ limit: 24 })
            .then(res => setDoctors(res.doctors || []))
            .catch(() => setDoctors([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Title level={2} className="!mb-4">
                            <span className="text-blue-600">Tüm Doktorlar</span>
                        </Title>
                        <Paragraph className="text-gray-600 text-lg">
                            Sistemde kayıtlı tüm doktorları buradan inceleyebilirsiniz.
                        </Paragraph>
                    </div>
                    {loading ? (
                        <div className="text-center text-lg text-gray-500">Yükleniyor...</div>
                    ) : (
                        <Row gutter={[32, 32]}>
                            {doctors.length === 0 ? (
                                <Col span={24} className="text-center text-gray-500">Hiç doktor bulunamadı.</Col>
                            ) : (
                                doctors.map((doctor) => (
                                    <Col xs={24} sm={12} lg={8} key={doctor._id}>
                                        <Card
                                            className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                                            styles={{ body: { padding: '2rem' } }}
                                        >
                                            <div className="text-center">
                                                <div className="mb-4">
                                                    <Avatar
                                                        size={100}
                                                        src={doctor.user?.avatar}
                                                        className="bg-gradient-to-r from-blue-500 to-green-500"
                                                        style={{ fontSize: '48px' }}
                                                        icon={!doctor.user?.avatar ? <UserOutlined /> : undefined}
                                                    />
                                                </div>
                                                <Title level={4} className="!mb-1">
                                                    {doctor.user?.name || 'Doktor'}
                                                </Title>
                                                <Text className="text-gray-600 block mb-3">
                                                    {doctor.speciality}
                                                </Text>
                                                <Button
                                                    type="primary"
                                                    block
                                                    size="large"
                                                    className="bg-gradient-to-r from-blue-500 to-green-500 border-0 font-semibold"
                                                    icon={<CalendarOutlined />}
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
            </div>
        </>
    );
};

export default Doctors;
