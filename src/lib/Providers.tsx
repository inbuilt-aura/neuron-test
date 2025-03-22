// lib/Providers.tsx
"use client";

import type React from "react";
import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "../store/store";
import type { RootState } from "../store/store";
import { SocketProvider } from "../lib/socket-context";

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
      <SocketProvider>
        <DebugComponent />
        {children}
      </SocketProvider>
    </Provider>
  );
}
