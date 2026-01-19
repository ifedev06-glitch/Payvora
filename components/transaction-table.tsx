"use client"

import { CheckCircle, Clock } from "lucide-react"

interface Transaction {
  id: number
  type: string
  freelancer?: string
  client?: string
  amount: number
  status: string
  date: string
}

interface TransactionTableProps {
  transactions: Transaction[]
  userType: "client" | "freelancer"
}

export default function TransactionTable({ transactions, userType }: TransactionTableProps) {
  const getStatusColor = (status: string) => {
    if (status === "completed") return "text-accent"
    if (status === "pending") return "text-muted-foreground"
    return "text-muted-foreground"
  }

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="w-4 h-4 text-accent" />
    return <Clock className="w-4 h-4 text-muted-foreground" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              {userType === "client" ? "Recipient" : "Sender"}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 text-foreground">
                {userType === "client" ? tx.freelancer || tx.client : tx.client || tx.freelancer}
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-muted-foreground capitalize">{tx.type.replace(/_/g, " ")}</span>
              </td>
              <td className="py-3 px-4 font-semibold text-foreground">
                {userType === "client" ? "-" : "+"}${tx.amount.toFixed(2)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(tx.status)}
                  <span className={`text-sm capitalize ${getStatusColor(tx.status)}`}>{tx.status}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(tx.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
