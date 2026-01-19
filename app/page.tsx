"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "@/lib/api"
import { saveToken } from "@/lib/auth"
import { AlertCircle, CheckCircle2, Shield, Zap, Globe } from "lucide-react"

export default function Home() {
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
      setError("Email and password required")
      return
    }

    setIsLoading(true)

    try {
      const response = await loginUser(formData)

      if (response.success && response.token) {
        saveToken(response.token)
        
        // Decode JWT to get email
        const payload = JSON.parse(atob(response.token.split('.')[1]))
        const userEmail = payload.sub
        
        localStorage.setItem("userEmail", userEmail)
        localStorage.setItem("isLoggedIn", "true")
        
        // Redirect to dashboard (no separate roles anymore)
        router.push("/dashboard/client")
      } else {
        setError(response.message || "Invalid credentials")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-120px)]">
          
          {/* Left Side - Brand & Benefits */}
          <div className="space-y-8 lg:space-y-12">
            {/* Brand */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide">PAYVORA</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-center lg:text-left">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Payments Made Simple With One Link
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                Secure payment platform for freelancers and clients. Pay globally, withdraw locally.
              </p>
            </div>

            {/* Features - Desktop Only */}
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Instant</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Real-time transfers</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Secure</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Bank-grade encryption</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Global</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">USD to NGN instantly</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="hidden lg:flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>KYC Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/50">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Sign in to continue
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <Alert className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-300 ml-2">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label 
                      htmlFor="email" 
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
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
                      className="h-11 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label 
                      htmlFor="password" 
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
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
                      className="h-11 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{" "}
                    <Link 
                      href="/auth/signup-client" 
                      className="font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Features - Under Login Card */}
        <div className="lg:hidden grid grid-cols-3 gap-4 mt-8">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Instant</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Real-time transfers</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Secure</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Bank-grade encryption</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Global</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">USD to NGN instantly</p>
          </div>
        </div>

        {/* Mobile Trust Indicators */}
        <div className="flex lg:hidden items-center justify-center gap-6 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>KYC Verified</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Hidden Fees</span>
          </div>
        </div>
      </div>
    </div>
  )
}