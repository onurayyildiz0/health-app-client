import axiosInstance from './axios';

/**
 * REVIEW SERVICE
 * * Değerlendirme/Yorum işlemleri için API fonksiyonları
 * Backend'deki /api/reviews endpoint'lerine karşılık gelir
 */

/**
 * YENİ DEĞERLENDİRME EKLE (Patient)
 * * Backend Endpoint: POST /api/reviews
 * * Data:
 * {
 * doctorId: 1,          // C# int bekler
 * rating: 5,            // 1-5 arası puan
 * comment: "Çok iyi"    // Yorum (opsiyonel)
 * }
 */
export const addReview = async (reviewData) => {
    const response = await axiosInstance.post('/reviews', reviewData);
    return response.data;
};

/**
 * DOKTORUN DEĞERLENDİRMELERİNİ GETİR
 * * Backend Endpoint: GET /api/reviews/:doctorId
 */
export const getReviewsByDoctor = async (doctorId) => {
    const response = await axiosInstance.get(`/reviews/${doctorId}`);
    return response.data;
};

/**
 * DEĞERLENDİRME SİL (Patient veya Admin)
 * * Backend Endpoint: DELETE /api/reviews/:id
 * * Not: Sadece kendi yorumunu silebilir veya Admin silebilir
 */
export const deleteReview = async (reviewId) => {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
};

/**
 * DEĞERLENDİRME GÜNCELLE (Patient)
 * * Backend Endpoint: PUT /api/reviews/:id
 * * Data:
 * {
 * rating: 4,
 * comment: "Güncellenen yorum"
 * }
 */
export const updateReview = async (reviewId, updateData) => {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, updateData);
    return response.data;
};

export default {
    addReview,
    getReviewsByDoctor,
    deleteReview,
    updateReview
};