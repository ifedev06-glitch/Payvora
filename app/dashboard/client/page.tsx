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
import { ArrowDownUp, FileText, Loader2, X, Clock, Wallet } from "lucide-react"
import { 
  getProfile, 
  createPaymentLink, 
  convertUsdToNgn, 
  getExchangeRate,
  getAllTransactions,
  type UserProfileResponse,
  type TransactionResponse 
} from "@/lib/api"

// Transaction Table Component
function TransactionTable({ transactions }: { transactions: TransactionResponse[] }) {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      PROCESSING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.PENDING}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeStyles = {
      DEPOSIT: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      WITHDRAWAL: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      CONVERSION: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      TRANSFER_SENT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      TRANSFER_RECEIVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      REFUND: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      FEE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    }
    
    const typeLabels: Record<string, string> = {
      TRANSFER_SENT: "Sent",
      TRANSFER_RECEIVED: "Received",
      DEPOSIT: "Deposit",
      WITHDRAWAL: "Withdrawal",
      CONVERSION: "Conversion",
      REFUND: "Refund",
      FEE: "Fee",
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles[type as keyof typeof typeStyles] || typeStyles.DEPOSIT}`}>
        {typeLabels[type] || type}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${amount.toFixed(2)}`
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Type</th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">
                {getTypeBadge(transaction.type)}
              </td>
              <td className="py-3 px-4 font-semibold">
                {formatAmount(transaction.amount, transaction.currency)}
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(transaction.status)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {formatDate(transaction.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ClientDashboard() {
  const router = useRouter()
  
  // User profile from backend
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Exchange rate from backend
  const [exchangeRate, setExchangeRate] = useState<number>(1650)
  const [isLoadingRate, setIsLoadingRate] = useState(true)

  // Transactions from backend
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)

  // UI States
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentLink, setPaymentLink] = useState("")
  const [convertAmount, setConvertAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [isNavigatingWithdraw, setIsNavigatingWithdraw] = useState(false)

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
      } finally {
        setIsLoadingRate(false)
      }
    }

    fetchExchangeRate()
  }, [])

  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const allTransactions = await getAllTransactions()
        setTransactions(allTransactions.slice(0, 4))
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [])

  // Calculate conversion preview with fee
  const calculateConversionPreview = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return null
    
    const usdAmount = parseFloat(amount)
    const conversionFee = usdAmount * 0.01
    const amountAfterFee = usdAmount - conversionFee
    const ngnAmount = amountAfterFee * exchangeRate
    
    return {
      usdAmount,
      conversionFee,
      amountAfterFee,
      ngnAmount
    }
  }

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
      const response = await createPaymentLink({
        amount: parseFloat(paymentAmount)
      })

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
      const response = await convertUsdToNgn(parseFloat(convertAmount))

      if (userProfile) {
        setUserProfile({
          ...userProfile,
          usdBalance: response.usdWalletBalance,
          ngnBalance: response.ngnWalletBalance
        })
      }

      setMessage(
        `Converted successfully! Fee: $${response.conversionFee.toFixed(2)} (1%). You received ₦${response.ngnReceived.toLocaleString('en-NG', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`
      )
      setConvertAmount("")

      // Refresh transactions after conversion
      const allTransactions = await getAllTransactions()
      setTransactions(allTransactions.slice(0, 4))

      setTimeout(() => {
        setShowConvertModal(false)
        setMessage("")
      }, 3500)
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

  const conversionPreview = calculateConversionPreview(convertAmount)

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

        {/* Compact Wallet Cards - Horizontal Scroll on Mobile */}
        <div className="mb-8">
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-3 min-w-max">
              {/* USD Wallet Card - Compact & Wide */}
              <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg w-[320px] flex-shrink-0 rounded-2xl">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Wallet className="w-3.5 h-3.5 opacity-80" />
                    <p className="text-xs font-medium opacity-90">USD Wallet</p>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    ${userProfile?.usdBalance.toFixed(2) || "0.00"}
                  </div>
                  
                  {/* Processing Balance - Compact */}
                  {userProfile?.usdProcessingBalance && userProfile.usdProcessingBalance > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] opacity-90">Processing</span>
                      </div>
                      <span className="text-xs font-semibold">${userProfile.usdProcessingBalance.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    className="w-full gap-1.5 h-8 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                    onClick={() => {
                      setIsCreatingPayment(true)
                      setShowPaymentModal(true)
                      setTimeout(() => setIsCreatingPayment(false), 300)
                    }}
                    disabled={isCreatingPayment}
                  >
                    {isCreatingPayment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        Create Payment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* NGN Wallet Card - Compact & Wide */}
              <Card className="bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/70 text-primary-foreground shadow-lg w-[320px] flex-shrink-0 rounded-2xl">
                <CardContent className="pt-4 pb-4 flex flex-col h-full">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Wallet className="w-3.5 h-3.5 opacity-80" />
                    <p className="text-xs font-medium opacity-90">NGN Wallet</p>
                  </div>
                  <div className="text-2xl font-bold mb-auto">
                    ₦{userProfile?.ngnBalance.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 mt-3"
                    onClick={() => {
                      setIsNavigatingWithdraw(true)
                      router.push('/dashboard/withdrawal')
                    }}
                    disabled={isNavigatingWithdraw}
                  >
                    {isNavigatingWithdraw ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Loading...
                      </>
                    ) : (
                      'Withdraw'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-5">
            {/* USD Wallet Card - Compact Desktop */}
            <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg rounded-2xl">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 opacity-80" />
                  <p className="text-sm font-medium opacity-90">USD Wallet</p>
                </div>
                <div className="text-3xl font-bold mb-1">
                  ${userProfile?.usdBalance.toFixed(2) || "0.00"}
                </div>
                
                {/* Processing Balance - Compact Desktop */}
                {userProfile?.usdProcessingBalance && userProfile.usdProcessingBalance > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs opacity-90">Processing (48hr)</span>
                    </div>
                    <span className="text-sm font-semibold">${userProfile.usdProcessingBalance.toFixed(2)}</span>
                  </div>
                )}
                
                <Button
                  size="sm"
                  className="w-full gap-2 h-9 text-sm font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                  onClick={() => {
                    setIsCreatingPayment(true)
                    setShowPaymentModal(true)
                    setTimeout(() => setIsCreatingPayment(false), 300)
                  }}
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Create Payment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* NGN Wallet Card - Compact Desktop */}
            <Card className="bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/70 text-primary-foreground shadow-lg rounded-2xl">
              <CardContent className="pt-5 pb-5 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 opacity-80" />
                  <p className="text-sm font-medium opacity-90">NGN Wallet</p>
                </div>
                <div className="text-3xl font-bold mb-auto">
                  ₦{userProfile?.ngnBalance.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}
                </div>
                <Button
                  size="sm"
                  className="w-full h-9 text-sm font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 mt-4"
                  onClick={() => {
                    setIsNavigatingWithdraw(true)
                    router.push('/dashboard/withdrawal')
                  }}
                  disabled={isNavigatingWithdraw}
                >
                  {isNavigatingWithdraw ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conversion Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Convert Currency</CardTitle>
              <CardDescription>Exchange USD to NGN (1% conversion fee) - Only available balance can be converted</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConvert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount (USD) - Available: ${userProfile?.usdBalance.toFixed(2) || "0.00"}
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
                  {conversionPreview && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount to convert</span>
                        <span className="font-semibold">${conversionPreview.usdAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Conversion Fee (1%)</span>
                        <span className="font-semibold text-orange-600">-${conversionPreview.conversionFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount after fee</span>
                        <span className="font-semibold">${conversionPreview.amountAfterFee.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between">
                          <span className="font-medium">You'll receive</span>
                          <span className="text-lg font-bold text-green-600">
                            ₦{conversionPreview.ngnAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
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
                <p className="text-sm text-muted-foreground">Conversion Fee</p>
                <p className="text-xl font-bold text-orange-600">1%</p>
                <p className="text-xs text-muted-foreground">Applied to all conversions</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-xl font-bold">
                  ${((userProfile?.usdBalance || 0) + (userProfile?.usdProcessingBalance || 0) + ((userProfile?.ngnBalance || 0) / exchangeRate)).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">USD Equivalent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest 4 transactions</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/transactions')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <TransactionTable transactions={transactions} />
            )}
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
                Convert USD to NGN (1% fee)
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
                    Amount (USD) - Available: ${userProfile?.usdBalance.toFixed(2) || "0.00"}
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
                  {conversionPreview && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Conversion Fee (1%)</span>
                        <span className="font-medium text-orange-600">-${conversionPreview.conversionFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount after fee</span>
                        <span className="font-medium">${conversionPreview.amountAfterFee.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">You'll receive</span>
                          <span className="font-bold text-green-600">
                            ₦{conversionPreview.ngnAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
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