import axiosInstance from './axios';

/**
 * USER SERVICE
 * * Kullanıcı profil işlemleri için API fonksiyonları
 * Backend'deki /api/user endpoint'lerine karşılık gelir
 */

/**
 * KULLANICI PROFİLİNİ GETİR
 * * Backend Endpoint: GET /api/user/profile
 * (C# tarafında endpoint adı /profile olarak güncellendi)
 */
export const getMyProfile = async () => {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
};

/**
 * PROFİLİ GÜNCELLE
 * * Backend Endpoint: PUT /api/user/profile
 * (C# tarafında endpoint adı /profile olarak güncellendi)
 */
export const updateProfile = async (profileData) => {
    const response = await axiosInstance.put('/user/profile', profileData);
    return response.data;
};

/**
 * E-POSTA DEĞİŞİKLİĞİNİ ONAYLA
 * Backend Endpoint: GET /api/user/confirm-email-change/:token
 */
export const confirmEmailChange = async (token) => {
    const response = await axiosInstance.get(`/user/confirm-email-change/${token}`);
    return response.data;
};

/**
 * ŞİFRE DEĞİŞTİR
 * * Backend Endpoint: PUT /api/user/change-password
 * * Data:
 * {
 * currentPassword: "eskiŞifre",
 * newPassword: "yeniŞifre"
 * }
 */
export const changePassword = async (passwordData) => {
    const response = await axiosInstance.put('/user/change-password', passwordData);
    return response.data;
};

/**
 * ŞİFRE SIFIRLAMA İSTEĞİ
 * * Backend Endpoint: POST /api/user/forgot-password
 * * Data:
 * {
 * email: "user@example.com"
 * }
 */
export const forgotPassword = async (email) => {
    const response = await axiosInstance.post('/user/forgot-password', { email });
    return response.data;
};

/**
 * ŞİFRE SIFIRLAMA (Token ile)
 * * Backend Endpoint: POST /api/user/reset-password/:token
 * * Data:
 * {
 * password: "yeniŞifre"
 * }
 */
export const resetPassword = async (token, password) => {
    const response = await axiosInstance.post(`/user/reset-password/${token}`, { password });
    return response.data;
};

/**
 * E-POSTA DOĞRULAMA
 * * Backend Endpoint: GET /api/user/verify/:token
 */
export const verifyEmail = async (token) => {
    const response = await axiosInstance.get(`/user/verify/${token}`);
    return response.data;
};

/**
 * DOĞRULAMA E-POSTASI GÖNDER
 * * Backend Endpoint: POST /api/user/resend-verification
 */
export const resendVerificationEmail = async () => {
    const response = await axiosInstance.post('/user/resend-verification');
    return response.data;
};

/**
 * FAVORİ DOKTOR EKLE
 * * Backend Endpoint: POST /api/user/favorites
 * * Düzeltme: Backend rotası '/add' içermiyor ve body olarak sadece INT bekliyor.
 */
export const addFavoriteDoctor = async (doctorId) => {
    // Backend [FromBody] int beklediği için direkt sayıyı gönderiyoruz.
    // Content-Type: application/json başlığı axios tarafından otomatik ayarlanır.
    const response = await axiosInstance.post('/user/favorites', doctorId, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

/**
 * FAVORİ DOKTOR ÇIKAR
 * * Backend Endpoint: DELETE /api/user/favorites/:doctorId
 */
export const removeFavoriteDoctor = async (doctorId) => {
    const response = await axiosInstance.delete(`/user/favorites/${doctorId}`);
    return response.data;
};

/**
 * FAVORİ DOKTORLARI GETİR
 * * Backend Endpoint: GET /api/user/favorites
 */
export const getFavoriteDoctors = async () => {
    const response = await axiosInstance.get('/user/favorites');
    return response.data;
};

/**
 * SAĞLIK GEÇMİŞİNİ GETİR
 * * Backend Endpoint: GET /api/user/health-history
 */
export const getHealthHistory = async () => {
    const response = await axiosInstance.get('/user/health-history');
    return response.data;
};

/**
 * KULLANICI HESABINI SİL
 * * Backend Endpoint: DELETE /api/user/me
 */
export const deleteAccount = async () => {
    const response = await axiosInstance.delete('/user/me');
    return response.data;
};

// Mevcut importların altına:

/**
 * KİMLİK DOĞRULAMA (TC Kontrolü)
 * * Backend Endpoint: POST /api/user/verify-identity
 */
export const verifyIdentity = async (tc) => {
    const response = await axiosInstance.post('/user/verify-identity', { tc });
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
    deleteAccount,
    getHealthHistory,
    verifyIdentity
};