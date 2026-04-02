import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { AuthUser } from "../access/appAccess";

interface Role {
  _id?: string;
  name: string;
  permissions?: Array<{
    _id?: string;
    name: string;
  }>;
}

interface AuthResponse {
  code: number;
  message: string;
  data: {
    user: {
      _id?: string;
      name: string;
      email: string;
      role: Role | AuthUser["role"];
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
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

function normalizeUser(user: AuthResponse["data"]["user"]): AuthUser {
  const normalizedRole =
    typeof user.role === "string"
      ? { name: user.role, permissions: [] }
      : user.role;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: normalizedRole.name,
    permissions: Array.isArray(normalizedRole.permissions)
      ? normalizedRole.permissions.map((permission) => permission.name)
      : [],
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

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const meResponse = await axios.get("http://localhost:8000/api/auth/me", {
        withCredentials: true,
      });

      return normalizeUser(meResponse.data.data.user);
    } catch (meError: any) {
      if (meError.response?.status !== 401) {
        return rejectWithValue(meError.response?.data?.message || "Failed to restore session");
      }

      try {
        await axios.post(
          "http://localhost:8000/api/auth/refresh-token",
          {},
          { withCredentials: true }
        );

        const refreshedMeResponse = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        return normalizeUser(refreshedMeResponse.data.data.user);
      } catch {
        return null;
      }
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
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      })
      .addCase(signUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.initialized = true;
      })
      .addCase(signUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = (action.payload as string) || null;
        state.initialized = true;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
