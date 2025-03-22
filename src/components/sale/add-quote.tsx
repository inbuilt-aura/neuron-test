"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

interface AddQuoteModalProps {
  isOpen: boolean;
  projectId: number;
  onClose: () => void;
  onQuoteAdded: (success: boolean) => void;
  onSubmit: (amount: string, requirement: string) => Promise<void>;
}

export function AddQuoteModal({
  isOpen,
  onClose,
  onQuoteAdded,
  onSubmit,
}: AddQuoteModalProps) {
  const [amount, setAmount] = useState("");
  const [requirement, setRequirement] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!requirement.trim()) {
      toast.error("Please enter the requirements");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(amount, requirement);
      onQuoteAdded(true);
      onClose();
    } catch (error) {
      console.error("Failed to send quote:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(`Failed to send quote: ${errorMessage}`);
      onQuoteAdded(false);
    } finally {
      setIsLoading(false);
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
                <Label htmlFor="requirement">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirement"
                  name="requirement"
                  placeholder="Enter project requirements"
                  required
                  className="placeholder-[#71717A] min-h-[100px]"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
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
                    {isLoading ? "Sending..." : "Done"}
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
