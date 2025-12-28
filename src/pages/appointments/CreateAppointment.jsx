import { useState, useEffect } from 'react';
import { Card, Button, Select, DatePicker, TimePicker, Input, Alert, message, ConfigProvider, Avatar } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, MedicineBoxOutlined, FileTextOutlined, SearchOutlined, EnvironmentOutlined, MailOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import tr_TR from 'antd/locale/tr_TR';
import * as appointmentService from '../../api/appointmentService';
import axiosInstance from '../../api/axios';
import { createAppointmentSchema } from '../../validations/AppointmentValidations';
import {
    selectAppointmentLoading,
    selectAppointmentError
} from '../../store/slices/appointmentSlice';

dayjs.extend(isBetween);

const { TextArea } = Input;

const CreateAppointment = () => {
    const navigate = useNavigate();
    const loading = useSelector(selectAppointmentLoading);
    const error = useSelector(selectAppointmentError);

    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    // Doktor listesini çek
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoadingDoctors(true);
                const response = await axiosInstance.get('/doctors');

                // Backend {doctors: [], pagination: {}} formatında dönüyor
                const doctorsList = response.data.doctors ||
                    (Array.isArray(response.data) ? response.data : []);

                setDoctors(doctorsList);
            } catch (err) {
                console.error('Doktor listesi hatası:', err);
                message.error('Doktor listesi yüklenirken hata oluştu');
            } finally {
                setLoadingDoctors(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // Seçilen doktor verisini bul
            const selectedDoctor = doctors.find(d => d._id === values.doctor);
            if (!selectedDoctor) {
                message.error('Doktor bilgisi bulunamadı');
                return;
            }

            // Randevu verilerini hazırla
            const appointmentData = {
                doctor: values.doctor,
                date: dayjs(values.date).format('YYYY-MM-DD'),
                start: values.start,
                end: values.end,
                notes: values.notes || ''
            };

            // Randevuyu backend'de oluştur (pending_payment status ile)
            const response = await appointmentService.createAppointment({
                ...appointmentData,
                doctorData: selectedDoctor
            });

            if (response && response._id) {
                // Randevu ID'sini ve verilerini localStorage'a kaydet
                localStorage.setItem('pendingAppointmentId', response._id);
                localStorage.setItem('pendingAppointment', JSON.stringify(appointmentData));
                localStorage.setItem('doctorData', JSON.stringify(selectedDoctor));

                message.success('Randevu oluşturuldu! Ödeme sayfasına yönlendiriliyorsunuz...');
                resetForm();

                // Ödeme sayfasına yönlendir
                setTimeout(() => {
                    navigate(`/payment?appointmentId=${response._id}`);
                }, 1500);
            } else {
                message.error(response?.message || 'Randevu oluşturulamadı');
            }

        } catch (err) {
            console.error('Randevu oluşturma hatası:', err);
            message.error('Randevu oluşturulurken hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ConfigProvider locale={tr_TR}>
            <div className="max-w-4xl mx-auto">
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-blue-500" />
                            <span>Yeni Randevu Oluştur</span>
                        </div>
                    }
                    className="shadow-lg"
                >
                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            closable
                            className="mb-4"
                        />
                    )}

                    <Formik
                    initialValues={{
                        doctor: '',
                        date: null,
                        start: '',
                        end: '',
                        notes: ''
                    }}
                    validationSchema={createAppointmentSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, setFieldValue, isSubmitting }) => {

                        // --- YENİ EKLENEN MANTIK: Doktor filtreleme ---
                        const locations = [...new Set(doctors.map(d => d.location).filter(Boolean))].sort();
                        const specialities = [...new Set(doctors.map(d => d.speciality).filter(Boolean))].sort();

                        const filteredDoctors = doctors.filter(doctor => {
                            const matchesSearch = !searchTerm || doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesSpeciality = !selectedSpeciality || doctor.speciality === selectedSpeciality;
                            const matchesLocation = !selectedLocation || doctor.location === selectedLocation;
                            return matchesSearch && matchesSpeciality && matchesLocation;
                        });

                        // --- YENİ EKLENEN MANTIK: Seçilen Doktoru Bul ---
                        // Formdaki 'doctor' (ID) değerine göre tüm doktor listesinden o doktorun objesini buluyoruz.
                        // Bu sayede o doktorun 'unavailableDates' verisine erişebiliriz.
                        const selectedDoctorData = doctors.find(d => d._id === values.doctor);

                        // --- YENİ EKLENEN MANTIK: Doktorun çalışma saatlerine göre saat slotlarını hesapla ---
                        const dayIndex = values.date ? dayjs(values.date).day() : null; // 0=sunday, 1=monday, etc.
                        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const day = dayIndex !== null ? dayNames[dayIndex] : null;
                        const schedule = selectedDoctorData?.clocks?.[day];

                        const generateTimeSlots = (start, end) => {
                            const slots = [];
                            if (!start || !end) return slots;
                            const startTime = dayjs(`2000-01-01 ${start}`);
                            const endTime = dayjs(`2000-01-01 ${end}`);
                            let current = startTime;
                            while (current.isBefore(endTime)) {
                                slots.push(current.format('HH:mm'));
                                current = current.add(60, 'minute');
                            }
                            return slots;
                        };

                        const timeSlots = schedule ? generateTimeSlots(schedule.start, schedule.end) : [];

                        return (
                            <Form className="space-y-6">
                                {/* Doktor Filtreleme */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <SearchOutlined className="mr-2" />
                                            Doktor Ara
                                        </label>
                                        <Input
                                            size="large"
                                            placeholder="Doktor adı ara..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setFieldValue('doctor', '');
                                                setFieldValue('date', null);
                                                setFieldValue('start', '');
                                                setFieldValue('end', '');
                                            }}
                                            prefix={<SearchOutlined />}
                                            allowClear
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <MedicineBoxOutlined className="mr-2" />
                                            Branş
                                        </label>
                                        <Select
                                            size="large"
                                            placeholder="Branş seçin"
                                            value={selectedSpeciality || undefined}
                                            onChange={(value) => {
                                                setSelectedSpeciality(value || '');
                                                setFieldValue('doctor', '');
                                                setFieldValue('date', null);
                                                setFieldValue('start', '');
                                                setFieldValue('end', '');
                                            }}
                                            className="w-full"
                                            allowClear
                                        >
                                            {specialities.map(spec => (
                                                <Select.Option key={spec} value={spec}>
                                                    {spec}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <EnvironmentOutlined className="mr-2" />
                                            Lokasyon
                                        </label>
                                        <Select
                                            size="large"
                                            placeholder="Lokasyon seçin"
                                            value={selectedLocation || undefined}
                                            onChange={(value) => {
                                                setSelectedLocation(value || '');
                                                setFieldValue('doctor', '');
                                                setFieldValue('date', null);
                                                setFieldValue('start', '');
                                                setFieldValue('end', '');
                                            }}
                                            className="w-full"
                                            allowClear
                                        >
                                            {locations.map(loc => (
                                                <Select.Option key={loc} value={loc}>
                                                    {loc}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {/* Doktor Seçimi */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <MedicineBoxOutlined className="mr-2" />
                                        Doktor Seçin
                                    </label>
                                    <Select
                                        size="large"
                                        placeholder="Doktor seçiniz..."
                                        value={values.doctor || undefined}
                                        onChange={(value) => {
                                            setFieldValue('doctor', value);
                                            // Doktor değişirse seçili tarihi ve saati sıfırla (çakışma olmasın diye)
                                            setFieldValue('date', null);
                                            setFieldValue('start', '');
                                            setFieldValue('end', '');
                                        }}
                                        loading={loadingDoctors}
                                        className="w-full"
                                        showSearch
                                        filterOption={(input, option) =>
                                            option?.children?.toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {filteredDoctors.map((doctor) => (
                                            <Select.Option key={doctor._id} value={doctor._id}>
                                                {`${doctor.user?.name || 'İsimsiz'} - ${doctor.speciality || 'Branş Yok'}${doctor.location ? ` - ${doctor.location}` : ''}`}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    {errors.doctor && touched.doctor && (
                                        <div className="text-red-500 text-sm mt-1">{errors.doctor}</div>
                                    )}
                                </div>

                                {/* Seçilen Doktor Bilgileri */}
                                {selectedDoctorData && (
                                    <Card size="small" className="bg-blue-50 border-blue-200">
                                        <div className="flex items-center gap-4">
                                            <Avatar
                                                size={64}
                                                src={selectedDoctorData.user?.avatar}
                                                icon={<UserOutlined />}
                                                className="bg-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-lg">
                                                    Dr. {selectedDoctorData.user?.name}
                                                </div>
                                                <div className="text-gray-600 mb-2">
                                                    {selectedDoctorData.speciality}
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {selectedDoctorData.user?.email && (
                                                        <div className="flex items-center gap-1">
                                                            <MailOutlined /> {selectedDoctorData.user.email}
                                                        </div>
                                                    )}
                                                    {selectedDoctorData.location && (
                                                        <div className="flex items-center gap-1">
                                                            <EnvironmentOutlined /> {selectedDoctorData.location}
                                                        </div>
                                                    )}
                                                    {selectedDoctorData.consultationFee && (
                                                        <div className="flex items-center gap-1">
                                                            <DollarOutlined /> ₺{selectedDoctorData.consultationFee}/saat
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Çalışma Saatleri */}
                                                <div className="mt-3">
                                                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                                        <ClockCircleOutlined /> Çalışma Saatleri
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                        {Object.entries(selectedDoctorData.clocks || {}).map(([day, hours]) => {
                                                            const dayNames = {
                                                                monday: 'Pazartesi',
                                                                tuesday: 'Salı',
                                                                wednesday: 'Çarşamba',
                                                                thursday: 'Perşembe',
                                                                friday: 'Cuma',
                                                                saturday: 'Cumartesi',
                                                                sunday: 'Pazar'
                                                            };
                                                            return (
                                                                <div key={day} className="bg-white p-2 rounded border">
                                                                    <div className="font-medium text-gray-700">{dayNames[day]}</div>
                                                                    <div className="text-gray-600">
                                                                        {hours.start && hours.end ? `${hours.start} - ${hours.end}` : 'Kapalı'}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Tarih Seçimi */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <CalendarOutlined className="mr-2" />
                                        Randevu Tarihi
                                    </label>
                                    <DatePicker
                                        size="large"
                                        placeholder="Tarih seçiniz..."
                                        value={values.date}
                                        onChange={(date) => setFieldValue('date', date)}
                                        className="w-full"
                                        format="DD/MM/YYYY"

                                        // --- YENİ EKLENEN MANTIK: disabledDate ---
                                        disabledDate={(current) => {
                                            if (!current) return false;

                                            // 1. Geçmiş tarihleri engelle
                                            if (current < dayjs().startOf('day')) return true;

                                            // 2. 2 haftadan sonraki tarihleri engelle
                                            const twoWeeksFromNow = dayjs().add(2, 'weeks').endOf('day');
                                            if (current > twoWeeksFromNow) return true;

                                            // 3. Doktor seçilmediyse başka kontrol yapma
                                            if (!selectedDoctorData) return false;

                                            // 4. Doktorun izinli olduğu tarihleri engelle
                                            // Backend'den 'unavailableDates' array olarak gelmeli
                                            if (selectedDoctorData.unavailableDates && selectedDoctorData.unavailableDates.length > 0) {
                                                return selectedDoctorData.unavailableDates.some(range => {
                                                    const start = dayjs(range.startDate).startOf('day');
                                                    const end = dayjs(range.endDate).endOf('day');

                                                    // '[]' parametresi başlangıç ve bitiş günlerinin de dahil (yasak) olduğunu belirtir
                                                    return current.isBetween(start, end, 'day', '[]');
                                                });
                                            }

                                            return false;
                                        }}
                                    // ------------------------------------------
                                    />
                                    {/* Bilgilendirme Mesajı */}
                                    {values.doctor && (
                                        <div className="text-xs text-gray-400 mt-1 ml-1">
                                            * Gri renkli tarihlerde doktor izinlidir, tarih geçmiştedir veya 2 haftadan sonradır.
                                        </div>
                                    )}

                                    {errors.date && touched.date && (
                                        <div className="text-red-500 text-sm mt-1">{errors.date}</div>
                                    )}
                                </div>

                                {/* Saat Seçimi */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Başlangıç Saati */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <ClockCircleOutlined className="mr-2" />
                                            Başlangıç Saati
                                        </label>
                                        <Select
                                            size="large"
                                            placeholder={timeSlots.length > 0 ? "Başlangıç saati seçiniz" : "Doktorun çalışma saati yok"}
                                            value={values.start || undefined}
                                            onChange={value => {
                                                setFieldValue('start', value);
                                                const startTime = dayjs(`2000-01-01 ${value}`);
                                                const endTime = startTime.add(1, 'hour');
                                                setFieldValue('end', endTime.format('HH:mm'));
                                            }}
                                            className="w-full"
                                            // Eğer doktor seçili değilse veya tarih seçili değilse veya çalışma saati yoksa saati disable et
                                            disabled={!values.doctor || !values.date || timeSlots.length === 0}
                                        >
                                            {timeSlots.map(time => (
                                                <Select.Option key={time} value={time}>
                                                    {time}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        {errors.start && touched.start && (
                                            <div className="text-red-500 text-sm mt-1">{errors.start}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Notlar */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <FileTextOutlined className="mr-2" />
                                        Notlar (Opsiyonel)
                                    </label>
                                    <TextArea
                                        placeholder="Randevuyla ilgili notlarınız..."
                                        value={values.notes}
                                        onChange={(e) => setFieldValue('notes', e.target.value)}
                                        rows={4}
                                        maxLength={200}
                                        showCount
                                    />
                                    {errors.notes && touched.notes && (
                                        <div className="text-red-500 text-sm mt-1">{errors.notes}</div>
                                    )}
                                </div>

                                {/* Butonlar */}
                                <div className="flex gap-4 justify-end">
                                    <Button
                                        size="large"
                                        onClick={() => navigate('/dashboard/patient')}
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        htmlType="submit"
                                        loading={loading || isSubmitting}
                                        icon={<CalendarOutlined />}
                                    >
                                        Randevu Oluştur
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </Card>
        </div>
        </ConfigProvider>
    );
};

export default CreateAppointment;