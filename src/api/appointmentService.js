import axiosInstance from './axios';

/**
 * APPOINTMENT SERVICE
 * 
 * Randevu işlemleri için API fonksiyonları
 * Backend'deki endpoint'lere uygun yazılmıştır
 */

/**
 * YENİ RANDEVU OLUŞTUR (Patient)
 * 
 * Backend Endpoint: POST /api/appointments
 * 
 * Gönderilmesi gereken data:
 * {
 *   doctor: "mongoID",     // Doktor ID (MongoDB ObjectId)
 *   date: "2025-10-20",    // Randevu tarihi (ISO 8601)
 *   start: "10:00",        // Başlangıç saati (HH:mm)
 *   end: "11:00",          // Bitiş saati (HH:mm)
 *   notes: "..."           // Not (opsiyonel)
 * }
 */
export const createAppointment = async (appointmentData) => {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
};

/**
 * RANDEVU DETAYINI GETİR
 * 
 * Backend Endpoint: GET /api/appointments/:id
 */
export const getAppointmentById = async (appointmentId) => {
    const response = await axiosInstance.get(`/appointments/${appointmentId}`);
    return response.data;
};

/**
 * RANDEVU İPTAL ET
 * 
 * Backend Endpoint: PATCH /api/appointments/:id/cancel
 */
export const cancelAppointment = async (appointmentId) => {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/cancel`);
    return response.data;
};

/**
 * RANDEVU YENİDEN PLANLA
 * 
 * Backend Endpoint: PUT /api/appointments/:id
 */
export const rescheduleAppointment = async (appointmentId, updateData) => {
    const response = await axiosInstance.put(`/appointments/${appointmentId}`, updateData);
    return response.data;
};

/**
 * DOKTOR RANDEVULARI (Doctor Dashboard için)
 * 
 * Backend Endpoint: GET /api/appointments/doctor
 */
export const getDoctorAppointments = async () => {
    const response = await axiosInstance.get('/appointments/doctor');
    return response.data;
};

/**
 * HASTA RANDEVULARI (Patient Dashboard için)
 * 
 * Backend Endpoint: GET /api/appointments/patient
 */
export const getPatientAppointments = async () => {
    const response = await axiosInstance.get('/appointments/patient');
    return response.data;
};

// Alias for getPatientAppointments
export const getMyAppointments = getPatientAppointments;

/**
 * RANDEVU DURUMUNU GÜNCELLE (Doctor için)
 * 
 * Backend Endpoint: PATCH /api/appointments/:id/status
 * 
 * Data:
 * {
 *   status: "completed" | "cancelled" | "booked"
 * }
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, { status });
    return response.data;
};

export default {
    createAppointment,
    getAppointmentById,
    cancelAppointment,
    rescheduleAppointment,
    getDoctorAppointments,
    getPatientAppointments,
    getMyAppointments,
    updateAppointmentStatus
};
