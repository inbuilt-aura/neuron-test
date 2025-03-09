import React, { useState, useEffect } from "react";
import { X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Lead, Service } from "@/src/types";
import { useFetchTypeOfServiceQuery } from "@/src/store/apiSlice";

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSubmit: (data: Partial<Lead>) => void;
}

export function EditLeadModal({
  isOpen,
  onClose,
  lead,
  onSubmit,
}: EditLeadModalProps) {
  const [requirements, setRequirements] = useState("");
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");

  const {
    data: services,
    isLoading,
    isError,
  } = useFetchTypeOfServiceQuery({ value: "" });

  useEffect(() => {
    if (lead) {
      setRequirements(lead.requirements);
      setSelectedService(lead.projectServiceTypeId);
      setFollowUpDate(lead.followUpDate.split("T")[0]); // Assuming the date is in ISO format
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      requirements,
      projectServiceTypeId: selectedService,
      followUpDate,
    });
  };

  if (!isOpen || !lead) return null;

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
            <CardTitle>Edit Lead</CardTitle>
            <CardDescription>Update the lead&apos;s information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={lead.firstName} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lead.lastName} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={lead.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile No.</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={`+${lead.countryCode} ${lead.mobileNumber}`}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType">
                    Type Of Service <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedService?.toString() || ""}
                    onValueChange={(value) => setSelectedService(Number(value))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading && (
                        <SelectItem value="loading">Loading...</SelectItem>
                      )}
                      {isError && (
                        <SelectItem value="error">
                          Error loading services
                        </SelectItem>
                      )}
                      {services &&
                        services.map((service: Service) => (
                          <SelectItem
                            key={service.id}
                            value={service.id.toString()}
                          >
                            {service.shortName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpDate">
                    Follow-up Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Enter a description..."
                  required
                  className="min-h-[100px] placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm"
                />
              </div>
              <div className="flex justify-between gap-4">
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
                >
                  Update Lead
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditLeadModal;

