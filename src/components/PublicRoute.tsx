"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const loginType = useSelector((state: RootState) => state.auth.loginType);
  const user = useSelector((state: RootState) => state.auth.user); // Assuming user object contains designation

  useEffect(() => {
    setIsClient(true);
    console.log(
      "PublicRoute mounted, isAuthenticated:",
      isAuthenticated,
      "loginType:",
      loginType,
      "user:",
      user
    );
  }, [isAuthenticated, loginType, user]);

  useEffect(() => {
    if (isAuthenticated && isClient) {
      console.log("User is authenticated, redirecting...");
      if (loginType === "client") {
        router.push("/client/project");
      } else if (loginType === "employee") {
        if (user?.designation === "MANAGER") {
          router.push("/manager/projects");
        } else {
          router.push("/sales/leads");
        }
      }
    }
  }, [isAuthenticated, loginType, user, router, isClient]);

  if (!isClient) {
    return null;
  }

  console.log("PublicRoute rendering, children:", children);

  return <>{children}</>;
};

export default PublicRoute;
