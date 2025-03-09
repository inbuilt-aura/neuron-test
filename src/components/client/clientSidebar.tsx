"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Notepad,
  ChatCircleDots,
  CurrencyInr,
  ShieldCheck,
  Question,
} from "phosphor-react";
import {
  setProfile,
  setProfileLoading,
  setProfileError,
} from "../../store/sales/profileSlice";
import { useGetClientProfileQuery } from "../../store/apiSlice";
import type { RootState, AppDispatch } from "../../types";
import { ProfileDialog } from "../sale/update-profile";

const navigation = [
  {
    name: "My Project",
    href: "/client/project",
    icon: Notepad,
  },
  {
    name: "Payment History",
    href: "/client/payment",
    icon: CurrencyInr,
  },
  {
    name: "Security",
    href: "/client/security",
    icon: ShieldCheck,
  },
  {
    name: "Communication",
    href: "/client/communication",
    icon: ChatCircleDots,
  },
  {
    name: "Help Center",
    href: "/client/help",
    icon: Question,
  },
] as const;

interface ClientSidebarProps {
  closeSidebar?: () => void;
}

export function ClientSidebar({ closeSidebar }: ClientSidebarProps) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);
  const { data: clientProfile, error, isLoading } = useGetClientProfileQuery();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (isLoading) {
      dispatch(setProfileLoading());
    } else if (error) {
      dispatch(setProfileError("Failed to fetch client profile"));
    } else if (clientProfile) {
      dispatch(setProfile(clientProfile));
    }
  }, [clientProfile, isLoading, error, dispatch]);

  const handleProfileClick = () => {
    setIsProfileDialogOpen(true);
  };

  return (
    <div className="w-[240px] bg-[#F8FAFC] min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center ml-8">
          <Image
            src="/logo.png"
            alt="Neuron Logo"
            width={120}
            height={40}
            priority
          />
        </Link>
      </div>

      <nav className="px-3 flex-grow mt-8">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const isBeforeSecurity = index === navigation.length - 2;
          const Icon = item.icon;

          return (
            <div key={item.name}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 mb-2 h-12",
                    isActive
                      ? "bg-white font-semibold text-base text-[#0B4776]"
                      : "text-[#716F6F] hover:text-gray-900"
                  )}
                  onClick={closeSidebar}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Icon size={20} weight="light" />
                  </div>
                  <span className="text-left">{item.name}</span>
                </Button>
              </Link>
              {isBeforeSecurity && <Separator className="my-4 mx-1" />}
            </div>
          );
        })}
      </nav>

      <div className="p-3 mt-auto pb-8">
        <div
          className="flex items-center gap-3 rounded-md bg-white p-3 border border-[#E6E4F0] cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleProfileClick}
        >
          <Avatar className="h-10 w-10 rounded-md overflow-hidden">
            <AvatarImage
              src={profile.profilePic || "/avatar.png"}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="rounded-md"
            />
            <AvatarFallback className="rounded-md bg-[#0B4776] text-white">
              {profile.firstName && profile.lastName
                ? `${profile.firstName[0]}${profile.lastName[0]}`
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#53515B]">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : "Loading..."}
            </span>
            <span className="text-xs text-[#A0A0A3]">
              {profile.userType === "CLIENT"
                ? "Client"
                : profile.designation || "Client"}
            </span>
          </div>
        </div>
      </div>

      <ProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      />
    </div>
  );
}
