import { createSlice } from '@reduxjs/toolkit';
import * as doctorService from '../../api/doctorService';

const initialState = {
    doctors: [], // Public liste
    selectedDoctor: null, // Detay sayfası için
    currentDoctorProfile: null, // Doktorun kendi paneli için (Schedule, Info vs.)
    doctorsBySpeciality: [],
    topRatedDoctors: [],
    doctorReviews: [],
    loading: false,
    error: null,
    successMessage: null,
    pagination: { page: 1, limit: 10, total: 0, pages: 0 }
};

const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        resetDoctorState: (state) => {
            state.doctors = [];
            state.selectedDoctor = null;
            state.currentDoctorProfile = null;
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        },
        actionStart: (state) => {
            state.loading = true;
            state.error = null;
            state.successMessage = null;
        },
        actionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.successMessage = null;
        },
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },

        // --- PUBLIC ACTIONS ---
        fetchDoctorsSuccess: (state, action) => {
            state.loading = false;
            state.doctors = action.payload.doctors || action.payload;
            if (action.payload.pagination) state.pagination = action.payload.pagination;
        },
        fetchDoctorByIdSuccess: (state, action) => {
            state.loading = false;
            state.selectedDoctor = action.payload;
        },
        fetchDoctorReviewsSuccess: (state, action) => {
            state.doctorReviews = action.payload;
        },

        // --- DOCTOR PANEL ACTIONS (PRIVATE) ---
        fetchMyProfileSuccess: (state, action) => {
            state.loading = false;
            state.currentDoctorProfile = action.payload.data || action.payload;
        },
        updateDoctorProfileSuccess: (state, action) => {
            state.loading = false;
            state.successMessage = 'İşlem başarıyla tamamlandı.';
            // Güncel veriyi state'e yansıt
            state.currentDoctorProfile = { ...state.currentDoctorProfile, ...action.payload };
        },
        addUnavailableDateSuccess: (state) => {
            state.loading = false;
            state.successMessage = 'İzin tarihi eklendi.';
            // Not: Listeyi yenilemek için component fetch tetikleyecek veya burada manuel push yapılabilir.
            // Karmaşık JSON parse işleri yüzünden fetch tetiklemek daha güvenli.
        },
        cancelUnavailableDateSuccess: (state) => {
            state.loading = false;
            state.successMessage = 'İzin iptal edildi.';
        }
    }
});

export const {
    resetDoctorState,
    actionStart,
    actionFailure,
    clearMessages,
    fetchDoctorsSuccess,
    fetchDoctorByIdSuccess,
    fetchDoctorReviewsSuccess,
    fetchMyProfileSuccess,
    updateDoctorProfileSuccess,
    addUnavailableDateSuccess,
    cancelUnavailableDateSuccess
} = doctorSlice.actions;

// Selectors
export const selectAllDoctors = (state) => state.doctor.doctors;
export const selectSelectedDoctor = (state) => state.doctor.selectedDoctor;
export const selectCurrentDoctorProfile = (state) => state.doctor.currentDoctorProfile; // YENİ
export const selectDoctorReviews = (state) => state.doctor.doctorReviews;
export const selectDoctorLoading = (state) => state.doctor.loading;
export const selectDoctorError = (state) => state.doctor.error;
export const selectDoctorSuccessMessage = (state) => state.doctor.successMessage;
export const selectDoctorPagination = (state) => state.doctor.pagination;

// Thunk Actions

// 1. Public List
export const fetchAllDoctors = (params) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await doctorService.getAllDoctors(params);
        dispatch(fetchDoctorsSuccess(response.data));
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

// 2. Public Detail
export const fetchDoctorDetails = (id) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await doctorService.getDoctorById(id);
        dispatch(fetchDoctorByIdSuccess(response.data));
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

// 3. My Profile (Doctor Panel)
export const fetchMyDoctorProfile = () => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await doctorService.getMyDoctorProfile();
        dispatch(fetchMyProfileSuccess(response)); // response.data service'de ayarlanmış olabilir
    } catch (err) {
        dispatch(actionFailure(err.message));
    }
};

// 4. Update Schedule
export const updateDoctorSchedule = (scheduleData) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await doctorService.setDoctorSchedule(scheduleData);
        // Backend tam obje dönmüyorsa sadece success mesajı verip manuel fetch yaptırabiliriz
        // veya payload'ı state'e merge edebiliriz.
        dispatch(updateDoctorProfileSuccess({ 
            clocks: JSON.stringify(scheduleData.clocks), 
            consultationFee: scheduleData.consultationFee 
        }));
    } catch (err) {
        dispatch(actionFailure(err.message));
        throw err;
    }
};

// 5. Update Info (Bio, Location etc.)
export const updateDoctorInfo = (infoData) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await doctorService.updateDoctorInfo(infoData);
        dispatch(updateDoctorProfileSuccess(infoData));
    } catch (err) {
        dispatch(actionFailure(err.message));
        throw err;
    }
};

// 6. Unavailable Dates
export const addUnavailableDate = (data) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await doctorService.addUnavailableDate(data);
        dispatch(addUnavailableDateSuccess());
        // Veri tutarlılığı için profili yeniden çekiyoruz
        dispatch(fetchMyDoctorProfile());
    } catch (err) {
        dispatch(actionFailure(err.response?.data?.message || err.message));
        throw err;
    }
};

export const cancelUnavailableDate = (key) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await doctorService.cancelUnavailableDate(key);
        dispatch(cancelUnavailableDateSuccess());
        dispatch(fetchMyDoctorProfile());
    } catch (err) {
        dispatch(actionFailure(err.response?.data?.message || err.message));
        throw err;
    }
};

export default doctorSlice.reducer;