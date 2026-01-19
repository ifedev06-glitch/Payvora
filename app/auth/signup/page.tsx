"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SignupChoice() {
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Choose how you want to use PayFlow</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Link href="/auth/signup-client" className="block">
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-start p-4 justify-start bg-transparent"
              >
                <p className="font-semibold">I'm a Client</p>
                <p className="text-sm text-muted-foreground">Pay freelancers and manage projects</p>
              </Button>
            </Link>

            <Link href="/auth/signup-freelancer" className="block">
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-start p-4 justify-start bg-transparent"
              >
                <p className="font-semibold">I'm a Freelancer</p>
                <p className="text-sm text-muted-foreground">Receive payments and grow your business</p>
              </Button>
            </Link>

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
