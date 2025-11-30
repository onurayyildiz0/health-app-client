import { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Avatar,
    Tag,
    Rate,
    Button,
    Tabs,
    Empty,
    Spin,
    Typography,
    Divider,
    Space,
    message,
    Modal,
    Form,
    Input,
    DatePicker,
    TimePicker
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    StarFilled,
    HeartOutlined,
    HeartFilled,
    ClockCircleOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import * as doctorService from '../../api/doctorService';
import * as reviewService from '../../api/reviewService';
import * as userService from '../../api/userService';
import {
    fetchDoctorByIdStart,
    fetchDoctorByIdSuccess,
    fetchDoctorByIdFailure,
    fetchDoctorReviewsSuccess,
    selectSelectedDoctor,
    selectDoctorReviews,
    selectDoctorLoading
} from '../../store/slices/doctorSlice';
import {
    addFavoriteDoctorSuccess,
    removeFavoriteDoctorSuccess,
    selectFavoriteDoctors
} from '../../store/slices/userSlice';
import { selectUser } from '../../store/slices/authSlice';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const doctor = useSelector(selectSelectedDoctor);
    const reviews = useSelector(selectDoctorReviews);
    const loading = useSelector(selectDoctorLoading);
    const user = useSelector(selectUser);
    const favoriteDoctors = useSelector(selectFavoriteDoctors);

    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [reviewForm] = Form.useForm();
    const [submittingReview, setSubmittingReview] = useState(false);

    // Favoride mi kontrol et
    const isFavorite = Array.isArray(favoriteDoctors) && favoriteDoctors.some(d => d?._id === id);

    // Doktor detayını yükle
    useEffect(() => {
        const fetchDoctorDetail = async () => {
            try {
                dispatch(fetchDoctorByIdStart());
                const response = await doctorService.getDoctorById(id);
                dispatch(fetchDoctorByIdSuccess(response.data || response));

                // Yorumları da yükle
                const reviewsResponse = await reviewService.getReviewsByDoctor(id);
                dispatch(fetchDoctorReviewsSuccess(reviewsResponse.data || reviewsResponse));
            } catch (err) {
                dispatch(fetchDoctorByIdFailure(err.message));
                message.error('Doktor bilgileri yüklenirken hata oluştu');
            }
        };

        fetchDoctorDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Favorilere ekle/çıkar
    const handleToggleFavorite = async () => {
        if (!user) {
            message.warning('Favori eklemek için giriş yapmalısınız');
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                await userService.removeFavoriteDoctor(id);
                dispatch(removeFavoriteDoctorSuccess(id));
                message.success('Favorilerden çıkarıldı');
            } else {
                const response = await userService.addFavoriteDoctor(id);
                // Backend'den gelen doktor objesini Redux'a ekle
                const doctorData = response.data || response;
                // Eğer backend sadece ID dönüyorsa, mevcut doctor objesini kullan
                const favoriteDoctor = doctorData.doctor || doctor;
                dispatch(addFavoriteDoctorSuccess(favoriteDoctor));
                message.success('Favorilere eklendi');
            }
        } catch (err) {
            console.error('Favori toggle error:', err);
            message.error(err.message || 'İşlem başarısız');
        }
    };

    // Randevu al
    const handleBookAppointment = () => {
        if (!user) {
            message.warning('Randevu almak için giriş yapmalısınız');
            navigate('/login');
            return;
        }
        navigate(`/dashboard/patient/create-appointment?doctorId=${id}`);
    };

    const handleDeleteReview = (reviewId) => {
        Modal.confirm({
            title: 'Değerlendirmeyi Sil',
            icon: <ExclamationCircleOutlined />,
            content: 'Bu değerlendirmeyi silmek istediğinize emin misiniz?',
            okText: 'Evet',
            cancelText: 'Hayır',
            onOk: async () => {
                try {
                    await reviewService.deleteReview(reviewId);
                    message.success('Değerlendirme silindi');

                    // 1. Yorumları güncelle (Listeden gitmesi için)
                    const reviewsResponse = await reviewService.getReviewsByDoctor(id);
                    dispatch(fetchDoctorReviewsSuccess(reviewsResponse.data || reviewsResponse));

                    // 2. Doktor puanını güncelle (Yıldızların değişmesi için)
                    const doctorResponse = await doctorService.getDoctorById(id);
                    dispatch(fetchDoctorByIdSuccess(doctorResponse.data || doctorResponse));

                } catch (err) {
                    message.error(err.message || 'Silme işlemi başarısız');
                }
            }
        });
    };

    // Değerlendirme ekle
    // Değerlendirme ekle
    const handleAddReview = async (values) => {
        try {
            setSubmittingReview(true);
            await reviewService.addReview({
                doctorId: id,
                rating: values.rating,
                comment: values.comment
            });

            // 1. Yorumları yeniden yükle (Burası sende zaten vardı)
            const reviewsResponse = await reviewService.getReviewsByDoctor(id);
            dispatch(fetchDoctorReviewsSuccess(reviewsResponse.data || reviewsResponse));

            // 2. EKLENEN KISIM: Doktor detaylarını (Puan ve Sayısını) da yeniden yükle
            // Backend'in yeni ortalamayı hesaplamış halini çekmemiz lazım.
            const doctorResponse = await doctorService.getDoctorById(id);
            dispatch(fetchDoctorByIdSuccess(doctorResponse.data || doctorResponse));

            message.success('Değerlendirmeniz eklendi');
            setIsReviewModalVisible(false);
            reviewForm.resetFields();
        } catch (err) {
            message.error(err.message || 'Değerlendirme eklenemedi');
        } finally {
            setSubmittingReview(false);
        }
    };

    // Çalışma günlerini formatla
    const getWorkingDays = () => {
        if (!doctor?.clocks) return [];

        const days = {
            monday: 'Pazartesi',
            tuesday: 'Salı',
            wednesday: 'Çarşamba',
            thursday: 'Perşembe',
            friday: 'Cuma',
            saturday: 'Cumartesi',
            sunday: 'Pazar'
        };

        return Object.entries(doctor.clocks)
            .filter(([, value]) => value && value.start && value.end)
            .map(([day, time]) => ({
                day: days[day],
                time: `${time.start} - ${time.end}`
            }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Doktor bilgileri yüklen iyor...">
                    <div style={{ padding: 50 }} />
                </Spin>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Empty description="Doktor bulunamadı">
                    <Button type="primary" onClick={() => navigate('/dashboard/patient/doctors')}>
                        Doktor Listesine Dön
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Profil Kartı */}
                    <Card className="mb-6">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={8} xl={6} className="text-center">
                                <Avatar
                                    size={150}
                                    icon={<UserOutlined />}
                                    src={doctor.user?.avatar}
                                    className="mb-4"
                                />
                                <Title level={3} className="!mb-2">
                                    Dr. {doctor.user?.name}
                                </Title>
                                <Tag color="blue" className="text-lg px-4 py-1">
                                    {doctor.speciality}
                                </Tag>

                                <div className="flex items-center justify-center gap-2 my-4">
                                    <Rate
                                        disabled
                                        allowHalf
                                        value={doctor.rating || 0}
                                        style={{ fontSize: 20 }}
                                    />
                                    <Text className="text-lg">
                                        {doctor.rating?.toFixed(1) || '0.0'} ({doctor.reviewCount || 0} değerlendirme)
                                    </Text>
                                </div>

                                <Space direction="vertical" className="w-full" size="middle">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<CalendarOutlined />}
                                        onClick={handleBookAppointment}
                                        block
                                    >
                                        Randevu Al
                                    </Button>
                                    {user?.role === 'patient' && (
                                        <Button
                                            size="large"
                                            icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                                            onClick={handleToggleFavorite}
                                            danger={isFavorite}
                                            block
                                        >
                                            {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                        </Button>
                                    )}
                                </Space>
                            </Col>

                            <Col xs={24} md={16} xl={18}>
                                <Title level={4}>Hakkında</Title>
                                <Paragraph>
                                    {doctor.bio || 'Henüz bir biyografi eklenmemiş.'}
                                </Paragraph>

                                <Divider />

                                <Title level={4}>İletişim Bilgileri</Title>
                                <Space direction="vertical" size="small">
                                    {doctor.user?.email && (
                                        <Text>
                                            <MailOutlined /> {doctor.user.email}
                                        </Text>
                                    )}
                                    {doctor.user?.phone && (
                                        <Text>
                                            <PhoneOutlined /> {doctor.user.phone}
                                        </Text>
                                    )}
                                    {doctor.address && (
                                        <Text>
                                            <EnvironmentOutlined /> {doctor.address}
                                        </Text>
                                    )}
                                </Space>

                                {getWorkingDays().length > 0 && (
                                    <>
                                        <Divider />
                                        <Title level={4}>
                                            <ClockCircleOutlined /> Çalışma Saatleri
                                        </Title>
                                        <Row gutter={[16, 8]}>
                                            {getWorkingDays().map((item, index) => (
                                                <Col span={12} key={index}>
                                                    <Text strong>{item.day}:</Text> {item.time}
                                                </Col>
                                            ))}
                                        </Row>
                                    </>
                                )}
                            </Col>
                        </Row>
                    </Card>

                    {/* Değerlendirmeler */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <Title level={4} className="!mb-0">
                                Değerlendirmeler ({reviews?.length || 0})
                            </Title>
                            {user?.role === 'patient' && (
                                <Button
                                    type="primary"
                                    icon={<StarFilled />}
                                    onClick={() => setIsReviewModalVisible(true)}
                                >
                                    Değerlendirme Yap
                                </Button>
                            )}
                        </div>

                        {reviews && reviews.length > 0 ? (
                            <Space direction="vertical" className="w-full" size="large">
                                {reviews.map((review) => (
                                    <Card key={review._id} size="small" extra={
                                        (user?._id === review.patient?._id || user?.role === 'admin') && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteReview(review._id)}
                                            />
                                        )
                                    }>
                                      
                                        <div className="flex gap-3">
                                            <Avatar
                                                icon={<UserOutlined />}
                                                src={review.patient?.avatar}
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <Text strong>{review.patient?.name}</Text>
                                                        <br />
                                                        <Rate
                                                            disabled
                                                            value={review.rating}
                                                            style={{ fontSize: 14 }}
                                                        />
                                                    </div>
                                                    <Text type="secondary" className="text-sm">
                                                        {dayjs(review.createdAt).format('DD.MM.YYYY')}
                                                    </Text>
                                                </div>
                                                {review.comment && (
                                                    <Paragraph className="mt-2 mb-0">
                                                        {review.comment}
                                                    </Paragraph>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </Space>
                        ) : (
                            <Empty description="Henüz değerlendirme yapılmamış" />
                        )}
                    </Card>
                </div>
            </div>

            {/* Değerlendirme Modal */}
            <Modal
                title="Değerlendirme Yap"
                open={isReviewModalVisible}
                onCancel={() => setIsReviewModalVisible(false)}
                footer={null}
            >
                <Form
                    form={reviewForm}
                    layout="vertical"
                    onFinish={handleAddReview}
                >
                    <Form.Item
                        name="rating"
                        label="Puan"
                        rules={[{ required: true, message: 'Lütfen puan verin' }]}
                    >
                        <Rate />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Yorumunuz"
                        rules={[{ required: true, message: 'Lütfen yorum yazın' }]}
                    >
                        <TextArea rows={4} placeholder="Deneyiminizi paylaşın..." />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space>
                            <Button type="primary" htmlType="submit" loading={submittingReview}>
                                Gönder
                            </Button>
                            <Button onClick={() => setIsReviewModalVisible(false)}>
                                İptal
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>


    );
};

export default DoctorDetail;
