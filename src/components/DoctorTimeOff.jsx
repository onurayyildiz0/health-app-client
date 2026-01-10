import { useState, useEffect } from 'react';
import { Card, Form, DatePicker, Input, Button, Table, message, Spin, Empty, Tag, Popconfirm } from 'antd';
import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { addUnavailableDate, getMyDoctorProfile, cancelUnavailableDate } from '../api/doctorService'; 

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
                // Backend'den artık bir Obje {} geliyor. Bunu Array [] formatına çevirmeliyiz.
                const rawData = typeof res.data.unavailableDates === 'string' 
                    ? JSON.parse(res.data.unavailableDates) 
                    : res.data.unavailableDates;

                // Object.entries ile [Key, Value] çiftlerini alıp düz bir listeye çeviriyoruz
                // Örn: { "leave_1": { StartDate:..., IsDeleted: false } }
                const parsedList = Object.entries(rawData || {}).map(([key, value]) => ({
                    key: key, // Tablo için rowKey ve silme işlemi için ID
                    ...value
                }));
                
                // Tarihe göre sıralama (Yeniden eskiye)
                parsedList.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));

                setUnavailableDates(parsedList);
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

    const handleCancelDate = async (key) => {
        try {
            await cancelUnavailableDate(key);
            message.success("İzin iptal edildi.");
            fetchData(); // Tabloyu yenile
        } catch (error) {
            message.error(error.response?.data?.message || "İptal işlemi başarısız.");
        }
    };

    const onFinish = async (values) => {
        try {
            setSubmitting(true);
            const startDate = values.dates[0];
            const endDate = values.dates[1];
            
            // Basit bir validasyon
            const diffDays = endDate.diff(startDate, 'day');
            if (diffDays > 90) {
                message.error("İzin süresi en fazla 3 ay olabilir.");
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
            title: 'Durum',
            dataIndex: 'IsDeleted',
            key: 'IsDeleted',
            render: (isDeleted, record) => {
                // Eğer silinmişse "İptal", silinmemişse ve tarihi geçmişse "Tamamlandı", değilse "Aktif"
                if (isDeleted) return <Tag color="red">İptal Edildi</Tag>;
                if (dayjs(record.EndDate).isBefore(dayjs())) return <Tag color="gray">Geçmiş</Tag>;
                return <Tag color="green">Aktif</Tag>;
            }
        },
        {
            title: 'Başlangıç',
            dataIndex: 'StartDate',
            key: 'StartDate',
            render: (text, record) => (
                <span style={{ textDecoration: record.IsDeleted ? 'line-through' : 'none', color: record.IsDeleted ? '#999' : 'inherit' }}>
                    {text ? dayjs(text).format('DD.MM.YYYY') : '-'}
                </span>
            ),
        },
        {
            title: 'Bitiş',
            dataIndex: 'EndDate',
            key: 'EndDate',
            render: (text, record) => (
                <span style={{ textDecoration: record.IsDeleted ? 'line-through' : 'none', color: record.IsDeleted ? '#999' : 'inherit' }}>
                    {text ? dayjs(text).format('DD.MM.YYYY') : '-'}
                </span>
            ),
        },
        {
            title: 'Sebep',
            dataIndex: 'Reason',
            key: 'Reason',
            render: (text, record) =>
                (<span style={{ textDecoration: record.IsDeleted ? 'line-through' : 'none', color: record.IsDeleted ? '#999' : 'inherit' }}>
                    {text || 'Belirtilmemiş'}
                </span>)
        },
        {
            title: 'İşlem',
            key: 'action',
            render: (_, record) => {
                // İptal butonu koşulları:
                // 1. Zaten silinmişse buton gözükmesin veya disable olsun.
                // 2. Bitiş tarihi geçmişse iptal edilemesin.
                const isPast = dayjs(record.EndDate).isBefore(dayjs());
                const isDisabled = record.IsDeleted || isPast;

                return (
                    <Popconfirm
                        title="İzni iptal et"
                        description="Bu izni iptal etmek istediğinize emin misiniz?"
                        onConfirm={() => handleCancelDate(record.key)}
                        okText="Evet"
                        cancelText="Hayır"
                        disabled={isDisabled}
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            disabled={isDisabled}
                        >
                            İptal Et
                        </Button>
                    </Popconfirm>
                );
            }
        }
    ];

    return (
        <Card 
            title={
                <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-blue-500" />
                    <span>İzin Yönetimi</span>
                </div>
            } 
            className="max-w-4xl mx-auto mt-8 shadow-md"
        >
            {/* --- EKLEME FORMU --- */}
            <Card type="inner" title="Yeni İzin Ekle" className="mb-6 bg-gray-50 border-blue-100">
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="dates"
                            label="Tarih Aralığı"
                            rules={[{ required: true, message: 'Lütfen tarih seçiniz' }]}
                        >
                            <RangePicker
                                className="w-full"
                                format="DD.MM.YYYY"
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
            <h3 className="text-lg font-semibold mb-4">İzin Geçmişi</h3>
            {loading ? <Spin /> : (
                <Table
                    dataSource={unavailableDates}
                    columns={columns}
                    rowKey="key" // Object.entries'den gelen 'key' alanını kullanıyoruz
                    locale={{ emptyText: <Empty description="Henüz izin kaydı yok" /> }}
                    pagination={{ pageSize: 5 }}
                />
            )}
        </Card>
    );
}