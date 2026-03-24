import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

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
}

const initialState: StudentState = {
  students: [],
  loading: false,
  error: null,
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

function isStudentRecord(student: any) {
  const roleName = typeof student.role === "string" ? student.role : student.role?.name;
  return roleName === "student";
}

export const fetchStudents = createAsyncThunk(
  "students/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/user", {
        withCredentials: true,
      });

      const users = response.data?.data || response.data || [];
      return users.filter(isStudentRecord).map(normalizeStudent);
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
      return normalizeStudent(response.data?.data?.user || response.data?.data || response.data);
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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStudents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
      state.loading = false;
      state.students = action.payload;
    });
    builder.addCase(fetchStudents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createStudent.fulfilled, (state, action: PayloadAction<Student>) => {
      state.loading = false;
      state.students.push(action.payload);
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

export const { clearStudentError } = studentSlice.actions;
export default studentSlice.reducer;
