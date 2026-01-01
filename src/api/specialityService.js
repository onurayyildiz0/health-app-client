import axiosInstance from './axios';

/**
 * SPECIALITY SERVICE
 * Uzmanlık alanları (Branşlar) için API fonksiyonları
 * Backend Endpoint: /api/specialities
 */

/**
 * TÜM UZMANLIK ALANLARINI GETİR
 * Backend Endpoint: GET /api/specialities
 */
export const getAllSpecialities = async () => {
    const response = await axiosInstance.get('/specialities');
    return response.data;
};

/**
 * ID'YE GÖRE UZMANLIK GETİR
 * Backend Endpoint: GET /api/specialities/:id
 */
export const getSpecialityById = async (id) => {
    const response = await axiosInstance.get(`/specialities/${id}`);
    return response.data;
};

export default {
    getAllSpecialities,
    getSpecialityById
};