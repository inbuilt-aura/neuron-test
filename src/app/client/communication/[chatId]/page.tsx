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
  HelpCircle,
  BellRing,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  useUploadChatFileMutation,
  useFetchChatFilesQuery,
  useUpdateAgreementMutation,
  type ChatMessage,
  type TextMessageParams,
  type FileMessageParams,
  type QuoteMessageParams,
  type AgreementMessageParams,
} from "../../../../store/client/clientApiSlice";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import socketService, {
  type ReceivedMessage,
  type OnlineStatusEvent,
  type MessageSentConfirmation,
  type Notification,
} from "../../../../lib/socket-service";
import { TermsModal } from "../../../../components/reuse_components/terms";

interface Participant {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profilePic?: string;
    role: string;
  };
  ref_id: number;
  _id: string;
  last_viewed?: string;
}

interface OnlineStatus {
  isOnline: boolean;
  lastSeen?: string;
}

export default function ClientChatPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const auth = useSelector((state: RootState) => state.auth);

  const { data: chatSales, isLoading: isChatSalesLoading } =
    useFetchChatSalesQuery();
  const {
    data: chatMessages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useFetchChatMessagesQuery(chatId);

  const [messageText, setMessageText] = React.useState("");
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);
  const [salesOnlineStatus, setSalesOnlineStatus] =
    React.useState<OnlineStatus>({ isOnline: false });
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [uploadChatFile, { isLoading: isUploading }] =
    useUploadChatFileMutation();
  const [updateAgreement, { isLoading: isUpdatingAgreement }] =
    useUpdateAgreementMutation();
  const [locallySignedAgreements, setLocallySignedAgreements] = React.useState<
    Record<string, boolean>
  >({});

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const conversation = React.useMemo(() => {
    return chatSales?.find((chat) => chat.id === chatId);
  }, [chatSales, chatId]);

  const salesParticipant = React.useMemo(() => {
    if (!conversation) return null;
    return conversation.participants.find((p) => p.user.role === "SALES") as
      | Participant
      | undefined;
  }, [conversation]);

  const [fileType, setFileType] = React.useState<"sent" | "received">("sent");

  const {
    data: chatFiles = [],
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useFetchChatFilesQuery(
    {
      chatId,
      filter: fileType,
    },
    {
      skip: !chatId,
      pollingInterval: 60000,
      refetchOnMountOrArgChange: true,
    }
  );

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

  const handleUpdateAgreement = async (messageId: string) => {
    try {
      if (!auth.user) {
        console.log("User not authenticated");
        toast.error("Authentication required to sign agreement");
        return;
      }

      console.log("Sending agreement update request");
      console.log("Request payload:", {
        clientId: auth.user.userId,
        response: true,
      });

      toast.loading("Updating agreement...", {
        id: "update-agreement",
      });

      const response = await updateAgreement({
        clientId: auth.user.userId,
        response: true,
      }).unwrap();

      console.log("Agreement update response:", response);
      toast.success(
        response.message || "You have successfully signed the agreement!",
        { id: "update-agreement" }
      );

      // Update local state to show the agreement as signed immediately
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

  React.useEffect(() => {
    if (auth.token?.access.token) {
      console.log("Connecting to socket with token:", auth.token.access.token);
      socketService.connect(auth.token.access.token);

      const socket = socketService.getSocket();

      if (socket) {
        if (socket.connected) {
          console.log("Socket is already connected on mount");
          if (salesParticipant && salesParticipant.ref_id) {
            socket.emit("check-online", { ref_id: salesParticipant.ref_id });
          }
        }

        socket.on("sign-in-success", (data: unknown) => {
          console.log("Sign in success:", data);
        });

        socket.on("connect", () => {
          console.log("Socket connected event received");
          if (salesParticipant && salesParticipant.ref_id) {
            socket.emit("check-online", { ref_id: salesParticipant.ref_id });
          }
        });

        socket.on("online", (data: OnlineStatusEvent) => {
          console.log("Online status update:", data);
          if (salesParticipant && salesParticipant.ref_id) {
            const userId = data.userId || data.ref_id?.toString();
            if (userId && Number.parseInt(userId) === salesParticipant.ref_id) {
              console.log(
                "Sales rep is online:",
                salesParticipant.user.firstName
              );
              setSalesOnlineStatus({ isOnline: true, lastSeen: undefined });
            }
          }
        });

        socket.on("offline", (data: OnlineStatusEvent) => {
          console.log("Offline status update:", data);
          if (salesParticipant && salesParticipant.ref_id) {
            const userId = data.userId || data.ref_id?.toString();
            if (userId && Number.parseInt(userId) === salesParticipant.ref_id) {
              console.log(
                "Sales rep is offline:",
                salesParticipant.user.firstName
              );
              setSalesOnlineStatus({
                isOnline: false,
                lastSeen: new Date().toISOString(),
              });
            }
          }
        });

        socket.on("recieve-message", (data: ReceivedMessage) => {
          console.log("New message received:", data);
          if (data.refId === chatId) {
            refetchMessages();
            if (
              salesParticipant &&
              data.sent_by.role === "SALES" &&
              Number.parseInt(data.sent_by.id) === salesParticipant.ref_id
            ) {
              console.log(
                "Updating sales online status due to received message"
              );
              setSalesOnlineStatus({ isOnline: true, lastSeen: undefined });
            }
          }
        });

        socket.on("message-sent", (data: MessageSentConfirmation) => {
          console.log("Message sent confirmation:", data);
          if (data.refId === chatId) {
            refetchMessages();
          }
        });

        socket.on("notification", (data: Notification) => {
          console.log("Received notification:", data);
          if (data.ref_id.toString() === chatId) {
            setNotifications((prev) => [...prev, data]);
          }
        });

        return () => {
          socket.off("sign-in-success");
          socket.off("connect");
          socket.off("online");
          socket.off("offline");
          socket.off("receive-message");
          socket.off("message-sent");
          socket.off("notification");
          socketService.disconnect();
          console.log("Cleaned up socket listeners and disconnected");
        };
      }
    }
  }, [auth.token?.access.token, refetchMessages, salesParticipant, chatId]);

  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const lastSeenTime = React.useMemo(() => {
    if (salesOnlineStatus.isOnline) {
      return "online";
    }
    if (salesOnlineStatus.lastSeen) {
      return formatDistanceToNow(new Date(salesOnlineStatus.lastSeen), {
        addSuffix: true,
      });
    }
    if (!salesParticipant || !salesParticipant.last_viewed) {
      return "Never";
    }
    return formatDistanceToNow(new Date(salesParticipant.last_viewed), {
      addSuffix: true,
    });
  }, [salesParticipant, salesOnlineStatus]);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !chatId || !auth.user?.userId) {
      toast.error("Authentication required to send message");
      return;
    }

    const messagePayload: ChatMessage = {
      ref_id: chatId,
      msg_type: "text",
      msg_params: { text: messageText },
      type: "personal",
      status: "sent",
      sent_by: {
        user: {
          firstName: auth.user.firstName,
          lastName: auth.user.lastName,
          email: auth.user.email,
          profilePic: auth.user.profilePic ?? undefined,
          role: auth.user.userType,
        },
        ref_id: Number.parseInt(auth.user.userId.toString()),
        _id: auth.user.userId.toString(),
      },
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      id: `${Date.now()}`,
    };

    console.log("Sending personal message via socket:", messagePayload);
    socketService.sendMessage({
      refId: chatId,
      msgType: "text",
      msgParams: { text: messageText },
      type: "personal",
    });

    setMessageText("");
  };

  function MessageStatus({ status }: { status: string }) {
    if (status === "sent") {
      return <Check className="h-3 w-3 text-gray-600" />;
    }
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

  const getFileType = (mimetype: string): "pdf" | "doc" | "png" | string => {
    if (mimetype.includes("pdf")) return "pdf";
    if (mimetype.includes("word") || mimetype.includes("doc")) return "doc";
    if (mimetype.includes("png")) return "png";
    return mimetype;
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${Math.round(sizeInBytes / 1024)} KB`;
    return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
  };

  const renderMessage = (message: ChatMessage) => {
    const isFromSales = message.sent_by.user.role === "SALES";

    switch (message.msg_type) {
      case "text": {
        const textParams = message.msg_params as TextMessageParams | undefined;
        return (
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
              isFromSales ? "bg-[#F2F2F7]" : "bg-[#B6CEE9]"
            }`}
          >
            <p className="text-gray-900 break-words">
              {textParams?.text || "[Message content unavailable]"}
            </p>
            <div
              className={`flex items-center gap-1 mt-1 ${
                isFromSales ? "justify-start" : "justify-end"
              }`}
            >
              <span className="text-xs text-gray-500">
                {formatTime(message.created)}
              </span>
              {!isFromSales && <MessageStatus status={message.status} />}
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
                isFromSales ? "bg-[#F2F2F7]" : "bg-[#B6CEE9]"
              }`}
            >
              <p className="text-gray-500 italic">
                [Agreement content unavailable]
              </p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromSales ? "justify-start" : "justify-end"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {formatTime(message.created)}
                </span>
              </div>
            </div>
          );
        }

        const fileName = (agreementParams.name || "Agreement").toUpperCase();
        const fileType = getFileType(agreementParams.mimetype);
        const fileSize = formatFileSize(agreementParams.size);
        const isClient = auth.user?.userType !== "SALES"; // Adjusted to use userType from your auth state

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
              isFromSales ? "bg-[#F2F2F7]" : "bg-[#B6CEE9]"
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
                isFromSales ? "justify-start" : "justify-end"
              }`}
            >
              <span className="text-xs text-gray-500">
                {formatTime(message.created)}
              </span>
              {isFromSales && <MessageStatus status={message.status} />}
            </div>
          </div>
        );
      }
      case "file": {
        const fileParams = message.msg_params as FileMessageParams | undefined;
        if (!fileParams || !fileParams.url) {
          return (
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isFromSales ? "bg-[#F2F2F7]" : "bg-[#B6CEE9]"
              }`}
            >
              <p className="text-gray-500 italic">[File content unavailable]</p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromSales ? "justify-start" : "justify-end"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {formatTime(message.created)}
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
              isFromSales ? "bg-[#F2F2F7]" : "bg-[#B6CEE9]"
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
                isFromSales ? "justify-start" : "justify-end"
              }`}
            >
              <span className="text-xs text-gray-500">
                {formatTime(message.created)}
              </span>
            </div>
          </div>
        );
      }

      case "quote": {
        const quoteParams = message.msg_params as
          | QuoteMessageParams
          | undefined;
        if (!quoteParams || !("amount" in quoteParams)) {
          return (
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isFromSales ? "bg-[#F2F2F7]" : "bg-[#B6CEE9]"
              }`}
            >
              <p className="text-gray-500 italic">
                [Quote content unavailable]
              </p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromSales ? "justify-start" : "justify-end"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {formatTime(message.created)}
                </span>
              </div>
            </div>
          );
        }
        return (
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              isFromSales ? "bg-[#F2F2F7]" : "bg-[#B6CEE9]"
            }`}
          >
            <div className="bg-white bg-opacity-60 w-full rounded-lg px-3 py-2">
              <span className="text-lg font-semibold">
                ₹{quoteParams.amount}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              {quoteParams.requirement}
            </p>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">
                {formatTime(message.created)}
              </span>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

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
                  {salesOnlineStatus.isOnline ? (
                    <span className="text-green-500">online</span>
                  ) : (
                    `last seen ${lastSeenTime}`
                  )}
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

      {/* Notification Display */}
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

      {/* Main Card */}
      <Card className="flex flex-1 border-0 sm:border rounded-lg overflow-hidden">
        <div className="flex-1 flex flex-col">
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
                  {salesOnlineStatus.isOnline ? (
                    <span className="text-green-500">online</span>
                  ) : (
                    `last seen ${lastSeenTime}`
                  )}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {isMessagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              chatMessages &&
              [...chatMessages]
                .sort(
                  (a, b) =>
                    new Date(a.created).getTime() -
                    new Date(b.created).getTime()
                )
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sent_by.user.role === "SALES"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    {renderMessage(message)}
                  </div>
                ))
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
                              fileInputRef.current?.click();
                            }}
                            disabled={isUploading}
                          >
                            <div
                              className={`w-10 h-10 rounded-full ${
                                isUploading ? "bg-[#DAEDFF]" : "bg-gray-100"
                              } flex items-center justify-center flex-shrink-0`}
                            >
                              <LinkIcon
                                size={20}
                                className={`${
                                  isUploading
                                    ? "text-[#3B86F2]"
                                    : "text-[#666666]"
                                }`}
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
          </div>
        </div>

        <div className="w-80 border-l hidden sm:block">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Shared Files</h3>
              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                {chatFiles.length}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1"
              onClick={() =>
                setFileType(fileType === "received" ? "sent" : "received")
              }
            >
              {fileType === "received" ? "Received" : "Sent"}
              <CaretDown size={20} />
            </Button>
          </div>
          <div className="divide-y overflow-y-auto max-h-[calc(100vh-200px)]">
            {isFilesLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chatFiles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {fileType} files found
              </div>
            ) : (
              chatFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 flex items-start justify-between hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <FileIcon type={getFileType(file.mimetype)} />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
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
    </div>
  );
}
