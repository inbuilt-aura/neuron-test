"use client";

import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Header from "@/src/components/sale/header";
import Metrics from "@/src/components/sale/metrics";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useGetManagerProjectStatsQuery } from "../../../store/manager/managerApiSlice";
import type { RootState } from "../../../store/store";
import { Button } from "@/components/ui/button";
import type React from "react";
import { useGetUserProfileQuery } from "@/src/store/apiSlice";
import { AddEmployeeModal } from "../../../components/manager/add-Employee";
import { ManagerTable } from "../../../components/manager/manager-table";

type MetricKeys =
  | "Assigned Projects"
  | "Fast Track Projects"
  | "Revenue"
  | "Yet To Assign";

const Dashboard = () => {
  const userId = useSelector(
    (state: RootState) => state.auth.user?.id as string | undefined
  );
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKeys>("Assigned Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize userName with an empty string or from userProfile if available
  const { data: userProfile, isLoading: profileLoading } =
    useGetUserProfileQuery();
  const userName = userProfile?.firstName || "";

  const {
    data: leadStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetManagerProjectStatsQuery(userId ?? "", {
    skip: !userId,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEmployeeAdded = useCallback(async () => {
    // Refetch stats after employee is added
    if (userId) {
      try {
        await refetchStats();
        toast.success("Stats updated successfully");
      } catch (error) {
        console.error("Failed to update stats:", error);
      }
    }
  }, [userId, refetchStats]);

  const handleStatsUpdated = useCallback(async () => {
    // Refetch stats when table data changes
    if (userId) {
      try {
        await refetchStats();
      } catch (error) {
        console.error("Failed to update stats:", error);
      }
    }
  }, [userId, refetchStats]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="md:block hidden">
        <Header
          title={
            profileLoading
              ? "Welcome Back 👋"
              : `Welcome Back, ${userName.toUpperCase()} 👋`
          }
          subtitle="Here's what's happening with your team,"
          extraContent={
            <>
              <h2 className="text-lg font-semibold">Projects</h2>
              <button
                className="px-4 py-2 bg-custom-blue text-white font-semibold rounded-md"
                onClick={handleOpenModal}
              >
                + Add Employee
              </button>
            </>
          }
        />
        {statsLoading ? (
          <div>Loading stats...</div>
        ) : (
          <Metrics
            metrics={[
              { label: "Assigned Projects", value: leadStats?.all ?? 0 },
              {
                label: "Fast Track Projects",
                value: leadStats?.fast_track ?? 0,
              },
              { label: "Revenue", value: leadStats?.revenue ?? 0 },
              { label: "Yet To Assign", value: leadStats?.unassigned ?? 0 },
            ]}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
          />
        )}
      </div>

      {/* Mobile view */}
      <div className="md:hidden p-4 pt-[100px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button
            className="px-4 py-2 bg-[#0B4776] text-white font-semibold rounded-md"
            onClick={handleOpenModal}
          >
            + Add Employee
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-4">
        <div className="relative w-full md:w-[25rem] ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#8C8E90]" />
          <Input
            placeholder="Search by name or mobile number"
            className="pl-10 w-full bg-[#FFFFFF] border-[1px] border-[#E0E0E0]"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Manager Table Component */}
      {userId && (
        <div className="px-4">
          <ManagerTable
            selectedMetric={selectedMetric}
            managerId={userId}
            searchQuery={searchQuery}
            onStatsUpdated={handleStatsUpdated}
          />
        </div>
      )}

      {/* Add Employee Modal */}
      {userId && (
        <AddEmployeeModal
          isOpen={isModalOpen}
          onClose={() => {
            handleCloseModal();
            handleEmployeeAdded();
          }}
          managerId={userId}
        />
      )}
    </div>
  );
};

export default Dashboard;
