"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CallbackPage() {
  const params = useSearchParams()
  const [status, setStatus] = useState("")
  const [txRef, setTxRef] = useState("")
  const [transactionId, setTransactionId] = useState("")

  useEffect(() => {
    const s = params.get("status")
    const tx = params.get("tx_ref")
    const id = params.get("transaction_id")

    setStatus(s ?? "")
    setTxRef(tx ?? "")
    setTransactionId(id ?? "")

    // Optionally call backend to verify transaction
    if (tx) {
      fetch(`/api/flutterwave/verify?tx_ref=${tx}`)
        .then(res => res.json())
        .then(console.log)
    }
  }, [params])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {status === "successful" ? (
        <div>
          <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
          <p>Transaction Reference: {txRef}</p>
          <p>Transaction ID: {transactionId}</p>
          <Button onClick={() => window.location.href = "/"}>Return Home</Button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-red-600">Payment Failed or Cancelled</h1>
          <Button onClick={() => window.location.href = "/"}>Return Home</Button>
        </div>
      )}
    </div>
  )
}
