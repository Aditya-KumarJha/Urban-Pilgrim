// src/features/sectionOneSlice.js
import { createSlice } from "@reduxjs/toolkit";

const footerSlice = createSlice({
    name: "footer",
    initialState: {
        links: [],
        Heading: "",
        Description: "",
        loading: false
    },
    reducers: {
        setFooters: (state, action) => {
            state.links = action.payload.links;
            state.Heading = action.payload.Heading;
            state.Description = action.payload.Description;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setFooters, setLoading } = footerSlice.actions;
export default footerSlice.reducer;
