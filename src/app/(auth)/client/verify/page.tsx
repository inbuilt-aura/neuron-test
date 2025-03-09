"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLoginClientConfirmMutation } from "../../../../store/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../../../store/authSlice";
import type { RootState } from "../../../../store/store";
import PublicRoute from "../../../../components/PublicRoute";

const VerifyPage: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifyDisabled, setIsVerifyDisabled] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [loginClientConfirm, { isLoading }] = useLoginClientConfirmMutation();

  const { countryCode, mobileNumber } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!countryCode || !mobileNumber) {
      router.push("/client/login");
    }
  }, [countryCode, mobileNumber, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
      setIsVerifyDisabled(true);
    }
    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  const handleChange = (
    element: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value && !/^\d+$/.test(value)) return;

    setOtp([...otp.map((d, idx) => (idx === element ? value : d))]);

    if (value && element < 5) {
      const nextElement = document.querySelector<HTMLInputElement>(
        `input[name=otp-${element + 1}]`
      );
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleKeyDown = (
    element: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otp[element] && element > 0) {
      const prevElement = document.querySelector<HTMLInputElement>(
        `input[name=otp-${element - 1}]`
      );
      if (prevElement) {
        prevElement.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6 && countryCode && mobileNumber) {
      try {
        const result = await loginClientConfirm({
          countryCode,
          mobileNumber,
          token: enteredOtp,
        }).unwrap();
        dispatch(
          setCredentials({
            user: result.user,
            token: result.token,
            loginType: "client",
          })
        );
        router.push("/client/project");
      } catch (err) {
        console.error("Verification failed:", err);
        if (err instanceof Error) {
          setError(`Verification failed: ${err.message}`);
        } else {
          setError("Invalid OTP. Please try again.");
        }
      }
    } else {
      setError("Please enter a valid 6-digit OTP.");
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setTimer(60);
    setIsResendDisabled(true);
    setIsVerifyDisabled(false);
    // Add resend OTP logic here
    console.log("Resending OTP...");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!countryCode || !mobileNumber) {
    return null; // or a loading spinner
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-200 relative">
        <div className="absolute top-4 left-4">
          <Image src="/logo.png" alt="Neuron Logo" width={100} height={33} />
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold text-left">
                  Log In as Client
                </CardTitle>
                <CardDescription>
                  Please enter the one-time password sent to your phone
                </CardDescription>
                <h2 className="text-black font-normal text-base">
                  Don&apos;t have an account yet?{" "}
                  <span className="font-semibold underline uppercase">
                    {" "}
                    join us today
                  </span>
                </h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      One-Time Password <span className="text-red-500">*</span>
                    </div>
                    <div className="flex justify-between gap-1">
                      {otp.map((data, index) => (
                        <Input
                          key={index}
                          type="text"
                          name={`otp-${index}`}
                          className="w-12 h-12 text-center text-xl"
                          maxLength={1}
                          value={data}
                          onChange={(e) => handleChange(index, e)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onFocus={(e) => e.target.select()}
                          disabled={isVerifyDisabled || isLoading}
                        />
                      ))}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0B4776] hover:bg-blue-700"
                    disabled={isVerifyDisabled || isLoading}
                  >
                    {isLoading ? "Verifying..." : "Submit"}
                  </Button>
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-600">
                      {isResendDisabled ? (
                        <span>Resend code in {formatTime(timer)}</span>
                      ) : (
                        <Button
                          variant="link"
                          className="text-[#0B4776] p-0 h-auto font-normal"
                          onClick={handleResend}
                        >
                          Resend
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="link"
                      className="text-[#0B4776] p-0 h-auto"
                      onClick={() => router.push("/client/login")}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default VerifyPage;
