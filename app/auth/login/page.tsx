"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { loginUser } from "@/lib/api"
import { saveToken } from "@/lib/auth"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please enter email and password")
      return
    }

    setIsLoading(true)

    try {
      const response = await loginUser(formData)

      if (response.token) {
        // Save token to localStorage
        saveToken(response.token)
        
        // Decode JWT to get email from token payload
        const payload = JSON.parse(atob(response.token.split('.')[1]))
        const userEmail = payload.sub // 'sub' contains the email
        
        // Store user info
        localStorage.setItem("userEmail", userEmail)
        localStorage.setItem("isLoggedIn", "true")
        
        // Redirect to dashboard (adjust route based on your actual routing structure)
        router.push("/dashboard")
      } else {
        setError(response.message || "Login failed. No token received.")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your Payvora account</CardDescription>
          </CardHeader>

          <CardContent>
            {error ? (
              <Alert className="mb-6 bg-destructive/10 border-destructive/30">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/auth/signup-client" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}