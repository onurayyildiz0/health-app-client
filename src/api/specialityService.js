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
    return response.data; // response.data şuna döner: { statusCode: 200, data: [...] }
};

/**
 * ID'YE GÖRE UZMANLIK GETİR
 * Backend Endpoint: GET /api/specialities/:id
 */
export const getSpecialityById = async (id) => {
    const response = await axiosInstance.get(`/specialities/${id}`);
    return response.data;
};

/**
 * YENİ UZMANLIK EKLE (ADMIN)
 * Backend Endpoint: POST /api/specialities
 */
export const addSpeciality = async (data) => {
    const response = await axiosInstance.post('/specialities', data);
    return response.data;
};

/**
 * UZMANLIK GÜNCELLE (ADMIN)
 * Backend Endpoint: PUT /api/specialities/:id
 */
export const updateSpeciality = async (id, data) => {
    const response = await axiosInstance.put(`/specialities/${id}`, data);
    return response.data;
};

/**
 * UZMANLIK SİL (ADMIN)
 * Backend Endpoint: DELETE /api/specialities/:id
 */
export const deleteSpeciality = async (id) => {
    const response = await axiosInstance.delete(`/specialities/${id}`);
    return response.data;
};

export default {
    getAllSpecialities,
    getSpecialityById,
    addSpeciality,
    updateSpeciality,
    deleteSpeciality
};