import { PaymentDetails as PaymentDetailsType } from "@/src/types/index";
import { format } from "date-fns";
import { CurrencyInr } from "phosphor-react";
import { Card } from "@/components/ui/card";

interface PaymentDetailsProps {
  payments: PaymentDetailsType[];
}

export function PaymentDetails({ payments }: PaymentDetailsProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  return (
    <Card className="p-6 mb-2">
      <div className="flex items-center gap-2 mb-6">
        <CurrencyInr size={20} className="text-[#808080]" />
        <h2 className="text-xl font-semibold">Payments</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-5 px-4">
          <div className="text-[14px] font-semibold text-[#808080]">AMOUNT</div>
          <div className="text-[14px] font-semibold text-[#808080]">
            ADDED BY
          </div>
          <div className="text-[14px] font-semibold text-[#808080]">
            PAYMENT DATE
          </div>
          <div className="text-[14px] font-semibold text-[#808080]">STATUS</div>
          <div className="text-[14px] font-semibold text-[#808080]">
            NEXT PAYMENT
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-5 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="text-base font-medium">
                INR {payment.amount.toLocaleString()}
              </div>
              <div className="text-base text-gray-600">
                {payment.AddedBy.firstName} {payment.AddedBy.lastName}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-base text-blue-500">
                  {formatDate(payment.paymentDate)}
                </span>
              </div>
              <div className="text-base text-gray-600">
                {payment.completed ? "Completed" : "Pending"}
              </div>
              <div className="text-base text-gray-600">
                {payment.Next
                  ? `INR ${payment.Next.amount.toLocaleString()} on ${formatDate(
                      payment.Next.paymentDate
                    )}`
                  : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
