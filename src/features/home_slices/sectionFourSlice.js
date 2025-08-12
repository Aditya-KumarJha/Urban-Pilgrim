// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionFourSlice = createSlice({
    name: "sectionFour",
    initialState: {
        features: [],
        image: null,
        loading: false
    },
    reducers: {
        setSectionFour: (state, action) => {
            state.features = action.payload.features;
            state.image = action.payload.image;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionFour, setLoading } = sectionFourSlice.actions;
export default sectionFourSlice.reducer;
