"use client";

import { type FC, useState, useEffect } from "react";
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
  List,
  FileText,
  X,
  Gear,
} from "phosphor-react";
import { LogOut } from "lucide-react";
import {
  setProfile,
  setProfileLoading,
  setProfileError,
} from "../../store/sales/profileSlice";
import { useGetClientProfileQuery } from "../../store/apiSlice";
import type { RootState, AppDispatch } from "../../types";
import { ProfileDialog } from "../sale/update-profile";
import { useRouter } from "next/navigation";
import { logout } from "@/src/store/authSlice";
import { toast } from "react-hot-toast";
import socketService from "../../lib/socket-service";

const navigation = [
  { name: "My Project", href: "/client/project", icon: Notepad },
  { name: "Payment History", href: "/client/payment", icon: CurrencyInr },
  { name: "Chat Support", href: "/client/communication", icon: ChatCircleDots },
  { name: "Document Request", href: "/client/document", icon: FileText },
  { name: "Security", href: "/client/security", icon: ShieldCheck },
  { name: "Help Center", href: "/client/help", icon: Question },
] as const;

const mobileNavigation = [
  { name: "My Project", href: "/client/project", icon: Notepad },
  { name: "Chat Support", href: "/client/communication", icon: ChatCircleDots },
  { name: "Payment History", href: "/client/payment", icon: CurrencyInr },
  { name: "Document Request ", href: "/client/document", icon: FileText },
] as const;

interface ProfileDropdownMobileProps {
  onProfileEdit: () => void;
  isOnline: boolean;
}

const ProfileDropdownMobile: FC<ProfileDropdownMobileProps> = ({
  onProfileEdit,
  isOnline,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const profile = useSelector((state: RootState) => state.profile);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" className="p-1" onClick={onProfileEdit}>
        <div className="relative">
          <Avatar className="h-8 w-8 rounded-md">
            <AvatarImage
              src={profile.profilePic || "/avatar.png"}
              alt={`${profile.firstName} ${profile.lastName}`}
            />
            <AvatarFallback className="rounded-md bg-[#0B4776] text-white">
              {profile.firstName && profile.lastName
                ? `${profile.firstName[0]}${profile.lastName[0]}`
                : "U"}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      </Button>

      {isAuthenticated && (
        <div className="relative">
          <Button
            variant="ghost"
            className="p-2 bg-gray-100 shadow"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Gear size={20} />
          </Button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
              <Button
                variant="ghost"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function ClientSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const authToken = useSelector(
    (state: RootState) => state.auth.token?.access.token
  );
  const { data: clientProfile, error, isLoading } = useGetClientProfileQuery();

  useEffect(() => {
    if (isLoading) {
      dispatch(setProfileLoading());
    } else if (error) {
      dispatch(setProfileError("Failed to fetch client profile"));
    } else if (clientProfile) {
      dispatch(setProfile(clientProfile));
    }
  }, [clientProfile, isLoading, error, dispatch]);

  // Monitor socket connection status
  useEffect(() => {
    if (authToken && isAuthenticated) {
      console.log("Connecting to socket in ClientSidebar");
      socketService.connect(authToken);

      const socket = socketService.getSocket();

      if (socket) {
        // Check initial connection status
        if (socket.connected) {
          console.log("Socket is already connected on mount");
          setIsOnline(true);
        }

        socket.on("connect", () => {
          console.log("Socket connected in ClientSidebar");
          setIsOnline(true);
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected in ClientSidebar");
          setIsOnline(false);
        });

        return () => {
          socket.off("connect");
          socket.off("disconnect");
        };
      }
    } else {
      console.log("Not authenticated, setting isOnline to false");
      setIsOnline(false);
    }
  }, [authToken, isAuthenticated]);

  useEffect(() => {
    console.log("isOnline state updated:", isOnline);
  }, [isOnline]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-50 border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -m-2"
          >
            <List size={24} weight="light" />
          </Button>

          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Neuron Logo"
              width={80}
              height={28}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </div>

        <ProfileDropdownMobile
          onProfileEdit={() => setIsProfileDialogOpen(true)}
          isOnline={isOnline}
        />
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:relative w-[240px] bg-[#F8FAFC] min-h-screen flex flex-col z-50 transition-transform md:translate-x-0 pt-16 md:pt-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {isSidebarOpen && (
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 md:hidden"
          >
            <X size={24} weight="light" />
          </Button>
        )}
        {/* Desktop Logo */}
        <div className="p-6 hidden md:block">
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
          {(isSidebarOpen ? mobileNavigation : navigation).map(
            (item, index) => {
              const isActive = pathname === item.href;
              // Place separator before "Security" (index 4) in desktop view
              const isBeforeSecurity = !isSidebarOpen && index === 4;

              const Icon = item.icon;

              return (
                <div key={item.name}>
                  {isBeforeSecurity && <Separator className="my-4 mx-1" />}
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-4 mb-2 h-12",
                        isActive
                          ? "bg-white font-semibold text-base text-[#0B4776]"
                          : "text-[#716F6F] hover:text-gray-900"
                      )}
                    >
                      <div className="w-10 h-10 flex items-center justify-center">
                        <Icon size={20} weight="light" />
                      </div>
                      <span className="text-left">{item.name}</span>
                    </Button>
                  </Link>
                </div>
              );
            }
          )}
        </nav>

        {/* Desktop Profile */}
        <div className="p-3 mt-auto pb-8 hidden md:block">
          <div
            className="flex items-center gap-3 rounded-md bg-white p-3 border border-[#E6E4F0] cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsProfileDialogOpen(true)}
          >
            <div className="relative">
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
              {isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-md border-2"></div>
              )}
            </div>
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
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <ProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      />
    </>
  );
}
