"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  // userId: string; // Add userId prop
  // projectId: string; // Add projectId prop
}

export function AddNoteModal({ isOpen, onClose, onSubmit }: AddNoteModalProps) {
  // const [addNote, { isLoading }] = useAddNoteMutation(); // Mutation hook

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const note = formData.get("note") as string;
    onSubmit(note);
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />
        <div className="relative z-50 w-full max-w-lg">
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
              <CardTitle className="font-medium text-2xl">Add Note</CardTitle>
              <CardDescription className="font-medium text-base text-[#716F6F]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note" className="font-medium text-sm">
                    Add <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Enter a description..."
                    required
                    className="min-h-[150px] placeholder:text-[#71717A] placeholder:font-normal placeholder:text-base"
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onClose} className="border-[1px] border-[#0B4776]">
                    <span className="font-bold text-base">Cancel</span>
                  </Button>
                  <Button type="submit" className="bg-[#0B4776] hover:bg-[#0B4776]/90">
                    <span className="font-bold text-base">Add</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
