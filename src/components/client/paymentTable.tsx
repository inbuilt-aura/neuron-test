"use client";

import { FC, useState } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useFetchPaymentReceiptMutation } from "@/src/store/client/clientApiSlice";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface Payment {
  projectId: number;
  projectName: string;
  paymentDate: string | null;
  amount: string;
  nextPaymentDate: string | null;
  lastPaymentId: number | null;
}

interface PaymentTableProps {
  data: Payment[];
  userId: string;
  refetch: () => void;
}

const PaymentsPerPage = 5; // Number of payments per page

const PaymentTable: FC<PaymentTableProps> = ({ data, userId, refetch }) => {
  const [fetchPaymentReceipt] = useFetchPaymentReceiptMutation();
  const [currentPage, setCurrentPage] = useState(1);

  const handleDownloadReceipt = async (paymentId: number | null) => {
    if (!paymentId || !userId) {
      toast.error("Cannot download receipt: Missing payment or user information.");
      return;
    }

    const toastId = toast.loading("Downloading receipt...");
    try {
      const receiptHtml = await fetchPaymentReceipt({
        userId,
        paymentId: paymentId.toString(),
      }).unwrap();
      const blob = new Blob([receiptHtml], { type: "text/html" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `payment_receipt_${paymentId}.html`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Receipt downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt. Please try again.", { id: toastId });
    }
  };

  const handleRefetch = () => {
    refetch();
    toast.success("Data refetched successfully!");
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / PaymentsPerPage);
  const startIndex = (currentPage - 1) * PaymentsPerPage;
  const currentPayments = data.slice(startIndex, startIndex + PaymentsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleRefetch}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refetch Data
        </Button>
      </div>
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <Table className="border-2 border-gray-300 min-w-[800px]"><TableHeader className="bg-gray-100"><TableRow>
          <TableHead className="text-center py-4">Sr. No.</TableHead>
          <TableHead className="py-4">Project Name</TableHead>
          <TableHead className="py-4">Payment Date</TableHead>
          <TableHead className="py-4">Amount</TableHead>
          <TableHead className="py-4">Next Payment Date</TableHead>
          <TableHead className="text-center py-4">Action</TableHead>
        </TableRow></TableHeader><TableBody>
          {currentPayments.map((payment, index) => (
            <TableRow key={payment.projectId}>
              <TableCell className="border-t-2 border-gray-300 text-center py-4">{startIndex + index + 1}</TableCell>
              <TableCell className="border-t-2 border-gray-300">{payment.projectName}</TableCell>
              <TableCell className="border-t-2 border-gray-300">
                <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 inline-block">
                  {payment.paymentDate || "N/A"}
                </span>
              </TableCell>
              <TableCell className="border-t-2 border-gray-300">{payment.amount}</TableCell>
              <TableCell className="border-t-2 border-gray-300">
                <span className="px-2 py-1 rounded-lg bg-red-100 text-red-700 inline-block">
                  {payment.nextPaymentDate || "N/A"}
                </span>
              </TableCell>
              <TableCell className="text-center border-t-2 border-gray-300">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <span className="text-md cursor-pointer">⋮</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/client/project/${payment.projectId}`} passHref>
                        View Project Details
                      </Link>
                    </DropdownMenuItem>
                    {payment.lastPaymentId && (
                      <DropdownMenuItem onClick={() => handleDownloadReceipt(payment.lastPaymentId)}>
                        Download Receipt
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </div>

      {/* Pagination Component */}
      <Pagination className="mt-4 border-2 border-gray-300 rounded-lg">
        <PaginationContent className="flex justify-between items-center w-full py-2 px-4">
          <PaginationPrevious
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            className={`border-2 border-gray-300 ${currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Previous
          </PaginationPrevious>
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <PaginationNext
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            className={`border-2 border-gray-300 ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Next
          </PaginationNext>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaymentTable;