import axiosInstance from './axios';

/**
 * DOCTOR SERVICE
 * 
 * Doktor işlemleri için API fonksiyonları
 * Backend'deki /api/doctors endpoint'lerine karşılık gelir
 */

/**
 * TÜM DOKTORLARI GETİR
 * 
 * Backend Endpoint: GET /api/doctors
 * 
 * Query params:
 * - speciality: Branşa göre filtreleme (opsiyonel)
 * - search: İsim veya branş ile arama (opsiyonel)
 * - page: Sayfa numarası (opsiyonel)
 * - limit: Sayfa başına kayıt (opsiyonel)
 */
export const getAllDoctors = async (params = {}) => {
    const response = await axiosInstance.get('/doctors', { params });
    return response.data;
};


export const addUnavailableDate = async (data) => {
    // data formatı: { startDate: "...", endDate: "...", reason: "..." }
    const response = await axiosInstance.post('/doctors/me/unavailable', data);
    return response.data;
};

export const getMyDoctorProfile = async () => {
    const response = await axiosInstance.get('/doctors/me');
    return response.data;
};
/**
 * DOKTOR DETAYINI GETİR
 * 
 * Backend Endpoint: GET /api/doctors/:id
 * 
 * Dönen veri:
 * {
 *   doctor: {
 *     _id: "...",
 *     user: { name, email },
 *     speciality: "Kardiyoloji",
 *     rating: 4.5,
 *     reviewCount: 123,
 *     clocks: { monday: {...} }
 *   }
 * }
 */
export const getDoctorById = async (doctorId) => {
    const response = await axiosInstance.get(`/doctors/${doctorId}`);
    return response.data;
};

/**
 * BRANŞA GÖRE DOKTORLARI GETİR
 * 
 * Backend Endpoint: GET /api/doctors/speciality/:speciality
 * 
 * Örnek: getDoctorsBySpeciality("Kardiyoloji")
 */
export const getDoctorsBySpeciality = async (speciality) => {
    const response = await axiosInstance.get(`/doctors/speciality/${speciality}`);
    return response.data;
};

/**
 * DOKTORUN DEĞERLENDİRMELERİNİ GETİR
 * 
 * Backend Endpoint: GET /api/doctors/:id/reviews
 */
export const getDoctorReviews = async (doctorId) => {
    const response = await axiosInstance.get(`/doctors/${doctorId}/reviews`);
    return response.data;
};

/**
 * EN YÜKSEK PUANLI DOKTORLARI GETİR
 * 
 * Backend Endpoint: GET /api/doctors/max-rating/:rating
 * 
 * Örnek: getDoctorsByMaxRating(4.5) → 4.5 ve üzeri puanlı doktorlar
 */
export const getDoctorsByMaxRating = async (rating = 4.0) => {
    const response = await axiosInstance.get(`/doctors/max-rating/${rating}`);
    return response.data;
};

/**
 * YENİ DOKTOR OLUŞTUR (Admin)
 * 
 * Backend Endpoint: POST /api/doctors
 * 
 * Data:
 * {
 *   user: "userId",
 *   speciality: "Kardiyoloji",
 *   clocks: { monday: { start: "09:00", end: "17:00" } }
 * }
 */
export const createDoctor = async (doctorData) => {
    const response = await axiosInstance.post('/doctors', doctorData);
    return response.data;
};

/**
 * DOKTOR BİLGİLERİNİ GÜNCELLE
 * 
 * Backend Endpoint: PUT /api/doctors/:id
 */
export const updateDoctor = async (doctorId, updateData) => {
    const response = await axiosInstance.put(`/doctors/${doctorId}`, updateData);
    return response.data;
};

/**
 * DOKTOR ÇALIŞMA SAATLERİNİ AYARLA (Doctor)
 * 
 * Backend Endpoint: POST /api/doctors/schedule
 * 
 * Data:
 * {
 *   clocks: {
 *     monday: { start: "09:00", end: "17:00" },
 *     tuesday: { start: "09:00", end: "17:00" }
 *   }
 * }
 */
export const setDoctorSchedule = async (scheduleData) => {
    const response = await axiosInstance.post('/doctors/schedule', scheduleData);
    return response.data;
};

/**
 * DOKTORU SİL (Admin)
 * 
 * Backend Endpoint: DELETE /api/doctors/:id
 */
export const deleteDoctor = async (doctorId) => {
    const response = await axiosInstance.delete(`/doctors/${doctorId}`);
    return response.data;
};

/**
 * SAĞLIK GEÇMİŞİ EKLE (Doctor)
 * 
 * Backend Endpoint: POST /api/doctors/health-history
 * 
 * Data:
 * {
 *   patientId: "userId",
 *   diagnosis: "...",
 *   treatment: "...",
 *   notes: "..."
 * }
 */
export const addHealthHistory = async (healthData) => {
    const response = await axiosInstance.post('/doctors/health-history', healthData);
    return response.data;
};

export default {
    getAllDoctors,
    getDoctorById,
    getDoctorsBySpeciality,
    getDoctorReviews,
    getDoctorsByMaxRating,
    createDoctor,
    updateDoctor,
    setDoctorSchedule,
    deleteDoctor,
    addHealthHistory
};
