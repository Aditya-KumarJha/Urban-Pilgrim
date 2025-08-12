// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionSixSlice = createSlice({
    name: "sectionSix",
    initialState: {
        title: "",
        description: "",
        loading: false
    },
    reducers: {
        setSectionSix: (state, action) => {
            state.title = action.payload.title;
            state.description = action.payload.description;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionSix, setLoading } = sectionSixSlice.actions;
export default sectionSixSlice.reducer;
