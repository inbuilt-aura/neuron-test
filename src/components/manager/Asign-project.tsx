"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  useGetRolesQuery,
  useGetAllEmployeesQuery,
  useAssignProjectMutation,
  type AssignProjectRequest,
  type EmployeeResponse,
} from "@/src/store/manager/managerApiSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface AssignProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  managerId: string;
  onSuccess?: () => void;
}

export function AssignProjectDialog({
  open,
  onOpenChange,
  projectId,
  managerId,
  onSuccess,
}: AssignProjectDialogProps) {
  const [designation, setDesignation] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [edd, setEdd] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch roles for the designation dropdown
  const { data: roles = [], isLoading: isRolesLoading } = useGetRolesQuery();

  // Fetch all employees for the researcher dropdown
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useGetAllEmployeesQuery();

  // Mutation to assign the project
  const [assignProject, { isLoading: isAssigning }] =
    useAssignProjectMutation();

  // Filter employees based on designation and search query
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee: EmployeeResponse) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      const matchesDesignation = designation
        ? employee.lastName.toLowerCase().includes(designation.toLowerCase())
        : true;
      return matchesSearch && matchesDesignation;
    });
  }, [employees, searchQuery, designation]);

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(
      (emp: EmployeeResponse) => emp.id.toString() === employeeId
    );
    if (employee) {
      setUserId(employee.id);
      setSelectedEmployeeName(`${employee.firstName} ${employee.lastName}`);
    }
  };

  const handleAssign = async () => {
    if (!designation || !userId || !edd) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const assignData: AssignProjectRequest = {
        designation,
        user_id: userId,
        edd: format(edd, "yyyy-MM-dd"),
      };

      const response = await assignProject({
        managerId,
        projectId,
        assignData,
      }).unwrap();

      // Close the dialog first
      onOpenChange(false);

      // Check if response is valid and status is implicitly 200 (unwrap ensures this)
      if (response && typeof response === "object" && "id" in response) {
        // Show toast after dialog is closed
        toast.success("Project assigned successfully");
      }

      if (onSuccess) onSuccess(); // Trigger success callback to refetch data
    } catch (error) {
      // Type the error properly
      const typedError = error as
        | FetchBaseQueryError
        | { data: { message: string } };
      let errorMessage = "Failed to assign project";

      if (
        "data" in typedError &&
        typedError.data &&
        typeof typedError.data === "object"
      ) {
        errorMessage =
          (typedError.data as { message: string }).message || errorMessage;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-6 relative">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold">
            Assign Project
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          {/* Select Designation */}
          <div className="grid gap-2">
            <Label htmlFor="designation" className="flex items-center">
              Select Designation <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="border rounded-md p-4 space-y-2">
              {isRolesLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : roles.length === 0 ? (
                <div className="text-center text-gray-500">
                  No roles available
                </div>
              ) : (
                roles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`role-${role}`}
                      name="designation"
                      value={role}
                      checked={designation === role}
                      onChange={() => {
                        setDesignation(role);
                        setUserId(null);
                        setSelectedEmployeeName("");
                      }}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor={`role-${role}`} className="cursor-pointer">
                      {role}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Select Researcher */}
          <div className="grid gap-2">
            <Label htmlFor="researcher" className="flex items-center">
              Select Researcher <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={userId?.toString() || ""}
              onValueChange={handleEmployeeSelect}
              disabled={isEmployeesLoading || !designation}
              onOpenChange={() => setSearchQuery("")} // Reset search query when dropdown opens/closes
            >
              <SelectTrigger id="researcher" className="border-gray-300">
                <SelectValue placeholder="Search by Name">
                  {selectedEmployeeName || "Search by Name"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <div className="px-3 py-2">
                  <Input
                    placeholder="Search by Name or Mobile No."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing when clicking input
                    className="mb-2"
                  />
                </div>
                {isEmployeesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="px-3 py-2 text-center text-gray-500">
                    No employees found
                  </div>
                ) : (
                  filteredEmployees.map((employee: EmployeeResponse) => (
                    <SelectItem
                      key={employee.id}
                      value={employee.id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={employee.profilePic || "/placeholder.svg"}
                          alt={`${employee.firstName} ${employee.lastName}`}
                          className="rounded-full object-cover"
                          width={30}
                          height={30}
                        />
                        <div>
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            +91 9876543210 {/* Placeholder mobile number */}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Add EDD */}
          <div className="grid gap-2">
            <Label htmlFor="edd" className="flex items-center">
              Add EDD <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-300"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {edd ? format(edd, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={edd}
                  onSelect={(date) => {
                    setEdd(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button
            onClick={handleAssign}
            disabled={isAssigning}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6"
          >
            {isAssigning ? "Assigning..." : "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
