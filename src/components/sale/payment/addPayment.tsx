"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/datepicker"
import { Switch } from "@/components/ui/switch"
import { useSelector } from "react-redux"
import type { RootState } from "@/src/store/store"
import {
  useFetchclientsQuery,
  useFetchProjectsShortQuery,
  useAddPaymentMutation,
  useFetchProjectSummaryQuery,
} from "@/src/store/sales/salesApiSlice"
import toast from "react-hot-toast"

interface AddPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (success: boolean) => void
}

interface ClientsData {
  userId: number
  firstName: string
  lastName: string
}

interface ProjectShort {
  name: string
  id: number
  Client: {
    userId: number
    firstName: string
    lastName: string
    email: string
  }
  status: string
}

interface ApiError {
  status: number
  data: {
    code: number
    message: string
  }
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as ApiError).status === "number" &&
    "data" in error &&
    typeof (error as ApiError).data === "object" &&
    "code" in (error as ApiError).data &&
    "message" in (error as ApiError).data
  )
}

export function AddPayment({ isOpen, onClose, onSubmit }: AddPaymentModalProps) {
  const [amount, setAmount] = useState("")
  const [nextPaymentAmount, setNextPaymentAmount] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [showNextPayment, setShowNextPayment] = useState(false)

  const userId = useSelector((state: RootState) => state.auth.user?.id) ?? ""

  const { data: clients, isLoading: clientsLoading, isError: clientsError } = useFetchclientsQuery(userId)

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useFetchProjectsShortQuery({ userId, clientId: selectedClient }, { skip: !selectedClient })

  const [addPayment, { isLoading }] = useAddPaymentMutation()

  const { data: projectSummary } = useFetchProjectSummaryQuery(
    { userId, projectId: selectedProject },
    { skip: !selectedProject },
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!userId || !selectedProject || !amount) {
      toast.error("Please fill in all required fields.")
      return
    }

    if (showNextPayment && (!date || !nextPaymentAmount)) {
      toast.error("Please fill in all next payment details.")
      return
    }

    const totalAmount = Number.parseFloat(amount) + (showNextPayment ? Number.parseFloat(nextPaymentAmount) : 0)
    if (projectSummary && totalAmount > projectSummary.pendingAmount) {
      toast.error("Total amount (current + next) should not exceed pending payment")
      return
    }

    try {
      const payload: {
        userId: string
        projectId: string
        amount: string
        nextPaymentDate?: string
        nextPaymentAmount?: string
      } = {
        userId,
        projectId: selectedProject,
        amount,
      }

      if (showNextPayment && date) {
        payload.nextPaymentDate = date.toISOString().split("T")[0]
      }
      if (showNextPayment && nextPaymentAmount) {
        payload.nextPaymentAmount = nextPaymentAmount
      }

      const response = await addPayment(payload).unwrap()
      if (response) {
        toast.success("Payment added successfully")
        onSubmit(true)
        onClose()
      } else {
        onSubmit(false)
        toast.error("Failed to add payment")
      }
    } catch (error) {
      console.error("Error Adding Payment:", error)
      onSubmit(false)
      if (isApiError(error)) {
        toast.error(error.data.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#33333326] backdrop-blur-[6px]" onClick={onClose} />
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
            <CardTitle>Add Payment</CardTitle>
            <CardDescription>Fill in the details to add a payment record.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {projectSummary && (
                <>
                  <h3 className="text-lg font-bold">Project Summary</h3>
                  <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
                    <div>
                      <Label className="text-sm text-gray-500">Total Project Amount</Label>
                      <p className="text-lg font-semibold">₹ {projectSummary.cost}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Pending Amount</Label>
                      <p className="text-lg font-semibold text-red-600">₹ {projectSummary.pendingAmount}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Last Payment Date</Label>
                      <p className="text-lg font-semibold">
                        {new Date(projectSummary.lastPaymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="client"
                    value={selectedClient}
                    onValueChange={(value) => {
                      setSelectedClient(value)
                      setSelectedProject("")
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsLoading && <SelectItem value="loading">Loading...</SelectItem>}
                      {clientsError && <SelectItem value="error">Error loading clients</SelectItem>}
                      {clients?.map((client: ClientsData) => (
                        <SelectItem key={client.userId} value={client.userId.toString()}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Select name="project" value={selectedProject} onValueChange={setSelectedProject} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsLoading && <SelectItem value="loading">Loading...</SelectItem>}
                      {projectsError && <SelectItem value="error">Error loading projects</SelectItem>}
                      {projects?.map((project: ProjectShort) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount Received <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative w-full">
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="Enter Amount"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 pr-12"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">INR</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="next-payment">Next Payment Details</Label>
                <Switch id="next-payment" checked={showNextPayment} onCheckedChange={setShowNextPayment} />
              </div>

              {showNextPayment && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nextPaymentDate">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker selected={date} onSelect={(selectedDate) => setDate(selectedDate)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextPaymentAmount">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative w-full">
                      <Input
                        id="nextPaymentAmount"
                        name="nextPaymentAmount"
                        type="number"
                        placeholder="Enter Amount"
                        required={showNextPayment}
                        value={nextPaymentAmount}
                        onChange={(e) => setNextPaymentAmount(e.target.value)}
                        className="pl-8 pr-12"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">INR</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <Button type="button" variant="outline" onClick={onClose} className="border-[1px] border-[#0B4776]">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-[#0B4776] hover:bg-[#0B4776]/90">
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

