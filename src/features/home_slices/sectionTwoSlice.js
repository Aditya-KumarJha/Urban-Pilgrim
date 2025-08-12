// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionTwoSlice = createSlice({
    name: "sectionTwo",
    initialState: {
        title: "",
        description: "",
        loading: false
    },
    reducers: {
        setSectionTwo: (state, action) => {
            state.title = action.payload.title;
            state.description = action.payload.description;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionTwo, setLoading } = sectionTwoSlice.actions;
export default sectionTwoSlice.reducer;
