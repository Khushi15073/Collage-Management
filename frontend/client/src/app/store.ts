import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import studentReducer from "../features/studentSlice";
import roleReducer from "../features/roleSlice";
import facultyReducer from "../features/facultySlice";
import adminReducer from "../features/adminSlice";
import degreeReducer from "../features/degreeSlice";
import courseReducer from "../features/courseSlice";
import permissionReducer from "../features/permissionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    admins: adminReducer,
    degrees: degreeReducer,
    faculty: facultyReducer,
    roles: roleReducer,
    courses: courseReducer,
    permissions: permissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
