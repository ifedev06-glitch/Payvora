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
import { ArrowDownUp, FileText, Loader2, X, Clock, Wallet, TrendingUp, Copy, Check } from "lucide-react"
import {
  getProfile,
  createPaymentLink,
  convertUsdToNgn,
  getExchangeRate,
  getAllTransactions,
  type UserProfileResponse,
  type TransactionResponse
} from "@/lib/api"

// ─── Transaction Table ───────────────────────────────────────────────────────
function TransactionTable({ transactions }: { transactions: TransactionResponse[] }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    COMPLETED:  { label: "Completed",  className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800" },
    PROCESSING: { label: "Processing", className: "bg-amber-50  text-amber-700  ring-1 ring-amber-200  dark:bg-amber-900/20  dark:text-amber-400  dark:ring-amber-800"  },
    PENDING:    { label: "Pending",    className: "bg-amber-50  text-amber-700  ring-1 ring-amber-200  dark:bg-amber-900/20  dark:text-amber-400  dark:ring-amber-800"  },
    FAILED:     { label: "Failed",     className: "bg-red-50    text-red-700    ring-1 ring-red-200    dark:bg-red-900/20    dark:text-red-400    dark:ring-red-800"    },
  }

  const typeConfig: Record<string, { label: string; className: string }> = {
    DEPOSIT:           { label: "Deposit",    className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-400" },
    WITHDRAWAL:        { label: "Withdrawal", className: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400" },
    CONVERSION:        { label: "Conversion", className: "bg-cyan-50   text-cyan-700   ring-1 ring-cyan-200   dark:bg-cyan-900/20   dark:text-cyan-400"   },
    TRANSFER_SENT:     { label: "Sent",       className: "bg-red-50    text-red-700    ring-1 ring-red-200    dark:bg-red-900/20    dark:text-red-400"    },
    TRANSFER_RECEIVED: { label: "Received",   className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400" },
    REFUND:            { label: "Refund",     className: "bg-blue-50   text-blue-700   ring-1 ring-blue-200   dark:bg-blue-900/20   dark:text-blue-400"   },
    FEE:               { label: "Fee",        className: "bg-slate-100 text-slate-600  ring-1 ring-slate-200  dark:bg-slate-800     dark:text-slate-400"  },
  }

  const formatAmount = (amount: number, currency: string) =>
    currency === "NGN"
      ? `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${amount.toFixed(2)}`

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  if (transactions.length === 0)
    return <p className="text-center py-10 text-sm text-muted-foreground">No transactions yet</p>

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            {["Type", "Amount", "Status", "Date"].map((h) => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const type   = typeConfig[tx.type]   ?? typeConfig.DEPOSIT
            const status = statusConfig[tx.status] ?? statusConfig.PENDING
            return (
              <tr key={tx.id} className="border-b border-border/30 hover:bg-slate-50/60 dark:hover:bg-muted/20 transition-colors">
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${type.className}`}>{type.label}</span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-sm text-foreground">{formatAmount(tx.amount, tx.currency)}</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>{status.label}</span>
                </td>
                <td className="py-3.5 px-4 text-sm text-muted-foreground">{formatDate(tx.createdAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const router = useRouter()

  // ── state ────────────────────────────────────────────────────────────────────
  const [userProfile,          setUserProfile]          = useState<UserProfileResponse | null>(null)
  const [isLoadingProfile,     setIsLoadingProfile]     = useState(true)
  const [exchangeRate,         setExchangeRate]         = useState<number>(1650)
  const [isLoadingRate,        setIsLoadingRate]        = useState(true)
  const [transactions,         setTransactions]         = useState<TransactionResponse[]>([])
  const [isLoadingTransactions,setIsLoadingTransactions]= useState(true)

  const [showPaymentModal,     setShowPaymentModal]     = useState(false)
  const [showConvertModal,     setShowConvertModal]     = useState(false)
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [paymentAmount,        setPaymentAmount]        = useState("")
  const [paymentLink,          setPaymentLink]          = useState("")
  const [convertAmount,        setConvertAmount]        = useState("")
  const [isProcessing,         setIsProcessing]         = useState(false)
  const [message,              setMessage]              = useState("")
  const [isCreatingPayment,    setIsCreatingPayment]    = useState(false)
  const [isNavigatingWithdraw, setIsNavigatingWithdraw] = useState(false)
  const [copied,               setCopied]               = useState(false)

  // ── data fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try { setUserProfile(await getProfile()) }
      catch (e) { console.error(e); setMessage("Failed to load profile. Please try again.") }
      finally { setIsLoadingProfile(false) }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try { setExchangeRate(await getExchangeRate()) }
      catch (e) { console.error(e) }
      finally { setIsLoadingRate(false) }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try { setTransactions((await getAllTransactions()).slice(0, 4)) }
      catch (e) { console.error(e) }
      finally { setIsLoadingTransactions(false) }
    })()
  }, [])

  // ── helpers ──────────────────────────────────────────────────────────────────
  const calculateConversionPreview = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return null
    const usdAmount      = parseFloat(amount)
    const conversionFee  = usdAmount * 0.01
    const amountAfterFee = usdAmount - conversionFee
    const ngnAmount      = amountAfterFee * exchangeRate
    return { usdAmount, conversionFee, amountAfterFee, ngnAmount }
  }

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) { setMessage("Please enter a valid amount"); return }
    setIsProcessing(true); setMessage("Generating payment link...")
    try {
      const response = await createPaymentLink({ amount: parseFloat(paymentAmount) })
      setPaymentLink(response.paymentUrl); setShowPaymentModal(false); setShowPaymentLinkModal(true); setMessage("")
    } catch (error: any) {
      console.error(error); setMessage(error.response?.data?.message || "Failed to create payment link. Please try again.")
    } finally { setIsProcessing(false) }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink)
    setCopied(true); setMessage("Payment link copied to clipboard!")
    setTimeout(() => { setCopied(false); setMessage("") }, 2000)
  }

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!convertAmount || parseFloat(convertAmount) <= 0) { setMessage("Please enter a valid amount"); return }
    setIsProcessing(true); setMessage("Converting currency...")
    try {
      const response = await convertUsdToNgn(parseFloat(convertAmount))
      if (userProfile) setUserProfile({ ...userProfile, usdBalance: response.usdWalletBalance, ngnBalance: response.ngnWalletBalance })
      setMessage(`Converted successfully! Fee: $${response.conversionFee.toFixed(2)} (1%). You received ₦${response.ngnReceived.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      setConvertAmount("")
      setTransactions((await getAllTransactions()).slice(0, 4))
      setTimeout(() => { setShowConvertModal(false); setMessage("") }, 3500)
    } catch (error: any) {
      console.error(error); setMessage(error.response?.data?.message || "Failed to convert currency. Please try again.")
    } finally { setIsProcessing(false) }
  }

  // ── loading ──────────────────────────────────────────────────────────────────
  if (isLoadingProfile || isLoadingRate) return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )

  const conversionPreview = calculateConversionPreview(convertAmount)

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-background">
      <DashboardNav userType="client" userEmail={userProfile?.email || ""} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Welcome back, {userProfile?.firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's an overview of your account</p>
        </div>

        {/* Global alert */}
        {message && !showPaymentModal && !showPaymentLinkModal && !showConvertModal && (
          <Alert className="bg-primary/5 border-primary/20 rounded-xl">
            <AlertDescription className="text-primary font-medium text-sm">{message}</AlertDescription>
          </Alert>
        )}

        {/* ── Wallet Cards ─────────────────────────────────────────────────── */}

        {/* Mobile horizontal scroll */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-1">
          <div className="flex gap-3 min-w-max">

            {/* USD — mobile */}
            <div className="w-[300px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-primary-foreground shadow-lg shadow-primary/25 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute bottom-0 right-8 w-14 h-14 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3">
                  <Wallet className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-xs font-medium opacity-80">USD Wallet</span>
                </div>
                <p className="text-2xl font-bold tracking-tight mb-1">${userProfile?.usdBalance.toFixed(2) || "0.00"}</p>
                <p className="text-[10px] opacity-60 mb-3">Available balance</p>
                <Button size="sm" className="w-full h-8 text-xs font-semibold gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 text-white transition-all"
                  onClick={() => { setIsCreatingPayment(true); setShowPaymentModal(true); setTimeout(() => setIsCreatingPayment(false), 300) }}
                  disabled={isCreatingPayment}>
                  {isCreatingPayment ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading...</> : <><FileText className="w-3.5 h-3.5" />Get Paid</>}
                </Button>
              </div>
            </div>

            {/* Processing — mobile (beside USD) */}
            <div className="w-[300px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 p-5 text-white shadow-lg shadow-slate-700/25 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute bottom-0 right-8 w-14 h-14 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-xs font-medium opacity-80">Processing Balance</span>
                </div>
                <p className="text-2xl font-bold tracking-tight mb-1">
                  ${userProfile?.usdProcessingBalance?.toFixed(2) || "0.00"}
                </p>
                <p className="text-[10px] opacity-60 mb-3">Pending clearance</p>
                <div className="bg-white/10 rounded-xl px-2.5 py-2 border border-white/10">
                  <p className="text-[10px] opacity-80 leading-relaxed">
                    ⏳ Funds available in <span className="font-semibold">2 - 5 days</span> after deposit confirmation
                  </p>
                </div>
              </div>
            </div>

            {/* NGN — mobile */}
            <div className="w-[300px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/70 p-5 text-primary-foreground shadow-lg shadow-primary/25 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3">
                  <Wallet className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-xs font-medium opacity-80">NGN Wallet</span>
                </div>
                <p className="text-2xl font-bold tracking-tight mb-1">₦{userProfile?.ngnBalance.toLocaleString("en-NG", { minimumFractionDigits: 0 }) || "0"}</p>
                <p className="text-[10px] opacity-60 mb-3">Available balance</p>
                <Button size="sm" className="w-full h-8 text-xs font-semibold rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 text-white transition-all"
                  onClick={() => { setIsNavigatingWithdraw(true); router.push("/dashboard/withdrawal") }}
                  disabled={isNavigatingWithdraw}>
                  {isNavigatingWithdraw ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Loading...</> : "Withdraw"}
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Desktop grid — USD + Processing side by side, NGN full width below */}
        <div className="hidden md:grid md:grid-cols-2 gap-5">

          {/* USD — desktop */}
          <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute top-10 -right-2 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium opacity-90">USD Wallet</span>
              </div>
              <p className="text-[11px] uppercase tracking-widest opacity-60 mb-1">Available balance</p>
              <p className="text-4xl font-bold tracking-tight mb-4">${userProfile?.usdBalance.toFixed(2) || "0.00"}</p>
              <Button size="sm" className="w-full h-10 text-sm font-semibold gap-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 text-white transition-all"
                onClick={() => { setIsCreatingPayment(true); setShowPaymentModal(true); setTimeout(() => setIsCreatingPayment(false), 300) }}
                disabled={isCreatingPayment}>
                {isCreatingPayment ? <><Loader2 className="w-4 h-4 animate-spin" />Loading...</> : <><FileText className="w-4 h-4" />Create Payment Link</>}
              </Button>
            </div>
          </div>

          {/* Processing Balance — desktop (beside USD) */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-600 to-slate-800 p-6 text-white shadow-xl shadow-slate-700/20 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute top-10 -right-2 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium opacity-90">Processing</span>
              </div>
              <p className="text-[11px] uppercase tracking-widest opacity-60 mb-1">Pending balance</p>
              <p className="text-4xl font-bold tracking-tight mb-auto">
                ${userProfile?.usdProcessingBalance?.toFixed(2) || "0.00"}
              </p>
              <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-[11px] opacity-80 leading-relaxed">
                  ⏳ Processing funds will be available in <span className="font-semibold">2 - 5 days</span> after deposit confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* NGN — desktop (full width) */}
          <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/70 p-6 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute top-10 -right-2 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium opacity-90">NGN Wallet</span>
                </div>
                <p className="text-[11px] uppercase tracking-widest opacity-60 mb-1">Available balance</p>
                <p className="text-4xl font-bold tracking-tight">₦{userProfile?.ngnBalance.toLocaleString("en-NG", { minimumFractionDigits: 0 }) || "0"}</p>
              </div>
              <Button size="sm" className="h-10 px-8 text-sm font-semibold rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 text-white transition-all flex-shrink-0"
                onClick={() => { setIsNavigatingWithdraw(true); router.push("/dashboard/withdrawal") }}
                disabled={isNavigatingWithdraw}>
                {isNavigatingWithdraw ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</> : "Withdraw to Bank"}
              </Button>
            </div>
          </div>

        </div>

        {/* ── Conversion + Rate ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Conversion form */}
          <Card className="lg:col-span-2 rounded-2xl border-border/50 shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-4 pt-5 px-6">
              <CardTitle className="text-base font-semibold tracking-tight">Convert Currency</CardTitle>
              <CardDescription className="text-xs mt-0.5">Exchange USD → NGN with a 1% conversion fee. Only available balance can be converted.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form onSubmit={handleConvert} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Amount (USD)</label>
                    <span className="text-xs text-muted-foreground">Available: <span className="font-semibold text-foreground">${userProfile?.usdBalance.toFixed(2) || "0.00"}</span></span>
                  </div>
                  <Input type="number" placeholder="0.00" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-input border-border/60 text-base" step="0.01" disabled={isProcessing} />
                  {conversionPreview && (
                    <div className="mt-3 p-4 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/40 space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount to convert</span>
                        <span className="font-semibold">${conversionPreview.usdAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Conversion fee (1%)</span>
                        <span className="font-semibold text-orange-500">−${conversionPreview.conversionFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount after fee</span>
                        <span className="font-semibold">${conversionPreview.amountAfterFee.toFixed(2)}</span>
                      </div>
                      <div className="pt-2.5 border-t border-border/50 flex justify-between items-center">
                        <span className="text-sm font-semibold">You'll receive</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ₦{conversionPreview.ngnAmount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" size="lg" className="w-full h-11 text-sm font-semibold gap-2 rounded-xl shadow-sm hover:shadow transition-all" disabled={isProcessing}>
                  {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><ArrowDownUp className="w-4 h-4" />Convert to NGN</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rate card */}
          <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-base font-semibold tracking-tight">Live Rate</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/40">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">USD → NGN</p>
                <p className="text-2xl font-bold tracking-tight">₦{exchangeRate.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">per 1 USD</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Conversion Fee</p>
                <p className="text-2xl font-bold text-orange-500">1%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Applied to all conversions</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/40">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total (USD equiv.)</p>
                <p className="text-xl font-bold tracking-tight">
                  ${((userProfile?.usdBalance || 0) + (userProfile?.usdProcessingBalance || 0) + ((userProfile?.ngnBalance || 0) / exchangeRate)).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Transactions ─────────────────────────────────────────────────── */}
        <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">Recent Transactions</CardTitle>
              <CardDescription className="text-xs mt-0.5">Your latest 4 transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg border-border/60 hover:bg-slate-50 font-medium"
              onClick={() => router.push("/dashboard/transactions")}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-6 pb-5 pt-0">
            {isLoadingTransactions
              ? <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              : <TransactionTable transactions={transactions} />}
          </CardContent>
        </Card>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* ── Create Payment Modal ─────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <Card className="w-full max-w-sm bg-background border-border/50 rounded-2xl shadow-2xl">
            <CardHeader className="relative pb-3 pt-6 px-6">
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-xl"
                onClick={() => { setShowPaymentModal(false); setMessage(""); setPaymentAmount("") }}>
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg font-semibold">Create Payment</CardTitle>
              <CardDescription className="text-xs">Generate a shareable payment link</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {message && (
                <Alert className="mb-4 bg-primary/5 border-primary/20 rounded-xl">
                  <AlertDescription className="text-primary text-sm">{message}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleCreatePayment} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                  <Input type="number" placeholder="0.00" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-input border-border/60" step="0.01" min="0.01" required disabled={isProcessing} />
                </div>
                <div className="flex flex-col gap-2.5">
                  <Button type="submit" size="lg" className="w-full h-11 text-sm font-semibold gap-2 rounded-xl" disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><FileText className="w-4 h-4" />Generate Payment Link</>}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="w-full h-11 text-sm font-semibold rounded-xl border-border/60"
                    onClick={() => { setShowPaymentModal(false); setMessage(""); setPaymentAmount("") }} disabled={isProcessing}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Payment Link Modal ───────────────────────────────────────────── */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <Card className="w-full max-w-md bg-background border-border/50 rounded-2xl shadow-2xl">
            <CardHeader className="relative pb-3 pt-6 px-6">
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-xl"
                onClick={() => { setShowPaymentLinkModal(false); setPaymentAmount(""); setPaymentLink("") }}>
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Link Ready!</CardTitle>
              </div>
              <CardDescription className="text-xs">Share this link to receive payment</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {message && (
                <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
                  <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-sm">{message}</AlertDescription>
                </Alert>
              )}
              <div className="p-4 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/40">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Payment Amount</p>
                <p className="text-2xl font-bold">${parseFloat(paymentAmount).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Link</label>
                <div className="flex gap-2">
                  <Input value={paymentLink} readOnly className="h-11 font-mono text-xs rounded-xl bg-slate-50 dark:bg-input border-border/60" />
                  <Button size="lg" variant="outline" className="h-11 px-4 rounded-xl border-border/60 font-semibold gap-1.5" onClick={handleCopyLink}>
                    {copied ? <><Check className="w-4 h-4 text-emerald-500" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="lg" className="w-full h-11 text-sm font-semibold rounded-xl border-border/60"
                onClick={() => { setShowPaymentLinkModal(false); setPaymentAmount(""); setPaymentLink("") }}>
                Close
              </Button>
              <p className="text-xs text-muted-foreground text-center">Share this link with your client to complete payment</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Convert Currency Modal ───────────────────────────────────────── */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <Card className="w-full max-w-sm bg-background border-border/50 rounded-2xl shadow-2xl">
            <CardHeader className="relative pb-3 pt-6 px-6">
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-xl"
                onClick={() => { setShowConvertModal(false); setMessage(""); setConvertAmount("") }}>
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg font-semibold">Convert to Naira</CardTitle>
              <CardDescription className="text-xs">USD → NGN with 1% fee</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {message && (
                <Alert className="mb-4 bg-primary/5 border-primary/20 rounded-xl">
                  <AlertDescription className="text-primary text-sm">{message}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleConvert} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Amount (USD)</label>
                    <span className="text-xs text-muted-foreground">Available: <span className="font-semibold text-foreground">${userProfile?.usdBalance.toFixed(2) || "0.00"}</span></span>
                  </div>
                  <Input type="number" placeholder="0.00" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-input border-border/60" step="0.01" disabled={isProcessing} />
                  {conversionPreview && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/40 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fee (1%)</span>
                        <span className="font-medium text-orange-500">−${conversionPreview.conversionFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">After fee</span>
                        <span className="font-medium">${conversionPreview.amountAfterFee.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-border/50 flex justify-between">
                        <span className="text-sm font-semibold">You'll receive</span>
                        <span className="font-bold text-emerald-600">₦{conversionPreview.ngnAmount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/40">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Exchange Rate</p>
                  <p className="text-sm font-semibold">1 USD = ₦{exchangeRate.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <Button type="submit" size="lg" className="w-full h-11 text-sm font-semibold gap-2 rounded-xl" disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><ArrowDownUp className="w-4 h-4" />Convert to NGN</>}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="w-full h-11 text-sm font-semibold rounded-xl border-border/60"
                    onClick={() => { setShowConvertModal(false); setMessage(""); setConvertAmount("") }} disabled={isProcessing}>
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