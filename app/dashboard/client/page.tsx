"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DashboardNav from "@/components/dashboard-nav"
import TransactionTable from "@/components/transaction-table"
import { ArrowDownUp, FileText, Loader2, X } from "lucide-react"
import { getProfile, createPaymentLink, convertUsdToNgn, getExchangeRate, type UserProfileResponse } from "@/lib/api"

export default function ClientDashboard() {
  const router = useRouter()
  
  // User profile from backend
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Exchange rate from backend
  const [exchangeRate, setExchangeRate] = useState<number>(1650) // Default fallback
  const [isLoadingRate, setIsLoadingRate] = useState(true)

  // UI States
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentLink, setPaymentLink] = useState("")
  const [convertAmount, setConvertAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")

  // Mock transactions
  const [transactions] = useState([
    { id: 1, type: "payment", freelancer: "john_dev", amount: 150, status: "completed", date: "2025-01-02" },
    { id: 2, type: "payment", freelancer: "sarah_design", amount: 300, status: "completed", date: "2025-01-01" },
    { id: 3, type: "deposit", amount: 1000, freelancer: "sarah_design", status: "completed", date: "2024-12-28" },
  ])

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setMessage("Failed to load profile. Please try again.")
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [])

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rate = await getExchangeRate()
        setExchangeRate(rate)
      } catch (error) {
        console.error("Error fetching exchange rate:", error)
        // Keep using fallback rate (1650)
      } finally {
        setIsLoadingRate(false)
      }
    }

    fetchExchangeRate()
  }, [])

  // Handle Create Payment - Generate Payment Link (REAL API CALL)
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setMessage("Please enter a valid amount")
      return
    }

    setIsProcessing(true)
    setMessage("Generating payment link...")

    try {
      // Call real API
      const response = await createPaymentLink({
        amount: parseFloat(paymentAmount)
      })

      // Set the payment link from backend response
      setPaymentLink(response.paymentUrl)
      setShowPaymentModal(false)
      setShowPaymentLinkModal(true)
      setMessage("")
    } catch (error: any) {
      console.error("Error creating payment link:", error)
      setMessage(error.response?.data?.message || "Failed to create payment link. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Copy Payment Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink)
    setMessage("Payment link copied to clipboard!")
    setTimeout(() => setMessage(""), 2000)
  }

  // Handle Currency Conversion (REAL API CALL)
  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      setMessage("Please enter a valid amount")
      return
    }

    setIsProcessing(true)
    setMessage("Converting currency...")

    try {
      // Call real API
      const response = await convertUsdToNgn(parseFloat(convertAmount))

      // Update user profile with new balances
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          usdBalance: response.usdWalletBalance,
          ngnBalance: response.ngnWalletBalance
        })
      }

      setMessage(
        `Converted successfully! You received ₦${response.ngnReceived.toLocaleString('en-NG', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`
      )
      setConvertAmount("")

      setTimeout(() => {
        setShowConvertModal(false)
        setMessage("")
      }, 2500)
    } catch (error: any) {
      console.error("Error converting currency:", error)
      setMessage(error.response?.data?.message || "Failed to convert currency. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading state
  if (isLoadingProfile || isLoadingRate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userType="client" userEmail={userProfile?.email || ""} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome {userProfile?.firstName} {userProfile?.surname}
          </h1>
          <p className="text-muted-foreground">Manage your payments and wallets</p>
        </div>

        {/* Global Message Alert */}
        {message && !showPaymentModal && !showPaymentLinkModal && !showConvertModal && (
          <Alert className="mb-6 bg-accent/10 border-accent/30 text-accent">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Dual Wallet Cards */}
        <div className="mb-8">
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div className="overflow-x-auto pb-4 -mx-4 px-4 mb-4">
              <div className="flex gap-4 min-w-max">
                {/* USD Wallet */}
                <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg w-[280px] flex-shrink-0 rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-lg">💰</span>
                      </div>
                      <CardTitle className="text-sm font-medium">USD Wallet</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-3">
                    <div className="text-2xl font-bold">
                      ${userProfile?.usdBalance.toFixed(2) || "0.00"}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2 w-full h-8 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Create Payment
                    </Button>
                  </CardContent>
                </Card>

                {/* NGN Wallet */}
                <Card className="bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/70 text-primary-foreground shadow-lg w-[280px] flex-shrink-0 rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-lg">💰</span>
                      </div>
                      <CardTitle className="text-sm font-medium">NGN Wallet</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-3">
                    <div className="text-2xl font-bold">
                      ₦{userProfile?.ngnBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </div>
                    <Link href="/dashboard/withdrawal">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 w-full h-8 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Withdraw
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile Conversion Card */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Convert to Naira</CardTitle>
                <CardDescription className="text-xs">Exchange USD to NGN</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConvert} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount (USD)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="h-10"
                      step="0.01"
                      disabled={isProcessing}
                    />
                    {convertAmount && parseFloat(convertAmount) > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ≈ ₦{(parseFloat(convertAmount) * exchangeRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="bg-muted/50 p-2.5 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Exchange Rate</p>
                    <p className="text-sm font-semibold">1 USD = ₦{exchangeRate.toLocaleString()}</p>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full gap-2 h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownUp className="w-4 h-4" />
                        Convert to NGN
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* USD Wallet */}
            <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">💰</span>
                  </div>
                  <CardTitle className="text-lg">USD Wallet</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">
                  ${userProfile?.usdBalance.toFixed(2) || "0.00"}
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="gap-2 min-w-[180px] h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <FileText className="w-5 h-5" />
                    Create Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* NGN Wallet */}
            <Card className="bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/70 text-primary-foreground shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">💰</span>
                  </div>
                  <CardTitle className="text-lg">NGN Wallet</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">
                  ₦{userProfile?.ngnBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </div>
                <div className="flex gap-4">
                  <Link href="/dashboard/withdrawal">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="gap-2 flex-1 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Withdraw
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Desktop Conversion Section */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Convert Currency</CardTitle>
              <CardDescription>Exchange USD to NGN</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConvert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="bg-input border-border h-11"
                    step="0.01"
                    disabled={isProcessing}
                  />
                  {convertAmount && parseFloat(convertAmount) > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ≈ ₦{(parseFloat(convertAmount) * exchangeRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowDownUp className="w-5 h-5" />
                      Convert to NGN
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exchange Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Rate</p>
                <p className="text-2xl font-bold">₦{exchangeRate.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">per USD</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-xl font-bold">
                  ${((userProfile?.usdBalance || 0) + ((userProfile?.ngnBalance || 0) / exchangeRate)).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">USD Equivalent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={transactions} userType="client" />
          </CardContent>
        </Card>
      </main>

      {/* CREATE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <Card className="w-full max-w-sm bg-background border rounded-xl shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-8 w-8"
                onClick={() => {
                  setShowPaymentModal(false)
                  setMessage("")
                  setPaymentAmount("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle>Create Payment</CardTitle>
              <CardDescription>Generate a payment request</CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className="mb-4 bg-accent/10 border-accent/30 text-accent">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleCreatePayment} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="h-11"
                    disabled={isProcessing}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 pt-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Generate Payment Link
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => {
                      setShowPaymentModal(false)
                      setMessage("")
                      setPaymentAmount("")
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PAYMENT LINK MODAL */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <Card className="w-full max-w-md bg-background border rounded-xl shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-8 w-8"
                onClick={() => {
                  setShowPaymentLinkModal(false)
                  setPaymentAmount("")
                  setPaymentLink("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle>Payment Link Generated!</CardTitle>
              <CardDescription>Share this link to receive payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {message && (
                <Alert className="bg-green-500/10 border-green-500/30 text-green-600">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Payment Amount</p>
                <p className="text-2xl font-bold">${parseFloat(paymentAmount).toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Link</label>
                <div className="flex gap-2">
                  <Input
                    value={paymentLink}
                    readOnly
                    className="h-11 font-mono text-sm"
                  />
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 px-4"
                    onClick={handleCopyLink}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => {
                    setShowPaymentLinkModal(false)
                    setPaymentAmount("")
                    setPaymentLink("")
                  }}
                >
                  Close
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Share this link with the payer to complete the transaction
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONVERT CURRENCY MODAL (MOBILE) */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <Card className="w-full max-w-sm bg-background border rounded-xl shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-8 w-8"
                onClick={() => {
                  setShowConvertModal(false)
                  setMessage("")
                  setConvertAmount("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle>Convert to Naira</CardTitle>
              <CardDescription>
                Convert USD to NGN
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className="mb-4 bg-accent/10 border-accent/30 text-accent">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleConvert} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="h-11"
                    disabled={isProcessing}
                    step="0.01"
                  />
                  {convertAmount && parseFloat(convertAmount) > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll receive approximately:{" "}
                      <span className="font-semibold">
                        ₦{(parseFloat(convertAmount) * exchangeRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Exchange Rate</p>
                  <p className="text-sm font-semibold">1 USD = ₦{exchangeRate.toLocaleString()}</p>
                </div>

                <div className="flex flex-col gap-3 pt-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownUp className="w-5 h-5" />
                        Convert to NGN
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => {
                      setShowConvertModal(false)
                      setMessage("")
                      setConvertAmount("")
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}