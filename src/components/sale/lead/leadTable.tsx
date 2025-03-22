"use client";

import { type FC, useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { format, parseISO } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import LeadDetailsDialog from "./leadDetailsDialog";
import TransferLeadDialog from "./transferLeadDialog";
import EditLeadModal from "../../reuse_components/edit-lead-model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useFetchLeadsQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useOnboardClientMutation,
  useFetchPendingMessagesQuery,
} from "@/src/store/sales/salesApiSlice";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import type { Lead } from "@/src/types";

interface LeadWithMessage extends Lead {
  message?: string;
}

interface UpdateLeadData {
  leadId: number;
  followUpDate?: string;
  requirements?: string;
  projectServiceTypeId?: number;
}

type MetricKeys =
  | "Total Leads"
  | "Today's Follow Up"
  | "New Leads"
  | "Pending Messages";

const LeadsPerPage = 5;

interface LeadTableProps {
  selectedMetric: MetricKeys;
  searchQuery: string;
  onLeadUpdate: () => void;
  onLeadDelete: () => void;
  onTransferSuccess: () => void;
  setRefetchTable?: (refetch: () => void) => void;
}

const LeadTable: FC<LeadTableProps> = ({
  selectedMetric,
  searchQuery,
  onLeadUpdate,
  onLeadDelete,
  onTransferSuccess,
  setRefetchTable,
}) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const shouldFetchLeads = selectedMetric !== "Pending Messages" && !!userId;
  const shouldFetchPendingMessages =
    selectedMetric === "Pending Messages" && !!userId;

  const {
    data: leadsData,
    isLoading: isLeadsLoading,
    error: leadsError,
    refetch: refetchLeads,
  } = useFetchLeadsQuery(
    selectedMetric === "New Leads" ? { recent: true } : undefined,
    {
      skip: !shouldFetchLeads,
    }
  );

  const {
    data: pendingMessagesData,
    isLoading: isPendingMessagesLoading,
    error: pendingMessagesError,
    refetch: refetchPendingMessages,
  } = useFetchPendingMessagesQuery(undefined, {
    skip: !shouldFetchPendingMessages,
  });

  const [updateLead] = useUpdateLeadMutation();
  const [deleteLead] = useDeleteLeadMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [transferLeadId, setTransferLeadId] = useState<string | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const refetchTable = useCallback(() => {
    if (selectedMetric === "Pending Messages") {
      refetchPendingMessages();
    } else {
      refetchLeads();
    }
  }, [selectedMetric, refetchLeads, refetchPendingMessages]);

  useEffect(() => {
    if (setRefetchTable) {
      setRefetchTable(refetchTable);
    }
  }, [setRefetchTable, refetchTable]);

  const handleTransferSuccess = useCallback(() => {
    refetchTable();
    onTransferSuccess();
  }, [refetchTable, onTransferSuccess]);

  useEffect(() => {
    if (userId) {
      refetchTable();
    }
  }, [userId, selectedMetric, refetchTable]);

  const formatDate = useCallback((dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy");
  }, []);

  const data =
    selectedMetric === "Pending Messages"
      ? (pendingMessagesData as LeadWithMessage[] | undefined)
      : (leadsData as Lead[] | undefined);

  const isLoading =
    selectedMetric === "Pending Messages"
      ? isPendingMessagesLoading
      : isLeadsLoading;
  const error =
    selectedMetric === "Pending Messages" ? pendingMessagesError : leadsError;

  const filteredLeads = useMemo(() => {
    if (!data) return [];

    return data
      .filter((lead) => {
        if (
          selectedMetric === "Pending Messages" ||
          selectedMetric === "New Leads"
        )
          return true;

        const metricsFilter = () => {
          switch (selectedMetric) {
            case "Today's Follow Up":
              const today = new Date().toDateString();
              return new Date(lead.followUpDate).toDateString() === today;
            default:
              return true;
          }
        };

        const searchFilter = () => {
          const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
          const mobileNumber = lead.mobileNumber.toLowerCase();
          const query = searchQuery.toLowerCase();
          return fullName.includes(query) || mobileNumber.includes(query);
        };

        return metricsFilter() && searchFilter();
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [data, selectedMetric, searchQuery]);

  const totalPages = Math.ceil(filteredLeads.length / LeadsPerPage);
  const startIndex = (currentPage - 1) * LeadsPerPage;
  const currentLeads = filteredLeads.slice(
    startIndex,
    startIndex + LeadsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openDetails = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const openRequirementDialog = (requirement: string) => {
    setSelectedRequirement(requirement);
  };

  const formatRequirement = (requirement: string) => {
    return requirement.replace(/, /g, ",\n").replace(/\. /g, ".\n");
  };

  const handleEditLead = async (updatedData: Partial<Lead>) => {
    if (selectedLead) {
      try {
        const updateData: UpdateLeadData = {
          leadId: selectedLead.id,
          followUpDate: updatedData.followUpDate,
          requirements: updatedData.requirements,
          projectServiceTypeId: updatedData.projectServiceTypeId ?? undefined,
        };
        await updateLead(updateData).unwrap();
        toast.success("Lead updated successfully");
        setIsEditModalOpen(false);
        setSelectedLead(null);
        refetchTable();
        onLeadUpdate();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        toast.error(`Failed to update the lead: ${errorMessage}`);
      }
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    try {
      await deleteLead(leadId).unwrap();
      toast.success("Lead deleted successfully");
      refetchTable();
      onLeadDelete();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(`Failed to delete the lead: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Button disabled>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {"status" in error
          ? `Error loading ${
              selectedMetric === "Pending Messages" ? "messages" : "leads"
            }: ${error.status}`
          : `Error loading ${
              selectedMetric === "Pending Messages" ? "messages" : "leads"
            }.`}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden -px-2 sm:px-2 lg:px-4">
      <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-6 lg:px-8">
          <Table className="min-w-full border-2 border-gray-300 border-collapse table-auto">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="py-3 px-4 text-center text-sm font-medium">
                  Sr. No.
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium">
                  Lead
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium">
                  Requirements
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium">
                  Follow-up Date
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium">
                  {selectedMetric === "Pending Messages"
                    ? "Pending Messages"
                    : "Contact Details"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center text-sm font-medium">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLeads.map((lead, index) => {
                const leadWithMessage = lead as LeadWithMessage;
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="border-t-2 border-b-2 border-gray-300 text-center py-3 px-4">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="border-t-2 border-b-2 border-gray-300 py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{`${lead.firstName[0]}${lead.lastName[0]}`}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{`${lead.firstName} ${lead.lastName}`}</div>
                      </div>
                    </TableCell>
                    <TableCell className="border-t-2 border-b-2 border-gray-300 py-3 px-4">
                      <span
                        className="cursor-pointer text-gray-700 line-clamp-2 break-words"
                        onClick={() =>
                          openRequirementDialog(lead.requirements || "")
                        }
                      >
                        {formatRequirement(
                          lead.requirements ||
                            "No specific requirements provided"
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="border-t-2 border-b-2 border-gray-300 py-3 px-4">
                      <div className="px-2 py-1 rounded-lg inline-block bg-red-100 text-red-700">
                        {formatDate(lead.followUpDate)}
                      </div>
                    </TableCell>
                    <TableCell className="border-t-2 border-b-2 border-gray-300 py-3 px-4">
                      {selectedMetric === "Pending Messages" ? (
                        <div className="space-y-1">
                          <div className="font-medium">
                            {leadWithMessage.message || "No message"}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-medium">{`+${lead.countryCode} ${lead.mobileNumber}`}</div>
                          <div className="text-sm text-gray-500">
                            {lead.email}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="border-t-2 border-b-2 border-gray-300 py-3 px-4 text-center">
                      <ActionMenu
                        selectedMetric={selectedMetric}
                        lead={lead}
                        openDetails={openDetails}
                        setSelectedLead={setSelectedLead}
                        setIsEditModalOpen={setIsEditModalOpen}
                        handleDeleteLead={handleDeleteLead}
                        setTransferLeadId={setTransferLeadId}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination className="mt-2 border-2 border-gray-300 rounded-lg">
        <PaginationContent className="flex justify-between items-center w-full py-2 px-4">
          <PaginationPrevious
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            className={`border-2 border-gray-300 ${
              currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
            }`}
            aria-disabled={currentPage === 1}
          >
            Previous
          </PaginationPrevious>

          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </div>

          <PaginationNext
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            className={`border-2 border-gray-300 ${
              currentPage === totalPages || totalPages === 0
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
            aria-disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </PaginationNext>
        </PaginationContent>
      </Pagination>

      <Dialog
        open={!!selectedRequirement}
        onOpenChange={(isOpen) => !isOpen && setSelectedRequirement(null)}
      >
        <DialogContent className="w-full max-w-xl max-h-[50vh] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Requirements
            </DialogTitle>
            <DialogDescription className="whitespace-pre-wrap p-4 border rounded-lg overflow-auto">
              {selectedRequirement}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <LeadDetailsDialog
        open={!!selectedLead && !isEditModalOpen}
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      {transferLeadId && (
        <TransferLeadDialog
          open={!!transferLeadId}
          onClose={() => setTransferLeadId(null)}
          leadId={transferLeadId}
          onTransferSuccess={handleTransferSuccess}
        />
      )}

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onSubmit={handleEditLead}
      />
    </div>
  );
};

interface ActionMenuProps {
  selectedMetric: MetricKeys;
  lead: Lead;
  openDetails: (lead: Lead) => void;
  setSelectedLead: (lead: Lead) => void;
  setIsEditModalOpen: (isOpen: boolean) => void;
  handleDeleteLead: (leadId: number) => void;
  setTransferLeadId: (leadId: string) => void;
}

const ActionMenu: FC<ActionMenuProps> = ({
  selectedMetric,
  lead,
  openDetails,
  setSelectedLead,
  setIsEditModalOpen,
  handleDeleteLead,
  setTransferLeadId,
}) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [onboardClient] = useOnboardClientMutation();

  const handleOnboardClient = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await onboardClient({
        salesId: userId.toString(),
        leadId: lead.id.toString(),
      }).unwrap();

      if (response.onboarded) {
        toast.success("Client onboarded successfully");
      } else {
        toast.error("Client onboarding failed");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(`Failed to onboard client: ${errorMessage}`);
    }
  };

  if (selectedMetric === "Pending Messages") {
    return (
      <a href="#" className="text-blue-600 hover:underline">
        Reply
      </a>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mx-auto">
        <span className="text-md cursor-pointer">⋮</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openDetails(lead)}>
          View Details
        </DropdownMenuItem>
        {selectedMetric !== "New Leads" && (
          <DropdownMenuItem>Contact Lead</DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => {
            setSelectedLead(lead);
            setIsEditModalOpen(true);
          }}
        >
          Edit {selectedMetric === "New Leads" ? "Requirements" : ""}
        </DropdownMenuItem>
        {selectedMetric !== "New Leads" && (
          <>
            <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)}>
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTransferLeadId(lead.id.toString())}
            >
              Transfer Lead
            </DropdownMenuItem>
            {(selectedMetric === "Total Leads" ||
              selectedMetric === "Today's Follow Up") && (
              <DropdownMenuItem onClick={handleOnboardClient}>
                Onboard Client
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeadTable;
