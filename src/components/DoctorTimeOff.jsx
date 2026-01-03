import { useState, useEffect } from 'react';
import { Card, Form, DatePicker, Input, Button, Table, message, Spin, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { addUnavailableDate, getMyDoctorProfile } from '../api/doctorService'; 

const { RangePicker } = DatePicker;

export default function DoctorTimeOff() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getMyDoctorProfile();
            
            if (res && res.data.unavailableDates) {
                let parsedData = [];
                
                // Gelen veri string ise parse et, array ise direkt al
                const rawData = typeof res.data.unavailableDates === 'string' 
                    ? JSON.parse(res.data.unavailableDates) 
                    : res.data.unavailableDates;

                // FIX: Antd Table "rowKey" uyarısını çözmek için veriye sabit bir ID (uid) ekliyoruz.
                // Veriyi aldığımız anda index'i kullanarak statik bir ID oluşturuyoruz.
                parsedData = rawData.map((item, index) => ({
                    ...item,
                    uid: `${index}-${item.StartDate}` // Benzersiz bir key oluşturur
                }));
                console.log(parsedData)
                setUnavailableDates(parsedData);
            }
        } catch (error) {
            console.error(error);
            message.error("Veriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onFinish = async (values) => {
        try {
            setSubmitting(true);

            const startDate = values.dates[0];
            const endDate = values.dates[1];
            const diffDays = endDate.diff(startDate, 'day');
            
            if (diffDays > 90) {
                message.error("İzin süresi en fazla 3 ay (90 gün) olabilir.");
                return;
            }

            const payload = {
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                reason: values.reason
            };

            await addUnavailableDate(payload);

            message.success("İzin tarihi başarıyla eklendi.");
            form.resetFields();
            fetchData(); 
        } catch (error) {
            message.error(error.response?.data?.message || "Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Başlangıç',
            dataIndex: 'StartDate',
            key: 'StartDate',
            render: (text) => text ? dayjs(text).format('DD.MM.YYYY') : '-',
        },
        {
            title: 'Bitiş',
            dataIndex: 'EndDate',
            key: 'EndDate',
            render: (text) => text ? dayjs(text).format('DD.MM.YYYY') : '-',
        },
        {
            title: 'Sebep',
            dataIndex: 'Reason',
            key: 'Reason',
            render: (text) => text || 'Belirtilmemiş',
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
                                disabledDate={(current, type) => {
                                    if (type === 'end') {
                                        const startDate = form.getFieldValue('dates')?.[0];
                                        if (startDate) {
                                            const maxEnd = startDate.add(1, 'month');
                                            return current && current > maxEnd;
                                        }
                                    }
                                    return current && current < dayjs().startOf('day');
                                }}
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
                    // FIX: Artık veri içinde 'uid' olduğu için fonksiyon kullanmaya gerek yok
                    rowKey="uid"
                    locale={{ emptyText: <Empty description="Henüz eklenmiş bir izin yok" /> }}
                    pagination={{ pageSize: 5 }}
                />
            )}
        </Card>
    );
}