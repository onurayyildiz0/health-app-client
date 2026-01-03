import { useState, useEffect } from 'react';
import { 
    Card, Form, Input, Button, InputNumber, message, Spin, Row, Col, Typography, Select 
} from 'antd';
import { 
    IdcardOutlined, 
    BankOutlined, 
    ExperimentOutlined,
    SaveOutlined,
    HomeOutlined
} from '@ant-design/icons';
import doctorService from '../../api/doctorService'; 
import specialityService from '../../api/specialityService';
import locationService from '../../api/locationService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Türkçe karakter duyarlı string karşılaştırma yardımcısı
const normalizeString = (str) => {
    return str ? str.toLocaleLowerCase('tr-TR').trim() : '';
};

export default function DoctorInformations() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Alt yükleme durumları (UX için önemli)
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    const [specialities, setSpecialities] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    
    const [selectedProvId, setSelectedProvId] = useState(null);
    const [selectedDistId, setSelectedDistId] = useState(null);

    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [profileRes, specRes, provRes] = await Promise.all([
                doctorService.getMyDoctorProfile(),
                specialityService.getAllSpecialities(),
                locationService.getAllProvinces()
            ]);
            
            // Veri güvenliği için varsayılan boş dizi atamaları
            setSpecialities(specRes?.data || []);
            const provinceList = provRes?.data || [];
            setProvinces(provinceList);

            const data = profileRes?.data || profileRes;

            if (data) {
                form.setFieldsValue({
                    speciality: data.speciality?.id || data.speciality, // Obje veya ID gelebilir kontrolü
                    hospital: data.hospital,
                    experience: data.experience,
                    about: data.about,
                    location: data.location,
                });

                // --- Gelişmiş Lokasyon Eşleştirme ---
                if (data.province) {
                    // Normalize ederek arama yapıyoruz (İstanbul == Istanbul sorununu çözer)
                    const foundProv = provinceList.find(p => normalizeString(p.name) === normalizeString(data.province));
                    
                    if (foundProv) {
                        setSelectedProvId(foundProv.id);
                        form.setFieldsValue({ province: foundProv.id });

                        // İlçeleri Çek
                        try {
                            const distRes = await locationService.getProvinceDetails(foundProv.id);
                            // API yapısına göre esneklik: res.data.districts VEYA res.data
                            const districtList = distRes.data?.districts || distRes.data || [];
                            setDistricts(districtList);

                            if (data.district) {
                                const foundDist = districtList.find(d => normalizeString(d.name) === normalizeString(data.district));
                                if (foundDist) {
                                    setSelectedDistId(foundDist.id);
                                    form.setFieldsValue({ district: foundDist.id });

                                    // Mahalleleri Çek
                                    const neighRes = await locationService.getNeighborhoodsByDistrict(foundDist.id);
                                    const neighList = neighRes.data || []; // API yapısına dikkat
                                    setNeighborhoods(neighList);

                                    if (data.neighborhood) {
                                        const foundNeigh = neighList.find(n => normalizeString(n.name) === normalizeString(data.neighborhood));
                                        if (foundNeigh) {
                                            form.setFieldsValue({ neighborhood: foundNeigh.id });
                                        }
                                    }
                                }
                            }
                        } catch (locError) {
                            console.error("Lokasyon detayları çekilemedi:", locError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            message.error("Bilgiler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleProvinceChange = async (provId) => {
        setSelectedProvId(provId);
        form.setFieldsValue({ district: undefined, neighborhood: undefined });
        setDistricts([]);
        setNeighborhoods([]);
        setSelectedDistId(null);
        setLoadingDistricts(true); // Yükleniyor başlat

        try {
            const res = await locationService.getProvinceDetails(provId);
            setDistricts(res.data?.districts || res.data || []);
        } catch (err) {
            message.error("İlçeler yüklenemedi.");
        } finally {
            setLoadingDistricts(false); // Yükleniyor bitir
        }
    };

    const handleDistrictChange = async (distId) => {
        setSelectedDistId(distId);
        form.setFieldsValue({ neighborhood: undefined });
        setNeighborhoods([]);
        setLoadingNeighborhoods(true); // Yükleniyor başlat

        try {
            const res = await locationService.getNeighborhoodsByDistrict(distId);
            setNeighborhoods(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingNeighborhoods(false); // Yükleniyor bitir
        }
    };

    const onFinish = async (values) => {
        try {
            setSubmitting(true);

            // ID'den İsimlere Çevirme (Güvenli Erişim ile)
            const provObj = provinces.find(p => p.id === values.province);
            const distObj = districts.find(d => d.id === values.district);
            const neighObj = neighborhoods.find(n => n.id === values.neighborhood);

            const payload = {
                ...values,
                province: provObj?.name || null,
                district: distObj?.name || null,
                neighborhood: neighObj?.name || null,
            };

            await doctorService.updateDoctorInfo(payload);
            message.success("Bilgiler başarıyla güncellendi.");
        } catch (error) {
            message.error(error.response?.data?.message || "Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" tip="Profil yükleniyor..." />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Title level={2} className="!mb-1 !text-2xl md:!text-3xl text-gray-800">
                        <IdcardOutlined className="mr-3 text-purple-600" />
                        Doktor Bilgileri
                    </Title>
                    <Text type="secondary" className="text-base">
                        Uzmanlık, deneyim ve konum bilgilerinizi buradan güncelleyebilirsiniz.
                    </Text>
                </div>
            </div>

            <Card className="shadow-md rounded-xl border-t-4 border-t-purple-500" bodyStyle={{ padding: '32px' }}>
                <Form layout="vertical" form={form} onFinish={onFinish} requiredMark="optional">
                    <Row gutter={[24, 24]}>
                        
                        <Col span={24}><h3 className="text-gray-500 font-bold mb-4 border-b pb-2">Mesleki Bilgiler</h3></Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="speciality" label="Uzmanlık Alanı" rules={[{ required: true, message: 'Zorunlu' }]}>
                                <Select size="large" placeholder="Branş Seçin" showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {specialities.map(spec => <Option key={spec.id} value={spec.id}>{spec.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="hospital" label="Görev Yeri / Hastane" rules={[{ required: true, message: 'Zorunlu' }]}>
                                <Input size="large" prefix={<BankOutlined className="text-gray-400" />} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="experience" label="Deneyim (Yıl)" rules={[{ required: true, message: 'Zorunlu' }]}>
                                <InputNumber size="large" min={0} max={70} style={{ width: '100%' }} prefix={<ExperimentOutlined className="text-gray-400" />} />
                            </Form.Item>
                        </Col>

                        <Col span={24}><h3 className="text-gray-500 font-bold mb-4 mt-4 border-b pb-2">Lokasyon Bilgileri</h3></Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="province" label="İl" rules={[{ required: true, message: 'Seçiniz' }]}>
                                <Select size="large" placeholder="İl Seçiniz" onChange={handleProvinceChange} showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {provinces.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="district" label="İlçe" rules={[{ required: true, message: 'Seçiniz' }]}>
                                <Select 
                                    size="large" 
                                    placeholder="İlçe Seçiniz"
                                    loading={loadingDistricts} // Yükleniyor animasyonu eklendi
                                    disabled={!selectedProvId || loadingDistricts}
                                    onChange={handleDistrictChange}
                                    showSearch 
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                >
                                    {districts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={8}>
                            <Form.Item name="neighborhood" label="Mahalle" rules={[{ required: true, message: 'Seçiniz' }]}>
                                <Select 
                                    size="large"
                                    placeholder="Mahalle Seçiniz"
                                    loading={loadingNeighborhoods} // Yükleniyor animasyonu eklendi
                                    disabled={!selectedDistId || loadingNeighborhoods}
                                    showSearch
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                >
                                    {neighborhoods.map(n => <Option key={n.id} value={n.id}>{n.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="location" label="Açık Adres / Tarif" help="Sokak, bina no, kat veya yol tarifi bilgileri.">
                                <Input size="large" prefix={<HomeOutlined className="text-gray-400" />} />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="about" label="Hakkımda / Biyografi">
                                <TextArea rows={4} showCount maxLength={1000} className="!resize-none text-base" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="mb-0 mt-4 text-right">
                        <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={submitting} className="bg-purple-600 hover:bg-purple-500 shadow-md min-w-[150px]">
                            Bilgileri Kaydet
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}