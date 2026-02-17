"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Loader2, Lock, ShieldCheck, CreditCard, Zap } from "lucide-react"
import axios from "axios"
import { BACKEND_BASE_URL } from "@/lib/constatnt"

// Create public API client without auth interceptor
const publicApiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000,
})

// Public API functions
async function getPublicPaymentDetails(linkId: string) {
  const response = await publicApiClient.get(`/public-link/${linkId}`)
  return response.data
}

async function initializePayment(linkId: string) {
  const response = await publicApiClient.post(`/public-link/${linkId}/initialize`)
  return response.data
}

interface PaymentDetails {
  linkId: string
  freelancerName: string
  amount: number
  currency: string
  description: string
  status: string
  fee: number
  total: number
}

const DEFAULT_PAYMENT_DETAILS: PaymentDetails = {
  linkId: "",
  freelancerName: "Freelancer",
  amount: 0,
  currency: "USD",
  description: "",
  status: "PENDING",
  fee: 0,
  total: 0,
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const linkId = params.linkId as string

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(DEFAULT_PAYMENT_DETAILS)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPaymentDetails()
  }, [linkId])

  const fetchPaymentDetails = async () => {
    setIsLoading(true)
    try {
      const data = await getPublicPaymentDetails(linkId)
      setPaymentDetails({
        ...DEFAULT_PAYMENT_DETAILS,
        ...data,
        amount: data.amount ?? 0,
        fee: data.fee ?? 0,
        total: data.total ?? 0,
      })
      setError("")
    } catch (err: any) {
      console.error("Error fetching payment details:", err)
      setError(err.response?.data?.message || "Payment link not found or expired")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    setIsProcessing(true)
    setMessage("Initializing payment...")
    setError("")

    try {
      const response = await initializePayment(linkId)

      if (response.checkoutUrl) {
        setMessage("Redirecting to Stripe...")
        window.location.href = response.checkoutUrl
      } else {
        setError("Failed to initialize payment. Please try again.")
        setIsProcessing(false)
      }
    } catch (err: any) {
      console.error("Error initializing payment:", err)
      setError(err.response?.data?.message || "Failed to initialize payment")
      setIsProcessing(false)
    }
  }

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <p className="text-slate-500 text-sm">Loading payment details...</p>
        </div>
      </div>
    )
  }

  // ─── Error State ───
  if (error && !paymentDetails?.linkId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <span className="text-2xl">🔗</span>
          </div>
          <div>
            <h2 className="text-slate-900 text-xl font-semibold mb-2">Link Not Found</h2>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
          <Button
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-100"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  const initials = paymentDetails.freelancerName.charAt(0).toUpperCase()
  const isPending = paymentDetails.status === "PENDING"

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-slate-900 font-bold text-sm tracking-widest">PAYVORA</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 space-y-4">

        {/* Alerts */}
        {message && (
          <Alert className="bg-primary/10 border-primary/20 text-primary rounded-xl">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && paymentDetails?.linkId && (
          <Alert className="bg-red-500/10 border-red-500/20 rounded-xl">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Recipient card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <span className="text-xl font-bold text-primary-foreground">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 font-semibold truncate">{paymentDetails.freelancerName}</p>
            {paymentDetails.description && (
              <p className="text-slate-500 text-sm truncate">{paymentDetails.description}</p>
            )}
          </div>
          <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isPending
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPending ? "bg-amber-400 animate-pulse" : "bg-slate-500"}`} />
            {paymentDetails.status}
          </span>
        </div>

        {/* Amount breakdown */}
        <div className="rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-sm overflow-hidden">

          {/* Total amount hero */}
          <div className="px-6 py-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/80 text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Total Due</p>
            <p className="text-5xl font-bold text-slate-900 tracking-tight">
              ${paymentDetails.total.toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-1">{paymentDetails.currency}</p>
          </div>

          {/* Breakdown rows */}
          <div className="px-6 py-4 space-y-0">
            <Row label="Payment Amount" value={`$${paymentDetails.amount.toFixed(2)}`} />
            <Row label="Card Processor Fee" value={`$${((paymentDetails.fee || 0) - 0.30).toFixed(2)}`} muted />
            <Row label="Platform Fee" value="$0.30" muted />
            <Row label="Total Fees" value={`$${paymentDetails.fee.toFixed(2)}`} muted />
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-sm px-6 py-4">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Payment Methods</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {["💳", "🍎", "G"].map((icon, i) => (
                <div key={i} className="w-10 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {icon}
                </div>
              ))}
            </div>
            <span className="text-slate-500 text-sm">Card · Apple Pay · Google Pay</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 relative overflow-hidden group"
          onClick={handleProceedToPayment}
          disabled={isProcessing || !isPending}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Redirecting...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay ${paymentDetails.total.toFixed(2)} with Stripe
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>

        {!isPending && (
          <p className="text-center text-sm text-slate-500">
            This payment link has already been used or has expired.
          </p>
        )}

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fraud Protected</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 pb-4">
          Powered by <span className="text-slate-500 font-medium">Payvora</span> &amp; <span className="text-slate-500 font-medium">Stripe</span>
        </p>
      </div>
    </div>
  )
}

// Helper row component
function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${muted ? "text-slate-500" : "text-slate-900"}`}>{value}</span>
    </div>
  )
}