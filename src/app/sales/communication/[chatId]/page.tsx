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
  useFetchChatLeadsQuery,
  useFetchChatMessagesQuery,
  useFetchGroupChatsQuery,
} from "../../../../store/sales/salesApiSlice";
import {
  useUploadChatFileMutation,
  useFetchChatFilesQuery,
} from "../../../../store/client/clientApiSlice";
import type { ChatLead, GroupChat } from "../../../../types";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import socketService, {
  type ChatMessage,
  type ReceivedMessage,
  type OnlineStatusEvent,
  type MessageSentConfirmation,
  type MessageStatusUpdate,
  type Notification,
} from "../../../../lib/socket-service";

interface Participant {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profilePic?: string | null | undefined;
    role: string;
  };
  ref_id: number;
  _id: string;
  last_viewed?: string;
}

interface TextMessageParams {
  text: string;
}

interface FileMessageParams {
  filename?: string;
  name?: string;
  url: string;
  size: number;
  mimetype: string;
  public_id?: string;
  text?: string;
}

type ChatMessageProps = {
  type: string;
  msg_type: "text" | "file" | "quote" | "agreement";
  msg_params?: TextMessageParams | FileMessageParams;
  ref_id: string;
  sent_by: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePic?: string | null | undefined;
      role: string;
    };
    ref_id: number;
    _id: string;
  };
  status: "sent" | "delivered" | "read";
  created: string;
  modified: string;
  id: string;
};

interface OnlineStatus {
  isOnline: boolean;
  lastSeen?: string;
}

export default function ChatPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const auth = useSelector((state: RootState) => state.auth);
  console.log("Current user role:", auth.user?.role); // Debug log

  const { data: chatLeads, isLoading: isLeadsLoading } =
    useFetchChatLeadsQuery();
  const { data: groupChats, isLoading: isGroupChatsLoading } =
    useFetchGroupChatsQuery();
  const {
    data: chatMessages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useFetchChatMessagesQuery(chatId, { skip: !chatId });

  const [messageText, setMessageText] = React.useState("");
  const [isAttachmentPopoverOpen, setIsAttachmentPopoverOpen] =
    React.useState(false);
  const [clientOnlineStatus, setClientOnlineStatus] =
    React.useState<OnlineStatus>({ isOnline: false });
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [fileViewMode, setFileViewMode] = React.useState<"received" | "sent">(
    "received"
  );

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const conversation: ChatLead | GroupChat | undefined = React.useMemo(() => {
    if (chatLeads && chatLeads.find((lead) => lead.id === chatId)) {
      return chatLeads.find((lead) => lead.id === chatId);
    } else if (groupChats && groupChats.find((group) => group.id === chatId)) {
      return groupChats.find((group) => group.id === chatId);
    }
    return undefined;
  }, [chatLeads, groupChats, chatId]);

  const isGroupChat = conversation && "project_id" in conversation;
  const clientParticipant = React.useMemo(() => {
    if (!conversation || isGroupChat) return null;
    return conversation.participants.find((p) => p.user.role === "CLIENT") as
      | Participant
      | undefined;
  }, [conversation, isGroupChat]);

  const [uploadChatFile, { isLoading: isUploading }] =
    useUploadChatFileMutation();
  const {
    data: chatFiles = [],
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useFetchChatFilesQuery(
    { chatId, filter: fileViewMode },
    { skip: !chatId }
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

  React.useEffect(() => {
    if (!auth.token?.access.token) return;

    console.log("Connecting to socket with token");
    socketService.connect(auth.token.access.token);

    const socket = socketService.getSocket();
    if (!socket) return;

    let hasRefetched = false;

    if (socket.connected) {
      console.log("Socket is already connected on mount");
      if (!isGroupChat && clientParticipant?.ref_id) {
        socket.emit("check-online", { ref_id: clientParticipant.ref_id });
      }
    }

    socket.on("connect", () => {
      console.log("Socket connected");
      if (!isGroupChat && clientParticipant?.ref_id) {
        socket.emit("check-online", { ref_id: clientParticipant.ref_id });
      }
    });

    socket.on(
      "online",
      (data: OnlineStatusEvent & { id?: number; role?: string }) => {
        if (!isGroupChat && clientParticipant?.ref_id) {
          const userId = data.userId || data.id?.toString() || "";
          const parsedId = Number.parseInt(userId, 10);
          if (
            !isNaN(parsedId) &&
            parsedId === clientParticipant.ref_id &&
            data.role === "CLIENT"
          ) {
            setClientOnlineStatus({ isOnline: true });
          }
        }
      }
    );

    socket.on(
      "offline",
      (data: OnlineStatusEvent & { id?: number; role?: string }) => {
        if (!isGroupChat && clientParticipant?.ref_id) {
          const userId = data.userId || data.id?.toString() || "";
          const parsedId = Number.parseInt(userId, 10);
          if (
            !isNaN(parsedId) &&
            parsedId === clientParticipant.ref_id &&
            data.role === "CLIENT"
          ) {
            setClientOnlineStatus({
              isOnline: false,
              lastSeen: new Date().toISOString(),
            });
          }
        }
      }
    );

    socket.on("recieve-message", (data: ReceivedMessage) => {
      console.log("New message received:", data);
      if (!hasRefetched) {
        refetchMessages();
        hasRefetched = true;
        setTimeout(() => (hasRefetched = false), 1000);
      }
      if (!isGroupChat && clientParticipant?.ref_id) {
        const sentById = Number.parseInt(data.sent_by.id, 10);
        if (
          !isNaN(sentById) &&
          sentById === clientParticipant.ref_id &&
          data.sent_by.role === "CLIENT"
        ) {
          setClientOnlineStatus({ isOnline: true });
          socket.emit("message-delivered", { refId: chatId, id: data.id });
        }
      }
    });

    socket.on("message-sent", (data: MessageSentConfirmation) => {
      console.log("Message sent confirmation:", data);
      if (!hasRefetched) {
        refetchMessages();
        hasRefetched = true;
        setTimeout(() => (hasRefetched = false), 1000);
      }
    });

    socket.on("message-delivered", (data: MessageStatusUpdate) => {
      console.log("Message delivered:", data);
      if (data.refId === chatId && !hasRefetched) {
        refetchMessages();
        hasRefetched = true;
        setTimeout(() => (hasRefetched = false), 1000);
      }
    });

    socket.on("message-read", (data: MessageStatusUpdate) => {
      console.log("Message read:", data);
      if (data.refId === chatId && !hasRefetched) {
        refetchMessages();
        hasRefetched = true;
        setTimeout(() => (hasRefetched = false), 1000);
      }
    });

    socket.on("notification", (data: Notification) => {
      console.log("Received notification:", data);
      if (data.ref_id.toString() === chatId) {
        setNotifications((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("online");
      socket.off("offline");
      socket.off("recieve-message");
      socket.off("message-sent");
      socket.off("message-delivered");
      socket.off("message-read");
      socket.off("notification");
      socketService.disconnect();
    };
  }, [
    auth.token?.access.token,
    clientParticipant,
    chatId,
    refetchMessages,
    isGroupChat,
    clientOnlineStatus.isOnline,
  ]);

  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const lastSeenTime = React.useMemo(() => {
    if (clientOnlineStatus.isOnline) {
      return "online";
    }
    if (clientOnlineStatus.lastSeen) {
      return formatDistanceToNow(new Date(clientOnlineStatus.lastSeen), {
        addSuffix: true,
      });
    }
    if (!clientParticipant || !clientParticipant.last_viewed) {
      return "Never";
    }
    return formatDistanceToNow(new Date(clientParticipant.last_viewed), {
      addSuffix: true,
    });
  }, [clientParticipant, clientOnlineStatus]);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !chatId || !auth.user) return;
  
    const messageType = isGroupChat ? "group" : "personal";
    console.log(`Sending message as ${messageType} chat type`);
  
    const messagePayload: ChatMessage = {
      refId: chatId,
      msgType: "text",
      msgParams: { text: messageText },
      type: messageType,
    };
  
    console.log(`Sending ${messageType} message via socket:`, messagePayload);
    socketService.sendMessage(messagePayload);
    setMessageText("");
    if (!isGroupChat && clientParticipant && clientParticipant.ref_id) {
      console.log("Updating online status due to sent message");
      setClientOnlineStatus({ isOnline: true, lastSeen: undefined });
    }
  };

  function MessageStatus({
    status,
    isFromSender,
  }: {
    status: "sent" | "delivered" | "read";
    isFromSender: boolean;
  }) {
    if (!isFromSender) return null;

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

  const renderMessage = (message: ChatMessageProps) => {
    const isFromCurrentUser = message.sent_by._id === auth.user?.id.toString();
    const isManagerMessage = isFromCurrentUser;

    switch (message.msg_type) {
      case "text": {
        const textParams = message.msg_params as TextMessageParams | undefined;
        if (!textParams || !("text" in textParams)) {
          return (
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isFromCurrentUser ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
              }`}
            >
              <p className="text-gray-500 italic">
                [Message content unavailable]
              </p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {formatTime(message.created)}
                </span>
                {isManagerMessage && (
                  <MessageStatus status={message.status} isFromSender={true} />
                )}
              </div>
            </div>
          );
        }
        return (
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
              isFromCurrentUser ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
            }`}
          >
            <p className="text-gray-900 break-words">{textParams.text}</p>
            <div
              className={`flex items-center gap-1 mt-1 ${
                isFromCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-gray-500">
                {formatTime(message.created)}
              </span>
              {isManagerMessage && (
                <MessageStatus status={message.status} isFromSender={true} />
              )}
            </div>
          </div>
        );
      }
      case "file": {
        const fileParams = message.msg_params as FileMessageParams | undefined;
        if (!fileParams || !("url" in fileParams)) {
          return (
            <div
              className={`max-w-[60%] rounded-2xl px-4 py-3 ${
                isFromCurrentUser ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
              }`}
            >
              <p className="text-gray-500 italic">[File content unavailable]</p>
              <div
                className={`flex items-center gap-1 mt-2 ${
                  isFromCurrentUser ? "justify-end" : "justify-start"
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
              isFromCurrentUser ? "bg-[#B6CEE9]" : "bg-[#F2F2F7]"
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
                isFromCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-gray-500">
                {formatTime(message.created)}
              </span>
              {isManagerMessage && (
                <MessageStatus status={message.status} isFromSender={true} />
              )}
            </div>
          </div>
        );
      }
      default:
        return null; // Ignore other message types (quote, agreement)
    }
  };

  if (isLeadsLoading || isGroupChatsLoading || !conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  const sortedMessages: ChatMessageProps[] = (chatMessages as
    | ChatMessageProps[]
    | undefined)
    ? [...(chatMessages as ChatMessageProps[])].sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
      )
    : [];

  return (
    <div className="flex flex-col h-screen p-4 sm:pt-4 pt-20 sm:p-6 bg-white">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/sales/communication">
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
              {isGroupChat ? (
                <h2 className="font-medium">{conversation.name}</h2>
              ) : (
                <>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      {clientParticipant?.user.profilePic ? (
                        <AvatarImage
                          src={clientParticipant.user.profilePic}
                          alt={`${clientParticipant?.user.firstName} ${clientParticipant?.user.lastName}`}
                        />
                      ) : (
                        <AvatarFallback>
                          {clientParticipant?.user.firstName[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {clientOnlineStatus.isOnline && (
                      <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-lg border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium">{`${clientParticipant?.user.firstName} ${clientParticipant?.user.lastName}`}</h2>
                    <p className="text-xs text-gray-500">
                      {clientOnlineStatus.isOnline ? (
                        <span className="text-green-500">online</span>
                      ) : (
                        `last seen ${lastSeenTime}`
                      )}
                    </p>
                  </div>
                </>
              )}
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

      <Card className="flex flex-1 border-0 sm:border rounded-lg overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b hidden sm:flex justify-between items-center">
            <div className="flex items-center gap-3">
              {isGroupChat ? (
                <h2 className="font-medium">{conversation.name}</h2>
              ) : (
                <>
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      {clientParticipant?.user.profilePic ? (
                        <AvatarImage
                          src={clientParticipant.user.profilePic}
                          alt={`${clientParticipant.user.firstName} ${clientParticipant.user.lastName}`}
                        />
                      ) : (
                        <AvatarFallback>
                          {clientParticipant?.user.firstName[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {clientOnlineStatus.isOnline && (
                      <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-lg border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium">{`${clientParticipant?.user.firstName} ${clientParticipant?.user.lastName}`}</h2>
                    <p className="text-sm text-gray-500">
                      {clientOnlineStatus.isOnline ? (
                        <span className="text-green-500">online</span>
                      ) : (
                        `last seen ${lastSeenTime}`
                      )}
                    </p>
                  </div>
                </>
              )}
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
              sortedMessages.map((message: ChatMessageProps) => {
                const isFromCurrentUser =
                  message.sent_by._id === auth.user?.id.toString();
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isFromCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {renderMessage(message)}
                  </div>
                );
              })
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
                  placeholder="Type your message..."
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
                  <Popover
                    open={isAttachmentPopoverOpen}
                    onOpenChange={setIsAttachmentPopoverOpen}
                  >
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex items-center gap-1"
                >
                  {fileViewMode === "received" ? "Received" : "Sent"}
                  <CaretDown size={20} />
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
          <div className="divide-y overflow-y-auto max-h-[calc(100vh-200px)]">
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
    </div>
  );
}
