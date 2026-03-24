import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Role {
  _id?: string;
  name: "admin" | "faculty" | "student";
}

interface User {
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "faculty" | "student";
}

interface AuthResponse {
  code: number;
  message: string;
  data: {
    user: {
      _id?: string;
      name: string;
      email: string;
      role: Role | User["role"];
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn?: string;
    refreshTokenExpiresIn?: string;
  };
}

interface Login {
  email: string;
  password: string;
}

interface SignUp {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

function normalizeUser(user: AuthResponse["data"]["user"]): User {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: typeof user.role === "string" ? user.role : user.role.name,
  };
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: Login, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:8000/api/auth/login", data, {
        withCredentials: true,
      });

      return {
        ...response.data,
        data: {
          ...response.data.data,
          user: normalizeUser(response.data.data.user),
        },
      } as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (error.code === "ERR_NETWORK" ? "Cannot reach backend server. Check that the backend is running and CORS allows your frontend URL." : "Login failed"));
    }
  }
);

export const signUser = createAsyncThunk(
  "auth/signup",
  async (data: SignUp, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:8000/api/user", data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload.data.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
      })
      .addCase(signUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
