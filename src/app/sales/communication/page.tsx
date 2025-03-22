"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BellRing, HelpCircle, Search } from "lucide-react";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  useFetchChatLeadsQuery,
  useFetchGroupChatsQuery,
} from "../../../store/sales/salesApiSlice";
import type { ChatLead, GroupChat } from "../../../types";

export default function CommunicationPage() {
  const [activeFilter, setActiveFilter] = React.useState<"leads" | "clients">("leads");
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  const { data: chatLeads, isLoading: isLeadsLoading } = useFetchChatLeadsQuery();
  const { data: groupChats, isLoading: isGroupChatsLoading } = useFetchGroupChatsQuery();

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleChatSelection = (chatId: string) => {
    router.push(`/sales/communication/${chatId}`);
  };

  const getClientParticipant = (participants: ChatLead["participants"]) => {
    return participants.find((p) => p.user.role === "CLIENT");
  };

  // Helper function to get display text based on msg_type
  const getMessageDisplayText = (
    msg_type: string,
    msg_params?: ChatLead["last_message"]["msg_params"] | GroupChat["last_message"]["msg_params"]
  ): string => {
    if (!msg_params) return "No message";

    switch (msg_type) {
      case "text":
        return (msg_params as { text?: string }).text || "No message";
      case "file":
        const fileParams = msg_params as { filename?: string; name?: string; text?: string };
        return fileParams.text || fileParams.filename || fileParams.name || "File shared";
      case "quote":
        return (msg_params as { requirement?: string }).requirement || "Quote sent";
      default:
        return "No message";
    }
  };

  const renderLeadChats = () => {
    if (!chatLeads || chatLeads.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No chats yet</p>
        </div>
      );
    }

    return chatLeads.map((chat: ChatLead) => {
      const clientParticipant = getClientParticipant(chat.participants);
      if (!clientParticipant) return null;

      return (
        <div
          key={chat.id}
          className="p-4 hover:bg-[#F5F1FF] cursor-pointer transition-colors duration-200 sm:hover:rounded-none hover:rounded-lg"
          onClick={() => handleChatSelection(chat.id)}
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 shrink-0">
              {clientParticipant.user.profilePic ? (
                <AvatarImage
                  src={clientParticipant.user.profilePic}
                  alt={`${clientParticipant.user.firstName} ${clientParticipant.user.lastName}`}
                />
              ) : (
                <AvatarFallback>
                  {clientParticipant.user.firstName[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 max-w-full sm:max-w-[80%]">
                  <span className="font-medium whitespace-nowrap">
                    {clientParticipant.user.firstName} {clientParticipant.user.lastName}
                  </span>
                  {chat.last_message && (
                    <span className="text-gray-500 truncate text-sm">
                      {getMessageDisplayText(chat.last_message.msg_type, chat.last_message.msg_params)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  {chat.last_message && (
                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      {formatTime(chat.last_message.created)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
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
                {getMessageDisplayText(groupChat.last_message.msg_type, groupChat.last_message.msg_params)}
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

  if (isLeadsLoading || isGroupChatsLoading) {
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
          <Button variant="ghost" size="icon" className="bg-[#ECF1F4] rounded-lg p-2">
            <BellRing className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-[#ECF1F4] rounded-lg p-2">
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

        <div className="sm:w-64 sm:border-r px-4 sm:px-0 mt-2 sm:mt-0">
          <div className="hidden sm:block p-4 border-b">
            <h2 className="font-medium">Filters</h2>
          </div>
          <div className="flex sm:flex-col sm:border-b-0 bg-[#F5F1FF] rounded-lg p-1 sm:p-0 sm:bg-transparent sm:rounded-none">
            <div
              className={`flex-1 text-center sm:text-left px-4 py-2 cursor-pointer rounded-lg sm:rounded-none ${
                activeFilter === "leads" ? "bg-white shadow-sm sm:shadow-none sm:bg-[#F5F1FF]" : ""
              }`}
              onClick={() => setActiveFilter("leads")}
            >
              <span className={`${activeFilter === "leads" ? "text-[#6E56CF]" : "text-gray-900"} font-medium`}>
                Leads
              </span>
            </div>
            <div
              className={`flex-1 text-center sm:text-left px-4 py-2 cursor-pointer rounded-lg sm:rounded-none ${
                activeFilter === "clients" ? "bg-white shadow-sm sm:shadow-none sm:bg-[#F5F1FF]" : ""
              }`}
              onClick={() => setActiveFilter("clients")}
            >
              <span className={`${activeFilter === "clients" ? "text-[#6E56CF]" : "text-gray-900"} font-medium`}>
                Clients
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col mt-4 sm:mt-0">
          <div className="hidden sm:flex p-4 border-b justify-between items-center">
            <h2 className="font-medium">Chats</h2>
          </div>
          <div className="divide-y overflow-y-auto flex-1">
            {activeFilter === "leads" ? renderLeadChats() : renderGroupChats()}
          </div>
        </div>
      </Card>
    </div>
  );
}