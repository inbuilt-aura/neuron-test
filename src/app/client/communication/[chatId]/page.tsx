"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  PlusCircle,
  Check,
  CaretDown,
  Link as LinkIcon,
  DownloadSimple,
  PaperPlaneRight,
  FilePdf,
  FileDoc,
  FilePng,
} from "phosphor-react";
import {
  AtSign,
  FileText,
  IndianRupeeIcon as CurrencyInr,
  HelpCircle,
  BellRing,
  MoreVertical,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import {
  useFetchChatSalesQuery,
  useFetchChatMessagesQuery,
  useSendChatMessageMutation,
} from "../../../../store/client/clientApiSlice";
import { TermsModal } from "../../../../components/reuse_components/terms";
import type { ChatSalesResponse } from "../../../../store/client/clientApiSlice";

type ChatMessage = {
  type: string;
  msg_type: string;
  msg_params: {
    text: string;
  };
  ref_id: string;
  sent_by: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePic?: string;
      role: string;
    };
    ref_id: number;
    _id: string;
  };
  status: string;
  created: string;
  modified: string;
  id: string;
};

export default function ClientChatPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;

  const { data: chatSales, isLoading: isChatSalesLoading } =
    useFetchChatSalesQuery();
  const {
    data: chatMessages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useFetchChatMessagesQuery(chatId);
  const [sendMessage] = useSendChatMessageMutation();

  const [messageText, setMessageText] = React.useState("");
  const [activeAttachment, setActiveAttachment] = React.useState<string | null>(
    null
  );
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const conversation: ChatSalesResponse | undefined = React.useMemo(() => {
    return chatSales?.find((chat) => chat.id === chatId);
  }, [chatSales, chatId]);

  const salesParticipant = React.useMemo(() => {
    if (!conversation) return null;
    return conversation.participants.find((p) => p.user.role === "SALES");
  }, [conversation]);

  const lastSeenTime = React.useMemo(() => {
    if (!salesParticipant || !salesParticipant.last_viewed) return "Never";
    return formatDistanceToNow(new Date(salesParticipant.last_viewed), {
      addSuffix: true,
    });
  }, [salesParticipant]);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !chatId) return;

    try {
      await sendMessage({ chatId, message: messageText });
      setMessageText("");
      refetchMessages();
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  function MessageStatus({
    status,
  }: {
    status: "sent" | "delivered" | "read";
  }) {
    if (status === "sent") {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
    if (status === "delivered") {
      return (
        <div className="flex">
          <Check className="h-3 w-3 text-gray-400" />
          <Check className="h-3 w-3 text-gray-400 -ml-1" />
        </div>
      );
    }
    return (
      <div className="flex">
        <Check className="h-3 w-3 text-[#007AFF]" />
        <Check className="h-3 w-3 text-[#007AFF] -ml-1" />
      </div>
    );
  }

  function FileIcon({ type }: { type: "pdf" | "doc" | "png" }) {
    const iconColor =
      type === "pdf"
        ? "text-red-500"
        : type === "doc"
        ? "text-blue-500"
        : "text-green-500";
    const bgColor =
      type === "pdf"
        ? "bg-red-50"
        : type === "doc"
        ? "bg-blue-50"
        : "bg-green-50";

    let Icon;
    switch (type) {
      case "pdf":
        Icon = FilePdf;
        break;
      case "doc":
        Icon = FileDoc;
        break;
      case "png":
        Icon = FilePng;
        break;
      default:
        Icon = FileText;
    }

    return (
      <div
        className={`w-8 h-8 flex items-center justify-center rounded ${bgColor}`}
      >
        <Icon size={32} className={iconColor} />
      </div>
    );
  }

  if (isChatSalesLoading || !conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 sm:pt-4 pt-20 sm:p-6 bg-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/client/communication">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#007AFF] sm:text-gray-500"
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 sm:hidden">
              <Avatar className="h-8 w-8">
                {salesParticipant?.user.profilePic ? (
                  <AvatarImage
                    src={salesParticipant.user.profilePic}
                    alt={`${salesParticipant?.user.firstName} ${salesParticipant?.user.lastName}`}
                  />
                ) : (
                  <AvatarFallback>
                    {salesParticipant?.user.firstName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="font-medium">{`${salesParticipant?.user.firstName} ${salesParticipant?.user.lastName}`}</h2>
                <p className="text-xs text-gray-500">
                  last seen {lastSeenTime}
                </p>
              </div>
            </div>
            <h1 className="text-2xl font-semibold hidden sm:block">
              Communication
            </h1>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
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

      {/* Main Card */}
      <Card className="flex flex-1 border-0 sm:border rounded-lg overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b hidden sm:flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {salesParticipant?.user.profilePic ? (
                  <AvatarImage
                    src={salesParticipant.user.profilePic}
                    alt={`${salesParticipant.user.firstName} ${salesParticipant.user.lastName}`}
                  />
                ) : (
                  <AvatarFallback>
                    {salesParticipant?.user.firstName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="font-medium">{`${salesParticipant?.user.firstName} ${salesParticipant?.user.lastName}`}</h2>
                <p className="text-sm text-gray-500">
                  last seen {lastSeenTime}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {isMessagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              chatMessages &&
              [...chatMessages]
                .sort((a, b) => {
                  // Parse the timestamps to ensure proper comparison
                  const timeA = new Date(a.created).getTime();
                  const timeB = new Date(b.created).getTime();
                  // Sort in ascending order (oldest first, newest last)
                  return timeA - timeB;
                })
                .map((message: ChatMessage) => {
                  const isFromSales = message.sent_by.user.role === "SALES";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isFromSales ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isFromSales
                            ? "bg-[#F2F2F7] sm:[#F2F2F7]"
                            : "bg-[#B6CEE9] sm:bg-[#B6CEE9]"
                        }`}
                      >
                        <p className="text-gray-900 break-words">
                          {message.msg_params.text}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isFromSales ? "justify-start" : "justify-end"
                          }`}
                        >
                          <span className="text-xs text-gray-500">
                            {formatTime(message.created)}
                          </span>
                          {!isFromSales && <MessageStatus status="read" />}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t bg-white">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full flex-shrink-0"
              >
                <AtSign className="h-5 w-5" />
              </Button>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block" />
              <div className="flex-1 relative">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="You're the best"
                  className="w-full bg-[#F2F2F7] sm:bg-white border-0 focus-visible:ring-0 pl-3 pr-20 py-5 rounded-full sm:rounded-lg"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <PaperPlaneRight size={20} className="text-[#007AFF]" />
                  </Button>

                  <div className="h-10 w-px bg-gray-200 mx-2" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <PlusCircle size={20} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[280px] sm:w-[450px] p-0 border-0 sm:border shadow-lg"
                      align="end"
                    >
                      <div className="p-4">
                        <h4 className="text-sm font-medium mb-2">
                          Attachments
                        </h4>
                        <Separator className="mb-4" />
                        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4">
                          <Button
                            variant="ghost"
                            className="h-auto py-3 flex items-center gap-3 w-full hover:bg-gray-50 sm:flex-col sm:py-4 sm:gap-2"
                            onClick={() => {
                              setActiveAttachment("terms");
                              setIsTermsModalOpen(true);
                            }}
                          >
                            <div
                              className={`w-10 h-10 rounded-full ${
                                activeAttachment === "terms"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center flex-shrink-0`}
                            >
                              <FileText
                                className={`h-5 w-5 ${
                                  activeAttachment === "terms"
                                    ? "text-[#3B86F2]"
                                    : "text-[#666666]"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-sm ${
                                activeAttachment === "terms"
                                  ? "text-[#3B86F2]"
                                  : "text-[#333333]"
                              }`}
                            >
                              Terms & Conditions
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-auto py-3 flex items-center gap-3 w-full hover:bg-gray-50 sm:flex-col sm:py-4 sm:gap-2"
                            onClick={() => {
                              setActiveAttachment("quote");
                            }}
                          >
                            <div
                              className={`w-10 h-10 rounded-full ${
                                activeAttachment === "quote"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center flex-shrink-0`}
                            >
                              <CurrencyInr
                                size={32}
                                className={
                                  activeAttachment === "quote"
                                    ? "text-[#3B86F2]"
                                    : "text-[#666666]"
                                }
                              />
                            </div>
                            <span
                              className={`text-sm ${
                                activeAttachment === "quote"
                                  ? "text-[#3B86F2]"
                                  : "text-[#333333]"
                              }`}
                            >
                              Send Quote
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-auto py-3 flex items-center gap-3 w-full hover:bg-gray-50 sm:flex-col sm:py-4 sm:gap-2"
                            onClick={() => setActiveAttachment("agreement")}
                          >
                            <div
                              className={`w-10 h-10 rounded-full ${
                                activeAttachment === "agreement"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center flex-shrink-0`}
                            >
                              <FileText
                                className={`h-5 w-5 ${
                                  activeAttachment === "agreement"
                                    ? "text-[#3B86F2]"
                                    : "text-[#666666]"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-sm ${
                                activeAttachment === "agreement"
                                  ? "text-[#3B86F2]"
                                  : "text-[#333333]"
                              }`}
                            >
                              Agreement
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-auto py-3 flex items-center gap-3 w-full hover:bg-gray-50 sm:flex-col sm:py-4 sm:gap-2"
                            onClick={() => setActiveAttachment("custom")}
                          >
                            <div
                              className={`w-10 h-10 rounded-full ${
                                activeAttachment === "custom"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center flex-shrink-0`}
                            >
                              <LinkIcon
                                size={20}
                                className={`${
                                  activeAttachment === "custom"
                                    ? "text-[#3B86F2]"
                                    : "text-[#666666]"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-sm ${
                                activeAttachment === "custom"
                                  ? "text-[#3B86F2]"
                                  : "text-[#333333]"
                              }`}
                            >
                              Custom Attachment
                            </span>
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Files Section */}
        <div className="w-80 border-l hidden sm:block">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Shared Files</h3>
              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                80
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1"
            >
              Receive
              <CaretDown size={20} />
            </Button>
          </div>
          <div className="divide-y">
            {[
              {
                name: "File Name.pdf",
                type: "pdf",
                size: "9 MB",
                date: "23 Oct, 2024",
              },
              {
                name: "File Name.docx",
                type: "doc",
                size: "5 MB",
                date: "22 Oct, 2024",
              },
              {
                name: "File Name.png",
                type: "png",
                size: "2 MB",
                date: "21 Oct, 2024",
              },
            ].map((file, index) => (
              <div
                key={index}
                className="p-4 flex items-start justify-between hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <FileIcon type={file.type as "pdf" | "doc" | "png"} />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.date}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-[#F4F3FF]"
                >
                  <DownloadSimple size={20} className="text-[#4D4AEA]" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <TermsModal
        open={isTermsModalOpen}
        onOpenChange={(open) => {
          setIsTermsModalOpen(open);
          if (!open) setActiveAttachment(null);
        }}
        onSelect={(templateId) => {
          console.log("Selected template:", templateId);
          setActiveAttachment(null);
        }}
      />
    </div>
  );
}
