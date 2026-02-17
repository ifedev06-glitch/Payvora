"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function FailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Payment Failed 😔
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-center">
            Something went wrong with your payment. Please try again or contact support if the issue persists.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-3 mt-4">
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