import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    recordedSessions: [], // array of all recorded sessions
};

const recordedSessionSlice = createSlice({
    name: "recordedSession",
    initialState,
    reducers: {
        setRecordedSessions: (state, action) => {
            state.recordedSessions = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setRecordedSessions, setLoading } = recordedSessionSlice.actions;
export default recordedSessionSlice.reducer;
