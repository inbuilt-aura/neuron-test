"use client";
import { useRouter } from "next/navigation";
import type React from "react";

import { useState, useMemo, useEffect } from "react";
import { BellRing, HelpCircle, Search, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CreateProjectModal } from "./create-project-model";
import { toast } from "react-hot-toast";
import type {
  Project,
  QuoteProject,
  FastTrackProject,
  ForwardProject,
  ProjectCategory,
} from "../../../components/data/data";
import {
  useProjectStats,
  type Stat,
} from "../../../components/sale/project/projectStat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddNoteModal } from "@/src/components/reuse_components/add_note";
import { UpdateQuoteModal } from "@/src/components/reuse_components/update_quote";
import { AddQuoteModal } from "@/src/components/reuse_components/add_quote";
import { ProjectDetails } from "@/src/components/reuse_components/project_detail";
// import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import { useAddNoteMutation } from "@/src/store/sales/salesApiSlice";
import { AddPayment } from "@/src/components/sale/payment/addPayment";
import {
  useFetchProjectsForTableQuery,
  useFetchForwardProjectsQuery,
  useFetchFastTrackProjectsQuery,
  useFetchUpdatedQuoteProjectsQuery,
  useForwardToManagerMutation,
} from "@/src/store/sales/salesApiSlice";
import { format } from "date-fns";
import { useGetUserProfileQuery } from "@/src/store/apiSlice";
// import { useProjectStats, type Stat } from "../hooks/useProjectStats"

type TableConfig<T> = {
  headers: string[];
  data: T[];
};

type ApiError = {
  status: number;
  data: {
    code: number;
    message: string;
  };
};
const tableConfigs: Record<
  string,
  TableConfig<Project | QuoteProject | FastTrackProject | ForwardProject>
> = {
  totalclient: {
    headers: [
      "Sr. No.",
      "Project Name",
      "EDD",
      "Client Name",
      "Researcher Allotted",
      "Start Date",
      "Action",
    ],
    data: [],
  },
  quote: {
    headers: [
      "Sr. No.",
      "Project Name",
      "New Requirement",
      "Current EDD",
      "New Quote",
      "Action",
    ],
    data: [],
  },
  fasttrack: {
    headers: [
      "Sr. No.",
      "Project Name",
      "EDD",
      "Client Name",
      "Researcher Alloted",
      "Start Date",
      "Action",
    ],
    data: [],
  },
  forward: {
    headers: [
      "Sr. No.",
      "Project Name",
      // "EDD",
      "Client Name",
      // "Researcher Alloted",
      "Start Date",
      "Action",
    ],
    data: [],
  },
};

export default function ProjectPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory>("totalclient");
  const userId = useSelector((state: RootState) => state.auth.user?.id) ?? "";
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isUpdateQuoteOpen, setIsUpdateQuoteOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedQuoteProjectId, setSelectedQuoteProjectId] =
    useState<number>();
  const [projectTypeFilter, setProjectTypeFilter] = useState<
    "simple" | "fasttrack"
  >("simple");
  const [selectedNoteProjectId, setSelectedNoteProjectId] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [isLoading, setIsLoading] = useState(true);
  const [addNote] = useAddNoteMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isChangingProjectType, setIsChangingProjectType] = useState(false);

  const tableConfig = tableConfigs[selectedCategory];

  const [forwardToManager] = useForwardToManagerMutation();
  const [isForwarding, setIsForwarding] = useState(false);

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    refetch: refetchProjects,
  } = useFetchProjectsForTableQuery(userId);
  const {
    data: forwardProjects = [],
    isLoading: isForwardProjectsLoading,
    refetch: refetchForwardProjects,
  } = useFetchForwardProjectsQuery(
    {
      userId,
      projectType: projectTypeFilter === "simple" ? "REGULAR" : "FAST_TRACK",
    },
    {
      skip: selectedCategory !== "forward",
    }
  );
  const { data: fastTrackProjects = [], isLoading: isFastTrackLoading } =
    useFetchFastTrackProjectsQuery(userId, {
      skip: selectedCategory !== "fasttrack",
    });
  const { data: updatedQuoteProjects = [], isLoading: isUpdatedQuoteLoading } =
    useFetchUpdatedQuoteProjectsQuery(userId, {
      skip: selectedCategory !== "quote",
    });
  const { data: userProfile, error } = useGetUserProfileQuery();
  const [currentTime, setCurrentTime] = useState(new Date());
  // set username
  const [userName, setUserName] = useState<string>("");
  const empid =
    useSelector((state: RootState) => state.auth.user?.empid) ?? "N/A";
  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.firstName);
    }
  }, [userProfile]);

  // Type guard function to check if the error is of type ApiError
  function isApiError(error: unknown): error is ApiError {
    return (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as ApiError).status === "number" &&
      "data" in error &&
      typeof (error as ApiError).data === "object" &&
      "message" in (error as ApiError).data &&
      typeof (error as ApiError).data.message === "string"
    );
  }

  const handleForwardToManager = async (projectId: string) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }
    setIsForwarding(true);
    try {
      const result = await forwardToManager({
        userId,
        projectId,
        managerId: "6", // Hardcoded manager ID as requested
      }).unwrap();

      // The success case
      toast.success(result.message);

      // Refetch the projects data and stats
      refetchProjects();
      refetchForwardProjects();
      refetchStats();
    } catch (error) {
      console.error("Error forwarding project:", error);
      if (isApiError(error)) {
        if (error.status === 400 || error.status === 500) {
          toast.error(
            error.data.message ||
              "Either the project quote is not approved or the project status is invalid"
          );
        } else {
          toast.error("An error occurred while forwarding the project");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsForwarding(false);
    }
  };
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch user profile. Please try again later.");
    }
  }, [error]);

  //show real-time timing
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLoading(
      isProjectsLoading ||
        isForwardProjectsLoading ||
        isFastTrackLoading ||
        isUpdatedQuoteLoading ||
        isChangingProjectType
    );
  }, [
    isProjectsLoading,
    isForwardProjectsLoading,
    isFastTrackLoading,
    isUpdatedQuoteLoading,
    isChangingProjectType,
  ]);

  // const stats = useProjectStats();
  const { stats, refetch: refetchStats } = useProjectStats();
  // const queryClient = useQueryClient() // Add useQueryClient hook

  // Memoize and filter data based on selected category and filters
  const filteredData = useMemo(() => {
    let data;
    if (selectedCategory === "quote") {
      data = updatedQuoteProjects;
    } else if (selectedCategory === "fasttrack") {
      data = fastTrackProjects;
    } else if (selectedCategory === "forward") {
      data = forwardProjects;
    } else {
      data = projects;
    }

    const filtered = data.filter(
      (project: Project | QuoteProject | FastTrackProject | ForwardProject) => {
        const projectName = project.name.toLowerCase();
        const clientName =
          `${project.Client.firstName} ${project.Client.lastName}`.toLowerCase();
        const query = searchQuery.toLowerCase();

        return projectName.includes(query) || clientName.includes(query);
      }
    );

    // Sort by date in reverse chronological order
    return filtered.sort(
      (
        a: Project | QuoteProject | FastTrackProject | ForwardProject,
        b: Project | QuoteProject | FastTrackProject | ForwardProject
      ) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      }
    );
  }, [
    selectedCategory,
    projects,
    forwardProjects,
    fastTrackProjects,
    updatedQuoteProjects,
    searchQuery,
  ]);

  // Update the tableConfig with filtered data
  useEffect(() => {
    tableConfigs.totalclient.data = filteredData; // Update data for totalclient
    tableConfigs.quote.data = filteredData.filter(
      (project: QuoteProject) => project.status === "IN_PROGRESS"
    ); // Update data for quote
    tableConfigs.fasttrack.data = filteredData.filter(
      (project: FastTrackProject) => project.projectType === "FAST_TRACK"
    ); // Update data for fasttrack
    tableConfigs.forward.data = filteredData.filter(
      (project: ForwardProject) => project.managerId === null
    ); // Update data for forward
  }, [filteredData]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openCreateProject = () => setIsCreateProjectOpen(true);
  const closeCreateProject = () => setIsCreateProjectOpen(false);

  const handleCreateProject = () => {
    toast.success("Project created successfully!");
    closeCreateProject();
    // Refetch the projects data and stats
    refetchProjects();
    refetchForwardProjects();
    refetchStats();
  };
  const handleChatClick = () => {
    router.push("/sale/communication");
  };
  const handleAddNote = async (note: string) => {
    if (!selectedNoteProjectId) {
      toast.error("No project selected.");
      return;
    }
    try {
      const response = await addNote({
        userId,
        projectId: selectedNoteProjectId,
        note,
      }).unwrap();

      console.log("response", response);

      if (response) {
        toast.success("Note Added successfully!");
        setIsAddNoteOpen(false);
        refetchStats(); // Refetch stats after adding a note
      } else {
        toast.error("Failed to Add Note");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuoteAdded = (success: boolean) => {
    if (success) {
      toast.success("Quote added successfully");
      setIsQuoteOpen(false);
      refetchStats(); // Refetch stats after adding a quote
    } else {
      toast.error("Failed to add quote");
    }
  };

  const handleQuoteUpdated = (success: boolean) => {
    if (success) {
      toast.success("Quote updated successfully");
      setIsUpdateQuoteOpen(false);
      refetchStats(); // Refetch stats after updating a quote
    } else {
      toast.error("Failed to update quote");
    }
  };

  if (selectedProjectId) {
    return (
      <ProjectDetails
        id={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  const handleAddPayment = (success: boolean) => {
    if (success) {
      toast.success("Payment Added Successfully.");
      refetchStats(); // Refetch stats after adding a payment
    } else {
      toast.error("Payment Failed to Add.");
    }
  };

  // Function to format date as DD/MM/YY
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : format(date, "dd/MM/yy");
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleProjectTypeChange = (type: "simple" | "fasttrack") => {
    setIsChangingProjectType(true);
    setProjectTypeFilter(type);
    // Simulate a delay to show loading state
    setTimeout(() => setIsChangingProjectType(false), 500);
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mt-2">
            <h1 className="text-xl font-semibold mt-4">
              Welcome Back 👋{userName.toUpperCase()}
            </h1>
            <h1 className="mt-2 text-sm font-normal text-[#716F6F]">
              Employee ID : {empid} • Time : {format(currentTime, "h:mm a")}
              {/* Employee ID : 020203 • */}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#ECF1F4] rounded-lg p-2"
          >
            <BellRing className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#ECF1F4] rounded-lg p-2"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <Button
          onClick={openCreateProject}
          className="bg-[#0B4776] hover:bg-[#004B7F]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {stats.map((stat: Stat) => (
          <div
            key={stat.id}
            onClick={() => setSelectedCategory(stat.route)}
            className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-all
              ${
                selectedCategory === stat.route
                  ? "border-[3px] border-[#CEE9FF] bg-white"
                  : ""
              }
            `}
          >
            <div className="text-sm font-medium text-[#57595B]">
              {stat.name}
            </div>
            <div className="mt-1 text-4xl font-medium">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 sm:-mr-4">
        <div className="relative w-full md:w-[25rem] ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#8C8E90]" />
          <Input
            placeholder="Search by project or client name"
            className="pl-10 w-full bg-[#FFFFFF] border-[1px] border-[#E0E0E0]"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {selectedCategory === "forward" && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-[#F4F4F5] p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleProjectTypeChange("simple")}
              className={`rounded-md text-sm font-medium ${
                projectTypeFilter === "simple"
                  ? "bg-white text-[#09090B]"
                  : "bg-[#F4F5F6] text-[#71717A] hover:bg-white/50"
              }`}
            >
              Simple Project
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleProjectTypeChange("fasttrack")}
              className={`rounded-md text-sm font-medium ${
                projectTypeFilter === "fasttrack"
                  ? "bg-white text-[#09090B]"
                  : "bg-[#F4F5F6] text-[#71717A] hover:bg-white/50"
              }`}
            >
              Fast Track Project
            </Button>
          </div>
        </div>
      )}

      <Card className="mt-4">
        <Table>
          <TableHeader className="bg-[#F9F9FD]">
            <TableRow>
              {tableConfig.headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isLoading || isChangingProjectType ? (
              <TableRow>
                <TableCell
                  colSpan={tableConfig.headers.length}
                  className="text-center py-4"
                >
                  {selectedCategory === "fasttrack"
                    ? "Loading Fast Track Projects..."
                    : selectedCategory === "forward" &&
                      projectTypeFilter === "simple"
                    ? "Loading Simple Projects..."
                    : selectedCategory === "forward" &&
                      projectTypeFilter === "fasttrack"
                    ? "Loading Fast Track Projects..."
                    : isChangingProjectType
                    ? `Loading ${
                        projectTypeFilter === "simple" ? "Simple" : "Fast Track"
                      } Projects...`
                    : "Loading..."}
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableConfig.headers.length}
                  className="text-center py-4"
                >
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(
                (
                  row:
                    | Project
                    | QuoteProject
                    | FastTrackProject
                    | ForwardProject,
                  index: number
                ) => (
                  <TableRow key={row.id}>
                    <TableCell className="pl-4">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {row.name}
                    </TableCell>
                    {selectedCategory === "totalclient" && (
                      <>
                        <TableCell>
                          <span className="rounded-xl bg-[#EA343433] bg-opacity-20 px-2 py-1 text-xs font-medium text-[#EA3434]">
                            {row.edd ? formatDate(row.edd) : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                              {row.Client.firstName[0]}
                            </div>
                            {row.Client.firstName} {row.Client.lastName}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-[#716F6F]">
                          {row.Researcher
                            ? `${row.Researcher.firstName} ${row.Researcher.lastName}`
                            : "No Researcher"}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-xl bg-[#F1F8FF] px-2 py-1 text-xs font-medium text-[#3B86F2]">
                            {formatDate(row.createdAt)}
                          </span>
                        </TableCell>
                      </>
                    )}
                    {selectedCategory === "quote" && (
                      <>
                        <TableCell>
                          {(row as QuoteProject).requirements}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-xl bg-[#EA343433] bg-opacity-20 px-2 py-1 text-xs font-medium text-[#EA3434]">
                            {formatDate((row as QuoteProject).edd)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {(row as QuoteProject).quote.amount}
                        </TableCell>
                      </>
                    )}
                    {selectedCategory === "fasttrack" && (
                      <>
                        <TableCell>
                          <span className="rounded-xl bg-[#EA343433] bg-opacity-20 px-2 py-1 text-xs font-medium text-[#EA3434]">
                            {formatDate((row as FastTrackProject).edd)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                              {(row as FastTrackProject).Client.firstName[0]}
                            </div>
                            {(row as FastTrackProject).Client.firstName}{" "}
                            {(row as FastTrackProject).Client.lastName}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-[#716F6F]">
                          {(row as FastTrackProject).researcherId ||
                            "No Researcher"}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-xl bg-[#F1F8FF] px-2 py-1 text-xs font-medium text-[#3B86F2]">
                            {formatDate((row as FastTrackProject).createdAt)}
                          </span>
                        </TableCell>
                      </>
                    )}
                    {selectedCategory === "forward" && (
                      <>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                              {(row as ForwardProject).Client.firstName[0]}
                            </div>
                            {(row as ForwardProject).Client.firstName}{" "}
                            {(row as ForwardProject).Client.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="rounded-xl bg-[#F1F8FF] px-2 py-1 text-xs font-medium text-[#3B86F2]">
                            {formatDate((row as ForwardProject).createdAt)}
                          </span>
                        </TableCell>
                      </>
                    )}

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#F4F3FF]"
                            onClick={() =>
                              setSelectedProjectId(row.id.toString())
                            }
                          >
                            View Project Details
                          </DropdownMenuItem>
                          {selectedCategory === "quote" && (
                            <>
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#F4F3FF]"
                                onClick={() => {
                                  setIsQuoteOpen(true);
                                  setSelectedQuoteProjectId(Number(row.id));
                                }}
                              >
                                Add Quote Amount
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#F4F3FF]"
                                onClick={() => {
                                  setIsUpdateQuoteOpen(true);
                                  setSelectedQuoteProjectId(Number(row.id));
                                }}
                              >
                                Update Quote Amount
                              </DropdownMenuItem>
                            </>
                          )}
                          {selectedCategory === "forward" && (
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#F4F3FF]"
                              onClick={() =>
                                handleForwardToManager(row.id.toString())
                              }
                              disabled={isForwarding}
                            >
                              {isForwarding
                                ? "Forwarding..."
                                : "Forward to Manager"}
                            </DropdownMenuItem>
                          )}
                          {selectedCategory == "totalclient" && (
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#F4F3FF]"
                              onClick={() => setIsPaymentOpen(true)}
                            >
                              Add Payment
                            </DropdownMenuItem>
                          )}
                          {selectedCategory == "totalclient" && (
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#F4F3FF]"
                              onClick={() => {
                                setIsAddNoteOpen(true);
                                setSelectedNoteProjectId(row.id.toString());
                              }}
                            >
                              Add Note
                            </DropdownMenuItem>
                          )}
                          {selectedCategory !== "totalclient" && (
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#F4F3FF]"
                              onClick={handleChatClick}
                            >
                              Chat
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </Card>
      <div className="border-[1px] border-[#E2E8F0] mt-2 rounded-lg">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            className="text-sm font-medium border-[1px] border-[#E0E0E0]"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm font-medium text-black">
            Page {currentPage} of{" "}
            {Math.ceil(filteredData.length / itemsPerPage)}
          </div>
          <Button
            variant="outline"
            className="text-sm font-medium border-[1px] border-[#E0E0E0]"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(Math.ceil(filteredData.length / itemsPerPage), p + 1)
              )
            }
            disabled={
              currentPage === Math.ceil(filteredData.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={closeCreateProject}
        onSubmit={handleCreateProject}
        userId={userId}
      />
      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onSubmit={handleAddNote}
        // userId={userId}
        // projectId={selectedNoteProjectId as string}
      />
      <AddQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        userId={userId}
        projectId={selectedQuoteProjectId as number}
        onQuoteAdded={handleQuoteAdded}
      />

      <UpdateQuoteModal
        isOpen={isUpdateQuoteOpen}
        onClose={() => setIsUpdateQuoteOpen(false)}
        userId={userId}
        projectId={selectedQuoteProjectId as number}
        onQuoteUpdated={handleQuoteUpdated}
      />

      <AddPayment
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSubmit={handleAddPayment}
      />
    </div>
  );
}
