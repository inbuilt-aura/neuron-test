"use client";

import type React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Client, ProjectFormData } from "../../../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useFetchclientsQuery,
  useCreateProjectMutation,
} from "@/src/store/sales/salesApiSlice";
import { toast } from "react-hot-toast";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData) => void;
  userId: string;
};

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  userId,
}: CreateProjectModalProps) {
  // Remove this line
  // const userId = useSelector((state: RootState) => state.auth.user?.id);
  const {
    data: clients,
    isLoading: clientsLoading,
    isError: clientsError,
  } = useFetchclientsQuery(userId || "");
  const [createProject, { isLoading: isCreatingProject }] =
    useCreateProjectMutation();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const handleClientChange = useCallback((client: Client) => {
    setSelectedClient(client);
    setIsClientDropdownOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isCreatingProject) return;

      if (!selectedClient) {
        setError("Please select a client");
        return;
      }
      setError("");

      const formData = new FormData(e.currentTarget);
      const projectData: ProjectFormData = {
        clientId: selectedClient.userId,
        name: formData.get("projectName") as string,
        projectType: formData.get("projectType") as "REGULAR" | "FAST_TRACK",
        cost: Number.parseFloat(formData.get("amount") as string),
        requirements: formData.get("requirements") as string,
      };

      try {
        const response = await createProject({
          userId: userId || "",
          projectData,
        }).unwrap();
        if (response && "id" in response) {
          onSubmit(projectData);
          onClose();
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Failed to create project:", error);
        let errorMessage = "Failed to create project. Please try again.";
        if (typeof error === "object" && error !== null && "data" in error) {
          const errorData = error.data as { message?: string };
          errorMessage = errorData.message || errorMessage;
        }
        toast.error(errorMessage);
        setError(errorMessage);
      }
    },
    [
      selectedClient,
      createProject,
      userId,
      onSubmit,
      onClose,
      isCreatingProject,
    ]
  );

  if (!isOpen) return null;

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
            <CardTitle>Create Project</CardTitle>
            <CardDescription>Create a new project for a client</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">
                    Select Client <span className="text-red-500">*</span>
                  </Label>
                  <Popover
                    open={isClientDropdownOpen}
                    onOpenChange={setIsClientDropdownOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isClientDropdownOpen}
                        className="w-full justify-between"
                      >
                        {selectedClient
                          ? `${selectedClient.firstName} ${selectedClient.lastName}`
                          : "Search by Name or Mobile No."}
                        <X
                          className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${
                            selectedClient ? "block" : "hidden"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(null);
                          }}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <div className="max-h-[300px] overflow-y-auto">
                        {clientsLoading && (
                          <p className="text-center p-4">Loading...</p>
                        )}
                        {clientsError && (
                          <p className="text-center p-4 text-red-500">
                            Failed to load clients.
                          </p>
                        )}
                        {!clientsLoading &&
                          !clientsError &&
                          clients?.map((client: Client) => (
                            <div
                              key={client.userId}
                              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleClientChange(client)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                                  <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 text-lg font-semibold">
                                    {client.firstName.charAt(0)}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium">{`${client.firstName} ${client.lastName}`}</div>
                                  <div className="text-sm text-gray-500">
                                    {`+${client.countryCode} ${client.mobileNumber}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    placeholder="Enter Name Here"
                    required
                    className="placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={selectedClient?.email || ""}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={
                      selectedClient
                        ? `+${selectedClient.countryCode} ${selectedClient.mobileNumber}`
                        : ""
                    }
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType">
                    Project Type <span className="text-red-500">*</span>
                  </Label>
                  <Select name="projectType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">Simple Project</SelectItem>
                      <SelectItem value="FAST_TRACK">
                        Fast Track Project
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Total Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="00.00"
                      required
                      className="placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm"
                    />
                    <div className="flex items-center justify-center rounded-md border px-3 text-sm">
                      INR
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Enter a description..."
                  required
                  className="min-h-[100px] placeholder:text-[#71717A] placeholder:font-normal placeholder:text-sm"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
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
                  disabled={isCreatingProject}
                >
                  <span className="font-bold text-base">
                    {isCreatingProject
                      ? "Creating Project..."
                      : "Create Project"}
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
