import axios from 'axios';

const API_URL = 'https://api.turkiyeapi.dev/api/v1';

const locationService = {
    // Tüm illeri getirir
    getAllProvinces: async () => {
        const response = await axios.get(`${API_URL}/provinces?limit=81&fields=id,name`);
        return response.data;
    },

    // Seçilen ilin detaylarını (ilçelerini) getirir
    getProvinceDetails: async (provinceId) => {
        const response = await axios.get(`${API_URL}/provinces/${provinceId}`);
        return response.data;
    },

    // Seçilen ilçenin mahallelerini getirir
    // Not: TurkiyeAPI'de genellikle neighborhoods endpointi districtId ile filtrelemeyi destekler
    getNeighborhoodsByDistrict: async (districtId) => {
        const response = await axios.get(`${API_URL}/neighborhoods?districtId=${districtId}&limit=1000&fields=id,name`);
        return response.data;
    }
};

export default locationService;