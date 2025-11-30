import * as Yup from 'yup';

/**
 * APPOINTMENT VALIDATIONS
 * 
 * Randevu formları için validasyon şemaları
 */

/**
 * YENİ RANDEVU OLUŞTURMA VALIDASYONU
 * 
 * Kullanım:
 * <Formik validationSchema={createAppointmentSchema}>
 */
export const createAppointmentSchema = Yup.object().shape({
    // Doktor seçimi zorunlu
    doctor: Yup.string()
        .required('Lütfen bir doktor seçin'),

    // Tarih seçimi zorunlu
    date: Yup.date()
        .required('Lütfen randevu tarihi seçin')
        .nullable()
        .test('not-past-date', 'Geçmiş bir tarih seçemezsiniz', function (value) {
            if (!value) return true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(value) >= today;
        }),

    // Başlangıç saati zorunlu
    start: Yup.string()
        .required('Lütfen başlangıç saati seçin')
        .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            'Saat formatı HH:mm olmalıdır (örn: 09:00)'
        ),

    // Bitiş saati zorunlu ve başlangıçtan sonra olmalı
    end: Yup.string()
        .required('Lütfen bitiş saati seçin')
        .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            'Saat formatı HH:mm olmalıdır (örn: 10:00)'
        )
        .test('is-after-start', 'Bitiş saati başlangıç saatinden sonra olmalı', function (value) {
            const { start } = this.parent;
            if (!start || !value) return true;
            return value > start;
        }),

    // Notlar opsiyonel, maksimum 200 karakter
    notes: Yup.string()
        .max(200, 'Not en fazla 200 karakter olabilir')
        .optional()
});

/**
 * RANDEVU GÜNCELLEME VALIDASYONU
 * 
 * Randevu tarih/saat güncellerken kullanılır
 */
export const updateAppointmentSchema = Yup.object().shape({
    date: Yup.date()
        .required('Lütfen randevu tarihi seçin')
        .nullable()
        .min(new Date(), 'Geçmiş bir tarih seçemezsiniz'),

    start: Yup.string()
        .required('Lütfen başlangıç saati seçin')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Saat formatı HH:mm olmalıdır'),

    end: Yup.string()
        .required('Lütfen bitiş saati seçin')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Saat formatı HH:mm olmalıdır')
        .test('is-after-start', 'Bitiş saati başlangıç saatinden sonra olmalı', function (value) {
            const { start } = this.parent;
            if (!start || !value) return true;
            return value > start;
        }),

    notes: Yup.string()
        .max(200, 'Not en fazla 200 karakter olabilir')
        .optional()
});

/**
 * RANDEVU FİLTRE VALIDASYONU
 * 
 * Randevu filtreleme formunda kullanılır
 */
export const appointmentFilterSchema = Yup.object().shape({
    status: Yup.string()
        .oneOf(['all', 'pending', 'confirmed', 'cancelled', 'completed'], 'Geçersiz durum')
        .optional(),

    startDate: Yup.date()
        .nullable()
        .optional(),

    endDate: Yup.date()
        .nullable()
        .optional()
        .min(Yup.ref('startDate'), 'Bitiş tarihi başlangıç tarihinden sonra olmalı')
});

export default {
    createAppointmentSchema,
    updateAppointmentSchema,
    appointmentFilterSchema
};
