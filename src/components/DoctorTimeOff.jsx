import { useState, useEffect } from 'react';
import { Card, Form, DatePicker, Input, Button, Table, message, Spin, Empty, Tag, Popconfirm } from 'antd';
import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchMyDoctorProfile, 
    addUnavailableDate, 
    cancelUnavailableDate,
    selectCurrentDoctorProfile,
    selectDoctorLoading
} from '../store/slices/doctorSlice';

const { RangePicker } = DatePicker;

export default function DoctorTimeOff() {
    const dispatch = useDispatch();
    const profile = useSelector(selectCurrentDoctorProfile);
    const loading = useSelector(selectDoctorLoading);
    
    const [submitting, setSubmitting] = useState(false);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchMyDoctorProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile?.unavailableDates) {
            let raw = profile.unavailableDates;
            if (typeof raw === 'string') {
                try { raw = JSON.parse(raw); } catch { raw = {}; }
            }
            // Obje formatını diziye çevir
            const list = Object.entries(raw || {}).map(([key, val]) => ({ key, ...val }));
            list.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));
            setUnavailableDates(list);
        }
    }, [profile]);

    const handleCancelDate = async (key) => {
        try {
            await dispatch(cancelUnavailableDate(key));
            message.success('İzin iptal edildi');
        } catch {
            message.error('İşlem başarısız');
        }
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            await dispatch(addUnavailableDate({
                startDate: values.dates[0].format('YYYY-MM-DD'),
                endDate: values.dates[1].format('YYYY-MM-DD'),
                reason: values.reason
            }));
            message.success('İzin eklendi');
            form.resetFields();
        } catch {
            message.error('İşlem başarısız');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Durum', dataIndex: 'IsDeleted',
            render: (deleted, r) => deleted ? <Tag color="red">İptal</Tag> : (dayjs(r.EndDate).isBefore(dayjs()) ? <Tag>Geçmiş</Tag> : <Tag color="green">Aktif</Tag>)
        },
        { title: 'Başlangıç', dataIndex: 'StartDate', render: (t) => dayjs(t).format('DD.MM.YYYY') },
        { title: 'Bitiş', dataIndex: 'EndDate', render: (t) => dayjs(t).format('DD.MM.YYYY') },
        { title: 'Sebep', dataIndex: 'Reason' },
        {
            title: 'İşlem', key: 'action',
            render: (_, r) => !r.IsDeleted && !dayjs(r.EndDate).isBefore(dayjs()) && (
                <Popconfirm title="İptal Et?" onConfirm={() => handleCancelDate(r.key)}><Button danger type="text" icon={<DeleteOutlined />}>İptal</Button></Popconfirm>
            )
        }
    ];

    return (
        <Card title={<><CalendarOutlined /> İzin Yönetimi</>} className="max-w-4xl mx-auto mt-8 shadow-md">
            <Card type="inner" title="Yeni İzin Ekle" className="mb-6 bg-gray-50">
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item name="dates" label="Tarih" rules={[{ required: true }]}><RangePicker className="w-full" disabledDate={c => c && c < dayjs().startOf('day')} /></Form.Item>
                        <Form.Item name="reason" label="Sebep"><Input /></Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" loading={submitting} className="w-full md:w-auto">Oluştur</Button>
                </Form>
            </Card>
            <h3 className="text-lg font-semibold mb-4">Geçmiş</h3>
            <Table dataSource={unavailableDates} columns={columns} loading={loading} pagination={{ pageSize: 5 }} />
        </Card>
    );
}