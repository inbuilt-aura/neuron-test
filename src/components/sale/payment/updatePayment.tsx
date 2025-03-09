"use client";

import type * as React from "react";
import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/datepicker";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import {
  useFetchProjectSummaryQuery,
  useUpdatepaymentMutation,
} from "@/src/store/sales/salesApiSlice";
import toast from "react-hot-toast";
import type { Payment } from "@/src/types";

interface UpdatePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: Payment[];
  onSubmit: (success: boolean) => void;
}

interface ApiError {
  status: number;
  data: {
    message: string;
  };
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number" &&
    "data" in error &&
    typeof (error as { data: unknown }).data === "object" &&
    (error as { data: unknown }).data !== null &&
    "message" in (error as { data: { message: unknown } }).data &&
    typeof (error as { data: { message: unknown } }).data.message === "string"
  );
}

export function UpdatePaymentDialog({
  isOpen,
  onClose,
  paymentData,
  onSubmit,
}: UpdatePaymentDialogProps) {
  const [amount, setAmount] = useState(
    paymentData[0]?.amount?.toString() || ""
  );
  const [date, setDate] = useState<Date | undefined>(
    paymentData[0]?.paymentDate
      ? new Date(paymentData[0].paymentDate)
      : undefined
  );
  const userId = useSelector((state: RootState) => state.auth.user?.id) ?? "";
  const [updatePayment, { isLoading: isUpdating }] = useUpdatepaymentMutation();

  const payment = paymentData[0];
  const projectId = payment?.projectId?.toString() ?? "";
  const { data: projectSummary } = useFetchProjectSummaryQuery({
    userId,
    projectId,
  });

  // const pendingAmount = projectSummary ? projectSummary.pendingAmount.toFixed(2) : "0"

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!date || isNaN(date.getTime())) {
        toast.error("Please select a valid date.");
        return;
      }

      if (
        !amount ||
        isNaN(Number.parseFloat(amount)) ||
        Number.parseFloat(amount) <= 0
      ) {
        toast.error("Please enter a valid amount.");
        return;
      }

      const formattedDate = format(date, "yyyy-MM-dd");

      try {
        if (!payment || !payment.id) {
          throw new Error("Invalid payment data");
        }

        const response = await updatePayment({
          userId,
          projectId,
          paymentId: payment.id.toString(),
          amount,
          paymentDate: formattedDate,
          completed: false,
        }).unwrap();
        console.log("Update Response from API:", response);
        if (response) {
          toast.success("Payment updated successfully");
          onSubmit(true);
          onClose();
        } else {
          onSubmit(false);
          toast.error("Failed to update payment");
        }
      } catch (err: unknown) {
        onSubmit(false);
        console.error("Error updating payment:", err);
        if (isApiError(err)) {
          if (err.status === 400) {
            if (err.data.message === "cannot update a completed payment") {
              toast.error("Cannot update a completed payment");
            } else if (
              err.data.message === "amount should not exceed pending payment"
            ) {
              toast.error("Amount should not exceed pending payment");
            } else {
              toast.error(err.data.message || "Failed to update payment");
            }
          } else {
            toast.error("An error occurred while updating the payment");
          }
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [date, amount, userId, projectId, payment, updatePayment, onClose, onSubmit]
  );

  if (!isOpen) return null;

  if (!payment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-[#33333326] backdrop-blur-[6px]"
          onClick={onClose}
        />
        <Card className="relative z-50 w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No payment data available.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#33333326] backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 -top-3 rounded-full bg-[#2A2A2A]"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-white" />
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Update Payment</CardTitle>
            <CardDescription>
              Review and update payment details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Summary */}
              {projectSummary && (
                <>
                  <h3 className="text-lg font-bold">Project Summary</h3>
                  <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
                    <div>
                      <Label className="text-sm text-gray-500">
                        Total Project Amount
                      </Label>
                      <p className="text-lg font-semibold">
                        ₹ {projectSummary.cost}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">
                        Pending Amount
                      </Label>
                      <p className="text-lg font-semibold text-red-600">
                        ₹ {projectSummary.pendingAmount}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">
                        Last Payment Date
                      </Label>
                      <p className="text-lg font-semibold">
                        {new Date(
                          projectSummary.lastPaymentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Update Payment Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">New Date</Label>
                  <DatePicker
                    selected={date}
                    onSelect={(selectedDate) => {
                      if (
                        selectedDate instanceof Date &&
                        !isNaN(selectedDate.getTime())
                      ) {
                        setDate(selectedDate);
                      } else {
                        setDate(undefined);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">New Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-4 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Payment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
