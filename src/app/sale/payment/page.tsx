"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

import Header from "@/src/components/sale/header";
import { Input } from "@/components/ui/input";
import PaymentTable from "@/src/components/sale/payment/paymentTable";
import { AddPayment } from "@/src/components/sale/payment/addPayment";
import { ProjectDetails } from "@/src/components/reuse_components/project_detail";
import {
  useFetchIncompletePaymentsQuery,
  useFetchCompletedPaymentsQuery,
  useFetchUpcomingPaymentsQuery,
  type PaymentTableItem,
} from "@/src/store/sales/salesApiSlice";
import type { RootState } from "@/src/store/store";
import { useGetUserProfileQuery } from "@/src/store/apiSlice";
import type { PaymentTableMetricKeys } from "../../../components/sale/payment/types";
import { UpdatePaymentDialog } from "@/src/components/sale/payment/updatePayment";
import type { Payment } from "@/src/types/index";

const PaymentPage = () => {
  const [selectedMetric, setSelectedMetric] =
    useState<PaymentTableMetricKeys>("Completed Payment");
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [openPaymentDetails, setOpenPaymentDetails] = useState(false);
  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const userId = useSelector((state: RootState) => state.auth.user?.id) ?? "";
  const [userName, setUserName] = useState<string>("");
  const { data: userProfileData, isLoading: isUserProfileLoading } =
    useGetUserProfileQuery();
  const [currentTime, setCurrentTime] = useState(new Date());
  const empid =
    useSelector((state: RootState) => state.auth.user?.empid) ?? "N/A";
  const [searchTerm, setSearchTerm] = useState("");

  const { refetch: refetchIncomplete } = useFetchIncompletePaymentsQuery({
    userId,
  });
  const { refetch: refetchCompleted } = useFetchCompletedPaymentsQuery({
    userId,
  });
  const { refetch: refetchUpcoming } = useFetchUpcomingPaymentsQuery({
    userId,
  });

  useEffect(() => {
    if (userProfileData) {
      setUserName(userProfileData.firstName);
    }
  }, [userProfileData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleToggle = (metric: PaymentTableMetricKeys) => {
    setSelectedMetric(metric);
  };

  const handleAddPayment = () => {
    setIsAddPaymentModalOpen(true);
  };

  const handleUpdatePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsUpdatePaymentModalOpen(true);
  };

  const handleViewProjectDetails = (projectId: number) => {
    setSelectedProject(projectId);
  };

  const handleViewPaymentDetails = (projectId: number) => {
    setSelectedProject(projectId);
    setOpenPaymentDetails(true);
  };

  const closeAllModals = () => {
    setIsAddPaymentModalOpen(false);
    setSelectedProject(null);
    setOpenPaymentDetails(false);
    setIsUpdatePaymentModalOpen(false);
    setSelectedPayment(null);
  };

  const handlePaymentSubmit = (success: boolean) => {
    if (success) {
      toast.success("Payment added successfully!");
      refetchAll();
    } else {
      toast.error("Failed to add payment.");
    }
    closeAllModals();
  };

  const handleUpdatePaymentSubmit = (success: boolean) => {
    if (success) {
      toast.success("Payment updated successfully!");
      refetchAll();
    } else {
      toast.error("Failed to update payment.");
    }
    closeAllModals();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const refetchAll = () => {
    refetchIncomplete();
    refetchCompleted();
    refetchUpcoming();
  };

  return (
    <div className="flex">
      <main className="flex-1">
        {selectedProject !== null ? (
          <ProjectDetails
            id={selectedProject.toString()}
            onBack={() => {
              setSelectedProject(null);
              setOpenPaymentDetails(false);
            }}
            openPaymentDetails={openPaymentDetails}
          />
        ) : (
          <>
            <Toaster position="top-right" />
            <Header
              title={
                isUserProfileLoading
                  ? "Welcome Back 👋"
                  : `Welcome Back, ${userName.toUpperCase()} 👋`
              }
              subtitle={`Employee ID : ${empid} • Time: ${format(
                currentTime,
                "h:mm a"
              )}`}
              extraContent={
                <>
                  <h2 className="text-lg font-semibold">Payment</h2>
                  <button
                    onClick={handleAddPayment}
                    className="px-4 py-2 bg-custom-blue text-white font-semibold rounded-md"
                  >
                    + Add Payment
                  </button>
                </>
              }
            />
            <div className="p-4 flex justify-between items-center">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
                <button
                  onClick={() => handleToggle("Completed Payment")}
                  className={`px-4 py-2 font-semibold rounded-md transition-colors ${
                    selectedMetric === "Completed Payment"
                      ? "bg-white text-gray-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Completed Payment
                </button>
                <button
                  onClick={() => handleToggle("Upcoming Payment")}
                  className={`px-4 py-2 font-semibold rounded-md transition-colors ${
                    selectedMetric === "Upcoming Payment"
                      ? "bg-white text-gray-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Upcoming Payment
                </button>
                <button
                  onClick={() => handleToggle("Incomplete Payment")}
                  className={`px-4 py-2 font-semibold rounded-md transition-colors ${
                    selectedMetric === "Incomplete Payment"
                      ? "bg-white text-gray-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Incomplete Payment
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#8C8E90]" />
                <Input
                  placeholder="Search"
                  className="pl-10 w-[25rem] bg-[#FFFFFF] border-[1px] border-[#E0E0E0]"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <PaymentTable
              selectedMetric={selectedMetric}
              onViewProjectDetails={handleViewProjectDetails}
              onOpenUpdatePayment={handleUpdatePayment}
              onOpenPaymentDetails={(payment: PaymentTableItem) =>
                handleViewPaymentDetails(payment.id)
              }
              searchTerm={searchTerm}
              refetchAll={refetchAll}
            />
            {isAddPaymentModalOpen && (
              <AddPayment
                isOpen={isAddPaymentModalOpen}
                onClose={closeAllModals}
                onSubmit={handlePaymentSubmit}
              />
            )}
            {isUpdatePaymentModalOpen && selectedPayment && (
              <UpdatePaymentDialog
                isOpen={isUpdatePaymentModalOpen}
                onClose={closeAllModals}
                onSubmit={handleUpdatePaymentSubmit}
                paymentData={[selectedPayment]}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PaymentPage;
