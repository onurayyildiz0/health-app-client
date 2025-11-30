import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    message,
    Select,
    Tabs,
    Badge,
    Avatar,
    Typography,
    Tooltip,
    List
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
    fetchAppointmentsStart,
    fetchAppointmentsSuccess,
    fetchAppointmentsFailure,
    selectAllAppointments,
    selectAppointmentLoading
} from '../../store/slices/appointmentSlice';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DoctorAppointments = () => {
    const dispatch = useDispatch();
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(false);

    // Randevuları yükle
    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAppointments = async () => {
        try {
            dispatch(fetchAppointmentsStart());
            const response = await axiosInstance.get('/appointments/doctor');
            dispatch(fetchAppointmentsSuccess(response.data.data || response.data));
        } catch (err) {
            dispatch(fetchAppointmentsFailure(err.message));
            message.error('Randevular yüklenirken hata oluştu');
        }
    };

    // Randevu durumunu güncelle
    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            setUpdating(true);
            await axiosInstance.patch(`/appointments/${appointmentId}/status`, {
                status: newStatus
            });
            message.success('Randevu durumu güncellendi');
            fetchAppointments();
        } catch (err) {
            message.error(err.response?.data?.message || 'Durum güncellenemedi');
        } finally {
            setUpdating(false);
        }
    };

    // Randevu detayını göster
    const showAppointmentDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalVisible(true);
    };

    // Durum renkleri
    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'orange',
            confirmed: 'green',
            cancelled: 'red',
            completed: 'blue'
        };
        return statusColors[status] || 'default';
    };

    // Durum metinleri
    const getStatusText = (status) => {
        const statusTexts = {
            pending: 'Beklemede',
            confirmed: 'Onaylandı',
            cancelled: 'İptal Edildi',
            completed: 'Tamamlandı'
        };
        return statusTexts[status] || status;
    };

    // Tablo kolonları
    const columns = [
        {
            title: 'Hasta',
            key: 'patient',
            fixed: 'left',
            width: 200,
            render: (record) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} src={record.patient?.avatar} />
                    <div className='min-w-0'>
                        <div className='truncate text-sm'>{record.patient?.name}</div>
                        <Text type="secondary" className="text-xs truncate block">
                            {record.patient?.email}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Tarih',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            render: (date) => dayjs(date).format('DD.MM.YYYY'),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            responsive: ['sm']
        },
        {
            title: 'Saat',
            key: 'time',
            width: 130,
            render: (record) => (
                <Tag icon={<ClockCircleOutlined />} color="blue" className='text-xs'>
                    {record.start} - {record.end}
                </Tag>
            )
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)} className='text-xs'>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Beklemede', value: 'pending' },
                { text: 'Onaylandı', value: 'confirmed' },
                { text: 'Tamamlandı', value: 'completed' },
                { text: 'İptal Edildi', value: 'cancelled' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'İşlemler',
            key: 'actions',
            fixed: 'right',
            width: 180,
            render: (record) => (
                <Space size="small" wrap>
                    <Tooltip title="Detayları Gör">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => showAppointmentDetails(record)}
                        />
                    </Tooltip>
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Onayla">
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleUpdateStatus(record._id, 'confirmed')}
                                    loading={updating}
                                />
                            </Tooltip>
                            <Tooltip title="Reddet">
                                <Button
                                    size="small"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => handleUpdateStatus(record._id, 'cancelled')}
                                    loading={updating}
                                />
                            </Tooltip>
                        </>
                    )}
                    {record.status === 'confirmed' && (
                        <Tooltip title="Tamamlandı">
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleUpdateStatus(record._id, 'completed')}
                                loading={updating}
                                className='text-xs'
                            >
                                <span className='hidden sm:inline'>Tamamla</span>
                                <span className='sm:hidden'>✓</span>
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    // Randevuları filtrele
    const getFilteredAppointments = () => {
        const today = dayjs();

        switch (statusFilter) {
            case 'today':
                return appointments.filter(apt => dayjs(apt.date).isSame(today, 'day'));
            case 'upcoming':
                return appointments.filter(apt =>
                    dayjs(apt.date).isAfter(today) && apt.status !== 'cancelled'
                );
            case 'past':
                return appointments.filter(apt =>
                    dayjs(apt.date).isBefore(today) || apt.status === 'completed'
                );
            case 'pending':
                return appointments.filter(apt => apt.status === 'pending');
            default:
                return appointments;
        }
    };

    const filteredAppointments = getFilteredAppointments();

    // Bugünkü randevular
    const todayAppointments = appointments.filter(apt =>
        dayjs(apt.date).isSame(dayjs(), 'day')
    );

    // Bekleyen randevular
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

    return (
        <div className='max-w-[1400px] mx-auto px-2 md:px-4'>
            <div className="mb-4 md:mb-6">
                <Title level={3} className='!text-lg md:!text-xl lg:!text-2xl'>
                    <CalendarOutlined className="mr-2" />
                    Randevu Yönetimi
                </Title>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                <Card className="shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <CalendarOutlined className="text-lg md:text-2xl text-blue-500" />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Bugün</Text>
                            <div className="text-xl md:text-2xl font-bold">{todayAppointments.length}</div>
                        </div>
                    </div>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                            <ClockCircleOutlined className="text-lg md:text-2xl text-orange-500" />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Bekleyen</Text>
                            <div className="text-xl md:text-2xl font-bold">{pendingAppointments.length}</div>
                        </div>
                    </div>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                            <CheckCircleOutlined className="text-lg md:text-2xl text-purple-500" />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Toplam</Text>
                            <div className="text-xl md:text-2xl font-bold">{appointments.length}</div>
                        </div>
                    </div>
                </Card>
                <Card className="shadow-sm">
                    <Text type="secondary" className="text-xs block mb-2">Filtrele</Text>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: '100%' }}
                    >
                        <Option value="all">Tüm Randevular</Option>
                        <Option value="today">Bugün</Option>
                        <Option value="upcoming">Yaklaşan</Option>
                        <Option value="past">Geçmiş</Option>
                        <Option value="pending">Bekleyen</Option>
                    </Select>
                </Card>
            </div>

            {/* Randevu Tablosu - Desktop */}
            <Card className='overflow-hidden hidden md:block'>
                <Table
                    columns={columns}
                    dataSource={filteredAppointments}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 800 }}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Toplam ${total} randevu`,
                        showSizeChanger: false,
                        responsive: true
                    }}
                />
            </Card>

            {/* Randevu Listesi - Mobile */}
            <div className='md:hidden space-y-3'>
                {loading ? (
                    <Card><div className='text-center py-8'>Yükleniyor...</div></Card>
                ) : filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                        <Card key={appointment._id} className='shadow-sm'>
                            <div className='space-y-3'>
                                {/* Hasta Bilgisi */}
                                <div className='flex items-center gap-3 pb-3 border-b'>
                                    <Avatar
                                        size={48}
                                        icon={<UserOutlined />}
                                        src={appointment.patient?.avatar}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <div className='font-semibold truncate'>
                                            {appointment.patient?.name}
                                        </div>
                                        <Text type="secondary" className='text-xs truncate block'>
                                            {appointment.patient?.email}
                                        </Text>
                                    </div>
                                </div>

                                {/* Tarih ve Saat */}
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <CalendarOutlined className='text-blue-500' />
                                        <Text className='text-sm'>
                                            {dayjs(appointment.date).format('DD.MM.YYYY')}
                                        </Text>
                                    </div>
                                    <Tag icon={<ClockCircleOutlined />} color="blue">
                                        {appointment.start} - {appointment.end}
                                    </Tag>
                                </div>

                                {/* Durum */}
                                <div className='flex items-center justify-between'>
                                    <Text type="secondary" className='text-xs'>Durum:</Text>
                                    <Tag color={getStatusColor(appointment.status)}>
                                        {getStatusText(appointment.status)}
                                    </Tag>
                                </div>

                                {/* İşlem Butonları */}
                                <div className='flex gap-2 pt-2 border-t'>
                                    <Button
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() => showAppointmentDetails(appointment)}
                                        block
                                    >
                                        Detay
                                    </Button>
                                    {appointment.status === 'pending' && (
                                        <>
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                                onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                                                loading={updating}
                                                block
                                            >
                                                Onayla
                                            </Button>
                                            <Button
                                                size="small"
                                                danger
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                                                loading={updating}
                                                block
                                            >
                                                Reddet
                                            </Button>
                                        </>
                                    )}
                                    {appointment.status === 'confirmed' && (
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                            loading={updating}
                                            block
                                        >
                                            Tamamla
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <div className='text-center py-8 text-gray-400'>
                            Randevu bulunamadı
                        </div>
                    </Card>
                )}

                {/* Pagination for mobile */}
                {filteredAppointments.length > 10 && (
                    <div className='text-center text-sm text-gray-500 py-4'>
                        Toplam {filteredAppointments.length} randevu
                    </div>
                )}
            </div>

            {/* Detay Modal */}
            <Modal
                title={<span className='text-sm md:text-base'>Randevu Detayları</span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={window.innerWidth < 768 ? '95%' : 600}
                centered
            >
                {selectedAppointment && (
                    <div>
                        <Space direction="vertical" className="w-full" size="large">
                            <div>
                                <Text strong>Hasta:</Text>
                                <div className="mt-2 flex items-center gap-3">
                                    <Avatar
                                        size={50}
                                        icon={<UserOutlined />}
                                        src={selectedAppointment.patient?.avatar}
                                    />
                                    <div>
                                        <div className="font-semibold">
                                            {selectedAppointment.patient?.name}
                                        </div>
                                        <Text type="secondary">
                                            {selectedAppointment.patient?.email}
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Text strong>Tarih ve Saat:</Text>
                                <div className="mt-1">
                                    {dayjs(selectedAppointment.date).format('DD MMMM YYYY')}
                                    {' - '}
                                    {selectedAppointment.start} - {selectedAppointment.end}
                                </div>
                            </div>

                            <div>
                                <Text strong>Durum:</Text>
                                <div className="mt-1">
                                    <Tag color={getStatusColor(selectedAppointment.status)}>
                                        {getStatusText(selectedAppointment.status)}
                                    </Tag>
                                </div>
                            </div>

                            {selectedAppointment.notes && (
                                <div>
                                    <Text strong>Notlar:</Text>
                                    <div className="mt-1 p-3 bg-gray-50 rounded">
                                        {selectedAppointment.notes}
                                    </div>
                                </div>
                            )}

                            {selectedAppointment.status === 'pending' && (
                                <Space className='w-full flex-col sm:flex-row'>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => {
                                            handleUpdateStatus(selectedAppointment._id, 'confirmed');
                                            setIsModalVisible(false);
                                        }}
                                        loading={updating}
                                        block
                                        className='sm:!w-auto'
                                    >
                                        Onayla
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={() => {
                                            handleUpdateStatus(selectedAppointment._id, 'cancelled');
                                            setIsModalVisible(false);
                                        }}
                                        loading={updating}
                                        block
                                        className='sm:!w-auto'
                                    >
                                        Reddet
                                    </Button>
                                </Space>
                            )}
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DoctorAppointments;
