import { useState, useEffect } from 'react';
import { Card, Button, Select, DatePicker, TimePicker, Input, Alert, message } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, MedicineBoxOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import dayjs from 'dayjs';

// --- YENİ EKLENEN KISIM: Dayjs Plugin ---
// Tarih aralığı kontrolü için bu eklenti şarttır
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
// ----------------------------------------

import * as appointmentService from '../../api/appointmentService';
import axiosInstance from '../../api/axios';
import { createAppointmentSchema } from '../../validations/AppointmentValidations';
import {
    createAppointmentStart,
    createAppointmentSuccess,
    createAppointmentFailure,
    selectAppointmentLoading,
    selectAppointmentError
} from '../../store/slices/appointmentSlice';

const { TextArea } = Input;

const CreateAppointment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector(selectAppointmentLoading);
    const error = useSelector(selectAppointmentError);

    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

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
            dispatch(createAppointmentStart());

            const appointmentData = {
                doctor: values.doctor,
                date: dayjs(values.date).format('YYYY-MM-DD'),
                start: values.start,
                end: values.end,
                notes: values.notes || ''
            };

            const response = await appointmentService.createAppointment(appointmentData);

            dispatch(createAppointmentSuccess(response));
            message.success('Randevu başarıyla oluşturuldu!');
            resetForm();

            setTimeout(() => {
                navigate('/dashboard/patient/appointments');
            }, 1500);

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Randevu oluşturulurken hata oluştu';
            dispatch(createAppointmentFailure(errorMessage));
            message.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
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

                        // --- YENİ EKLENEN MANTIK: Seçilen Doktoru Bul ---
                        // Formdaki 'doctor' (ID) değerine göre tüm doktor listesinden o doktorun objesini buluyoruz.
                        // Bu sayede o doktorun 'unavailableDates' verisine erişebiliriz.
                        const selectedDoctorData = doctors.find(d => d._id === values.doctor);

                        return (
                            <Form className="space-y-6">
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
                                        {doctors.map((doctor) => (
                                            <Select.Option key={doctor._id} value={doctor._id}>
                                                {`${doctor.user?.name || 'İsimsiz'} - ${doctor.speciality || 'Branş Yok'}`}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    {errors.doctor && touched.doctor && (
                                        <div className="text-red-500 text-sm mt-1">{errors.doctor}</div>
                                    )}
                                </div>

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

                                            // 2. Doktor seçilmediyse başka kontrol yapma
                                            if (!selectedDoctorData) return false;

                                            // 3. Doktorun izinli olduğu tarihleri engelle
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
                                            * Gri renkli tarihlerde doktor izinlidir veya tarih geçmiştedir.
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
                                            placeholder="Başlangıç saati seçiniz"
                                            value={values.start || undefined}
                                            onChange={value => {
                                                setFieldValue('start', value);
                                                const [hour, minute] = value.split(':');
                                                const endHour = (parseInt(hour, 10) + 1).toString().padStart(2, '0');
                                                setFieldValue('end', `${endHour}:${minute}`);
                                            }}
                                            className="w-full"
                                            // Eğer doktor seçili değilse veya tarih seçili değilse saati disable et
                                            disabled={!values.doctor || !values.date}
                                        >
                                            {Array.from({ length: 11 }, (_, i) => {
                                                const hour = 8 + i;
                                                const hourStr = hour.toString().padStart(2, '0') + ':00';
                                                return (
                                                    <Select.Option key={hourStr} value={hourStr}>
                                                        {hourStr}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                        {errors.start && touched.start && (
                                            <div className="text-red-500 text-sm mt-1">{errors.start}</div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            ℹ️ Lütfen doktorun çalışma saatlerine dikkat edin
                                        </div>
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
    );
};

export default CreateAppointment;