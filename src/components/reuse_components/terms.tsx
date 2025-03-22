"use client";

import * as React from "react";
import { DownloadSimple, FilePdf } from "phosphor-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TncTemplate {
  id: number;
  name: string;
  common_file: {
    name: string;
    size: number;
    url: string;
  };
}

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templateId: number) => void;
  templates?: TncTemplate[];
  isLoading?: boolean;
}

export function TermsModal({
  open,
  onOpenChange,
  onSelect,
  templates,
  isLoading,
}: TermsModalProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold">
            Terms & Condition
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !templates || templates.length === 0 ? (
          <div className="py-4 text-center text-gray-500">
            No templates available
          </div>
        ) : (
          <>
            <div className="py-4">
              <RadioGroup
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                className="space-y-3"
              >
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-colors bg-[#F4F5F6] hover:bg-[#F4F5F6]/80`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-[60px] h-[80px] flex-shrink-0 flex items-center justify-center bg-gray-200 rounded">
                        <FilePdf size={32} className="text-red-500" />{" "}
                        {/* Placeholder for PDF */}
                      </div>
                      <div className="flex-1 px-4">
                        <p className="text-base font-normal mb-1">
                          {template.name}
                        </p>
                        <a
                          href={template.common_file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={template.common_file.name}
                        >
                          <Button
                            variant="link"
                            className="p-0 h-auto text-[#0B4776] text-[16px] font-normal flex items-center"
                          >
                            <DownloadSimple className="w-4 h-4" />
                            <span className="mb-[1px]">Download</span>
                          </Button>
                        </a>
                      </div>
                      <RadioGroupItem
                        value={template.id.toString()}
                        id={template.id.toString()}
                        className="data-[state=checked]:border-[#3B86F2] data-[state=checked]:text-[#18181B]"
                      />
                    </div>
                  </Card>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#0B4776] text-[#0B4776]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedTemplate) {
                    onSelect(Number(selectedTemplate));
                    onOpenChange(false);
                  }
                }}
                disabled={!selectedTemplate}
                className="bg-[#0B4776] hover:bg-[#0B4776]/90 text-white"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
