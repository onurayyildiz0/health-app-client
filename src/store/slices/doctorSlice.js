import { createSlice } from '@reduxjs/toolkit';
import * as doctorService from '../../api/doctorService';

/**
 * DOCTOR SLICE
 * 
 * Doktor işlemleri için state yönetimi
 * 
 * State içeriği:
 * - doctors: Tüm doktorlar listesi
 * - selectedDoctor: Seçili doktor detayı
 * - doctorsBySpeciality: Branşa göre filtrelenmiş doktorlar
 * - topRatedDoctors: En yüksek puanlı doktorlar
 * - loading: Yüklenme durumu
 * - error: Hata mesajı
 */

const initialState = {
    // Tüm doktorlar
    doctors: [],

    // Seçili doktor (detay sayfası için)
    selectedDoctor: null,

    // Branşa göre doktorlar
    doctorsBySpeciality: [],

    // En yüksek puanlı doktorlar
    topRatedDoctors: [],

    // Doktor yorumları
    doctorReviews: [],

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

const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        // DOKTOR LİSTESİNİ YÜKLE - START
        fetchDoctorsStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // DOKTOR LİSTESİNİ YÜKLE - SUCCESS
        fetchDoctorsSuccess: (state, action) => {
            state.loading = false;
            state.doctors = action.payload.doctors || action.payload;

            if (action.payload.pagination) {
                state.pagination = action.payload.pagination;
            }
        },

        // DOKTOR LİSTESİNİ YÜKLE - FAILURE
        fetchDoctorsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // DOKTOR DETAYI YÜKLE - START
        fetchDoctorByIdStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // DOKTOR DETAYI YÜKLE - SUCCESS
        fetchDoctorByIdSuccess: (state, action) => {
            state.loading = false;
            state.selectedDoctor = action.payload;
        },

        // DOKTOR DETAYI YÜKLE - FAILURE
        fetchDoctorByIdFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // BRANŞA GÖRE DOKTORLAR - SUCCESS
        fetchDoctorsBySpecialitySuccess: (state, action) => {
            state.loading = false;
            state.doctorsBySpeciality = action.payload;
        },

        // EN YÜKSEK PUANLI DOKTORLAR - SUCCESS
        fetchTopRatedDoctorsSuccess: (state, action) => {
            state.loading = false;
            state.topRatedDoctors = action.payload;
        },

        // DOKTOR YORUMLARI YÜKLE - SUCCESS
        fetchDoctorReviewsSuccess: (state, action) => {
            state.doctorReviews = action.payload;
        },

        // YENİ DOKTOR OLUŞTUR - START
        createDoctorStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // YENİ DOKTOR OLUŞTUR - SUCCESS
        createDoctorSuccess: (state, action) => {
            state.loading = false;
            state.doctors.push(action.payload);
        },

        // YENİ DOKTOR OLUŞTUR - FAILURE
        createDoctorFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // DOKTOR GÜNCELLE - SUCCESS
        updateDoctorSuccess: (state, action) => {
            state.loading = false;
            const index = state.doctors.findIndex(d => d._id === action.payload._id);
            if (index !== -1) {
                state.doctors[index] = action.payload;
            }
            if (state.selectedDoctor?._id === action.payload._id) {
                state.selectedDoctor = action.payload;
            }
        },

        // DOKTOR SİL - SUCCESS
        deleteDoctorSuccess: (state, action) => {
            state.loading = false;
            state.doctors = state.doctors.filter(d => d._id !== action.payload);
        },

        // SEÇİLİ DOKTORU TEMİZLE
        clearSelectedDoctor: (state) => {
            state.selectedDoctor = null;
        },

        // HATAYI TEMİZLE
        clearError: (state) => {
            state.error = null;
        }
    }
});

// Actions export
export const {
    fetchDoctorsStart,
    fetchDoctorsSuccess,
    fetchDoctorsFailure,
    fetchDoctorByIdStart,
    fetchDoctorByIdSuccess,
    fetchDoctorByIdFailure,
    fetchDoctorsBySpecialitySuccess,
    fetchTopRatedDoctorsSuccess,
    fetchDoctorReviewsSuccess,
    createDoctorStart,
    createDoctorSuccess,
    createDoctorFailure,
    updateDoctorSuccess,
    deleteDoctorSuccess,
    clearSelectedDoctor,
    clearError
} = doctorSlice.actions;

// Selectors
export const selectAllDoctors = (state) => state.doctor.doctors;
export const selectSelectedDoctor = (state) => state.doctor.selectedDoctor;
export const selectDoctorsBySpeciality = (state) => state.doctor.doctorsBySpeciality;
export const selectTopRatedDoctors = (state) => state.doctor.topRatedDoctors;
export const selectDoctorReviews = (state) => state.doctor.doctorReviews;
export const selectDoctorLoading = (state) => state.doctor.loading;
export const selectDoctorError = (state) => state.doctor.error;
export const selectDoctorPagination = (state) => state.doctor.pagination;

// Thunk Actions
export const fetchAllDoctors = (params) => async (dispatch) => {
    dispatch(fetchDoctorsStart());
    const response = await doctorService.getAllDoctors(params);
    dispatch(fetchDoctorsSuccess(response.data));
};

export const fetchDoctorDetails = (id) => async (dispatch) => {
    dispatch(fetchDoctorByIdStart());
    const response = await doctorService.getDoctorById(id);
    dispatch(fetchDoctorByIdSuccess(response.data));
};

export const fetchDoctorsBySpeciality = (speciality) => async (dispatch) => {
    dispatch(fetchDoctorsStart());
    const response = await doctorService.getDoctorsBySpeciality(speciality);
    dispatch(fetchDoctorsBySpecialitySuccess(response.data));
};

export const fetchTopRated = () => async (dispatch) => {
    dispatch(fetchDoctorsStart());
    const response = await doctorService.getTopRatedDoctors();
    dispatch(fetchTopRatedDoctorsSuccess(response.data));
};

export const updateDoctorSchedule = (scheduleData) => async () => {
    const response = await doctorService.setDoctorSchedule(scheduleData);
    return response;
};

export default doctorSlice.reducer;
