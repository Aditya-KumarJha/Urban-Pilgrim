// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sectionThreeSlice = createSlice({
    name: "sectionThree",
    initialState: {
        title: "",
        image: "",
        loading: false
    },
    reducers: {
        setSectionThree: (state, action) => {
            state.title = action.payload.title;
            state.image = action.payload.image;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setSectionThree, setLoading } = sectionThreeSlice.actions;
export default sectionThreeSlice.reducer;
