import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "../../types/index";

export interface ProfileState extends UserProfile {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProfileState = {
  id: 0,
  firstName: "",
  lastName: "",
  email: "",
  userType: "",
  isVerified: false,
  profilePic: "",
  Client: null,
  userId: 0,
  age: 0,
  address: "",
  aadharNumber: "",
  gender: "",
  designation: "",
  empid: "",
  status: "idle",
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      return { ...state, ...action.payload, status: "succeeded", error: null };
    },
    setProfileLoading: (state) => {
      state.status = "loading";
    },
    setProfileError: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      return { ...state, ...action.payload, status: "succeeded", error: null };
    },
    resetProfile: () => initialState,
  },
});

export const {
  setProfile,
  setProfileLoading,
  setProfileError,
  updateProfile,
  resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
