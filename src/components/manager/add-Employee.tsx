"use client";

import type * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { X, ArrowLeft, Calendar } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "react-hot-toast";
import {
  useGetRolesQuery,
  useCreateEmployeeMutation,
} from "../../store/manager/managerApiSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  managerId: string;
}

// Gender enum values that match the API requirements
const GENDER_OPTIONS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  TRANSGENDER: "TRANSGENDER",
};

export function AddEmployeeModal({
  isOpen,
  onClose,
  managerId,
}: AddEmployeeModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [gender, setGender] = useState(GENDER_OPTIONS.MALE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get roles for dropdown
  const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();

  // Create employee mutation
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!selectedRole) newErrors.role = "Please select a role";
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!age) {
      newErrors.age = "Age is required";
    } else if (isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100) {
      newErrors.age = "Please enter a valid age between 18 and 100";
    }
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!address) newErrors.address = "Address is required";
    if (!aadhar) {
      newErrors.aadhar = "Aadhaar number is required";
    } else if (!/^\d{4}\s\d{4}\s\d{4}$/.test(aadhar)) {
      newErrors.aadhar = "Please enter a valid Aadhaar number (XXXX XXXX XXXX)";
    }
    if (!gender) newErrors.gender = "Please select a gender";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    selectedRole,
    firstName,
    lastName,
    email,
    age,
    dob,
    address,
    aadhar,
    gender,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) return;

      const employeeData = {
        role: selectedRole,
        firstName,
        lastName,
        email,
        age: Number(age),
        dob,
        address,
        aadhar: aadhar.replace(/\s/g, ""),
        gender,
      };

      console.log("Submitting employee data:", employeeData);

      try {
        await createEmployee({
          managerId,
          employeeData,
        }).unwrap();

        toast.success("Employee added successfully");
        onClose();
      } catch (err) {
        console.error("Error creating employee:", err);
        const error = err as FetchBaseQueryError;
        if (error.status === 400) {
          toast.error("Invalid employee data. Please check your inputs.");
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
      validateForm,
      selectedRole,
      firstName,
      lastName,
      email,
      age,
      dob,
      address,
      aadhar,
      gender,
      createEmployee,
      managerId,
      onClose,
    ]
  );

  const formatAadhar = (value: string) => {
    // Remove all spaces first
    const digitsOnly = value.replace(/\s/g, "");

    // Format with spaces after every 4 digits
    let formatted = "";
    for (let i = 0; i < digitsOnly.length && i < 12; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += digitsOnly[i];
    }

    return formatted;
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhar(e.target.value);
    setAadhar(formatted);
    if (errors.aadhar) {
      setErrors((prev) => ({ ...prev, aadhar: "" }));
    }
  };

  const handleGenderChange = (value: string) => {
    console.log("Gender selected:", value);
    setGender(value);
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: "" }));
    }
  };

  if (!isOpen) return null;

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${isMobile ? "pb-24" : ""}`}
    >
      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Type Of Employee <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => {
              setSelectedRole(value);
              if (errors.role) {
                setErrors((prev) => ({ ...prev, role: "" }));
              }
            }}
          >
            <SelectTrigger id="role" className="border-gray-200">
              <SelectValue placeholder="Select Option" />
            </SelectTrigger>
            <SelectContent>
              {rolesLoading ? (
                <SelectItem value="loading">Loading...</SelectItem>
              ) : (
                roles?.map((role: string) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) {
                setErrors((prev) => ({ ...prev, firstName: "" }));
              }
            }}
            className="border-gray-200"
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) {
                setErrors((prev) => ({ ...prev, lastName: "" }));
              }
            }}
            className="border-gray-200"
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="eg. example@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            className="border-gray-200"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-medium">
            Age <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="eg. 28 Years"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              if (errors.age) {
                setErrors((prev) => ({ ...prev, age: "" }));
              }
            }}
            className="border-gray-200"
          />
          {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-medium">
            Date Of Birth <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                if (errors.dob) {
                  setErrors((prev) => ({ ...prev, dob: "" }));
                }
              }}
              className="border-gray-200 pr-10"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Enter Address Here"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (errors.address) {
                setErrors((prev) => ({ ...prev, address: "" }));
              }
            }}
            className="border-gray-200"
          />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Gender <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={gender}
            onValueChange={handleGenderChange}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={GENDER_OPTIONS.MALE} id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={GENDER_OPTIONS.FEMALE} id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={GENDER_OPTIONS.TRANSGENDER}
                id="transgender"
              />
              <Label htmlFor="transgender">Transgender</Label>
            </div>
          </RadioGroup>
          {errors.gender && (
            <p className="text-xs text-red-500">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadhar" className="text-sm font-medium">
            Aadhaar No. <span className="text-red-500">*</span>
          </Label>
          <Input
            id="aadhar"
            placeholder="0000 0000 0000"
            value={aadhar}
            onChange={handleAadharChange}
            maxLength={14}
            className="border-gray-200"
          />
          {errors.aadhar && (
            <p className="text-xs text-red-500">{errors.aadhar}</p>
          )}
        </div>
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
          disabled={isCreating}
          className={`bg-[#0B4776] hover:bg-[#0B4776]/90 text-white ${
            isCreating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isCreating ? "Adding..." : "Add Employee"}
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
          <h1 className="text-lg font-semibold">Add Employee</h1>
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
            <CardTitle>Add Employee</CardTitle>
          </CardHeader>
          <CardContent>{formContent}</CardContent>
        </Card>
      </div>
    </div>
  );
}
