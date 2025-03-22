"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Header from "@/src/components/sale/header";
import Metrics from "@/src/components/sale/metrics";
import LeadTable from "@/src/components/sale/lead/leadTable";
import { Input } from "@/components/ui/input";
import { AddLeadModal } from "@/src/components/sale/lead/addLead";
import { Search } from "lucide-react";
import { useGetUserProfileQuery } from "../../../store/apiSlice";
import { useFetchLeadStatsQuery } from "../../../store/sales/salesApiSlice";
import type { RootState } from "../../../store/store";
import { Button } from "@/components/ui/button";
import type React from "react";

type MetricKeys =
  | "Total Leads"
  | "Today's Follow Up"
  | "New Leads"
  | "Pending Messages";

const Dashboard = () => {
  const userId = useSelector(
    (state: RootState) => state.auth.user?.id as string | undefined
  );
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKeys>("Total Leads");
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refetchTable, setRefetchTable] = useState<(() => void) | null>(null);

  const { data: leadStats, refetch: refetchLeadStats } = useFetchLeadStatsQuery(
    userId ?? "",
    { skip: !userId }
  );
  const { data: userProfile, error, isLoading } = useGetUserProfileQuery();

  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.firstName);
    }
  }, [userProfile]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch user profile. Please try again later.");
    }
  }, [error]);

  const forceRefreshStats = () => {
    if (userId) {
      refetchLeadStats();
    }
  };

  const handleAddLead = () => {
    setIsAddLeadModalOpen(true);
  };

  const closeModal = () => {
    setIsAddLeadModalOpen(false);
  };

  const handleAddLeadSubmit = () => {
    toast.success("Lead created successfully!");
    closeModal();
    forceRefreshStats();
    if (refetchTable) {
      refetchTable(); // Refetch 
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="md:block hidden">
        <Header
          title={
            isLoading
              ? "Welcome Back 👋"
              : `Welcome Back, ${userName.toUpperCase()} 👋`
          }
          subtitle="Here's what's happening with your team,"
          extraContent={
            <>
              <h2 className="text-lg font-semibold">Leads</h2>
              <button
                onClick={handleAddLead}
                className="px-4 py-2 bg-custom-blue text-white font-semibold rounded-md"
              >
                + Add Lead
              </button>
            </>
          }
        />
        <Metrics
          metrics={[
            { label: "Total Leads", value: leadStats?.total ?? 0 },
            {
              label: "Today's Follow Up",
              value: leadStats?.follow_up_today ?? 0,
            },
            { label: "New Leads", value: leadStats?.recent ?? 0 },
            { label: "Pending Messages", value: leadStats?.pending ?? 0 },
          ]}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />
      </div>

      <div className="md:hidden p-4 pt-[100px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Leads</h2>
          <Button
            onClick={handleAddLead}
            className="px-4 py-2 bg-[#0B4776] text-white font-semibold rounded-md"
          >
            + Add Lead
          </Button>
        </div>
      </div>

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

      <LeadTable
        selectedMetric={selectedMetric}
        searchQuery={searchQuery}
        onLeadUpdate={forceRefreshStats}
        onLeadDelete={forceRefreshStats}
        onTransferSuccess={forceRefreshStats}
        setRefetchTable={setRefetchTable} 
      />

      {isAddLeadModalOpen && (
        <AddLeadModal
          isOpen={isAddLeadModalOpen}
          onClose={closeModal}
          onSubmit={handleAddLeadSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;