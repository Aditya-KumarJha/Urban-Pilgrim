// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionOneSlice = createSlice({
    name: "sectionOne",
    initialState: {
        title: "",
        description: "",
        image: null,
        loading: false
    },
    reducers: {
        setSectionOne: (state, action) => {
            state.title = action.payload.title;
            state.description = action.payload.description;
            state.image = action.payload.image;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionOne, setLoading } = sectionOneSlice.actions;
export default sectionOneSlice.reducer;
