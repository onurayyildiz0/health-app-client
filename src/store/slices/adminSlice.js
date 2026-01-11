import { createSlice } from '@reduxjs/toolkit';
import * as adminService from '../../api/adminService';

const initialState = {
    users: [],
    pendingDoctors: [],
    stats: {
        totalUsers: 0,
        totalPatients: 0,
        totalDoctors: 0,
        pendingDoctors: 0,
        totalAppointments: 0
    },
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, total: 0 }
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        actionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        actionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchUsersSuccess: (state, action) => {
            state.loading = false;
            state.users = action.payload.users || action.payload;
            if (action.payload.pagination) state.pagination = action.payload.pagination;
        },
        fetchStatsSuccess: (state, action) => {
            state.loading = false;
            state.stats = action.payload;
        },
        fetchPendingDoctorsSuccess: (state, action) => {
            state.loading = false;
            state.pendingDoctors = action.payload;
        },
        approveDoctorSuccess: (state, action) => {
            state.loading = false;
            // Listeden çıkar
            state.pendingDoctors = state.pendingDoctors.filter(d => d.user?.id !== action.payload && d.id !== action.payload);
            // İstatistik güncelle
            if (state.stats.pendingDoctors > 0) state.stats.pendingDoctors -= 1;
            state.stats.totalDoctors += 1;
        },
        createAdminSuccess: (state, action) => {
            state.loading = false;
            // Yeni admini listeye ekle
            state.users.unshift(action.payload);
            state.stats.totalUsers += 1;
        },
        deleteUserSuccess: (state, action) => {
            state.loading = false;
            state.users = state.users.filter(u => u.id !== action.payload);
            state.stats.totalUsers -= 1;
        },
        updateUserRoleSuccess: (state, action) => {
            state.loading = false;
            // Kullanıcıyı bul ve rolünü güncelle (Optimistic update yapılabilir veya backend cevabı beklenebilir)
            // Backend tam user objesi dönüyorsa:
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        },
        resetAdminState: (state) => {
            state.users = [];
            state.pendingDoctors = [];
            state.stats = initialState.stats;
            state.loading = false;
            state.error = null;
        }
    }
});

export const {
    actionStart,
    actionFailure,
    fetchUsersSuccess,
    fetchStatsSuccess,
    fetchPendingDoctorsSuccess,
    approveDoctorSuccess,
    createAdminSuccess,
    deleteUserSuccess,
    updateUserRoleSuccess,
    resetAdminState
} = adminSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.admin.users;
export const selectPendingDoctors = (state) => state.admin.pendingDoctors;
export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminLoading = (state) => state.admin.loading;

// THUNK ACTIONS

// 1. İstatistikleri Getir
export const fetchStats = () => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await adminService.getUserStats();
        dispatch(fetchStatsSuccess(response.data || response));
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

// 2. Kullanıcıları Getir
export const fetchAllUsers = (role) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = role 
            ? await adminService.getUsersByRole(role)
            : await adminService.getAllUsers();
        dispatch(fetchUsersSuccess(response.data || response));
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

// 3. Bekleyen Doktorları Getir
export const fetchPendingDoctors = () => async (dispatch) => {
    try {
        // dispatch(actionStart()); // Loading her seferinde dönmesin istersen kapatabilirsin
        const response = await adminService.getPendingDoctors();
        dispatch(fetchPendingDoctorsSuccess(response.data || response));
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

// 4. Yeni Admin Oluştur
export const createNewAdmin = (adminData) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await adminService.createAdmin(adminData);
        dispatch(createAdminSuccess(response.data || response));
        return response; 
    } catch (err) {
        dispatch(actionFailure(err.response?.data?.message || err.message));
        throw err; // Component tarafında catch yakalasın diye
    }
};

// 5. Doktor Onayla
export const approveDoctorAccount = (doctorId) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await adminService.approveDoctor(doctorId);
        dispatch(approveDoctorSuccess(doctorId));
        // Bekleyen listesini ve ana kullanıcı listesini yenilemek iyi olabilir
        dispatch(fetchAllUsers()); 
    } catch (err) {
        dispatch(actionFailure(err.message));
        throw err;
    }
};

// 6. Kullanıcı Sil
export const removeUser = (userId) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await adminService.deleteUser(userId);
        dispatch(deleteUserSuccess(userId));
    } catch (err) {
        dispatch(actionFailure(err.message));
        throw err;
    }
};

// 7. Rol Güncelle
export const modifyUserRole = (userId, role) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await adminService.updateUserRole(userId, role);
        // Eğer backend güncel user objesini "data" içinde dönüyorsa:
        dispatch(updateUserRoleSuccess(response.data || response));
        // Dönmüyorsa manuel fetch gerekebilir:
        // dispatch(fetchAllUsers());
    } catch (err) {
        dispatch(actionFailure(err.message));
        throw err;
    }
};

export default adminSlice.reducer;