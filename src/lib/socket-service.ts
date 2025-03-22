import { io, type Socket } from "socket.io-client";

// Define message params types
export interface TextMessageParams {
  text: string;
}

export interface FileMessageParams {
  filename?: string;
  name?: string;
  url: string;
  size: number;
  mimetype: string;
  public_id?: string;
  text?: string;
}

export interface QuoteMessageParams {
  amount: number;
  status: string;
  requirement: string;
  id: number;
}

export interface ChatMessage {
  refId: string;
  msgType: "text" | "file" | "quote";
  msgParams: TextMessageParams | FileMessageParams | QuoteMessageParams;
  type: "personal" | "group";
}

export interface ReceivedMessage {
  id: string;
  refId: string;
  msgType: "text" | "file" | "quote";
  msgParams: TextMessageParams | FileMessageParams | QuoteMessageParams;
  type: string;
  status: string;
  created: string;
  modified: string;
  sent_by: {
    id: string;
    firstName: string;
    lastName: string;
    profilePic: string;
    role: string;
  };
}

export interface OnlineStatusEvent {
  userId?: string;
  ref_id?: number;
  email?: string;
  timestamp?: string;
}

export interface MessageStatusUpdate {
  refId: string;
  id: string;
  status: "delivered" | "read";
}

export interface GroupChatResponse {
  success: boolean;
  data?: { id: string; name: string; project_id: number };
  error?: string;
}

export interface MessageSentConfirmation {
  id: string;
  refId: string;
  msgType: "text" | "file" | "quote";
  msgParams: TextMessageParams | FileMessageParams | QuoteMessageParams;
  type: string;
  status: string;
  created?: string;
  modified?: string;
}

// Add Notification interface
export interface Notification {
  id: string;
  text: string;
  time: string;
  description: string;
  ref_id: number;
}

class SocketService {
  private socket: Socket | null = null;
  private baseUri = "wss://api.neuronresearch.org";
  private connectionStatus: "disconnected" | "connecting" | "connected" =
    "disconnected";
  private token: string | null = null;
  private userId: string | null = null;
  private onlineCallbacks: ((data: OnlineStatusEvent) => void)[] = [];
  private offlineCallbacks: ((data: OnlineStatusEvent) => void)[] = [];
  private messageSentCallbacks: ((data: MessageSentConfirmation) => void)[] =
    [];
  private receiveMessageCallbacks: ((data: ReceivedMessage) => void)[] = [];
  private messageStatusCallbacks: ((data: MessageStatusUpdate) => void)[] = [];
  private notificationCallbacks: ((data: Notification) => void)[] = [];

  connect(token: string, userId?: string): void {
    if (!token) {
      console.error("No token provided for socket connection");
      return;
    }

    this.token = token;
    this.userId = userId || null;
    this.connectionStatus = "connecting";

    if (this.socket?.connected) {
      this.connectionStatus = "connected";
      if (this.userId) this.triggerOnlineForSelf();
      return;
    }

    if (this.socket) this.socket.disconnect();

    this.socket = io(this.baseUri, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();

    if (userId) {
      this.socket.on("connect", () => {
        this.socket?.emit("check-online", { userId });
        this.triggerOnlineForSelf();
      });
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.off("connect");
    this.socket.off("connect_error");
    this.socket.off("sign-in-success");
    this.socket.off("online");
    this.socket.off("offline");
    this.socket.off("message");
    this.socket.off("recieve-message");
    this.socket.off("message-sent");
    this.socket.off("message-delivered");
    this.socket.off("message-read");
    this.socket.off("notification"); // Added
    this.socket.off("error");
    this.socket.off("disconnect");

    this.socket.on("connect", () => {
      this.connectionStatus = "connected";
      console.log("Socket connected successfully with ID:", this.socket?.id);
    });

    this.socket.on("connect_error", (error) => {
      this.connectionStatus = "disconnected";
      console.error("Socket connection error:", error.message);
    });

    this.socket.on("sign-in-success", (data: unknown) => {
      console.log("Sign in success:", data);
    });

    this.socket.on("online", (data: OnlineStatusEvent) => {
      this.onlineCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("offline", (data: OnlineStatusEvent) => {
      this.offlineCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("recieve-message", (data: ReceivedMessage) => {
      this.receiveMessageCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("message-sent", (data: MessageSentConfirmation) => {
      this.messageSentCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("message-delivered", (data: MessageStatusUpdate) => {
      this.messageStatusCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("message-read", (data: MessageStatusUpdate) => {
      this.messageStatusCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("notification", (data: Notification) => {
      console.log("Notification received:", data);
      this.notificationCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("error", (error: Error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("disconnect", (reason: string) => {
      this.connectionStatus = "disconnected";
      if (this.userId) this.triggerOfflineForSelf();
      if (reason === "io server disconnect" && this.token) {
        setTimeout(() => {
          if (this.token && this.userId) this.connect(this.token, this.userId);
        }, 1000);
      }
    });
  }

  onOnline(callback: (data: OnlineStatusEvent) => void): void {
    this.onlineCallbacks.push(callback);
  }

  onOffline(callback: (data: OnlineStatusEvent) => void): void {
    this.offlineCallbacks.push(callback);
  }

  onMessageSent(callback: (data: MessageSentConfirmation) => void): void {
    this.messageSentCallbacks.push(callback);
  }

  onReceiveMessage(callback: (data: ReceivedMessage) => void): void {
    this.receiveMessageCallbacks.push(callback);
  }

  onMessageStatus(callback: (data: MessageStatusUpdate) => void): void {
    this.messageStatusCallbacks.push(callback);
  }

  onNotification(callback: (data: Notification) => void): void {
    this.notificationCallbacks.push(callback);
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  sendMessage(message: ChatMessage): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected. Cannot send message.");
      return;
    }
    this.socket.emit("message", message);
  }

  checkOnlineStatus(refId: number): void {
    if (!this.socket?.connected) return;
    this.socket.emit("check-online", { ref_id: refId });
  }

  checkOnlineStatusByUserId(userId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("check-online", { userId });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = "disconnected";
      if (this.userId) this.triggerOfflineForSelf();
    }
  }

  checkIsGroupChat(chatId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve(false);
        return;
      }
      this.socket.emit(
        "get-group-chat",
        { ref_id: chatId },
        (response: GroupChatResponse) => {
          resolve(response?.success || false);
        }
      );
    });
  }

  reconnect(): void {
    if (this.token && this.userId) this.connect(this.token, this.userId);
  }

  private triggerOnlineForSelf(): void {
    if (this.userId) {
      const selfOnlineEvent: OnlineStatusEvent = {
        userId: this.userId,
        timestamp: new Date().toISOString(),
      };
      this.onlineCallbacks.forEach((callback) => callback(selfOnlineEvent));
    }
  }

  private triggerOfflineForSelf(): void {
    if (this.userId) {
      const selfOfflineEvent: OnlineStatusEvent = {
        userId: this.userId,
        timestamp: new Date().toISOString(),
      };
      this.offlineCallbacks.forEach((callback) => callback(selfOfflineEvent));
    }
  }
}

const socketService = new SocketService();
export default socketService;
