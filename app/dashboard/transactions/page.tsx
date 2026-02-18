"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowDownUp, ArrowDownLeft, ArrowUpRight, RefreshCw, DollarSign, X, ChevronLeft, ChevronRight } from "lucide-react"
import {
  getAllTransactions,
  TransactionResponse
} from "@/lib/api"

const PAGE_SIZE = 7

const creditTypes = ["DEPOSIT", "TRANSFER_RECEIVED", "REFUND"]

const typeConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  DEPOSIT:           { label: "Deposit",    icon: <ArrowDownLeft className="w-3.5 h-3.5" />,  className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-400" },
  WITHDRAWAL:        { label: "Withdrawal", icon: <ArrowUpRight className="w-3.5 h-3.5" />,   className: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400" },
  CONVERSION:        { label: "Conversion", icon: <ArrowDownUp className="w-3.5 h-3.5" />,    className: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400" },
  TRANSFER_SENT:     { label: "Sent",       icon: <ArrowUpRight className="w-3.5 h-3.5" />,   className: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400" },
  TRANSFER_RECEIVED: { label: "Received",   icon: <ArrowDownLeft className="w-3.5 h-3.5" />,  className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400" },
  REFUND:            { label: "Refund",     icon: <RefreshCw className="w-3.5 h-3.5" />,      className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400" },
  FEE:               { label: "Fee",        icon: <DollarSign className="w-3.5 h-3.5" />,     className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400" },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  COMPLETED:  { label: "Completed",  className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800" },
  PROCESSING: { label: "Processing", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800" },
  PENDING:    { label: "Pending",    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800" },
  FAILED:     { label: "Failed",     className: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800" },
}

function formatAmount(tx: TransactionResponse) {
  const symbol = tx.currency === "NGN" ? "₦" : "$"
  const sign = creditTypes.includes(tx.type) ? "+" : "-"
  const formatted = tx.currency === "NGN"
    ? tx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : tx.amount.toFixed(2)
  return `${sign}${symbol}${formatted}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-6 py-2.5 border-b border-border/30 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-medium text-right text-sm max-w-[60%] break-words text-foreground">{String(value)}</span>
    </div>
  )
}

export default function TransactionsPage() {
  const router = useRouter()

  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [selectedTx, setSelectedTx]     = useState<TransactionResponse | null>(null)
  const [loading, setLoading]           = useState(true)
  const [currentPage, setCurrentPage]   = useState(1)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getAllTransactions()
        setTransactions(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const totalPages  = Math.ceil(transactions.length / PAGE_SIZE)
  const paginatedTx = transactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors font-medium group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </span>
            Back to Dashboard
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">History</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all your financial activity</p>
        </div>

        {/* ── Transaction Cards ────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-card rounded-2xl border border-border/50">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedTx.map((tx) => {
                const type     = typeConfig[tx.type]     ?? typeConfig.DEPOSIT
                const status   = statusConfig[tx.status] ?? statusConfig.PENDING
                const isCredit = creditTypes.includes(tx.type)

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm px-5 py-4 flex items-center justify-between gap-4 hover:border-primary/30 hover:shadow-md cursor-pointer transition-all"
                  >
                    {/* Left: icon + type + date */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Icon bubble */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                          : "bg-red-50 text-red-500 dark:bg-red-900/20"
                      }`}>
                        {type.icon}
                      </div>

                      {/* Type + date */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${type.className}`}>
                            {type.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>

                    {/* Right: amount */}
                    <p className={`text-base font-bold flex-shrink-0 ${isCredit ? "text-emerald-600" : "text-red-500"}`}>
                      {formatAmount(tx)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* ── Pagination ────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, transactions.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">{transactions.length}</span>
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-border/60 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm select-none">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          currentPage === page
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-white dark:bg-card border-border/60 hover:bg-slate-50 dark:hover:bg-muted/30 text-foreground"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border/60 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Transaction Detail Modal ─────────────────────────────────────── */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border/50">
            <div className="p-6 space-y-5">

              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">Transaction Details</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Full breakdown of this transaction</p>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount + Status */}
              <div className="p-5 bg-slate-50 dark:bg-muted/30 rounded-2xl border border-border/40">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Amount</p>
                <p className={`text-3xl font-bold tracking-tight ${creditTypes.includes(selectedTx.type) ? "text-emerald-600" : "text-red-500"}`}>
                  {formatAmount(selectedTx)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {(() => {
                    const type   = typeConfig[selectedTx.type]     ?? typeConfig.DEPOSIT
                    const status = statusConfig[selectedTx.status] ?? statusConfig.PENDING
                    return (
                      <>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${type.className}`}>
                          {type.icon}{type.label}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Details */}
              <div>
                <Detail label="Reference"        value={selectedTx.reference} />
                <Detail label="Description"      value={selectedTx.description} />
                <Detail label="Currency"         value={selectedTx.currency} />
                <Detail label="Exchange Rate"    value={selectedTx.exchangeRate} />
                <Detail label="Fee"              value={selectedTx.fee} />
                <Detail label="Created At"       value={selectedTx.createdAt ? formatDateTime(selectedTx.createdAt) : undefined} />
                <Detail label="Completed At"     value={selectedTx.completedAt ? formatDateTime(selectedTx.completedAt) : undefined} />
                <Detail label="Failure Reason" value={selectedTx.status === "FAILED" ? "Issue from recipient bank" : undefined} />
                <Detail label="Recipient Name"   value={selectedTx.recipientName} />
                <Detail label="Recipient Bank"   value={selectedTx.recipientBankName} />
                <Detail label="Recipient Acct"   value={selectedTx.recipientAccountNumber} />
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="w-full px-4 py-3 text-sm font-semibold border border-border/60 rounded-xl hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors text-foreground"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}