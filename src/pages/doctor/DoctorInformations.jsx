import { useState, useEffect } from 'react';
import {
    Card, Form, Input, Button, InputNumber, message, Spin, Row, Col,
    Typography, Select, List, Rate, Avatar, Tag, Empty
} from 'antd';
import {
    IdcardOutlined, BankOutlined, SaveOutlined, HomeOutlined,
    UserOutlined, MessageOutlined, ClockCircleOutlined, StarFilled
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';


import {
    fetchMyDoctorProfile, updateDoctorInfo, selectCurrentDoctorProfile, selectDoctorLoading
} from '../../store/slices/doctorSlice';
import {
    fetchAllSpecialities, selectAllSpecialities
} from '../../store/slices/specialitySlice';
import {
    fetchProvinces, fetchDistricts, fetchNeighborhoods, selectProvinces, selectDistricts, selectNeighborhoods, clearDistrictsAndNeighborhoods, clearNeighborhoods
} from '../../store/slices/locationSlice';
import {
    fetchDoctorReviews, selectAllReviews, selectReviewLoading
} from '../../store/slices/reviewSlice';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const normalizeString = (str) => str ? str.toLocaleLowerCase('tr-TR').trim() : '';

export default function DoctorInformation() {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    
    const profile = useSelector(selectCurrentDoctorProfile);
    const docLoading = useSelector(selectDoctorLoading);
    const specialities = useSelector(selectAllSpecialities);
    const provinces = useSelector(selectProvinces);
    const districts = useSelector(selectDistricts);
    const neighborhoods = useSelector(selectNeighborhoods);

    
    const reviews = useSelector(selectAllReviews);
    const reviewsLoading = useSelector(selectReviewLoading);

    const [submitting, setSubmitting] = useState(false);
    const [selectedProvId, setSelectedProvId] = useState(null);
    const [selectedDistId, setSelectedDistId] = useState(null);

    
    useEffect(() => {
        dispatch(fetchMyDoctorProfile());
        dispatch(fetchAllSpecialities());
        dispatch(fetchProvinces());
    }, [dispatch]);

    
    useEffect(() => {
        if (profile) {
            form.setFieldsValue({
                speciality: profile.speciality?.id || profile.speciality,
                hospital: profile.hospital,
                experience: profile.experience,
                about: profile.about,
                location: profile.location,
            });

            if (profile.id) {
                dispatch(fetchDoctorReviews(profile.id));
            }

            const matchLocation = async () => {
                if (profile.province && provinces.length > 0) {
                    const foundProv = provinces.find(p => normalizeString(p.name) === normalizeString(profile.province));
                    if (foundProv) {
                        setSelectedProvId(foundProv.id);
                        form.setFieldsValue({ province: foundProv.id });
                        await dispatch(fetchDistricts(foundProv.id));
                    }
                }
            };
            matchLocation();
        }
    }, [profile, provinces, dispatch, form]);

    
    useEffect(() => {
        if (profile?.district && districts.length > 0 && selectedProvId) {
            const foundDist = districts.find(d => normalizeString(d.name) === normalizeString(profile.district));
            if (foundDist) {
                setSelectedDistId(foundDist.id);
                form.setFieldsValue({ district: foundDist.id });
                dispatch(fetchNeighborhoods(foundDist.id));
            }
        }
    }, [districts, profile, selectedProvId, dispatch, form]);

    
    useEffect(() => {
        if (profile?.neighborhood && neighborhoods.length > 0 && selectedDistId) {
            const foundNeigh = neighborhoods.find(n => normalizeString(n.name) === normalizeString(profile.neighborhood));
            if (foundNeigh) form.setFieldsValue({ neighborhood: foundNeigh.id });
        }
    }, [neighborhoods, profile, selectedDistId, form]);

    const handleProvinceChange = (val) => {
        setSelectedProvId(val);
        form.setFieldsValue({ district: undefined, neighborhood: undefined });
        setSelectedDistId(null);
        dispatch(clearDistrictsAndNeighborhoods());
        if (val) dispatch(fetchDistricts(val));
    };

    const handleDistrictChange = (val) => {
        setSelectedDistId(val);
        form.setFieldsValue({ neighborhood: undefined });
        dispatch(clearNeighborhoods());
        if (val) dispatch(fetchNeighborhoods(val));
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const provObj = provinces.find(p => p.id === values.province);
            const distObj = districts.find(d => d.id === values.district);
            const neighObj = neighborhoods.find(n => n.id === values.neighborhood);

            const payload = {
                ...values,
                province: provObj?.name,
                district: distObj?.name,
                neighborhood: neighObj?.name,
            };

            await dispatch(updateDoctorInfo(payload));
            message.success('Bilgiler güncellendi');
        } catch {
            message.error('Güncelleme başarısız');
        } finally {
            setSubmitting(false);
        }
    };

    if (docLoading && !profile) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

    
    const averageRating = reviews && reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="p-4 flex gap-2 flex-col md:p-6 max-w-[1000px] mx-auto">
            <div className="mb-8">
                <Title level={2}>Doktor Paneli</Title>
                <Text type="secondary">Profilinizi düzenleyin ve hasta geri bildirimlerini inceleyin.</Text>
            </div>

            {/* FORM KISMI */}
            <Card className="shadow-md rounded-xl border-t-4 border-t-purple-500 mb-8" style={{ padding: '16px' }}>
                <div className="flex gap-2 mb-6 border-b pb-2">
                    <IdcardOutlined className="text-xl text-purple-600" />
                    <h3 className="text-gray-700 pt-2 font-bold text-lg m-0">Profil Bilgileri</h3>
                </div>

                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Row gutter={[24, 24]}>
                        <Col span={24}><Text strong className="text-gray-500">Mesleki Bilgiler</Text></Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="speciality" label="Branş" rules={[{ required: true }]}>
                                <Select showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {specialities.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}><Form.Item name="hospital" label="Hastane" rules={[{ required: true }]}><Input prefix={<BankOutlined />} /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="experience" label="Deneyim (Yıl)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>

                        <Col span={24} className="mt-2"><Text strong className="text-gray-500">Lokasyon Bilgileri</Text></Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="province" label="İl" rules={[{ required: true }]}>
                                <Select showSearch onChange={handleProvinceChange} filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {provinces.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="district" label="İlçe" rules={[{ required: true }]}>
                                <Select showSearch onChange={handleDistrictChange} disabled={!selectedProvId} filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {districts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="neighborhood" label="Mahalle" rules={[{ required: true }]}>
                                <Select showSearch disabled={!selectedDistId} filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {neighborhoods.map(n => <Option key={n.id} value={n.id}>{n.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}><Form.Item name="location" label="Açık Adres"><Input prefix={<HomeOutlined />} /></Form.Item></Col>
                        <Col span={24}><Form.Item name="about" label="Hakkımda"><TextArea rows={4} showCount maxLength={1000} /></Form.Item></Col>
                    </Row>
                    <div className="text-right mt-4"><Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={submitting}>Kaydet</Button></div>
                </Form>
            </Card>

            {/* YORUMLAR KISMI */}
            <Card
                className="shadow-md rounded-xl border-t-4 border-t-yellow-500"
                style={{ padding: '16px' }}
                title={
                    
                    <div className="flex items-center gap-3 pt-2 mb-6 border-b pb-2">
                        <MessageOutlined className="text-xl text-yellow-600" />
                        <h3 className="text-gray-700 font-bold text-lg m-0">Hasta Değerlendirmeleri</h3>
                        
                        {/* Puan Tag'i buraya taşındı */}
                        {reviews && reviews.length > 0 && (
                            <Tag color="gold" className="ml-2 flex items-center gap-1 rounded-full border-0 px-3 py-1">
                                <StarFilled style={{ fontSize: '12px' }} />
                                <span className="font-bold text-base">{averageRating}</span> 
                                <span className="opacity-80">/ 5</span>
                                <span className="text-xs ml-1 opacity-70">({reviews.length} yorum)</span>
                            </Tag>
                        )}
                    </div>
                }
            >
                <div className="p-6 bg-white rounded-b-xl">
                    {reviewsLoading ? (
                        <div className="flex justify-center py-10"><Spin tip="Yorumlar yükleniyor..." /></div>
                    ) : (
                        <List
                            itemLayout="vertical"
                            size="large"
                            pagination={{
                                pageSize: 5,
                                align: 'center',
                                showSizeChanger: false
                            }}
                            dataSource={reviews}
                            locale={{ emptyText: <Empty description="Henüz değerlendirme almadınız." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                            renderItem={(item) => (
                                <List.Item
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors rounded-lg px-4 border-b last:border-0"
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={item.patient?.avatar}
                                                icon={<UserOutlined />}
                                                className="bg-blue-100 text-blue-500"
                                                size="large"
                                            />
                                        }
                                        title={
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                <span className="font-semibold text-gray-800">{item.patient?.name || 'Misafir Hasta'}</span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1 sm:mt-0">
                                                    <ClockCircleOutlined />
                                                    {dayjs(item.createdAt).format('DD MMMM YYYY')}
                                                </span>
                                            </div>
                                        }
                                        description={
                                            <div className="mt-1">
                                                <Rate disabled allowHalf value={item.rating} style={{ fontSize: 14 }} className="text-yellow-400" />
                                            </div>
                                        }
                                    />
                                    <Paragraph
                                        className="text-gray-600 pl-12 mt-0"
                                        ellipsis={{ rows: 3, expandable: true, symbol: 'devamı' }}
                                    >
                                        {item.comment}
                                    </Paragraph>
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}