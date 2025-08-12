// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionFiveSlice = createSlice({
    name: "sectionFive",
    initialState: {
        title: "",
        description: "",
        loading: false
    },
    reducers: {
        setSectionFive: (state, action) => {
            state.title = action.payload.title;
            state.description = action.payload.description;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionFive, setLoading } = sectionFiveSlice.actions;
export default sectionFiveSlice.reducer;
