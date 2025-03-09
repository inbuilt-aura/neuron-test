"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useTransferLeadMutation, useFetchSalesUsersQuery } from "@/src/store/sales/salesApiSlice"
import type { RootState } from "@/src/store/store"
import type { UserProfile } from "../../../types"

interface TransferLeadDialogProps {
  open: boolean
  onClose: () => void
  leadId: string
  onTransferSuccess: () => void
}

export default function TransferLeadDialog({ open, onClose, leadId, onTransferSuccess }: TransferLeadDialogProps) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id)
  const [transferLead, { isLoading }] = useTransferLeadMutation()
  const { data: salesUsers, isLoading: isLoadingSalesUsers } = useFetchSalesUsersQuery()

  useEffect(() => {
    if (open) {
      setSelectedUser(null)
      setError(null)
    }
  }, [open])

  const currentUserIdNumber = currentUserId ? Number(currentUserId) : -1

  const filteredSalesUsers = salesUsers?.filter((user) => user.id !== currentUserIdNumber) || []

  const handleTransfer = async () => {
    if (selectedUser !== null && currentUserId) {
      try {
        setError(null)
        await transferLead({
          userId: currentUserId.toString(),
          leadId,
          salesPersonId: selectedUser.toString(),
        }).unwrap()
        toast.success("Lead transferred successfully")
        onTransferSuccess() // Call the onTransferSuccess prop
        onClose()
      } catch (err) {
        console.error("Failed to transfer lead:", err)
        setError("Failed to transfer lead. Please try again.")
        toast.error("Failed to transfer lead")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Lead</DialogTitle>
          <DialogDescription>Select a sales person to transfer this lead to.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingSalesUsers ? (
            <p>Loading sales persons...</p>
          ) : filteredSalesUsers.length === 0 ? (
            <p>No other sales persons available for transfer.</p>
          ) : (
            filteredSalesUsers.map((user: UserProfile) => (
              <div key={user.id} className="flex items-center justify-between space-x-2">
                <label htmlFor={`checkbox-${user.id}`} className="flex-1">
                  {user.firstName} {user.lastName}
                </label>
                <Checkbox
                  id={`checkbox-${user.id}`}
                  className="border-[#0B4776] text-[#0B4776] ring-[#0B4776]"
                  checked={selectedUser === user.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUser(user.id)
                    } else {
                      setSelectedUser(null)
                    }
                  }}
                />
              </div>
            ))
          )}
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <DialogFooter>
          <button className="px-4 py-2 border border-custom-color text-[#0B4776] rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-custom-blue text-white rounded"
            onClick={handleTransfer}
            disabled={selectedUser === null || isLoading}
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

