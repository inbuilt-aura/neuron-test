"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type PaymentToggleProps = {
  selectedMetric: string;
  onChange: (value: string) => void;
};

export default function PaymentToggle({ selectedMetric, onChange }: PaymentToggleProps) {
  const handleToggle = (value: string) => {
    if (value) onChange(value);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <ToggleGroup
        type="single"
        value={selectedMetric}
        onValueChange={handleToggle}
        className="w-full max-w-md"
      >
        <ToggleGroupItem
          value="completed"
          className={`w-full text-center ${selectedMetric === "completed" ? "bg-blue-500 text-white" : ""}`}
        >
          Completed Payment
        </ToggleGroupItem>
        <ToggleGroupItem
          value="pending"
          className={`w-full text-center ${selectedMetric === "pending" ? "bg-blue-500 text-white" : ""}`}
        >
          Pending Payment
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
