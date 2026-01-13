import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (search = '', { rejectWithValue }) => {
    try {
      const url = search ? `/gigs?search=${search}` : '/gigs';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gigs');
    }
  }
);

export const fetchGigById = createAsyncThunk(
  'gigs/fetchGigById',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/gigs/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gig');
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await api.post('/gigs', gigData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create gig');
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    currentGig: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addGig: (state, action) => {
      // Prepend a gig received from socket event
      state.gigs.unshift(action.payload);
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch gigs
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload.gigs;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch gig by ID
      .addCase(fetchGigById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGig = action.payload.gig;
      })
      .addCase(fetchGigById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create gig
      .addCase(createGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs.unshift(action.payload.gig);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentGig } = gigSlice.actions;
export const { addGig } = gigSlice.actions;
export default gigSlice.reducer;
