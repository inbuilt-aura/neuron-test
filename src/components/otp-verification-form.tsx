'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OTPVerificationForm() {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(60)
  const router = useRouter()

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => setTimer(timer - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Verify OTP
    console.log('Verifying OTP', otp)
    // Redirect to dashboard or show errorFFFFF
    // router.push('/client/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <Button type="submit" className="w-full" disabled={timer === 0}>
              Submit
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Resend OTP in: {timer < 10 ? `0${timer}` : timer} seconds
            </p>
            <Button
              variant="link"
              className="mt-2 text-blue-600"
              onClick={() => router.push('/client/login')}
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

