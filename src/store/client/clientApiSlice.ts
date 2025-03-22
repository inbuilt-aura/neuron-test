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

export interface DocumentRequest {
  reference_doc: {
    common_file: {
      name: string;
      id: number;
      size: number;
      mimetype: string;
      url: string;
    };
  };
  client_doc: {
    common_file: {
      name: string;
      id: number;
      size: number;
      mimetype: string;
      url: string;
    };
  };
  description: string;
  id: number;
  due_date: string;
  status: string;
  createdAt: string;
}

export interface FileInfo {
  name: string;
  id: number;
  size: number;
  mimetype: string;
  url: string;
}

export interface DocumentUploadResponse {
  id: number;
  description: string;
  due_date: string;
  reference_doc_id: number;
  client_doc_id: number;
  project_id: number;
  client_id: number;
  status: string;
  createdAt: string;
  modifiedAt: string;
}

export interface ProjectFile {
  id: number;
  file_id: number;
  projectId: number;
  common_file: {
    name: string;
    id: number;
    size: number;
    mimetype: string;
    url: string;
  };
}

export interface Notification {
  text: string;
  time: string;
  description: string;
  ref_id: number;
  seen: boolean;
  from: {
    firstName: string;
    lastName: string;
    profilePic: string;
  };
  id: string;
}

export interface MessageParticipant {
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
}
export interface AgreementMessageParams {
  name: string;
  size: number;
  public_id: string;
  url: string;
  mimetype: string;
  signed: boolean;
}
export interface TextMessageParams {
  text: string;
}

export interface FileMessageParams {
  filename?: string;
  name?: string;
  url: string;
  size: number;
  mimetype: string;
  public_id?: string;
  text?: string;
}

export interface QuoteMessageParams {
  amount: number;
  status: string;
  requirement: string;
  id: number;
}

export interface BaseMessage {
  type: string;
  ref_id: string;
  sent_by: MessageParticipant;
  status: string;
  created: string;
  modified: string;
  id: string;
}

export interface TextMessage extends BaseMessage {
  msg_type: "text";
  msg_params?: TextMessageParams;
}

export interface AgreementMessage extends BaseMessage {
  msg_type: "agreement";
  msg_params: AgreementMessageParams;
}

export interface FileMessage extends BaseMessage {
  msg_type: "file";
  msg_params: FileMessageParams;
}

export interface QuoteMessage extends BaseMessage {
  msg_type: "quote";
  msg_params: QuoteMessageParams;
}

export interface ChatFile {
  id: number;
  name: string;
  size: number;
  url: string;
  public_id: string;
  mimetype: string;
  creator_id: number;
}

export type ChatMessage =
  | TextMessage
  | FileMessage
  | QuoteMessage
  | AgreementMessage;

export interface UpdateAgreementResponse {
 message:string
}

export const clientApiSlice = createApi({
  reducerPath: "clientApi",
  tagTypes: ["Notification", "Chat", "Project", "File"],
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
    fetchChatMessages: builder.query<ChatMessage[], string>({
      query: (chatId) => `/chat/messages?ref_id=${chatId}`,
      transformResponse: (response: ChatMessage[]) => {
        const validatedMessages = response.filter((msg) => {
          if (!msg || typeof msg !== "object") return false;
          if (
            !("msg_type" in msg) ||
            !["text", "file", "quote", "agreement"].includes(msg.msg_type) // Add "agreement" here
          )
            return false;
          if (
            !("type" in msg) ||
            !["personal", "public", "group"].includes(msg.type)
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
            // Add validation for agreement type
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
        message: string;
        messageType?: "text" | "file" | "quote" | "agreement";
        messageParams?:
          | TextMessageParams
          | FileMessageParams
          | QuoteMessageParams
          | AgreementMessageParams;
        type?: "personal" | "group";
      }
    >({
      query: ({
        chatId,
        message,
        messageType = "text",
        messageParams,
        type = "personal",
      }) => {
        const payload: Partial<ChatMessage> = {
          ref_id: chatId,
          msg_type: messageType,
          type,
          status: "sent",
        };

        if (messageType === "text" && !messageParams) {
          payload["msg_params"] = { text: message };
        } else if (messageParams) {
          payload["msg_params"] = messageParams;
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
    fetchChatSales: builder.query<ChatSalesResponse[], void>({
      query: () => `/chat/sales`,
    }),
    fetchChatGroups: builder.query<ChatGroupsResponse[], void>({
      query: () => `/chat/groups`,
    }),
    fetchDocumentRequests: builder.query<DocumentRequest[], string>({
      query: (userId) => `/client/${userId}/document-requests`,
    }),
    downloadClientDoc: builder.query<
      FileInfo,
      { userId: string; requestId: string }
    >({
      query: ({ userId, requestId }) =>
        `/client/${userId}/document-requests/${requestId}/client-doc/download`,
    }),
    uploadDocumentFile: builder.mutation<
      DocumentUploadResponse,
      { userId: string; requestId: string; file: File }
    >({
      query: ({ userId, requestId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/client/${userId}/document-requests/${requestId}/upload`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    fetchProjectFiles: builder.query<
      ProjectFile[],
      { userId: string; projectId: string; type?: string }
    >({
      query: ({ userId, projectId, type }) => ({
        url: `/client/${userId}/projects/${projectId}/files`,
        method: "GET",
        params: type ? { type } : undefined,
      }),
      providesTags: ["File"],
    }),
    uploadProjectFile: builder.mutation<
      ProjectFile,
      { userId: string; projectId: string; file: File }
    >({
      query: ({ userId, projectId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/client/${userId}/projects/${projectId}/files`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["File"],
    }),
    fetchChatFiles: builder.query<
      ChatFile[],
      { chatId: string; filter?: "sent" | "received" }
    >({
      query: ({ chatId, filter }) => ({
        url: `/chat/${chatId}/files`,
        method: "GET",
        params: filter ? { filter } : undefined,
      }),
      providesTags: ["File"],
    }),
    uploadChatFile: builder.mutation<
      ChatMessage,
      { chatId: string; file: File }
    >({
      query: ({ chatId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/chat/${chatId}/upload-file`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["File"],
    }),
    fetchNotifications: builder.query<Notification[], { unread?: boolean }>({
      query: ({ unread }) => ({
        url: `/notifications`,
        method: "GET",
        params: unread !== undefined ? { unread } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Notification" as const,
                id,
              })),
              { type: "Notification" as const, id: "LIST" },
            ]
          : [{ type: "Notification" as const, id: "LIST" }],
    }),
    markNotificationAsRead: builder.mutation<
      Notification,
      { notificationId: string }
    >({
      query: ({ notificationId }) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { notificationId }) => [
        { type: "Notification" as const, id: notificationId },
        { type: "Notification" as const, id: "LIST" },
      ],
    }),
    updateAgreement: builder.mutation<
    UpdateAgreementResponse,
    { clientId: string; response: boolean }
  >({
    query: ({ clientId, response }) => ({
      url: `/client/${clientId}/agreement/update`,
      method: "POST",
      body: { response },
    }),
    invalidatesTags: ["Chat", "File"],
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
  useFetchDocumentRequestsQuery,
  useDownloadClientDocQuery,
  useUploadDocumentFileMutation,
  useFetchProjectFilesQuery,
  useUploadProjectFileMutation,
  useUploadChatFileMutation,
  useFetchChatFilesQuery,
  useFetchNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useUpdateAgreementMutation
} = clientApiSlice;
