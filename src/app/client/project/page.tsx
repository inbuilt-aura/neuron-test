"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Header from "@/src/components/sale/header";
import Metrics from "@/src/components/sale/metrics";
import Image from "next/image";
import Link from "next/link";
import { useGetClientProfileQuery } from "../../../store/apiSlice";
import {
  useFetchClientStatsQuery,
  useFetchActiveProjectsQuery,
  useFetchCompletedProjectsQuery,
} from "../../../store/client/clientApiSlice";

type MetricKeys = "Active Paper" | "Complete Paper";

const DocumentCard = ({
  title,
  date,
  id,
}: {
  title: string;
  date: string;
  id: number;
}) => (
  <Link href={`/client/project/${id}`} passHref>
    <Card className="w-full h-auto p-8  bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex flex-col justify-start items-start">
      <div className="w-32 h-32 mb-6 bg-[#FFFFFF] rounded-xl border border-[#D7DFE6] flex items-center justify-center">
        <Image
          src="/doc.svg"
          alt="Document Icon"
          width={24}
          height={24}
          className="w-20 h-20 object-contain"
        />
      </div>
      <div>
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-sm font-medium text-gray-500">{date}</p>
      </div>
    </Card>
  </Link>
);

const Project = () => {
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKeys>("Active Paper");

  const {
    data: clientProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetClientProfileQuery();

  const {
    data: clientStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchClientStats,
  } = useFetchClientStatsQuery(
    clientProfile?.id ? clientProfile.id.toString() : "skip",
    { skip: !clientProfile?.id }
  );

  const {
    data: activeProjects,
    isLoading: activeProjectsLoading,
    error: activeProjectsError,
  } = useFetchActiveProjectsQuery(
    clientProfile?.id ? clientProfile.id.toString() : "skip",
    {
      skip: !clientProfile?.id || selectedMetric !== "Active Paper",
    }
  );

  const {
    data: completedProjects,
    isLoading: completedProjectsLoading,
    error: completedProjectsError,
  } = useFetchCompletedProjectsQuery(
    clientProfile?.id ? clientProfile.id.toString() : "skip",
    {
      skip: !clientProfile?.id || selectedMetric !== "Complete Paper",
    }
  );

  useEffect(() => {
    if (clientProfile?.id) {
      refetchClientStats();
    }
  }, [clientProfile?.id, refetchClientStats]);

  const isLoading =
    profileLoading ||
    statsLoading ||
    activeProjectsLoading ||
    completedProjectsLoading;
  const error =
    profileError || statsError || activeProjectsError || completedProjectsError;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data. Please try again later.</div>;
  }

  const clientName = clientProfile
    ? `${clientProfile.firstName} ${clientProfile.lastName}`
    : "Client";

  // Select projects based on the metric
  const displayedProjects =
    selectedMetric === "Active Paper" ? activeProjects : completedProjects;

  return (
    <div className="flex flex-col items-center p-6 sm:pt-4 pt-10">
      <main className="flex-1 w-full">
        <Header
          title={`Welcome Back, ${clientName} 👋`}
          subtitle="Here's what's happening with your projects,"
        />
        <Metrics
          metrics={[
            {
              label: "Active Paper",
              value: clientStats?.active.toString() ?? "0",
            },
            {
              label: "Complete Paper",
              value: clientStats?.completed.toString() ?? "0",
            },
          ]}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />
        <div className="p-4 text-xl font-semibold">Your Documents</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full p-4">
          {displayedProjects && displayedProjects.length > 0 ? (
            displayedProjects.map((project) => (
              <DocumentCard
                key={project.id}
                title={project.name}
                date={new Date(project.edd).toLocaleDateString()}
                id={project.id}
              />
            ))
          ) : (
            <p>
              No {selectedMetric === "Active Paper" ? "active" : "completed"}{" "}
              projects available.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Project;
