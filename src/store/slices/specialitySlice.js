import { createSlice } from '@reduxjs/toolkit';
import * as specialityService from '../../api/specialityService';

const initialState = {
    specialities: [],
    loading: false,
    error: null
};

const specialitySlice = createSlice({
    name: 'speciality',
    initialState,
    reducers: {
        actionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        actionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchSpecialitiesSuccess: (state, action) => {
            state.loading = false;
            state.specialities = action.payload.data || action.payload || [];
        },
        addSpecialitySuccess: (state, action) => {
            state.loading = false;
            state.specialities.push(action.payload);
        },
        updateSpecialitySuccess: (state, action) => {
            state.loading = false;
            const index = state.specialities.findIndex(s => s.id === action.payload.id);
            if (index !== -1) state.specialities[index] = action.payload;
        },
        deleteSpecialitySuccess: (state, action) => {
            state.loading = false;
            state.specialities = state.specialities.filter(s => s.id !== action.payload);
        },
        resetSpecialityState: (state) => {
             state.specialities = [];
             state.loading = false;
             state.error = null;
        }
    }
});

export const {
    actionStart,
    actionFailure,
    fetchSpecialitiesSuccess,
    addSpecialitySuccess,
    updateSpecialitySuccess,
    deleteSpecialitySuccess,
    resetSpecialityState
} = specialitySlice.actions;

// Selectors
export const selectAllSpecialities = (state) => state.speciality.specialities;
export const selectSpecialityLoading = (state) => state.speciality.loading;

// Thunks
export const fetchAllSpecialities = () => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await specialityService.getAllSpecialities();
        dispatch(fetchSpecialitiesSuccess(response));
    } catch (error) {
        dispatch(actionFailure(error.message));
    }
};

export const createSpeciality = (data) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await specialityService.addSpeciality(data);
        dispatch(addSpecialitySuccess(response.data || response));
    } catch (error) {
        dispatch(actionFailure(error.message));
        throw error;
    }
};

export const editSpeciality = (id, data) => async (dispatch) => {
    try {
        dispatch(actionStart());
        const response = await specialityService.updateSpeciality(id, data);
        dispatch(updateSpecialitySuccess(response.data || response));
    } catch (error) {
        dispatch(actionFailure(error.message));
        throw error;
    }
};

export const removeSpeciality = (id) => async (dispatch) => {
    try {
        dispatch(actionStart());
        await specialityService.deleteSpeciality(id);
        dispatch(deleteSpecialitySuccess(id));
    } catch (error) {
        dispatch(actionFailure(error.message));
        throw error;
    }
};

export default specialitySlice.reducer;