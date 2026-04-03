import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Student } from "./studentSlice";

const BASE_URL = "http://localhost:8000";

type CourseInstructor = {
  _id: string;
  name: string;
  email?: string;
};

export type Course = {
  _id: string;
  code: string;
  name: string;
  department: string;
  instructor: CourseInstructor | null;
  credits: number;
  students: Student[];
  enrolled: number;
  total: number;
  status: "Active" | "Inactive" | "Full";
};

type SaveCoursePayload = {
  code: string;
  name: string;
  department: string;
  instructor: string;
  students: string[];
  credits?: number;
  total: number;
  status: "Active" | "Inactive" | "Full";
};

interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
};

function normalizeCourse(course: any): Course {
  const instructorValue =
    course.instructor && typeof course.instructor === "object"
      ? {
          _id: course.instructor._id,
          name: course.instructor.name,
          email: course.instructor.email,
        }
      : null;

  return {
    _id: course._id,
    code: course.code ?? "",
    name: course.name ?? "",
    department: course.department ?? "",
    instructor: instructorValue,
    credits: Number(course.credits ?? 0),
    students: Array.isArray(course.students)
      ? course.students.map((student: any) => ({
          _id: student._id,
          name: student.name,
          email: student.email,
          phoneNumber: student.phoneNumber,
          gender: student.gender,
        }))
      : [],
    enrolled: Number(course.enrolled ?? 0),
    total: Number(course.total ?? 0),
    status: (course.status ?? "Active") as Course["status"],
  };
}

export const fetchCourses = createAsyncThunk(
  "courses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL + "/api/course", {
        withCredentials: true,
      });

      const courses = response.data?.data || response.data || [];
      return courses.map(normalizeCourse);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : (error.response?.data?.message || "Failed to fetch courses")
      );
    }
  }
);

export const createCourse = createAsyncThunk(
  "courses/create",
  async (data: SaveCoursePayload, { rejectWithValue }) => {
    try {
      await axios.post(BASE_URL + "/api/course", data, {
        withCredentials: true,
      });

      const refreshed = await axios.get(BASE_URL + "/api/course", {
        withCredentials: true,
      });

      const courses = refreshed.data?.data || refreshed.data || [];
      return courses.map(normalizeCourse);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create course"
      );
    }
  }
);

export const updateCourse = createAsyncThunk(
  "courses/update",
  async (
    data: SaveCoursePayload & {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { id, ...updateData } = data;

      await axios.put(BASE_URL + "/api/course/" + id, updateData, {
        withCredentials: true,
      });

      const refreshed = await axios.get(BASE_URL + "/api/course", {
        withCredentials: true,
      });

      const courses = refreshed.data?.data || refreshed.data || [];
      return courses.map(normalizeCourse);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course"
      );
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "courses/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(BASE_URL + "/api/course/" + id, {
        withCredentials: true,
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete course"
      );
    }
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearCourseError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCourses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
      state.loading = false;
      state.courses = action.payload;
    });
    builder.addCase(fetchCourses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCourse.fulfilled, (state, action: PayloadAction<Course[]>) => {
      state.loading = false;
      state.courses = action.payload;
    });
    builder.addCase(createCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course[]>) => {
      state.loading = false;
      state.courses = action.payload;
    });
    builder.addCase(updateCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.courses = state.courses.filter((course) => course._id !== action.payload);
    });
    builder.addCase(deleteCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCourseError } = courseSlice.actions;
export default courseSlice.reducer;
