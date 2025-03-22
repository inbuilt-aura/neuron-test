import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { GroupChat, MilestoneResponse } from "../../types";

export interface TextMessageParams {
  text: string;
}

export interface FileMessageParams {
  name?: string;
  url: string;
  size: number;
  mimetype: string;
  public_id?: string;
  filename?: string; // Optional, matching ChatPage usage
}

export interface AgreementMessageParams {
  name: string;
  url: string;
  size: number;
  mimetype: string;
  public_id?: string;
  signed: boolean;
}

export interface QuoteMessageParams {
  amount: number;
  status: string;
  requirement: string;
  id?: number;
}

export interface ChatMessage {
  type: "group"; // Fixed for manager context
  msg_type: "text" | "file" | "agreement" | "quote";
  msg_params:
    | TextMessageParams
    | FileMessageParams
    | AgreementMessageParams
    | QuoteMessageParams;
  ref_id: string;
  sent_by: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
    ref_id: number;
    _id: string;
    last_viewed?: string;
  };
  status: "sent" | "delivered" | "read";
  created: string;
  modified: string;
  id: string;
 
}

export interface ChatFile {
  id: number;
  name: string;
  size: number;
  url: string;
  public_id: string;
  mimetype: string;
  creator_id?: number; // Optional, matches API response
}
export interface ManagerProjectStats {
  revenue: number;
  all: number;
  fast_track: number;
  unassigned: number;
}

type RolesResponse = string[];

export interface CreateEmployeeRequest {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  dob: string;
  address: string;
  aadhar: string;
  gender: string;
}

export interface CreateEmployeeResponse {
  message: string;
}

export interface Employee {
  firstName: string;
  lastName: string;
  profilePic: string;
  id?: number; // Optional
}

export interface EmployeeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePic: string;
}

export interface Project {
  name: string;
  id: number;
  requirements: string;
  edd: string; // ISO date string
  startDate: string | null;
  status: "DELIVERED" | "APPROVED" | "PENDING" | string;
  cost: number;
  paymentTillDate: number;
  Sales?: Employee;
  Researcher?: Employee;
}

export interface Revenue {
  pipeline: number;
  avg: number;
  count: number;
  sales: Employee;
}

export interface ProjectDetails extends Project {
  researcherId: number;
  clientId: number;
  salesId: number;
  managerId: number;
  deskId: number | null;
  projectType: "REGULAR" | "FAST_TRACK" | string;
  projectServiceTypeId: number | null;
  lastPaymentId: number | null;
  nextPaymentId: number | null;
  approved: boolean;
  createdAt: string;
  modifiedAt: string;
  quote_id: number;
  Client: {
    firstName: string;
    lastName: string;
    email: string;
    id: number;
    profilePic: string;
  };
  Manager: {
    firstName: string;
    lastName: string;
    email: string;
    id: number;
    profilePic: string;
  };
  quote: {
    id: number;
    amount: number;
    status: string;
    requirement: string | null;
    createdAt: string;
    modifiedAt: string;
  };
}

export interface ProjectFile {
  id: number;
  name: string;
  size: number;
  url: string;
  public_id: string;
  mimetype: string;
  creator_id: number;
}

export interface Note {
  id: number;
  note: string;
  projectId: number;
  createdBy: number;
  createdAt: string;
  modifiedAt: string;
  CreatedBy: {
    User: {
      firstName: string;
      email: string;
      lastName: string;
      id: number;
    };
    designation: string;
  };
}

export interface Payment {
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
  Project: {
    id: number;
    name: string;
  };
  Client: {
    userId: number;
    User: {
      firstName: string;
      lastName: string;
      profilePic: string;
    };
  };
  AddedBy: {
    firstName: string;
    email: string;
    lastName: string;
    id: number;
    profilePic: string;
    designation: string;
  };
  Next: {
    amount: number;
    paymentDate: string;
    completed: boolean;
    id: number;
  } | null;
}

export interface EmployeeBase {
  firstName: string;
  lastName: string;
  profilePic: string;
  role: string;
  id: number;
}

export interface SalesEmployeeStats {
  revenue: number;
  created: number;
  closed: number;
  leads: number;
  conversion_rate: number;
}

export interface ResearcherEmployeeStats {
  completed: number;
  ongoing: number;
  missed: number;
  ontime: number;
}

export interface EditorOrTechnicalEmployeeStats {
  completed: number;
  ongoing: number;
  missed: number;
  ontime: number;
  reviewed: number;
}

export interface SalesEmployeeDetailsResponse {
  employee: EmployeeBase;
  stats: SalesEmployeeStats;
}

export interface ResearcherEmployeeDetailsResponse {
  employee: EmployeeBase;
  stats: ResearcherEmployeeStats;
}

export interface EditorOrTechnicalEmployeeDetailsResponse {
  employee: EmployeeBase;
  stats: EditorOrTechnicalEmployeeStats;
}

export interface EmployeeProject {
  name: string;
  edd: string | null;
  status: "DELIVERED" | "APPROVED" | "ASSESS" | string;
  startDate: string | null;
  createdAt: string;
  Client: {
    firstName: string;
    lastName: string;
    profilePic: string;
    email: string;
    id: number;
  };
}

export interface AssignProjectRequest {
  designation: string;
  user_id: number;
  edd: string; // ISO date string (e.g., "2025-03-30")
}

export interface AssignProjectResponse {
  id: number;
  name: string;
  edd: string;
  startDate: string;
  researcherId: number | null;
  clientId: number;
  salesId: number;
  managerId: number;
  cost: number;
  requirements: string;
  paymentTillDate: number;
  deskId: number | null;
  editorId: number | null;
  technicalId: number | null;
  biostatId: number | null;
  status: "APPROVED" | string;
  projectType: "REGULAR" | "FAST_TRACK" | string;
  projectServiceTypeId: number | null;
  lastPaymentId: number | null;
  nextPaymentId: number | null;
  approved: boolean;
  createdAt: string;
  modifiedAt: string;
  quote_id: number;
}

// Define ChatFile type for consistency
export interface ChatFile {
  id: number;
  name: string;
  size: number;
  url: string;
  public_id: string;
  mimetype: string;
  creator_id?: number;
}
export const managerApiSlice = createApi({
  reducerPath: "managerApi",
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
  tagTypes: [
    "Projects",
    "Revenue",
    "ProjectDetails",
    "Files",
    "Notes",
    "Milestones",
    "Payments",
    "Employees",
    "ChatMessages",
    "ChatFiles", // Added for file-related tags
  ],
  endpoints: (builder) => ({
    getManagerProjectStats: builder.query<ManagerProjectStats, string>({
      query: (managerId) => ({
        url: `/manager/${managerId}/projects/stats`,
        method: "GET",
      }),
    }),
    getRoles: builder.query<RolesResponse, void>({
      query: () => ({
        url: "/roles",
        method: "GET",
      }),
    }),
    createEmployee: builder.mutation<
      CreateEmployeeResponse,
      { managerId: string; employeeData: CreateEmployeeRequest }
    >({
      query: ({ managerId, employeeData }) => ({
        url: `/manager/${managerId}/employees/`,
        method: "POST",
        body: employeeData,
      }),
    }),
    getApprovedProjects: builder.query<Project[], string>({
      query: (managerId) => ({
        url: `/manager/${managerId}/projects`,
        params: { approved: true },
      }),
      providesTags: ["Projects"],
    }),
    getApprovedFastTrackProjects: builder.query<Project[], string>({
      query: (managerId) => ({
        url: `/manager/${managerId}/projects`,
        params: { type: "FAST_TRACK", approved: true },
      }),
      providesTags: ["Projects"],
    }),
    getProjectsRevenue: builder.query<Revenue[], string>({
      query: (managerId) => `/manager/${managerId}/projects/revenue`,
      providesTags: ["Revenue"],
    }),
    getUnapprovedFastTrackProjects: builder.query<Project[], string>({
      query: (managerId) => ({
        url: `/manager/${managerId}/projects`,
        params: { type: "FAST_TRACK", approved: false },
      }),
      providesTags: ["Projects"],
    }),
    getUnapprovedRegularProjects: builder.query<Project[], string>({
      query: (managerId) => ({
        url: `/manager/${managerId}/projects`,
        params: { type: "REGULAR", approved: false },
      }),
      providesTags: ["Projects"],
    }),
    getProjectDetails: builder.query<ProjectDetails, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "GET",
      }),
      providesTags: ["ProjectDetails"],
    }),
    getProjectFiles: builder.query<ProjectFile[], string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/files`,
        method: "GET",
      }),
      providesTags: ["Files"],
    }),
    getProjectNotes: builder.query<Note[], string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/notes`,
        method: "GET",
      }),
      providesTags: ["Notes"],
    }),
    getProjectMilestones: builder.query<MilestoneResponse, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/milestones`,
        method: "GET",
      }),
      providesTags: ["Milestones"],
    }),
    getProjectPayments: builder.query<Payment[], string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/payments`,
        method: "GET",
      }),
      providesTags: ["Payments"],
    }),

    // Group chats
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
      providesTags: ["ChatMessages"], // Align with chat message updates
    }),

    // Chat messages
    fetchChatMessages: builder.query<ChatMessage[], string>({
      query: (chatId) => ({
        url: `/chat/messages?ref_id=${chatId}`,
        method: "GET",
      }),
      transformResponse: (response: ChatMessage[]) => {
        return response.sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime()
        );
      },
      providesTags: ["ChatMessages"],
    }),
    // Fetch chat files
    fetchChatFiles: builder.query<
      ChatFile[],
      { chatId: string; filter?: "sent" | "received" }
    >({
      query: ({ chatId, filter }) => ({
        url: `/chat/${chatId}/files`,
        method: "GET",
        params: filter ? { filter } : undefined,
      }),
      providesTags: ["ChatFiles"],
    }),

    // Upload chat file
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
      invalidatesTags: ["ChatFiles", "ChatMessages"],
    }),

    getSalesEmployees: builder.query<EmployeeResponse[], void>({
      query: () => ({
        url: "/employees",
        params: { role: "SALES" },
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    getResearcherEmployees: builder.query<EmployeeResponse[], void>({
      query: () => ({
        url: "/employees",
        params: { role: "RESEARCHER" },
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    getEditorEmployees: builder.query<EmployeeResponse[], void>({
      query: () => ({
        url: "/employees",
        params: { role: "EDITOR" },
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    getBiostatEmployees: builder.query<EmployeeResponse[], void>({
      query: () => ({
        url: "/employees",
        params: { role: "BIOSTATISTICIAN" },
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    getTechnicalEmployees: builder.query<EmployeeResponse[], void>({
      query: () => ({
        url: "/employees",
        params: { role: "TECHNICAL" },
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    getSalesEmployeeDetails: builder.query<
      SalesEmployeeDetailsResponse,
      { employeeId: string; startDate: string; endDate: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: `/employees/${employeeId}/details`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Employees"],
    }),
    getResearcherEmployeeDetails: builder.query<
      ResearcherEmployeeDetailsResponse,
      { employeeId: string; startDate: string; endDate: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: `/employees/${employeeId}/details`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Employees"],
    }),
    getEditorEmployeeDetails: builder.query<
      EditorOrTechnicalEmployeeDetailsResponse,
      { employeeId: string; startDate: string; endDate: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: `/employees/${employeeId}/details`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Employees"],
    }),
    getBiostatEmployeeDetails: builder.query<
      EditorOrTechnicalEmployeeDetailsResponse,
      { employeeId: string; startDate: string; endDate: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: `/employees/${employeeId}/details`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Employees"],
    }),
    getTechnicalEmployeeDetails: builder.query<
      EditorOrTechnicalEmployeeDetailsResponse,
      { employeeId: string; startDate: string; endDate: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: `/employees/${employeeId}/details`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Employees"],
    }),
    getEmployeeClosedProjects: builder.query<
      EmployeeProject[],
      { employeeId: string }
    >({
      query: ({ employeeId }) => ({
        url: `/employees/${employeeId}/projects`,
        method: "GET",
        params: { status: "CLOSED" },
      }),
      providesTags: ["Projects"],
    }),
    getEmployeeInProgressProjects: builder.query<
      EmployeeProject[],
      { employeeId: string }
    >({
      query: ({ employeeId }) => ({
        url: `/employees/${employeeId}/projects`,
        method: "GET",
        params: { status: "IN_PROGRESS" },
      }),
      providesTags: ["Projects"],
    }),
    getAllEmployees: builder.query<EmployeeResponse[], void>({
      query: () => ({
        url: "/employees",
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    assignProject: builder.mutation<
      AssignProjectResponse,
      { managerId: string; projectId: string; assignData: AssignProjectRequest }
    >({
      query: ({ managerId, projectId, assignData }) => ({
        url: `/manager/${managerId}/projects/${projectId}/assign`,
        method: "PUT",
        body: assignData,
      }),
      invalidatesTags: ["Projects"],
    }),
  }),
});

export const {
  useGetManagerProjectStatsQuery,
  useGetRolesQuery,
  useCreateEmployeeMutation,
  useGetApprovedProjectsQuery,
  useGetApprovedFastTrackProjectsQuery,
  useGetProjectsRevenueQuery,
  useGetUnapprovedFastTrackProjectsQuery,
  useGetUnapprovedRegularProjectsQuery,
  useGetProjectDetailsQuery,
  useGetProjectFilesQuery,
  useGetProjectNotesQuery,
  useGetProjectMilestonesQuery,
  useGetProjectPaymentsQuery,
  useFetchGroupChatsQuery,
  useFetchChatMessagesQuery,
  useFetchChatFilesQuery, // Added
  useUploadChatFileMutation, // Added
  useGetSalesEmployeesQuery,
  useGetResearcherEmployeesQuery,
  useGetEditorEmployeesQuery,
  useGetBiostatEmployeesQuery,
  useGetTechnicalEmployeesQuery,
  useGetSalesEmployeeDetailsQuery,
  useGetResearcherEmployeeDetailsQuery,
  useGetEditorEmployeeDetailsQuery,
  useGetBiostatEmployeeDetailsQuery,
  useGetTechnicalEmployeeDetailsQuery,
  useGetEmployeeClosedProjectsQuery,
  useGetEmployeeInProgressProjectsQuery,
  useGetAllEmployeesQuery,
  useAssignProjectMutation,
} = managerApiSlice;
