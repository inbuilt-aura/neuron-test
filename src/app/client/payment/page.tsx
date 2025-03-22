"use client";

import Header from "@/src/components/sale/header";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PaymentTable from "@/src/components/client/paymentTable";
import { useFetchClientPaymentQuery } from "@/src/store/client/clientApiSlice";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";

interface User {
  userId: string;
  name: string;
}

interface Payment {
  projectId: number;
  projectName: string;
  paymentDate: string | null;
  amount: string;
  nextPaymentDate: string | null;
  lastPaymentId: number | null;
}

interface ApiPayment {
  id: number;
  name: string;
  cost: number;
  paymentTillDate: number;
  LastPayment: {
    id: number;
    paymentDate: string;
    amount: number;
    completed: boolean;
  } | null;
  NextPayment: {
    amount: number;
    id: number;
    paymentDate: string;
    completed: boolean;
  } | null;
  pendingAmount: number;
}

const Payment = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const user = useSelector(
    (state: { auth: { user: User | null } }) => state.auth.user
  );

  console.log("User from Redux:", {
    user,
    userId: user?.userId,
    typeOfId: user?.userId ? typeof user.userId : "undefined",
    isValidId:
      user?.userId && user.userId !== "undefined" && user.userId.length > 0,
  });

  const userId = user?.userId ? user.userId.toString().trim() : undefined;

  const { data, isLoading, error, refetch } = useFetchClientPaymentQuery(
    userId ? { userId: userId, params: {} } : skipToken,
    { skip: !userId || userId === "undefined" }
  );

  console.log("Query state:", {
    data,
    isLoading,
    error,
    userId,
    endpoint: userId ? `/client/${userId}/payments` : "Skipped",
  });

  useEffect(() => {
    if (isLoading) {
      toast.loading("Fetching payment history...", { id: "payment-loading" });
    } else {
      toast.dismiss("payment-loading");
    }

    if (error) {
      toast.error("Failed to load payment history. Please try again.", {
        id: "payment-error",
      });
      console.error("Payment fetch error:", error);
    }

    if (data) {
      const formattedData: Payment[] = (data as ApiPayment[]).map(
        (payment: ApiPayment) => ({
          projectId: payment.id,
          projectName: payment.name,
          paymentDate: payment.LastPayment
            ? new Date(payment.LastPayment.paymentDate).toLocaleDateString(
                "en-US",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : null,
          amount: payment.LastPayment
            ? `INR ${payment.LastPayment.amount}`
            : "N/A",
          nextPaymentDate: payment.NextPayment
            ? new Date(payment.NextPayment.paymentDate).toLocaleDateString(
                "en-US",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : null,
          lastPaymentId: payment.LastPayment ? payment.LastPayment.id : null,
        })
      );

      // Check if the new data differs from the current state
      if (JSON.stringify(formattedData) !== JSON.stringify(payments)) {
        setPayments(formattedData);
        toast.success("Payment history updated successfully!", {
          id: "payment-success",
        });
        // Trigger refetch only if this is not the initial load
        if (payments.length > 0) {
          refetch(); // Refetch new data when payments change
        }
      }
    }
  }, [data, isLoading, error, payments, refetch]);

  // Filter payments based on search query
  const filteredPayments = payments.filter((payment) =>
    payment.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userId || userId === "undefined") {
    return (
      <div className="flex">
        <main className="flex-1">
          <Header
            extraContent={
              <h2 className="text-xl font-semibold">Payment History</h2>
            }
          />
          <div className="p-4">
            <p className="text-red-500">
              Error: User information is missing. Please log in to view payment
              history. (User ID: {userId || "undefined"})
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <main className="flex-1">
        <Header
          extraContent={
            <h2 className="text-xl font-semibold">Payment History</h2>
          }
        />
        <div className="p-4 flex justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#8C8E90]" />
            <Input
              placeholder="Search by project name"
              className="pl-10 w-[25rem] bg-[#FFFFFF] border-[1px] border-[#E0E0E0]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error fetching data</p>
        ) : (
          <PaymentTable
            data={filteredPayments}
            userId={userId}
            refetch={refetch}
          />
        )}
      </main>
    </div>
  );
};

export default Payment;
