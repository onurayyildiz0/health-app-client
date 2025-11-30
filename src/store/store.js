import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';
import doctorReducer from './slices/doctorSlice';
import reviewReducer from './slices/reviewSlice';
import adminReducer from './slices/adminSlice';
import userReducer from './slices/userSlice';

/**
 * REDUX STORE NEDİR?
 * 
 * Store, uygulamanızın tüm state'lerinin (verilerin) tutulduğu merkezi bir yerdir.
 * Düşünün ki bir veritabanı gibi, ama tarayıcıda çalışıyor.
 * 
 * Örnek:
 * - Kullanıcı giriş yaptı mı? → authSlice'ta tutuluyor
 * - Kullanıcı bilgileri neler? → authSlice'ta tutuluyor
 * - Randevular neler? → appointmentSlice'ta tutuluyor
 * - Doktorlar neler? → doctorSlice'ta tutuluyor
 * - Değerlendirmeler neler? → reviewSlice'ta tutuluyor
 * - Admin işlemleri → adminSlice'ta tutuluyor
 * - Kullanıcı profili → userSlice'ta tutuluyor
 */

/**
 * configureStore:
 * Redux Toolkit'in store oluşturma fonksiyonu.
 * 
 * reducer: {} → Buraya farklı "slice"ları ekliyoruz
 * Slice = State'in bir parçası (örn: auth, user, appointments)
 */
const store = configureStore({
    reducer: {
        // auth: authReducer → state.auth olarak erişilebilir
        auth: authReducer,

        // appointments: appointmentReducer → state.appointments olarak erişilebilir
        appointments: appointmentReducer,

        // doctor: doctorReducer → state.doctor olarak erişilebilir
        doctor: doctorReducer,

        // review: reviewReducer → state.review olarak erişilebilir
        review: reviewReducer,

        // admin: adminReducer → state.admin olarak erişilebilir
        admin: adminReducer,

        // user: userReducer → state.user olarak erişilebilir
        user: userReducer,
    },
});

/**
 * NASIL ÇALIŞIR?
 * 
 * 1. Component'te bir action dispatch ediyorsunuz (örn: "kullanıcı giriş yaptı")
 * 2. Store bu action'ı ilgili reducer'a gönderiyor
 * 3. Reducer state'i güncelliyor
 * 4. Component'ler yeni state'i alıyor ve re-render oluyor
 * 
 * Örnek akış:
 * LoginPage → dispatch(login()) → authSlice → store → tüm componentler
 */

export default store;
