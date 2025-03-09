"use client"

import { type FC, useState } from "react"
import { BellRing, HelpCircle, LogOut } from "lucide-react"
import { Gear } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/src/store/authSlice"
import type { RootState } from "@/src/store/store"
import { toast } from "react-hot-toast"

interface HeaderProps {
  title?: string
  subtitle?: string
  extraContent?: React.ReactNode
  className?: string
}

const Header: FC<HeaderProps> = ({ title, subtitle, extraContent, className = "" }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const handleLogout = () => {
    dispatch(logout())
    setShowDropdown(false)
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <header className={`p-4 bg-white rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="hidden md:block">
          {" "}
          {/* Hide title section on mobile */}
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="p-2 bg-gray-100 shadow hidden md:inline-flex">
            <BellRing className="h-5 w-5 text-gray-700" />
          </Button>
          <Button variant="ghost" className="p-2 bg-gray-100 shadow hidden md:inline-flex">
            <HelpCircle className="h-5 w-5 text-gray-700" />
          </Button>

          {isAuthenticated && (
            <div className="relative">
              <Button variant="ghost" className="p-2 bg-gray-100 shadow" onClick={() => setShowDropdown(!showDropdown)}>
                <Gear size={20} />
              </Button>
              {showDropdown && (
                <Card className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                  <Button
                    variant="ghost"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {extraContent && <div className="hidden md:flex justify-between items-center">{extraContent}</div>}
    </header>
  )
}

export default Header

