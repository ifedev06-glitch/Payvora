"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import {
  getProfile,
  UserProfileResponse,
  createRecipient,
  getMyBankAccounts,
  initiateWithdrawal,
  BankAccountResponse,
  RecipientRequest,
  FlutterwaveBeneficiaryResponse,
} from "@/lib/api"

const NIGERIAN_BANKS = [
  { code: "100004", name: "OPay Digital Services Limited (OPay)" },
  { code: "044",    name: "Access Bank" },
  // { code: "063",    name: "Access Bank (Diamond)" },
  { code: "011",    name: "First Bank of Nigeria" },
  { code: "058",    name: "Guaranty Trust Bank" },
  { code: "214",    name: "First City Monument Bank" },
  { code: "082",    name: "Keystone Bank" },
  { code: "035",    name: "Wema Bank" },
  { code: "057",    name: "Zenith Bank" },
  // { code: "50211",  name: "Kuda Bank" },
  { code: "033",    name: "United Bank for Africa" },
  { code: "215",    name: "Unity Bank" },
]

// ─── small SVG icons (inline to avoid extra deps) ─────────────────────────────
const BankIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)
const CircleCheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

export default function WithdrawalPage() {
  const router = useRouter()

  // ── ALL STATE PRESERVED ───────────────────────────────────────────────────────
  const [isLoading,           setIsLoading]           = useState(true)
  const [userProfile,         setUserProfile]         = useState<UserProfileResponse | null>(null)
  const [bankAccounts,        setBankAccounts]        = useState<BankAccountResponse[]>([])
  const [selectedAccount,     setSelectedAccount]     = useState<string>("")
  const [amount,              setAmount]              = useState("")
  const [isWithdrawing,       setIsWithdrawing]       = useState(false)
  const [withdrawalStatus,    setWithdrawalStatus]    = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" })

  const [isAddBankOpen,       setIsAddBankOpen]       = useState(false)
  const [isAddingBank,        setIsAddingBank]        = useState(false)
  const [bankForm,            setBankForm]            = useState({ accountName: "", accountNumber: "", bankCode: "" })
  const [addBankError,        setAddBankError]        = useState("")
  const [isBankDropdownOpen,  setIsBankDropdownOpen]  = useState(false)
  const [isAccountDropdownOpen,setIsAccountDropdownOpen]= useState(false)

  // ── ALL EFFECTS PRESERVED ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [profile, accounts] = await Promise.all([getProfile(), getMyBankAccounts()])
        setUserProfile(profile)
        setBankAccounts(accounts)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── ALL HANDLERS PRESERVED ────────────────────────────────────────────────────
  const handleAddBank = async () => {
    if (!bankForm.accountName || !bankForm.accountNumber || !bankForm.bankCode) { setAddBankError("Please fill in all fields"); return }
    if (bankForm.accountNumber.length !== 10) { setAddBankError("Account number must be 10 digits"); return }
    try {
      setIsAddingBank(true); setAddBankError("")
      const recipientRequest: RecipientRequest = {
        account_number: bankForm.accountNumber,
        account_bank: bankForm.bankCode,
        beneficiary_name: bankForm.accountName,
      }
      const response: FlutterwaveBeneficiaryResponse = await createRecipient(recipientRequest)
      const newBankAccount: BankAccountResponse = {
        recipientCode: String(response.data.id),
        name: response.data.fullName,
        accountNumber: response.data.accountNumber,
        bankCode: response.data.bankCode,
        currency: "NGN",
      }
      setBankAccounts([...bankAccounts, newBankAccount])
      setIsAddBankOpen(false)
      setBankForm({ accountName: "", accountNumber: "", bankCode: "" })
      setWithdrawalStatus({ type: "success", message: `Bank account added successfully! Verified Name: ${response.data.fullName}` })
      setTimeout(() => setWithdrawalStatus({ type: null, message: "" }), 5000)
    } catch (error: any) {
      setAddBankError(error.response?.data?.message || "Failed to add bank account. Please try again.")
    } finally {
      setIsAddingBank(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedAccount || !amount) { setWithdrawalStatus({ type: "error", message: "Please select a bank account and enter an amount" }); return }
    const withdrawalAmount = parseFloat(amount)
    if (withdrawalAmount <= 0) { setWithdrawalStatus({ type: "error", message: "Please enter a valid amount" }); return }
    if (withdrawalAmount < 100) { setWithdrawalStatus({ type: "error", message: "Minimum withdrawal amount is ₦100" }); return }
    if (withdrawalAmount > (userProfile?.ngnBalance || 0)) { setWithdrawalStatus({ type: "error", message: "Insufficient balance" }); return }
    try {
      setIsWithdrawing(true); setWithdrawalStatus({ type: null, message: "" })
      await initiateWithdrawal(selectedAccount, withdrawalAmount)
      setWithdrawalStatus({ type: "success", message: `Withdrawal of ${userProfile?.ngnCurrency} ${withdrawalAmount.toLocaleString()} initiated successfully! Funds will arrive within 1 minute.` })
      setAmount(""); setSelectedAccount("")
      setTimeout(async () => { const updatedProfile = await getProfile(); setUserProfile(updatedProfile) }, 2000)
    } catch (error: any) {
      setWithdrawalStatus({ type: "error", message: error.response?.data?.message || "Withdrawal failed. Please try again." })
    } finally {
      setIsWithdrawing(false)
    }
  }

  // ── helpers ───────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )

  const selectedAccountDetails = bankAccounts.find((a) => a.recipientCode === selectedAccount)
  const selectedBankName = NIGERIAN_BANKS.find((b) => b.code === bankForm.bankCode)?.name
  const getBankName = (code: string) => NIGERIAN_BANKS.find((b) => b.code === code)?.name || code
  const parsedAmount = parseFloat(amount)
  const hasValidAmount = amount && parsedAmount >= 100

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-background">
      <DashboardNav userType="freelancer" userEmail={userProfile?.email || ""} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors font-medium group">
            <span className="group-hover:-translate-x-0.5 transition-transform"><ArrowLeftIcon /></span>
            Back to Dashboard
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Withdrawal</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Withdraw Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">Transfer money to your Nigerian bank account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main Column ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Balance Card */}
            <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/5" />
              <div className="absolute top-10 -right-2 w-20 h-20 rounded-full bg-white/5" />
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-widest opacity-60 mb-1">Available Balance</p>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {userProfile?.ngnCurrency || "NGN"}{" "}
                  {userProfile?.ngnBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 }) || "0.00"}
                </p>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Withdrawal Details</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Enter the amount and select your bank account</p>
              </div>

              <div className="space-y-5">

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      {userProfile?.ngnCurrency || "NGN"}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 text-base border border-border/60 rounded-xl bg-slate-50 dark:bg-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      min="100"
                      step="0.01"
                    />
                  </div>
                  {hasValidAmount && (
                    <div className="mt-3 p-3.5 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/40 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transfer fee</span>
                        <span className="font-medium">{userProfile?.ngnCurrency} 10.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">You will receive</span>
                        <span className="font-semibold text-foreground">
                          {userProfile?.ngnCurrency} {parsedAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border/40 flex justify-between">
                        <span className="text-sm font-semibold">Total debit</span>
                        <span className="font-bold text-foreground">
                          {userProfile?.ngnCurrency} {(parsedAmount + 10).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Account Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bank Account</label>
                  {bankAccounts.length > 0 ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        className="w-full px-4 py-3 text-left border border-border/60 rounded-xl bg-slate-50 dark:bg-input hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all flex items-center justify-between"
                      >
                        {selectedAccountDetails ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                              <BankIcon />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">{selectedAccountDetails.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {selectedAccountDetails.accountNumber} · {getBankName(selectedAccountDetails.bankCode)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Select bank account</span>
                        )}
                        <span className="text-muted-foreground"><ChevronDown /></span>
                      </button>

                      {isAccountDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-card border border-border/50 rounded-xl shadow-xl max-h-60 overflow-auto">
                          {bankAccounts.map((account) => (
                            <button key={account.recipientCode}
                              onClick={() => { setSelectedAccount(account.recipientCode); setIsAccountDropdownOpen(false) }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors flex items-center gap-3 border-b border-border/30 last:border-b-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <BankIcon />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{account.name}</p>
                                <p className="text-xs text-muted-foreground">{account.accountNumber} · {getBankName(account.bankCode)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0"><AlertIcon /></span>
                      <p className="text-sm text-amber-800 dark:text-amber-400">No bank accounts added yet. Add one to continue.</p>
                    </div>
                  )}
                </div>

                {/* Add Bank Button */}
                <button onClick={() => setIsAddBankOpen(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-border/60 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
                  <PlusIcon />
                  Add New Bank Account
                </button>

                {/* Status Messages */}
                {withdrawalStatus.type && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                    withdrawalStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400"
                      : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30 text-red-800 dark:text-red-400"
                  }`}>
                    <span className="flex-shrink-0 mt-0.5">
                      {withdrawalStatus.type === "success" ? <CircleCheckIcon /> : <AlertIcon />}
                    </span>
                    <p>{withdrawalStatus.message}</p>
                  </div>
                )}

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={!selectedAccount || !amount || isWithdrawing || parsedAmount < 100}
                  className="w-full px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-sm hover:shadow-md shadow-primary/20"
                >
                  {isWithdrawing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : "Withdraw Funds"}
                </button>

              </div>
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Summary Card */}
            {selectedAccountDetails && hasValidAmount && (
              <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-widest text-muted-foreground">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">{userProfile?.ngnCurrency} {parsedAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transfer Fee</span>
                    <span className="font-semibold">{userProfile?.ngnCurrency} 10.00</span>
                  </div>
                  <div className="pt-3 border-t border-border/50 flex justify-between font-bold text-base">
                    <span>Total Debit</span>
                    <span>{userProfile?.ngnCurrency} {(parsedAmount + 10).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">To Account</p>
                    <p className="font-semibold text-foreground">{selectedAccountDetails.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedAccountDetails.accountNumber} · {getBankName(selectedAccountDetails.bankCode)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Withdrawal Info</h3>
              <div className="space-y-3">
                {[
                  "Withdrawals are processed within seconds",
                  `Transfer fee: ${userProfile?.ngnCurrency || "NGN"} 10.00`,
                  `Minimum withdrawal: ${userProfile?.ngnCurrency || "NGN"} 100.00`,
                  "All transactions are secured and encrypted",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5"><CircleCheckIcon /></span>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Accounts */}
            {bankAccounts.length > 0 && (
              <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Saved Accounts ({bankAccounts.length})
                </h3>
                <div className="space-y-2">
                  {bankAccounts.map((account) => {
                    const isSelected = selectedAccount === account.recipientCode
                    return (
                      <div key={account.recipientCode} onClick={() => setSelectedAccount(account.recipientCode)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                            : "border-border/40 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-muted/20"
                        }`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-muted text-muted-foreground"
                        }`}>
                          <BankIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                        </div>
                        {isSelected && <span className="text-primary flex-shrink-0"><CheckIcon /></span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD BANK MODAL — all handler calls preserved exactly
      ══════════════════════════════════════════════════════════════════════ */}
      {isAddBankOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-border/50">
            <div className="p-6">

              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">Add Bank Account</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Enter your bank account details below</p>
                </div>
                <button onClick={() => { setIsAddBankOpen(false); setAddBankError(""); setBankForm({ accountName: "", accountNumber: "", bankCode: "" }) }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                  <XIcon />
                </button>
              </div>

              <div className="space-y-4">

                {/* Bank Selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bank</label>
                  <div className="relative">
                    <button onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                      className="w-full px-4 py-3 text-left border border-border/60 rounded-xl bg-slate-50 dark:bg-input hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all flex items-center justify-between text-sm">
                      <span className={bankForm.bankCode ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {selectedBankName || "Select your bank"}
                      </span>
                      <span className="text-muted-foreground"><ChevronDown /></span>
                    </button>
                    {isBankDropdownOpen && (
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-card border border-border/50 rounded-xl shadow-xl max-h-60 overflow-auto">
                        {NIGERIAN_BANKS.map((bank) => (
                          <button key={bank.code}
                            onClick={() => { setBankForm({ ...bankForm, bankCode: bank.code }); setIsBankDropdownOpen(false) }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors border-b border-border/30 last:border-b-0 text-sm text-foreground">
                            {bank.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                  <input type="text" placeholder="0123456789" maxLength={10}
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-4 py-3 text-sm border border-border/60 rounded-xl bg-slate-50 dark:bg-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Account Name</label>
                  <input type="text" placeholder="John Doe"
                    value={bankForm.accountName}
                    onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-border/60 rounded-xl bg-slate-50 dark:bg-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>

                {/* Error */}
                {addBankError && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-700 dark:text-red-400">
                    <span className="flex-shrink-0 mt-0.5"><AlertIcon /></span>
                    <p>{addBankError}</p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setIsAddBankOpen(false); setAddBankError(""); setBankForm({ accountName: "", accountNumber: "", bankCode: "" }) }}
                  disabled={isAddingBank}
                  className="flex-1 px-4 py-3 text-sm border border-border/60 text-foreground font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleAddBank} disabled={isAddingBank}
                  className="flex-1 px-4 py-3 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-40 shadow-sm shadow-primary/20">
                  {isAddingBank ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : "Add Account"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}