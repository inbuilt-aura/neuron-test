import type { PaymentTableItem as ApiPaymentTableItem } from "@/src/store/sales/salesApiSlice"

export interface ExtendedPaymentTableItem extends ApiPaymentTableItem {
  Project: {
    name: string
  }
}

export type PaymentTableMetricKeys = "Completed Payment" | "Upcoming Payment" | "Incomplete Payment"

