import { createSlice } from '@reduxjs/toolkit';
import * as adminService from '../../api/adminService';

/**
 * ADMIN SLICE
 * 
 * Admin işlemleri için state yönetimi
 * 
 * State içeriği:
 * - users: Tüm kullanıcılar listesi
 * - pendingDoctors: Onay bekleyen doktorlar
 * - stats: İstatistikler (kullanıcı sayıları vs)
 * - loading: Yüklenme durumu
 * - error: Hata mesajı
 */

const initialState = {
    // Kullanıcı listesi
    users: [],

    // Onay bekleyen doktorlar
    pendingDoctors: [],

    // İstatistikler
    stats: {
        totalUsers: 0,
        totalPatients: 0,
        totalDoctors: 0,
        totalAdmins: 0,
        pendingDoctors: 0,
        totalAppointments: 0,
        todayAppointments: 0
    },

    // Seçili kullanıcı
    selectedUser: null,

    // Yüklenme durumu
    loading: false,

    // Hata mesajı
    error: null,

    // Sayfalama
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    }
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // KULLANICI LİSTESİNİ YÜKLE - START
        fetchUsersStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // KULLANICI LİSTESİNİ YÜKLE - SUCCESS
        fetchUsersSuccess: (state, action) => {
            state.loading = false;
            state.users = action.payload.users || action.payload;

            if (action.payload.pagination) {
                state.pagination = action.payload.pagination;
            }
        },

        // KULLANICI LİSTESİNİ YÜKLE - FAILURE
        fetchUsersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // İSTATİSTİKLERİ YÜKLE - START
        fetchStatsStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // İSTATİSTİKLERİ YÜKLE - SUCCESS
        fetchStatsSuccess: (state, action) => {
            state.loading = false;
            state.stats = action.payload;
        },

        // İSTATİSTİKLERİ YÜKLE - FAILURE
        fetchStatsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // BEKLEYEN DOKTORLARI YÜKLE - SUCCESS
        fetchPendingDoctorsSuccess: (state, action) => {
            state.loading = false;
            state.pendingDoctors = action.payload;
        },

        // DOKTOR ONAYLA - START
        approveDoctorStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // DOKTOR ONAYLA - SUCCESS
        approveDoctorSuccess: (state, action) => {
            state.loading = false;
            // Bekleyen doktorlardan çıkar
            state.pendingDoctors = state.pendingDoctors.filter(
                d => d._id !== action.payload
            );
            // İstatistikleri güncelle
            if (state.stats.pendingDoctors > 0) {
                state.stats.pendingDoctors -= 1;
            }
        },

        // DOKTOR ONAYLA - FAILURE
        approveDoctorFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // YENİ ADMİN OLUŞTUR - START
        createAdminStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // YENİ ADMİN OLUŞTUR - SUCCESS
        createAdminSuccess: (state, action) => {
            state.loading = false;
            state.users.unshift(action.payload);
            state.stats.totalAdmins += 1;
            state.stats.totalUsers += 1;
        },

        // YENİ ADMİN OLUŞTUR - FAILURE
        createAdminFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // KULLANICI SİL - SUCCESS
        deleteUserSuccess: (state, action) => {
            state.loading = false;
            state.users = state.users.filter(u => u._id !== action.payload);
        },

        // KULLANICI ROLİNİ GÜNCELLE - SUCCESS
        updateUserRoleSuccess: (state, action) => {
            state.loading = false;
            const index = state.users.findIndex(u => u._id === action.payload._id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        },

        // KULLANICI DETAYI YÜKLE - SUCCESS
        fetchUserByIdSuccess: (state, action) => {
            state.loading = false;
            state.selectedUser = action.payload;
        },

        // HATAYI TEMİZLE
        clearError: (state) => {
            state.error = null;
        },

        // SEÇİLİ KULLANICIYI TEMİZLE
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        }
    }
});

// Actions export
export const {
    fetchUsersStart,
    fetchUsersSuccess,
    fetchUsersFailure,
    fetchStatsStart,
    fetchStatsSuccess,
    fetchStatsFailure,
    fetchPendingDoctorsSuccess,
    approveDoctorStart,
    approveDoctorSuccess,
    approveDoctorFailure,
    createAdminStart,
    createAdminSuccess,
    createAdminFailure,
    deleteUserSuccess,
    updateUserRoleSuccess,
    fetchUserByIdSuccess,
    clearError,
    clearSelectedUser
} = adminSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.admin.users;
export const selectPendingDoctors = (state) => state.admin.pendingDoctors;
export const selectAdminStats = (state) => state.admin.stats;
export const selectSelectedUser = (state) => state.admin.selectedUser;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminPagination = (state) => state.admin.pagination;

// Thunk Actions
export const fetchAllUsers = (params) => async (dispatch) => {
    dispatch(fetchUsersStart());
    const response = await adminService.getAllUsers(params);
    dispatch(fetchUsersSuccess(response.data));
};

export const fetchPendingDoctors = () => async (dispatch) => {
    dispatch(fetchPendingDoctorsStart());
    const response = await adminService.getPendingDoctors();
    dispatch(fetchPendingDoctorsSuccess(response.data));
};

export const fetchStats = () => async (dispatch) => {
    dispatch(fetchStatsStart());
    const response = await adminService.getUserStats();
    dispatch(fetchStatsSuccess(response.data));
};

export const approveDoctorAccount = (doctorId) => async (dispatch) => {
    dispatch(approveDoctorStart());
    const response = await adminService.approveDoctor(doctorId);
    dispatch(approveDoctorSuccess(response.data));
    return response;
};

export const removeUser = (userId) => async (dispatch) => {
    await adminService.deleteUser(userId);
    dispatch(deleteUserSuccess(userId));
};

export default adminSlice.reducer;
