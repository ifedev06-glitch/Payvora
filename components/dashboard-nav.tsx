"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DashboardNavProps {
  userType: "client" | "freelancer"
  userEmail?: string
}

export default function DashboardNav({ userType, userEmail }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const dashboardLink = userType === "client" ? "/dashboard/client" : "/dashboard/freelancer"

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            Payvora
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href={dashboardLink} className="text-foreground hover:text-primary transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Settings
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground">
              {userEmail ? userEmail : userType === "client" ? "Client Account" : "Freelancer Account"}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
