import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import type { UserProfile } from "../types";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.neuronresearch.org/v1/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.access?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Authentication Endpoints
    loginClientInitiate: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login/client/initiate",
        method: "POST",
        body: credentials,
      }),
    }),
    loginClientConfirm: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login/client/confirm",
        method: "POST",
        body: credentials,
      }),
    }),
    loginEmployee: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Other Existing Endpoints
    fetchTypeOfService: builder.query({
      query: () => ({
        url: `/projects/services`,
        method: "GET",
      }),
    }),
    getUserProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: "/auth/profile",
        method: "GET",
      }),
    }),
    getClientProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: "/auth/profile/client",
        method: "GET",
      }),
    }),
    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (updatedProfile) => ({
        url:
          updatedProfile.userType === "CLIENT"
            ? "/auth/profile/client"
            : "/auth/profile",
        method: "PUT",
        body: updatedProfile,
      }),
    }),
    updateProfilePicture: builder.mutation<UserProfile, FormData>({
      query: (formData) => ({
        url: "/auth/profile-picture",
        method: "PUT",
        body: formData,
        formData: true,
      }),
    }),
  }),
});

// Export Hooks for Usage
export const {
  useLoginClientInitiateMutation,
  useLoginClientConfirmMutation,
  useLoginEmployeeMutation,
  useFetchTypeOfServiceQuery,
  useGetUserProfileQuery,
  useGetClientProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateProfilePictureMutation,
} = apiSlice;