// src/features/retreatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pilgrimRetreatCards: [], // changed to array to store multiple cards
    monthlySubscription: {
        price: "",
        discount: "",
        description: "",
    },
    oneTimePurchase: {
        price: "",
        images: [],
        videos: [],
    },
    session: {
        description: "",
        dateOptions: [{ start: "", end: "" }],
        occupancies: ["Single"],
        showOccupancyInRetreat: false,
    },
    features: [],
    location: "",
    programSchedule: [], // objects: { title, description, points: [] }
    retreatDescription: [],
    faqs: [],
    meetGuide: {
        title: "",
        description: "",
        image: null,
    },
    loading: false,
};

const retreatSlice = createSlice({
    name: "retreat",
    initialState,
    reducers: {
        setRetreatData: (state, action) => {
            return { ...state, ...action.payload };
        },
        updateField: (state, action) => {
            const { section, field, value } = action.payload;
            state[section][field] = value;
        },
        updateArrayItem: (state, action) => {
            const { arrayName, index, item } = action.payload;
            if (index !== null && index >= 0) {
                state[arrayName][index] = item; // update existing
            } else {
                state[arrayName].push(item); // add new
            }
        },
        resetRetreat: () => initialState,
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setRetreatData,
    updateField,
    updateArrayItem,
    resetRetreat,
    setLoading,
} = retreatSlice.actions;

export default retreatSlice.reducer;
