import { useState, useEffect } from 'react';
import { Card, Form, DatePicker, Input, Button, Table, message, Spin, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { addUnavailableDate, getMyDoctorProfile } from '../api/doctorService'; // Dosya yolunu kendine göre ayarla

const { RangePicker } = DatePicker;

export default function DoctorTimeOff() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [form] = Form.useForm();

    // Sayfa açılınca mevcut izinleri getir
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getMyDoctorProfile();
            // Backend'den unavailableDates array'i gelmeli
            if (res.unavailableDates) {
                setUnavailableDates(res.unavailableDates);
            }
        } catch {
            message.error("Veriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Form gönderilince çalışacak fonksiyon
    const onFinish = async (values) => {
        try {
            setSubmitting(true);

            // Antd RangePicker dayjs objesi döner, string'e çevirmeliyiz
            const payload = {
                startDate: values.dates[0].format('YYYY-MM-DD'),
                endDate: values.dates[1].format('YYYY-MM-DD'),
                reason: values.reason
            };

            await addUnavailableDate(payload);

            message.success("İzin tarihi başarıyla eklendi.");
            form.resetFields();
            fetchData(); // Listeyi güncelle
        } catch (error) {
            message.error(error.response?.data?.message || "Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    // Tablo kolonları
    const columns = [
        {
            title: 'Başlangıç',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (text) => dayjs(text).format('DD.MM.YYYY'),
        },
        {
            title: 'Bitiş',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (text) => dayjs(text).format('DD.MM.YYYY'),
        },
        {
            title: 'Sebep',
            dataIndex: 'reason',
            key: 'reason',
        }
    ];

    return (
        <Card 
            title={
                <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-blue-500" />
                    <span>İzin Dönemlerim</span>
                </div>
            } 
            className="max-w-3xl mx-auto mt-8 shadow-md"
        >

            {/* --- EKLEME FORMU --- */}
            <Card type="inner" title="Yeni İzin Ekle" className="mb-6 bg-gray-50">
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="dates"
                            label="Tarih Aralığı"
                            rules={[{ required: true, message: 'Lütfen tarih seçiniz' }]}
                        >
                            <RangePicker
                                className="w-full"
                                placeholder={['Başlangıç', 'Bitiş']}
                                format="DD.MM.YYYY"
                                // Geçmiş tarihleri seçmeyi engellemek istersen:
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="reason"
                            label="Sebep (Opsiyonel)"
                        >
                            <Input placeholder="Örn: Yıllık İzin, Kongre..." />
                        </Form.Item>
                    </div>

                    <Form.Item className="text-right mb-0">
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            İzin Oluştur
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* --- LİSTELEME TABLOSU --- */}
            <h3 className="text-lg font-semibold mb-4">Mevcut İzinlerim</h3>
            {loading ? <Spin /> : (
                <Table
                    dataSource={unavailableDates}
                    columns={columns}
                    rowKey="_id" // MongoDB _id'sini key olarak kullan
                    locale={{ emptyText: <Empty description="Henüz eklenmiş bir izin yok" /> }}
                    pagination={{ pageSize: 5 }}
                />
            )}
        </Card>
    );
}