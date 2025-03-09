import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface ChatSalesResponse {
  type: string;
  lead_id: number;
  participants: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePic?: string;
      role: string;
    };
    ref_id: number;
    _id: string;
    last_viewed?: string;
  }[];
  created: string;
  modified: string;
  last_message?: {
    msg_type: string;
    msg_params: {
      text: string;
    };
    sent_by: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
        profilePic?: string;
        role: string;
      };
      ref_id: number;
      _id: string;
      last_viewed?: string;
    };
    created: string;
    id: string;
  };
  id: string;
}

export interface ChatGroupsResponse {
  type: string;
  participants: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePic?: string;
      role: string;
    };
    ref_id: number;
    _id: string;
  }[];
  project_id: number;
  name: string;
  created: string;
  modified: string;
  last_message?: {
    msg_type: string;
    msg_params: {
      text: string;
    };
    sent_by: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
        profilePic?: string;
        role: string;
      };
      ref_id: number;
      _id: string;
    };
    created: string;
    id: string;
  };
  id: string;
}
export const clientApiSlice = createApi({
  reducerPath: "clientApi",
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
    fetchClientStats: builder.query<
      {
        completed: number;
        active: number;
      },
      string
    >({
      query: (userId) => `/client/${userId}/projects/stats`,
    }),
    fetchActiveProjects: builder.query<
      {
        name: string;
        edd: string;
        id: number;
      }[],
      string
    >({
      query: (userId) => `/client/${userId}/projects`,
    }),
    fetchCompletedProjects: builder.query<
      {
        name: string;
        edd: string;
        id: number;
      }[],
      string
    >({
      query: (userId) => `/client/${userId}/projects?completed=true`,
    }),
    fetchProjectById: builder.query<
      {
        name: string;
        id: number;
        start_date: string;
        end_date: string;
        milestones: {
          id: number;
          description: string;
          dueDate: string;
          status: "NEW" | "COMPLETED";
          createdAt: string;
        }[];
        chat: {
          type: string;
          participants: {
            user: {
              firstName: string;
              lastName: string;
              email: string;
              profilePic?: string; // Optional
              role: string;
            };
            ref_id: number;
            _id: string;
          }[];
          project_id: number;
          name: string;
          created: string;
          modified: string;
          id: string;
        };
      },
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) =>
        `/client/${userId}/projects/${projectId}`,
    }),
    fetchProjectMilestones: builder.query<
      {
        start_date: string;
        end_date: string;
        milestones: {
          id: number;
          description: string;
          dueDate: string;
          status: string;
          createdAt: string;
          AddedBy: {
            firstName: string;
            email: string;
            lastName: string;
            id: number;
            profilePic: string;
            designation: string;
          };
          AssignedTo: {
            firstName: string;
            email: string;
            lastName: string;
            id: number;
            profilePic: string;
            designation: string;
          };
        }[];
      },
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) =>
        `/client/${userId}/projects/${projectId}/milestones`,
    }),
    fetchClientPayment: builder.query<
      {
        name: string;
        edd: string | null;
        id: number;
        cost: number;
        paymentTillDate: number;
        LastPayment: {
          amount: number;
          id: number;
          paymentDate: string;
          completed: boolean;
        } | null;
        NextPayment: {
          amount: number;
          id: number;
          paymentDate: string;
          completed: boolean;
        } | null;
        pendingAmount: number;
      }[],
      { userId: string; params?: Record<string, string | number | boolean> }
    >({
      query: ({ userId, params }) => ({
        url: `/client/${userId}/payments`,
        method: "GET",
        params,
      }),
    }),
    fetchPaymentReceipt: builder.mutation<
      string,
      { userId: string; paymentId: string }
    >({
      query: ({ userId, paymentId }) => ({
        url: `/client/${userId}/payments/${paymentId}/receipt`,
        method: "GET",
        responseHandler: (response) => response.text(),
      }),
    }),
    fetchChatMessages: builder.query<
      {
        type: string;
        msg_type: string;
        msg_params: {
          text: string;
        };
        ref_id: string;
        sent_by: {
          user: {
            firstName: string;
            lastName: string;
            email: string;
            profilePic?: string;
            role: string;
          };
          ref_id: number;
          _id: string;
        };
        status: string;
        created: string;
        modified: string;
        id: string;
      }[],
      string
    >({
      query: (chatId) => `/chat/messages?ref_id=${chatId}`,
    }),
    sendChatMessage: builder.mutation<
      {
        id: string;
        status: string;
      },
      {
        chatId: string;
        message: string;
      }
    >({
      query: ({ chatId, message }) => ({
        url: `/chat/messages`,
        method: "POST",
        body: {
          ref_id: chatId,
          msg_type: "text",
          msg_params: {
            text: message,
          },
        },
      }),
    }),
    fetchChatSales: builder.query<ChatSalesResponse[], void>({
      query: () => `/chat/sales`,
    }),

    fetchChatGroups: builder.query<ChatGroupsResponse[], void>({
      query: () => `/chat/groups`,
    }),
  }),
});

export const {
  useFetchClientStatsQuery,
  useFetchActiveProjectsQuery,
  useFetchCompletedProjectsQuery,
  useFetchProjectByIdQuery,
  useFetchProjectMilestonesQuery,
  useFetchClientPaymentQuery,
  useFetchPaymentReceiptMutation,
  useFetchChatMessagesQuery,
  useSendChatMessageMutation,
  useFetchChatSalesQuery,
  useFetchChatGroupsQuery,
} = clientApiSlice;
