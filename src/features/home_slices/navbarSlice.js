import { createSlice } from "@reduxjs/toolkit";

const navbarSlice = createSlice({
    name: "navbar",
    initialState: {
        navbar: [],
        loading: false
    },
    reducers: {
        setNavbars: (state, action) => {
            state.navbar = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setNavbars, setLoading } = navbarSlice.actions;
export default navbarSlice.reducer;
