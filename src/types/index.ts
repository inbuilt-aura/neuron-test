import type { store } from "../store/store"

export interface User {
  id: string
  name: string
  email: string
  empid: string
  firstName: string
  lastName: string
  profilePic: string | null
   userType: "CLIENT" | "EMPLOYEE"
  role: "SALES" | "CLIENT" | "MANAGER" | "RESEARCHER" | "BIOSTATISTICIAN" | "EDITOR" | "TECHNICAL"
}

export interface Client {
  userId: number
  firstName: string
  lastName: string
  email: string
  countryCode: number
  mobileNumber: string
  salesPersonId: number
  profilePic?: string

  SalesPerson: {
    firstName: string
    lastName: string
    email: string
    userId: number
  }
}

export interface ChatLead {
  type: "personal"
  participants: Participant[]
  created: string
  modified: string
  last_message: Message
  id: string
}

export interface Participant {
  user: User
  ref_id: number
  _id: string
  last_viewed?: string
}

export interface Message {
  msg_type: "text"
  msg_params: {
    text: string
  }
  sent_by: Participant
  created: string
  id: string
}

export interface GroupChat {
  id: string
  name: string
  type: "public"
  participants: Participant[]
  created: string
  modified: string
  project_id: number
  last_message: Message
}

export interface ChatMessage extends Message {
  type: "personal" | "public"
  ref_id: string
  status: "delivered"
  modified: string
}

export interface UserInfo {
  firstName: string
  lastName: string
  email: string
  id: number
  empid: string
}

export interface ProjectDetails {
  id: number
  name: string
  edd: string | null
  startDate: string | null
  researcherId: number | null
  clientId: number
  salesId: number
  managerId: number
  cost: number
  requirements: string
  paymentTillDate: number
  deskId: number | null
  status: string
  projectType: string
  projectServiceTypeId: number | null
  approved: boolean
  createdAt: string
  modifiedAt: string
  quote_id: number
  Sales: UserInfo
  Client: UserInfo
  Manager: UserInfo
  Researcher: UserInfo | null
  SeriviceType: null
  quote: {
    id: number
    amount: number
    status: string
    requirement: string | null
    createdAt: string
    modifiedAt: string
  }
}

export interface Milestone {
  id: number
  description: string
  dueDate: string
  status: "NEW" | "COMPLETED"
  createdAt: string
  AddedBy: User
  AssignedTo: User
}

export interface MilestoneResponse {
  start_date: string
  end_date: string
  milestones: Milestone[]
}

export interface MilestonesSectionProps {
  projectEdd: string
  projectCreatedAt: string
  milestones: Milestone[]
}

export interface Payment {
  id: number
  amount: number
  projectId: number
  addedById: number
  completed: boolean
  clientId: number
  paymentDate: string
  createdAt: string
  modifiedAt: string
  nextId: number | null
  Project: {
    id: number
    name: string
  }
  Client: {
    userId: number
    User: {
      firstName: string
      lastName: string
      profilePic: string
    }
  }
  AddedBy: {
    firstName: string
    email: string
    lastName: string
    id: number
    profilePic: string
    designation: string
  }
  Next: {
    amount: number
    paymentDate: string
    completed: boolean
    id: number
  } | null
}

export interface PaymentDetails {
  id: number
  amount: number
  projectId: number
  addedById: number
  completed: boolean
  clientId: number
  paymentDate: string
  createdAt: string
  modifiedAt: string
  nextId: number | null
  AddedBy: {
    firstName: string
    email: string
    lastName: string
    id: number
    designation: string
  }
  Next: {
    amount: number
    paymentDate: string
    completed: boolean
    id: number
  } | null
}

export interface CreatePaymentRequest {
  amount: number
  nextPaymentDate: string
  nextPaymentAmount: number
  completed: boolean
}

export interface ProjectFormData {
  clientId: number
  name: string
  projectType: string
  cost: number
  requirements: string
}

export interface ProjectApiRequest {
  userId: string
  clientId: string
  name: string
  email: string
  contact: string
  projectType: string
  cost: number
  requirements: string
}

export interface Project {
  id: string
  clientId: string
  name: string
  email: string
  contact: string
  projectType: string
  cost: number
  requirements: string
  createdAt: string
  updatedAt: string
  status: string
}

export interface Country {
  value: string
  label: string
  code: string
  flag: string
}

export interface LeadFormData {
  email?: string
  firstName: string
  lastName: string
  mobileNumber: string
  country?: string
  requirements: string
  projectServiceTypeId: number
}

export interface PaymentFormData {
  client: string
  project: string
  amount: number
  nextPayment: {
    date: string
    amount: number
  }
}

export interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => void
}

export interface Service {
  id: number
  name: string
  shortName: string
}

export interface Lead {
  id: number
  firstName: string
  lastName: string
  countryCode: string
  mobileNumber: string
  requirements: string
  status: boolean
  followUpDate: string
  clientProfilePic: string | null
  email: string
  createdAt: string
  modifiedAt: string
  salesPersonId: number
  projectServiceTypeId: number | null
  SalesPerson: {
    firstName: string
    lastName: string
    email: string
    userId: number
  }
  SeriviceType: {
    id: number
    name: string
    shortName: string
  } | null
}

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  userType: string
  isVerified: boolean
  profilePic: string
  userId: number
  age: number
  address: string
  aadharNumber: string
  gender: string
  designation: string
  empid: string
  Client?: null // Make Client optional
}

export interface AddQuoteRequest {
  userId: string
  projectId: number
  amount: number
  requirement: string
}

export interface UpdateQuoteRequest {
  userId: string
  projectId: number
  amount: number
}

export interface QuoteResponse {
  id: number
  amount: number
  status: string
  requirement: string
  createdAt: string
  modifiedAt: string
}

export interface Note {
  id: number
  note: string
  projectId: number
  createdBy: number
  createdAt: string
  modifiedAt: string
  CreatedBy: {
    User: {
      firstName: string
      email: string
      lastName: string
      id: number
    }
    designation: string
  }
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

