import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bundles: [],
    loading: false,
    error: null,
    selectedPrograms: [],
    bundleForm: {
        name: "",
        description: "",
        variant1: {
            name: "3 Programs Bundle",
            price: "",
            programs: [],
            maxPrograms: 3
        },
        variant2: {
            name: "5 Programs Bundle",
            price: "",
            programs: [],
            maxPrograms: 5
        },
        discount: "",
        totalPrice: "",
        isActive: true
    }
};

const bundleSlice = createSlice({
    name: "bundles",
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setBundles: (state, action) => {
            state.bundles = action.payload;
        },
        addBundle: (state, action) => {
            state.bundles.push(action.payload);
        },
        updateBundle: (state, action) => {
            const { id, bundleData } = action.payload;
            const index = state.bundles.findIndex(bundle => bundle.id === id);
            if (index !== -1) {
                state.bundles[index] = { ...state.bundles[index], ...bundleData };
            }
        },
        deleteBundle: (state, action) => {
            state.bundles = state.bundles.filter(bundle => bundle.id !== action.payload);
        },
        setSelectedPrograms: (state, action) => {
            state.selectedPrograms = action.payload;
        },
        addProgramToVariant: (state, action) => {
            const { variant, program } = action.payload;
            
            if (variant === 'variant1' && state.bundleForm.variant1.programs.length < 3) {
                state.bundleForm.variant1.programs.push(program);
            } else if (variant === 'variant2' && state.bundleForm.variant2.programs.length < 5) {
                state.bundleForm.variant2.programs.push(program);
            }
        },
        removeProgramFromVariant: (state, action) => {
            const { variant, programId } = action.payload;
            if (variant === 'variant1') {
                state.bundleForm.variant1.programs = state.bundleForm.variant1.programs.filter(p => p.id !== programId);
            } else if (variant === 'variant2') {
                state.bundleForm.variant2.programs = state.bundleForm.variant2.programs.filter(p => p.id !== programId);
            }
        },
        updateBundleForm: (state, action) => {
            const { field, value } = action.payload;
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                state.bundleForm[parent][child] = value;
            } else {
                state.bundleForm[field] = value;
            }
        },
        resetBundleForm: (state) => {
            state.bundleForm = initialState.bundleForm;
            state.selectedPrograms = [];
        },
        setEditingBundle: (state, action) => {
            if (action.payload) {
                state.bundleForm = { ...action.payload };
            } else {
                state.bundleForm = initialState.bundleForm;
            }
        }
    },
});

export const {
    setLoading,
    setError,
    setBundles,
    addBundle,
    updateBundle,
    deleteBundle,
    setSelectedPrograms,
    addProgramToVariant,
    removeProgramFromVariant,
    updateBundleForm,
    resetBundleForm,
    setEditingBundle
} = bundleSlice.actions;

export default bundleSlice.reducer;
