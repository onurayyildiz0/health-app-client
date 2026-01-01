import { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Input, Alert, message, ConfigProvider, Avatar, Modal, Button, Tag, Divider, Typography } from 'antd';
import { 
    MedicineBoxOutlined, SearchOutlined, EnvironmentOutlined, 
    UserOutlined, DollarOutlined, ScheduleOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import tr_TR from 'antd/locale/tr_TR';
import * as appointmentService from '../../api/appointmentService';
import axiosInstance from '../../api/axios';
import specialityService from '../../api/specialityService'; // Eklendi
import { createAppointmentSchema } from '../../validations/AppointmentValidations';
import { selectAppointmentLoading, selectAppointmentError } from '../../store/slices/appointmentSlice';

dayjs.extend(isBetween);
const { TextArea } = Input;
const { Title, Text } = Typography;

const CreateAppointment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedDoctorId = searchParams.get('doctorId');

    const loading = useSelector(selectAppointmentLoading);
    const error = useSelector(selectAppointmentError);

    const [doctors, setDoctors] = useState([]);
    const [specialities, setSpecialities] = useState([]); // Uzmanlık Listesi
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState(null); // ID olacak
    const [selectedLocation, setSelectedLocation] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    
    // Formik için başlangıç değerleri
    const initialValues = { 
        doctor: preSelectedDoctorId ? parseInt(preSelectedDoctorId) : '', 
        date: null, 
        start: '', 
        end: '', 
        notes: '' 
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoadingDoctors(true);
                // Paralel veri çekme
                const [docRes, specRes] = await Promise.all([
                    axiosInstance.get('/doctors'),
                    specialityService.getAllSpecialities()
                ]);

                setSpecialities(specRes.data || specRes || []);

                const rawDoctors = docRes.data?.data?.doctors || [];
                const processedDoctors = rawDoctors.map(doc => {
                    let parsedClocks = {};
                    if (doc.clocks && typeof doc.clocks === 'string') {
                        try {
                            parsedClocks = JSON.parse(doc.clocks);
                        } catch (e) {
                            console.error("Saat verisi parse edilemedi", e);
                        }
                    } else if (typeof doc.clocks === 'object') {
                        parsedClocks = doc.clocks;
                    }

                    return {
                        ...doc,
                        clocks: parsedClocks,
                        unavailableDates: doc.unavailableDates || []
                    };
                });

                setDoctors(processedDoctors);
            } catch (err) {
                console.error(err);
                message.error('Veriler yüklenirken hata oluştu');
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSubmit = async (values) => {
        const selectedDoctor = doctors.find(d => d.id === values.doctor);
        if (!selectedDoctor) {
            message.error('Doktor bilgisi bulunamadı');
            return;
        }

        const appointmentData = {
            doctorId: values.doctor, 
            date: dayjs(values.date).format('YYYY-MM-DD'),
            start: values.start,
            end: values.end,
            notes: values.notes || ''
        };

        try {
            const response = await appointmentService.createAppointment(appointmentData);
            localStorage.setItem('pendingAppointment', JSON.stringify(appointmentData));
            if(response?.data?.id) {
                localStorage.setItem('pendingAppointmentId', response.data.id);
            }
            setModalVisible(false);
            navigate('/appointment-success');
        } catch (err) {
            console.error(err);
            localStorage.setItem('pendingAppointment', JSON.stringify(appointmentData));
            setModalVisible(false);
            navigate('/appointment-failed');
        }
    };

    const dayMap = {
        monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba', 
        thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar'
    };
    
    const weekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Helper: Doktorun uzmanlık adını bulma (ID veya obje olabilir)
    const getDocSpecialityName = (doc) => {
        if (doc.specialityNavigation?.name) return doc.specialityNavigation.name;
        if (typeof doc.speciality === 'object' && doc.speciality?.name) return doc.speciality.name;
        if (specialities.length > 0) {
            const found = specialities.find(s => s.id === doc.speciality);
            if (found) return found.name;
        }
        return 'Belirtilmemiş';
    };

    return (
        <ConfigProvider locale={tr_TR}>
            <div className="max-w-5xl mx-auto pb-12">
                <div className="text-center mb-8">
                    <Title level={2} className="!text-gray-800">Yeni Randevu Oluştur</Title>
                    <Text type="secondary">Sağlığınız için en uygun zamanı planlayın</Text>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={createAppointmentSchema}
                    onSubmit={() => setModalVisible(true)}
                    enableReinitialize
                >
                    {({ values, errors, touched, setFieldValue, submitForm }) => {
                        
                        const filteredDoctors = doctors.filter(doctor => {
                            const matchesSearch = !searchTerm || doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                            // Speciality ID veya Obje kontrolü
                            let matchesSpeciality = true;
                            if (selectedSpeciality) {
                                const docSpecId = typeof doctor.speciality === 'object' ? doctor.speciality.id : doctor.speciality;
                                matchesSpeciality = docSpecId === selectedSpeciality;
                            }
                            const matchesLocation = !selectedLocation || doctor.location === selectedLocation;
                            return matchesSearch && matchesSpeciality && matchesLocation;
                        });

                        const selectedDoctorData = doctors.find(d => d.id === values.doctor);
                        
                        const dayIndex = values.date ? dayjs(values.date).day() : null;
                        const dayKey = dayIndex !== null ? dayNames[dayIndex] : null;
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
                        
                        const timeSlots = (schedule && schedule.start && schedule.end) 
                            ? generateTimeSlots(schedule.start, schedule.end) 
                            : [];

                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* SOL TARAF: FORM */}
                                <div className="lg:col-span-2">
                                    <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                                        {error && <Alert message={error} type="error" closable className="mb-4" />}
                                        
                                        <Form className="p-2 space-y-6">
                                            {/* Filtreler */}
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <Input
                                                        prefix={<SearchOutlined className="text-gray-400" />}
                                                        placeholder="Doktor ara..."
                                                        value={searchTerm}
                                                        onChange={(e) => { setSearchTerm(e.target.value); setFieldValue('doctor', ''); }}
                                                        className="rounded-lg"
                                                    />
                                                    <Select
                                                        placeholder="Branş Filtrele"
                                                        allowClear
                                                        className="w-full rounded-lg"
                                                        value={selectedSpeciality || undefined}
                                                        onChange={(val) => { setSelectedSpeciality(val); setFieldValue('doctor', ''); }}
                                                        showSearch
                                                        filterOption={(input, option) =>
                                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                        }
                                                    >
                                                        {specialities.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Doktor Seçimi</label>
                                                    <Select
                                                        size="large"
                                                        placeholder="Listeden doktor seçiniz"
                                                        value={values.doctor || undefined}
                                                        onChange={(val) => {
                                                            setFieldValue('doctor', val);
                                                            setFieldValue('date', null);
                                                            setFieldValue('start', '');
                                                            setFieldValue('end', '');
                                                        }}
                                                        loading={loadingDoctors}
                                                        className="w-full"
                                                        showSearch
                                                        status={errors.doctor && touched.doctor ? "error" : ""}
                                                        filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                                                    >
                                                        {filteredDoctors.map((doc) => (
                                                            <Select.Option key={doc.id} value={doc.id}>
                                                                {doc.user?.name} - {getDocSpecialityName(doc)}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                    {errors.doctor && touched.doctor && <div className="text-red-500 text-sm mt-1">{errors.doctor}</div>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Tarih */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Randevu Tarihi</label>
                                                    <DatePicker
                                                        size="large"
                                                        className="w-full rounded-xl"
                                                        format="DD/MM/YYYY"
                                                        disabled={!values.doctor}
                                                        placeholder={!values.doctor ? "Önce doktor seçin" : "Tarih Seçin"}
                                                        value={values.date}
                                                        onChange={(d) => {
                                                            setFieldValue('date', d);
                                                            setFieldValue('start', '');
                                                            setFieldValue('end', '');
                                                        }}
                                                        status={errors.date && touched.date ? "error" : ""}
                                                        disabledDate={(current) => {
                                                            if (!current || current < dayjs().startOf('day')) return true;
                                                            if (current > dayjs().add(14, 'day')) return true;
                                                            if (!selectedDoctorData) return true;

                                                            const dName = dayNames[current.day()];
                                                            const dSched = selectedDoctorData.clocks?.[dName];
                                                            
                                                            if (!dSched || !dSched.start || !dSched.end) return true;

                                                            if (selectedDoctorData.unavailableDates?.length) {
                                                                return selectedDoctorData.unavailableDates.some(r => {
                                                                    const s = dayjs(r.startDate).startOf('day');
                                                                    const e = dayjs(r.endDate).endOf('day');
                                                                    return current.isBetween(s, e, 'day', '[]');
                                                                });
                                                            }
                                                            return false;
                                                        }}
                                                    />
                                                    {errors.date && touched.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
                                                </div>

                                                {/* Saat */}
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
                                                            const endT = dayjs(`2000-01-01 ${val}`).add(1, 'hour').format('HH:mm');
                                                            setFieldValue('end', endT);
                                                        }}
                                                        status={errors.start && touched.start ? "error" : ""}
                                                    >
                                                        {timeSlots.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                                                    </Select>
                                                    {errors.start && touched.start && <div className="text-red-500 text-sm mt-1">{errors.start}</div>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Notlar (Opsiyonel)</label>
                                                <TextArea 
                                                    rows={3} 
                                                    className="rounded-xl" 
                                                    placeholder="Doktora iletmek istediğiniz notlar..."
                                                    value={values.notes}
                                                    onChange={(e) => setFieldValue('notes', e.target.value)}
                                                />
                                            </div>

                                            <div className="pt-4 flex justify-end gap-3">
                                                <Button size="large" onClick={() => navigate(-1)} className="rounded-xl">İptal</Button>
                                                <Button 
                                                    type="primary" 
                                                    size="large" 
                                                    onClick={submitForm}
                                                    disabled={!values.doctor || !values.date || !values.start}
                                                    className="rounded-xl px-8 shadow-blue-300 shadow-md"
                                                >
                                                    İncele ve Onayla
                                                </Button>
                                            </div>

                                            {/* Confirmation Modal */}
                                            <Modal
                                                title={<div className="text-left w-full font-bold text-lg">Randevu Özeti</div>}
                                                open={modalVisible}
                                                onCancel={() => setModalVisible(false)}
                                                footer={null}
                                                centered
                                                width={500}
                                            >
                                                <div className="flex flex-col items-start gap-4 py-4 w-full">
                                                    {/* Doktor Bilgisi */}
                                                    <div className="flex items-center gap-4 w-full bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                        <Avatar size={64} src={selectedDoctorData?.user?.avatar} icon={<UserOutlined/>} className="border-2 border-white shadow-sm" />
                                                        <div className="text-left">
                                                            <h3 className="font-bold text-lg text-gray-800 m-0">Dr. {selectedDoctorData?.user?.name}</h3>
                                                            <p className="text-blue-600 font-medium m-0">{selectedDoctorData ? getDocSpecialityName(selectedDoctorData) : ''}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                                        <div className="flex justify-between text-sm items-center border-b border-gray-200 pb-2">
                                                            <span className="text-gray-500 font-medium">Tarih</span>
                                                            <span className="font-bold text-gray-800">{values.date ? dayjs(values.date).format('DD MMMM YYYY') : ''}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm items-center border-b border-gray-200 pb-2">
                                                            <span className="text-gray-500 font-medium">Saat</span>
                                                            <span className="font-bold text-gray-800">{values.start} - {values.end}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm items-center border-b border-gray-200 pb-2">
                                                            <span className="text-gray-500 font-medium">Muayene Ücreti</span>
                                                            <span className="font-bold text-green-600">{selectedDoctorData?.consultationFee || '-'} ₺</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm items-center">
                                                            <span className="text-gray-500 font-medium">Lokasyon</span>
                                                            <span className="font-bold text-gray-800">{selectedDoctorData?.location}</span>
                                                        </div>
                                                    </div>

                                                    <Button 
                                                        type="primary" 
                                                        block 
                                                        size="large" 
                                                        className="mt-2 h-12 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 border-0 shadow-lg shadow-blue-200"
                                                        onClick={() => handleSubmit(values)}
                                                        loading={loading}
                                                    >
                                                        Randevuyu Onayla
                                                    </Button>
                                                </div>
                                            </Modal>
                                        </Form>
                                    </Card>
                                </div>

                                {/* SAĞ TARAF: DOKTOR BİLGİ ÖNİZLEME */}
                                <div className="lg:col-span-1">
                                    <Card className="shadow-lg border-0 rounded-2xl h-full bg-gradient-to-b from-blue-50 to-white">
                                        {(() => {
                                            if (!selectedDoctorData) return (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 text-center">
                                                    <MedicineBoxOutlined className="text-6xl mb-4 opacity-30" />
                                                    <p>Detayları görmek için<br/>bir doktor seçiniz.</p>
                                                </div>
                                            );

                                            return (
                                                <div className="animate-fade-in w-full">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <Avatar 
                                                            size={80} 
                                                            src={selectedDoctorData.user?.avatar} 
                                                            icon={<UserOutlined />} 
                                                            className="shadow-md border-4 border-white"
                                                        />
                                                        <div className="text-left">
                                                            <Title level={4} className="!mb-0 !mt-0 !text-lg">Dr. {selectedDoctorData.user?.name}</Title>
                                                            <Tag color="blue" className="mt-1 border-0">{getDocSpecialityName(selectedDoctorData)}</Tag>
                                                        </div>
                                                    </div>
                                                    
                                                    <Divider className="my-4" />
                                                    
                                                    <div className="w-full space-y-4 text-left">
                                                        <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                                                            <EnvironmentOutlined className="mt-1 text-red-500 text-lg" />
                                                            <div>
                                                                <span className="block text-xs font-bold text-gray-400 uppercase">Konum</span>
                                                                <span className="text-gray-700 font-medium">{selectedDoctorData.location || 'Konum belirtilmemiş'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-50 shadow-sm">
                                                            <DollarOutlined className="text-green-500 text-lg" />
                                                            <div>
                                                                <span className="block text-xs font-bold text-gray-400 uppercase">Muayene Ücreti</span>
                                                                <span className="text-gray-800 font-bold text-lg">{selectedDoctorData.consultationFee ? `${selectedDoctorData.consultationFee} ₺` : 'Ücretsiz'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                                            <div className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                                                <ScheduleOutlined className="text-blue-500" /> Çalışma Saatleri
                                                            </div>
                                                            <div className="space-y-2">
                                                                {weekOrder.map(dayKey => {
                                                                    const dayData = selectedDoctorData.clocks?.[dayKey];
                                                                    if (!dayData || !dayData.start || !dayData.end) return null;
                                                                    return (
                                                                        <div key={dayKey} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0">
                                                                            <span className="text-gray-600 font-medium">{dayMap[dayKey]}</span>
                                                                            <Tag className="m-0 bg-blue-50 border-blue-100 text-blue-600 rounded-md px-2">
                                                                                {dayData.start} - {dayData.end}
                                                                            </Tag>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
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