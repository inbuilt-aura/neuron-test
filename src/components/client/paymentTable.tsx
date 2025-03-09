import { FC } from "react";
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
import { useFetchPaymentReceiptMutation } from "@/src/store/client/clientApiSlice";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button"; // Import Button component
import { RefreshCcw } from "lucide-react"; // Import an icon for the refetch button

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
  refetch: () => void; // Add refetch function as a prop
}

const PaymentTable: FC<PaymentTableProps> = ({ data, userId, refetch }) => {
  const [fetchPaymentReceipt] = useFetchPaymentReceiptMutation();

  const handleDownloadReceipt = async (paymentId: number | null) => {
    if (!paymentId || !userId) {
      toast.error(
        "Cannot download receipt: Missing payment or user information."
      );
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
      toast.error("Failed to download receipt. Please try again.", {
        id: toastId,
      });
    }
  };

  const handleRefetch = () => {
    refetch(); // Trigger the refetch function passed from the parent
    toast.success("Data refetched successfully!");
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleRefetch}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refetch Data
        </Button>
      </div>
      <Table className="border-2 border-gray-300">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="text-center py-4">Sr. No.</TableHead>
            <TableHead className="py-4">Project Name</TableHead>
            <TableHead className="py-4">Payment Date</TableHead>
            <TableHead className="py-4">Amount</TableHead>
            <TableHead className="py-4">Next Payment Date</TableHead>
            <TableHead className="text-center py-4">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((payment, index) => (
            <TableRow key={payment.projectId}>
              <TableCell className="border-t-2 border-gray-300 text-center py-4">
                {index + 1}
              </TableCell>
              <TableCell className="border-t-2 border-gray-300">
                {payment.projectName}
              </TableCell>
              <TableCell className="border-t-2 border-gray-300">
                <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 inline-block">
                  {payment.paymentDate || "N/A"}
                </span>
              </TableCell>
              <TableCell className="border-t-2 border-gray-300">
                {payment.amount}
              </TableCell>
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
                      <Link
                        href={`/client/project/${payment.projectId}`}
                        passHref
                      >
                        View Project Details
                      </Link>
                    </DropdownMenuItem>
                    {payment.lastPaymentId && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownloadReceipt(payment.lastPaymentId)
                        }
                      >
                        Download Receipt
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentTable;
