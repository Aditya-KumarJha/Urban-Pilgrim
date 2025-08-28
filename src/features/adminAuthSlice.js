import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    admin: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        setAdmin: (state, action) => {
            state.admin = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        clearAdmin: (state) => {
            state.admin = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { setAdmin, clearAdmin, setLoading, setError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
