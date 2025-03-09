"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, FileText, HelpCircle, MessageCircle, Users2 } from 'lucide-react'

// import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const navigation = [
  {
    title: "My Project",
    href: "/project",
    icon: FileText,
  },
  {
    title: "Peer Review",
    href: "/review",
    icon: Users2,
  },
  {
    title: "Communication",
    href: "/communication",
    icon: MessageCircle,
  },
  {
    title: "Help Center",
    href: "/help",
    icon: HelpCircle,
  },
]

export function AdminDashboard() {
  const [active, setActive] = React.useState("/project")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="w-[240px] border-r bg-[#ECF1F4] flex flex-col">
          <SidebarHeader className="p-6 flex justify-center items-center h-[100px]">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Neuron Logo"
                width={120}
                height={40}
                priority
              />
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1">
            <SidebarMenu className="px-4 space-y-2">
              {navigation.map((item) => (
                <React.Fragment key={item.href}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={active === item.href}
                      onClick={() => setActive(item.href)}
                      className="flex items-center h-10 w-full gap-3 rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-white data-[active=true]:bg-white"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5 opacity-70" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {item.title === "Communication" && (
                    <hr className="my-2 border-t border-gray-200" />
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6">
            <div className="flex items-center gap-3 rounded-lg bg-white p-3 border border-[#E6E4F0]">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt="Anurag Sharma" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Anurag Sharma</span>
                <span className="text-xs text-gray-500">Biostatistician</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 bg-white p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Welcome Back, Anurag</h1>
              <span className="text-2xl">👋</span>
            </div>
            <p className="mt-1 text-gray-500">Here&apos;s what&apos;s happening with your team,</p>
            
            <h2 className="mt-8 text-xl font-semibold">Overview</h2>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Allotted Papers</div>
                <div className="mt-2 text-3xl font-semibold">40</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">In Review</div>
                <div className="mt-2 text-3xl font-semibold">16</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Next Milestone</div>
                <div className="mt-2 text-3xl font-semibold">09</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Pending Messages</div>
                <div className="mt-2 text-3xl font-semibold">20</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Badge 
                variant="secondary" 
                className="bg-[#EEF2FF] px-3 py-1.5 text-[#444CE7] hover:bg-[#EEF2FF] cursor-pointer"
              >
                All time
                <button className="ml-2 text-gray-400 hover:text-gray-600">×</button>
              </Badge>
              <Badge 
                variant="secondary"
                className="bg-[#EEF2FF] px-3 py-1.5 text-[#444CE7] hover:bg-[#EEF2FF] cursor-pointer"
              >
                Amravati
                <button className="ml-2 text-gray-400 hover:text-gray-600">×</button>
              </Badge>
              <button className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                <span>More filters</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

