import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Button, Space, message, Modal, Empty, Avatar, Typography } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    PlusOutlined,
    UserOutlined,
    CreditCardOutlined
} from '@ant-design/icons';

const { Text } = Typography;
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import * as appointmentService from '../../api/appointmentService';
import {
    fetchMyAppointments,
    selectAllAppointments,
    selectAppointmentLoading
} from '../../store/slices/appointmentSlice';

const MyAppointments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const appointments = useSelector(selectAllAppointments);
    const loading = useSelector(selectAppointmentLoading);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);

    const fetchAppointments = useCallback(async () => {
        // Daha önce çekilmişse tekrar çekme
        if (dataFetched) return;

        try {
            await dispatch(fetchMyAppointments());
            setDataFetched(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Randevular yüklenirken hata oluştu';
            message.error(errorMessage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataFetched]);

    // Randevuları çek
    useEffect(() => {
        let isMounted = true;
        let timeoutId;

        // Rate limit için gecikme ekle
        timeoutId = setTimeout(() => {
            if (isMounted && !dataFetched) {
                fetchAppointments();
            }
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataFetched]);

    // Randevu iptal et
    const handleCancelAppointment = async (appointmentId) => {
        Modal.confirm({
            title: 'Randevuyu İptal Et',
            content: 'Bu randevuyu iptal etmek istediğinizden emin misiniz?',
            okText: 'Evet, İptal Et',
            okType: 'danger',
            cancelText: 'Vazgeç',
            onOk: async () => {
                try {
                    setCancelling(true);
                    await appointmentService.cancelAppointment(appointmentId);
                    message.success('Randevu başarıyla iptal edildi');
                    // API isteği yerine Redux'tan sil
                    setDataFetched(false);
                    fetchAppointments();
                } catch (err) {
                    message.error(err.response?.data?.message || 'Randevu iptal edilemedi');
                } finally {
                    setCancelling(false);
                }
            }
        });
    };

    // Tekrar ödeme yap
    const handleRetryPayment = (appointment) => {
        const doctorData = appointment.doctor;

        const paymentData = {
            doctor: doctorData._id,
            date: appointment.date,
            start: appointment.start,
            end: appointment.end,
            notes: appointment.notes || ''
        };

        localStorage.setItem('pendingAppointmentId', appointment._id);
        localStorage.setItem('pendingAppointment', JSON.stringify(paymentData));
        localStorage.setItem('doctorData', JSON.stringify(doctorData));

        navigate(`/payment?appointmentId=${appointment._id}`);
    };



    // Randevu detayını göster
    const showAppointmentDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalVisible(true);
    };

    // Durum renkleri
    const getStatusColor = (status) => {
        const statusColors = {
            booked: 'green',
            cancelled: 'red',
            completed: 'blue',
            pending_payment: 'orange'
        };
        return statusColors[status] || 'default';
    };

    // Durum metinleri
    const getStatusText = (status) => {
        const statusTexts = {
            booked: 'Rezerve Edildi',
            cancelled: 'İptal Edildi',
            completed: 'Tamamlandı',
            pending_payment: 'Ödeme Bekleniyor'
        };
        return statusTexts[status] || status;
    };

    // Tablo kolonları
    const columns = [
        {
            title: 'Doktor',
            dataIndex: 'doctor',
            key: 'doctor',
            width: 200,
            fixed: 'left',
            render: (doctor) => (
                <div>
                    <div className="font-medium text-sm">Dr. {doctor?.user?.name || 'Bilinmiyor'}</div>
                    <div className="text-xs text-gray-500">{doctor?.speciality || '-'}</div>
                </div>
            )
        },
        {
            title: 'Tarih',
            dataIndex: 'date',
            key: 'date',
            width: 130,
            render: (date) => (
                <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-blue-500" />
                    <span className='text-sm'>{dayjs(date).format('DD/MM/YYYY')}</span>
                </div>
            ),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            responsive: ['sm']
        },
        {
            title: 'Saat',
            key: 'time',
            width: 120,
            render: (record) => (
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-green-500" />
                    <span className='text-sm'>{record.start}</span>
                </div>
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
                { text: 'Rezerve Edildi', value: 'booked' },
                { text: 'İptal Edildi', value: 'cancelled' },
                { text: 'Tamamlandı', value: 'completed' },
                { text: 'Ödeme Bekleniyor', value: 'pending_payment' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'İşlemler',
            key: 'actions',
            fixed: 'right',
            width: 160,
            render: (record) => (
                <Space size="small" wrap>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showAppointmentDetails(record)}
                    >
                        Detay
                    </Button>
                    {record.status === 'pending_payment' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CreditCardOutlined />}
                            onClick={() => handleRetryPayment(record)}
                        >
                            Ödeme Yap
                        </Button>
                    )}
                    {(record.status === 'booked' || record.status === 'pending_payment') && (
                        <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleCancelAppointment(record._id)}
                            loading={cancelling}
                        >
                            İptal
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className='max-w-[1400px] mx-auto px-2 md:px-4'>
            <Card
                title={
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-blue-500" />
                            <span className='text-sm md:text-base'>Randevularım</span>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/dashboard/patient/create-appointment')}
                            size="small"
                            className='md:!h-8'
                        >
                            <span className='hidden sm:inline'>Yeni Randevu</span>
                            <span className='sm:hidden'>Yeni</span>
                        </Button>
                    </div>
                }
                className="shadow-lg"
            >
                {/* Desktop Table View */}
                <div className='hidden md:block'>
                    <Table
                        columns={columns}
                        dataSource={appointments}
                        rowKey="_id"
                        loading={loading}
                        scroll={{ x: 800 }}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Toplam ${total} randevu`,
                            showSizeChanger: true,
                            responsive: true
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="Henüz randevunuz yok"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                >
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => navigate('/dashboard/patient/create-appointment')}
                                    >
                                        İlk Randevunuzu Oluşturun
                                    </Button>
                                </Empty>
                            )
                        }}
                    />
                </div>
                {/* Mobile Card View */}
                <div className='md:!hidden' style={{ gap: '4px', display: 'flex', flexDirection: 'column' }}>
                    {loading ? (
                        <div className='text-center py-8 '>Yükleniyor...</div>
                    ) : appointments.length > 0 ? (
                        appointments.map((appointment) => (
                            <Card key={appointment._id} className='shadow-sm border-l-4' style={{ borderLeftColor: getStatusColor(appointment.status) === 'green' ? '#52c41a' : getStatusColor(appointment.status) === 'red' ? '#ff4d4f' : '#1890ff' }}>
                                <div className='space-y-2'>
                                    Doktor Bilgisi
                                    <div className='flex items-center gap-3 pb-3 border-b'>
                                        <Avatar
                                            size={48}
                                            icon={<UserOutlined />}
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <div className='font-semibold text-sm truncate'>
                                                Dr. {appointment.doctor?.user?.name || 'Bilinmiyor'}
                                            </div>
                                            <Text type="secondary" className='text-xs'>
                                                {appointment.doctor?.speciality || '-'}
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Tarih ve Saat */}
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <CalendarOutlined className='text-blue-500' />
                                            <Text className='text-sm'>
                                                {dayjs(appointment.date).format('DD/MM/YYYY')}
                                            </Text>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <ClockCircleOutlined className='text-green-500' />
                                            <Text className='text-sm'>
                                                {appointment.start}
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Durum */}
                                    <div className='flex items-center justify-between pb-2 border-b'>
                                        <Text type="secondary" className='text-xs'>Durum:</Text>
                                        <Tag color={getStatusColor(appointment.status)}>
                                            {getStatusText(appointment.status)}
                                        </Tag>
                                    </div>

                                    {/* İşlem Butonları */}
                                    <div className='flex gap-2 pt-2'>
                                        <Button
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => showAppointmentDetails(appointment)}
                                            block
                                        >
                                            Detay
                                        </Button>
                                        {appointment.status === 'pending_payment' && (
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<CreditCardOutlined />}
                                                onClick={() => handleRetryPayment(appointment)}
                                                block
                                            >
                                                Ödeme Yap
                                            </Button>
                                        )}
                                        {(appointment.status === 'booked' || appointment.status === 'pending_payment') && (
                                            <Button
                                                size="small"
                                                danger
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => handleCancelAppointment(appointment._id)}
                                                loading={cancelling}
                                                block
                                            >
                                                İptal Et
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card >
                        ))
                    ) : (
                        <Empty
                            description="Henüz randevunuz yok"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/dashboard/patient/create-appointment')}
                            >
                                İlk Randevunuzu Oluşturun
                            </Button>
                        </Empty>
                    )}
                </div >
            </Card >

            {/* Detay Modal */}
            <Modal Modal
                title={<span span className='text-sm md:text-base' > Randevu Detayları</span >}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                width={window.innerWidth < 768 ? '95%' : 600}
                centered
                footer={
                    [
                        <Button key="close" onClick={() => setIsModalVisible(false)} block className='md:!w-auto'>
                            Kapat
                        </Button>
                    ]}
            >
                {selectedAppointment && (
                    <div className="space-y-4">
                        <div>
                            <span className="font-medium">Doktor:</span> Dr. {selectedAppointment.doctor?.user?.name || 'Bilinmiyor'}
                        </div>
                        <div>
                            <span className="font-medium">Branş:</span> {selectedAppointment.doctor?.speciality || '-'}
                        </div>
                        <div>
                            <span className="font-medium">Tarih:</span> {dayjs(selectedAppointment.date).format('DD/MM/YYYY')}
                        </div>
                        <div>
                            <span className="font-medium">Saat:</span> {selectedAppointment.start} - {selectedAppointment.end}
                        </div>
                        <div>
                            <span className="font-medium">Durum:</span>{' '}
                            <Tag color={getStatusColor(selectedAppointment.status)}>
                                {getStatusText(selectedAppointment.status)}
                            </Tag>
                        </div>
                        {selectedAppointment.notes && (
                            <div>
                                <span className="font-medium">Notlar:</span>
                                <p className="mt-1 text-gray-600">{selectedAppointment.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal >
        </div >
    );
};

export default MyAppointments;
