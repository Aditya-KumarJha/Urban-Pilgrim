import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    workshops: [], // array of all workshops
    loading: false,
    error: null,
    currentWorkshop: null,
    uploadProgress: {
        thumbnail: 0,
        images: {},
        videos: {},
        guide: 0
    },
    uploading: {
        thumbnail: false,
        images: {},
        videos: {},
        guide: false
    },
    saving: false
};

const workshopsSlice = createSlice({
    name: "workshops",
    initialState,
    reducers: {
        // Workshop CRUD operations
        setWorkshops: (state, action) => {
            state.workshops = action.payload;
            state.loading = false;
            state.error = null;
        },

        addWorkshop: (state, action) => {
            state.workshops.push(action.payload);
        },

        updateWorkshop: (state, action) => {
            const index = state.workshops.findIndex(w => w.id === action.payload.id);
            if (index !== -1) {
                state.workshops[index] = action.payload;
            }
        },

        deleteWorkshop: (state, action) => {
            state.workshops = state.workshops.filter(w => w.id !== action.payload);
        },

        // Current workshop management
        setCurrentWorkshop: (state, action) => {
            state.currentWorkshop = action.payload;
        },

        clearCurrentWorkshop: (state) => {
            state.currentWorkshop = null;
        },

        // Loading states
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setSaving: (state, action) => {
            state.saving = action.payload;
        },

        // Error handling
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },

        clearError: (state) => {
            state.error = null;
        },

        // Upload progress management
        setThumbnailUploadProgress: (state, action) => {
            state.uploadProgress.thumbnail = action.payload;
        },

        setThumbnailUploading: (state, action) => {
            state.uploading.thumbnail = action.payload;
        },

        setImageUploadProgress: (state, action) => {
            const { uploadId, progress } = action.payload;
            state.uploadProgress.images[uploadId] = progress;
        },

        setImageUploading: (state, action) => {
            const { uploadId, status } = action.payload;
            if (status) {
                state.uploading.images[uploadId] = true;
            } else {
                delete state.uploading.images[uploadId];
                delete state.uploadProgress.images[uploadId];
            }
        },

        setVideoUploadProgress: (state, action) => {
            const { uploadId, progress } = action.payload;
            state.uploadProgress.videos[uploadId] = progress;
        },

        setVideoUploading: (state, action) => {
            const { uploadId, status } = action.payload;
            if (status) {
                state.uploading.videos[uploadId] = true;
            } else {
                delete state.uploading.videos[uploadId];
                delete state.uploadProgress.videos[uploadId];
            }
        },

        setGuideUploadProgress: (state, action) => {
            state.uploadProgress.guide = action.payload;
        },

        setGuideUploading: (state, action) => {
            state.uploading.guide = action.payload;
        },

        // Clear all upload states
        clearUploadStates: (state) => {
            state.uploadProgress = {
                thumbnail: 0,
                images: {},
                videos: {},
                guide: 0
            };
            state.uploading = {
                thumbnail: false,
                images: {},
                videos: {},
                guide: false
            };
        }
    }
});

export const {
    setWorkshops,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
    setCurrentWorkshop,
    clearCurrentWorkshop,
    setLoading,
    setSaving,
    setError,
    clearError,
    setThumbnailUploadProgress,
    setThumbnailUploading,
    setImageUploadProgress,
    setImageUploading,
    setVideoUploadProgress,
    setVideoUploading,
    setGuideUploadProgress,
    setGuideUploading,
    clearUploadStates
} = workshopsSlice.actions;

export default workshopsSlice.reducer;
