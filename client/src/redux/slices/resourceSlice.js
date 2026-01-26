import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { resourceService } from "../../services/resourceService";
import { extractErrorMessage } from "../../utils/errorHandler";

// Async thunk to fetch branches
export const fetchBranches = createAsyncThunk(
  "resource/fetchBranches",
  async (_, { rejectWithValue }) => {
    try {
      return await resourceService.getBranches();
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch branches"),
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
        state.branches = action.payload.branches;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default resourceSlice.reducer;
