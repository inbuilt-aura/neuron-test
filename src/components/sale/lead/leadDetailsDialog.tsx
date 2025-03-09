import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Lead } from "@/src/types";

interface LeadDetailsDialogProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
}

const LeadDetailsDialog: FC<LeadDetailsDialogProps> = ({
  open,
  lead,
  onClose,
}) => {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Lead Details
          </DialogTitle>
          <DialogClose className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" />
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex justify-between">
            <div className="text-left w-1/2">
              <div className="text-gray-500">Full Name</div>
              <div className="font-semibold text-gray-900">{`${lead.firstName} ${lead.lastName}`}</div>
            </div>
            <div className="text-left w-1/2 pl-4">
              <div className="text-gray-500">Email</div>
              <div className="font-semibold text-gray-900">{lead.email}</div>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="text-left w-1/2">
              <div className="text-gray-500">Mobile No.</div>
              <div className="font-semibold text-gray-900">{`+${lead.countryCode} ${lead.mobileNumber}`}</div>
            </div>
            <div className="text-left w-1/2 pl-4">
              <div className="text-gray-500">Type of Service</div>
              <div className="font-semibold text-gray-900">
                {lead.SeriviceType?.name || "N/A"}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 p-4 mt-4 rounded-md">
            <div className="font-semibold text-gray-900">Requirement</div>
            <div className="text-gray-500 mt-1">
              {lead.requirements || "No specific requirements provided"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsDialog;
