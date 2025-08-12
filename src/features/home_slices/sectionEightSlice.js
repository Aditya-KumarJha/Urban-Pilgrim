// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionEightSlice = createSlice({
    name: "sectionEight",
    initialState: {
        title: "",
        description: "",
        loading: false
    },
    reducers: {
        setSectionEight: (state, action) => {
            state.title = action.payload.title;
            state.description = action.payload.description;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionEight, setLoading } = sectionEightSlice.actions;
export default sectionEightSlice.reducer;
