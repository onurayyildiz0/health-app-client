import { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Input, Alert, message, ConfigProvider, Avatar, Modal, Button, Tag, Divider, Typography, InputNumber } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, EnvironmentOutlined, UserOutlined, DollarOutlined, ScheduleOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import tr_TR from 'antd/locale/tr_TR';
import 'dayjs/locale/tr';

// Slices
import { createNewAppointment, fetchDoctorBookedSlots, selectBookedSlots, selectAppointmentLoading, selectAppointmentError, clearBookedSlots } from '../../store/slices/appointmentSlice';
import { fetchAllDoctors, selectAllDoctors, selectDoctorLoading } from '../../store/slices/doctorSlice';
import { fetchAllSpecialities, selectAllSpecialities } from '../../store/slices/specialitySlice';
import { fetchProvinces, fetchDistricts, fetchNeighborhoods, selectProvinces, selectDistricts, selectNeighborhoods, clearDistrictsAndNeighborhoods, clearNeighborhoods } from '../../store/slices/locationSlice';

import { createAppointmentSchema } from '../../validations/AppointmentValidations';

dayjs.locale('tr');
dayjs.extend(isBetween);

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreateAppointment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const preSelectedDoctorId = searchParams.get('doctorId');

    // Redux Data
    const doctors = useSelector(selectAllDoctors);
    const specialities = useSelector(selectAllSpecialities);
    const bookedSlots = useSelector(selectBookedSlots);
    const appLoading = useSelector(selectAppointmentLoading);
    const docLoading = useSelector(selectDoctorLoading);
    const error = useSelector(selectAppointmentError);

    // Locations
    const provinces = useSelector(selectProvinces);
    const districts = useSelector(selectDistricts);
    const neighborhoods = useSelector(selectNeighborhoods);

    // UI States
    const [modalVisible, setModalVisible] = useState(false);

    // Filtre State'leri (Debounce ve Redux fetch için)
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState(null);
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const [filterProvince, setFilterProvince] = useState(null);
    const [filterDistrict, setFilterDistrict] = useState(null);
    const [filterNeighborhood, setFilterNeighborhood] = useState(null);

    // UI Dropdown IDs
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(null);

    const initialValues = {
        doctor: preSelectedDoctorId ? parseInt(preSelectedDoctorId) : '',
        date: null,
        start: '',
        end: '',
        notes: ''
    };

    // 1. Initial Load (Static Data)
    useEffect(() => {
        dispatch(fetchAllSpecialities());
        dispatch(fetchProvinces());
    }, [dispatch]);

    // 2. Fetch Doctors on Filter Change
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = {
                page: 1, limit: 1000,
                search: searchTerm || undefined,
                speciality: selectedSpeciality || undefined,
                province: filterProvince || undefined,
                district: filterDistrict || undefined,
                neighborhood: filterNeighborhood || undefined,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined
            };
            dispatch(fetchAllDoctors(params));
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, searchTerm, selectedSpeciality, filterProvince, filterDistrict, filterNeighborhood, minPrice, maxPrice]);

    // Location Handlers
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

        setSelectedNeighborhoodId(null); setFilterNeighborhood(null);
        dispatch(clearNeighborhoods());

        if (val) dispatch(fetchNeighborhoods(val));
    };

    const handleNeighborhoodChange = (val, option) => {
        setSelectedNeighborhoodId(val);
        setFilterNeighborhood(option ? option.children : null);
    };

    const handleClearFilters = (setFieldValue) => {
        setSearchTerm(''); setSelectedSpeciality(null);
        setMinPrice(null); setMaxPrice(null);
        setSelectedProvinceId(null); setFilterProvince(null);
        setSelectedDistrictId(null); setFilterDistrict(null);
        setSelectedNeighborhoodId(null); setFilterNeighborhood(null);
        dispatch(clearDistrictsAndNeighborhoods());
        setFieldValue('doctor', '');
        dispatch(clearBookedSlots());
    };

    // Helper Functions
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayMap = { monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba', thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar' };
    const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const getDocSpecialityName = (doc) => {
        if (doc.specialityNavigation?.name) return doc.specialityNavigation.name;
        const found = specialities.find(s => s.id === doc.speciality);
        return found ? found.name : 'Belirtilmemiş';
    };

    const handleSubmit = async (values) => {
        const appointmentData = {
            doctorId: values.doctor,
            date: dayjs(values.date).format('YYYY-MM-DD'),
            start: values.start,
            end: values.end,
            notes: values.notes || ''
        };

        try {
            // Başarılı durum
            const result = await dispatch(createNewAppointment(appointmentData));

            // Başarılı ise pending veriyi temizleyebilir veya saklayabilirsiniz (ihtiyaca göre)
            localStorage.setItem('pendingAppointment', JSON.stringify(appointmentData));
            if (result.id) localStorage.setItem('pendingAppointmentId', result.id);

            setModalVisible(false);
            navigate('/appointment-success');

        } catch (err) {
            // Hata durumu
            localStorage.setItem('pendingAppointment', JSON.stringify(appointmentData));
            setModalVisible(false); // Modalı kapat ki kullanıcı formdaki hata mesajını (Alert) görebilsin

            // Axios error objesinden status kodunu alıyoruz
            const status = err.response?.status;

            // Mantık: Eğer hata 400 (Bad Request/Validation) DEĞİLSE hata sayfasına git.
            // Eğer 400 ise sayfada kal (Redux zaten error state'ini güncellediği için yukarıdaki Alert bileşeni hatayı gösterecektir).
            if (status !== 400) {
                navigate('/appointment-failed');
            }
        }
    };

    // Process doctors for display (parse JSON fields)
    const processedDoctors = doctors.map(doc => {
        let parsedClocks = {}, parsedUnavailable = [];
        try { parsedClocks = typeof doc.clocks === 'string' ? JSON.parse(doc.clocks) : doc.clocks || {}; } catch { }
        try {
            const rawDates = typeof doc.unavailableDates === 'string' ? JSON.parse(doc.unavailableDates) : doc.unavailableDates;
            const datesList = Array.isArray(rawDates) ? rawDates : (rawDates ? Object.values(rawDates) : []);
            parsedUnavailable = datesList.filter(d => !d.IsDeleted).map(d => ({ startDate: d.startDate || d.StartDate, endDate: d.endDate || d.EndDate }));
        } catch { }
        return { ...doc, clocks: parsedClocks, unavailableDates: parsedUnavailable };
    });


    return (
        <ConfigProvider locale={tr_TR}>
            <div className="max-w-5xl mx-auto pb-12">
                <div className="text-center mb-8"><Title level={2} className="!text-gray-800">Yeni Randevu Oluştur</Title><Text type="secondary">Sağlığınız için en uygun zamanı planlayın</Text></div>
                <Formik initialValues={initialValues} validationSchema={createAppointmentSchema} onSubmit={() => setModalVisible(true)} enableReinitialize>
                    {({ values, errors, touched, setFieldValue, submitForm }) => {
                        const selectedDoctorData = processedDoctors.find(d => d.id === values.doctor);
                        const dayKey = values.date ? dayNames[dayjs(values.date).day()] : null;
                        const schedule = selectedDoctorData?.clocks?.[dayKey];

                        const generateTimeSlots = (start, end) => {
                            const slots = [];
                            if (!start || !end) return slots;
                            let current = dayjs(`2000-01-01 ${start}`);
                            const endTime = dayjs(`2000-01-01 ${end}`);
                            while (current.isBefore(endTime)) {
                                slots.push(current.format('HH:mm'));
                                current = current.add(60, 'minute');
                            }
                            return slots;
                        };
                        const timeSlots = schedule?.start && schedule?.end ? generateTimeSlots(schedule.start, schedule.end) : [];

                        const isToday = values.date && dayjs(values.date).isSame(dayjs(), 'day');

                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                                        {error && <Alert message={error} type="error" closable className="mb-4" />}
                                        <Form className="p-2 space-y-6">
                                            {/* FILTERS */}
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-gray-500 uppercase">Doktor Filtrele</span><Button type="text" size="small" icon={<ClearOutlined />} onClick={() => handleClearFilters(setFieldValue)} className="text-gray-500 text-xs">Temizle</Button></div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                    <Input prefix={<SearchOutlined className="text-gray-400" />} placeholder="Doktor ara..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setFieldValue('doctor', ''); }} className="rounded-lg" />
                                                    <Select placeholder="Branş Seçin" allowClear className="w-full rounded-lg" value={selectedSpeciality} onChange={(val) => { setSelectedSpeciality(val); setFieldValue('doctor', ''); }} showSearch filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                                        {specialities.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                    <Select placeholder="İl" className="w-full" allowClear showSearch onChange={handleProvinceChange} value={selectedProvinceId} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                                        {provinces.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                                                    </Select>
                                                    <Select placeholder="İlçe" className="w-full" allowClear showSearch disabled={!selectedProvinceId} onChange={handleDistrictChange} value={selectedDistrictId} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                                        {districts.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
                                                    </Select>
                                                    <Select placeholder="Mahalle" className="w-full" allowClear showSearch disabled={!selectedDistrictId} onChange={handleNeighborhoodChange} value={selectedNeighborhoodId} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                                        {neighborhoods.map(n => <Select.Option key={n.id} value={n.id}>{n.name}</Select.Option>)}
                                                    </Select>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Muayene Ücreti Aralığı</label>
                                                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                                                        <InputNumber bordered={false} className="flex-1 text-center" placeholder="Min ₺" min={0} value={minPrice} onChange={(val) => { setMinPrice(val); setFieldValue('doctor', ''); }} />
                                                        <div className="h-4 w-px bg-gray-300"></div>
                                                        <InputNumber bordered={false} className="flex-1 text-center" placeholder="Max ₺" min={0} value={maxPrice} onChange={(val) => { setMaxPrice(val); setFieldValue('doctor', ''); }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Uygun Doktorlar ({doctors.length})</label>
                                                    <Select size="large" placeholder={docLoading ? "Yükleniyor..." : "Doktor Seçiniz"} value={values.doctor || undefined} onChange={(val) => { setFieldValue('doctor', val); setFieldValue('date', null); setFieldValue('start', ''); setFieldValue('end', ''); dispatch(clearBookedSlots()); }} loading={docLoading} disabled={doctors.length === 0} className="w-full" showSearch filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}>
                                                        {processedDoctors.map((doc) => <Select.Option key={doc.id} value={doc.id}>Dr. {doc.user?.name} | {getDocSpecialityName(doc)} | {doc.province} / {doc.district} | {doc.consultationFee} TL</Select.Option>)}
                                                    </Select>
                                                    {errors.doctor && touched.doctor && <div className="text-red-500 text-sm mt-1">{errors.doctor}</div>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Randevu Tarihi</label>
                                                    <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY" disabled={!values.doctor} placeholder="Tarih Seçin" value={values.date} onChange={(d) => { setFieldValue('date', d); setFieldValue('start', ''); setFieldValue('end', ''); dispatch(fetchDoctorBookedSlots(values.doctor, dayjs(d).format('YYYY-MM-DD'))); }} disabledDate={(current) => {
                                                        if (!current || current < dayjs().startOf('day') || current > dayjs().add(14, 'day')) return true;
                                                        if (!selectedDoctorData) return true;
                                                        const dName = dayNames[current.day()];
                                                        if (!selectedDoctorData.clocks?.[dName]?.start) return true;
                                                        if (selectedDoctorData.unavailableDates?.some(r => current.isBetween(dayjs(r.startDate).startOf('day'), dayjs(r.endDate).endOf('day'), 'day', '[]'))) return true;
                                                        return false;
                                                    }} />
                                                    {errors.date && touched.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Randevu Saati</label>
                                                    <Select
                                                        size="large"
                                                        className="w-full"
                                                        placeholder="Saat Seçin"
                                                        disabled={!values.date || timeSlots.length === 0}
                                                        value={values.start || undefined}
                                                        onChange={(val) => {
                                                            setFieldValue('start', val);
                                                            setFieldValue('end', dayjs(`2000-01-01 ${val}`).add(1, 'hour').format('HH:mm'));
                                                        }}
                                                    >
                                                        {timeSlots.map(t => {
                                                            // 2. Mevcut slotun saat ve dakikasını alıp o günün tarihiyle birleştiriyoruz
                                                            const [h, m] = t.split(':');
                                                            const slotTime = dayjs(values.date).hour(h).minute(m);

                                                            // 3. Eğer gün bugünse ve saat şu andan önceyse true döner
                                                            const isPast = isToday && slotTime.isBefore(dayjs());

                                                            // 4. Dolu mu kontrolü (Mevcut kodunuz)
                                                            const isBooked = bookedSlots.includes(t);

                                                            // 5. Her iki durumda da disable et
                                                            const isDisabled = isBooked || isPast;

                                                            return (
                                                                <Select.Option
                                                                    key={t}
                                                                    value={t}
                                                                    disabled={isDisabled}
                                                                    className={isDisabled ? "bg-gray-100 text-gray-400" : ""}
                                                                >
                                                                    {t}
                                                                    {isBooked ? ' (Dolu)' : isPast ? ' (Geçmiş)' : ''}
                                                                </Select.Option>
                                                            );
                                                        })}
                                                    </Select>
                                                    {errors.start && touched.start && <div className="text-red-500 text-sm mt-1">{errors.start}</div>}
                                                </div>
                                            </div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label><TextArea rows={3} className="rounded-xl" placeholder="..." value={values.notes} onChange={(e) => setFieldValue('notes', e.target.value)} /></div>
                                            <div className="pt-4 flex justify-end gap-3"><Button size="large" onClick={() => navigate(-1)} className="rounded-xl">İptal</Button><Button type="primary" size="large" onClick={submitForm} disabled={!values.doctor || !values.date || !values.start} className="rounded-xl px-8 shadow-blue-300 shadow-md">İncele ve Onayla</Button></div>
                                            <Modal title={<div className="text-left w-full font-bold text-lg">Randevu Özeti</div>} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} centered width={500}>
                                                <div className="flex flex-col items-start gap-4 py-4 w-full">
                                                    <div className="flex items-center gap-4 w-full bg-blue-50 p-4 rounded-xl border border-blue-100"><Avatar size={64} src={selectedDoctorData?.user?.avatar} icon={<UserOutlined />} className="border-2 border-white shadow-sm" /><div className="text-left"><h3 className="font-bold text-lg text-gray-800 m-0">Dr. {selectedDoctorData?.user?.name}</h3><p className="text-blue-600 font-medium m-0">{selectedDoctorData ? getDocSpecialityName(selectedDoctorData) : ''}</p></div></div>
                                                    <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                                        <div className="flex justify-between text-sm items-center border-b border-gray-200 pb-2"><span className="text-gray-500 font-medium">Tarih</span><span className="font-bold text-gray-800">{values.date ? dayjs(values.date).format('DD MMMM YYYY') : ''}</span></div>
                                                        <div className="flex justify-between text-sm items-center border-b border-gray-200 pb-2"><span className="text-gray-500 font-medium">Saat</span><span className="font-bold text-gray-800">{values.start} - {values.end}</span></div>
                                                        <div className="flex justify-between text-sm items-center border-b border-gray-200 pb-2"><span className="text-gray-500 font-medium">Ücret</span><span className="font-bold text-green-600">{selectedDoctorData?.consultationFee || '-'} ₺</span></div>
                                                        <div className="flex justify-between text-sm items-center"><span className="text-gray-500 font-medium">Lokasyon</span><span className="font-bold text-gray-800">{selectedDoctorData?.fullLocation || selectedDoctorData?.location}</span></div>
                                                    </div>
                                                    <Button type="primary" block size="large" className="mt-2 h-12 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 border-0 shadow-lg shadow-blue-200" onClick={() => handleSubmit(values)} loading={appLoading}>Randevuyu Onayla</Button>
                                                </div>
                                            </Modal>
                                        </Form>
                                    </Card>
                                </div>
                                <div className="lg:col-span-1">
                                    <Card className="shadow-lg border-0 rounded-2xl h-full bg-gradient-to-b from-blue-50 to-white">
                                        {!selectedDoctorData ? <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 text-center"><MedicineBoxOutlined className="text-6xl mb-4 opacity-30" /><p>Detayları görmek için<br />bir doktor seçiniz.</p></div> : (
                                            <div className="animate-fade-in w-full">
                                                <div className="flex items-center gap-4 mb-4"><Avatar size={80} src={selectedDoctorData.user?.avatar} icon={<UserOutlined />} className="shadow-md border-4 border-white shrink-0" /><div className="text-left"><Title level={4} className="!mb-0 !mt-0 !text-lg">Dr. {selectedDoctorData.user?.name}</Title><Tag color="blue" className="mt-1 border-0">{getDocSpecialityName(selectedDoctorData)}</Tag></div></div>
                                                <Divider className="my-4" />
                                                <div className="w-full space-y-4 text-left">
                                                    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-50 shadow-sm"><EnvironmentOutlined className="mt-1 text-red-500 text-lg" /><div><span className="block text-xs font-bold text-gray-400 uppercase">Konum</span><span className="text-gray-700 font-medium">{selectedDoctorData.fullLocation || selectedDoctorData.location || 'Konum belirtilmemiş'}</span></div></div>
                                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-50 shadow-sm"><DollarOutlined className="text-green-500 text-lg" /><div><span className="block text-xs font-bold text-gray-400 uppercase">Ücret</span><span className="text-gray-800 font-bold text-lg">{selectedDoctorData.consultationFee ? `${selectedDoctorData.consultationFee} ₺` : 'Ücretsiz'}</span></div></div>
                                                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm"><div className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><ScheduleOutlined className="text-blue-500" /> Çalışma Saatleri</div><div className="space-y-2">{weekOrder.map(dayKey => { const dayData = selectedDoctorData.clocks?.[dayKey]; if (!dayData?.start) return null; return <div key={dayKey} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0"><span className="text-gray-600 font-medium">{dayMap[dayKey]}</span><Tag className="m-0 bg-blue-50 border-blue-100 text-blue-600 rounded-md px-2">{dayData.start} - {dayData.end}</Tag></div> })}</div></div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </div>
                        );
                    }}
                </Formik>
            </div>
        </ConfigProvider>
    );
};

export default CreateAppointment;