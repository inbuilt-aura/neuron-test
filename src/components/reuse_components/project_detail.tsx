"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Bell,
  Question,
  Calendar,
  Files,
  TextAlignLeft,
  Clock,
  File,
  User,
  PencilSimple,
  CurrencyInr,
} from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSelector } from "react-redux"
import type { RootState } from "@/src/store/store"
import { format } from "date-fns"
import {
  useFetchProjectDetailsQuery,
  useFetchProjectNotesQuery,
  useAddProjectNoteMutation,
  useFetchProjectPaymentsQuery,
  useFetchProjectMilestonesQuery,
} from "@/src/store/sales/salesApiSlice"
import { Input } from "@/components/ui/input"
import { MilestonesSection } from "./milestone"
import { toast } from "react-hot-toast"
import type { Payment, Note } from "@/src/types/index"

interface ProjectDetailsProps {
  id: string
  onBack: () => void
  openPaymentDetails?: boolean
}

export function ProjectDetails({ id, onBack, openPaymentDetails = false }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<string>("requirement")
  const [newNote, setNewNote] = useState<string>("")
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false)

  const userId = useSelector((state: RootState) => state.auth.user?.id) ?? ""

  const { data: project, isLoading: isProjectLoading } = useFetchProjectDetailsQuery(
    { userId, projectId: id },
    { skip: !userId || !id },
  )

  const {
    data: notes,
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useFetchProjectNotesQuery({ userId, projectId: id }, { skip: !userId || !id })

  const { data: payments, isLoading: isPaymentsLoading } = useFetchProjectPaymentsQuery(
    { userId, projectId: id },
    { skip: !userId || !id },
  )

  const { data: milestoneData, isLoading: isMilestoneLoading } = useFetchProjectMilestonesQuery(
    { userId, projectId: id },
    { skip: !userId || !id },
  )

  const [addNote] = useAddProjectNoteMutation()

  useEffect(() => {
    if (openPaymentDetails) {
      setActiveTab("payment-details")
      const paymentDetailsSection = document.getElementById("payment-details-section")
      if (paymentDetailsSection) {
        paymentDetailsSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [openPaymentDetails])

  useEffect(() => {
    if (activeTab === "payment-details") {
      const paymentDetailsSection = document.getElementById("payment-details-section")
      if (paymentDetailsSection) {
        paymentDetailsSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [activeTab])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "dd/MM/yy")
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        setIsAddingNote(true)
        await addNote({ userId, projectId: id, note: newNote }).unwrap()
        setNewNote("")
        toast.success("Note added successfully!")
        refetchNotes() // Refetch notes after adding a new one
      } catch (error) {
        console.error("Failed to add note:", error)
        toast.error("Failed to add note. Please try again.")
      } finally {
        setIsAddingNote(false)
      }
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "requirement":
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="mb-4 flex items-center gap-2 text-base font-medium">
                <TextAlignLeft className="h-5 w-5" />
                Description
              </h4>
              <div className="whitespace-pre-line text-sm text-gray-600">{project?.requirements}</div>
            </Card>
          </div>
        )
      case "project-notes":
        return (
          <Card className="p-6">
            <h4 className="mb-6 flex items-center gap-2 text-base font-medium">
              <PencilSimple className="h-5 w-5" />
              Notes
            </h4>
            <div className="space-y-4 mb-6">
              {isNotesLoading ? (
                <p>Loading notes...</p>
              ) : notes && notes.length > 0 ? (
                notes.map((note: Note) => (
                  <div key={note.id} className="flex flex-col gap-1 border-b pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{`${note.CreatedBy.User.firstName} ${note.CreatedBy.User.lastName}`}</span>
                      <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{note.note}</p>
                  </div>
                ))
              ) : (
                <p>No notes available</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a new note..." />
              <Button onClick={handleAddNote} disabled={isAddingNote}>
                {isAddingNote ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </Card>
        )
      case "milestones":
        return (
          <>
            {isMilestoneLoading ? (
              <div>Loading milestones...</div>
            ) : milestoneData ? (
              <MilestonesSection
                projectEdd={milestoneData.end_date}
                projectCreatedAt={milestoneData.start_date}
                milestones={milestoneData.milestones}
              />
            ) : (
              <div>No milestone data available</div>
            )}
          </>
        )
      case "payment-details":
        return (
          <Card className="p-6 mb-2" id="payment-details-section">
            <div className="flex items-center gap-2 mb-6">
              <CurrencyInr size={20} className="text-[#808080]" />
              <h2 className="text-xl font-semibold">Payments</h2>
            </div>

            {isPaymentsLoading ? (
              <div>Loading payment details...</div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 px-4">
                  <div className="text-[14px] font-semibold text-[#808080]">AMOUNT</div>
                  <div className="text-[14px] font-semibold text-[#808080]">CLIENT NAME</div>
                  <div className="text-[14px] font-semibold text-[#808080]">PAYMENT DATE</div>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="space-y-4">
                  {payments.map((payment: Payment) => (
                    <div key={payment.id} className="grid grid-cols-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                      <div className="text-base font-medium">INR {payment.amount.toLocaleString()}</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={payment.Client.User.profilePic}
                            alt={`${payment.Client.User.firstName} ${payment.Client.User.lastName}`}
                          />
                          <AvatarFallback>
                            {getInitials(payment.Client.User.firstName, payment.Client.User.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-base">
                          {`${payment.Client.User.firstName} ${payment.Client.User.lastName}`}
                        </span>
                      </div>
                      <div className="text-base text-gray-600">{formatDate(payment.paymentDate)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>No payment details available</div>
            )}
          </Card>
        )
      default:
        return null
    }
  }

  if (isProjectLoading || !project) {
    return <div className="flex items-center justify-center h-screen">Loading project details...</div>
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="-ml-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Project Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Question className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        <Card className="w-[400px] bg-gray-50">
          <div className="p-6">
            <Card className="mb-6 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Files className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
              </div>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="text-sm font-medium">{project.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>EDD</span>
                </div>
                <span className="text-sm font-medium">{formatDate(project.edd)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <File className="h-4 w-4" />
                  <span>Project Type</span>
                </div>
                <span className="text-sm font-medium">{project.projectType}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Researcher Allotted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {project.Researcher
                        ? getInitials(project.Researcher.firstName, project.Researcher.lastName)
                        : "NA"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {project.Researcher
                      ? `${project.Researcher.firstName} ${project.Researcher.lastName}`
                      : "No Researcher"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Client</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{getInitials(project.Client.firstName, project.Client.lastName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {`${project.Client.firstName} ${project.Client.lastName}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Sales Person</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{getInitials(project.Sales.firstName, project.Sales.lastName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{`${project.Sales.firstName} ${project.Sales.lastName}`}</span>
                </div>
              </div>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-[100px] w-[100px]">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="text-[#FBFBFB]"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-[#00B884]"
                        strokeWidth="10"
                        strokeDasharray={283}
                        strokeDashoffset={283 * (1 - project.paymentTillDate / project.cost)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-semibold text-[#00B884]">
                        {Math.round((project.paymentTillDate / project.cost) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-medium">Payment Completed</span>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Start : {formatDate(project.startDate)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <div className="flex-1 overflow-y-auto">
          <div className="mb-6 flex gap-2 bg-gray-100 p-1 rounded-lg">
            {["Requirement", "Project Notes", "Milestones", "Payment Details"].map((tab) => {
              const tabId = tab.toLowerCase().replace(" ", "-")
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tabId ? "bg-white text-black shadow-sm" : "text-[#71717A] hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

