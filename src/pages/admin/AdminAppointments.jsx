import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Input, DatePicker, Popconfirm, Tooltip, Modal, Descriptions, Divider } from 'antd';
import { CalendarOutlined, SearchOutlined, CloseCircleOutlined, UserOutlined, MedicineBoxOutlined, EyeOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllAppointments, 
    cancelExistingAppointment, 
    selectAllAppointments, 
    selectAppointmentLoading 
} from '../../store/slices/appointmentSlice';


const statusMap = {
    booked: 'Rezerve',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
};

const statusColorMap = {
    booked: 'blue',
    completed: 'green',
    cancelled: 'red',
};

const AdminAppointments = () => {
    const dispatch = useDispatch();
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);
    
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);
    
    
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        dispatch(fetchAllAppointments());
    }, [dispatch]);

    const handleCancelAppointment = async (id) => {
        try {
            await dispatch(cancelExistingAppointment(id));
            message.success('Randevu iptal edildi');
        } catch (error) {
            message.error('İptal işlemi başarısız');
        }
    };

    
    const handleViewDetails = (record) => {
        setSelectedAppointment(record);
        setIsDetailModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalVisible(false);
        setSelectedAppointment(null);
    };

    
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
            render: (status) => (
                <Tag color={statusColorMap[status] || 'default'}>
                    {statusMap[status] || status.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Rezerve', value: 'booked' }, 
                { text: 'İptal', value: 'cancelled' }, 
                { text: 'Tamamlandı', value: 'completed' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'İşlemler', key: 'actions',
            render: (record) => (
                <Space>
                    <Tooltip title="Detayları Gör">
                        <Button 
                            icon={<EyeOutlined />} 
                            size="small" 
                            onClick={() => handleViewDetails(record)} 
                        />
                    </Tooltip>
                    
                    {record.status === 'booked' && (
                        <Popconfirm 
                            title="İptal edilsin mi?" 
                            description="Bu işlem geri alınamaz."
                            onConfirm={() => handleCancelAppointment(record.id)} 
                            okText="Evet" 
                            cancelText="Hayır"
                        >
                            <Tooltip title="Randevuyu İptal Et">
                                <Button danger size="small" icon={<CloseCircleOutlined />}>İptal</Button>
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
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

            {/* DETAY MODALI */}
            <Modal
                title={<Space><CalendarOutlined /> Randevu Detayları</Space>}
                open={isDetailModalVisible}
                onCancel={handleCloseModal}
                footer={[<Button key="close" onClick={handleCloseModal}>Kapat</Button>]}
                width={700}
            >
                {selectedAppointment && (
                    <div className="flex flex-col gap-4">
                        {/* 1. Üst Bilgi Kartı */}
                        <div className={`p-4 rounded-lg border-l-4 ${selectedAppointment.status === 'cancelled' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold m-0">Randevu #{selectedAppointment.id}</h3>
                                    <span className="text-gray-500">{new Date(selectedAppointment.createdAt).toLocaleDateString('tr-TR')} tarihinde oluşturuldu.</span>
                                </div>
                                <Tag color={statusColorMap[selectedAppointment.status]} className="text-base px-3 py-1">
                                    {statusMap[selectedAppointment.status] || selectedAppointment.status}
                                </Tag>
                            </div>
                        </div>

                        {/* 2. Zaman ve Finans */}
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Tarih">{new Date(selectedAppointment.date).toLocaleDateString('tr-TR')}</Descriptions.Item>
                            <Descriptions.Item label="Saat">
                                <Space><ClockCircleOutlined /> {selectedAppointment.start} - {selectedAppointment.end}</Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ücret">
                                <Space><DollarOutlined /> <span className="font-semibold text-green-600">{selectedAppointment.price || 0} ₺</span></Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Durum">{statusMap[selectedAppointment.status]}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" style={{ margin: '10px 0' }}>Katılımcı Bilgileri</Divider>

                        {/* 3. Doktor ve Hasta Bilgileri */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card size="small" title={<Space><MedicineBoxOutlined className="text-blue-600"/> Doktor</Space>} className="bg-gray-50">
                                <p><strong>Ad:</strong> {selectedAppointment.doctor?.user?.name}</p>
                                <p><strong>Email:</strong> {selectedAppointment.doctor?.user?.email}</p>
                                <p><strong>Uzmanlık:</strong> {selectedAppointment.doctor?.specialityNavigation?.name || 'Belirtilmemiş'}</p>
                                <p><strong>Hastane:</strong> {selectedAppointment.doctor?.hospital || '-'}</p>
                            </Card>
                            
                            <Card size="small" title={<Space><UserOutlined className="text-green-600"/> Hasta</Space>} className="bg-gray-50">
                                <p><strong>Ad:</strong> {selectedAppointment.patient?.name}</p>
                                <p><strong>Email:</strong> {selectedAppointment.patient?.email}</p>
                                <p><strong>TC Kimlik:</strong> {selectedAppointment.patient?.tc || '-'}</p>
                                <p><strong>Tel:</strong> {selectedAppointment.patient?.phone || '-'}</p>
                            </Card>
                        </div>

                        {/* 4. Notlar (Varsa) */}
                        {selectedAppointment.notes && (
                            <>
                                <Divider orientation="left" style={{ margin: '10px 0' }}>Notlar</Divider>
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-gray-700 italic">
                                    "{selectedAppointment.notes}"
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminAppointments;