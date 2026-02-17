"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getAllTransactions,
  TransactionResponse
} from "@/lib/api"

const PAGE_SIZE = 10

export default function TransactionsPage() {

  const router = useRouter()

  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await getAllTransactions()
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  const creditTypes = ["DEPOSIT", "TRANSFER_RECEIVED", "REFUND"]

  const formatAmount = (tx: TransactionResponse) => {
    const symbol = tx.currency === "NGN" ? "₦" : "$"
    const sign = creditTypes.includes(tx.type) ? "+" : "-"
    return `${sign}${symbol}${tx.amount.toLocaleString()}`
  }

  const statusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-600"
      case "FAILED":
        return "bg-red-50 text-red-600"
      case "PROCESSING":
      case "PENDING":
        return "bg-yellow-50 text-yellow-600"
      default:
        return "bg-gray-50 text-gray-600"
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE)
  const paginatedTx = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Generate page numbers to show (max 5 visible)
  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="p-8 space-y-6">

      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-100 transition font-medium"
        >
          ← Back
        </button>

        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-500">
            View and manage all your financial activity.
          </p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            No transactions yet
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-left font-medium">Amount</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                {paginatedTx.map(tx => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="border-t hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="p-4 font-medium">
                      {tx.type.replace("_", " ")}
                    </td>

                    <td className={`p-4 font-semibold ${creditTypes.includes(tx.type) ? "text-green-600" : "text-red-600"}`}>
                      {formatAmount(tx)}
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION FOOTER */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                {/* Left: count info */}
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium text-gray-700">
                    {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, transactions.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">{transactions.length}</span>
                </p>

                {/* Right: page buttons */}
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ←
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                          currentPage === page
                            ? "bg-primary text-white border-primary"
                            : "bg-white hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 space-y-4">

            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Amount */}
            <div className="text-3xl font-bold">
              {formatAmount(selectedTx)}
            </div>

            {/* Status */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(selectedTx.status)}`}>
              {selectedTx.status}
            </span>

            <div className="border-t pt-4 space-y-2 text-sm">
              <Detail label="Reference" value={selectedTx.reference} />
              <Detail label="Description" value={selectedTx.description} />
              <Detail label="Currency" value={selectedTx.currency} />
              <Detail label="Exchange Rate" value={selectedTx.exchangeRate} />
              <Detail label="Fee" value={selectedTx.fee} />
              <Detail label="Created At" value={selectedTx.createdAt} />
              <Detail label="Completed At" value={selectedTx.completedAt} />
              <Detail label="Failure Reason" value={selectedTx.failureReason} />
              <Detail label="Recipient Name" value={selectedTx.recipientName} />
              <Detail label="Recipient Bank" value={selectedTx.recipientBankName} />
              <Detail label="Recipient Account" value={selectedTx.recipientAccountNumber} />
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

function Detail({
  label,
  value
}: {
  label: string
  value?: string | number
}) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-6">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  )
}