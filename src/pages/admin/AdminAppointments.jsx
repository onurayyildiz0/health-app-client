import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Input, DatePicker, Popconfirm, Tooltip } from 'antd';
import { CalendarOutlined, SearchOutlined, CloseCircleOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllAppointments, 
    cancelExistingAppointment, 
    selectAllAppointments, 
    selectAppointmentLoading 
} from '../../store/slices/appointmentSlice';

const AdminAppointments = () => {
    const dispatch = useDispatch();
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);
    
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        dispatch(fetchAllAppointments());
    }, [dispatch]);

    const handleCancelAppointment = async (id) => {
        try {
            await dispatch(cancelExistingAppointment(id));
            message.success('Randevu iptal edildi');
            // Liste Redux state'inden otomatik silinir (slice reducer ile)
        } catch (error) {
            message.error('İptal işlemi başarısız');
        }
    };

    // Client-side Filtreleme
    const filteredAppointments = appointments.filter(appt => {
        const doctorName = appt.doctor?.user?.name?.toLowerCase() || '';
        const patientName = appt.patient?.name?.toLowerCase() || '';
        const search = searchText.toLowerCase();
        
        const matchesText = doctorName.includes(search) || patientName.includes(search);
        
        let matchesDate = true;
        if (dateRange) {
            const apptDate = dayjs(appt.date);
            matchesDate = apptDate.isAfter(dateRange[0]) && apptDate.isBefore(dateRange[1]);
        }

        return matchesText && matchesDate;
    });

    const columns = [
        {
            title: 'Tarih & Saat',
            key: 'datetime',
            render: (record) => (
                <div>
                    <div className="font-semibold text-gray-700">{new Date(record.date).toLocaleDateString('tr-TR')}</div>
                    <div className="text-gray-500 text-sm">{record.start} - {record.end}</div>
                </div>
            ),
            sorter: (a, b) => new Date(a.date) - new Date(b.date)
        },
        {
            title: 'Doktor', key: 'doctor',
            render: (record) => <Space><MedicineBoxOutlined className="text-blue-500" /><span>{record.doctor?.user?.name}</span></Space>
        },
        {
            title: 'Hasta', key: 'patient',
            render: (record) => <Space><UserOutlined className="text-green-500" /><span>{record.patient?.name}</span></Space>
        },
        {
            title: 'Durum', dataIndex: 'status', key: 'status',
            render: (status) => {
                const colors = { booked: 'blue', completed: 'green', cancelled: 'red', pending_payment: 'orange' };
                const labels = { booked: 'Aktif', completed: 'Tamamlandı', cancelled: 'İptal', pending_payment: 'Ödeme Bekliyor' };
                return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
            },
            filters: [{ text: 'Aktif', value: 'booked' }, { text: 'İptal', value: 'cancelled' }, { text: 'Tamamlandı', value: 'completed' }],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'İşlemler', key: 'actions',
            render: (record) => record.status === 'booked' && (
                <Popconfirm title="İptal edilsin mi?" onConfirm={() => handleCancelAppointment(record.id)} okText="Evet" cancelText="Hayır">
                    <Tooltip title="Randevuyu İptal Et"><Button danger size="small" icon={<CloseCircleOutlined />}>İptal</Button></Tooltip>
                </Popconfirm>
            )
        }
    ];

    return (
        <div className="p-4 max-w-[1600px] mx-auto">
            <Card title={<span className="text-lg font-semibold"><CalendarOutlined className="mr-2"/>Randevu Yönetimi</span>} className="shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input placeholder="Doktor veya Hasta adı ara..." prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} className="w-full md:w-1/3" />
                    <DatePicker.RangePicker onChange={setDateRange} className="w-full md:w-1/3" placeholder={['Başlangıç', 'Bitiş']} />
                </div>
                <Table columns={columns} dataSource={filteredAppointments} rowKey="id" loading={loading} scroll={{ x: 800 }} pagination={{ pageSize: 10 }} />
            </Card>
        </div>
    );
};

export default AdminAppointments;