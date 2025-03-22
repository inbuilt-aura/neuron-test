"use client";

import type React from "react";
import { type FC, useState, useEffect } from "react";
import { BellRing, HelpCircle, LogOut } from "lucide-react";
import { Gear } from "phosphor-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/src/store/authSlice";
import type { RootState } from "@/src/store/store";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useFetchNotificationsQuery,
  useMarkNotificationAsReadMutation,
  type Notification,
} from "../../store/client/clientApiSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  extraContent?: React.ReactNode;
  className?: string;
}

const Header: FC<HeaderProps> = ({
  title,
  subtitle,
  extraContent,
  className = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<
    "unread" | "all"
  >("unread");
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch notifications with proper error typing
  const {
    data: unreadNotifications = [],
    error: unreadError,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useFetchNotificationsQuery(
    { unread: true },
    {
      // Skip if not authenticated to prevent unnecessary requests
      skip: !isAuthenticated,
      // Don't show error UI for failed requests
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const {
    data: allNotifications = [],
    error: allError,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useFetchNotificationsQuery(
    {},
    {
      // Skip if not authenticated to prevent unnecessary requests
      skip: !isAuthenticated,
      // Don't show error UI for failed requests
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // Mutation for marking notifications as read
  const [markAsRead] = useMarkNotificationAsReadMutation();

  // Get the notifications to display based on the filter
  const displayedNotifications =
    notificationFilter === "unread" ? unreadNotifications : allNotifications;

  // Handle errors silently with proper typing
  useEffect(() => {
    if (unreadError) {
      const errorMessage = isFetchBaseQueryError(unreadError)
        ? `Error ${unreadError.status}: ${JSON.stringify(unreadError.data)}`
        : unreadError.message || "Unknown error fetching unread notifications";
      console.warn(errorMessage);
    }
    if (allError) {
      const errorMessage = isFetchBaseQueryError(allError)
        ? `Error ${allError.status}: ${JSON.stringify(allError.data)}`
        : allError.message || "Unknown error fetching all notifications";
      console.warn(errorMessage);
    }
  }, [unreadError, allError]);

  // Helper function to type-check FetchBaseQueryError
  function isFetchBaseQueryError(
    error: FetchBaseQueryError | SerializedError | undefined
  ): error is FetchBaseQueryError {
    return error !== undefined && "status" in error;
  }

  // Refetch notifications when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      refetchUnread().catch((err: Error) =>
        console.warn("Failed to refetch unread notifications:", err.message)
      );
      refetchAll().catch((err: Error) =>
        console.warn("Failed to refetch all notifications:", err.message)
      );
    }
  }, [showNotifications, refetchUnread, refetchAll]);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  // Handle notification click - mark as read and redirect
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Only mark as read if it's not already read
      if (!notification.seen) {
        await markAsRead({ notificationId: notification.id });
        toast.success("Notification marked as read");
      }

      // Determine the redirect path based on user designation
      let basePath = "/client";
      if (user?.designation) {
        const designation = user.designation.toLowerCase();
        if (designation === "sales") {
          basePath = "/sales";
        } else if (designation === "manager") {
          basePath = "/manager";
        } else if (designation === "admin") {
          basePath = "/admin";
        } else if (designation === "sme") {
          basePath = "/sme";
        }
      }

      // Redirect to the communication page
      router.push(`${basePath}/communication`);

      // Close the notification dropdown
      setShowNotifications(false);
    } catch (error) {
      console.error(
        "Failed to process notification:",
        error instanceof Error ? error.message : String(error)
      );
      // Show a toast but don't throw an error to the UI
      toast.error("Failed to process notification");
    }
  };

  // Format notification time
  const formatNotificationTime = (timeString: string): string => {
    try {
      const notificationTime = new Date(timeString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - notificationTime.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} days ago`;

      return notificationTime.toLocaleDateString();
    } catch (error) {
      console.warn(
        "Error formatting time:",
        error instanceof Error ? error.message : String(error)
      );
      return "Unknown time";
    }
  };

  return (
    <header className={`p-4 bg-white rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu
            open={showNotifications}
            onOpenChange={setShowNotifications}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="p-2 bg-gray-100 shadow hidden md:inline-flex relative"
              >
                <BellRing className="h-5 w-5 text-gray-700" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <Card className="shadow-none border-0">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium">Your Notifications</h3>
                  <select
                    className="text-sm border rounded px-2 py-1"
                    value={notificationFilter}
                    onChange={(e) =>
                      setNotificationFilter(e.target.value as "unread" | "all")
                    }
                  >
                    <option value="unread">Unread</option>
                    <option value="all">All</option>
                  </select>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {isLoadingUnread && notificationFilter === "unread" ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading notifications...
                    </div>
                  ) : isLoadingAll && notificationFilter === "all" ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading notifications...
                    </div>
                  ) : displayedNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications to display
                    </div>
                  ) : (
                    displayedNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          !notification.seen ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                              <Image
                                src={
                                  notification.from?.profilePic ||
                                  `/placeholder.svg?height=40&width=40&text=${notification.text.charAt(
                                    0
                                  )}`
                                }
                                alt={`${
                                  notification.from?.firstName || "User"
                                }`}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-1">
                              <span className="font-medium">
                                {notification.text}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatNotificationTime(notification.time)}
                            </div>
                            <div className="mt-1 text-sm">
                              {notification.description}
                            </div>
                            {!notification.seen && (
                              <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  New
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className="p-2 bg-gray-100 shadow hidden md:inline-flex"
          >
            <HelpCircle className="h-5 w-5 text-gray-700" />
          </Button>

          {isAuthenticated && (
            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                className="p-2 bg-gray-100 shadow"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Gear size={20} />
              </Button>
              {showDropdown && (
                <Card className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                  <Button
                    variant="ghost"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {extraContent && (
        <div className="hidden md:flex justify-between items-center">
          {extraContent}
        </div>
      )}
    </header>
  );
};

export default Header;
