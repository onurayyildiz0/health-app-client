import { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Spin, message, Button, Modal, Form, Input } from 'antd';
import { UserOutlined, TeamOutlined, MedicineBoxOutlined, CheckCircleOutlined, CalendarOutlined, UserAddOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import {
    fetchStats,
    createNewAdmin,
    selectAdminStats,
    selectAdminLoading
} from '../store/slices/adminSlice';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    const user = useSelector(selectUser);
    const stats = useSelector(selectAdminStats);
    const loading = useSelector(selectAdminLoading);
    const dispatch = useDispatch();
    
    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [form] = Form.useForm();

    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // İstatistikleri Yükle (Slice üzerinden)
    useEffect(() => {
        dispatch(fetchStats());
    }, [dispatch]);

    // Yeni Admin Oluştur (Slice üzerinden)
    const handleCreateAdmin = async (values) => {
        try {
            setCreateLoading(true);
            await dispatch(createNewAdmin(values));
            message.success('Yeni yönetici başarıyla oluşturuldu');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error(error.message || 'Admin oluşturulurken hata oluştu');
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading && stats.totalUsers === 0) {
        return <div className='flex justify-center items-center min-h-screen'><Spin size="large" tip="İstatistikler yükleniyor..." /></div>;
    }

    return (
        <div className="p-4 md:p-6 min-h-screen">
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
                <div>
                    <Title level={2} className='!mb-1 !text-2xl md:!text-3xl'>Hoş Geldiniz, {user?.name} 👋</Title>
                    <Text type="secondary" className='text-sm md:text-base'>Bugün {today}</Text>
                </div>
                <Button type="primary" icon={<UserAddOutlined />} size="large" onClick={() => setIsModalVisible(true)} className="w-full md:w-auto">Yeni Yönetici Ekle</Button>
            </div>

            <Row gutter={[16, 16]} className='mb-8'>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className='shadow-sm hover:shadow-md transition-all h-full'>
                        <Statistic title="Toplam Kullanıcı" value={stats.totalUsers || 0} prefix={<UserOutlined className='text-blue-500 bg-blue-50 p-2 rounded-lg mr-2' />} valueStyle={{ fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className='shadow-sm hover:shadow-md transition-all h-full'>
                        <Statistic title="Doktorlar" value={stats.totalDoctors || 0} prefix={<MedicineBoxOutlined className='text-green-500 bg-green-50 p-2 rounded-lg mr-2' />} valueStyle={{ fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className='shadow-sm hover:shadow-md transition-all h-full'>
                        <Statistic title="Hastalar" value={stats.totalPatients || 0} prefix={<TeamOutlined className='text-purple-500 bg-purple-50 p-2 rounded-lg mr-2' />} valueStyle={{ fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className='shadow-sm hover:shadow-md transition-all h-full'>
                        <Statistic title="Bekleyen Onaylar" value={stats.pendingDoctors || 0} prefix={<CheckCircleOutlined className='text-orange-500 bg-orange-50 p-2 rounded-lg mr-2' />} valueStyle={{ fontWeight: 'bold' }} suffix={<span className="text-xs text-gray-400">kişi</span>} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title={<span className="flex items-center gap-2"><CalendarOutlined /> Randevu Durumu</span>} className='shadow-sm h-full'>
                        <Row gutter={16}>
                            <Col span={12}><Statistic title="Toplam Randevu" value={stats.totalAppointments || 0} valueStyle={{ color: '#6366f1' }} /></Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={<span className="flex items-center gap-2"><UserOutlined /> Admin </span>} className='shadow-sm h-full'>
                        <Row gutter={16}>
                            <Col span={12}><Statistic title="Adminler" value={stats.totalUsers - stats.totalDoctors - stats.totalPatients || 0} valueStyle={{ color: '#6366f1' }} /></Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Modal title="Yeni Yönetici Oluştur" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleCreateAdmin}>
                    <Form.Item name="name" label="Ad Soyad" rules={[{ required: true, message: 'Lütfen isim giriniz' }]}><Input prefix={<UserOutlined />} placeholder="Admin Adı" /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Lütfen email giriniz' }, { type: 'email', message: 'Geçerli bir email giriniz' }]}><Input prefix={<MailOutlined />} placeholder="admin@example.com" /></Form.Item>
                    <Form.Item name="password" label="Şifre" rules={[{ required: true, message: 'Lütfen şifre giriniz' }, { min: 6, message: 'En az 6 karakter olmalı' }]}><Input.Password prefix={<LockOutlined />} placeholder="Şifre" /></Form.Item>
                    <Form.Item><Button type="primary" htmlType="submit" loading={createLoading} block>Oluştur</Button></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;