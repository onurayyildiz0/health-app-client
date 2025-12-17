import axiosInstance from './axios';

/**
 * ADMIN SERVICE
 * 
 * Admin işlemleri için API fonksiyonları
 * Backend'deki /api/admin endpoint'lerine karşılık gelir
 * Sadece 'admin' rolüne sahip kullanıcılar erişebilir
 */

/**
 * TÜM KULLANICILARI GETİR
 * 
 * Backend Endpoint: GET /api/admin/users
 * 
 * Query params:
 * - role: Rol ile filtreleme (patient, doctor, admin)
 * - page: Sayfa numarası
 * - limit: Sayfa başına kayıt
 * 
 * Dönen veri:
 * {
 *   users: [...],
 *   total: 100,
 *   page: 1,
 *   pages: 10
 * }
 */
export const getAllUsers = async (params = {}) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
};

/**
 * ROL İLE KULLANICILARI GETİR
 * 
 * Backend Endpoint: GET /api/admin/users/role/:role
 * 
 * Belirtilen role sahip kullanıcıları getirir
 * 
 * Parametreler:
 * - role: 'admin', 'doctor', veya 'patient'
 */
export const getUsersByRole = async (role) => {
    const response = await axiosInstance.get(`/admin/users/role/${role}`);
    return response.data;
};

/**
 * BEKLEYEN DOKTORLARI GETİR
 * 
 * Backend Endpoint: GET /api/admin/pending-doctors
 * 
 * Onay bekleyen doktorları getirir
 */
export const getPendingDoctors = async () => {
    const response = await axiosInstance.get('/admin/pending-doctors');
    return response.data;
};

/**
 * DOKTOR BELGESİNİ İNDİR
 * 
 * Backend Endpoint: GET /api/admin/doctor-document/:userId
 * 
 * Doktorun yüklediği belgeyi indirir
 */
// adminService.js içindeki fonksiyonun YENİ HALİ
export const downloadDoctorDocument = async (userId) => {
    // Sadece veriyi çek ve return et. 
    // Blob oluşturma ve indirme işini UserManagement.jsx zaten yapıyor.
    return await axiosInstance.get(`/admin/doctor-document/${userId}`, {
        responseType: 'blob'
    });
};

/**
 * DOKTOR ONAYLA
 * 
 * Backend Endpoint: PATCH /api/admin/approve-doctor/:doctorId
 * 
 * Doktor kaydını onaylar ve aktif hale getirir
 */
export const approveDoctor = async (doctorId) => {
    const response = await axiosInstance.patch(`/admin/approve-doctor/${doctorId}`);
    return response.data;
};

/**
 * KULLANICI İSTATİSTİKLERİNİ GETİR
 * 
 * Backend Endpoint: GET /api/admin/stats
 * 
 * Dönen veri:
 * {
 *   totalUsers: 500,
 *   totalPatients: 400,
 *   totalDoctors: 80,
 *   totalAdmins: 5,
 *   pendingDoctors: 10,
 *   totalAppointments: 1200,
 *   todayAppointments: 45
 * }
 */
export const getUserStats = async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
};

/**
 * YENİ ADMİN OLUŞTUR
 * 
 * Backend Endpoint: POST /api/admin/create-admin
 * 
 * Data:
 * {
 *   name: "Admin Adı",
 *   email: "admin@example.com",
 *   password: "güçlüŞifre123"
 * }
 */
export const createAdmin = async (adminData) => {
    const response = await axiosInstance.post('/admin/create-admin', adminData);
    return response.data;
};

/**
 * KULLANICIYI SİL
 * 
 * Backend Endpoint: DELETE /api/admin/users/:userId
 */
export const deleteUser = async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
};

/**
 * KULLANICI ROLİNİ GÜNCELLE
 * 
 * Backend Endpoint: PATCH /api/admin/users/:userId/role
 * 
 * Data:
 * {
 *   role: "doctor" // patient, doctor, admin
 * }
 */
export const updateUserRole = async (userId, role) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
};

/**
 * KULLANICI DETAYINI GETİR
 * 
 * Backend Endpoint: GET /api/admin/users/:userId
 */
export const getUserById = async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
};



export default {
    getAllUsers,
    approveDoctor,
    getUserStats,
    createAdmin,
    deleteUser,
    updateUserRole,
    getUserById,
    getPendingDoctors
};
