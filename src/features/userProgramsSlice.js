import { createSlice } from "@reduxjs/toolkit";
import { filterExpiredSubscriptions } from "../utils/subscriptionUtils";

const userProgramsSlice = createSlice({
    name: "userPrograms",
    initialState: [],
    reducers: {
        setUserPrograms: (state, action) => {
            // Filter out expired subscriptions when setting programs
            return filterExpiredSubscriptions(action.payload);
        },
        addUserProgram: (state, action) => {
            state.push(action.payload); // add a new purchased program
        },
        addUserPrograms: (state, action) => {
            // Add multiple programs (useful for bundle purchases)
            state.push(...action.payload);
        },
        removeExpiredSubscriptions: (state) => {
            // Remove expired subscriptions from current state
            return filterExpiredSubscriptions(state);
        },
        updateProgramExpiration: (state, action) => {
            // Update expiration status for a specific program
            const { programId, isExpired } = action.payload;
            const program = state.find(p => p.id === programId);
            if (program) {
                program.isExpired = isExpired;
            }
        },
        clearUserPrograms: () => {
            return []; // on logout
        },
    },
});

export const { 
    setUserPrograms, 
    addUserProgram, 
    addUserPrograms,
    removeExpiredSubscriptions,
    updateProgramExpiration,
    clearUserPrograms 
} = userProgramsSlice.actions;
export default userProgramsSlice.reducer;
