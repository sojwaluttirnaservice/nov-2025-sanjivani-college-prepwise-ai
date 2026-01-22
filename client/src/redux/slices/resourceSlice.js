import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { resourceService } from "../../services/resourceService";

// Async thunk to fetch branches
export const fetchBranches = createAsyncThunk(
  "resource/fetchBranches",
  async (_, { rejectWithValue }) => {
    try {
      return await resourceService.getBranches();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch branches",
      );
    }
  },
);

const initialState = {
  branches: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default resourceSlice.reducer;
