"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { isTokenExpired, getAccessToken } from "../utils/Auth";
import type { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => getAccessToken(state));
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    console.log(
      "ProtectedRoute: isAuthenticated =",
      isAuthenticated,
      "accessToken =",
      accessToken
    );
    if (!isAuthenticated || !accessToken || isTokenExpired(accessToken)) {
      console.log("ProtectedRoute: Redirecting to login");
      toast.error("Your session has expired. Please log in again to continue.");
      router.push("/");
    }
  }, [isAuthenticated, accessToken, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
