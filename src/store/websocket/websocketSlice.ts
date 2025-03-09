import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Base API URL
const BASE_API_URL = "https://api.neuronresearch.org";

// Function to convert HTTP URL to WebSocket URL (without adding /ws)
const getWebSocketUrl = (baseUrl: string): string => {
  // Replace http:// with ws:// and https:// with wss://
  return baseUrl
    .replace(/^http:\/\//i, "ws://")
    .replace(/^https:\/\//i, "wss://");
};

// Define the token structure
interface TokenStructure {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

// Define message types
interface WebSocketMessageBase {
  refId?: string;
  type: string;
}

// Message types based on the Postman screenshot
interface TextMessage extends WebSocketMessageBase {
  msgType: "text";
  msgParams: {
    text: string;
  };
  type: "personal" | "group";
}

interface AuthMessage extends WebSocketMessageBase {
  type: "auth";
  token: string;
}

// Union type for all possible message types
type WebSocketMessage = TextMessage | AuthMessage;

// Response message from server
interface WebSocketResponse {
  refId?: string;
  status?: string;
  data?: unknown;
  error?: string;
}

// Define the WebSocket state
interface WebSocketState {
  isConnected: boolean;
  messages: WebSocketResponse[];
  connectionError: string | null;
}

// Define the initial state
const initialState: WebSocketState = {
  isConnected: false,
  messages: [],
  connectionError: null,
};

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Create a Redux slice for WebSocket functionality
const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
    },
    messageReceived: (state, action: PayloadAction<WebSocketResponse>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

// Export the actions
export const {
  setConnected,
  setConnectionError,
  messageReceived,
  clearMessages,
} = websocketSlice.actions;

// Export the reducer
export default websocketSlice.reducer;

// Define a thunk to connect to the WebSocket server
export const connectWebSocket = createAsyncThunk(
  "websocket/connect",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const tokenObj = state.auth.token as TokenStructure;

    if (!tokenObj || !tokenObj.access || !tokenObj.access.token) {
      const errorMsg =
        "WebSocket connection failed: No authentication token available";
      console.error(errorMsg);
      dispatch(setConnectionError(errorMsg));
      return Promise.reject(errorMsg);
    }

    const accessToken = tokenObj.access.token;

    try {
      console.log(
        "Attempting to connect to WebSocket with token:",
        accessToken.substring(0, 10) + "..."
      );

      // Close existing connection if any
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }

      // Construct WebSocket URL from base URL (without adding /ws)
      const wsUrl = getWebSocketUrl(BASE_API_URL);
      console.log("Connecting to WebSocket URL:", wsUrl);

      // Create new WebSocket connection
      socket = new WebSocket(wsUrl);

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (socket && socket.readyState !== WebSocket.OPEN) {
          console.error("WebSocket connection timeout");
          socket.close();
          dispatch(setConnectionError("Connection timeout"));
        }
      }, 10000); // 10 second timeout

      // After connection is established, we'll authenticate by sending a message
      socket.onopen = () => {
        console.log("WebSocket connection established successfully");
        clearTimeout(connectionTimeout);
        reconnectAttempts = 0;

        // Send authentication message if needed
        if (socket && socket.readyState === WebSocket.OPEN) {
          const authMessage: AuthMessage = {
            type: "auth",
            token: accessToken,
          };
          socket.send(JSON.stringify(authMessage));
          console.log("Authentication message sent");
        }

        dispatch(setConnected(true));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketResponse;
          console.log("WebSocket message received:", data);
          dispatch(messageReceived(data));
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        clearTimeout(connectionTimeout);

        // Try alternative connection approach on error
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const errorMsg = `WebSocket connection error. Attempt ${
            reconnectAttempts + 1
          } of ${MAX_RECONNECT_ATTEMPTS}`;
          console.log(errorMsg);
          dispatch(setConnectionError(errorMsg));
        } else {
          const errorMsg =
            "Maximum reconnection attempts reached. Please check your network or contact support.";
          console.error(errorMsg);
          dispatch(setConnectionError(errorMsg));
        }

        dispatch(setConnected(false));
      };

      socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        clearTimeout(connectionTimeout);
        dispatch(setConnected(false));

        // Attempt to reconnect after a delay if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff with max 30s

          console.log(
            `Attempting to reconnect WebSocket in ${
              delay / 1000
            } seconds... (Attempt ${reconnectAttempts} of ${MAX_RECONNECT_ATTEMPTS})`
          );

          setTimeout(() => {
            console.log("Attempting to reconnect WebSocket...");
            dispatch(connectWebSocket());
          }, delay);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          const errorMsg =
            "Maximum reconnection attempts reached. Please check your network or contact support.";
          console.error(errorMsg);
          dispatch(setConnectionError(errorMsg));
        }
      };

      return Promise.resolve();
    } catch (error) {
      const errorMsg = `Error setting up WebSocket connection: ${error}`;
      console.error(errorMsg);
      dispatch(setConnectionError(errorMsg));
      return Promise.reject(error);
    }
  }
);

// Helper function to send a message through the WebSocket
export const sendWebSocketMessage = (message: WebSocketMessage): boolean => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  console.error("Cannot send message, WebSocket is not connected");
  return false;
};

// Helper function to send a text message
export const sendTextMessage = (
  text: string,
  type: "personal" | "group" = "personal"
): boolean => {
  const message: TextMessage = {
    refId: generateRefId(), // Generate a unique reference ID
    msgType: "text",
    msgParams: {
      text: text,
    },
    type: type,
  };
  return sendWebSocketMessage(message);
};

// Generate a unique reference ID for messages
const generateRefId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Define a thunk to disconnect from the WebSocket server
export const disconnectWebSocket = createAsyncThunk(
  "websocket/disconnect",
  async (_, { dispatch }) => {
    if (socket) {
      socket.close();
      dispatch(setConnected(false));
    }
  }
);
