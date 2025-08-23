import { createSlice } from "@reduxjs/toolkit";

const userProgramsSlice = createSlice({
    name: "userPrograms",
    initialState: [],
    reducers: {
        setUserPrograms: (state, action) => {
            return action.payload; // replace with fresh list (e.g. from Firestore)
        },
        addUserProgram: (state, action) => {
            state.push(action.payload); // add a new purchased program
        },
        clearUserPrograms: () => {
            return []; // on logout
        },
    },
});

export const { setUserPrograms, addUserProgram, clearUserPrograms } =
    userProgramsSlice.actions;
export default userProgramsSlice.reducer;
