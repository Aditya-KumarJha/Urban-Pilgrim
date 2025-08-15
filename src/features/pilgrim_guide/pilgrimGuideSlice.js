import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    guides: [], // array of all guides
};

const guideSlice = createSlice({
    name: "guide",
    initialState,
    reducers: {
        setGuides: (state, action) => {
            state.guides = action.payload;
        },

        addGuide: (state, action) => {
            state.guides.push(action.payload);
        },
    }
});

export const { setGuides, addGuide } = guideSlice.actions;
export default guideSlice.reducer;
