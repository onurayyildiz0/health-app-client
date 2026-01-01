import { useState, useEffect } from 'react';
import { 
    Card, Form, Input, Button, InputNumber, message, Spin, Row, Col, Typography, Select 
} from 'antd';
import { 
    IdcardOutlined, 
    BankOutlined, 
    ExperimentOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import doctorService from '../../api/doctorService'; 
import specialityService from '../../api/specialityService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function DoctorInformations() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [specialities, setSpecialities] = useState([]);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Paralel istek: Profil ve Uzmanlıklar
            const [profileRes, specRes] = await Promise.all([
                doctorService.getMyDoctorProfile(),
                specialityService.getAllSpecialities()
            ]);
            
            setSpecialities(specRes.data || specRes || []);

            const data = profileRes.data || profileRes;
            if (data) {
                form.setFieldsValue({
                    // Eğer data.speciality bir nesne gelirse id'sini, int gelirse kendisini set et
                    speciality: typeof data.speciality === 'object' ? data.speciality.id : data.speciality,
                    hospital: data.hospital,
                    experience: data.experience,
                    about: data.about
                });
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

    const onFinish = async (values) => {
        try {
            setSubmitting(true);
            await doctorService.updateDoctorInfo(values);
            message.success("Bilgiler başarıyla güncellendi.");
            // Güncel veriyi tekrar çekmeye gerek yok, UI zaten güncel values ile senkron
        } catch (error) {
            message.error(error.response?.data?.message || "Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" tip="Bilgiler yükleniyor..." />
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
                        Uzmanlık, deneyim ve hastalarınıza kendinizi tanıtacağınız alanlar.
                    </Text>
                </div>
            </div>

            <Card 
                className="shadow-md rounded-xl border-t-4 border-t-purple-500"
                bodyStyle={{ padding: '32px' }}
            >
                <Form 
                    layout="vertical" 
                    form={form} 
                    onFinish={onFinish}
                    requiredMark="optional"
                >
                    <Row gutter={[24, 24]}>
                        {/* Uzmanlık Alanı - Select olarak güncellendi */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="speciality"
                                label={<span className="font-semibold text-gray-700">Uzmanlık Alanı</span>}
                                rules={[{ required: true, message: 'Lütfen uzmanlık alanınızı girin' }]}
                            >
                                <Select 
                                    size="large"
                                    placeholder="Branş Seçin"
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {specialities.map(spec => (
                                        <Option key={spec.id} value={spec.id}>
                                            {spec.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="hospital"
                                label={<span className="font-semibold text-gray-700">Görev Yeri / Hastane</span>}
                                rules={[{ required: true, message: 'Lütfen hastane bilgisi girin' }]}
                            >
                                <Input 
                                    size="large" 
                                    prefix={<BankOutlined className="text-gray-400" />} 
                                    placeholder="Örn: Merkez Devlet Hastanesi" 
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="experience"
                                label={<span className="font-semibold text-gray-700">Deneyim (Yıl)</span>}
                                rules={[{ required: true, message: 'Lütfen deneyim yılını girin' }]}
                            >
                                <InputNumber 
                                    size="large" 
                                    min={0} 
                                    max={70}
                                    style={{ width: '100%' }}
                                    prefix={<ExperimentOutlined className="text-gray-400" />} 
                                    placeholder="Örn: 5" 
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="about"
                                label={<span className="font-semibold text-gray-700">Hakkımda / Biyografi</span>}
                                help="Kendinizi, eğitiminizi ve yaklaşımınızı hastalarınıza kısaca tanıtın."
                            >
                                <TextArea 
                                    rows={6} 
                                    showCount 
                                    maxLength={1000}
                                    placeholder="Merhaba, ben Dr. ..." 
                                    className="!resize-none text-base"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="mb-0 mt-4 text-right">
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            size="large" 
                            icon={<SaveOutlined />} 
                            loading={submitting}
                            className="bg-purple-600 hover:bg-purple-500 shadow-md min-w-[150px]"
                        >
                            Bilgileri Kaydet
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}