import { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Input,
    Select,
    Button,
    Avatar,
    Tag,
    Spin,
    Empty,
    Rate,
    Typography,
    Space,
    Pagination
} from 'antd';
import {
    SearchOutlined,
    MedicineBoxOutlined,
    UserOutlined,
    StarFilled,
    CalendarOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDoctorsStart,
    fetchDoctorsSuccess,
    fetchDoctorsFailure,
    selectAllDoctors,
    selectDoctorLoading,
    selectDoctorError,
    selectDoctorPagination
} from '../../store/slices/doctorSlice';
import * as doctorService from '../../api/doctorService';
import { message } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DoctorList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const doctors = useSelector(selectAllDoctors);
    const loading = useSelector(selectDoctorLoading);
    const error = useSelector(selectDoctorError);
    const pagination = useSelector(selectDoctorPagination);

    // Filtre ve arama state'leri
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // Branş listesi (backend'den de gelebilir)
    const specialities = [
        'Kardiyoloji',
        'Nöroloji',
        'Göz Hastalıkları',
        'Dermatoloji',
        'Ortopedi',
        'Pediatri',
        'Genel Cerrahi',
        'Dahiliye',
        'Kulak Burun Boğaz',
        'Psikiyatri'
    ];

    // Doktorları yükle
    const fetchDoctors = async (page = 1) => {
        try {
            dispatch(fetchDoctorsStart());

            const params = {
                page,
                limit: 12,
                search: searchTerm,
                speciality: selectedSpeciality,
                minRating: minRating || undefined
            };

            const response = await doctorService.getAllDoctors(params);
            dispatch(fetchDoctorsSuccess(response.data || response));
        } catch (err) {
            dispatch(fetchDoctorsFailure(err.message));
            message.error('Doktorlar yüklenirken hata oluştu');
        }
    };

    // Arama ve filtreler değiştiğinde doktorları getir
    useEffect(() => {
        let isMounted = true;
        let timeoutId;
        timeoutId = setTimeout(() => {
            if (isMounted) {
                fetchDoctors(currentPage);
            }
        }, 300);
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedSpeciality, minRating, currentPage]);

    // Arama butonu veya enter ile sadece sayfayı 1'e çek
    const handleSearch = () => {
        setCurrentPage(1);
    };

    // Sayfa değişimi
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchDoctors(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filtreleri temizle
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedSpeciality('');
        setMinRating(0);
        setCurrentPage(1);
        fetchDoctors(1);
    };

    // Doktor kartına tıklama
    const handleDoctorClick = (doctorId) => {
        navigate(`/dashboard/patient/doctors/${doctorId}`);
    };

    // Randevu al butonu
    const handleBookAppointment = (doctorId) => {
        navigate(`/dashboard/patient/create-appointment?doctorId=${doctorId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Başlık */}
                <div className="mb-8">
                    <Title level={2} className="!mb-2">
                        <MedicineBoxOutlined className="mr-2" />
                        Doktorlarımız
                    </Title>
                    <Text type="secondary" className="text-lg">
                        {pagination.total} doktor arasından size uygun olanı bulun
                    </Text>
                </div>

                {/* Arama ve Filtreler */}
                <Card className="mb-6">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                size="large"
                                placeholder="Doktor adı veya branş ara..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                size="large"
                                placeholder="Branş seçin"
                                style={{ width: '100%' }}
                                value={selectedSpeciality || undefined}
                                onChange={setSelectedSpeciality}
                                allowClear
                            >
                                {specialities.map(spec => (
                                    <Option key={spec} value={spec}>{spec}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                size="large"
                                placeholder="Min. puan"
                                style={{ width: '100%' }}
                                value={minRating || undefined}
                                onChange={setMinRating}
                                allowClear
                            >
                                <Option value={4.5}>4.5+ Yıldız</Option>
                                <Option value={4.0}>4.0+ Yıldız</Option>
                                <Option value={3.5}>3.5+ Yıldız</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Space style={{ width: '100%' }}>
                                <Button
                                    size="large"
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleSearch}
                                    block
                                >
                                    Ara
                                </Button>
                                <Button
                                    size="large"
                                    icon={<FilterOutlined />}
                                    onClick={handleClearFilters}
                                >
                                    Temizle
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Hata mesajı */}
                {error && (
                    <Card className="mb-6 border-red-300">
                        <Text type="danger">{error}</Text>
                    </Card>
                )}

                {/* Yükleniyor */}
                {loading && (
                    <div className="text-center py-20">
                        <Spin size="large" tip="Doktorlar yükleniyor...">
                            <div style={{ padding: 50 }} />
                        </Spin>
                    </div>
                )}

                {/* Doktor listesi */}
                {!loading && doctors.length === 0 && (
                    <Card>
                        <Empty
                            description="Doktor bulunamadı"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button type="primary" onClick={handleClearFilters}>
                                Filtreleri Temizle
                            </Button>
                        </Empty>
                    </Card>
                )}

                {!loading && doctors.length > 0 && (
                    <>
                        <Row gutter={[16, 16]}>
                            {doctors.map((doctor) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={doctor._id}>
                                    <Card
                                        hoverable
                                        className="h-full transition-all duration-200 hover:shadow-lg"
                                        onClick={() => handleDoctorClick(doctor._id)}
                                    >
                                        <div className="text-center">
                                            <Avatar
                                                size={80}
                                                icon={<UserOutlined />}
                                                src={doctor.user?.avatar}
                                                className="mb-3"
                                            />
                                            <Title level={5} className="!mb-1">
                                                Dr. {doctor.user?.name || 'İsimsiz'}
                                            </Title>
                                            <Tag color="blue" className="mb-2">
                                                {doctor.speciality}
                                            </Tag>

                                            {/* Puan */}
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Rate
                                                    disabled
                                                    allowHalf
                                                    value={doctor.rating || 0}
                                                    style={{ fontSize: 14 }}
                                                />
                                                <Text type="secondary" className="text-sm">
                                                    ({doctor.reviewCount || 0})
                                                </Text>
                                            </div>

                                            {/* Hasta sayısı */}
                                            {doctor.patientCount > 0 && (
                                                <Text type="secondary" className="text-sm block mb-3">
                                                    {doctor.patientCount} hasta
                                                </Text>
                                            )}

                                            <Button
                                                type="primary"
                                                icon={<CalendarOutlined />}
                                                block
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBookAppointment(doctor._id);
                                                }}
                                            >
                                                Randevu Al
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Sayfalama */}
                        {pagination.pages > 1 && (
                            <div className="text-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={pagination.total}
                                    pageSize={pagination.limit}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    showTotal={(total) => `Toplam ${total} doktor`}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorList;
