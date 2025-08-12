// src/redux/slidesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const testimonialsSlice = createSlice({
    name: "testimonials",
    initialState: {
        data: [],
        loading: false,
    },
    reducers: {
        setTestimonials: (state, action) => {
            state.data = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setTestimonials, setLoading } = testimonialsSlice.actions;
export default testimonialsSlice.reducer;
