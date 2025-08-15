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

        addLiveSession: (state, action) => {
            state.LiveSession.push(action.payload);
        },
    }
});

export const { setLiveSessions, addLiveSession } = liveSessionSlice.actions;
export default liveSessionSlice.reducer;
