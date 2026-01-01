import axiosInstance from './axios';

/**
 * DOCTOR SERVICE
 * * Doktor işlemleri için API fonksiyonları
 * Backend'deki /api/doctors endpoint'lerine karşılık gelir
 */

/**
 * TÜM DOKTORLARI GETİR
 * * Backend Endpoint: GET /api/doctors
 * * Query params:
 * - speciality: Branşa göre filtreleme
 * - search: İsim veya branş ile arama
 * - page: Sayfa numarası
 * - limit: Sayfa başına kayıt
 * - minRating: Minimum puan filtresi
 */
export const getAllDoctors = async (params = {}) => {
    const response = await axiosInstance.get('/doctors', { params });
    return response.data;
};

/**
 * İZİNLİ GÜN EKLE
 * * Backend Endpoint: POST /api/doctors/me/unavailable
 */
export const addUnavailableDate = async (data) => {
    const response = await axiosInstance.post('/doctors/me/unavailable', data);
    return response.data;
};

/**
 * KENDİ DOKTOR PROFİLİNİ GETİR
 * * Backend Endpoint: GET /api/doctors/me
 */
export const getMyDoctorProfile = async () => {
    const response = await axiosInstance.get('/doctors/me');
    return response.data;
};

/**
 * DOKTOR DETAYINI GETİR
 * * Backend Endpoint: GET /api/doctors/:id
 */
export const getDoctorById = async (doctorId) => {
    const response = await axiosInstance.get(`/doctors/${doctorId}`);
    return response.data;
};

/**
 * BRANŞA GÖRE DOKTORLARI GETİR
 * (Helper function using getAllDoctors)
 */
export const getDoctorsBySpeciality = async (speciality) => {
    // C# tarafındaki genel filtreleme endpointini kullanıyoruz
    return getAllDoctors({ speciality });
};

/**
 * DOKTORUN DEĞERLENDİRMELERİNİ GETİR
 * * Backend Endpoint: GET /api/doctors/:id/reviews
 */
export const getDoctorReviews = async (doctorId) => {
    const response = await axiosInstance.get(`/doctors/${doctorId}/reviews`);
    return response.data;
};

/**
 * EN YÜKSEK PUANLI DOKTORLARI GETİR
 * (Helper function using getAllDoctors)
 */
export const getDoctorsByMaxRating = async (minRating = 4.0) => {
    // C# tarafındaki genel filtreleme endpointini kullanıyoruz
    return getAllDoctors({ minRating });
};

/**
 * YENİ DOKTOR OLUŞTUR (Admin)
 * * Backend Endpoint: POST /api/doctors
 */
export const createDoctor = async (doctorData) => {
    const response = await axiosInstance.post('/doctors', doctorData);
    return response.data;
};

/**
 * DOKTOR BİLGİLERİNİ GÜNCELLE
 * * Backend Endpoint: PUT /api/doctors/:id
 * Not: C# tarafında bu endpoint eksik olabilir, Admin veya DoctorController'da tanımlı olmalı.
 * Eğer yoksa create mantığına benzer bir update endpoint'i backend'de olmalı.
 */
export const updateDoctor = async (doctorId, updateData) => {
    // Bu endpoint C# DoctorController'da yoksa eklenmeli veya 
    // updateSchedule gibi spesifik endpointler kullanılmalı.
    // Şimdilik standart PUT olarak bırakıyorum.
    const response = await axiosInstance.put(`/doctors/${doctorId}`, updateData);
    return response.data;
};

/**
 * DOKTOR ÇALIŞMA SAATLERİNİ AYARLA (Doctor)
 * * Backend Endpoint: PUT /api/doctors/me/schedule
 * (C# tarafında endpoint PUT olarak tanımlandı)
 */
export const setDoctorSchedule = async (scheduleData) => {
    const response = await axiosInstance.put('/doctors/me/schedule', scheduleData);
    return response.data;
};

/**
 * DOKTORU SİL (Admin)
 * * Backend Endpoint: DELETE /api/doctors/:id
 */
export const deleteDoctor = async (doctorId) => {
    const response = await axiosInstance.delete(`/doctors/${doctorId}`);
    return response.data;
};

/**
 * SAĞLIK GEÇMİŞİ EKLE (Doctor)
 * * Backend Endpoint: POST /api/doctors/health-history
 */
export const addHealthHistory = async (healthData) => {
    const response = await axiosInstance.post('/doctors/health-history', healthData);
    return response.data;
};

/**
 * DOKTOR GENEL BİLGİLERİNİ GÜNCELLE
 * * Backend Endpoint: PUT /api/doctors/me/info
 */
export const updateDoctorInfo = async (infoData) => {
    const response = await axiosInstance.put('/doctors/me/info', infoData);
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
    addHealthHistory,
    getMyDoctorProfile,
    addUnavailableDate,
    updateDoctorInfo
};