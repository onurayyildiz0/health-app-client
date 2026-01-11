import { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Avatar, Tag, Spin, Empty, Typography, Pagination, InputNumber } from 'antd';
import { SearchOutlined, MedicineBoxOutlined, UserOutlined, EnvironmentOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Slices
import { fetchAllDoctors, selectAllDoctors, selectDoctorLoading, selectDoctorError, selectDoctorPagination } from '../../store/slices/doctorSlice';
import { fetchAllSpecialities, selectAllSpecialities } from '../../store/slices/specialitySlice';
import { fetchProvinces, fetchDistricts, fetchNeighborhoods, selectProvinces, selectDistricts, selectNeighborhoods, clearDistrictsAndNeighborhoods, clearNeighborhoods } from '../../store/slices/locationSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const DoctorList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux Selectors
    const doctors = useSelector(selectAllDoctors);
    const specialities = useSelector(selectAllSpecialities);
    const loading = useSelector(selectDoctorLoading);
    const error = useSelector(selectDoctorError);
    const pagination = useSelector(selectDoctorPagination);
    
    // Location Selectors
    const provinces = useSelector(selectProvinces);
    const districts = useSelector(selectDistricts);
    const neighborhoods = useSelector(selectNeighborhoods);

    // Local UI State (Filters)
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState(null);
    const [minRating, setMinRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterMinPrice, setFilterMinPrice] = useState(null);
    const [filterMaxPrice, setFilterMaxPrice] = useState(null);

    // Location Filter State
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(null);
    
    // Backend'e gönderilecek isimler
    const [filterProvince, setFilterProvince] = useState(null);
    const [filterDistrict, setFilterDistrict] = useState(null);
    const [filterNeighborhood, setFilterNeighborhood] = useState(null);

    // Initialize Data
    useEffect(() => {
        dispatch(fetchAllSpecialities());
        dispatch(fetchProvinces());
    }, [dispatch]);

    // Fetch Doctors on Filter Change
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
                maxPrice: filterMaxPrice || undefined
            };
            dispatch(fetchAllDoctors(params));
        }, 500); // Debounce

        return () => clearTimeout(timer);
    }, [dispatch, searchTerm, selectedSpeciality, minRating, filterProvince, filterDistrict, filterNeighborhood, filterMinPrice, filterMaxPrice, currentPage]);

    // Location Handlers
    const handleProvinceChange = (val, option) => {
        setSelectedProvinceId(val);
        setFilterProvince(option ? option.children : null);
        
        // Reset sub-levels
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
                <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex justify-between items-center">
                    <div>
                        <Title level={2} className="!mb-0 flex items-center gap-2"><MedicineBoxOutlined className="text-blue-600"/> Doktorlarımız</Title>
                        <Text type="secondary">{pagination.total} uzman listeleniyor</Text>
                    </div>
                </div>

                <Card className="mb-8 rounded-2xl shadow-sm border-0" bodyStyle={{ padding: '24px' }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={5}>
                            <Input prefix={<SearchOutlined />} placeholder="İsim ile ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </Col>
                        <Col xs={12} md={3}>
                            <Select placeholder="Branş" className="w-full" allowClear value={selectedSpeciality} onChange={setSelectedSpeciality}>
                                {specialities.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={12} md={3}>
                            <Select placeholder="İl" className="w-full" allowClear showSearch value={selectedProvinceId} onChange={handleProvinceChange} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {provinces.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={12} md={3}>
                            <Select placeholder="İlçe" className="w-full" allowClear showSearch value={selectedDistrictId} onChange={handleDistrictChange} disabled={!selectedProvinceId} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {districts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={12} md={3}>
                            <Select placeholder="Mahalle" className="w-full" allowClear showSearch value={selectedNeighborhoodId} onChange={handleNeighborhoodChange} disabled={!selectedDistrictId} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {neighborhoods.map(n => <Option key={n.id} value={n.id}>{n.name}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={24} md={4}>
                            <div className="flex gap-2">
                                <InputNumber placeholder="Min ₺" className="w-full" min={0} value={filterMinPrice} onChange={setFilterMinPrice} />
                                <InputNumber placeholder="Max ₺" className="w-full" min={0} value={filterMaxPrice} onChange={setFilterMaxPrice} />
                            </div>
                        </Col>
                        <Col xs={24} md={2}>
                            <Select placeholder="Puan" className="w-full" allowClear value={minRating || null} onChange={setMinRating}>
                                <Option value={4}>4 Yıldız+</Option>
                                <Option value={3}>3 Yıldız+</Option>
                            </Select>
                        </Col>
                        <Col xs={24} md={1}>
                            <Button icon={<ClearOutlined />} block onClick={handleClear} title="Filtreleri Temizle" />
                        </Col>
                    </Row>
                </Card>

                {error ? <div className="text-red-500 text-center">{error}</div> : loading ? <div className="text-center py-20"><Spin size="large" /></div> : doctors.length === 0 ? <Empty description="Doktor bulunamadı" /> : (
                    <>
                        <Row gutter={[24, 24]}>
                            {doctors.map(doc => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={doc.id}>
                                    <Card hoverable className="h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border-0" bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/dashboard/patient/doctors/${doc.id}`)}>
                                        <div className="p-6 text-center bg-gradient-to-b from-blue-50 to-white relative">
                                            <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded font-bold text-yellow-500 text-xs">⭐ {doc.rating ? doc.rating.toFixed(1) : 0}</div>
                                            <Avatar size={100} src={doc.user?.avatar} icon={<UserOutlined />} className="mb-3 border-4 border-white shadow" />
                                            <Title level={5} className="!mb-0 line-clamp-1">Dr. {doc.user?.name}</Title>
                                            <Tag color="blue" className="mt-1">{getSpecName(doc)}</Tag>
                                            <div className="mt-2 font-bold text-gray-600 text-sm">{doc.consultationFee ? `${doc.consultationFee} ₺` : <span className="text-green-600">Ücretsiz</span>}</div>
                                        </div>
                                        <div className="p-5 pt-0 flex-grow flex flex-col justify-between">
                                            <div className="mb-4 text-gray-500 text-sm flex gap-2"><EnvironmentOutlined className="mt-1 text-blue-400" /><span className="line-clamp-2">{doc.fullLocation || doc.location || 'Konum belirtilmemiş'}</span></div>
                                            <Button type="primary" block className="rounded-xl bg-blue-600" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/patient/create-appointment?doctorId=${doc.id}`); }}>Randevu Al</Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <div className="flex justify-center mt-8"><Pagination current={currentPage} total={pagination.total} pageSize={pagination.limit} onChange={p => { setCurrentPage(p); window.scrollTo(0,0); }} showSizeChanger={false} /></div>
                    </>
                )}
            </div>
        </div>
    );
};
export default DoctorList;