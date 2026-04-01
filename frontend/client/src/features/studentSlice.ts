import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../app/store";

const BASE_URL = "http://localhost:8000";

type StudentRole = {
  _id: string;
  name: string;
};

export type Student = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  role?: StudentRole;
};

interface StudentState {
  students: Student[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  search: string;
}

type CreateStudentResult = {
  student: Student;
  emailSent: boolean;
  emailError: string | null;
};

const initialState: StudentState = {
  students: [],
  loading: false,
  error: null,
  currentPage: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  search: "",
};

function normalizeStudent(student: any): Student {
  return {
    _id: student._id,
    name: student.name,
    email: student.email,
    phoneNumber: student.phoneNumber,
    gender: student.gender,
    role:
      student.role && typeof student.role === "object"
        ? { _id: student.role._id, name: student.role.name }
        : undefined,
  };
}

type FetchStudentsArgs = {
  page?: number;
  limit?: number;
  search?: string;
};

type FetchStudentsResult = {
  students: Student[];
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  search: string;
};

export const fetchStudents = createAsyncThunk<
  FetchStudentsResult,
  FetchStudentsArgs | undefined,
  { state: RootState; rejectValue: string }
>(
  "students/fetchAll",
  async (args, { rejectWithValue, getState }) => {
    try {
      const state = getState().students;
      const page = args?.page ?? state.currentPage;
      const limit = args?.limit ?? state.limit;
      const search = args?.search ?? state.search;

      const response = await axios.get(BASE_URL + "/api/user", {
        params: {
          role: "student",
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
        students: users.map(normalizeStudent),
        currentPage: pagination.page ?? page,
        limit: pagination.limit ?? limit,
        totalItems: pagination.totalItems ?? users.length,
        totalPages: pagination.totalPages ?? 0,
        search,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 401 ? "Session expired. Please log in again." : (error.response?.data?.message || "Failed to fetch students")
      );
    }
  }
);

export const createStudent = createAsyncThunk(
  "students/create",
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
        student: normalizeStudent(response.data?.data?.user || response.data?.data || response.data),
        emailSent: Boolean(response.data?.data?.emailSent),
        emailError: response.data?.data?.emailError || null,
      } as CreateStudentResult;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create student"
      );
    }
  }
);

export const updateStudent = createAsyncThunk(
  "students/update",
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
      return normalizeStudent(response.data?.data || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update student"
      );
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(BASE_URL + "/api/user/" + id, {
        withCredentials: true,
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete student"
      );
    }
  }
);

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    clearStudentError(state) {
      state.error = null;
    },
    setStudentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setStudentLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStudents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStudents.fulfilled, (state, action: PayloadAction<FetchStudentsResult>) => {
      state.loading = false;
      state.students = action.payload.students;
      state.currentPage = action.payload.currentPage;
      state.limit = action.payload.limit;
      state.totalItems = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
      state.search = action.payload.search;
    });
    builder.addCase(fetchStudents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createStudent.fulfilled, (state, action: PayloadAction<CreateStudentResult>) => {
      state.loading = false;
      state.students.push(action.payload.student);
    });
    builder.addCase(createStudent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateStudent.fulfilled, (state, action: PayloadAction<Student>) => {
      state.loading = false;
      state.students = state.students.map((s) =>
        s._id === action.payload._id ? action.payload : s
      );
    });
    builder.addCase(updateStudent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteStudent.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.students = state.students.filter((s) => s._id !== action.payload);
    });
    builder.addCase(deleteStudent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearStudentError, setStudentPage, setStudentLimit } = studentSlice.actions;
export default studentSlice.reducer;
