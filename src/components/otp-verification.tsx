'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OTPVerification() {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(60)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Verify OTP
    console.log('Verifying OTP', otp)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Log In as Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="otp">One-Time Password</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={timer === 0}>Submit</Button>
        </form>
        <div className="text-center">
          <p>Resend, if you didn&apos;t receive code in 00:{timer < 10 ? `0${timer}` : timer}</p>
          <a href="#" className="text-blue-600">Back to Sign In</a>
        </div>
      </div>
    </div>
  )
}

