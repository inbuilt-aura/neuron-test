// components/ManagerTable.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  useGetApprovedProjectsQuery,
  useGetApprovedFastTrackProjectsQuery,
  useGetProjectsRevenueQuery,
  useGetUnapprovedFastTrackProjectsQuery,
  useGetUnapprovedRegularProjectsQuery,
  useGetManagerProjectStatsQuery,
} from "@/src/store/manager/managerApiSlice";
import type { Project, Revenue } from "@/src/store/manager/managerApiSlice";
import { AssignProjectDialog } from "./Asign-project";

type MetricKeys =
  | "Assigned Projects"
  | "Fast Track Projects"
  | "Revenue"
  | "Yet To Assign";

interface ManagerTableProps {
  selectedMetric: MetricKeys;
  managerId: string;
  searchQuery: string;
  onStatsUpdated?: () => void;
}

export function ManagerTable({
  selectedMetric,
  managerId,
  searchQuery,
  onStatsUpdated,
}: ManagerTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [projectTypeFilter, setProjectTypeFilter] = useState<
    "simple" | "fasttrack"
  >("simple");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const itemsPerPage = 5;

  // Get stats for refetching
  const { refetch: refetchStats } = useGetManagerProjectStatsQuery(managerId);

  // Reset pagination when metric changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMetric]);

  // API queries for different metrics
  const {
    data: approvedProjects = [],
    isLoading: isApprovedLoading,
    error: approvedError,
    refetch: refetchApprovedProjects,
  } = useGetApprovedProjectsQuery(managerId, {
    skip: selectedMetric !== "Assigned Projects",
  });

  const {
    data: fastTrackProjects = [],
    isLoading: isFastTrackLoading,
    error: fastTrackError,
    refetch: refetchFastTrackProjects,
  } = useGetApprovedFastTrackProjectsQuery(managerId, {
    skip: selectedMetric !== "Fast Track Projects",
  });

  const {
    data: revenueData = [],
    isLoading: isRevenueLoading,
    error: revenueError,
    refetch: refetchRevenue,
  } = useGetProjectsRevenueQuery(managerId, {
    skip: selectedMetric !== "Revenue",
  });

  const {
    data: unapprovedFastTrackProjects = [],
    isLoading: isUnapprovedFastTrackLoading,
    error: unapprovedFastTrackError,
    refetch: refetchUnapprovedFastTrack,
  } = useGetUnapprovedFastTrackProjectsQuery(managerId, {
    skip: !(
      selectedMetric === "Yet To Assign" && projectTypeFilter === "fasttrack"
    ),
  });

  const {
    data: unapprovedRegularProjects = [],
    isLoading: isUnapprovedRegularLoading,
    error: unapprovedRegularError,
    refetch: refetchUnapprovedRegular,
  } = useGetUnapprovedRegularProjectsQuery(managerId, {
    skip: !(
      selectedMetric === "Yet To Assign" && projectTypeFilter === "simple"
    ),
  });

  // Handle API errors
  useEffect(() => {
    if (approvedError && selectedMetric === "Assigned Projects") {
      toast.error("Failed to fetch approved projects");
    }
    if (fastTrackError && selectedMetric === "Fast Track Projects") {
      toast.error("Failed to fetch fast track projects");
    }
    if (revenueError && selectedMetric === "Revenue") {
      toast.error("Failed to fetch revenue data");
    }
    if (
      unapprovedFastTrackError &&
      selectedMetric === "Yet To Assign" &&
      projectTypeFilter === "fasttrack"
    ) {
      toast.error("Failed to fetch unapproved fast track projects");
    }
    if (
      unapprovedRegularError &&
      selectedMetric === "Yet To Assign" &&
      projectTypeFilter === "simple"
    ) {
      toast.error("Failed to fetch unapproved regular projects");
    }
  }, [
    approvedError,
    fastTrackError,
    revenueError,
    unapprovedFastTrackError,
    unapprovedRegularError,
    selectedMetric,
    projectTypeFilter,
  ]);

  // Function to refetch all data
  const refetchAllData = async (): Promise<void> => {
    try {
      // Use Promise.allSettled to handle each refetch independently
      const results = await Promise.allSettled([
        refetchStats(),
        refetchApprovedProjects(),
        refetchFastTrackProjects(),
        refetchRevenue(),
        refetchUnapprovedFastTrack(),
        refetchUnapprovedRegular(),
      ]);

      // Check if any refetch failed
      const failedRefetches = results.filter(
        (result) => result.status === "rejected"
      );
      if (failedRefetches.length > 0) {
        console.error("Some refetch operations failed:", failedRefetches);
        // Optionally, you can log the specific errors for debugging
        failedRefetches.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Refetch ${index} failed:`, result.reason);
          }
        });

        // toast.error("Failed to refresh some data");
      }

      if (onStatsUpdated) {
        onStatsUpdated();
      }

      // toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Unexpected error during refetch:", error);

      // toast.error("Failed to refresh data");
    }
  };

  // Determine loading state
  const isLoading = useMemo(() => {
    if (selectedMetric === "Assigned Projects") return isApprovedLoading;
    if (selectedMetric === "Fast Track Projects") return isFastTrackLoading;
    if (selectedMetric === "Revenue") return isRevenueLoading;
    if (selectedMetric === "Yet To Assign") {
      return projectTypeFilter === "fasttrack"
        ? isUnapprovedFastTrackLoading
        : isUnapprovedRegularLoading;
    }
    return false;
  }, [
    selectedMetric,
    projectTypeFilter,
    isApprovedLoading,
    isFastTrackLoading,
    isRevenueLoading,
    isUnapprovedFastTrackLoading,
    isUnapprovedRegularLoading,
  ]);

  // Get table headers based on selected metric
  const getTableHeaders = (): string[] => {
    switch (selectedMetric) {
      case "Assigned Projects":
      case "Fast Track Projects":
        return [
          "Sr. No.",
          "Name",
          "Allotted Team Member",
          "Requirement",
          "Latest EDD",
          "Action",
        ];
      case "Revenue":
        return [
          "Sr. No.",
          "Sales Person",
          "Revenue In Pipeline",
          "Average Revenue Per Project",
          "Total Projects",
          "Action",
        ];
      case "Yet To Assign":
        return [
          "Sr. No.",
          "Name",
          "Sales Representative",
          "Requirement",
          "Total Payment",
          "Action",
        ];
      default:
        return ["Sr. No.", "Name", "Action"];
    }
  };

  // Get filtered data based on selected metric and search query
  const filteredData = useMemo(() => {
    let data: (Project | Revenue)[] = [];

    if (selectedMetric === "Assigned Projects") {
      data = approvedProjects;
    } else if (selectedMetric === "Fast Track Projects") {
      data = fastTrackProjects;
    } else if (selectedMetric === "Revenue") {
      data = revenueData;
    } else if (selectedMetric === "Yet To Assign") {
      data =
        projectTypeFilter === "fasttrack"
          ? unapprovedFastTrackProjects
          : unapprovedRegularProjects;
    }

    // Apply search filter
    if (searchQuery && data.length > 0) {
      return data.filter((item) => {
        if (selectedMetric === "Revenue") {
          const revenueItem = item as Revenue;
          const fullName =
            `${revenueItem.sales.firstName} ${revenueItem.sales.lastName}`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase());
        } else {
          const projectItem = item as Project;
          const name = projectItem.name?.toLowerCase() || "";
          const requirements = projectItem.requirements?.toLowerCase() || "";
          const query = searchQuery.toLowerCase();
          return name.includes(query) || requirements.includes(query);
        }
      });
    }

    return data;
  }, [
    selectedMetric,
    projectTypeFilter,
    searchQuery,
    approvedProjects,
    fastTrackProjects,
    revenueData,
    unapprovedFastTrackProjects,
    unapprovedRegularProjects,
  ]);

  // Paginate the data
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredData, currentPage, itemsPerPage]);

  // Format date helper
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yy");
    } catch {
      return "Invalid Date";
    }
  };

  // Handle assign project - Open the dialog
  const handleAssignProject = (projectId: number): void => {
    setSelectedProjectId(projectId.toString());
    setIsAssignDialogOpen(true);
  };

  // Handle navigation to employee details
  const handleEmployeeClick = (id: number) => {
    router.push(`/manager/team-overview/${id}`);
  };

  // Type guard to check if item is Revenue
  const isRevenue = (item: Project | Revenue): item is Revenue => {
    return (
      "pipeline" in item && "avg" in item && "count" in item && "sales" in item
    );
  };

  // Type guard to check if item is Project
  const isProject = (item: Project | Revenue): item is Project => {
    return !isRevenue(item);
  };

  // Function to handle navigation to project details
  const handleViewProjectDetails = (projectId: string) => {
    router.push(`/manager/projects/${projectId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {selectedMetric === "Yet To Assign" && (
          <div className="flex items-center space-x-2 bg-[#F4F4F5] p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProjectTypeFilter("simple")}
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
              onClick={() => setProjectTypeFilter("fasttrack")}
              className={`rounded-md text-sm font-medium ${
                projectTypeFilter === "fasttrack"
                  ? "bg-white text-[#09090B]"
                  : "bg-[#F4F5F6] text-[#71717A] hover:bg-white/50"
              }`}
            >
              Fast Track Project
            </Button>
          </div>
        )}

        <Button variant="outline" onClick={refetchAllData} className="ml-auto">
          Refresh Data
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader className="bg-[#F9F9FD]">
            <TableRow>
              {getTableHeaders().map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={getTableHeaders().length}
                  className="text-center py-4"
                >
                  Loading data...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={getTableHeaders().length}
                  className="text-center py-4"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={isProject(item) ? item.id : `revenue-${index}`}>
                  <TableCell className="pl-4">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {isRevenue(item) ? (
                    // Revenue table cells
                    <>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                            {item.sales.firstName[0]}
                          </div>
                          {item.sales.firstName} {item.sales.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-xl bg-[#F1F8FF] px-2 py-1 text-xs font-medium text-[#3B86F2]">
                          INR {item.pipeline.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>INR {item.avg.toLocaleString()}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </>
                  ) : selectedMetric === "Yet To Assign" ? (
                    // Yet To Assign table cells
                    <>
                      <TableCell className="font-semibold text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                            {item.Sales?.firstName?.[0] || "N/A"}
                          </div>
                          {item.Sales?.firstName || "N/A"}{" "}
                          {item.Sales?.lastName || ""}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.requirements || "No requirements"}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-xl bg-[#F1F8FF] px-2 py-1 text-xs font-medium text-[#3B86F2]">
                          INR {item.paymentTillDate?.toLocaleString() || "0"}
                        </span>
                      </TableCell>
                    </>
                  ) : (
                    // Assigned Projects and Fast Track Projects table cells
                    <>
                      <TableCell className="font-semibold text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="font-medium text-sm text-[#716F6F]">
                        {item.Researcher
                          ? `${item.Researcher.firstName} ${item.Researcher.lastName}`
                          : "No Researcher"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.requirements || "No requirements"}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-xl bg-[#EA343433] bg-opacity-20 px-2 py-1 text-xs font-medium text-[#EA3434]">
                          {formatDate(item.edd)}
                        </span>
                      </TableCell>
                    </>
                  )}

                  {/* Action column */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {/* Show "View Project Details" for Assigned Projects, Fast Track Projects, and Yet To Assign */}
                        {(selectedMetric === "Assigned Projects" ||
                          selectedMetric === "Fast Track Projects" ||
                          selectedMetric === "Yet To Assign") && (
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#F4F3FF]"
                            onClick={() => {
                              if (isProject(item)) {
                                handleViewProjectDetails(item.id.toString());
                              }
                            }}
                          >
                            View Project Details
                          </DropdownMenuItem>
                        )}

                        {/* Show "View Sales Person Details" for Revenue */}
                        {selectedMetric === "Revenue" && (
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#F4F3FF]"
                            onClick={() => {
                              if (
                                isRevenue(item) &&
                                item.sales.id !== undefined
                              ) {
                                handleEmployeeClick(item.sales.id);
                              } else {
                                toast.error("Sales person ID not available");
                              }
                            }}
                          >
                            View Sales Person Details
                          </DropdownMenuItem>
                        )}

                        {/* Show "Assign Project" only for Yet To Assign */}
                        {selectedMetric === "Yet To Assign" && (
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#F4F3FF]"
                            onClick={() => {
                              if (isProject(item)) {
                                handleAssignProject(item.id);
                              }
                            }}
                          >
                            Assign Project
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Assign Project Dialog */}
      {selectedProjectId && (
        <AssignProjectDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          projectId={selectedProjectId}
          managerId={managerId}
          onSuccess={refetchAllData}
        />
      )}

      {/* Pagination */}
      {filteredData.length > 0 && (
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
      )}
    </div>
  );
}
