import axios from 'axios';

/**
 * AXIOS NEDİR?
 * 
 * Backend API'sine istek yapmak için kullanılan bir kütüphane.
 * fetch()'ten farkı:
 * - Otomatik JSON dönüşümü
 * - Interceptor (araya girme) özelliği
 * - Request/Response işleme
 * - Daha iyi error handling
 */

/**
 * BASE URL
 * 
 * Backend API'nizin ana adresi
 * Tüm istekler bu adrese yapılacak
 * 
 * Örnek:
 * axios.get('/auth/login') → https://health-app-xequ.onrender.com/api/auth/login
 */
const API_URL = import.meta.env.VITE_API_URL || 'https://health-app-xequ.onrender.com/api';

/**
 * RATE LIMITING
 * 
 * Render.com free tier için çok fazla istek engellemesi
 * Tüm istekler arasında minimum delay
 */
let lastRequestTime = 0;
const MIN_REQUEST_DELAY = 1500; // Tüm istekler arasında minimum 1.5 saniye
// const requestQueue = [];
// let isProcessingQueue = false;

/**
 * AXIOS INSTANCE OLUŞTURMA
 * 
 * Kendi özelleştirilmiş axios örneğimiz
 * Her istekte otomatik olarak baseURL eklenecek
 */
const axiosInstance = axios.create({
    baseURL: API_URL,

    // Timeout süresi (30 saniye) - Render free tier için artırıldı
    timeout: 30000,

    // Varsayılan header'lar
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * REQUEST INTERCEPTOR
 * 
 * Her API isteği YAPILMADAN ÖNCE çalışır
 * 
 * Ne işe yarar?
 * - Her isteğe otomatik token ekler
 * - Request'i loglayabilirsiniz
 * - İsteği değiştirebilirsiniz
 * 
 * Nasıl çalışır?
 * 1. İstek yapılıyor → axios.get('/users')
 * 2. Interceptor devreye giriyor
 * 3. Token var mı kontrol ediyor
 * 4. Varsa Authorization header'a ekliyor
 * 5. İstek backend'e gönderiliyor
 */
axiosInstance.interceptors.request.use(
    async (config) => {
        /**
         * localStorage'dan token al
         * 
         * Neden localStorage?
         * Kullanıcı sayfayı yenileyince bile token kaybolmasın
         */
        const token = localStorage.getItem('token');

        /**
         * Token varsa Authorization header'a ekle
         * 
         * Backend'de middleware bu header'ı okuyacak:
         * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
         */
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        /**
         * GLOBAL RATE LIMITING
         * Tüm istekler arasında minimum delay
         */
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;

        if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
            const waitTime = MIN_REQUEST_DELAY - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        lastRequestTime = Date.now();

        return config;
    },
    (error) => {
        // İstek yapılamadan hata oluştu
        return Promise.reject(error);
    }
);

/**
 * RESPONSE INTERCEPTOR
 * 
 * Backend'den CEVAP GELDİKTEN SONRA çalışır
 * 
 * Ne işe yarar?
 * - Başarılı response'ları loglar
 * - Hataları yakalar ve işler
 * - 401 (Unauthorized) durumunda otomatik logout
 * - Error mesajlarını düzenler
 * 
 * Nasıl çalışır?
 * 1. Backend cevap gönderdi
 * 2. Interceptor devreye giriyor
 * 3. Status kodu kontrol ediliyor
 * 4. Hata varsa özel işlemler yapılıyor
 * 5. Response component'e dönüyor
 */
axiosInstance.interceptors.response.use(
    (response) => {
        /**
         * BAŞARILI RESPONSE (200-299)
         * 
         * response.data → Backend'den gelen veri
         */
        return response;
    },
    (error) => {
        /**
         * HATA DURUMU
         * 
         * error.response → Backend'den gelen hata cevabı
         * error.response.status → HTTP status kodu (401, 404, 500...)
         * error.response.data → Hata mesajı
         */

        // Timeout hatası
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return Promise.reject({
                status: 0,
                message: 'İstek zaman aşımına uğradı. Sunucu yanıt vermiyor, lütfen tekrar deneyin.',
                data: null,
            });
        }

        // Network hatası
        if (error.message === 'Network Error') {
            return Promise.reject({
                status: 0,
                message: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
                data: null,
            });
        }

        /**
         * 401 UNAUTHORIZED
         * 
         * Token geçersiz veya süresi dolmuş
         * Kullanıcıyı otomatik logout yap
         */
        if (error.response?.status === 401) {
            // localStorage'ı temizle
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Login sayfasına yönlendir
            // Not: window.location yerine navigate kullanmak daha iyi
            // ama burada axiosInstance component dışında olduğu için window.location kullanıyoruz
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // Hata mesajını düzenle
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Bir hata oluştu';

        // Hata objesini döndür
        return Promise.reject({
            status: error.response?.status,
            message: errorMessage,
            data: error.response?.data,
        });
    }
);

/**
 * EXPORT
 * 
 * Bu instance'ı tüm API çağrılarında kullanacağız
 */
export default axiosInstance;

/**
 * KULLANIM ÖRNEKLERİ:
 * 
 * // GET isteği
 * const response = await axiosInstance.get('/users');
 * 
 * // POST isteği
 * const response = await axiosInstance.post('/auth/login', { email, password });
 * 
 * // PUT isteği
 * const response = await axiosInstance.put('/users/123', { name: 'Ahmet' });
 * 
 * // DELETE isteği
 * const response = await axiosInstance.delete('/users/123');
 * 
 * ÖZET:
 * 
 * axiosInstance → Her istekte:
 *   1. Otomatik baseURL ekler (http://localhost:3000/api)
 *   2. Otomatik token ekler (Authorization header)
 *   3. Hataları yakalar ve işler
 *   4. 401 durumunda logout yapar
 */
