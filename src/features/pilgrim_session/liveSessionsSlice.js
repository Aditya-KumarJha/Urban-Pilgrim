import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    LiveSession: [], // array of all live sessions
};

const liveSessionSlice = createSlice({
    name: "liveSession",
    initialState,
    reducers: {
        setLiveSessions: (state, action) => {
            state.LiveSession = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setLiveSessions, setLoading } = liveSessionSlice.actions;
export default liveSessionSlice.reducer;
