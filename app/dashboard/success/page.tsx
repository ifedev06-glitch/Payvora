"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Payment Successful 🎉
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-center">
            Thank you for paying with Payvora. Your payment has been processed and Freelancer has been credited.
          </p>
        </CardHeader>

        <CardContent className="flex justify-center mt-4">
          <Button
            className="w-full max-w-xs"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
