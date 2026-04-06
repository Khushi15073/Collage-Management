import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

export type DegreeMode = "semester" | "year";

export type DegreeCourse = {
  id: string;
  name: string;
  code: string;
};

export type DegreeSection = {
  key: string;
  label: string;
  courses: DegreeCourse[];
};

export type DegreeRecord = {
  id: string;
  degreeName: string;
  department: string;
  type: DegreeMode;
  count: number;
  availableEnrollmentYears: number[];
  createdBy: string;
  createdDate: string;
  sections: DegreeSection[];
};

type SaveDegreePayload = {
  degreeName: string;
  department: string;
  type: DegreeMode;
  count: number;
  sections: DegreeSection[];
};

interface DegreeState {
  degrees: DegreeRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: DegreeState = {
  degrees: [],
  loading: false,
  error: null,
};

function normalizeDegree(degree: any): DegreeRecord {
  return {
    id: degree._id,
    degreeName: degree.degreeName ?? "",
    department: degree.department ?? "",
    type: (degree.type ?? "semester") as DegreeMode,
    count: Number(degree.count ?? 0),
    availableEnrollmentYears: Array.isArray(degree.availableEnrollmentYears)
      ? degree.availableEnrollmentYears.map((year: number) => Number(year))
      : [],
    createdBy:
      typeof degree.createdBy === "object"
        ? degree.createdBy?.name || "Degree"
        : "Degree",
    createdDate: degree.createdAt || new Date().toISOString(),
    sections: Array.isArray(degree.sections)
      ? degree.sections.map((section: any) => ({
          key: section.key,
          label: section.label,
          courses: Array.isArray(section.courses)
            ? section.courses.map((course: any, index: number) => ({
                id: `${section.key}-${course.code || index}`,
                name: course.name,
                code: course.code,
              }))
            : [],
        }))
      : [],
  };
}

export const fetchDegrees = createAsyncThunk(
  "degrees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/degree`, {
        withCredentials: true,
      });

      const degrees = response.data?.data || response.data || [];
      return degrees.map(normalizeDegree);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : (error.response?.data?.message || "Failed to fetch degrees")
      );
    }
  }
);

export const createDegree = createAsyncThunk(
  "degrees/create",
  async (data: SaveDegreePayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/degree`, data, {
        withCredentials: true,
      });

      return normalizeDegree(response.data?.data || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create degree"
      );
    }
  }
);

export const updateDegree = createAsyncThunk(
  "degrees/update",
  async ({ id, data }: { id: string; data: SaveDegreePayload }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/degree/${id}`, data, {
        withCredentials: true,
      });

      return normalizeDegree(response.data?.data || response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update degree"
      );
    }
  }
);

export const deleteDegree = createAsyncThunk(
  "degrees/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/degree/${id}`, {
        withCredentials: true,
      });

      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete degree"
      );
    }
  }
);

const degreeSlice = createSlice({
  name: "degrees",
  initialState,
  reducers: {
    clearDegreeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDegrees.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDegrees.fulfilled, (state, action: PayloadAction<DegreeRecord[]>) => {
      state.loading = false;
      state.degrees = action.payload;
    });
    builder.addCase(fetchDegrees.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createDegree.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createDegree.fulfilled, (state, action: PayloadAction<DegreeRecord>) => {
      state.loading = false;
      state.degrees = [action.payload, ...state.degrees];
    });
    builder.addCase(createDegree.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateDegree.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateDegree.fulfilled, (state, action: PayloadAction<DegreeRecord>) => {
      state.loading = false;
      state.degrees = state.degrees.map(deg => deg.id === action.payload.id ? action.payload : deg);
    });
    builder.addCase(updateDegree.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteDegree.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteDegree.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.degrees = state.degrees.filter(deg => deg.id !== action.payload);
    });
    builder.addCase(deleteDegree.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearDegreeError } = degreeSlice.actions;
export default degreeSlice.reducer;
