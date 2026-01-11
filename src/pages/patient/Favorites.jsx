import { useState, useEffect } from 'react';
import { Card, Row, Col, Avatar, Tag, Button, Rate, Empty, Spin, Typography, message, Popconfirm } from 'antd';
import { UserOutlined, HeartFilled, CalendarOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavoriteDoctors, removeFromFavorites, selectFavoriteDoctors, selectUserLoading } from '../../store/slices/userSlice';

const { Title, Text } = Typography;

const Favorites = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const favoriteDoctors = useSelector(selectFavoriteDoctors);
    const loading = useSelector(selectUserLoading);
    const [removing, setRemoving] = useState(null);

    useEffect(() => {
        dispatch(fetchFavoriteDoctors());
    }, [dispatch]);

    const handleRemoveFavorite = async (doctorId) => {
        try {
            setRemoving(doctorId);
            await dispatch(removeFromFavorites(doctorId));
            message.success('Favorilerden çıkarıldı');
        } catch {
            message.error('İşlem başarısız');
        } finally {
            setRemoving(null);
        }
    };

    const handleDoctorClick = (id) => navigate(`/dashboard/patient/doctors/${id}`);
    const handleBookAppointment = (id) => navigate(`/dashboard/patient/create-appointment?doctorId=${id}`);

    if (loading && (!favoriteDoctors || favoriteDoctors.length === 0)) {
        return <div className="flex justify-center items-center min-h-96"><Spin size="large" tip="Favoriler yükleniyor..." /></div>;
    }

    return (
        <div className='max-h-screen max-w-[1400px] mx-auto'>
            <div className="mb-6"><Title level={3}><HeartFilled className="mr-2 text-red-500" />Favori Doktorlarım</Title><Text type="secondary">{favoriteDoctors?.length || 0} favori doktorunuz var</Text></div>
            {!favoriteDoctors || favoriteDoctors.length === 0 ? (
                <Card><Empty description="Henüz favori doktorunuz yok" image={Empty.PRESENTED_IMAGE_SIMPLE}><Button type="primary" onClick={() => navigate('/dashboard/patient/doctors')}>Doktorları Keşfet</Button></Empty></Card>
            ) : (
                <Row gutter={[16, 16]}>
                    {favoriteDoctors.map((doctor) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={doctor.id}>
                            <Card hoverable className="h-full transition-all duration-200 hover:shadow-lg relative">
                                <Popconfirm title="Favorilerden çıkarmak istediğinize emin misiniz?" onConfirm={() => handleRemoveFavorite(doctor.id)} okText="Evet" cancelText="Hayır">
                                    <Button danger size="small" icon={<HeartOutlined />} loading={removing === doctor.id} className="absolute top-2 right-2 z-10" />
                                </Popconfirm>
                                <div className="text-center cursor-pointer" onClick={() => handleDoctorClick(doctor.id)}>
                                    <Avatar size={80} icon={<UserOutlined />} src={doctor.user?.avatar} className="mb-3" />
                                    <Title level={5} className="!mb-1">Dr. {doctor.user?.name || 'İsimsiz'}</Title>
                                    <Tag color="blue" className="mb-2">{doctor.specialityNavigation?.name || doctor.speciality}</Tag>
                                    <div className="flex items-center justify-center gap-2 mb-2"><Rate disabled allowHalf value={doctor.rating || 0} style={{ fontSize: 14 }} /><Text type="secondary" className="text-sm">({doctor.reviewCount || 0})</Text></div>
                                </div>
                                <Button type="primary" icon={<CalendarOutlined />} block onClick={(e) => { e.stopPropagation(); handleBookAppointment(doctor.id); }} className="mt-2">Randevu Al</Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default Favorites;