import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, InputNumber, message, Spin, Row, Col, Typography, Select } from 'antd';
import { IdcardOutlined, BankOutlined, ExperimentOutlined, SaveOutlined, HomeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

// Slices
import { fetchMyDoctorProfile, updateDoctorInfo, selectCurrentDoctorProfile, selectDoctorLoading } from '../../store/slices/doctorSlice';
import { fetchAllSpecialities, selectAllSpecialities } from '../../store/slices/specialitySlice';
import { fetchProvinces, fetchDistricts, fetchNeighborhoods, selectProvinces, selectDistricts, selectNeighborhoods, clearDistrictsAndNeighborhoods, clearNeighborhoods } from '../../store/slices/locationSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const normalizeString = (str) => str ? str.toLocaleLowerCase('tr-TR').trim() : '';

export default function DoctorInformation() {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    // Selectors
    const profile = useSelector(selectCurrentDoctorProfile);
    const docLoading = useSelector(selectDoctorLoading);
    const specialities = useSelector(selectAllSpecialities);
    const provinces = useSelector(selectProvinces);
    const districts = useSelector(selectDistricts);
    const neighborhoods = useSelector(selectNeighborhoods);

    const [submitting, setSubmitting] = useState(false);
    const [selectedProvId, setSelectedProvId] = useState(null);
    const [selectedDistId, setSelectedDistId] = useState(null);

    // 1. Initial Fetch
    useEffect(() => {
        dispatch(fetchMyDoctorProfile());
        dispatch(fetchAllSpecialities());
        dispatch(fetchProvinces());
    }, [dispatch]);

    // 2. Profil Yüklendiğinde Formu Doldur ve Lokasyonları Eşleştir
    useEffect(() => {
        if (profile) {
            form.setFieldsValue({
                speciality: profile.speciality?.id || profile.speciality,
                hospital: profile.hospital,
                experience: profile.experience,
                about: profile.about,
                location: profile.location,
            });

            // Lokasyon Eşleştirme (Karmaşık kısım)
            const matchLocation = async () => {
                if (profile.province && provinces.length > 0) {
                    const foundProv = provinces.find(p => normalizeString(p.name) === normalizeString(profile.province));
                    if (foundProv) {
                        setSelectedProvId(foundProv.id);
                        form.setFieldsValue({ province: foundProv.id });
                        
                        // İlçeleri çek (Thunk kullanmadan direkt servisten de çekilebilir ama slice yapısına sadık kalalım,
                        // fakat burada zincirleme fetch gerekiyor, o yüzden await ile dispatch ediyoruz)
                        // NOT: Slice'daki thunk'lar promise döndürmüyorsa (normalde döndürür), await çalışmayabilir.
                        // Redux Toolkit thunk'ları promise döndürür.
                        
                        await dispatch(fetchDistricts(foundProv.id)); // İlçeleri yükle
                        // İlçelerin state'e düşmesini beklemek yerine, districts selector'ı güncellenince aşağıdaki useEffect çalışır.
                        // Ancak burada manuel fetch mantığı ile devam edelim:
                    }
                }
            };
            matchLocation();
        }
    }, [profile, provinces, dispatch, form]);

    // 3. İlçeler yüklendiğinde profildeki ilçe ile eşleştir
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

    // 4. Mahalleler yüklendiğinde eşleştir
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

    return (
        <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
            <div className="mb-8"><Title level={2}>Doktor Bilgileri</Title><Text type="secondary">Uzmanlık ve lokasyon bilgilerinizi güncelleyin.</Text></div>
            <Card className="shadow-md rounded-xl border-t-4 border-t-purple-500" bodyStyle={{ padding: '32px' }}>
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Row gutter={[24, 24]}>
                        <Col span={24}><h3 className="text-gray-500 font-bold mb-4 border-b pb-2">Mesleki</h3></Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="speciality" label="Branş" rules={[{ required: true }]}>
                                <Select showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {specialities.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}><Form.Item name="hospital" label="Hastane" rules={[{ required: true }]}><Input prefix={<BankOutlined />} /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="experience" label="Deneyim (Yıl)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>

                        <Col span={24}><h3 className="text-gray-500 font-bold mb-4 mt-4 border-b pb-2">Lokasyon</h3></Col>
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
        </div>
    );
}