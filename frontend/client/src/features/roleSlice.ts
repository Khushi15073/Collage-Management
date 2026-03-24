import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

// ✅ TypeScript: shape of a Role from your RoleModel
export type Role = {
  _id: string;
  name: "admin" | "faculty" | "student";
  description?: string;
};

interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
};

// ─────────────────────────────────────────
// ✅ Fetch all roles — GET /api/role
// ─────────────────────────────────────────
export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/role`, {
        withCredentials: true,
      });
      // adjust if your ResponseHandler wraps differently
      return response.data?.data || response.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 401 ? "Session expired. Please log in again." : (error.response?.data?.message || "Failed to fetch roles")
      );
    }
  }
);

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRoles.pending, (state) => {
      state.loading = true;
      state.error   = null;
    });
    builder.addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
      state.loading = false;
      state.roles   = action.payload; // ✅ persists in Redux
    });
    builder.addCase(fetchRoles.rejected, (state, action) => {
      state.loading = false;
      state.error   = action.payload as string;
    });
  },
});

export default roleSlice.reducer;