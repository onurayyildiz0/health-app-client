import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Modal,
    message,
    Select,
    Avatar,
    Typography,
    Tooltip,
    Row,
    Col,
    Spin,
    Empty,
    Space,
    Statistic
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    EyeOutlined,
    FilterOutlined
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
import * as appointmentService from '../../api/appointmentService';

const { Title, Text } = Typography;
const { Option } = Select;

const DoctorAppointments = () => {
    const dispatch = useDispatch();
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line
    }, []);

    const fetchAppointments = async () => {
        try {
            dispatch(fetchAppointmentsStart());
            const response = await axiosInstance.get('/appointments/doctor');
            const data = response.data.data || response.data || [];
            dispatch(fetchAppointmentsSuccess(data));
        } catch (err) {
            dispatch(fetchAppointmentsFailure(err.message));
            message.error('Randevular yüklenirken hata oluştu');
        }
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            setUpdating(true);
            await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
            message.success('Randevu durumu güncellendi');
            fetchAppointments();
            if (isModalVisible) setIsModalVisible(false);
        } catch (err) {
            message.error(err.response?.data?.message || 'Durum güncellenemedi');
        } finally {
            setUpdating(false);
        }
    };

    const showAppointmentDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalVisible(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            booked: 'blue',
            confirmed: 'blue',
            cancelled: 'red',
            completed: 'green'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Beklemede',
            booked: 'Onaylı',
            confirmed: 'Onaylı',
            cancelled: 'İptal',
            completed: 'Tamamlandı'
        };
        return texts[status] || status;
    };

    const getFilteredAppointments = () => {
        const today = dayjs();
        let filtered = [...appointments];

        switch (statusFilter) {
            case 'today':
                filtered = filtered.filter(apt => dayjs(apt.date).isSame(today, 'day'));
                break;
            case 'upcoming':
                filtered = filtered.filter(apt => 
                    dayjs(apt.date).isAfter(today) && apt.status !== 'cancelled'
                );
                break;
            case 'past':
                filtered = filtered.filter(apt => 
                    dayjs(apt.date).isBefore(today) || apt.status === 'completed'
                );
                break;
            case 'pending':
                filtered = filtered.filter(apt => apt.status === 'pending');
                break;
            default:
                break;
        }
        return filtered.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
    };

    const filteredList = getFilteredAppointments();

    const columns = [
        {
            title: 'Hasta',
            key: 'patient',
            fixed: 'left',
            width: 250,
            render: (record) => (
                <div className="flex items-center gap-3">
                    <Avatar size={40} icon={<UserOutlined />} src={record.patient?.avatar} />
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-900 truncate">
                            {record.patient?.name || 'Bilinmeyen Hasta'}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                            {record.patient?.email}
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: 'Tarih',
            dataIndex: 'date',
            key: 'date',
            width: 140,
            render: (date) => (
                <div className="font-medium text-gray-700">
                    {dayjs(date).format('DD.MM.YYYY')}
                </div>
            )
        },
        {
            title: 'Saat',
            key: 'time',
            width: 140,
            render: (record) => (
                <Tag icon={<ClockCircleOutlined />} color="blue" className="px-2 py-1 text-xs">
                    {record.start.slice(0, 5)} - {record.end.slice(0, 5)}
                </Tag>
            )
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)} className="min-w-80px text-center rounded-full border-0">
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'İşlemler',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (record) => (
                <Space size="small">
                    <Tooltip title="Detay">
                        <Button icon={<EyeOutlined />} size="small" onClick={() => showAppointmentDetails(record)} />
                    </Tooltip>
                    
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Onayla">
                                <Button type="primary" icon={<CheckCircleOutlined />} size="small" onClick={() => handleUpdateStatus(record.id, 'booked')} />
                            </Tooltip>
                            <Tooltip title="Reddet">
                                <Button danger icon={<CloseCircleOutlined />} size="small" onClick={() => handleUpdateStatus(record.id, 'cancelled')} />
                            </Tooltip>
                        </>
                    )}

                    {(record.status === 'booked' || record.status === 'confirmed') && (
                        <Tooltip title="Tamamla">
                            <Button type="primary" ghost icon={<CheckCircleOutlined />} size="small" onClick={() => handleUpdateStatus(record.id, 'completed')} />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Title level={2} className="!mb-1 !text-2xl md:!text-3xl text-gray-800">
                        <CalendarOutlined className="mr-3 text-blue-600" />
                        Randevu Yönetimi
                    </Title>
                    <Text type="secondary" className="text-base">
                        Toplam {appointments.length} randevu kaydı
                    </Text>
                </div>
            </div>

            {/* İstatistikler */}
            <Row gutter={[20, 20]} className="mb-8">
                <Col xs={24} sm={8} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic
                            title="Bugünkü"
                            value={appointments.filter(a => dayjs(a.date).isSame(dayjs(), 'day')).length}
                            prefix={<CalendarOutlined className="text-blue-500 bg-blue-50 p-2.5 rounded-lg mr-2" />}
                            valueStyle={{ fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic
                            title="Bekleyen"
                            value={appointments.filter(a => a.status === 'pending').length}
                            prefix={<ClockCircleOutlined className="text-orange-500 bg-orange-50 p-2.5 rounded-lg mr-2" />}
                            valueStyle={{ fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl">
                        <Statistic
                            title="Tamamlanan"
                            value={appointments.filter(a => a.status === 'completed').length}
                            prefix={<CheckCircleOutlined className="text-green-500 bg-green-50 p-2.5 rounded-lg mr-2" />}
                            valueStyle={{ fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full rounded-xl flex items-center">
                        <div className="w-full">
                            <div className="text-xs font-bold text-gray-400 mb-2 tracking-wider flex items-center gap-1">
                                <FilterOutlined /> FİLTRELE
                            </div>
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                size="large"
                                variant="borderless"
                                className="bg-gray-50 w-full rounded-lg"
                            >
                                <Option value="all">Tüm Randevular</Option>
                                <Option value="today">Bugün</Option>
                                <Option value="upcoming">Yaklaşan</Option>
                                {/* <Option value="pending">Onay Bekleyen</Option> */}
                                <Option value="past">Geçmiş</Option>
                            </Select>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Masaüstü Tablo */}
            <div className="hidden md:block">
                <Card bordered={false} className="shadow-md rounded-xl overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredList}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 8, showTotal: (total) => `Toplam ${total} kayıt` }}
                    />
                </Card>
            </div>

            {/* Mobil Liste */}
            <div className="md:hidden space-y-4">
                {loading ? <div className="text-center py-10"><Spin size="large" /></div> : filteredList.map(apt => (
                    <Card key={apt.id} bordered={false} className="shadow-sm rounded-xl">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar size={48} icon={<UserOutlined />} src={apt.patient?.avatar} />
                                <div>
                                    <div className="font-bold text-gray-900">{apt.patient?.name}</div>
                                    <div className="text-xs text-gray-500">{dayjs(apt.date).format('DD MMMM YYYY')}</div>
                                </div>
                            </div>
                            <Tag color={getStatusColor(apt.status)} className="rounded-full border-0 px-3">
                                {getStatusText(apt.status)}
                            </Tag>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                <ClockCircleOutlined /> {apt.start.slice(0, 5)} - {apt.end.slice(0, 5)}
                            </div>
                            <Button size="small" type="text" className="text-blue-600" onClick={() => showAppointmentDetails(apt)}>Detay</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {apt.status === 'pending' && (
                                <>
                                    <Button type="primary" block onClick={() => handleUpdateStatus(apt.id, 'booked')}>Onayla</Button>
                                    <Button danger block onClick={() => handleUpdateStatus(apt.id, 'cancelled')}>Reddet</Button>
                                </>
                            )}
                            {(apt.status === 'booked' || apt.status === 'confirmed') && (
                                <Button type="primary" ghost block className="col-span-2" onClick={() => handleUpdateStatus(apt.id, 'completed')}>Tamamla</Button>
                            )}
                        </div>
                    </Card>
                ))}
                {!loading && filteredList.length === 0 && (
                    <Empty description="Randevu bulunamadı" className="bg-white p-8 rounded-xl shadow-sm" />
                )}
            </div>

            {/* Detay Modal */}
            <Modal
                title="Randevu Detayları"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                centered
                width={500}
            >
                {selectedAppointment && (
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <Avatar size={64} icon={<UserOutlined />} src={selectedAppointment.patient?.avatar} />
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 m-0">{selectedAppointment.patient?.name}</h3>
                                <p className="text-gray-500 text-sm m-0">{selectedAppointment.patient?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border p-4 rounded-xl text-center">
                                <div className="text-xs text-gray-400 mb-1 font-bold tracking-wide">TARİH</div>
                                <div className="font-bold text-gray-800 text-lg">
                                    {dayjs(selectedAppointment.date).format('DD.MM.YYYY')}
                                </div>
                            </div>
                            <div className="bg-white border p-4 rounded-xl text-center">
                                <div className="text-xs text-gray-400 mb-1 font-bold tracking-wide">SAAT</div>
                                <div className="font-bold text-blue-600 text-lg">
                                    {selectedAppointment.start.slice(0, 5)} - {selectedAppointment.end.slice(0, 5)}
                                </div>
                            </div>
                        </div>

                        {selectedAppointment.notes && (
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                <div className="text-xs text-yellow-600 font-bold mb-2 uppercase">Hasta Notu</div>
                                <div className="text-gray-700 text-sm">{selectedAppointment.notes}</div>
                            </div>
                        )}

                        {selectedAppointment.status === 'pending' && (
                            <div className="flex gap-3 pt-2">
                                <Button type="primary" block size="large" onClick={() => handleUpdateStatus(selectedAppointment.id, 'booked')} loading={updating}>Onayla</Button>
                                <Button danger block size="large" onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')} loading={updating}>Reddet</Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DoctorAppointments;