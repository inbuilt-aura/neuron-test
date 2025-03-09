import type { FC } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import type { PaymentTableItem } from "@/src/store/sales/salesApiSlice"

interface PaymentDetailsProps {
  open: boolean
  payment: PaymentTableItem | null
  onClose: () => void
}

export const PaymentDetailsDialog: FC<PaymentDetailsProps> = ({ open, payment, onClose }) => {
  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Payment Details</DialogTitle>
          <DialogClose className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" />
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex justify-between">
            <div className="text-left w-1/2">
              <div className="text-gray-500">Project Name</div>
              <div className="font-semibold text-gray-900">{payment.name}</div>
            </div>
            <div className="text-left w-1/2 pl-4">
              <div className="text-gray-500">Payment Date</div>
              <div className="font-semibold text-gray-900">
                {payment.LastPayment ? new Date(payment.LastPayment.paymentDate).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="text-left w-1/2">
              <div className="text-gray-500">Amount</div>
              <div className="font-semibold text-gray-900">
                ₹{payment.LastPayment?.amount ?? payment.NextPayment?.amount ?? "N/A"}
              </div>
            </div>
            <div className="text-left w-1/2 pl-4">
              <div className="text-gray-500">Payment Status</div>
              <div className="font-semibold text-gray-900">
                {payment.LastPayment?.completed ? "Completed" : "Pending"}
              </div>
            </div>
          </div>

          {payment.LastPayment?.completed && (
            <div className="flex justify-between mt-4">
              <div className="text-left w-1/2">
                <div className="text-gray-500">Payment Completion Date</div>
                <div className="font-semibold text-gray-900">
                  {new Date(payment.LastPayment.modifiedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {payment.NextPayment && (
            <div className="flex justify-between mt-4">
              <div className="text-left w-1/2">
                <div className="text-gray-500">Next Payment Date</div>
                <div className="font-semibold text-gray-900">
                  {new Date(payment.NextPayment.paymentDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

