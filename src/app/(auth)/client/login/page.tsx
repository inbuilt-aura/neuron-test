"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "./countries";
import { useLoginClientInitiateMutation } from "../../../../store/apiSlice";
import { useDispatch } from "react-redux";
import { setLoginType, setClientLoginInfo } from "../../../../store/authSlice";
import toast from "react-hot-toast";
import PublicRoute from "../../../../components/PublicRoute";

const LoginPage: React.FC = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const [loginClientInitiate, { isLoading }] = useLoginClientInitiateMutation();

  const validateMobileNumber = (number: string, countryCode: string) => {
    const phoneRegex = /^\d+$/;
    if (countryCode === "+91") {
      return /^[6-9]\d{9}$/.test(number);
    }
    return phoneRegex.test(number) && number.length >= 7 && number.length <= 15;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateMobileNumber(mobileNumber, selectedCountry.code)) {
      try {
        await loginClientInitiate({
          mobileNumber,
          countryCode: selectedCountry.code.replace("+", ""),
        }).unwrap();
        dispatch(setLoginType("client"));
        dispatch(
          setClientLoginInfo({
            countryCode: selectedCountry.code.replace("+", ""),
            mobileNumber,
          })
        );
        toast.success("Login initiated successfully!");
        router.push("/client/verify");
      } catch (err) {
        console.error("Login initiation failed:", err);
        if (err instanceof Error) {
          const errorMessage = `Failed to initiate login: ${err.message}`;
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          const errorMessage = "Failed to initiate login. Please try again.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } else {
      const errorMessage = `Please enter a valid mobile number for ${selectedCountry.flag} ${selectedCountry.code}`;
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

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
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="mobileNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      Mobile No. <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <Select
                        onValueChange={(value) => {
                          const country = countries.find(
                            (c) => c.value === value
                          );
                          if (country) {
                            setSelectedCountry(country);
                            setMobileNumber("");
                            setError("");
                          }
                        }}
                        defaultValue={selectedCountry.value}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue
                            placeholder={`${selectedCountry.flag} ${selectedCountry.code}`}
                          />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          className="max-h-[300px] overflow-y-auto"
                        >
                          {countries.map((country) => (
                            <SelectItem
                              key={country.value}
                              value={country.value}
                            >
                              {country.flag} {country.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="00000 00000"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value);
                          setError("");
                        }}
                        className="flex-1 ml-2"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0B4776] hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Next"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default LoginPage;
