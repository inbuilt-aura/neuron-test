"use client"

import { useFetchProjectStatsQuery } from "@/src/store/sales/salesApiSlice"
import { useSelector } from "react-redux"
import type { RootState } from "@/src/store/store"
import { useEffect } from "react"

export type ProjectCategory = "totalclient" | "quote" | "fasttrack" | "forward"

export interface Stat {
  id: ProjectCategory
  name: string
  value: string
  route: ProjectCategory
}

export const useProjectStats = (): { stats: Stat[]; refetch: () => void } => {
  const userId = useSelector((state: RootState) => state.auth.user?.id) ?? ""
  const { data: statsData, refetch } = useFetchProjectStatsQuery(userId)

  // Immediate refetch when the component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  const stats: Stat[] = [
    {
      id: "totalclient",
      name: "Total Clients",
      value: statsData?.total?.toString() ?? "0",
      route: "totalclient",
    },
    {
      id: "quote",
      name: "Addition in Quote",
      value: statsData?.addition_in_quote?.toString() ?? "0",
      route: "quote",
    },
    {
      id: "fasttrack",
      name: "Fast Track Project",
      value: statsData?.fast_track?.toString() ?? "0",
      route: "fasttrack",
    },
    {
      id: "forward",
      name: "Yet To Forward",
      value: statsData?.yet_to_forward?.toString() ?? "0",
      route: "forward",
    },
  ]

  return { stats, refetch }
}

