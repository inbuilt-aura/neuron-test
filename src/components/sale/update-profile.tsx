"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { setProfile } from "../../store/sales/profileSlice";
import { useUpdateProfilePictureMutation } from "../../store/apiSlice";
import type { RootState, AppDispatch } from "../../types";
import toast from "react-hot-toast";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);
  const [updateProfilePicture] = useUpdateProfilePictureMutation();

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [profilePic, setProfilePic] = useState(profile.profilePic);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setProfilePic(profile.profilePic);
  }, [profile]);

  const handleSave = async () => {
    onOpenChange(false);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        console.log("Attempting to upload profile picture");
        const formData = new FormData();
        formData.append("file", file);
        const result = await updateProfilePicture(formData).unwrap();
        console.log("Profile picture update successful:", result);
        setProfilePic(result.profilePic);
        dispatch(setProfile({ ...profile, profilePic: result.profilePic }));
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        if (typeof error === "object" && error !== null) {
          if ("status" in error && error.status === 401) {
            console.error(
              "Unauthorized: Bearer token might be missing or invalid"
            );
            toast.error("Unauthorized: Please log in again.");
          } else if ("data" in error) {
            console.error("Error details:", error.data);
            toast.error(
              `Failed to update profile picture: ${JSON.stringify(error.data)}`
            );
          } else {
            toast.error(
              "An unexpected error occurred while updating the profile picture."
            );
          }
        } else {
          toast.error(
            "An unexpected error occurred while updating the profile picture."
          );
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] w-full sm:max-w-[425px] rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profilePic} alt={`${firstName} ${lastName}`} />
              <AvatarFallback>
                {firstName[0]}
                {lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2 w-full">
              <Label htmlFor="file" className="text-sm font-medium">
                Upload New Photo
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full max-w-xs"
                id="file"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                className="w-full"
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                className="w-full"
                disabled
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
