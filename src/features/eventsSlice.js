import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allEvents: {},
    loading: false,
    error: null
};

const allEventsSlice = createSlice({
    name: 'allEvents',
    initialState,
    reducers: {
        setAllEvents: (state, action) => {
            state.allEvents = action.payload;
            state.loading = false;
            state.error = null;
        },
        setEvent: (state, action) => {
            const { id, data } = action.payload;
            if (id && data) {
                state.allEvents[id] = data;
            }
        },
        removeEvent: (state, action) => {
            const eventId = action.payload;
            if (eventId && state.allEvents[eventId]) {
                delete state.allEvents[eventId];
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
        clearAllEvents: (state) => {
            state.allEvents = {};
            state.loading = false;
            state.error = null;
        }
    }
});

export const { 
    setAllEvents, 
    setEvent, 
    removeEvent, 
    setLoading, 
    setError, 
    clearError,
    clearAllEvents
} = allEventsSlice.actions;

export default allEventsSlice.reducer;
