// store/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";
import socketService from "../lib/socket-service"; 

interface AuthState {
  user: User | null;
  token: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  } | null;
  loginType: "client" | "employee" | null;
  mobileNumber: string | null;
  countryCode: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loginType: null,
  mobileNumber: null,
  countryCode: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: AuthState["token"];
        loginType: "client" | "employee";
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loginType = action.payload.loginType;
      state.isAuthenticated = true;
    },
    setLoginType: (
      state,
      action: PayloadAction<"client" | "employee" | null>
    ) => {
      state.loginType = action.payload;
    },
    setClientLoginInfo: (
      state,
      action: PayloadAction<{ countryCode: string; mobileNumber: string }>
    ) => {
      state.countryCode = action.payload.countryCode;
      state.mobileNumber = action.payload.mobileNumber;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    refreshToken: (
      state,
      action: PayloadAction<{
        access: { token: string; expires: string };
      }>
    ) => {
      if (state.token) {
        state.token.access = action.payload.access;
      }
    },
    logout: (state) => {
      socketService.disconnect(); // Disconnect WebSocket on logout
      console.log("Logging out, WebSocket disconnected");
      Object.assign(state, initialState);
    },
  },
});

export const {
  setCredentials,
  setLoginType,
  setClientLoginInfo,
  updateUser,
  refreshToken,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

export type { AuthState };
