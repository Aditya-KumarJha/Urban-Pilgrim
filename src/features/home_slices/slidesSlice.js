// src/redux/slidesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const slidesSlice = createSlice({
    name: "slides",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        setSlides: (state, action) => {
            state.data = action.payload;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setSlides, setLoading, setError } = slidesSlice.actions;
export default slidesSlice.reducer;
