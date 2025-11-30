import { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Avatar,
    Tag,
    Button,
    Rate,
    Empty,
    Spin,
    Typography,
    message,
    Popconfirm
} from 'antd';
import {
    UserOutlined,
    HeartFilled,
    CalendarOutlined,
    StarFilled,
    DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFavoriteDoctorsSuccess,
    removeFavoriteDoctorSuccess,
    selectFavoriteDoctors,
    selectUserLoading
} from '../../store/slices/userSlice';
import * as userService from '../../api/userService';

const { Title, Text } = Typography;

const Favorites = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const favoriteDoctors = useSelector(selectFavoriteDoctors);
    const loading = useSelector(selectUserLoading);
    const [removing, setRemoving] = useState(null);

    // Favori doktorları yükle
    useEffect(() => {
        let isMounted = true;

        const fetchFavorites = async () => {
            // Redux'ta zaten varsa tekrar yükleme
            if (favoriteDoctors && favoriteDoctors.length > 0) return;

            try {
                const response = await userService.getFavoriteDoctors();
                if (isMounted) {
                    dispatch(fetchFavoriteDoctorsSuccess(response.data || response));
                }
            } catch {
                if (isMounted) {
                    message.error('Favoriler yüklenirken hata oluştu');
                }
            }
        };

        fetchFavorites();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Favorilerden çıkar
    const handleRemoveFavorite = async (doctorId) => {
        try {
            setRemoving(doctorId);
            await userService.removeFavoriteDoctor(doctorId);
            dispatch(removeFavoriteDoctorSuccess(doctorId));
            message.success('Favorilerden çıkarıldı');
        } catch {
            message.error('İşlem başarısız');
        } finally {
            setRemoving(null);
        }
    };

    // Doktor detayına git
    const handleDoctorClick = (doctorId) => {
        navigate(`/dashboard/patient/doctors/${doctorId}`);
    };

    // Randevu al
    const handleBookAppointment = (doctorId) => {
        navigate(`/dashboard/patient/create-appointment?doctorId=${doctorId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <Spin size="large" tip="Favoriler yükleniyor...">
                    <div style={{ padding: 50 }} />
                </Spin>
            </div>
        );
    }

    return (
        <div className='max-h-screen max-w-[1400px] mx-auto'>
            <div className="mb-6">
                <Title level={3}>
                    <HeartFilled className="mr-2 text-red-500" />
                    Favori Doktorlarım
                </Title>
                <Text type="secondary">
                    {favoriteDoctors?.length || 0} favori doktorunuz var
                </Text>
            </div>

            {!favoriteDoctors || favoriteDoctors.length === 0 ? (
                <Card>
                    <Empty
                        description="Henüz favori doktorunuz yok"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button
                            type="primary"
                            onClick={() => navigate('/dashboard/patient/doctors')}
                        >
                            Doktorları Keşfet
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Row gutter={[16, 16]}>
                    {favoriteDoctors.map((doctor) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={doctor._id}>
                            <Card
                                hoverable
                                className="h-full transition-all duration-200 hover:shadow-lg relative"
                            >
                                {/* Favoriden Çıkar Butonu */}
                                <Popconfirm
                                    title="Favorilerden çıkarmak istediğinize emin misiniz?"
                                    onConfirm={() => handleRemoveFavorite(doctor._id)}
                                    okText="Evet"
                                    cancelText="Hayır"
                                >
                                    <Button
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        loading={removing === doctor._id}
                                        className="absolute top-2 right-2 z-10"
                                    />
                                </Popconfirm>

                                <div
                                    className="text-center cursor-pointer"
                                    onClick={() => handleDoctorClick(doctor._id)}
                                >
                                    <Avatar
                                        size={80}
                                        icon={<UserOutlined />}
                                        src={doctor.user?.avatar}
                                        className="mb-3"
                                    />
                                    <Title level={5} className="!mb-1">
                                        Dr. {doctor.user?.name || 'İsimsiz'}
                                    </Title>
                                    <Tag color="blue" className="mb-2">
                                        {doctor.speciality}
                                    </Tag>

                                    {/* Puan */}
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Rate
                                            disabled
                                            allowHalf
                                            value={doctor.rating || 0}
                                            style={{ fontSize: 14 }}
                                        />
                                        <Text type="secondary" className="text-sm">
                                            ({doctor.reviewCount || 0})
                                        </Text>
                                    </div>

                                    {/* Hasta sayısı */}
                                    {doctor.patientCount > 0 && (
                                        <Text type="secondary" className="text-sm block mb-3">
                                            {doctor.patientCount} hasta
                                        </Text>
                                    )}
                                </div>

                                <Button
                                    type="primary"
                                    icon={<CalendarOutlined />}
                                    block
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBookAppointment(doctor._id);
                                    }}
                                    className="mt-2"
                                >
                                    Randevu Al
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default Favorites;
