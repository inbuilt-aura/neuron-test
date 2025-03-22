"use client";

import React, { createContext, useContext, useEffect } from "react";
import socketService, {
  type OnlineStatusEvent,
  type ReceivedMessage,
  type MessageSentConfirmation,
  type Notification,
} from "./socket-service";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import {
  setSocketState,
  updateOnlineStatus,
  addMessage,
  addNotification,
} from "../store/websocket/websocketSlice";
import type { WebSocketSliceState } from "../store/websocket/websocketSlice";

export const SocketContext = createContext<WebSocketSliceState | undefined>(
  undefined
);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const token = useSelector(
    (state: RootState) => state.auth.token?.access.token
  );
  const socketState = useSelector((state: RootState) => state.websocket);

  useEffect(() => {
    if (token && !socketService.isConnected()) {
      console.log("Connecting WebSocket with token...");
      socketService.connect(token);

      const socket = socketService.getSocket();
      if (socket) {
        socket.on("connect", () => {
          console.log("WebSocket connected");
          dispatch(
            setSocketState({
              isConnected: true,
              onlineUsers: socketState.onlineUsers,
              messages: socketState.messages,
              notifications: socketState.notifications,
            })
          );
        });

        socket.on("disconnect", (reason: string) => {
          console.log("WebSocket disconnected:", reason);
          dispatch(
            setSocketState({
              isConnected: false,
              onlineUsers: socketState.onlineUsers,
              messages: socketState.messages,
              notifications: socketState.notifications,
            })
          );
        });

        socket.on("online", (data: OnlineStatusEvent) => {
          const userId = (
            data.ref_id?.toString() ||
            data.userId ||
            ""
          ).toString();
          console.log("User online:", userId);
          dispatch(
            updateOnlineStatus({
              userId,
              status: {
                ...data,
                timestamp: data.timestamp || new Date().toISOString(),
              },
            })
          );
        });

        socket.on("offline", (data: OnlineStatusEvent) => {
          const userId = (
            data.ref_id?.toString() ||
            data.userId ||
            ""
          ).toString();
          console.log("User offline:", userId);
          dispatch(
            updateOnlineStatus({
              userId,
              status: {
                ...data,
                timestamp: data.timestamp || new Date().toISOString(),
              },
            })
          );
        });

        socket.on("receive-message", (data: ReceivedMessage) => {
          console.log("Received message:", data);
          dispatch(addMessage(data));
        });

        socket.on("message-sent", (data: MessageSentConfirmation) => {
          console.log("Message sent confirmation:", data);
          dispatch(addMessage(data));
        });

        socket.on(
          "delivered-message",
          (data: { id: string; refId: string }) => {
            console.log("Message delivered:", data);
            const updatedMessages = {
              ...socketState.messages,
              [data.refId]: (socketState.messages[data.refId] || []).map(
                (msg) =>
                  msg.id === data.id ? { ...msg, status: "delivered" } : msg
              ),
            };
            dispatch(
              setSocketState({
                isConnected: socketState.isConnected,
                onlineUsers: socketState.onlineUsers,
                messages: updatedMessages,
                notifications: socketState.notifications,
              })
            );
          }
        );

        socket.on("notification", (data: Notification) => {
          console.log("Notification received:", data);
          dispatch(addNotification(data));
        });

        socket.on("connect_error", (error: Error) => {
          console.error("Socket connection error:", error.message);
        });

        socket.on("sign-in-success", (data: unknown) => {
          console.log("Sign-in success:", data);
        });

        socket.on("message", (data: unknown) => {
          console.log("New message received:", data);
        });

        socket.on("error", (error: Error) => {
          console.error("Socket error:", error);
        });

        return () => {
          socket.off("connect");
          socket.off("disconnect");
          socket.off("online");
          socket.off("offline");
          socket.off("receive-message");
          socket.off("message-sent");
          socket.off("delivered-message");
          socket.off("notification");
          socket.off("connect_error");
          socket.off("sign-in-success");
          socket.off("message");
          socket.off("error");
          console.log("SocketProvider cleanup (event listeners removed)");
        };
      }
    }
  }, [token, dispatch, socketState]);

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
