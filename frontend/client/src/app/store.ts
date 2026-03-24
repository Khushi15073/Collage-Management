import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice"
import studentReducer from "../features/studentSlice"
import roleReducer from "../features/roleSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    roles:    roleReducer, 
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;