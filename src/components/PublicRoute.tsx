"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "../store/store"

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const isAuthenticated = useSelector((state: RootState) => {
    console.log("Auth state:", state.auth)
    return state.auth.isAuthenticated
  })
  const userType = useSelector((state: RootState) => state.auth.loginType)

  useEffect(() => {
    setIsClient(true)
    console.log("PublicRoute mounted, isAuthenticated:", isAuthenticated, "userType:", userType)
  }, [isAuthenticated, userType])

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting...")
      if (userType === "client") {
        router.push("/client/project")
      } else if (userType === "employee") {
        router.push("/sale/leads")
      }
    }
  }, [isAuthenticated, userType, router])

  if (!isClient) {
    return null
  }

  console.log("PublicRoute rendering, children:", children)

  return <>{children}</>
}

export default PublicRoute

