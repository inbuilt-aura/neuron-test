"use client";

import { type FC, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import {
  useFetchIncompletePaymentsQuery,
  useFetchCompletedPaymentsQuery,
  useFetchUpcomingPaymentsQuery,
  useCompleteLastPaymentMutation,
  useUpdateLastPaymentMutation,
  type PaymentTableItem,
} from "@/src/store/sales/salesApiSlice";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import type { PaymentTableMetricKeys } from "../../../components/sale/payment/types";
import { AddQuoteModal } from "./addQuoteDialog";
import { MarkAsReceivedModal } from "./mark-as-received";
import { ChangeDateModal } from "./Update-date-model";
import toast from "react-hot-toast";
import type { Payment } from "@/src/types/index";

const columnsMap: Record<
  PaymentTableMetricKeys,
  { label: string; index: number }[]
> = {
  "Completed Payment": [
    { label: "Sr. No.", index: 0 },
    { label: "Project Name", index: 1 },
    { label: "Payment Date", index: 2 },
    { label: "Amount", index: 3 },
    { label: "Payment Completion Date", index: 4 },
    { label: "Action", index: 5 },
  ],
  "Upcoming Payment": [
    { label: "Sr. No.", index: 0 },
    { label: "Project Name", index: 1 },
    { label: "Amount", index: 2 },
    { label: "Next Payment Date", index: 3 },
    { label: "Action", index: 4 },
  ],
  "Incomplete Payment": [
    { label: "Sr. No.", index: 0 },
    { label: "Project Name", index: 1 },
    { label: "Total Project Amount", index: 2 },
    { label: "Pending Payment", index: 3 },
    { label: "Last Payment Date", index: 4 },
    { label: "Action", index: 5 },
  ],
};

const LeadsPerPage = 5;

interface PaymentTableProps {
  selectedMetric: PaymentTableMetricKeys;
  onViewProjectDetails: (projectId: number) => void;
  onOpenUpdatePayment: (payment: Payment) => void;
  onOpenPaymentDetails: (payment: PaymentTableItem) => void;
  searchTerm: string;
  refetchAll: () => void;
}

const PaymentTable: FC<PaymentTableProps> = ({
  selectedMetric,
  onViewProjectDetails,
  onOpenPaymentDetails,
  searchTerm,
  refetchAll,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isMarkAsReceivedModalOpen, setIsMarkAsReceivedModalOpen] =
    useState(false);
  const [selectedPaymentForMark, setSelectedPaymentForMark] =
    useState<PaymentTableItem | null>(null);
  const [completeLastPayment, { isLoading: isMarkingAsReceived }] =
    useCompleteLastPaymentMutation();
  const [isChangeDateModalOpen, setIsChangeDateModalOpen] = useState(false);
  const [selectedPaymentForDateChange, setSelectedPaymentForDateChange] =
    useState<PaymentTableItem | null>(null);

  const userId = useSelector((state: RootState) => state.auth.user?.id) ?? "";
  const { data: incompletePayments, isLoading: isIncompleteLoading } =
    useFetchIncompletePaymentsQuery({ userId });
  const { data: completedPayments, isLoading: isCompletedLoading } =
    useFetchCompletedPaymentsQuery({ userId });
  const { data: upcomingPayments, isLoading: isUpcomingLoading } =
    useFetchUpcomingPaymentsQuery({ userId });

  const isLoading =
    isIncompleteLoading || isCompletedLoading || isUpcomingLoading;

  const data = useMemo(() => {
    let payments: PaymentTableItem[] = [];
    switch (selectedMetric) {
      case "Completed Payment":
        payments = completedPayments ?? [];
        break;
      case "Upcoming Payment":
        payments = upcomingPayments ?? [];
        break;
      case "Incomplete Payment":
        payments = incompletePayments ?? [];
        break;
    }
    return payments.filter((payment) =>
      payment.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [
    selectedMetric,
    completedPayments,
    upcomingPayments,
    incompletePayments,
    searchTerm,
  ]);

  const columns = columnsMap[selectedMetric];

  const totalPages = Math.ceil(data.length / LeadsPerPage);
  const startIndex = (currentPage - 1) * LeadsPerPage;
  const currentPayments = data.slice(startIndex, startIndex + LeadsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddQuote = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIsAddQuoteModalOpen(true);
  };

  const handleQuoteAdded = (success: boolean) => {
    if (success) {
      console.log("Quote added successfully");
    }
    setIsAddQuoteModalOpen(false);
    setSelectedProjectId(null);
  };

  const handleMarkAsReceived = async () => {
    if (!selectedPaymentForMark) return;

    try {
      await completeLastPayment({
        userId: userId,
        projectId: selectedPaymentForMark.id.toString(),
      }).unwrap();

      toast.success("Payment marked as received successfully");
      setIsMarkAsReceivedModalOpen(false);
      setSelectedPaymentForMark(null);

      // Refetch all data after marking as received
      refetchAll();
    } catch (error) {
      console.error("Error marking payment as received:", error);
      toast.error("Failed to mark payment as received");
    }
  };

  const [updateLastPayment, { isLoading: isUpdatingDate }] =
    useUpdateLastPaymentMutation();

  const handleDateChange = async (newDate: Date) => {
    if (!selectedPaymentForDateChange) return;

    try {
      await updateLastPayment({
        userId: userId,
        projectId: selectedPaymentForDateChange.id.toString(),
        paymentDate: newDate.toISOString().split("T")[0],
      }).unwrap();

      toast.success("Payment date updated successfully");
      setIsChangeDateModalOpen(false);
      setSelectedPaymentForDateChange(null);

      // Refetch all data after updating the date
      refetchAll();
    } catch (error) {
      console.error("Error updating payment date:", error);
      toast.error("Failed to update payment date");
    }
  };

  const handleOpenPaymentDetails = (payment: PaymentTableItem) => {
    // Updated function
    onOpenPaymentDetails(payment);
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Table className="border-2 border-gray-300">
            <TableHeader className="bg-gray-100">
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.index}
                    className={`py-4 ${
                      column.index === 0 || column.index === columns.length - 1
                        ? "text-center"
                        : ""
                    }`}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPayments.map((payment, index) => (
                <TableRow
                  key={payment.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="border-t-2 border-b-2 border-gray-300 text-center py-4">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="border-t-2 border-b-2 border-gray-300">
                    {payment.name}
                  </TableCell>
                  {selectedMetric === "Completed Payment" && (
                    <>
                      <TableCell className="border-t-2 border-b-2 border-gray-300">
                        <div className="px-2 py-1 rounded-lg bg-blue-100 inline-block text-blue-700">
                          {new Date(
                            payment.LastPayment?.paymentDate ?? ""
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="border-t-2 border-b-2 border-gray-300">
                        ₹{payment.LastPayment?.amount}
                      </TableCell>
                      <TableCell className="border-t-2 border-b-2 border-gray-300">
                        <div className="px-2 py-1 rounded-lg bg-green-100 inline-block text-green-700">
                          {new Date(
                            payment.projectCompletionDate ?? ""
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </>
                  )}
                  {selectedMetric === "Upcoming Payment" && (
                    <>
                      <TableCell className="border-t-2 border-b-2 border-gray-300">
                        ₹{payment.NextPayment?.amount}
                      </TableCell>
                      <TableCell
                        className="border-t-2 border-b-2 border-gray-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPaymentForDateChange(payment);
                          setIsChangeDateModalOpen(true);
                        }}
                      >
                        <div className="px-2 py-1 rounded-lg bg-red-100 inline-block text-red-700 hover:bg-red-200">
                          {new Date(
                            payment.nextPaymentDate ?? ""
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </>
                  )}
                  {selectedMetric === "Incomplete Payment" && (
                    <>
                      <TableCell className="border-t-2 border-b-2 border-gray-300">
                        ₹{payment.cost}
                      </TableCell>
                      <TableCell className="border-t-2 border-b-2 border-gray-300">
                        <span className="text-red-600">
                          ₹{payment.pendingPayment}
                        </span>
                      </TableCell>
                      <TableCell className="border-t-2 border-b-2 border-gray-300">
                        <div className="px-2 py-1 rounded-lg bg-blue-200 inline-block text-blue-500">
                          {new Date(
                            payment.lastPaymentDate ?? ""
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-center border-t-2 border-b-2 border-gray-300">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => onViewProjectDetails(payment.id)}
                        >
                          View Project Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenPaymentDetails(payment)}
                        >
                          View Payment Details
                        </DropdownMenuItem>
                        {selectedMetric === "Completed Payment" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddQuote(payment.id);
                            }}
                          >
                            Add New Quote
                          </DropdownMenuItem>
                        )}
                        {selectedMetric === "Upcoming Payment" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPaymentForMark(payment);
                              setIsMarkAsReceivedModalOpen(true);
                            }}
                          >
                            Mark as Received
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination className="mt-4 border-2 border-gray-300 rounded-lg">
            <PaginationContent className="flex justify-between items-center w-full py-2 px-4">
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={`border-2 border-gray-300 ${
                  currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Previous
              </PaginationPrevious>

              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>

              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                className={`border-2 border-gray-300 ${
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                Next
              </PaginationNext>
            </PaginationContent>
          </Pagination>
        </>
      )}
      <MarkAsReceivedModal
        isOpen={isMarkAsReceivedModalOpen}
        onClose={() => {
          setIsMarkAsReceivedModalOpen(false);
          setSelectedPaymentForMark(null);
        }}
        onConfirm={handleMarkAsReceived}
        isLoading={isMarkingAsReceived}
      />
      <ChangeDateModal
        isOpen={isChangeDateModalOpen}
        onClose={() => {
          setIsChangeDateModalOpen(false);
          setSelectedPaymentForDateChange(null);
        }}
        onConfirm={handleDateChange}
        isLoading={isUpdatingDate}
        selectedDate={
          selectedPaymentForDateChange
            ? new Date(selectedPaymentForDateChange.nextPaymentDate ?? "")
            : undefined
        }
      />
      {isAddQuoteModalOpen && selectedProjectId && (
        <AddQuoteModal
          isOpen={isAddQuoteModalOpen}
          onClose={() => {
            setIsAddQuoteModalOpen(false);
            setSelectedProjectId(null);
          }}
          projectId={selectedProjectId}
          onQuoteAdded={handleQuoteAdded}
        />
      )}
    </div>
  );
};

export default PaymentTable;
