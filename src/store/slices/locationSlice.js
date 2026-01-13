import { createSlice } from '@reduxjs/toolkit';
import locationService from '../../api/locationService';

const initialState = {
    provinces: [],
    districts: [],
    neighborhoods: [],
    loading: false,
    error: null
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        resetLocationState: (state) => {
            state.provinces = [];
            state.districts = [];
            state.neighborhoods = [];
            state.loading = false;
            state.error = null;
        },
        locationActionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchProvincesSuccess: (state, action) => {
            state.loading = false;
            state.provinces = action.payload.data || action.payload || [];
        },
        fetchDistrictsSuccess: (state, action) => {
            state.loading = false;
            state.districts = action.payload.data?.districts || action.payload.districts || action.payload || [];
        },
        fetchNeighborhoodsSuccess: (state, action) => {
            state.loading = false;
            state.neighborhoods = action.payload.data || action.payload || [];
        },
        clearDistrictsAndNeighborhoods: (state) => {
            state.districts = [];
            state.neighborhoods = [];
        },
        clearNeighborhoods: (state) => {
            state.neighborhoods = [];
        },
        locationActionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {
    locationActionStart,
    fetchProvincesSuccess,
    fetchDistrictsSuccess,
    fetchNeighborhoodsSuccess,
    locationActionFailure,
    clearDistrictsAndNeighborhoods,
    clearNeighborhoods,
    resetLocationState
} = locationSlice.actions;

// Selectors
export const selectProvinces = (state) => state.location.provinces;
export const selectDistricts = (state) => state.location.districts;
export const selectNeighborhoods = (state) => state.location.neighborhoods;
export const selectLocationLoading = (state) => state.location.loading;

// Thunks
export const fetchProvinces = () => async (dispatch) => {
    try {
        dispatch(locationActionStart());
        const res = await locationService.getAllProvinces();
        dispatch(fetchProvincesSuccess(res));
    } catch (err) {
        dispatch(locationActionFailure(err.message));
    }
};

export const fetchDistricts = (provinceId) => async (dispatch) => {
    try {
        dispatch(clearDistrictsAndNeighborhoods());
        if (!provinceId) return;
        
        dispatch(locationActionStart());
        const res = await locationService.getProvinceDetails(provinceId);
        dispatch(fetchDistrictsSuccess(res));
    } catch (err) {
        dispatch(locationActionFailure(err.message));
    }
};

export const fetchNeighborhoods = (districtId) => async (dispatch) => {
    try {
        dispatch(clearNeighborhoods()); 
        if (!districtId) return;

        dispatch(locationActionStart());
        const res = await locationService.getNeighborhoodsByDistrict(districtId);
        dispatch(fetchNeighborhoodsSuccess(res));
    } catch (err) {
        dispatch(locationActionFailure(err.message));
    }
};

export default locationSlice.reducer;