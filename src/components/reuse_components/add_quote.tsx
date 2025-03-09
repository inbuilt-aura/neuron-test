"use client";

import { useState } from "react";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddQuoteMutation } from "@/src/store/sales/salesApiSlice";
import { toast } from "react-hot-toast";

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  projectId: number;
  onQuoteAdded: (success: boolean) => void;
}

export function AddQuoteModal({
  isOpen,
  onClose,
  userId,
  projectId,
  onQuoteAdded,
}: AddQuoteModalProps) {
  const [amount, setAmount] = useState("");
  const [requirements, setRequirements] = useState("");
  const [addQuote, { isLoading }] = useAddQuoteMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!requirements.trim()) {
      toast.error("Please enter the requirements");
      return;
    }

    try {
      const response = await addQuote({
        userId,
        projectId,
        amount: parseFloat(amount),
        requirement: requirements,
      }).unwrap();

      console.log("Add Quote Response:", response);

      onQuoteAdded(true);
      toast.success("Quote added successfully");
      onClose();
    } catch (error: unknown) {
      console.error("Failed to add quote:", error);
      toast.error(
        (error as { data?: { message: string } })?.data?.message ||
          "Failed to add quote. Please try again."
      );
      onQuoteAdded(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative z-50 w-full max-w-sm">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 -top-3 rounded-full bg-[#2A2A2A]"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-white" />
        </Button>
        <Card>
          <CardHeader className="relative pb-4">
            <CardTitle className="font-medium text-2xl">
              Add Quoted Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="₹ 00.00"
                    required
                    className="pl-4 pr-10 placeholder-[#71717A]"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#121212]">
                    INR
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Enter project requirements"
                  required
                  className="placeholder-[#71717A] min-h-[100px]"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-[1px] border-[#0B4776]"
                >
                  <span className="font-bold text-base">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0B4776] hover:bg-[#0B4776]/90"
                  disabled={isLoading}
                >
                  <span className="font-bold text-base">
                    {isLoading ? "Adding..." : "Done"}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

