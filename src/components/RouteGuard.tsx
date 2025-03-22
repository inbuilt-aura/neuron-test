"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import type { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import { isTokenExpired, getAccessToken } from "../utils/Auth";

const publicPaths = [
  "/client/login",
  "/employee/login",
  "/client/verify",
  "/",
  "/admin/login",
];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [authorized, setAuthorized] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const loginType = useSelector((state: RootState) => state.auth.loginType);
  const user = useSelector((state: RootState) => state.auth.user); 
  const accessToken = useSelector((state: RootState) => getAccessToken(state));

  const authCheck = useCallback(
    (url: string) => {
      console.log("AuthCheck called for URL:", url);
      const path = url.split("?")[0];
      if (publicPaths.includes(path)) {
        console.log("Public path detected, authorizing");
        setAuthorized(true);
        return;
      }

      if (isAuthenticated && accessToken && !isTokenExpired(accessToken)) {
        console.log("User is authenticated and token is valid");
        if (loginType === "client" && !path.startsWith("/client")) {
          console.log("Redirecting client to /client/project");
          router.push("/client/project");
        } else if (loginType === "employee") {
          if (user?.designation === "MANAGER" && !path.startsWith("/manager")) {
            console.log("Redirecting manager to /manager/projects");
            router.push("/manager/projects");
          } else if (
            user?.designation !== "MANAGER" &&
            !path.startsWith("/sales")
          ) {
            console.log("Redirecting other employees to /sales/leads");
            router.push("/sales/leads");
          } else {
            console.log("User is on correct path, authorizing");
            setAuthorized(true);
          }
        } else {
          console.log("User is on correct path, authorizing");
          setAuthorized(true);
        }
      } else {
        console.log("User is not authenticated or token is invalid");
        dispatch(logout());
        setAuthorized(false);
        toast.error(
          "Your session has expired. Please log in again to continue."
        );
        router.push("/");
      }
    },
    [isAuthenticated, loginType, user, router, accessToken, dispatch]
  );

  useEffect(() => {
    console.log("RouteGuard effect triggered, pathname:", pathname);
    authCheck(pathname);

   
    const intervalId = setInterval(() => authCheck(pathname), 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [pathname, authCheck]);

  console.log("RouteGuard rendering, authorized:", authorized);

  return authorized ? <>{children}</> : null;
}

export default RouteGuard;
