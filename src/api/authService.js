import axiosInstance from './axios';

/**
 * AUTH SERVICE
 * 
 * Kimlik doğrulama ile ilgili tüm API çağrıları burada
 * 
 * Neden ayrı bir dosya?
 * - Kodları organize eder
 * - Tekrar kullanılabilir
 * - Test edilmesi kolay
 * - Component'ler temiz kalır
 */

/**
 * LOGIN FONKSİYONU
 * 
 * Kullanıcı girişi yapar
 * 
 * @param {Object} credentials - Giriş bilgileri
 * @param {string} credentials.email - Email
 * @param {string} credentials.password - Şifre
 * @returns {Promise} Backend'den gelen response
 * 
 * Backend Endpoint: POST /api/auth/login
 * Request Body: { email: "...", password: "..." }
 * Response: { user: {...}, token: "..." }
 */
const login = async (credentials) => {
    try {
        /**
         * axiosInstance.post() ile POST isteği yapıyoruz
         * 
         * 1. Parametre: Endpoint (/auth/login)
         * 2. Parametre: Gönderilecek veri (email, password)
         * 
         * baseURL otomatik eklenecek:
         * http://localhost:3000/api + /auth/login
         */
        const response = await axiosInstance.post('/auth/login', credentials);

        /**
         * response.data → Backend'den gelen veri
         * 
         * Örnek response.data:
         * {
         *   success: true,
         *   data: {
         *     user: { id: 1, name: "Ahmet", email: "...", role: "patient" },
         *     token: "eyJhbGciOiJIUzI1NiIsInR..."
         *   }
         * }
         */
        return response.data;
    } catch (error) {
        /**
         * Hata durumunda
         * 
         * error → axios interceptor'dan gelen hata
         * error.message → Hata mesajı
         */
        throw error;
    }
};

/**
 * REGISTER FONKSİYONU
 * 
 * Yeni kullanıcı kaydı yapar
 * 
 * @param {Object} userData - Kullanıcı bilgileri
 * @param {string} userData.name - İsim
 * @param {string} userData.email - Email
 * @param {string} userData.password - Şifre
 * @param {string} userData.role - Rol (patient/doctor)
 * @returns {Promise} Backend'den gelen response
 * 
 * Backend Endpoint: POST /api/auth/register
 * Request Body: { name: "...", email: "...", password: "...", role: "..." }
 * Response: { user: {...}, token: "..." }
 */
const register = async (userData) => {
    try {
        // If userData is FormData, let axios set Content-Type automatically
        const config = userData instanceof FormData ? {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        } : {};

        const response = await axiosInstance.post('/auth/register', userData, config);

        /**
         * Başarılı kayıt sonrası genelde otomatik login olur
         * Backend token döndürür
         */
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * LOGOUT FONKSİYONU
 * 
 * Kullanıcı çıkışı yapar
 * 
 * @returns {Promise} Backend'den gelen response
 * 
 * Backend Endpoint: POST /api/auth/logout
 * Not: Token blacklist'e eklenir (backend'de)
 */
const logout = async () => {
    try {
        /**
         * Logout endpoint'i token'ı blacklist'e ekler
         * Böylece token bir daha kullanılamaz
         */
        const response = await axiosInstance.post('/auth/logout');

        return response.data;
    } catch (error) {
        /**
         * Logout başarısız olsa bile localStorage'ı temizleriz
         * Zaten interceptor'da 401 durumunda localStorage temizleniyor
         */
        throw error;
    }
};

/**
 * GET CURRENT USER
 * 
 * Token ile mevcut kullanıcı bilgilerini getirir
 * 
 * @returns {Promise} Kullanıcı bilgileri
 * 
 * Backend Endpoint: GET /api/auth/me
 * Response: { user: {...} }
 * 
 * Ne zaman kullanılır?
 * - Sayfa yenilendiğinde
 * - Token var ama user bilgisi localStorage'da yok
 */
const getCurrentUser = async () => {
    try {
        /**
         * Token otomatik olarak interceptor tarafından eklenir
         * Backend auth middleware ile token'ı doğrular
         */
        const response = await axiosInstance.get('/auth/me');

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * REFRESH TOKEN
 * 
 * Access token'ın süresini uzatır
 * 
 * @returns {Promise} Yeni token
 * 
 * Backend Endpoint: POST /api/auth/refresh
 * Response: { token: "..." }
 * 
 * Ne zaman kullanılır?
 * - Access token süresi dolmadan önce
 * - 401 hatası alındığında (interceptor'da)
 */
const refreshToken = async () => {
    try {
        const response = await axiosInstance.post('/auth/refresh');

        /**
         * Yeni token'ı localStorage'a kaydet
         */
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * EXPORT
 * 
 * Bu fonksiyonları component'lerde kullanacağız
 */
const authService = {
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken,
};

/**
 * ŞİFRE SIFIRLAMA İSTEĞİ
 * 
 * Kullanıcının email adresine şifre sıfırlama linki gönderir
 * 
 * @param {string} email - Kullanıcının email adresi
 * @returns {Promise} Backend'den gelen response
 * 
 * Backend Endpoint: POST /api/auth/forgot-password
 */
export const forgotPassword = async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
};

/**
 * ŞİFREYİ SIFIRLA
 * 
 * Token ile yeni şifre belirler
 * 
 * @param {string} token - Reset token (URL'den alınır)
 * @param {string} password - Yeni şifre
 * @returns {Promise} Backend'den gelen response
 * 
 * Backend Endpoint: POST /api/auth/reset-password/:token
 */
export const resetPassword = async (token, password) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
};

export default authService;

/**
 * KULLANIM ÖRNEĞİ (Component'te):
 * 
 * import authService from './api/authService';
 * 
 * // Login
 * const handleLogin = async () => {
 *   try {
 *     const data = await authService.login({ email, password });
 *     console.log(data.user, data.token);
 *   } catch (error) {
 *     console.error(error.message);
 *   }
 * };
 * 
 * ÖZET:
 * 
 * authService → Tüm auth API çağrıları:
 *   - login(credentials) → Giriş yap
 *   - register(userData) → Kayıt ol
 *   - logout() → Çıkış yap
 *   - getCurrentUser() → Mevcut kullanıcıyı getir
 *   - refreshToken() → Token'ı yenile
 * 
 * Hepsi axiosInstance kullanıyor → Otomatik token ekleme + error handling
 */
