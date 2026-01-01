import { useState, useEffect } from 'react';
import {
    Card, Row, Col, Input, Select, Button, Avatar, Tag, Spin, Empty, 
    Rate, Typography, Pagination, message
} from 'antd';
import {
    SearchOutlined, MedicineBoxOutlined, UserOutlined,
    EnvironmentOutlined, CalendarOutlined, ClearOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDoctorsStart, fetchDoctorsSuccess, fetchDoctorsFailure,
    selectAllDoctors, selectDoctorLoading, selectDoctorError, selectDoctorPagination
} from '../../store/slices/doctorSlice';
import * as doctorService from '../../api/doctorService';
import specialityService from '../../api/specialityService';

const { Title, Text } = Typography;
const { Option } = Select;

const DoctorList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const doctors = useSelector(selectAllDoctors);
    const loading = useSelector(selectDoctorLoading);
    const error = useSelector(selectDoctorError);
    const pagination = useSelector(selectDoctorPagination);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState(null); // ID olarak tutulacak
    const [minRating, setMinRating] = useState(0);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // API'den çekilen uzmanlık listesi
    const [specialityList, setSpecialityList] = useState([]);

    const locations = [...new Set(doctors.map(d => d.location).filter(Boolean))].sort();

    useEffect(() => {
        // Uzmanlıkları çek
        const loadSpecialities = async () => {
            try {
                const res = await specialityService.getAllSpecialities();
                setSpecialityList(res.data || res || []);
            } catch (err) {
                console.error("Uzmanlıklar yüklenemedi", err);
            }
        };
        loadSpecialities();
    }, []);

    const fetchDoctors = async (page = 1) => {
        try {
            dispatch(fetchDoctorsStart());
            const params = {
                page,
                limit: 12,
                search: searchTerm,
                speciality: selectedSpeciality, // Backend int bekliyorsa ID gider
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

    useEffect(() => {
        const timeoutId = setTimeout(() => fetchDoctors(currentPage), 500);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line
    }, [searchTerm, selectedSpeciality, minRating, selectedLocation, currentPage]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedSpeciality(null);
        setMinRating(0);
        setSelectedLocation('');
        setCurrentPage(1);
    };

    // Helper: Doktorun uzmanlık adını bulma
    const getSpecialityName = (doctor) => {
        // 1. Navigation property varsa
        if (doctor.specialityNavigation?.name) return doctor.specialityNavigation.name;
        // 2. Speciality zaten bir obje geldiyse
        if (typeof doctor.speciality === 'object' && doctor.speciality?.name) return doctor.speciality.name;
        // 3. Speciality bir ID ise ve bizde liste varsa
        if (specialityList.length > 0) {
            const found = specialityList.find(s => s.id === doctor.speciality);
            if (found) return found.name;
        }
        return 'Belirtilmemiş';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 bg-gradient-to-r from-white to-blue-50 p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <Title level={2} className="!mb-1 !text-gray-800 flex items-center gap-3">
                            <span className="bg-blue-100 p-2 rounded-xl text-blue-600"><MedicineBoxOutlined /></span>
                            Doktorlarımız
                        </Title>
                        <Text type="secondary" className="text-gray-500 ml-1">
                            Toplam {pagination.total} uzman doktor listeleniyor
                        </Text>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-8 shadow-sm border-0 rounded-2xl overflow-hidden" bodyStyle={{ padding: '24px' }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={8} lg={6}>
                            <Input
                                size="large"
                                placeholder="Doktor adı ara..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-xl bg-gray-50 hover:bg-white focus:bg-white border-gray-200"
                            />
                        </Col>
                        <Col xs={12} md={8} lg={5}>
                            <Select
                                size="large"
                                placeholder="Branş Seçin"
                                className="w-full"
                                value={selectedSpeciality || undefined}
                                onChange={setSelectedSpeciality}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {specialityList.map(spec => <Option key={spec.id} value={spec.id}>{spec.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={12} md={8} lg={5}>
                            <Select
                                size="large"
                                placeholder="Konum"
                                className="w-full"
                                value={selectedLocation || undefined}
                                onChange={setSelectedLocation}
                                allowClear
                                showSearch
                            >
                                {locations.map(loc => <Option key={loc} value={loc}>{loc}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={12} md={12} lg={4}>
                            <Select
                                size="large"
                                placeholder="Puan Filtresi"
                                className="w-full"
                                value={minRating || undefined}
                                onChange={setMinRating}
                                allowClear
                            >
                                <Option value={4.5}>⭐ 4.5 ve üzeri</Option>
                                <Option value={4.0}>⭐ 4.0 ve üzeri</Option>
                            </Select>
                        </Col>
                        <Col xs={12} md={12} lg={4}>
                            <Button size="large" icon={<ClearOutlined />} onClick={handleClearFilters} block className="rounded-xl border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-600">
                                Temizle
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Content */}
                {error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100">{error}</div>
                ) : loading ? (
                    <div className="flex justify-center py-32"><Spin size="large" tip="Doktorlar yükleniyor..." /></div>
                ) : doctors.length === 0 ? (
                    <Empty
                        description={<span className="text-gray-500">Kriterlere uygun doktor bulunamadı</span>}
                        className="py-20 bg-white rounded-3xl shadow-sm"
                    >
                        <Button type="primary" onClick={handleClearFilters} className="rounded-lg mt-4">Filtreleri Sıfırla</Button>
                    </Empty>
                ) : (
                    <>
                        <Row gutter={[24, 24]}>
                            {doctors.map((doctor) => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={doctor.id}>
                                    <Card
                                        hoverable
                                        className="h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-0 bg-white group"
                                        bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
                                        onClick={() => navigate(`/dashboard/patient/doctors/${doctor.id}`)}
                                    >
                                        <div className="p-6 text-center bg-gradient-to-b from-blue-50 via-white to-white relative">
                                            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-yellow-500 shadow-sm flex items-center gap-1">
                                                <Rate disabled count={1} value={1} className="text-xs" /> {doctor.rating || 0}
                                            </div>
                                            <Avatar
                                                size={110}
                                                src={doctor.user?.avatar}
                                                icon={<UserOutlined />}
                                                className="border-4 border-white shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <Title level={5} className="!mb-1 !text-gray-800 line-clamp-1">Dr. {doctor.user?.name}</Title>
                                            {/* Özel Fonksiyon ile Uzmanlık Adı Gösterimi */}
                                            <Tag color="blue" className="px-3 py-1 rounded-full border-0 bg-blue-50 text-blue-600 font-medium">
                                                {getSpecialityName(doctor)}
                                            </Tag>
                                        </div>
                                        
                                        <div className="p-5 pt-0 flex-grow flex flex-col justify-between">
                                            <div className="space-y-3 mb-6">
                                                {doctor.location && (
                                                    <div className="flex items-start gap-2 text-gray-500 text-sm">
                                                        <EnvironmentOutlined className="mt-1 text-blue-400" />
                                                        <span className="line-clamp-2">{doctor.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-xl">
                                                    <span className="text-gray-500">Muayene:</span>
                                                    <span className="font-bold text-blue-600">₺{doctor.consultationFee || 'Belirtilmedi'}</span>
                                                </div>
                                            </div>
                                            <Button 
                                                type="primary" 
                                                block 
                                                icon={<CalendarOutlined />}
                                                className="rounded-xl h-11 font-medium bg-blue-600 hover:bg-blue-700 border-none shadow-blue-200 shadow-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/patient/create-appointment?doctorId=${doctor.id}`);
                                                }}
                                            >
                                                Randevu Al
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <div className="flex justify-center mt-12 pb-8">
                            <Pagination
                                current={currentPage}
                                total={pagination.total}
                                pageSize={pagination.limit}
                                onChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                showSizeChanger={false}
                                className="bg-white p-2 rounded-full shadow-sm"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorList;