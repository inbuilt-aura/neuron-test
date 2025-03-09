"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLoginEmployeeMutation } from "../store/apiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import {
  setProfile,
  setProfileLoading,
  setProfileError,
} from "../store/sales/profileSlice";
import { toast } from "react-hot-toast";

export default function EmployeeLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [loginEmployee, { isLoading }] = useLoginEmployeeMutation();

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    if (remembered) {
      const { email } = JSON.parse(remembered);
      setEmail(email);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setProfileLoading());

    try {
      const result = await loginEmployee({ email, password }).unwrap();
      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
          loginType: "employee",
        })
      );
      dispatch(setProfile(result.user));

      if (rememberMe) {
        localStorage.setItem("rememberMe", JSON.stringify({ email }));
      } else {
        localStorage.removeItem("rememberMe");
      }

      toast.success("Login successful!");

      // Redirect based on designation
      switch (result.user.designation) {
        case "MANAGER":
          router.push("/manager/dashboard");
          break;
        case "SALES":
          router.push("/sale/leads");
          break;
        case "RESEARCHER":
          router.push("/researcher/dashboard");
          break;
        default:
          router.push("/employee/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage = "Invalid email or password. Please try again.";
      dispatch(setProfileError(errorMessage));
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-200 relative">
      <div className="absolute top-4 left-4">
        <Image
          src="/logo.png"
          alt="Neuron Logo"
          width={100}
          height={33}
          priority
        />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-left">
                Log In as Employee
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
              <h2 className="text-black font-normal text-base">
                Don&apos;t have an account yet?{" "}
                <span className="font-semibold underline uppercase cursor-pointer">
                  {" "}
                  join us today
                </span>
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. example@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <Label htmlFor="remember" className="text-[#475467]">
                      Remember me
                    </Label>
                  </div>
                  <a
                    href="#"
                    className="text-base font-semibold text-black hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#0B4776] hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
