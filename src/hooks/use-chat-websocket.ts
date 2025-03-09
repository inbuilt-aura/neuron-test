"use client"

import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, sendTextMessage } from "../store/websocket/websocketSlice"
import type { AppDispatch, RootState } from "../store/store"

// Define connection state enum
export enum ConnectionState {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
}

// Define WebSocket message types
interface WebSocketMessageBase {
  refId?: string
  type: string
}

// Message types based on the Postman screenshot
interface TextMessage extends WebSocketMessageBase {
  msgType: "text"
  msgParams: {
    text: string
  }
  type: "personal" | "group"
}

interface AuthMessage extends WebSocketMessageBase {
  type: "auth"
  token: string
}

// Union type for all possible message types
export type WebSocketMessage = TextMessage | AuthMessage

// Response message from server
export interface WebSocketResponse {
  refId?: string
  status?: string
  data?: unknown
  error?: string
}

export const useChatWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected)
  const messages = useSelector((state: RootState) => state.websocket.messages || [])

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    isConnected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED,
  )

  // Update connection state when isConnected changes
  useEffect(() => {
    if (isConnected) {
      setConnectionState(ConnectionState.CONNECTED)
    } else if (isAuthenticated) {
      setConnectionState(ConnectionState.CONNECTING)
    } else {
      setConnectionState(ConnectionState.DISCONNECTED)
    }
  }, [isConnected, isAuthenticated])

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      dispatch(connectWebSocket())
    }

    return () => {
      // Cleanup on unmount
      if (isConnected) {
        dispatch(disconnectWebSocket())
      }
    }
  }, [isAuthenticated, isConnected, dispatch])

  // Function to send a text message
  const sendMessage = useCallback(
    (text: string, type: "personal" | "group" = "personal"): boolean => {
      if (!isConnected) {
        console.error("Cannot send message: WebSocket is not connected")
        return false
      }

      return sendTextMessage(text, type)
    },
    [isConnected],
  )

  // Function to send a custom message
  const sendCustomMessage = useCallback(
    (message: WebSocketMessage): boolean => {
      if (!isConnected) {
        console.error("Cannot send message: WebSocket is not connected")
        return false
      }

      return sendWebSocketMessage(message)
    },
    [isConnected],
  )

  // Safe getter for messages to prevent undefined errors
  const getMessage = useCallback(
    (index: number) => {
      if (!messages || index >= messages.length) {
        return null
      }
      return messages[index]
    },
    [messages],
  )

  return {
    connectionState,
    isConnected,
    messages,
    getMessage, // Add this safe getter function
    sendMessage,
    sendCustomMessage,
  }
}

