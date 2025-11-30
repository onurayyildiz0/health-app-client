import { createSlice } from '@reduxjs/toolkit';
import * as reviewService from '../../api/reviewService';

/**
 * REVIEW SLICE
 * 
 * Değerlendirme/Yorum işlemleri için state yönetimi
 * 
 * State içeriği:
 * - reviews: Değerlendirme listesi
 * - loading: Yüklenme durumu
 * - error: Hata mesajı
 */

const initialState = {
    // Değerlendirme listesi
    reviews: [],

    // Yüklenme durumu
    loading: false,

    // Hata mesajı
    error: null,

    // Başarı mesajı
    successMessage: null
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        // DEĞERLENDİRME YÜKLE - START
        fetchReviewsStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // DEĞERLENDİRME YÜKLE - SUCCESS
        fetchReviewsSuccess: (state, action) => {
            state.loading = false;
            state.reviews = action.payload;
            state.error = null;
        },

        // DEĞERLENDİRME YÜKLE - FAILURE
        fetchReviewsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // YENİ DEĞERLENDİRME EKLE - START
        addReviewStart: (state) => {
            state.loading = true;
            state.error = null;
            state.successMessage = null;
        },

        // YENİ DEĞERLENDİRME EKLE - SUCCESS
        addReviewSuccess: (state, action) => {
            state.loading = false;
            state.reviews.unshift(action.payload); // En başa ekle
            state.successMessage = 'Değerlendirmeniz başarıyla eklendi!';
            state.error = null;
        },

        // YENİ DEĞERLENDİRME EKLE - FAILURE
        addReviewFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.successMessage = null;
        },

        // DEĞERLENDİRME GÜNCELLE - SUCCESS
        updateReviewSuccess: (state, action) => {
            state.loading = false;
            const index = state.reviews.findIndex(r => r._id === action.payload._id);
            if (index !== -1) {
                state.reviews[index] = action.payload;
            }
            state.successMessage = 'Değerlendirmeniz güncellendi!';
        },

        // DEĞERLENDİRME SİL - START
        deleteReviewStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // DEĞERLENDİRME SİL - SUCCESS
        deleteReviewSuccess: (state, action) => {
            state.loading = false;
            state.reviews = state.reviews.filter(r => r._id !== action.payload);
            state.successMessage = 'Değerlendirmeniz silindi!';
        },

        // DEĞERLENDİRME SİL - FAILURE
        deleteReviewFailure: (state, action) => {
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
    fetchReviewsStart,
    fetchReviewsSuccess,
    fetchReviewsFailure,
    addReviewStart,
    addReviewSuccess,
    addReviewFailure,
    updateReviewSuccess,
    deleteReviewStart,
    deleteReviewSuccess,
    deleteReviewFailure,
    clearMessages
} = reviewSlice.actions;

// Selectors
export const selectAllReviews = (state) => state.review.reviews;
export const selectReviewLoading = (state) => state.review.loading;
export const selectReviewError = (state) => state.review.error;
export const selectReviewSuccessMessage = (state) => state.review.successMessage;

// Thunk Actions
export const fetchDoctorReviews = (doctorId) => async (dispatch) => {
    dispatch(fetchReviewsStart());
    const response = await reviewService.getReviewsByDoctor(doctorId);
    dispatch(fetchReviewsSuccess(response.data));
};

export const submitReview = (reviewData) => async (dispatch) => {
    dispatch(addReviewStart());
    const response = await reviewService.addReview(reviewData);
    dispatch(addReviewSuccess(response.data));
    return response;
};

export const removeReview = (reviewId) => async (dispatch) => {
    dispatch(deleteReviewStart());
    await reviewService.deleteReview(reviewId);
    dispatch(deleteReviewSuccess(reviewId));
};

export default reviewSlice.reducer;
