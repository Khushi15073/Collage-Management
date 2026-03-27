import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

type FacultyRole = {
  _id: string;
  name: string;
};

export type Faculty = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  role?: FacultyRole;
};

interface FacultyState {
  faculty: Faculty[];
  loading: boolean;
  error: string | null;
}

type CreateFacultyResult = {
  faculty: Faculty;
  emailSent: boolean;
  emailError: string | null;
};

const initialState: FacultyState = {
  faculty: [],
  loading: false,
  error: null,
};

function normalizeFaculty(user: any): Faculty {
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

export const fetchFaculty = createAsyncThunk(
  "faculty/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/user?role=faculty", {
        withCredentials: true,
      });
      const users = response.data?.data || response.data || [];
      return users.map(normalizeFaculty);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : (error.response?.data?.message || "Failed to fetch faculty")
      );
    }
  }
);

export const createFaculty = createAsyncThunk(
  "faculty/create",
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
        faculty: normalizeFaculty(response.data?.data?.user || response.data?.data || response.data),
        emailSent: Boolean(response.data?.data?.emailSent),
        emailError: response.data?.data?.emailError || null,
      } as CreateFacultyResult;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create faculty"
      );
    }
  }
);

export const updateFaculty = createAsyncThunk(
  "faculty/update",
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
      if (updateData.password == null || updateData.password === "") {
        delete updateData.password;
      }

      const response = await axios.put(BASE_URL + "/api/user/" + id, updateData, {
        withCredentials: true,
      });
      return normalizeFaculty(response.data?.data || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update faculty"
      );
    }
  }
);

export const deleteFaculty = createAsyncThunk(
  "faculty/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(BASE_URL + "/api/user/" + id, {
        withCredentials: true,
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete faculty"
      );
    }
  }
);

const facultySlice = createSlice({
  name: "faculty",
  initialState,
  reducers: {
    clearFacultyError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFaculty.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFaculty.fulfilled, (state, action: PayloadAction<Faculty[]>) => {
      state.loading = false;
      state.faculty = action.payload;
    });
    builder.addCase(fetchFaculty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createFaculty.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createFaculty.fulfilled, (state, action: PayloadAction<CreateFacultyResult>) => {
      state.loading = false;
      state.faculty.push(action.payload.faculty);
    });
    builder.addCase(createFaculty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateFaculty.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateFaculty.fulfilled, (state, action: PayloadAction<Faculty>) => {
      state.loading = false;
      state.faculty = state.faculty.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
    });
    builder.addCase(updateFaculty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteFaculty.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteFaculty.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.faculty = state.faculty.filter((item) => item._id !== action.payload);
    });
    builder.addCase(deleteFaculty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFacultyError } = facultySlice.actions;
export default facultySlice.reducer;
