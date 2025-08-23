// features/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [], // each: { id, title, price, image, persons, quantity }
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const incoming = action.payload;
            const { id, persons = 1 } = incoming;

            const existing = state.items.find((i) => i.id === id);
            if (existing) {
                // 🔁 Merge: increase persons count only
                existing.persons = (existing.persons || 1) + persons;
                // keep quantity as-is unless you want to change it explicitly
            } else {
                state.items.push({
                    ...incoming,
                    persons: persons || 1,
                    quantity: incoming.quantity ?? 1, // keep quantity concept if you use it elsewhere
                });
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find((i) => i.id === id);
            if (item && quantity > 0) item.quantity = quantity;
        },
        updatePersons: (state, action) => {
            const { id, persons } = action.payload;
            const item = state.items.find((i) => i.id === id);
            if (item && persons > 0) item.persons = persons;
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    updatePersons,
    clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
