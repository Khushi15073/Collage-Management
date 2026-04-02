import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

export type Permission = {
  _id: string;
  name: string;
  label: string;
  section: string;
  description?: string;
};

interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  loading: false,
  error: null,
};

function normalizePermission(permission: any): Permission {
  return {
    _id: permission._id,
    name: permission.name,
    label: permission.label || permission.name,
    section: permission.section || "Custom",
    description: permission.description,
  };
}

async function getPermissions() {
  const response = await axios.get(`${BASE_URL}/api/permission`, {
    withCredentials: true,
  });

  const permissions = response.data?.data || response.data || [];
  return permissions.map(normalizePermission);
}

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getPermissions();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : (error.response?.data?.message || "Failed to fetch permissions")
      );
    }
  }
);

export const syncDefaultPermissions = createAsyncThunk(
  "permissions/syncDefaults",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/permission/sync-defaults`,
        {},
        { withCredentials: true }
      );

      const permissions = response.data?.data || response.data || [];
      return permissions.map(normalizePermission);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to sync permissions"
      );
    }
  }
);

export const createPermission = createAsyncThunk(
  "permissions/create",
  async (
    data: {
      name: string;
      description?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await axios.post(`${BASE_URL}/api/permission`, data, {
        withCredentials: true,
      });

      return await getPermissions();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create permission"
      );
    }
  }
);

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPermissions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
      state.loading = false;
      state.permissions = action.payload;
    });
    builder.addCase(fetchPermissions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(syncDefaultPermissions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(syncDefaultPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
      state.loading = false;
      state.permissions = action.payload;
    });
    builder.addCase(syncDefaultPermissions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createPermission.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createPermission.fulfilled, (state, action: PayloadAction<Permission[]>) => {
      state.loading = false;
      state.permissions = action.payload;
    });
    builder.addCase(createPermission.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default permissionSlice.reducer;
