"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowDownUp, Loader2 } from "lucide-react"
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
      // Ensure all numeric fields are defined
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
        setMessage("Redirecting to Flutterwave...")
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error && !paymentDetails?.linkId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Link Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-destructive/10 border-destructive/30 mb-4">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg">
              <span className="text-3xl font-bold text-primary-foreground">P</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              PAYVORA
            </h1>
            <p className="text-muted-foreground">Secure Payment Checkout</p>
          </div>
        </div>

        {message && (
          <Alert className="mb-6 bg-accent/10 border-accent/30 text-accent">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && paymentDetails?.linkId && (
          <Alert className="mb-6 bg-destructive/10 border-destructive/30">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10 border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">
                  {paymentDetails.freelancerName.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-lg">{paymentDetails.freelancerName}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  {paymentDetails.description}
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-dashed">
                <span className="text-muted-foreground font-medium">Payment Amount</span>
                <span className="text-2xl font-bold">
                  ${paymentDetails.amount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-dashed">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Processing Fee</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">2.3%</span>
                </div>
                <span className="text-lg font-semibold text-muted-foreground">
                  ${paymentDetails.fee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl px-5 border border-primary/20">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ${paymentDetails.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t border-muted my-6"></div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground mb-3">Payment Information</h3>
              
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-semibold">{paymentDetails.currency}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></span>
                  {paymentDetails.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-muted-foreground">Payment Method</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">💳</span>
                  </div>
                  <span className="font-semibold">Card / Bank Transfer</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={handleProceedToPayment}
          disabled={isProcessing || paymentDetails.status !== "PENDING"}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Redirecting to Payment...
            </>
          ) : (
            <>
              <span>Proceed to Payment</span>
              <ArrowDownUp className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {paymentDetails.status !== "PENDING" && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            This payment link has already been used or expired.
          </p>
        )}

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <span>Secured with 256-bit SSL Encryption</span>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-base">🔒</span>
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base">🛡️</span>
              <span>Fraud Protected</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base">✓</span>
              <span>Verified Secure</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-4 border-t border-muted">
            Powered by <span className="font-semibold text-foreground">PAYVORA</span> • Your payments are safe with us
          </p>
        </div>
      </div>
    </div>
  )
}