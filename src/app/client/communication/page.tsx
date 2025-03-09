"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BellRing, HelpCircle, Search } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useFetchChatSalesQuery } from "../../../store/client/clientApiSlice";
import type { ChatSalesResponse } from "../../../store/client/clientApiSlice";

export default function ClientCommunicationPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  const { data: chatSales, isLoading } = useFetchChatSalesQuery();

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const formatLastViewed = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleChatSelection = (chatId: string) => {
    router.push(`/client/communication/${chatId}`);
  };

  const getSalesParticipant = (
    participants: ChatSalesResponse["participants"]
  ) => {
    return participants.find((p) => p.user.role === "SALES");
  };

  const filteredChats = React.useMemo(() => {
    if (!chatSales) return [];
    return chatSales.filter((chat) => {
      const salesParticipant = getSalesParticipant(chat.participants);
      if (!salesParticipant) return false;
      const fullName =
        `${salesParticipant.user.firstName} ${salesParticipant.user.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [chatSales, searchQuery]);

  const renderChatList = () => {
    if (!filteredChats || filteredChats.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No chats available</p>
        </div>
      );
    }

    return filteredChats.map((chat: ChatSalesResponse) => {
      const salesParticipant = getSalesParticipant(chat.participants);
      if (!salesParticipant) return null;

      const lastMessage = chat.last_message;
      const lastViewedTime = salesParticipant.last_viewed
        ? formatLastViewed(salesParticipant.last_viewed)
        : "Never";

      return (
        <div
          key={chat.id}
          className="p-4 hover:bg-[#F5F1FF] cursor-pointer transition-colors duration-200 sm:hover:rounded-none hover:rounded-lg"
          onClick={() => handleChatSelection(chat.id)}
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 shrink-0">
              {salesParticipant.user.profilePic ? (
                <AvatarImage
                  src={salesParticipant.user.profilePic}
                  alt={`${salesParticipant.user.firstName} ${salesParticipant.user.lastName}`}
                />
              ) : (
                <AvatarFallback>
                  {salesParticipant.user.firstName[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 max-w-full sm:max-w-[80%]">
                  <span className="font-medium whitespace-nowrap">
                    {salesParticipant.user.firstName}{" "}
                    {salesParticipant.user.lastName}
                  </span>
                  {lastMessage && (
                    <span className="text-gray-500 truncate text-sm">
                      {lastMessage.msg_params?.text || "No message"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  {lastMessage && (
                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      {formatTime(lastMessage.created)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last seen: {lastViewedTime}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 sm:pt-4 pt-20 sm:p-6 bg-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Communication</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#ECF1F4] rounded-lg p-2"
          >
            <BellRing className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#ECF1F4] rounded-lg p-2"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Card className="flex flex-col sm:flex-row flex-1 rounded-lg overflow-hidden h-[calc(100vh-120px)] border-0 sm:border">
        {/* Mobile Search Bar */}
        <div className="p-4 block sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="sm:w-64 sm:border-r px-4 sm:px-0 mt-2 sm:mt-0">
          <div className="hidden sm:block p-4 border-b">
            <h2 className="font-medium">Filters</h2>
          </div>
          <div className="flex sm:flex-col sm:border-b-0 bg-[#F5F1FF] rounded-lg p-1 sm:p-0 sm:bg-transparent sm:rounded-none">
            <div className="flex-1 text-center sm:text-left px-4 py-2 cursor-pointer rounded-lg sm:rounded-none bg-white shadow-sm sm:shadow-none sm:bg-[#F5F1FF]">
              <span className="text-[#6E56CF] font-medium">Leads</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col mt-4 sm:mt-0">
          <div className="hidden sm:flex p-4 border-b justify-between items-center">
            <h2 className="font-medium">Chats</h2>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y">{renderChatList()}</div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
