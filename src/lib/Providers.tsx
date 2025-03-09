"use client";

import type React from "react";
import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "../store/store";
import type { RootState } from "../store/store";
// import { WebSocketProvider } from "../components/client/websocket-provider";

const DebugComponent: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    console.log(
      "Debug: Store state updated, isAuthenticated =",
      isAuthenticated
    );
  }, [isAuthenticated]);

  return null;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <DebugComponent />
     {children}
    </Provider>
  );
}
