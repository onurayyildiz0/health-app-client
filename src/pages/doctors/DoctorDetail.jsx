import { useState, useEffect, useMemo } from 'react';
import {
    Card, Row, Col, Avatar, Tag, Rate, Button, Spin,
    Typography, Space, message, Modal, Form, Input, Descriptions
} from 'antd';
import {
    UserOutlined, CalendarOutlined, StarFilled, HeartOutlined, HeartFilled,
    EnvironmentOutlined, MailOutlined, SafetyCertificateOutlined,
    ClockCircleOutlined, MedicineBoxOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

// Slices
import { fetchDoctorDetails, selectSelectedDoctor, selectDoctorReviews, selectDoctorLoading } from '../../store/slices/doctorSlice';
import { fetchDoctorReviews, submitReview } from '../../store/slices/reviewSlice';
import { addFavoriteDoctorSuccess, removeFavoriteDoctorSuccess, selectFavoriteDoctors } from '../../store/slices/userSlice';
import { selectUser } from '../../store/slices/authSlice';
import { fetchAllSpecialities, selectAllSpecialities } from '../../store/slices/specialitySlice';
import * as userService from '../../api/userService'; // Sadece spesifik user işlemleri için

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAYS_TR = { monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba', thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar' };

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const doctor = useSelector(selectSelectedDoctor);
    const reviews = useSelector(selectDoctorReviews);
    const loading = useSelector(selectDoctorLoading);
    const user = useSelector(selectUser);
    const favoriteDoctors = useSelector(selectFavoriteDoctors);
    const specialities = useSelector(selectAllSpecialities);

    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [parsedClocks, setParsedClocks] = useState(null);

    const isFavorite = Array.isArray(favoriteDoctors) && favoriteDoctors.some(d => d?.id === parseInt(id));
    const isOwnProfile = user?.role === 'doctor' && user.id === doctor?.user?.id;

    useEffect(() => {
        dispatch(fetchDoctorDetails(id));
        dispatch(fetchDoctorReviews(id));
        dispatch(fetchAllSpecialities());
    }, [id, dispatch]);

    useEffect(() => {
        if (doctor?.clocks) {
            if (typeof doctor.clocks === 'string') {
                try { setParsedClocks(JSON.parse(doctor.clocks)); } 
                catch { setParsedClocks({}); }
            } else {
                setParsedClocks(doctor.clocks);
            }
        }
    }, [doctor]);

    const handleToggleFavorite = async () => {
        if (!user) return navigate('/login');
        try {
            if (isFavorite) {
                await userService.removeFavoriteDoctor(id);
                dispatch(removeFavoriteDoctorSuccess(id));
                message.success('Favorilerden çıkarıldı');
            } else {
                await userService.addFavoriteDoctor(parseInt(id));
                dispatch(addFavoriteDoctorSuccess(doctor));
                message.success('Favorilere eklendi');
            }
        } catch {
            message.error('Favori işlemi başarısız.');
        }
    };

    const handleAddReview = async (values) => {
        try {
            setSubmitting(true);
            await dispatch(submitReview({ doctorId: parseInt(id), ...values }));
            message.success('Yorumunuz başarıyla eklendi');
            setIsReviewModalVisible(false);
            form.resetFields();
            dispatch(fetchDoctorReviews(id)); // Yenile
        } catch (err) {
            message.error(err.message || 'Yorum eklenemedi');
        } finally {
            setSubmitting(false);
        }
    };

    const getSpecialityName = () => {
        if (!doctor) return '';
        if (doctor.specialityNavigation?.name) return doctor.specialityNavigation.name;
        if (specialities.length > 0) {
            const found = specialities.find(s => s.id == doctor.speciality);
            if (found) return found.name;
        }
        return 'Uzman';
    };

    const renderClocks = useMemo(() => {
        if (!parsedClocks) return <Text type="secondary">Saat bilgisi bulunmuyor.</Text>;
        return DAYS_ORDER.map(dayKey => {
            const timeData = parsedClocks[dayKey];
            const isActive = timeData && timeData.start && timeData.end;
            return (
                <div key={dayKey} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="font-medium text-gray-600 w-24">{DAYS_TR[dayKey]}</span>
                    {isActive ? <Tag color="blue" className="m-0 font-medium">{timeData.start} - {timeData.end}</Tag> : <Tag color="red" className="m-0">Kapalı</Tag>}
                </div>
            );
        });
    }, [parsedClocks]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" tip="Yükleniyor..." /></div>;
    if (!doctor) return <div className="flex justify-center mt-20"><Text>Doktor bulunamadı.</Text></div>;

    return (
        <div className="min-h-screen bg-gray-50/50 py-8">
            <div className="max-w-7xl mx-auto gap-4 px-4 sm:px-6">
                <Card className="shadow-lg border-0 rounded-2xl mb-8 overflow-hidden">
                    <div className="h-1/2 bg-gradient-to-r from-blue-600 to-indigo-400 absolute top-0 left-0 w-full opacity-90"></div>
                    <div className="relative pt-12 px-4 sm:px-8 pb-4">
                        <Row gutter={[32, 24]} align="middle">
                            <Col xs={24} md={6} lg={5} className="text-center">
                                <div className="relative inline-block">
                                    <Avatar size={160} src={doctor.user?.avatar} icon={<UserOutlined />} className="border-4 border-white shadow-xl bg-gray-200" />
                                    {doctor.isVerified && <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md"><SafetyCertificateOutlined className="text-2xl text-blue-500 block" /></div>}
                                </div>
                            </Col>
                            <Col xs={24} md={18} lg={19}>
                                <div className="mt-4 md:mt-0 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                                        <div><Title level={2} className="!mb-0 !mt-2">Dr. {doctor.user?.name}</Title><Text type="secondary" className="text-lg block mb-2">{getSpecialityName()} Uzmanı</Text></div>
                                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 mt-2 md:mt-0">
                                            <div className="text-center"><div className="flex items-center gap-1 text-yellow-400"><StarFilled /><span className="text-gray-800 font-bold text-lg">{doctor.rating ? doctor.rating.toFixed(1) : "0.0"}</span></div><Text type="secondary" className="text-xs">{doctor.reviewCount} Değerlendirme</Text></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                                        <Tag icon={<EnvironmentOutlined />} color="cyan">{doctor.hospital || 'Klinik belirtilmemiş'}</Tag>
                                        <Tag icon={<MedicineBoxOutlined />} color="purple">{doctor.experience ? `${doctor.experience} Yıl Deneyim` : 'Deneyim belirtilmemiş'}</Tag>
                                    </div>
                                    <Space size="middle" className="w-full justify-center md:justify-start">
                                        {!isOwnProfile && (
                                            <>
                                                <Button type="primary" size="large" icon={<CalendarOutlined />} className="bg-blue-600 hover:bg-blue-500 px-8 h-12 rounded-lg" onClick={() => navigate(`/dashboard/patient/create-appointment?doctorId=${id}`)}>Randevu Al</Button>
                                                {user?.role === 'patient' && <Button size="large" className="h-12 rounded-lg" icon={isFavorite ? <HeartFilled className="text-red-500" /> : <HeartOutlined />} onClick={handleToggleFavorite}>{isFavorite ? 'Favorilerde' : 'Favorile'}</Button>}
                                            </>
                                        )}
                                        {isOwnProfile && <Button type="default" size="large" onClick={() => navigate('/dashboard/doctor/settings')}>Profili Düzenle</Button>}
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card title="Hakkında" className="top-8 shadow-sm border-0 rounded-xl overflow-hidden" headStyle={{ borderBottom: '1px solid #f0f0f0' }} bodyStyle={{ padding: '24px' }}>
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-1/3 lg:w-1/2 border-b border-gray-200 md:border-b-0 md:border-r md:pr-6 pb-6 md:pb-0 mb-6 md:mb-0 flex-shrink-0">
                                    <div className="bg-gray-50 p-4 rounded-lg h-full">
                                        <Descriptions column={1} size="small" colon={false} layout="vertical">
                                            <Descriptions.Item label={<span className="text-gray-500 font-medium text-xs uppercase tracking-wide">İletişim</span>}><span className="flex items-start gap-2 text-gray-700"><MailOutlined className="text-blue-500 mt-1" /><span className="break-all text-sm font-medium">{doctor.user?.email}</span></span></Descriptions.Item>
                                            <Descriptions.Item label={<span className="text-gray-500 font-medium text-xs uppercase tracking-wide mt-4 block">Konum</span>}><span className="flex items-start gap-2 text-gray-700"><EnvironmentOutlined className="text-red-500 mt-1" /><span className="text-sm font-medium">{doctor.fullLocation || doctor.location || 'Konum Bilgisi Yok'}</span></span></Descriptions.Item>
                                            <Descriptions.Item className="mt-4 pt-4 border-t border-gray-200"><div className="flex flex-col"><span className="text-xs text-gray-500 mb-1">Muayene Ücreti</span><span className="font-bold text-xl text-green-600">{doctor.consultationFee ? `₺${doctor.consultationFee}` : 'Belirtilmemiş'}</span></div></Descriptions.Item>
                                        </Descriptions>
                                    </div>
                                </div>
                                <div className="flex-1 md:pl-6">
                                    <h4 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">Doktor Hakkında</h4>
                                    <Paragraph className="text-gray-600 leading-7 text-base text-justify" ellipsis={false}>{doctor.about || <span className="text-gray-400 italic">Bu doktor henüz biyografi eklememiş.</span>}</Paragraph>
                                </div>
                            </div>
                        </Card>
                        <Card className="shadow-sm border-0 rounded-xl top-16" title={<span className="text-lg font-semibold">Hasta Değerlendirmeleri ({reviews?.length || 0})</span>} extra={user?.role === 'patient' && !isOwnProfile && <Button type="link" onClick={() => setIsReviewModalVisible(true)}>Değerlendirme Yaz</Button>}>
                            {reviews && reviews.length > 0 ? (
                                <div className="flex flex-col gap-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-white">
                                            <div className="flex items-start gap-4"><Avatar src={review.patient?.avatar} icon={<UserOutlined />} className="bg-blue-100 text-blue-600 mt-1" /><div className="flex-1"><div className="flex justify-between items-center mb-1"><Text strong>{review.patient?.name || 'Anonim Hasta'}</Text><Text type="secondary" className="text-xs">{dayjs(review.createdAt).format('DD.MM.YYYY')}</Text></div><Rate disabled value={review.rating} style={{ fontSize: 14 }} className="mb-2 block" /><Paragraph className="text-gray-600 mb-0">{review.comment}</Paragraph></div></div><div className="border-b border-gray-100 mt-4 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : <div className="text-center py-10 text-gray-400"><MedicineBoxOutlined style={{ fontSize: 32, marginBottom: 8 }} /><p>Henüz yorum yapılmamış.</p></div>}
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}><Card title={<><ClockCircleOutlined /> Çalışma Saatleri</>} className="shadow-sm border-0 rounded-xl sticky top-8"><div className="flex flex-col">{renderClocks}</div><div className="mt-4 pt-4 border-t border-gray-100"><Text type="secondary" className="text-xs">* Resmi tatillerde çalışma saatleri değişiklik gösterebilir.</Text></div></Card></Col>
                </Row>
            </div>
            <Modal title="Doktoru Değerlendir" open={isReviewModalVisible} onCancel={() => setIsReviewModalVisible(false)} footer={null} centered>
                <Form form={form} layout="vertical" onFinish={handleAddReview}>
                    <Form.Item name="rating" label="Puanınız" rules={[{ required: true, message: 'Lütfen puan verin' }]}><Rate className="text-2xl" /></Form.Item>
                    <Form.Item name="comment" label="Yorumunuz" rules={[{ required: true, message: 'Lütfen yorum yazın' }, { min: 5, message: 'Yorum en az 5 karakter olmalıdır' }]}><TextArea rows={4} placeholder="Deneyiminizi paylaşın..." maxLength={500} showCount /></Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting} block size="large">Yorumu Gönder</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default DoctorDetail;