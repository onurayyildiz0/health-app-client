import { createSlice } from '@reduxjs/toolkit';
import * as appointmentService from '../../api/appointmentService';

const initialState = {
    appointments: [], 
    selectedAppointment: null, 
    bookedSlots: [], 
    loading: false, 
    error: null, 
    filters: {
        status: 'all', 
        dateRange: null
    }
};

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        resetAppointmentState: (state) => {
            state.appointments = [];
            state.selectedAppointment = null;
            state.bookedSlots = [];
            state.loading = false;
            state.error = null;
            state.filters = { status: 'all', dateRange: null };
        },
        actionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        actionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchAppointmentsSuccess: (state, action) => {
            state.loading = false;
            state.appointments = action.payload;
            state.error = null;
        },
        createAppointmentSuccess: (state, action) => {
            state.loading = false;
            if (!state.appointments) state.appointments = [];
            state.appointments.push(action.payload);
            state.error = null;
        },
        fetchBookedSlotsSuccess: (state, action) => {
            state.loading = false;
            state.bookedSlots = action.payload.data || action.payload || [];
        },
        clearBookedSlots: (state) => {
            state.bookedSlots = [];
        },
        updateAppointmentSuccess: (state, action) => {
            state.loading = false;
            const index = state.appointments.findIndex(app => app.id === action.payload.id); // _id veya id kontrolü
            if (index !== -1) state.appointments[index] = action.payload;
            if (state.selectedAppointment?.id === action.payload.id) {
                state.selectedAppointment = action.payload;
            }
            state.error = null;
        },
        deleteAppointmentSuccess: (state, action) => {
            state.loading = false;
            // Admin panelinde veya listeden silme/iptal durumunda
            // Eğer iptal statüsü "cancelled" olarak güncelleniyorsa update, listeden kalkıyorsa filter kullanılır.
            // Genelde iptal edilen randevular listede "İptal" olarak kalır, bu yüzden burada bir güncelleme de yapılabilir.
            // Ancak UI'da listeden düşürmek istiyorsak:
            state.appointments = state.appointments.filter(app => app.id !== action.payload); 
            // Eğer statü güncellenecekse updateAppointmentSuccess kullanılmalı.
            state.error = null;
        },
        selectAppointment: (state, action) => {
            state.selectedAppointment = action.payload;
        },
        clearSelectedAppointment: (state) => {
            state.selectedAppointment = null;
        }
    }
});

export const {
    resetAppointmentState,
    actionStart,
    actionFailure,
    fetchAppointmentsSuccess,
    createAppointmentSuccess,
    fetchBookedSlotsSuccess,
    clearBookedSlots,
    updateAppointmentSuccess,
    selectAppointment,
    clearSelectedAppointment,
    deleteAppointmentSuccess
} = appointmentSlice.actions;

// Selectors
export const selectAllAppointments = (state) => state.appointments.appointments;
export const selectBookedSlots = (state) => state.appointments.bookedSlots;
export const selectAppointmentLoading = (state) => state.appointments.loading;
export const selectAppointmentError = (state) => state.appointments.error;
export const selectSelectedAppointment = (state) => state.appointments.selectedAppointment;

// Thunk Actions
export const fetchMyAppointments = () => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await appointmentService.getMyAppointments();
        const appointments = Array.isArray(response) ? response : (response.data || []);
        dispatch(fetchAppointmentsSuccess(appointments));
    } catch (error) {
        dispatch(actionFailure(error.message || 'Randevular yüklenemedi'));
    }
};

export const createNewAppointment = (appointmentData) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await appointmentService.createAppointment(appointmentData);
        dispatch(createAppointmentSuccess(response.data));
        return response;
    } catch (error) {
        dispatch(actionFailure(error.response?.data?.message || error.message || 'Randevu oluşturulamadı'));
        throw error;
    }
};

export const fetchDoctorAppointments = () => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await appointmentService.getDoctorAppointments();
        dispatch(fetchAppointmentsSuccess(response.data || response)); 
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

export const updateAppointmentStatus = ({ id, status }) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const res = await appointmentService.updateAppointmentStatus(id, status);
        dispatch(updateAppointmentSuccess(res.data || res));
    } catch (err) {
        dispatch(actionFailure(err.message));
        throw err;
    }
}

export const fetchDoctorBookedSlots = (doctorId, dateString) => async (dispatch) => {
    try {
        const response = await appointmentService.getBookedSlots(doctorId, dateString);
        dispatch(fetchBookedSlotsSuccess(response));
    } catch (error) {
        console.error(error);
        dispatch(fetchBookedSlotsSuccess([]));
    }
};

export const cancelExistingAppointment = (appointmentId) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await appointmentService.cancelAppointment(appointmentId);
        // İptal edilen randevunun statüsünü localde güncellemek daha iyi bir UX olabilir
        // Ama şimdilik basitçe success dönüyoruz, component fetchAll yapabilir veya filter.
        dispatch(deleteAppointmentSuccess(appointmentId)); // Listeden siler
    } catch (error) {
        dispatch(actionFailure(error.message || 'Randevu iptal edilemedi'));
        throw error;
    }
};

// --- YENİ EKLENEN THUNKS ---

export const fetchAllAppointments = () => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await appointmentService.getAllAppointments();
        dispatch(fetchAppointmentsSuccess(response.data || response));
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

export const completeAppointment = (id, data) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await appointmentService.completeAppointment(id, data);
        dispatch(updateAppointmentSuccess(response.data || response));
        return response;
    } catch (err) {
        dispatch(actionFailure(err.response?.data?.message || err.message));
        throw err;
    }
};

export default appointmentSlice.reducer;