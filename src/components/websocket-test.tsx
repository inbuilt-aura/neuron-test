"use client"; // For Next.js if applicable; remove if not using Next.js

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store } from "../store/store"; // Ensure this path is correct

function NoSlashWebSocketTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [logs, setLogs] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const specificUrl = "wss://api.neuronresearch.org"; // Hardcoded, no trailing slash

  // Add a log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs((prev) => [...prev, logEntry]);
  };

  // Handle connect button
  const handleConnect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      addLog("WebSocket is already connected");
      return;
    }

    try {
      setConnectionStatus("connecting");

      const url = specificUrl; // No manipulation, trusting the hardcoded value
      addLog(`Attempting to connect to WebSocket using URL: ${url}`);

      const token = store.getState().auth.token?.access?.token;
      if (!token) {
        addLog("ERROR: No access token available for WebSocket connection");
        setConnectionStatus("disconnected");
        return;
      }

      addLog(`Found access token: ${token.substring(0, 10)}...`);
      socketRef.current = new WebSocket(url);

      addLog(`Browser is using URL: ${socketRef.current.url}`);
      addLog(
        `Browser URL has trailing slash: ${socketRef.current.url.endsWith("/")}`
      );

      socketRef.current.onopen = () => {
        addLog("WebSocket connection established!");
        setConnectionStatus("connected");
        if (socketRef.current && token) {
          addLog("Sending authentication token...");
          socketRef.current.send(
            JSON.stringify({
              type: "auth",
              token: token,
            })
          );
        }
      };

      socketRef.current.onmessage = (event) => {
        addLog(`Message received: ${event.data}`);
        try {
          const data = JSON.parse(event.data);
          addLog(`Parsed message: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
          addLog(`Error parsing message: ${error}`);
        }
      };

      socketRef.current.onerror = (error) => {
        addLog(`WebSocket error occurred: ${error.type}`);
        setConnectionStatus("disconnected");
      };

      socketRef.current.onclose = (event) => {
        addLog(
          `WebSocket connection closed: Code ${event.code}, Reason: ${
            event.reason || "No reason provided"
          }`
        );
        setConnectionStatus("disconnected");
      };
    } catch (error) {
      addLog(
        `Error setting up WebSocket: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setConnectionStatus("disconnected");
    }
  };

  // Handle disconnect button
  const handleDisconnect = () => {
    if (socketRef.current) {
      addLog("Disconnecting WebSocket...");
      socketRef.current.close();
      socketRef.current = null;
      setConnectionStatus("disconnected");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        WebSocket Test (No Trailing Slash)
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>WebSocket Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-lg font-medium mb-2">
                Testing URL: <span className="font-mono">{specificUrl}</span>
              </p>
              <p className="text-sm text-gray-500">
                Ensuring no trailing slash
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge
                variant={
                  connectionStatus === "connected"
                    ? "default"
                    : connectionStatus === "connecting"
                    ? "outline"
                    : "destructive"
                }
              >
                {connectionStatus}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={
                  connectionStatus === "connecting" ||
                  connectionStatus === "connected"
                }
              >
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Connect"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={connectionStatus !== "connected"}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 overflow-y-auto border rounded-md p-4 bg-gray-50 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No logs yet. Click &quot;Connect&quot; to start.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setLogs([])} size="sm">
            Clear Logs
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default NoSlashWebSocketTest;
