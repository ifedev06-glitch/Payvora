"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { signupUser } from "@/lib/api"

export default function FreelancerSignup() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    email: "",
    gender: "",
    phoneNumber: "",
    country: "Nigeria",
    password: "",
    confirmPassword: "",
    userName: "",
    role: "FREELANCER"
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.firstName || !formData.surname || !formData.email || 
        !formData.phoneNumber || !formData.password || 
        !formData.userName || !formData.gender) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...registerData } = formData
      
      await signupUser(registerData)
      
      // Show success modal
      setShowSuccess(true)
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
      
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.response?.data?.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4">
      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <Card className="w-full max-w-sm border-border/50 shadow-2xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Account Created Successfully!</h3>
              <p className="text-muted-foreground">
                Redirecting you to the login page...
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Sign up as Freelancer</CardTitle>
            <CardDescription>Create your account and start receiving payments</CardDescription>
          </CardHeader>

          <CardContent>
            {error ? (
              <Alert className="mb-6 bg-destructive/10 border-destructive/30">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-medium mb-2">
                    Surname
                  </label>
                  <Input
                    id="surname"
                    name="surname"
                    placeholder="Doe"
                    value={formData.surname}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="middleName" className="block text-sm font-medium mb-2">
                  Middle Name
                </label>
                <Input
                  id="middleName"
                  name="middleName"
                  placeholder="Enter middle name"
                  value={formData.middleName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label htmlFor="userName" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  id="userName"
                  name="userName"
                  placeholder="your_username"
                  value={formData.userName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full mt-6" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}