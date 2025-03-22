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
  TextMessageParams,
  FileMessageParams,
  QuoteMessageParams,
  AgreementMessageParams,
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

export interface OnboardClientResponse {
  userId: number;
  mobileNumber: string;
  salesPersonId: number;
  countryCode: number;
  onboarded: boolean;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  userType: string;
  isVerified: boolean;
  profilePic: string;
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
  nextPaymentDate?: string;
}

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

interface TncTemplate {
  id: number;
  name: string;
  common_file: {
    name: string;
    size: number;
    url: string;
  };
}

interface SendTncRequest {
  tnc_id: number;
}

interface SendTncResponse {
  msg_params: {
    name: string;
    size: number;
    url: string;
    mimetype: string;
  };
  msg_type: "file";
  type: "personal";
  sent_by: number;
  ref_id: string;
}

// Request interface for adding a quote to a chat
export interface AddChatQuoteRequest {
  amount: number;
  requirement: string;
}

export interface AddChatQuoteResponse {
  msg_params: {
    amount: number;
    status: string;
    requirement: string;
    id: number;
  };
  msg_type: "quote";
  type: "personal" | "public" | "group";
  sent_by: number;
  ref_id: string;
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
    fetchLeads: builder.query<Lead[], { recent?: boolean } | void>({
      queryFn: async (params, { getState }, __, baseQuery) => {
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
          params: params || {}, // Pass params like recent=true if provided
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
    fetchProjectMilestones: builder.query<
      MilestoneResponse,
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) => ({
        url: `/sales/${userId}/projects/${projectId}/stepper`,
        method: "GET",
      }),
    }),
    fetchProjectPayments: builder.query<
      Payment[],
      { userId: string; projectId: string }
    >({
      query: ({ userId, projectId }) =>
        `/sales/${userId}/projects/${projectId}/payments`,
    }),
    fetchChatLeads: builder.query<ChatLead[], void>({
      query: () => ({
        url: "/chat/leads",
        method: "GET",
      }),
      transformResponse: (response: ChatLead[]) => {
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
        const validatedMessages = response.filter((msg) => {
          if (!msg || typeof msg !== "object") return false;
          if (
            !("msg_type" in msg) ||
            !["text", "file", "quote", "agreement"].includes(msg.msg_type) // Added "agreement"
          )
            return false;
          if (
            !("type" in msg) ||
            !["personal", "public", "group"].includes(msg.type) // Updated to include "group"
          )
            return false;
          if (
            !("status" in msg) ||
            !["sent", "delivered", "read"].includes(msg.status)
          )
            return false;
          if (
            !("ref_id" in msg) ||
            !("sent_by" in msg) ||
            !("created" in msg) ||
            !("modified" in msg) ||
            !("id" in msg)
          )
            return false;

          if ("msg_params" in msg) {
            const params = msg.msg_params;
            if (msg.msg_type === "text" && (!params || !("text" in params)))
              return false;
            if (
              msg.msg_type === "file" &&
              (!params ||
                !("url" in params) ||
                !("size" in params) ||
                !("mimetype" in params))
            )
              return false;
            if (
              msg.msg_type === "quote" &&
              (!params ||
                !("amount" in params) ||
                !("status" in params) ||
                !("requirement" in params) ||
                !("id" in params))
            )
              return false;
            if (
              msg.msg_type === "agreement" &&
              (!params ||
                !("name" in params) ||
                !("size" in params) ||
                !("public_id" in params) ||
                !("url" in params) ||
                !("mimetype" in params) ||
                !("signed" in params))
            )
              return false;
          }
          return true;
        });
        return validatedMessages.sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime()
        );
      },
    }),
    sendChatMessage: builder.mutation<
      { id: string; status: string },
      {
        chatId: string;
        message?: string;
        messageType: "text" | "file" | "quote" | "agreement";
        messageParams?:
          | TextMessageParams
          | FileMessageParams
          | QuoteMessageParams
          | AgreementMessageParams;
        type?: "personal" | "public" | "group";
      }
    >({
      query: ({
        chatId,
        message,
        messageType,
        messageParams,
        type = "personal",
      }) => {
        const payload: Partial<ChatMessage> = {
          ref_id: chatId,
          msg_type: messageType,
          type,
          status: "sent",
        };

        if (messageType === "text") {
          payload.msg_params = message ? { text: message } : messageParams;
        } else if (messageParams) {
          payload.msg_params = messageParams;
        } else {
          throw new Error(
            `Invalid messageParams for messageType: ${messageType}`
          );
        }

        return {
          url: `/chat/messages`,
          method: "POST",
          body: payload,
        };
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
    fetchPendingMessages: builder.query<Lead[], void>({
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
          url: `/sales/${userId}/leads?pending=true`,
          method: "GET",
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as Lead[] };
      },
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
    onboardClient: builder.mutation<
      OnboardClientResponse,
      { salesId: string; leadId: string }
    >({
      query: ({ salesId, leadId }) => ({
        url: `/sales/${salesId}/leads/${leadId}/onboard`,
        method: "PUT",
      }),
    }),

    //upload aggrement
    uploadAgreement: builder.mutation<
      ChatMessage,
      {
        chatId: string;
        file: File;
      }
    >({
      query: ({ chatId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/chat/${chatId}/upload-agreement`,
          method: "POST",
          body: formData,
        };
      },
    }),
    // New endpoint: Fetch TNC Templates
    fetchTncTemplates: builder.query<TncTemplate[], void>({
      query: () => ({
        url: "/chat/tnc-templates",
        method: "GET",
      }),
      transformResponse: (response: TncTemplate[]) => {
        console.log("Fetched TNC templates:", response);
        return response;
      },
    }),

    // New endpoint: Send TNC (updated to use SendTncRequest)
    sendTnc: builder.mutation<
      SendTncResponse,
      { chatId: string; tncId: number }
    >({
      query: ({ chatId, tncId }) => ({
        url: `/chat/${chatId}/send-tnc`,
        method: "POST",
        body: { tnc_id: tncId } as SendTncRequest, // Explicitly typed as SendTncRequest
      }),
      transformResponse: (response: SendTncResponse) => {
        console.log("Send TNC response:", response);
        return response;
      },
    }),
    addChatQuote: builder.mutation<
      AddChatQuoteResponse,
      { chatId: string; quoteData: AddChatQuoteRequest }
    >({
      query: ({ chatId, quoteData }) => ({
        url: `/chat/${chatId}/add-quote`,
        method: "POST",
        body: quoteData,
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
  useSendChatMessageMutation,
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
  useOnboardClientMutation,
  useUploadAgreementMutation,
  useFetchTncTemplatesQuery,
  useSendTncMutation,
  useAddChatQuoteMutation,
} = salesApiSlice;
