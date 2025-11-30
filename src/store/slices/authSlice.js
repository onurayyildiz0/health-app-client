import { createSlice } from '@reduxjs/toolkit';

/**
 * AUTH SLICE NEDİR?
 * 
 * Kimlik doğrulama ile ilgili tüm state ve fonksiyonları içerir.
 * 
 * İçinde ne var?
 * - state: { user, token, isAuthenticated, loading }
 * - reducers: login, logout, register gibi fonksiyonlar
 */

/**
 * BAŞLANGIÇ STATE'İ
 * 
 * Uygulama ilk açıldığında auth durumu ne olacak?
 * localStorage'dan token ve user bilgisini okuyoruz.
 */
const initialState = {
    // Kullanıcı bilgileri (name, email, role)
    user: localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user'))
        : null,

    // JWT token (API isteklerinde kullanılacak)
    token: localStorage.getItem('token') || null,

    // Kullanıcı giriş yapmış mı?
    isAuthenticated: !!localStorage.getItem('token'),

    // API isteği sırasında loading durumu
    loading: false,

    // Hata mesajları
    error: null,
};

/**
 * SLICE OLUŞTURMA
 * 
 * createSlice: Redux Toolkit'in slice oluşturma fonksiyonu
 * 
 * Parametreler:
 * - name: Slice'ın adı (Redux DevTools'ta görünür)
 * - initialState: Başlangıç durumu
 * - reducers: State'i değiştiren fonksiyonlar
 */
const authSlice = createSlice({
    name: 'auth', // Slice'ın ismi

    initialState, // Başlangıç state'i

    /**
     * REDUCERS = STATE DEĞİŞTİREN FONKSİYONLAR
     * 
     * Her reducer iki parametre alır:
     * 1. state → Mevcut state
     * 2. action → Gönderilen veri (payload içinde)
     * 
     * ÖNEMLI: Redux Toolkit, Immer kullanır, bu yüzden
     * state'i direkt değiştirebiliriz (state.user = ...)
     * Normalde Redux'ta böyle yapmazdık!
     */
    reducers: {
        /**
         * LOGIN START
         * 
         * Login işlemi başladığında çağrılır
         * Loading'i true yapar, error'u temizler
         */
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * LOGIN SUCCESS
         * 
         * Login başarılı olduğunda çağrılır
         * 
         * action.payload içinde ne var?
         * { user: {...}, token: "xxx" }
         */
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;

            // localStorage'a kaydet (tarayıcı kapanınca da kalsın)
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },

        /**
         * LOGIN FAILURE
         * 
         * Login başarısız olduğunda çağrılır
         * 
         * action.payload = Error mesajı
         */
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * REGISTER START
         * 
         * Kayıt işlemi başladığında
         */
        registerStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * REGISTER SUCCESS
         * 
         * Kayıt başarılı olduğunda
         * Genelde kayıt sonrası otomatik login olur
         */
        registerSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;

            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },

        /**
         * REGISTER FAILURE
         * 
         * Kayıt başarısız olduğunda
         */
        registerFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * LOGOUT
         * 
         * Çıkış yapıldığında tüm state'i temizle
         */
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;

            // localStorage'ı temizle
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },

        /**
         * CLEAR ERROR
         * 
         * Hata mesajını temizle
         */
        clearError: (state) => {
            state.error = null;
        },
    },
});

/**
 * ACTIONS EXPORT
 * 
 * Bu action'ları component'lerde dispatch edeceğiz
 * 
 * Örnek kullanım:
 * dispatch(loginSuccess({ user: {...}, token: "xxx" }))
 */
export const {
    loginStart,
    loginSuccess,
    loginFailure,
    registerStart,
    registerSuccess,
    registerFailure,
    logout,
    clearError,
} = authSlice.actions;

/**
 * SELECTORS (State okumak için)
 * 
 * Component'lerde state'i okurken kullanılır
 * 
 * Örnek:
 * const user = useSelector(selectUser)
 */
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

/**
 * REDUCER EXPORT
 * 
 * Bu reducer'ı store'a ekleyeceğiz
 */
export default authSlice.reducer;

/**
 * ÖZET:
 * 
 * 1. Slice = State + Reducers (bir özellik grubu)
 * 2. Reducer = State değiştiren fonksiyon
 * 3. Action = Reducer'ı tetikleyen komut
 * 4. Selector = State'i okumak için yardımcı fonksiyon
 * 
 * AKIŞ:
 * Component → dispatch(action) → reducer → state güncellenir → component re-render
 */
