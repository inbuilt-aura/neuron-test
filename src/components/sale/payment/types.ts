import { Payment } from "@/src/types";

export interface PaymentTableItem extends Omit<Payment, 'Project'> {
  Project: {
    id: number;
    name: string;
  };
}

export type PaymentTableMetricKeys = "Completed Payment" | "Upcoming Payment" | "Incomplete Payment";

