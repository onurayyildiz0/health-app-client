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
    FilterOutlined,
    EnvironmentOutlined
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
    const [selectedLocation, setSelectedLocation] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Benzersiz lokasyonları çıkar
    const locations = [...new Set(doctors.map(d => d.location).filter(Boolean))].sort();

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
                minRating: minRating || undefined,
                location: selectedLocation || undefined
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
    }, [searchTerm, selectedSpeciality, minRating, selectedLocation, priceRange, currentPage]);

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
        setSelectedLocation('');
        setPriceRange('');
        setCurrentPage(1);
        fetchDoctors(1);
    };

    // Fiyat filtreleme (frontend'de)
    const filteredDoctors = doctors.filter(doctor => {
        if (!priceRange) return true;
        
        const fee = doctor.consultationFee || 0;
        
        switch(priceRange) {
            case '0-200':
                return fee <= 200;
            case '200-500':
                return fee > 200 && fee <= 500;
            case '500-1000':
                return fee > 500 && fee <= 1000;
            case '1000+':
                return fee > 1000;
            default:
                return true;
        }
    });

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
                <Card className="mb-6 shadow-sm">
                    <Row gutter={[16, 16]}>
                        {/* Arama Kutusu */}
                        <Col xs={24} lg={8}>
                            <Input
                                size="large"
                                placeholder="Doktor adı veya branş ara..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onPressEnter={handleSearch}
                                className="w-full"
                            />
                        </Col>

                        {/* Branş Seçimi */}
                        <Col xs={24} sm={12} lg={4}>
                            <Select
                                size="large"
                                placeholder="Branş"
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

                        {/* Lokasyon */}
                        <Col xs={24} sm={12} lg={4}>
                            <Select
                                size="large"
                                placeholder="Lokasyon"
                                style={{ width: '100%' }}
                                value={selectedLocation || undefined}
                                onChange={setSelectedLocation}
                                allowClear
                                showSearch
                            >
                                {locations.map(loc => (
                                    <Option key={loc} value={loc}>
                                        <EnvironmentOutlined className="mr-1" />
                                        {loc}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        {/* Fiyat Aralığı */}
                        <Col xs={24} sm={12} lg={3}>
                            <Select
                                size="large"
                                placeholder="Fiyat"
                                style={{ width: '100%' }}
                                value={priceRange || undefined}
                                onChange={setPriceRange}
                                allowClear
                            >
                                <Option value="0-200">₺0-200</Option>
                                <Option value="200-500">₺200-500</Option>
                                <Option value="500-1000">₺500-1K</Option>
                                <Option value="1000+">₺1K+</Option>
                            </Select>
                        </Col>

                        {/* Min. Puan */}
                        <Col xs={24} sm={12} lg={3}>
                            <Select
                                size="large"
                                placeholder="Puan"
                                style={{ width: '100%' }}
                                value={minRating || undefined}
                                onChange={setMinRating}
                                allowClear
                            >
                                <Option value={4.5}>⭐ 4.5+</Option>
                                <Option value={4.0}>⭐ 4.0+</Option>
                                <Option value={3.5}>⭐ 3.5+</Option>
                            </Select>
                        </Col>

                        {/* Temizle Butonu */}
                        <Col xs={24} lg={2}>
                            <Button
                                size="large"
                                icon={<FilterOutlined />}
                                onClick={handleClearFilters}
                                block
                                className="w-full"
                            >
                                Temizle
                            </Button>
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

                {!loading && filteredDoctors.length > 0 && (
                    <>
                        <Row gutter={[16, 16]}>
                            {filteredDoctors.map((doctor) => (
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

                                            {/* Lokasyon */}
                                            {doctor.location && (
                                                <div className="mb-2">
                                                    <Text type="secondary" className="text-sm">
                                                        <EnvironmentOutlined className="mr-1" />
                                                        {doctor.location}
                                                    </Text>
                                                </div>
                                            )}

                                            {/* Muayene Ücreti */}
                                            {doctor.consultationFee > 0 && (
                                                <div className="mb-2">
                                                    <Text strong className="text-base" style={{ color: '#1890ff' }}>
                                                        ₺{doctor.consultationFee}
                                                    </Text>
                                                    <Text type="secondary" className="text-xs"> / saat</Text>
                                                </div>
                                            )}

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
