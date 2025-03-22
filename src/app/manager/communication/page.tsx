"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BellRing, HelpCircle, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useFetchGroupChatsQuery } from "../../../store/manager/managerApiSlice";
import type { GroupChat } from "../../../types";

export default function CommunicationPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  const { data: groupChats, isLoading: isGroupChatsLoading } =
    useFetchGroupChatsQuery();

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleChatSelection = (chatId: string) => {
    router.push(`/manager/communication/${chatId}`);
  };

  // Helper function to get display text based on msg_type
  const getMessageDisplayText = (
    msg_type: string,
    msg_params?: GroupChat["last_message"]["msg_params"]
  ): string => {
    if (!msg_params) return "No message";

    switch (msg_type) {
      case "text":
        return (msg_params as { text?: string }).text || "No message";
      case "file":
        const fileParams = msg_params as {
          filename?: string;
          name?: string;
          text?: string;
        };
        return (
          fileParams.text ||
          fileParams.filename ||
          fileParams.name ||
          "File shared"
        );
      case "quote":
        return (
          (msg_params as { requirement?: string }).requirement || "Quote sent"
        );
      default:
        return "No message";
    }
  };

  const renderGroupChats = () => {
    if (!groupChats || groupChats.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No group chats yet</p>
        </div>
      );
    }

    return groupChats.map((groupChat: GroupChat) => (
      <div
        key={groupChat.id}
        className="p-4 hover:bg-[#F5F1FF] cursor-pointer transition-colors duration-200 sm:hover:rounded-none hover:rounded-lg"
        onClick={() => handleChatSelection(groupChat.id)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 max-w-full sm:max-w-[80%]">
            <span className="font-medium">{groupChat.name}</span>
            {groupChat.last_message && (
              <span className="text-gray-500 truncate text-sm">
                {getMessageDisplayText(
                  groupChat.last_message.msg_type,
                  groupChat.last_message.msg_params
                )}
              </span>
            )}
          </div>
          {groupChat.last_message && (
            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap mt-1 sm:mt-0">
              {formatTime(groupChat.last_message.created)}
            </span>
          )}
        </div>
      </div>
    ));
  };

  if (isGroupChatsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 sm:p-6 bg-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Communication</h1>
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

        {/* <div className="sm:w-64 sm:border-r px-4 sm:px-0 mt-2 sm:mt-0">
          <div className="hidden sm:block p-4 border-b">
            <h2 className="font-medium">Filters</h2>
          </div>
          <div className="flex sm:flex-col sm:border-b-0 bg-[#F5F1FF] rounded-lg p-1 sm:p-0 sm:bg-transparent sm:rounded-none">
            <div className="flex-1 text-center sm:text-left px-4 py-2 rounded-lg sm:rounded-none bg-white shadow-sm sm:shadow-none sm:bg-[#F5F1FF]">
              <span className="text-[#6E56CF] font-medium">Clients</span>
            </div>
          </div>
        </div> */}

        <div className="flex-1 overflow-hidden flex flex-col mt-4 sm:mt-0">
          <div className="hidden sm:flex p-4 border-b justify-between items-center">
            <h2 className="font-bold">Group Chats</h2>
          </div>
          <div className="divide-y overflow-y-auto flex-1">
            {renderGroupChats()}
          </div>
        </div>
      </Card>
    </div>
  );
}
