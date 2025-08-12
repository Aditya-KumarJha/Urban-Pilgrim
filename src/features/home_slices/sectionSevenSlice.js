// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionSevenSlice = createSlice({
    name: "sectionSeven",
    initialState: {
        title: "",
        description: "",
        loading: false
    },
    reducers: {
        setSectionSeven: (state, action) => {
            state.title = action.payload.title;
            state.description = action.payload.description;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionSeven, setLoading } = sectionSevenSlice.actions;
export default sectionSevenSlice.reducer;
