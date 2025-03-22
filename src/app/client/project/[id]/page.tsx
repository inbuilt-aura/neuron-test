"use client";

import type * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
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
  DotsThree,
} from "phosphor-react";
import { AtSign } from "lucide-react";
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
import { useSelector } from "react-redux";
import socketService, {
  type ChatMessage as SocketChatMessage,
  type ReceivedMessage,
  type Notification,
} from "../../../../lib/socket-service";
import { toast } from "react-hot-toast";

import {
  useFetchProjectByIdQuery,
  useFetchChatGroupsQuery,
  useFetchChatMessagesQuery,
  type ChatGroupsResponse,
  type ChatMessage,
  type TextMessageParams,
  type FileMessageParams,
  type QuoteMessageParams,
  type AgreementMessageParams,
  useUploadChatFileMutation,
  useFetchChatFilesQuery,
  useUpdateAgreementMutation,
} from "../../../../store/client/clientApiSlice";
import { useGetClientProfileQuery } from "../../../../store/apiSlice";

interface AuthState {
  token?: {
    access: {
      token: string;
    };
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic?: string | null;
    role: string;
  };
}

interface RootState {
  auth: AuthState;
}

interface Milestone {
  id: number;
  description: string;
  dueDate: string;
  status: "NEW" | "COMPLETED";
  createdAt: string;
}

function MessageStatus({ status }: { status: string }) {
  if (status === "sent") return <Check className="h-3 w-3 text-gray-600" />;
  if (status === "delivered") {
    return (
      <div className="flex">
        <Check className="h-3 w-3 text-gray-600" />
        <Check className="h-3 w-3 text-gray-600 -ml-1" />
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
          {milestones.map((milestone) => (
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
                    milestone.status === "NEW" ? "bg-[#FFFFFF]" : "bg-[#0B4776]"
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
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: 0,
      margin: -1,
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      border: 0,
    }}
  >
    {children}
  </span>
);

function FileIcon({ type }: { type: "pdf" | "doc" | "png" | string }) {
  const iconColor =
    type === "pdf"
      ? "text-red-500"
      : type === "doc"
      ? "text-blue-500"
      : type === "png"
      ? "text-green-500"
      : "text-gray-500";
  const bgColor =
    type === "pdf"
      ? "bg-red-50"
      : type === "doc"
      ? "bg-blue-50"
      : type === "png"
      ? "bg-green-50"
      : "bg-gray-50";

  let Icon;
  switch (type) {
    case "pdf":
    case "application/pdf":
      Icon = FilePdf;
      break;
    case "doc":
    case "docx":
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      Icon = FileDoc;
      break;
    case "png":
    case "image/png":
      Icon = FilePng;
      break;
    default:
      Icon = FileDoc;
  }

  return (
    <div
      className={`w-8 h-8 flex items-center justify-center rounded ${bgColor}`}
    >
      <Icon size={32} className={iconColor} />
    </div>
  );
}

const getFileType = (mimetype: string): "pdf" | "doc" | "png" | string => {
  if (mimetype.includes("pdf")) return "pdf";
  if (mimetype.includes("word") || mimetype.includes("doc")) return "doc";
  if (mimetype.includes("png")) return "png";
  return mimetype;
};

const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
  return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
};

export default function ProjectDetails() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [isMilestoneDrawerOpen, setIsMilestoneDrawerOpen] = useState(false);
  const [isSharedFilesDrawerOpen, setIsSharedFilesDrawerOpen] = useState(false);
  const [fileViewMode, setFileViewMode] = useState<"received" | "sent">(
    "received"
  );
  const [messageText, setMessageText] = useState("");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [locallySignedAgreements, setLocallySignedAgreements] = useState<
    Record<string, boolean>
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const auth = useSelector((state: RootState) => state.auth);
  const authToken = auth?.token?.access?.token;

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
    error: messagesError,
  } = useFetchChatMessagesQuery(chatId || "skip", {
    skip: !chatId,
    refetchOnMountOrArgChange: true,
  });

  const [uploadChatFile, { isLoading: isUploading }] =
    useUploadChatFileMutation();
  const [updateAgreement, { isLoading: isUpdatingAgreement }] =
    useUpdateAgreementMutation();

  const {
    data: chatFiles = [],
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useFetchChatFilesQuery(
    {
      chatId: chatId || "skip",
      filter: fileViewMode,
    },
    {
      skip: !chatId,
      pollingInterval: 60000,
      refetchOnMountOrArgChange: true,
    }
  );

  const combinedMessages = useMemo(() => {
    console.log("chatMessages:", chatMessages);
    console.log("messagesError:", messagesError);
    return chatMessages || [];
  }, [chatMessages, messagesError]);

  useEffect(() => {
    if (authToken) {
      console.log("Auth token for socket connection:", authToken);
      console.log("Attempting to connect to socket for client group chat...");
      try {
        socketService.connect(authToken);
        const socket = socketService.getSocket();

        if (socket) {
          socket.on("connect", () => {
            console.log("Socket connected successfully with ID:", socket.id);
            setSocketConnected(true);
            setSocketError(null);
            if (chatId) {
              console.log(`Joining room with chatId: ${chatId}`);
              socket.emit("join-room", { roomId: chatId });
            } else {
              console.warn("No chatId available to join room");
            }
          });

          socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
            setSocketError(error.message);
            setSocketConnected(false);
          });

          socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            setSocketConnected(false);
            setSocketError(`Disconnected: ${reason}`);
          });

          socket.on("receive-message", (data: ReceivedMessage) => {
            console.log("Received message:", data);
            if (data.refId === chatId) {
              refetchMessages();
            }
          });

          socket.on("message-sent", (data: ReceivedMessage) => {
            console.log("Message sent confirmation:", data);
            if (data.refId === chatId) {
              refetchMessages();
            }
          });

          socket.on("notification", (data: Notification) => {
            console.log("Received notification:", data);
            if (data.ref_id.toString() === projectId) {
              setNotifications((prev) => [...prev, data]);
            }
          });

          return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
            socket.off("receive-message");
            socket.off("message-sent");
            socket.off("notification");
            socketService.disconnect();
            console.log("Cleaned up socket listeners and disconnected");
          };
        }
      } catch (error: unknown) {
        console.error("Error initializing socket:", error);
        setSocketError(error instanceof Error ? error.message : String(error));
        setSocketConnected(false);
      }
    } else {
      console.warn("No auth token available for socket connection");
    }
  }, [authToken, chatId, projectId, refetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [combinedMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !chatId) {
      console.error("Cannot send message: Empty message or invalid chatId", {
        messageText,
        chatId,
      });
      return;
    }

    if (!socketConnected) {
      console.error("Socket not connected. Cannot send message.");
      setSocketError("Socket not connected. Please try again later.");
      return;
    }

    try {
      const message: SocketChatMessage = {
        refId: chatId,
        msgType: "text",
        msgParams: { text: messageText },
        type: "group",
      };
      console.log("Sending message:", message);
      socketService.sendMessage(message);

      setMessageText("");
      console.log("Message sent successfully", { chatId, messageText });
      setTimeout(() => {
        console.log("Refetching messages after sending...");
        refetchMessages();
      }, 500);
    } catch (error: unknown) {
      console.error("Failed to send message:", error);
      setSocketError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const handleUpdateAgreement = async (messageId: string) => {
    try {
      if (!auth.user) {
        console.log("User not authenticated");
        toast.error("Authentication required to sign agreement");
        return;
      }

      console.log("Sending agreement update request");
      console.log("Request payload:", {
        clientId: auth.user.id,
        response: true,
      });

      toast.loading("Updating agreement...", {
        id: "update-agreement",
      });

      const response = await updateAgreement({
        clientId: auth.user.id,
        response: true,
      }).unwrap();

      console.log("Agreement update response:", response);
      toast.success(
        response.message || "You have successfully signed the agreement!",
        { id: "update-agreement" }
      );

      setLocallySignedAgreements((prev) => ({
        ...prev,
        [messageId]: true,
      }));

      refetchMessages();
      refetchFiles();
    } catch (error) {
      console.error("Error updating agreement:", error);
      const backendError = error as { data?: { message?: string } };
      const errorMessage =
        backendError?.data?.message || "Failed to update agreement";
      toast.error(errorMessage, { id: "update-agreement" });
    }
  };

  const handleMilestoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMilestoneDrawerOpen(true);
  };

  const renderMessage = (message: ChatMessage): React.JSX.Element => {
    const isFromClient = message.sent_by.user.role === "CLIENT";

    switch (message.msg_type) {
      case "text": {
        const textParams = message.msg_params as TextMessageParams;
        return (
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
              isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
            }`}
          >
            <p className="text-gray-900 break-words">{textParams.text}</p>
            <div
              className={`flex items-center gap-1 mt-1 ${
                isFromClient ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-gray-500">
                {format(new Date(message.created), "h:mm a")}
              </span>
              {isFromClient && <MessageStatus status={message.status} />}
            </div>
          </div>
        );
      }

      case "agreement": {
        const agreementParams = message.msg_params as
          | AgreementMessageParams
          | undefined;
        if (!agreementParams || !("url" in agreementParams)) {
          return (
            <div
              className={`max-w-[60%] rounded-2xl px-4 py-3 ${
                isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
              }`}
            >
              <p className="text-gray-500 italic">
                [Agreement content unavailable]
              </p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromClient ? "justify-end" : "justify-start"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {format(new Date(message.created), "h:mm a")}
                </span>
              </div>
            </div>
          );
        }

        const fileName = (agreementParams.name || "Agreement").toUpperCase();
        const fileType = getFileType(agreementParams.mimetype);
        const fileSize = formatFileSize(agreementParams.size);
        const isClient = auth.user?.role === "CLIENT";
        const isSigned =
          agreementParams.signed ||
          locallySignedAgreements[message.id] ||
          false;

        const handleCheckboxChange = () => {
          if (!isSigned && isClient) {
            console.log(
              "Checkbox clicked, updating agreement for message:",
              message.id
            );
            handleUpdateAgreement(message.id);
          }
        };

        return (
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
            }`}
          >
            <div className="bg-white rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileIcon type={fileType} />
                <div>
                  <p className="font-medium text-sm">{fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{fileSize}</span>
                    <span>•</span>
                    <span>1 Page</span>
                  </div>
                </div>
              </div>
              <a
                href={agreementParams.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-[#F4F3FF]"
                >
                  <DownloadSimple size={20} className="text-[#4D4AEA]" />
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={isSigned}
                onChange={handleCheckboxChange}
                disabled={!isClient || isSigned || isUpdatingAgreement}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <p className="text-sm text-gray-700">
                Make sure you have gone through the agreement in detail.
              </p>
            </div>
            <div
              className={`flex items-center gap-1 mt-2 ${
                isFromClient ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-gray-500">
                {format(new Date(message.created), "h:mm a")}
              </span>
              {isFromClient && <MessageStatus status={message.status} />}
            </div>
          </div>
        );
      }

      case "file": {
        const fileParams = message.msg_params as FileMessageParams;
        if (!fileParams || !fileParams.url) {
          return (
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
              }`}
            >
              <p className="text-gray-500 italic">[File content unavailable]</p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromClient ? "justify-end" : "justify-start"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {format(new Date(message.created), "h:mm a")}
                </span>
              </div>
            </div>
          );
        }
        const fileName = (
          fileParams.filename ||
          fileParams.name ||
          "File"
        ).toUpperCase();
        const fileType = getFileType(fileParams.mimetype);
        const fileSize = formatFileSize(fileParams.size);
        return (
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
            }`}
          >
            <div className="bg-white rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileIcon type={fileType} />
                <div>
                  <p className="font-medium text-sm">{fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{fileSize}</span>
                    <span>•</span>
                    <span>1 Page</span>
                  </div>
                </div>
              </div>
              <a
                href={fileParams.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-[#F4F3FF]"
                >
                  <DownloadSimple size={20} className="text-[#4D4AEA]" />
                </Button>
              </a>
            </div>
            <div
              className={`flex items-center gap-1 mt-2 ${
                isFromClient ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-gray-500">
                {format(new Date(message.created), "h:mm a")}
              </span>
              {isFromClient && <MessageStatus status={message.status} />}
            </div>
          </div>
        );
      }

      case "quote": {
        const quoteParams = message.msg_params as QuoteMessageParams;
        if (!quoteParams || !("amount" in quoteParams)) {
          return (
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
              }`}
            >
              <p className="text-gray-500 italic">
                [Quote content unavailable]
              </p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromClient ? "justify-end" : "justify-start"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {format(new Date(message.created), "h:mm a")}
                </span>
              </div>
            </div>
          );
        }
        return (
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              isFromClient ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
            }`}
          >
            <div className="bg-white bg-opacity-60 w-full rounded-lg px-3 py-2">
              <span className="text-lg font-semibold">
                ₹{quoteParams.amount}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                ({quoteParams.status})
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              {quoteParams.requirement}
            </p>
            <div
              className={`flex items-center gap-1 mt-2 ${
                isFromClient ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-gray-500">
                {format(new Date(message.created), "h:mm a")}
              </span>
              {isFromClient && <MessageStatus status={message.status} />}
            </div>
          </div>
        );
      }

      default:
        return <></>;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !chatId) return;

    const file = e.target.files[0];
    try {
      toast.loading("Uploading file...", { id: "file-upload" });
      await uploadChatFile({ chatId, file }).unwrap();
      toast.success("File uploaded successfully", { id: "file-upload" });
      refetchFiles();
      refetchMessages();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file", { id: "file-upload" });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (projectLoading || isGroupChatsLoading) {
    return <div className="p-6">Loading project details and chat...</div>;
  }

  if (projectError || !project || !groupChat) {
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

  const hasNewMilestone = project.milestones?.some(
    (milestone) => milestone.status === "NEW"
  );

  return (
    <div className="flex flex-col h-screen p-4 pt-20 sm:p-6 bg-white">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/client/project">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#007AFF] sm:text-gray-500"
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 sm:hidden">
              <h2 className="font-medium text-base">
                {capitalizeWords(project?.name || "Project Name Goes Here")}
              </h2>
            </div>
            <h1 className="text-2xl font-semibold hidden sm:block">
              Communication
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex sm:hidden w-8 h-8 p-0"
              >
                <DotsThree size={24} weight="bold" className="text-gray-700" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-44 p-1 border-0 shadow-lg rounded-lg"
              align="end"
              sideOffset={5}
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-md h-10 px-3 text-sm font-normal"
                  onClick={handleMilestoneClick}
                >
                  Project Milestone
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-md h-10 px-3 text-sm font-normal"
                  onClick={() => setIsSharedFilesDrawerOpen(true)}
                >
                  Shared Files
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {socketError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4">
          <p>Socket connection error: {socketError}</p>
          <p className="text-sm">
            Messages will be loaded but sending new messages may not work.
          </p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mb-4 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md"
            >
              <p className="font-medium">{notification.text}</p>
              <p className="text-sm">{notification.description}</p>
              <p className="text-xs text-blue-500">
                {format(new Date(notification.time), "h:mm a, MMM d, yyyy")}
              </p>
            </div>
          ))}
        </div>
      )}

      {project.milestones && (
        <div className="hidden sm:block">
          <ProjectMilestones
            milestones={project.milestones}
            end_date={project.end_date}
            name={project.name}
          />
        </div>
      )}

      <Card className="flex flex-1 border-0 sm:border rounded-lg overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b hidden sm:flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="font-medium">
                {capitalizeWords(groupChat?.name || "Project Chat")}
              </h2>
              {groupChat?.last_message && (
                <p className="text-sm text-gray-500">
                  last seen{" "}
                  {formatDistanceToNow(
                    new Date(groupChat.last_message.created),
                    { addSuffix: true }
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {isMessagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : combinedMessages.length > 0 ? (
              combinedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sent_by.user.role === "CLIENT"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {renderMessage(message)}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No messages yet. Start a conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="px-4 py-3 border-t bg-white">
            <form onSubmit={handleSendMessage}>
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full flex-shrink-0 hidden sm:flex"
                >
                  <AtSign className="h-5 w-5" />
                </Button>
                <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block" />
                <div className="flex-1 relative">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-[#F2F2F7] sm:bg-white border-0 focus-visible:ring-0 pl-3 pr-20 py-5 rounded-full sm:rounded-lg"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      disabled={!messageText.trim() || !socketConnected}
                    >
                      <PaperPlaneRight
                        size={20}
                        className={
                          socketConnected && messageText.trim()
                            ? "text-[#007AFF]"
                            : "text-gray-400"
                        }
                      />
                    </Button>
                    <div className="h-10 w-px bg-gray-200 mx-2 hidden sm:block" />
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
                              type="button"
                              variant="ghost"
                              className="h-auto py-3 flex items-center gap-3 w-full hover:bg-gray-50 sm:flex-col sm:py-4 sm:gap-2"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              <div
                                className={`w-10 h-10 rounded-full ${
                                  isUploading ? "bg-[#DAEDFF]" : "bg-gray-100"
                                } flex items-center justify-center flex-shrink-0`}
                              >
                                <LinkIcon
                                  size={20}
                                  className={
                                    isUploading
                                      ? "text-[#3B86F2]"
                                      : "text-[#666666]"
                                  }
                                />
                              </div>
                              <span
                                className={`text-sm ${
                                  isUploading
                                    ? "text-[#3B86F2]"
                                    : "text-[#333333]"
                                }`}
                              >
                                {isUploading ? "Uploading..." : "Upload File"}
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
        </div>

        <div className="w-80 border-l hidden sm:block">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-base font-medium">
                {fileViewMode === "received" ? "Shared Files" : "Your Files"}
              </h3>
              <span className="ml-2 text-sm text-gray-600">
                {chatFiles.length}
              </span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-sm font-normal"
                >
                  {fileViewMode === "received" ? "Received" : "Sent"}{" "}
                  <CaretDown size={16} className="ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-24 p-1" align="end">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => setFileViewMode("received")}
                >
                  Received
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => setFileViewMode("sent")}
                >
                  Sent
                </Button>
              </PopoverContent>
            </Popover>
          </div>
          <div className="px-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {isFilesLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chatFiles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {fileViewMode} files found
              </div>
            ) : (
              chatFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <FileIcon type={getFileType(file.mimetype)} />
                    </div>
                    <div>
                      <p className="text-sm font-normal text-gray-900">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{format(new Date(), "dd MMM, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-[#F4F3FF]"
                    >
                      <DownloadSimple size={20} className="text-[#4D4AEA]" />
                    </Button>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      <TermsModal
        open={isTermsModalOpen}
        onOpenChange={(open) => {
          setIsTermsModalOpen(open);
        }}
        onSelect={(templateId) => {
          console.log("Selected template:", templateId);
        }}
      />

      <Dialog
        open={isMilestoneDrawerOpen}
        onOpenChange={setIsMilestoneDrawerOpen}
      >
        <DialogContent className="fixed top-16 right-0 h-full w-[85%] max-w-[350px] bg-[#F8F9FA] shadow-lg z-50 transform transition-all duration-700 ease-in-out translate-x-0 data-[state=closed]:translate-x-full sm:hidden overflow-auto">
          <VisuallyHidden>
            <DialogTitle>Project Milestones</DialogTitle>
          </VisuallyHidden>
          <div className="p-4 flex items-center gap-3 border-b bg-white">
            <button
              onClick={() => setIsMilestoneDrawerOpen(false)}
              className="text-[#007AFF]"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-medium">Project Milestones</h2>
          </div>

          <div className="p-8">
            {project.milestones && (
              <div className="relative">
                <div
                  style={{
                    position: "absolute",
                    left: "17px",
                    width: "2px",
                    backgroundColor: hasNewMilestone ? "#FFFFFF" : "#0B4776",
                    top: "15px",
                    bottom: "15px",
                  }}
                />
                {project.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-start mb-12 relative"
                  >
                    <div
                      className={`w-6 h-6 rounded-full absolute left-[6px] ${
                        milestone.status === "NEW"
                          ? "bg-[#0B4776]"
                          : "bg-[#FFFFFF] border border-[#E2E8F0]"
                      }`}
                    />
                    <div className="ml-16 text-base">
                      <div className="text-gray-900 font-medium mb-2">
                        {milestone.description}
                      </div>
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
                  </div>
                ))}
                <div className="flex items-start relative">
                  <div className="w-8 h-8 rounded-full absolute left-[4px] bg-white border border-[#E2E8F0] flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#6F6C90]" />
                  </div>
                  <div className="ml-16 text-base">
                    <div className="text-[#3B82F6] font-medium">
                      Project EDD
                    </div>
                    <div className="text-[#3B82F6]">
                      {new Date(project.end_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSharedFilesDrawerOpen}
        onOpenChange={setIsSharedFilesDrawerOpen}
      >
        <DialogContent className="fixed top-16 right-0 h-full w-[85%] max-w-[350px] bg-white shadow-lg z-50 transform transition-all duration-700 ease-in-out translate-x-0 data-[state=closed]:translate-x-full sm:hidden overflow-auto">
          <VisuallyHidden>
            <DialogTitle>Shared Files</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => setIsSharedFilesDrawerOpen(false)}
              className="text-[#007AFF]"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center">
              <h2 className="text-base font-medium">
                {fileViewMode === "received" ? "Shared Files" : "Your Files"}
              </h2>
              <span className="ml-2 text-sm text-gray-600">
                {chatFiles.length}
              </span>
            </div>
            <div className="ml-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-sm font-normal"
                  >
                    {fileViewMode === "received" ? "Received" : "Sent"}{" "}
                    <CaretDown size={16} className="ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-24 p-1" align="end">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm font-normal"
                    onClick={() => setFileViewMode("received")}
                  >
                    Received
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm font-normal"
                    onClick={() => setFileViewMode("sent")}
                  >
                    Sent
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="px-4">
            {isFilesLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chatFiles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {fileViewMode} files found
              </div>
            ) : (
              chatFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <FileIcon type={getFileType(file.mimetype)} />
                    </div>
                    <div>
                      <p className="text-sm font-normal text-gray-900">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{format(new Date(), "dd MMM, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-[#F4F3FF]"
                    >
                      <DownloadSimple size={20} className="text-[#4D4AEA]" />
                    </Button>
                  </a>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
