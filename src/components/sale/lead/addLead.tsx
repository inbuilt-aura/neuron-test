"use client";

import type * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Country, LeadFormData, Service } from "../../../types/index";
import { countries } from "@/src/app/(auth)/client/login/countries";
import { useFetchTypeOfServiceQuery } from "@/src/store/apiSlice";
import {
  useAddLeadMutation,
  useFetchLeadsQuery,
} from "@/src/store/sales/salesApiSlice";
import { toast } from "react-hot-toast";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => void;
}

export function AddLeadModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  //const queryClient = useQueryClient()
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const {
    data: services,
    isLoading,
    isError,
  } = useFetchTypeOfServiceQuery({ value: "" });

  const [addLead, { isLoading: isAddingLead }] = useAddLeadMutation();
  const { refetch: refetchLeads } = useFetchLeadsQuery();

  const validateMobileNumber = useCallback(
    (number: string, countryCode: string): boolean => {
      const phoneRegex = /^\d+$/;
      if (countryCode === "+91") {
        return /^[6-9]\d{9}$/.test(number);
      }
      return (
        phoneRegex.test(number) && number.length >= 7 && number.length <= 15
      );
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (
        !validateMobileNumber(
          mobileNumber,
          selectedCountry === "IN" ? "+91" : "+1"
        )
      ) {
        setError("Please enter a valid mobile number");
        return;
      }

      const formData = new FormData(e.currentTarget);
      const data: LeadFormData = {
        email: (formData.get("email") as string) || undefined,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        mobileNumber: mobileNumber,
        requirements: formData.get("requirements") as string,
        projectServiceTypeId: selectedService ?? 0,
      };

      if (
        !data.firstName ||
        !data.lastName ||
        !data.mobileNumber ||
        !data.requirements ||
        !data.projectServiceTypeId
      ) {
        setError("Please fill in all required fields");
        return;
      }

      try {
        await addLead(data).unwrap();
        refetchLeads();
        toast.success("Lead created successfully");
        onSubmit(data);
        onClose();
      } catch (err) {
        const error = err as FetchBaseQueryError;
        if (error.status === 400) {
          toast.error(
            "A lead or client already exists with this email address or mobile number"
          );
        } else if (error.status === "FETCH_ERROR") {
          toast.error(
            "Failed to connect to the server. Please check your internet connection."
          );
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      }
    },
    [
      addLead,
      mobileNumber,
      selectedCountry,
      selectedService,
      validateMobileNumber,
      onClose,
      onSubmit,
      refetchLeads,
    ]
  );

  if (!isOpen) return null;

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${isMobile ? "pb-24" : ""}`}
    >
      <div
        className={
          isMobile ? "space-y-4 bg-[#FBFBFB]" : "grid grid-cols-2 gap-4"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="text-[#FF0000]">*</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter First Name Here"
            required
            className="placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm border-[#E4E4E7]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-[#FF0000]">*</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter Last Name Here"
            required
            className="placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm border-[#E4E4E7]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-[#FF0000]">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="eg. example@email.com"
            required
            className="placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm border-[#E4E4E7]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-sm font-medium">
            Mobile No. <span className="text-[#FF0000]">*</span>
          </Label>
          <div className="flex gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[90px] border-[#E4E4E7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country: Country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.flag} {country.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="00000 00000"
              value={mobileNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setMobileNumber(e.target.value);
                setError("");
              }}
              className="flex-1 placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm border-[#E4E4E7]"
              required
            />
          </div>
          {error && <p className="text-sm text-[#FF0000]">{error}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectType" className="text-sm font-medium">
            Type Of Service <span className="text-[#FF0000]">*</span>
          </Label>
          <Select
            value={selectedService?.toString() || ""}
            onValueChange={(value) => setSelectedService(Number(value))}
          >
            <SelectTrigger className="border-[#E4E4E7]">
              <SelectValue placeholder="Select Option" />
            </SelectTrigger>
            <SelectContent>
              {isLoading && <SelectItem value="loading">Loading...</SelectItem>}
              {isError && (
                <SelectItem value="error">Error loading services</SelectItem>
              )}
              {services &&
                services.map((service: Service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.shortName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="requirements" className="text-sm font-medium">
          Requirements <span className="text-[#FF0000]">*</span>
        </Label>
        <Textarea
          id="requirements"
          name="requirements"
          placeholder="Enter a description..."
          required
          className="min-h-[100px] placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm resize-none border-[#E4E4E7]"
        />
      </div>
      <div
        className={`${
          isMobile
            ? "fixed bottom-0 left-0 right-0 p-4 z-10 grid grid-cols-2 gap-40"
            : "flex justify-between gap-4"
        }`}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-[#0B4776] text-[#0B4776] hover:bg-transparent hover:text-[#0B4776]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isAddingLead}
          className={`bg-[#0B4776] hover:bg-[#0B4776]/90 text-white ${
            isAddingLead ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isAddingLead ? "Creating..." : "Create Lead"}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="sticky top-0 flex items-center gap-4 p-4 bg-white border-b z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#0B4776] hover:bg-transparent"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Add Lead</h1>
        </div>
        <div className="p-4">{formContent}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#33333326] backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-2xl mx-4">
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
            <CardTitle>Add Leads</CardTitle>
            {/* <CardDescription>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CardDescription> */}
          </CardHeader>
          <CardContent>{formContent}</CardContent>
        </Card>
      </div>
    </div>
  );
}
