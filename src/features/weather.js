import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const clothingSlice = createSlice({
    name: "clothing",
    initialState: {
        items: [],
        status: "idle",
        error: null,
    },
    reducers: {
        clearClothing: (state) => {
            state.items = [];
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClothing.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchClothing.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchClothing.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearClothing } = clothingSlice.actions;
export default clothingSlice.reducer;
