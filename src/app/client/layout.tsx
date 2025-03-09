"use client";

import { ClientSidebar } from "../../components/client/clientSidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  // Function to close the sidebar
  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[240px] bg-[#F8FAFC] transform ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:static lg:translate-x-0 lg:flex`}
      >
        <ClientSidebar closeSidebar={closeSidebar} />
      </div>

      {/* Backdrop for Mobile */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar} // Close sidebar on backdrop click
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header for Mobile */}
        <div className="lg:hidden p-4 flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-md"
          >
            {sidebarVisible ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
