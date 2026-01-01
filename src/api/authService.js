import axiosInstance from './axios';

/**
 * AUTH SERVICE
 * * Kimlik doğrulama ile ilgili tüm API çağrıları burada
 */

/**
 * LOGIN FONKSİYONU
 * * Kullanıcı girişi yapar
 * * Backend Endpoint: POST /api/user/login
 * Request Body: { email: "...", password: "..." }
 */
const login = async (credentials) => {
    try {
        const response = await axiosInstance.post('/user/login', credentials);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * REGISTER FONKSİYONU
 * * Yeni kullanıcı kaydı yapar
 * * Backend Endpoint: POST /api/user/register
 */
const register = async (userData) => {
    try {
        // Dosya yükleme varsa FormData kullanılır, content-type otomatik ayarlanır
        const config = userData instanceof FormData ? {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        } : {};

        const response = await axiosInstance.post('/user/register', userData, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * LOGOUT FONKSİYONU
 * * Kullanıcı çıkışı yapar
 * * Not: Backend'de logout endpoint'i olsa da token stateless olduğu için
 * client tarafında silmek esastır.
 */
const logout = async () => {
    try {
        // Backend'e bildirim (Opsiyonel, C# controller'da implemente edilmişse)
        // const response = await axiosInstance.post('/user/logout'); 
        
        // Local temizlik
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: true };
    } catch (error) {
        // Hata olsa bile local temizle
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw error;
    }
};

/**
 * GET CURRENT USER
 * * Token ile mevcut kullanıcı bilgilerini getirir
 * * Backend Endpoint: GET /api/user/profile
 * (C# tarafında endpoint adı /profile olarak güncellendi)
 */
const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('/user/profile');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * REFRESH TOKEN
 * * Access token'ın süresini uzatır
 * * Backend Endpoint: POST /api/user/refresh-token
 * Body: { refreshToken: "..." }
 */
const refreshToken = async () => {
    try {
        // Refresh token'ı localStorage'dan alıyoruz (uygulama mantığınıza göre değişebilir)
        const token = localStorage.getItem('refreshToken'); // Veya user objesinin içinden
        
        const response = await axiosInstance.post('/user/refresh-token', { 
            refreshToken: token 
        });

        if (response.data?.data?.accessToken) {
            localStorage.setItem('token', response.data.data.accessToken);
        }

        return response.data;
    } catch (error) {
        throw error;
    }
};

const authService = {
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken,
};

export default authService;