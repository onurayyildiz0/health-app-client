import { createSlice } from '@reduxjs/toolkit';
import * as userService from '../../api/userService';

/**
 * USER SLICE
 * 
 * Kullanıcı profil işlemleri için state yönetimi
 * 
 * State içeriği:
 * - profile: Kullanıcı profil bilgileri
 * - favoriteDoctors: Favori doktorlar listesi
 * - loading: Yüklenme durumu
 * - error: Hata mesajı
 */

const initialState = {
    // Kullanıcı profili (auth'dan farklı, daha detaylı)
    profile: null,

    // Favori doktorlar
    favoriteDoctors: [],

    // Yüklenme durumu
    loading: false,

    // Hata mesajı
    error: null,

    // Başarı mesajı
    successMessage: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // PROFİLİ YÜKLE - START
        fetchProfileStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // PROFİLİ YÜKLE - SUCCESS
        fetchProfileSuccess: (state, action) => {
            state.loading = false;
            state.profile = action.payload;
            state.error = null;
        },

        // PROFİLİ YÜKLE - FAILURE
        fetchProfileFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // PROFİL GÜNCELLE - START
        updateProfileStart: (state) => {
            state.loading = true;
            state.error = null;
            state.successMessage = null;
        },

        // PROFİL GÜNCELLE - SUCCESS
        updateProfileSuccess: (state, action) => {
            state.loading = false;
            state.profile = action.payload;
            state.successMessage = 'Profil başarıyla güncellendi!';
            state.error = null;
        },

        // PROFİL GÜNCELLE - FAILURE
        updateProfileFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.successMessage = null;
        },

        // ŞİFRE DEĞİŞTİR - START
        changePasswordStart: (state) => {
            state.loading = true;
            state.error = null;
            state.successMessage = null;
        },

        // ŞİFRE DEĞİŞTİR - SUCCESS
        changePasswordSuccess: (state) => {
            state.loading = false;
            state.successMessage = 'Şifre başarıyla değiştirildi!';
            state.error = null;
        },

        // ŞİFRE DEĞİŞTİR - FAILURE
        changePasswordFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.successMessage = null;
        },

        // FAVORİ DOKTORLARI YÜKLE - SUCCESS
        fetchFavoriteDoctorsSuccess: (state, action) => {
            state.loading = false;
            // Backend'den gelen veriyi array olarak ayarla
            state.favoriteDoctors = Array.isArray(action.payload)
                ? action.payload
                : (action.payload?.data || []);
        },

        // FAVORİ DOKTOR EKLE - SUCCESS
        addFavoriteDoctorSuccess: (state, action) => {
            state.loading = false;
            if (!Array.isArray(state.favoriteDoctors)) {
                state.favoriteDoctors = [];
            }
            state.favoriteDoctors.push(action.payload);
            state.successMessage = 'Doktor favorilere eklendi!';
        },

        // FAVORİ DOKTOR ÇIKAR - SUCCESS
        removeFavoriteDoctorSuccess: (state, action) => {
            state.loading = false;
            if (Array.isArray(state.favoriteDoctors)) {
                state.favoriteDoctors = state.favoriteDoctors.filter(
                    d => d._id !== action.payload
                );
            }
            state.successMessage = 'Doktor favorilerden çıkarıldı!';
        },

        // HESAP SİL - START
        deleteAccountStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // HESAP SİL - SUCCESS
        deleteAccountSuccess: (state) => {
            state.loading = false;
            state.profile = null;
            state.favoriteDoctors = [];
        },

        // HESAP SİL - FAILURE
        deleteAccountFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // MESAJLARI TEMİZLE
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    }
});

// Actions export
export const {
    fetchProfileStart,
    fetchProfileSuccess,
    fetchProfileFailure,
    updateProfileStart,
    updateProfileSuccess,
    updateProfileFailure,
    changePasswordStart,
    changePasswordSuccess,
    changePasswordFailure,
    fetchFavoriteDoctorsSuccess,
    addFavoriteDoctorSuccess,
    removeFavoriteDoctorSuccess,
    deleteAccountStart,
    deleteAccountSuccess,
    deleteAccountFailure,
    clearMessages
} = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectFavoriteDoctors = (state) => state.user.favoriteDoctors;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectUserSuccessMessage = (state) => state.user.successMessage;

// Thunk Actions
export const fetchUserProfile = () => async (dispatch) => {
    dispatch(fetchProfileStart());
    const response = await userService.getMyProfile();
    dispatch(fetchProfileSuccess(response.data));
};

export const updateUserProfile = (profileData) => async (dispatch) => {
    dispatch(updateProfileStart());
    const response = await userService.updateProfile(profileData);
    dispatch(updateProfileSuccess(response.data));
    return response;
};

export const updatePassword = (passwordData) => async (dispatch) => {
    dispatch(changePasswordStart());
    const response = await userService.changePassword(passwordData);
    dispatch(changePasswordSuccess());
    return response;
};

export const fetchFavoriteDoctors = () => async (dispatch) => {
    const response = await userService.getFavoriteDoctors();
    // Backend {favorites: [...]} döndürüyor
    const doctors = response.favorites || response.data || response || [];
    dispatch(fetchFavoriteDoctorsSuccess(doctors));
};

export const addToFavorites = (doctorId) => async (dispatch) => {
    const response = await userService.addFavoriteDoctor(doctorId);
    dispatch(addFavoriteDoctorSuccess(response.data));
    return response;
};

export const removeFromFavorites = (doctorId) => async (dispatch) => {
    await userService.removeFavoriteDoctor(doctorId);
    dispatch(removeFavoriteDoctorSuccess(doctorId));
};

export const removeAccount = () => async (dispatch) => {
    dispatch(deleteAccountStart());
    await userService.deleteAccount();
    dispatch(deleteAccountSuccess());
};

export default userSlice.reducer;
