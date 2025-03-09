"use client";

import type React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ProtectedRoute from "../components/ProtectedRoute";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const LoginPage: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    console.log("LoginPage rendering, isAuthenticated:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <ProtectedRoute>
      <div>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Choose your role to log in</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link href="/admin/login" passHref legacyBehavior>
                <Button className="w-full" asChild>
                  <a>Admin Login</a>
                </Button>
              </Link>
              <Link href="/employee/login" passHref legacyBehavior>
                <Button className="w-full" asChild>
                  <a>Employee Login</a>
                </Button>
              </Link>
              <Link href="/client/login" passHref legacyBehavior>
                <Button className="w-full" asChild>
                  <a>Client Login</a>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LoginPage;
