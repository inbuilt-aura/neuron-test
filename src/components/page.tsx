'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const OTPInput = ({ length, onChange }: { length: number; onChange: (otp: string) => void }) => {
  const [otp, setOtp] = useState(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    onChange(newOtp.join(''))

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex justify-between gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-10 h-10 text-center text-2xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
  )
}

export default function VerifyPage() {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval)
          setIsResendDisabled(false)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleResend = () => {
    setTimer(60)
    setIsResendDisabled(true)
    // Add logic to resend OTP
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add logic to verify OTP
    console.log('Submitted OTP:', otp)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
       <div className="absolute top-4 left-4">
        <Image src="/logo.png" alt="Neuron Logo" width={100} height={33} />
      </div>
      <div className="w-full max-w-md">
        {/* <Image src="/neuron-logo.png" alt="Neuron Logo" width={150} height={50} className="mb-8 mx-auto" /> */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-left">Log In as Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium text-black">
                  One-Time Password
                 </label>
                <OTPInput length={6} onChange={setOtp} />
                <p className="text-sm text-gray-500 mt-2">
                  Please enter the one-time password sent to your phone.
                </p>
              </div>
              <Button type="submit" className="w-full bg-[#0B4776] hover:bg-blue-700" disabled={otp.length !== 6}>
                Submit
              </Button>
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  className="text-sm text-blue-600"
                >
                  Resend {timer > 0 && `(${timer}s)`}
                </Button>
              </div>
              <div className="text-center">
                <Link href="/client/login" className="text-sm text-blue-600 hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

