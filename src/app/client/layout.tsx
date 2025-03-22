"use client";

import { ClientSidebar } from "../../components/client/clientSidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
