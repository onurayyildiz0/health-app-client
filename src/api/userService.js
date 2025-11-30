import axiosInstance from './axios';

/**
 * USER SERVICE
 * 
 * Kullanıcı profil işlemleri için API fonksiyonları
 * Backend'deki /api/users endpoint'lerine karşılık gelir
 */

/**
 * KULLANICI PROFİLİNİ GETİR
 * 
 * Backend Endpoint: GET /api/users/me
 * 
 * Dönen veri:
 * {
 *   user: {
 *     _id: "...",
 *     name: "...",
 *     email: "...",
 *     role: "patient",
 *     phone: "...",
 *     avatar: "..."
 *   }
 * }
 */
export const getMyProfile = async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
};

/**
 * PROFİLİ GÜNCELLE
 * 
 * Backend Endpoint: PUT /api/users/me
 * 
 * Data:
 * {
 *   name: "Yeni İsim",
 *   phone: "05551234567",
 *   avatar: "https://..."
 * }
 */
export const updateProfile = async (profileData) => {
    const response = await axiosInstance.put('/users/me', profileData);
    return response.data;
};

/**
 * ŞİFRE DEĞİŞTİR
 * 
 * Backend Endpoint: PUT /api/users/change-password
 * 
 * Data:
 * {
 *   currentPassword: "eskiŞifre",
 *   newPassword: "yeniŞifre"
 * }
 */
export const changePassword = async (passwordData) => {
    const response = await axiosInstance.put('/users/change-password', passwordData);
    return response.data;
};

/**
 * ŞİFRE SIFIRLAMA İSTEĞİ
 * 
 * Backend Endpoint: POST /api/users/forgot-password
 * 
 * Data:
 * {
 *   email: "user@example.com"
 * }
 */
export const forgotPassword = async (email) => {
    const response = await axiosInstance.post('/users/forgot-password', { email });
    return response.data;
};

/**
 * ŞİFRE SIFIRLAMA (Token ile)
 * 
 * Backend Endpoint: POST /api/users/reset-password/:token
 * 
 * Data:
 * {
 *   password: "yeniŞifre"
 * }
 */
export const resetPassword = async (token, password) => {
    const response = await axiosInstance.post(`/users/reset-password/${token}`, { password });
    return response.data;
};

/**
 * E-POSTA DOĞRULAMA
 * 
 * Backend Endpoint: GET /api/users/verify-email/:token
 */
export const verifyEmail = async (token) => {
    const response = await axiosInstance.get(`/users/verify-email/${token}`);
    return response.data;
};

/**
 * DOĞRULAMA E-POSTASI GÖNDER
 * 
 * Backend Endpoint: POST /api/users/resend-verification
 */
export const resendVerificationEmail = async () => {
    const response = await axiosInstance.post('/users/resend-verification');
    return response.data;
};

/**
 * FAVORİ DOKTOR EKLE
 * 
 * Backend Endpoint: POST /api/users/favorites/add
 */
export const addFavoriteDoctor = async (doctorId) => {
    const response = await axiosInstance.post('/users/favorites/add', { doctorId });
    return response.data;
};

/**
 * FAVORİ DOKTOR ÇIKAR
 * 
 * Backend Endpoint: DELETE /api/users/favorites/:doctorId
 */
export const removeFavoriteDoctor = async (doctorId) => {
    const response = await axiosInstance.delete(`/users/favorites/${doctorId}`);
    return response.data;
};

/**
 * FAVORİ DOKTORLARI GETİR
 * 
 * Backend Endpoint: GET /api/users/favorites
 */
export const getFavoriteDoctors = async () => {
    const response = await axiosInstance.get('/users/favorites');
    return response.data;
};

/**
 * KULLANICI HESABINI SİL
 * 
 * Backend Endpoint: DELETE /api/users/me
 */
export const deleteAccount = async () => {
    const response = await axiosInstance.delete('/users/me');
    return response.data;
};

export default {
    getMyProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    addFavoriteDoctor,
    removeFavoriteDoctor,
    getFavoriteDoctors,
    deleteAccount
};
