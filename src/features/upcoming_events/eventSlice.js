import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    events: {},
    loading: false,
    error: null
};

const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        setEvents: (state, action) => {
            state.events = action.payload;
            state.loading = false;
            state.error = null;
        },
        setEvent: (state, action) => {
            const { id, data } = action.payload;
            if (id && data) {
                state.events[id] = data;
            }
        },
        removeEvent: (state, action) => {
            const eventId = action.payload;
            if (eventId && state.events[eventId]) {
                delete state.events[eventId];
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearEvents: (state) => {
            state.events = {};
            state.loading = false;
            state.error = null;
        }
    }
});

export const { 
    setEvents, 
    setEvent, 
    removeEvent, 
    setLoading, 
    setError, 
    clearError,
    clearEvents
} = eventSlice.actions;

export default eventSlice.reducer;
