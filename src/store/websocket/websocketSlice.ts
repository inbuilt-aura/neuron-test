// websocket/websocketSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ReceivedMessage,
  OnlineStatusEvent,
  MessageSentConfirmation,
  Notification,
} from "../../lib/socket-service";

export interface WebSocketSliceState {
  isConnected: boolean;
  onlineUsers: Record<string, { isOnline: boolean; lastSeen?: string }>;
  messages: Record<string, ReceivedMessage[]>;
  notifications: Notification[];
}

const initialState: WebSocketSliceState = {
  isConnected: false,
  onlineUsers: {},
  messages: {},
  notifications: [],
};

const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    setSocketState: (state, action: PayloadAction<WebSocketSliceState>) => {
      state.isConnected = action.payload.isConnected;
      state.onlineUsers = action.payload.onlineUsers;
      state.messages = action.payload.messages;
      state.notifications = action.payload.notifications;
    },
    updateOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; status: OnlineStatusEvent }>
    ) => {
      const { userId, status } = action.payload;
      state.onlineUsers[userId] = {
        isOnline: !!status.timestamp,
        lastSeen: status.timestamp,
      };
    },
    addMessage: (
      state,
      action: PayloadAction<ReceivedMessage | MessageSentConfirmation>
    ) => {
      const message = action.payload;
      const refId = message.refId;
      if (!state.messages[refId]) {
        state.messages[refId] = [];
      }
      state.messages[refId].push(message as ReceivedMessage);
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
  },
});

export const {
  setSocketState,
  updateOnlineStatus,
  addMessage,
  addNotification,
} = websocketSlice.actions;
export default websocketSlice.reducer;
