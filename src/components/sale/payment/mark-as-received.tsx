"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarkAsReceivedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function MarkAsReceivedModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: MarkAsReceivedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#33333326] backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md">
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
            <CardTitle>Mark As Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              Please confirm that you have received the payment for this
              project.
            </p>
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[1px] border-[#0B4776]"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="bg-[#0B4776] hover:bg-[#0B4776]/90"
              >
                {isLoading ? "Confirming..." : "Confirm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
