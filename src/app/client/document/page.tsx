"use client"

import Header from "@/src/components/sale/header"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import DocumentRequestsTable from "../../../components/client/document-request-table"
import { useFetchDocumentRequestsQuery } from "@/src/store/client/clientApiSlice"
import { useSelector } from "react-redux"
import { skipToken } from "@reduxjs/toolkit/query/react"
import toast from "react-hot-toast"

interface User {
  userId: string
  name: string
}

interface FormattedDocumentRequest {
  srNo: number
  details: string
  requestDate: string
  status: "PENDING" | "FULFILLED" | "OVERDUE"
  dueDate: string
  id: number
}

const DocumentRequests = () => {
  const [requests, setRequests] = useState<FormattedDocumentRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const user = useSelector((state: { auth: { user: User | null } }) => state.auth.user)

  const userId = user?.userId ? user.userId.toString().trim() : undefined

  const { data, isLoading, error, refetch } = useFetchDocumentRequestsQuery(userId ?? skipToken, {
    skip: !userId || userId === "undefined",
  })

  useEffect(() => {
    if (isLoading) {
      toast.loading("Fetching document requests...", { id: "docs-loading" })
    } else {
      toast.dismiss("docs-loading")
    }

    if (error) {
      toast.error("Failed to load document requests. Please try again.", {
        id: "docs-error",
      })
      console.error("Document requests fetch error:", error)
    }

    if (data) {
      const formattedData: FormattedDocumentRequest[] = data.map((doc, index) => ({
        srNo: index + 1,
        details: doc.description,
        requestDate: new Date(doc.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: doc.status as "PENDING" | "FULFILLED" | "OVERDUE",
        dueDate: new Date(doc.due_date).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        id: doc.id,
      }))

      if (JSON.stringify(formattedData) !== JSON.stringify(requests)) {
        setRequests(formattedData)
        if (requests.length > 0) {
          toast.success("Document requests updated!", {
            id: "docs-success",
          })
        }
      }
    }
  }, [data, isLoading, error, requests])

  const filteredRequests = requests.filter((request) =>
    request.details.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!userId || userId === "undefined") {
    return (
      <div className="flex min-h-screen">
        <main className="flex-1">
          <Header extraContent={<h2 className="text-xl font-semibold">Document Requests</h2>} />
          <div className="p-4">
            <p className="text-red-500">Error: User information is missing. Please log in to view document requests.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen sm:pt-0 pt-6">
      <main className="flex-1">
        <Header extraContent={<h2 className="text-xl font-semibold">Document Requests</h2>} />
        {/* Search container with same max-width and padding as table container */}
        <div className="mx-auto max-w-[1400px] px-6 pt-6 sm:pt-4">
          <div className="flex justify-end">
            <div className="relative sm:w-[25rem] w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search by details..."
                className="pl-10 w-full bg-white border border-gray-200 focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="p-4 text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">Error fetching data</div>
        ) : (
          <div className="mt-4">
            <DocumentRequestsTable data={filteredRequests} userId={userId} refetch={refetch} />
          </div>
        )}
      </main>
    </div>
  )
}

export default DocumentRequests

