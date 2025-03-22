"use client";

import { ManagerSidebar } from "../../components/manager/managerSidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ManagerSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
