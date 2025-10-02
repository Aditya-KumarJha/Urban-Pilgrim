import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    organizer: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const organizerAuthSlice = createSlice({
    name: 'organizerAuth',
    initialState,
    reducers: {
        setOrganizer: (state, action) => {
            state.organizer = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        clearOrganizer: (state) => {
            state.organizer = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        setOrganizerLoading: (state, action) => {
            state.loading = action.payload;
        },
        setOrganizerError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setOrganizer, clearOrganizer, setOrganizerLoading, setOrganizerError } = organizerAuthSlice.actions;
export default organizerAuthSlice.reducer;
