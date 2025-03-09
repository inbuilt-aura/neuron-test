export type ProjectCategory = "totalclient" | "quote" | "fasttrack" | "forward";

export interface Stat {
  id: ProjectCategory;
  name: string;
  value: string;
  route: ProjectCategory;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  id?: number;
}

export interface Project {
  id: number;
  name: string;
  edd: string | null;
  startDate: string | null;
  researcherId: number | null;
  clientId: number;
  salesId: number;
  managerId: number;
  cost: number;
  requirements: string;
  paymentTillDate: number;
  status: string;
  projectType: string;
  approved: boolean;
  createdAt: string;
  modifiedAt: string;
  quote_id: number;
  Sales: ClientInfo;
  Client: ClientInfo;
  Manager: ClientInfo;
  Researcher?: ClientInfo;
  quote: {
    id: number;
    amount: number;
    status: string;
    requirement: string | null;
    createdAt: string;
    modifiedAt: string;
    Client: ClientInfo;
    Researcher?: ClientInfo;
  };
}

export interface ForwardProject {
  id: number;
  name: string;
  Client: ClientInfo;
  receivedDate: string;
  pendingDays: number;
  assignedTo: string;
  projectType: string;
  managerId: string;
  edd: string;
  researcherId: string | null; 
  createdAt: string; 
  Researcher?: ClientInfo;
}

export interface QuoteProject {
  id: number;
  name: string;
  requirements: string;
  edd: string;
  quote: {
    amount: string;
  };
  status?: string;
  Client: ClientInfo;
  Researcher?: ClientInfo;
  createdAt: string; 
}


export interface FastTrackProject {
  id: number;
  name: string;
  Client: ClientInfo;
  startDate: string;
  edd: string;
  status: string;
  projectType: string;
  researcherId: string | null; 
  createdAt: string; 
  Researcher?: ClientInfo;
}

export const stats: Stat[] = [
  {
    id: "totalclient",
    name: "Total Clients",
    value: "132",
    route: "totalclient",
  },
  { id: "quote", name: "Addition in Quote", value: "09", route: "quote" },
  {
    id: "fasttrack",
    name: "Fast Track Project",
    value: "112",
    route: "fasttrack",
  },
  { id: "forward", name: "Yet To Forward", value: "13", route: "forward" },
];

