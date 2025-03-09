"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Bell,
  PlusCircle,
  Check,
  CaretDown,
  DotsThree,
  Link as LinkIcon,
  DownloadSimple,
  PaperPlaneRight,
} from "phosphor-react";
import {
  AtSign,
  FileText,
  IndianRupeeIcon as CurrencyInr,
  HelpCircle,
} from "lucide-react";
import { FilePdf, FileDoc, FilePng } from "phosphor-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TermsModal } from "@/src/components/reuse_components/terms";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  useFetchProjectByIdQuery,
  useFetchChatGroupsQuery,
  useFetchChatMessagesQuery,
  useSendChatMessageMutation,
  type ChatGroupsResponse,
} from "../../../../store/client/clientApiSlice";

// Add this type definition based on the API response
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

import { useGetClientProfileQuery } from "../../../../store/apiSlice";
import // type ChatGroupsResponse, // Removed duplicate type definition
"../../../../store/client/clientApiSlice";

interface Milestone {
  id: number;
  description: string;
  dueDate: string;
  status: "NEW" | "COMPLETED";
  createdAt: string;
}

interface SharedFile {
  name: string;
  type: "pdf" | "doc" | "png";
  size: string;
  date: string;
}

const sharedFiles: SharedFile[] = [
  {
    name: "Project_Timeline.pdf",
    type: "pdf",
    size: "2.3 MB",
    date: "23 Oct, 2024",
  },
  {
    name: "Meeting_Notes.docx",
    type: "doc",
    size: "1.1 MB",
    date: "24 Oct, 2024",
  },
  {
    name: "Milestone_Chart.png",
    type: "png",
    size: "3.7 MB",
    date: "25 Oct, 2024",
  },
];

function MessageStatus({ status }: { status: "sent" | "delivered" | "read" }) {
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

function FileIcon({ type }: { type: SharedFile["type"] }) {
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

function ProjectMilestones({
  milestones,
  end_date,
  name,
}: {
  milestones: Milestone[];
  end_date: string;
  name: string;
}) {
  if (!milestones?.length) return null;

  return (
    <div className="rounded-lg overflow-hidden mb-6 border border-[#E2E8F0]">
      <div className="p-4 border-b border-[#E2E8F0] text-center">
        <h2 className="text-base font-medium">{name}</h2>
      </div>
      <div className="bg-[#F4F5F6] p-6">
        <div className="flex items-start">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex-1 relative">
              <div className="text-sm max-w-[150px] mb-4">
                <div className="text-gray-900">{milestone.description}</div>
                <div className="text-[#007AFF]">
                  {new Date(milestone.dueDate)
                    .toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    .replace(/\//g, "/")}
                </div>
              </div>
              <div className="relative">
                <div
                  className={`absolute h-[2px] bottom-3 left-4 right-0 z-0 ${
                    index < milestones.length - 1 ? "bg-[#0B4776]" : "bg-white"
                  }`}
                />
                <div
                  className={`w-6 h-6 rounded-full relative z-10 ${
                    milestone.status === "NEW"
                      ? "bg-[#0B4776]"
                      : "bg-[#FFFFFF] border border-[#E2E8F0]"
                  }`}
                />
              </div>
            </div>
          ))}
          <div className="flex-1 relative">
            <div className="text-sm mb-4">
              <div className="text-[#3B82F6]">Project EDD</div>
              <div className="text-[#3B82F6]">
                {new Date(end_date).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] relative z-10 flex items-center justify-center">
              <Check className="w-4 h-4 text-[#6F6C90]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const capitalizeWords = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function ProjectDetails() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const { data: clientProfile } = useGetClientProfileQuery();
  const userId = clientProfile?.id?.toString();

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useFetchProjectByIdQuery(
    { userId: userId ?? "skip", projectId },
    { skip: !userId }
  );

  const { data: groupChats, isLoading: isGroupChatsLoading } =
    useFetchChatGroupsQuery();
  const groupChat = groupChats?.find(
    (chat: ChatGroupsResponse) => chat.project_id.toString() === projectId
  );
  const chatId = groupChat?.id;

  const {
    data: chatMessages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useFetchChatMessagesQuery(chatId ?? "skip", { skip: !chatId });
  const [sendMessage] = useSendChatMessageMutation();

  const [messageText, setMessageText] = useState("");
  const [activeAttachment, setActiveAttachment] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      const interval = setInterval(() => {
        refetchMessages();
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [chatId, refetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  if (projectLoading || isGroupChatsLoading) {
    return <div className="p-6">Loading project details and chat...</div>;
  }

  if (projectError) {
    return (
      <div className="p-6">
        Error loading project details. Please try again later.
      </div>
    );
  }

  if (!project || !groupChat) {
    return (
      <div className="flex flex-col h-screen p-6 bg-white">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/client/project">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Project or chat not found</h1>
        </header>
        <Card className="flex-1 p-6">
          <p>The project or associated chat does not exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-6 bg-white">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/client/project">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Communication</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#ECF1F4] rounded-lg p-2"
          >
            <Bell className="h-5 w-5" />
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

      {project.milestones && (
        <ProjectMilestones
          milestones={project.milestones}
          end_date={project.end_date}
          name={project.name}
        />
      )}

      <Card className="flex flex-1 border rounded-lg overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-medium">
                  {capitalizeWords(groupChat?.name || "Project Chat")}
                </h2>
                {groupChat?.last_message && (
                  <p className="text-sm text-gray-500">
                    last seen{" "}
                    {formatDistanceToNow(
                      new Date(groupChat.last_message.created),
                      {
                        addSuffix: true,
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <DotsThree size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {isMessagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              chatMessages &&
              chatMessages.map((message: ChatMessage) => {
                const isFromClient = message.sent_by.user.role === "CLIENT";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isFromClient ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
                      }`}
                    >
                     
                      <p className="text-gray-900 break-words">
                        {message.msg_params.text}
                      </p>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isFromClient ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.created), "h:mm a")}
                        </span>
                        {isFromClient && <MessageStatus status="read" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="px-4 py-2 border-t bg-white"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full flex-shrink-0"
              >
                <AtSign className="h-5 w-5" />
              </Button>
              <div className="h-8 w-px bg-gray-200 mx-2" />
              <div className="flex-1 relative">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Start typing..."
                  className="w-full bg-white border-0 focus-visible:ring-0 pl-3 pr-20 py-5"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
                    <PopoverContent className="w-[450px] p-0" align="end">
                      <div className="p-4">
                        <h4 className="text-sm font-medium mb-2">
                          Attachments
                        </h4>
                        <Separator className="mb-4" />
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <Button
                            variant="ghost"
                            className="h-auto py-4 px-2 flex flex-col items-center gap-2"
                            onClick={() => {
                              setActiveAttachment("terms");
                              setIsTermsModalOpen(true);
                            }}
                          >
                            <div
                              className={`w-10 h-10 rounded ${
                                activeAttachment === "terms"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center`}
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
                              className={`text-xs text-center ${
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
                            className="h-auto py-4 px-2 flex flex-col items-center gap-2"
                            onClick={() => {
                              setActiveAttachment("quote");
                            }}
                          >
                            <div
                              className={`w-10 h-10 rounded ${
                                activeAttachment === "quote"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center`}
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
                              className={`text-xs text-center ${
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
                            className="h-auto py-4 px-2 flex flex-col items-center gap-2"
                            onClick={() => setActiveAttachment("agreement")}
                          >
                            <div
                              className={`w-10 h-10 rounded ${
                                activeAttachment === "agreement"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center`}
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
                              className={`text-xs text-center ${
                                activeAttachment === "agreement"
                                  ? "text-[#3B86F2]"
                                  : "text-[#333333]"
                              }`}
                            >
                              Agreement
                            </span>
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <Button
                            variant="ghost"
                            className="h-auto py-4 px-2 flex flex-col items-center gap-2"
                            onClick={() => setActiveAttachment("custom")}
                          >
                            <div
                              className={`w-10 h-10 rounded ${
                                activeAttachment === "custom"
                                  ? "bg-[#DAEDFF]"
                                  : "bg-gray-100"
                              } flex items-center justify-center`}
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
                              className={`text-xs text-center ${
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
          </form>
        </div>

        <div className="w-80 border-l">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Shared Files</h3>
              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                {sharedFiles.length}
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
            {sharedFiles.map((file: SharedFile, index: number) => (
              <div
                key={index}
                className="p-4 flex items-start justify-between hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <FileIcon type={file.type} />
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
