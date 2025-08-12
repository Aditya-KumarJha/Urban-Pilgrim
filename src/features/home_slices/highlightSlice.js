// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const highlightSlice = createSlice({
    name: "highlight",
    initialState: {
        data: [],
        loading: false
    },
    reducers: {
        setHighlight: (state, action) => {
            state.data = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setHighlight, setLoading } = highlightSlice.actions;
export default highlightSlice.reducer;
