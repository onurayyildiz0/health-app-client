import { createSlice } from '@reduxjs/toolkit';
import * as appointmentService from '../../api/appointmentService';

/**
 * APPOINTMENT SLICE
 * 
 * Randevu state management'ı için Redux slice
 */

const initialState = {
    appointments: [], // Tüm randevular
    selectedAppointment: null, // Seçili randevu (detay sayfası için)
    loading: false, // API çağrısı yapılıyor mu?
    error: null, // Hata mesajı
    filters: {
        status: 'all', // 'all', 'pending', 'confirmed', 'cancelled', 'completed'
        dateRange: null
    }
};

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        // FETCH APPOINTMENTS - Başlangıç
        fetchAppointmentsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        // FETCH APPOINTMENTS - Başarılı
        fetchAppointmentsSuccess: (state, action) => {
            state.loading = false;
            state.appointments = action.payload;
            state.error = null;
        },
        // FETCH APPOINTMENTS - Hata
        fetchAppointmentsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // CREATE APPOINTMENT - Başlangıç
        createAppointmentStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        // CREATE APPOINTMENT - Başarılı
        createAppointmentSuccess: (state, action) => {
            state.loading = false;
            // Appointments array'i yoksa oluştur
            if (!state.appointments) {
                state.appointments = [];
            }
            state.appointments.push(action.payload); // Yeni randevuyu listeye ekle
            state.error = null;
        },
        // CREATE APPOINTMENT - Hata
        createAppointmentFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // UPDATE APPOINTMENT STATUS - Başlangıç
        updateAppointmentStatusStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        // UPDATE APPOINTMENT STATUS - Başarılı
        updateAppointmentStatusSuccess: (state, action) => {
            state.loading = false;
            // Güncellenen randevuyu bul ve değiştir
            const index = state.appointments.findIndex(
                app => app._id === action.payload._id
            );
            if (index !== -1) {
                state.appointments[index] = action.payload;
            }
            // Eğer selectedAppointment güncelleniyorsa onu da güncelle
            if (state.selectedAppointment?._id === action.payload._id) {
                state.selectedAppointment = action.payload;
            }
            state.error = null;
        },
        // UPDATE APPOINTMENT STATUS - Hata
        updateAppointmentStatusFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // SELECT APPOINTMENT (Detay sayfası için)
        selectAppointment: (state, action) => {
            state.selectedAppointment = action.payload;
        },

        // CLEAR SELECTED APPOINTMENT
        clearSelectedAppointment: (state) => {
            state.selectedAppointment = null;
        },

        // SET FILTER
        setFilter: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },

        // CLEAR ERROR
        clearAppointmentError: (state) => {
            state.error = null;
        },

        // DELETE APPOINTMENT - Başlangıç
        deleteAppointmentStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        // DELETE APPOINTMENT - Başarılı
        deleteAppointmentSuccess: (state, action) => {
            state.loading = false;
            state.appointments = state.appointments.filter(
                app => app._id !== action.payload
            );
            state.error = null;
        },
        // DELETE APPOINTMENT - Hata
        deleteAppointmentFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

// Actions export
export const {
    fetchAppointmentsStart,
    fetchAppointmentsSuccess,
    fetchAppointmentsFailure,
    createAppointmentStart,
    createAppointmentSuccess,
    createAppointmentFailure,
    updateAppointmentStatusStart,
    updateAppointmentStatusSuccess,
    updateAppointmentStatusFailure,
    selectAppointment,
    clearSelectedAppointment,
    setFilter,
    clearAppointmentError,
    deleteAppointmentStart,
    deleteAppointmentSuccess,
    deleteAppointmentFailure
} = appointmentSlice.actions;

// Selectors
export const selectAllAppointments = (state) => state.appointments.appointments;
export const selectAppointmentLoading = (state) => state.appointments.loading;
export const selectAppointmentError = (state) => state.appointments.error;
export const selectSelectedAppointment = (state) => state.appointments.selectedAppointment;
export const selectAppointmentFilters = (state) => state.appointments.filters;

// Filtered appointments selector
export const selectFilteredAppointments = (state) => {
    const { appointments, filters } = state.appointments;

    let filtered = appointments;

    // Status filter
    if (filters.status !== 'all') {
        filtered = filtered.filter(app => app.status === filters.status);
    }

    // Date range filter (opsiyonel, sonra eklenebilir)
    if (filters.dateRange) {
        // Tarih filtreleme mantığı
    }

    return filtered;
};

// Thunk Actions
export const fetchMyAppointments = () => async (dispatch) => {
    try {
        dispatch(fetchAppointmentsStart());
        const response = await appointmentService.getMyAppointments();
        // Service zaten response.data döndürüyor
        const appointments = Array.isArray(response) ? response : (response.data || []);
        dispatch(fetchAppointmentsSuccess(appointments));
    } catch (error) {
        dispatch(fetchAppointmentsFailure(error.message || 'Randevular yüklenemedi'));
        throw error;
    }
};

export const createNewAppointment = (appointmentData) => async (dispatch) => {
    try {
        dispatch(createAppointmentStart());
        const response = await appointmentService.createAppointment(appointmentData);
        dispatch(createAppointmentSuccess(response.data));
        return response;
    } catch (error) {
        dispatch(createAppointmentFailure(error.message || 'Randevu oluşturulamadı'));
        throw error;
    }
};

export const cancelExistingAppointment = (appointmentId) => async (dispatch) => {
    try {
        dispatch(deleteAppointmentStart());
        await appointmentService.cancelAppointment(appointmentId);
        dispatch(deleteAppointmentSuccess(appointmentId));
    } catch (error) {
        dispatch(deleteAppointmentFailure(error.message || 'Randevu iptal edilemedi'));
        throw error;
    }
};

export const rescheduleExistingAppointment = (appointmentId, newData) => async (dispatch) => {
    try {
        dispatch(updateAppointmentStatusStart());
        const response = await appointmentService.rescheduleAppointment(appointmentId, newData);
        dispatch(updateAppointmentStatusSuccess(response.data));
        return response;
    } catch (error) {
        dispatch(updateAppointmentStatusFailure(error.message || 'Randevu güncellenemedi'));
        throw error;
    }
};

export default appointmentSlice.reducer;
