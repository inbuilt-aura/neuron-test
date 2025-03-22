"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const navigation = [
  {
    name: "My Project",
    href: "/sales/leads",
    icon: "/lead.svg",
  },
  {
    name: "Peer Review",
    href: "/sales/project",
    icon: "/project.svg",
  },
  {
    name: "Communication",
    href: "/sales/communication",
    icon: "/chat.svg",
  },
  {
    name: "Payment",
    href: "/sales/payment",
    icon: "/rupee.svg",
  },
  {
    name: "Help Center",
    href: "/sales/security",
    icon: "/security.svg",
  },
] as const;

export function ResearcherSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[240px] bg-[#F8FAFC] min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center ml-8">
          <Image
            src="/logo.png"
            alt="Neuron Logo"
            width={120}
            height={40}
            priority
          />
        </Link>
      </div>

      <nav className="px-3 flex-grow mt-8">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          const isBeforeSecurity = index === navigation.length - 2

          return (
            <div key={item.name}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 mb-1 h-12",
                    isActive ? "bg-white font-semibold text-base text-[#0B4776]" : "text-[#716F6F] hover:text-gray-900"
                  )}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.name} icon`}
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  {item.name}
                </Button>
              </Link>
              {isBeforeSecurity && (
                <Separator className="my-4 mx-2" />
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-3 mt-auto pb-8">
        <div className="flex items-center gap-3 rounded-md bg-white p-3 border border-[#E6E4F0]">
        <Avatar className="h-10 w-10 rounded-md overflow-hidden">
          <AvatarImage src="/avatar.png" alt="Anurag Sharma" className="rounded-md"/>
          <AvatarFallback className="rounded-md">AS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#53515B]">
              Anurag Sharma
            </span>
            <span className="text-xs text-[#A0A0A3]">
              Sales and Support Team
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

