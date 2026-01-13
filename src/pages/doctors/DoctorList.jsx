import { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Avatar, Tag, Spin, Empty, Typography, Pagination, InputNumber, Divider } from 'antd';
import { SearchOutlined, MedicineBoxOutlined, UserOutlined, EnvironmentOutlined, ClearOutlined, SortAscendingOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


import { fetchAllDoctors, selectAllDoctors, selectDoctorLoading, selectDoctorError, selectDoctorPagination } from '../../store/slices/doctorSlice';
import { fetchAllSpecialities, selectAllSpecialities } from '../../store/slices/specialitySlice';
import { fetchProvinces, fetchDistricts, fetchNeighborhoods, selectProvinces, selectDistricts, selectNeighborhoods, clearDistrictsAndNeighborhoods, clearNeighborhoods } from '../../store/slices/locationSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const DoctorList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    
    const doctors = useSelector(selectAllDoctors);
    const specialities = useSelector(selectAllSpecialities);
    const loading = useSelector(selectDoctorLoading);
    const error = useSelector(selectDoctorError);
    const pagination = useSelector(selectDoctorPagination);
    
    
    const provinces = useSelector(selectProvinces);
    const districts = useSelector(selectDistricts);
    const neighborhoods = useSelector(selectNeighborhoods);

    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState(null);
    const [minRating, setMinRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    
    const [filterMinPrice, setFilterMinPrice] = useState(null);
    const [filterMaxPrice, setFilterMaxPrice] = useState(null);

    
    const [sortBy, setSortBy] = useState(null);

    
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(null);
    
    const [filterProvince, setFilterProvince] = useState(null);
    const [filterDistrict, setFilterDistrict] = useState(null);
    const [filterNeighborhood, setFilterNeighborhood] = useState(null);

    
    useEffect(() => {
        dispatch(fetchAllSpecialities());
        dispatch(fetchProvinces());
    }, [dispatch]);

    
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = {
                page: currentPage,
                limit: 12,
                search: searchTerm,
                speciality: selectedSpeciality,
                minRating: minRating || undefined,
                province: filterProvince || undefined,
                district: filterDistrict || undefined,
                neighborhood: filterNeighborhood || undefined,
                minPrice: filterMinPrice || undefined,
                maxPrice: filterMaxPrice || undefined,
                sort: sortBy || undefined 
            };
            dispatch(fetchAllDoctors(params));
        }, 500); 

        return () => clearTimeout(timer);
    }, [dispatch, searchTerm, selectedSpeciality, minRating, filterProvince, filterDistrict, filterNeighborhood, filterMinPrice, filterMaxPrice, sortBy, currentPage]);

    
    const handleProvinceChange = (val, option) => {
        setSelectedProvinceId(val);
        setFilterProvince(option ? option.children : null);
        
        setSelectedDistrictId(null); setFilterDistrict(null);
        setSelectedNeighborhoodId(null); setFilterNeighborhood(null);
        dispatch(clearDistrictsAndNeighborhoods());

        if (val) dispatch(fetchDistricts(val));
    };

    const handleDistrictChange = (val, option) => {
        setSelectedDistrictId(val);
        setFilterDistrict(option ? option.children : null);
        
        setSelectedNeighborhoodId(null);
        setFilterNeighborhood(null);
        dispatch(clearNeighborhoods());

        if (val) dispatch(fetchNeighborhoods(val));
    };

    const handleNeighborhoodChange = (val, option) => {
        setSelectedNeighborhoodId(val);
        setFilterNeighborhood(option ? option.children : null);
    };

    const handleClear = () => {
        setSearchTerm(''); setSelectedSpeciality(null); setMinRating(0);
        setFilterMinPrice(null); setFilterMaxPrice(null);
        setSortBy(null);
        
        setSelectedProvinceId(null); setFilterProvince(null);
        setSelectedDistrictId(null); setFilterDistrict(null);
        setSelectedNeighborhoodId(null); setFilterNeighborhood(null);
        
        dispatch(clearDistrictsAndNeighborhoods());
        setCurrentPage(1);
    };

    const getSpecName = (d) => {
        if (d.specialityNavigation?.name) return d.specialityNavigation.name;
        const found = specialities.find(s => s.id === d.speciality);
        return found ? found.name : '';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Title level={2} className="!mb-0 flex items-center gap-2"><MedicineBoxOutlined className="text-blue-600"/> Doktorlarımız</Title>
                        <Text type="secondary">{pagination.total} uzman listeleniyor</Text>
                    </div>
                </div>

                <Card className="mb-8 rounded-2xl shadow-sm border-0" bodyStyle={{ padding: '24px' }}>
                    {/* 1. SATIR: Temel Arama, Branş ve Sıralama */}
                    <Row gutter={[16, 16]} className="mb-4">
                        <Col xs={24} md={10} lg={10}>
                            <Input 
                                prefix={<SearchOutlined className="text-gray-400" />} 
                                placeholder="Doktor adı ile ara..." 
                                size="large" 
                                className="rounded-lg"
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </Col>
                        <Col xs={12} md={7} lg={7}>
                            <Select 
                                placeholder="Uzmanlık Alanı / Branş" 
                                className="w-full" 
                                size="large"
                                allowClear 
                                value={selectedSpeciality} 
                                onChange={setSelectedSpeciality}
                            >
                                {specialities.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={12} md={7} lg={7}>
                            <Select 
                                placeholder="Sıralama Ölçütü" 
                                className="w-full" 
                                size="large"
                                allowClear 
                                value={sortBy} 
                                onChange={setSortBy}
                                suffixIcon={<SortAscendingOutlined />}
                            >
                                <Option value="price_asc">En Düşük Ücret</Option>
                                <Option value="price_desc">En Yüksek Ücret</Option>
                                <Option value="rating_desc">En Yüksek Puan</Option>
                                <Option value="rating_asc">En Düşük Puan</Option>
                            </Select>
                        </Col>
                    </Row>

                    <Divider className="my-4" dashed />

                    {/* 2. SATIR: Detaylı Konum, Fiyat ve Puan */}
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={8} md={4}>
                            <Select placeholder="İl" className="w-full" allowClear showSearch value={selectedProvinceId} onChange={handleProvinceChange} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {provinces.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                            <Select placeholder="İlçe" className="w-full" allowClear showSearch value={selectedDistrictId} onChange={handleDistrictChange} disabled={!selectedProvinceId} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {districts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                            <Select placeholder="Mahalle" className="w-full" allowClear showSearch value={selectedNeighborhoodId} onChange={handleNeighborhoodChange} disabled={!selectedDistrictId} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {neighborhoods.map(n => <Option key={n.id} value={n.id}>{n.name}</Option>)}
                            </Select>
                        </Col>
                        
                        <Col xs={24} sm={12} md={6}>
                            <Input.Group compact className="flex w-full">
                                <InputNumber style={{ width: '50%' }} placeholder="Min ₺" min={0} value={filterMinPrice} onChange={setFilterMinPrice} />
                                <InputNumber style={{ width: '50%' }} placeholder="Max ₺" min={0} value={filterMaxPrice} onChange={setFilterMaxPrice} />
                            </Input.Group>
                        </Col>
                        
                        <Col xs={24} sm={12} md={4}>
                            <Select placeholder="Min Puan" className="w-full" allowClear value={minRating || null} onChange={setMinRating}>
                                <Option value={4}>4 Yıldız ve Üzeri</Option>
                                <Option value={3}>3 Yıldız ve Üzeri</Option>
                            </Select>
                        </Col>
                        
                        <Col xs={24} md={2}>
                            <Button type="default" icon={<ClearOutlined />} block onClick={handleClear} className="border-red-200 text-red-500 hover:text-red-700 hover:border-red-400">
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {error ? <div className="text-red-500 text-center bg-white p-8 rounded-xl shadow-sm">{error}</div> : loading ? <div className="text-center py-20"><Spin size="large" /></div> : doctors.length === 0 ? <Empty description="Kriterlere uygun doktor bulunamadı" className="bg-white p-12 rounded-2xl shadow-sm" /> : (
                    <>
                        <Row gutter={[24, 24]}>
                            {doctors.map(doc => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={doc.id}>
                                    <Card hoverable className="h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border-0 transition-all duration-300" bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/dashboard/patient/doctors/${doc.id}`)}>
                                        <div className="p-6 text-center bg-gradient-to-b from-blue-50 to-white relative group">
                                            <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-lg font-bold text-yellow-500 text-xs shadow-sm flex items-center gap-1">
                                                <span>⭐</span> {doc.rating ? doc.rating.toFixed(1) : 'Yeni'}
                                            </div>
                                            <Avatar size={100} src={doc.user?.avatar} icon={<UserOutlined />} className="mb-3 border-4 border-white shadow-md group-hover:scale-105 transition-transform" />
                                            <Title level={5} className="!mb-0 line-clamp-1 text-gray-800">Dr. {doc.user?.name}</Title>
                                            <Tag color="blue" className="mt-2 px-3 py-0.5 rounded-full border-0 bg-blue-100 text-blue-700">{getSpecName(doc)}</Tag>
                                            <div className="mt-3 font-bold text-lg text-gray-700">{doc.consultationFee ? `${doc.consultationFee} ₺` : <span className="text-green-600">Ücretsiz</span>}</div>
                                        </div>
                                        <div className="p-5 pt-2 flex-grow flex flex-col justify-between">
                                            <div className="mb-4 text-gray-500 text-sm flex gap-2 items-start bg-gray-50 p-2 rounded-lg">
                                                <EnvironmentOutlined className="mt-1 text-blue-400 flex-shrink-0" />
                                                <span className="line-clamp-2">{doc.fullLocation || doc.location || 'Konum bilgisi girilmemiş'}</span>
                                            </div>
                                            <Button type="primary" block size="large" className="rounded-xl bg-blue-600 shadow-blue-200 shadow-lg border-0 hover:bg-blue-700" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/patient/create-appointment?doctorId=${doc.id}`); }}>
                                                Randevu Al
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <div className="flex justify-center mt-10 mb-8"><Pagination current={currentPage} total={pagination.total} pageSize={pagination.limit} onChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} showSizeChanger={false} /></div>
                    </>
                )}
            </div>
        </div>
    );
};
export default DoctorList;