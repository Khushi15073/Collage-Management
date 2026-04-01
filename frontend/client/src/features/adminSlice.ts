import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../app/store";

const BASE_URL = "http://localhost:8000";

type AdminRole = {
  _id: string;
  name: string;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  role?: AdminRole;
};

interface AdminState {
  admins: AdminUser[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  search: string;
}

type CreateAdminResult = {
  admin: AdminUser;
  emailSent: boolean;
  emailError: string | null;
};

const initialState: AdminState = {
  admins: [],
  loading: false,
  error: null,
  currentPage: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  search: "",
};

function normalizeAdmin(user: any): AdminUser {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    role:
      user.role && typeof user.role === "object"
        ? { _id: user.role._id, name: user.role.name }
        : undefined,
  };
}

type FetchAdminsArgs = {
  page?: number;
  limit?: number;
  search?: string;
};

type FetchAdminsResult = {
  admins: AdminUser[];
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  search: string;
};

export const fetchAdmins = createAsyncThunk<
  FetchAdminsResult,
  FetchAdminsArgs | undefined,
  { state: RootState; rejectValue: string }
>(
  "admins/fetchAll",
  async (args, { rejectWithValue, getState }) => {
    try {
      const state = getState().admins;
      const page = args?.page ?? state.currentPage;
      const limit = args?.limit ?? state.limit;
      const search = args?.search ?? state.search;

      const response = await axios.get(BASE_URL + "/api/user", {
        params: {
          role: "admin",
          page,
          limit,
          search: search.trim() || undefined,
        },
        withCredentials: true,
      });

      const payload = response.data?.data || {};
      const users = payload.items || [];
      const pagination = payload.pagination || {};

      return {
        admins: users.map(normalizeAdmin),
        currentPage: pagination.page ?? page,
        limit: pagination.limit ?? limit,
        totalItems: pagination.totalItems ?? users.length,
        totalPages: pagination.totalPages ?? 0,
        search,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : (error.response?.data?.message || "Failed to fetch admins")
      );
    }
  }
);

export const createAdmin = createAsyncThunk(
  "admins/create",
  async (
    data: {
      name: string;
      email: string;
      password: string;
      phoneNumber: string;
      gender: string;
      role: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(BASE_URL + "/api/user", data, {
        withCredentials: true,
      });
      return {
        admin: normalizeAdmin(response.data?.data?.user || response.data?.data || response.data),
        emailSent: Boolean(response.data?.data?.emailSent),
        emailError: response.data?.data?.emailError || null,
      } as CreateAdminResult;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create admin");
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admins/update",
  async (
    data: {
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      gender: string;
      role: string;
      password?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { id, ...updateData } = data;
      if (!updateData.password) delete updateData.password;

      const response = await axios.put(BASE_URL + "/api/user/" + id, updateData, {
        withCredentials: true,
      });
      return normalizeAdmin(response.data?.data || response.data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update admin");
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admins/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(BASE_URL + "/api/user/" + id, {
        withCredentials: true,
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete admin");
    }
  }
);

const adminSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
    setAdminPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setAdminLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdmins.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdmins.fulfilled, (state, action: PayloadAction<FetchAdminsResult>) => {
      state.loading = false;
      state.admins = action.payload.admins;
      state.currentPage = action.payload.currentPage;
      state.limit = action.payload.limit;
      state.totalItems = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
      state.search = action.payload.search;
    });
    builder.addCase(fetchAdmins.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createAdmin.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAdmin.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAdmin.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(deleteAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAdminError, setAdminPage, setAdminLimit } = adminSlice.actions;
export default adminSlice.reducer;
