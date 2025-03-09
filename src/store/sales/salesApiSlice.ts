import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type {
  Lead,
  LeadFormData,
  UserProfile,
  Client,
  ProjectFormData,
  Project,
  ChatLead,
  ChatMessage,
  ProjectDetails,
  Payment,
  QuoteResponse,
  AddQuoteRequest,
  UpdateQuoteRequest,
  Note,
  MilestoneResponse,
  GroupChat,
} from "../../types";

interface AddLeadResponse {
  lead: Lead;
  success: boolean;
  message: string;
}

interface UpdateLeadData {
  leadId: number;
  followUpDate?: string;
  requirements?: string;
  projectServiceTypeId?: number;
}

interface CompleteLastPaymentResponse {
  id: number;
  amount: number;
  projectId: number;
  addedById: number;
  completed: boolean;
  clientId: number;
  paymentDate: string;
  createdAt: string;
  modifiedAt: string;
  nextId: number | null;
}

export interface PaymentTableItem {
  id: number;
  name: string;
  edd: string;
  startDate: string | null;
  researcherId: number | null;
  clientId: number;
  salesId: number;
  managerId: number;
  cost: number;
  requirements: string;
  paymentTillDate: number;
  deskId: number | null;
  status: string;
  projectType: string;
  projectServiceTypeId: number | null;
  lastPaymentId: number | null;
  nextPaymentId: number | null;
  approved: boolean;
  createdAt: string;
  modifiedAt: string;
  quote_id: number;
  LastPayment: {
    id: number;
    amount: number;
    projectId: number;
    addedById: number;
    completed: boolean;
    clientId: number;
    paymentDate: string;
    createdAt: string;
    modifiedAt: string;
    nextId: number | null;
  } | null;
  NextPayment: {
    id: number;
    amount: number;
    projectId: number;
    addedById: number;
    completed: boolean;
    clientId: number;
    paymentDate: string;
    createdAt: string;
    modifiedAt: string;
    nextId: number | null;
  } | null;
  paymentDate?: string;
  projectCompletionDate?: string;
  pendingPayment?: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string; // Added this field for upcoming payments
}

// interface UpdateLastPaymentRequest {
//   paymentDate: string;
// }
interface UpdateLastPaymentResponse {
  id: number;
  amount: number;
  projectId: number;
  addedById: number;
  completed: boolean;
  clientId: number;
  paymentDate: string;
  createdAt: string;
  modifiedAt: string;
  nextId: number | null;
}

interface DeleteLeadResponse {
  success: boolean;
  id: number;
}

interface ProjectSummary {
  cost: number;
  paymentTillDate: number;
  lastPaymentDate: string;
  pendingAmount: number;
}

interface ProjectShort {
  name: string;
  id: number;
  Client: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
}

export const salesApiSlice = createApi({
  reducerPath: "salesApi",
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
    addLead: builder.mutation<AddLeadResponse, LeadFormData>({
      queryFn: async (data, { getState }, extraOptions, baseQuery) => {
        const state = getState() as RootState;
        const userId = state.auth.user?.id;

        if (!userId) {
          return {
            error: {
              status: 401,
              data: "User not authenticated",
            } as FetchBaseQueryError,
          };
        }

        const result = await baseQuery({
          url: `/sales/${userId}/leads`,
          method: "POST",
          body: data,
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as AddLeadResponse };
      },
    }),
    fetchLeadStats: builder.query<
      {
        total: number;
        follow_up_today: number;
        recent: number;
        pending: number;
      },
      string
    >({
      query: (userId) => `/sales/${userId}/leads/stats`,
    }),
    fetchLeads: builder.query<Lead[], void>({
      queryFn: async (_, { getState }, __, baseQuery) => {
        const state = getState() as RootState;
        const userId = state.auth.user?.id;

        if (!userId) {
          return {
            error: {
              status: 401,
              data: "User not authenticated",
            } as FetchBaseQueryError,
          };
        }

        const result = await baseQuery({
          url: `/sales/${userId}/leads`,
          method: "GET",
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as Lead[] };
      },
    }),
    updateLead: builder.mutation<Lead, UpdateLeadData>({
      queryFn: async (data, { getState }, extraOptions, baseQuery) => {
        const state = getState() as RootState;
        const userId = state.auth.user?.id;

        if (!userId) {
          return {
            error: {
              status: 401,
              data: "User not authenticated",
            } as FetchBaseQueryError,
          };
        }

        const { leadId, ...updateData } = data;

        const result = await baseQuery({
          url: `/sales/${userId}/leads/${leadId}`,
          method: "PUT",
          body: {
            ...updateData,
            status: true, // Always set status to true on update
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as Lead };
      },
    }),
    deleteLead: builder.mutation<DeleteLeadResponse, number>({
      queryFn: async (leadId, { getState }, extraOptions, baseQuery) => {
        const state = getState() as RootState;
        const userId = state.auth.user?.id;

        if (!userId) {
          return {
            error: {
              status: 401,
              data: "User not authenticated",
            } as FetchBaseQueryError,
          };
        }

        const result = await baseQuery({
          url: `/sales/${userId}/leads/${leadId}`,
          method: "DELETE",
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: { success: true, id: leadId } };
      },
    }),
    //fetch client data
    fetchclients: builder.query<Client[], string>({
      query: (userId) => ({
        url: `/sales/${userId}/clients`,
        method: "GET",
      }),
      transformResponse: (response: Client[]) => {
        console.log("Fetched clients:", response);
        return response;
      },
    }),
    fetchProjectStats: builder.query({
      query: (userId: string) => ({
        url: `/sales/${userId}/projects/stats`,
        method: "GET",
      }),
    }),

    //create project

    createProject: builder.mutation<
      Project,
      { userId: string; projectData: ProjectFormData }
    >({
      query: ({ userId, projectData }) => ({
        url: `/sales/${userId}/projects`,
        method: "POST",
        body: projectData,
      }),
    }),

    fetchForwardProjects: builder.query({
      query: ({ userId, projectType }) => ({
        url: `/sales/${userId}/projects`,
        method: "GET",
        params: {
          projectType,
          status: "NEW",
        },
      }),
    }),

    fetchProjectNotes: builder.query<
      Note[],
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) =>
        `/sales/${userId}/projects/${projectId}/notes`,
    }),

    addProjectNote: builder.mutation<
      Note,
      { userId: string; projectId: string; note: string }
    >({
      query: ({ userId, projectId, note }) => ({
        url: `/sales/${userId}/projects/${projectId}/notes`,
        method: "POST",
        body: { note },
      }),
    }),

    fetchFastTrackProjects: builder.query({
      query: (userId) =>
        `/sales/${userId}/projects?projectType=FAST_TRACK&status=APPROVED`,
    }),
    fetchUpdatedQuoteProjects: builder.query({
      query: (userId) =>
        `/sales/${userId}/projects?status=APPROVED&quote_status=ASSESS`,
    }),
    fetchprojects: builder.query({
      query: (userId: string) => ({
        url: `/sales/${userId}/projects-short`,
        method: "GET",
      }),
    }),
    addPayment: builder.mutation({
      query: ({
        userId,
        projectId,
        amount,
        nextPaymentDate,
        nextPaymentAmount,
      }: {
        userId: string;
        projectId: string;
        amount: string;
        nextPaymentDate?: string;
        nextPaymentAmount?: string;
      }) => {
        const body: {
          amount: string;
          nextPaymentDate?: string;
          nextPaymentAmount?: string;
        } = { amount };

        if (nextPaymentDate) body.nextPaymentDate = nextPaymentDate;
        if (nextPaymentAmount) body.nextPaymentAmount = nextPaymentAmount;

        return {
          url: `/sales/${userId}/projects/${projectId}/payments`,
          method: "POST",
          body,
        };
      },
    }),
    fetchpayments: builder.query({
      query: (userId: string) => ({
        url: `/sales/${userId}/payments`,
        method: "GET",
      }),
    }),
    // fetchProjectSummary: builder.query({
    //   query: ({
    //     userId,
    //     projectId,
    //   }: {
    //     userId: string;
    //     projectId: string;
    //   }) => ({
    //     url: `/sales/${userId}/projects/${projectId}`,
    //     method: "GET",
    //   }),
    // }),
    updatepayment: builder.mutation({
      query: ({
        userId,
        projectId,
        paymentId,
        amount,
        paymentDate,
        completed,
      }: {
        userId: string;
        projectId: string;
        paymentId: string;
        amount: string;
        paymentDate: string;
        completed: boolean;
      }) => ({
        url: `/sales/${userId}/projects/${projectId}/payments/${paymentId}`,
        method: "PUT",
        body: {
          amount,
          paymentDate,
          completed,
        },
      }),
    }),

    //add note
    addNote: builder.mutation({
      query: ({
        userId,
        projectId,
        note,
      }: {
        userId: string;
        projectId: string;
        note: string;
      }) => ({
        url: `/sales/${userId}/projects/${projectId}/notes`,
        method: "POST",
        body: { note },
      }),
    }),
    // Add quote and update quote
    addQuote: builder.mutation<QuoteResponse, AddQuoteRequest>({
      query: ({ userId, projectId, amount, requirement }) => ({
        url: `/sales/${userId}/projects/${projectId}/add-quote`,
        method: "POST",
        body: { amount, requirement },
      }),
    }),
    updateQuote: builder.mutation<QuoteResponse, UpdateQuoteRequest>({
      query: ({ userId, projectId, amount }) => ({
        url: `/sales/${userId}/projects/${projectId}/update-quote`,
        method: "POST",
        body: { amount },
      }),
    }),
    fetchProjectsForTable: builder.query({
      query: (userId: string) => ({
        url: `/sales/${userId}/projects/`,
        method: "GET",
      }),
    }),
    fetchProjectDetails: builder.query<
      ProjectDetails,
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) =>
        `/sales/${userId}/projects/${projectId}`,
    }),

    // Milestones endpoints
    fetchProjectMilestones: builder.query<
      MilestoneResponse,
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) => ({
        url: `/sales/${userId}/projects/${projectId}/stepper`,
        method: "GET",
      }),
    }),

    // Payments endpoints
    fetchProjectPayments: builder.query<
      Payment[],
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) =>
        `/sales/${userId}/projects/${projectId}/payments`,
    }),
    //chat
    fetchChatLeads: builder.query<ChatLead[], void>({
      query: () => ({
        url: "/chat/leads",
        method: "GET",
      }),
      transformResponse: (response: ChatLead[]) => {
        // Sort the leads by the most recent message
        return response.sort(
          (a, b) =>
            new Date(b.modified).getTime() - new Date(a.modified).getTime()
        );
      },
    }),

    fetchChatMessages: builder.query<ChatMessage[], string>({
      query: (chatId) => ({
        url: `/chat/messages?ref_id=${chatId}`,
        method: "GET",
      }),
      transformResponse: (response: ChatMessage[]) => {
        // Sort messages in descending order (newest first)
        return response.sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
      },
    }),
    fetchSalesUsers: builder.query<UserProfile[], void>({
      query: () => ({
        url: `/sales`,
        method: "GET",
      }),
    }),

    fetchGroupChats: builder.query<GroupChat[], void>({
      query: () => ({
        url: "/chat/groups",
        method: "GET",
      }),
      transformResponse: (response: GroupChat[]) => {
        return response.sort(
          (a, b) =>
            new Date(b.modified).getTime() - new Date(a.modified).getTime()
        );
      },
    }),

    // forward to manager

    forwardToManager: builder.mutation<
      { success: boolean; message: string },
      { userId: string; projectId: string; managerId: string }
    >({
      query: ({ userId, projectId, managerId }) => ({
        url: `/sales/${userId}/projects/${projectId}/forward-manager`,
        method: "POST",
        body: { manager_id: managerId },
      }),
    }),
    // lead
    fetchTotalLeads: builder.query<number, string>({
      query: (userId) => `/sales/${userId}/leads`,
      transformResponse: (response: Lead[]) => response.length,
    }),
    fetchTodayFollowUp: builder.query<number, string>({
      query: (userId) => `/sales/${userId}/leads?today=true`,
      transformResponse: (response: Lead[]) => response.length,
    }),

    fetchNewLeads: builder.query<number, string>({
      query: (userId) => `/sales/${userId}/leads?recent=true`,
      transformResponse: (response: Lead[]) => response.length,
    }),

    fetchPendingMessages: builder.query<number, string>({
      query: (userId) => `/sales/${userId}/leads?pending=true`,
      transformResponse: (response: Lead[]) => response.length,
    }),
    transferLead: builder.mutation<
      void,
      { userId: string; leadId: string; salesPersonId: string }
    >({
      query: ({ userId, leadId, salesPersonId }) => ({
        url: `/sales/${userId}/leads/${leadId}/transfer`,
        method: "PUT",
        body: { salesPersonId },
      }),
    }),

    // payments
    fetchIncompletePayments: builder.query<
      PaymentTableItem[],
      { userId: string }
    >({
      query: ({ userId }) => `/sales/${userId}/payments?incomplete=true`,
    }),

    fetchCompletedPayments: builder.query<
      PaymentTableItem[],
      { userId: string }
    >({
      query: ({ userId }) => `/sales/${userId}/payments?completed=true`,
    }),

    fetchUpcomingPayments: builder.query<
      PaymentTableItem[],
      { userId: string }
    >({
      query: ({ userId }) => `/sales/${userId}/payments?upcoming=true`,
    }),
    //project details and summary
    fetchProjectSummary: builder.query<
      ProjectSummary,
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) =>
        `/sales/${userId}/projects/${projectId}/summary`,
    }),

    fetchProjectsShort: builder.query<
      ProjectShort[],
      { userId: string; clientId: string }
    >({
      query: ({ userId, clientId }) =>
        `/sales/${userId}/projects-short?clientId=${clientId}`,
    }),
    // payments
    completeLastPayment: builder.mutation<
      CompleteLastPaymentResponse,
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) => ({
        url: `/sales/${userId}/projects/${projectId}/complete-last-payment`,
        method: "PUT",
      }),
    }),

    updateLastPayment: builder.mutation<
      UpdateLastPaymentResponse,
      { userId: string; projectId: string; paymentDate: string }
    >({
      query: ({ userId, projectId, paymentDate }) => ({
        url: `/sales/${userId}/projects/${projectId}/update-last-payment`,
        method: "PUT",
        body: { paymentDate },
      }),
    }),
  }),
});

export const {
  useAddLeadMutation,
  useFetchLeadsQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useFetchclientsQuery,
  useFetchprojectsQuery,
  useAddPaymentMutation,
  useFetchpaymentsQuery,
  useUpdatepaymentMutation,
  useAddNoteMutation,
  useAddQuoteMutation,
  useUpdateQuoteMutation,
  useFetchProjectsForTableQuery,
  useFetchSalesUsersQuery,
  useTransferLeadMutation,
  useCreateProjectMutation,
  useFetchChatLeadsQuery,
  useFetchChatMessagesQuery,
  useFetchProjectStatsQuery,
  useFetchForwardProjectsQuery,
  useFetchFastTrackProjectsQuery,
  useFetchUpdatedQuoteProjectsQuery,
  useFetchProjectDetailsQuery,
  useFetchProjectNotesQuery,
  useAddProjectNoteMutation,
  useFetchProjectMilestonesQuery,
  useFetchProjectPaymentsQuery,
  useFetchGroupChatsQuery,
  useForwardToManagerMutation,
  useFetchTotalLeadsQuery,
  useFetchTodayFollowUpQuery,
  useFetchNewLeadsQuery,
  useFetchPendingMessagesQuery,
  useFetchLeadStatsQuery,
  useFetchIncompletePaymentsQuery,
  useFetchCompletedPaymentsQuery,
  useFetchUpcomingPaymentsQuery,
  useFetchProjectsShortQuery,
  useFetchProjectSummaryQuery,
  useCompleteLastPaymentMutation,
  useUpdateLastPaymentMutation,
} = salesApiSlice;
