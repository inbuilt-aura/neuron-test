"use client";

import type React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "../../store/websocket/websocketSlice";
import type { AppDispatch, RootState } from "../../store/store";

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const isConnected = useSelector(
    (state: RootState) => state.websocket.isConnected
  );

  useEffect(() => {
    // Connect to WebSocket when authenticated and token is available
    if (isAuthenticated && token && !isConnected) {
      // The error is likely here - connectWebSocket doesn't need arguments
      dispatch(connectWebSocket());
    }

    // Disconnect when not authenticated
    if (!isAuthenticated && isConnected) {
      dispatch(disconnectWebSocket());
    }

    // Cleanup on unmount
    return () => {
      if (isConnected) {
        dispatch(disconnectWebSocket());
      }
    };
  }, [isAuthenticated, token, isConnected, dispatch]);

  return <>{children}</>;
};
