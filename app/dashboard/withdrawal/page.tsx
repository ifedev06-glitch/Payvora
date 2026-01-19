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
  PaystackRecipientResponse,
} from "@/lib/api"

const NIGERIAN_BANKS = [
  { code: "999992", name: "OPay Digital Services Limited (OPay)" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "214", name: "First City Monument Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "50211", name: "Kuda Bank" },
]

export default function WithdrawalPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawalStatus, setWithdrawalStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Add Bank Dialog States
  const [isAddBankOpen, setIsAddBankOpen] = useState(false)
  const [isAddingBank, setIsAddingBank] = useState(false)
  const [bankForm, setBankForm] = useState({
    accountName: "",
    accountNumber: "",
    bankCode: "",
  })
  const [addBankError, setAddBankError] = useState("")
  
  // Dropdown states
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)

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

  const handleAddBank = async () => {
    if (!bankForm.accountName || !bankForm.accountNumber || !bankForm.bankCode) {
      setAddBankError("Please fill in all fields")
      return
    }

    try {
      setIsAddingBank(true)
      setAddBankError("")

      const recipientRequest: RecipientRequest = {
        type: "nuban",
        name: bankForm.accountName,
        accountNumber: bankForm.accountNumber,
        bankCode: bankForm.bankCode,
        currency: "NGN",
      }

      const response: PaystackRecipientResponse = await createRecipient(recipientRequest)

      // Extract the recipient details from the nested response structure
      const newBankAccount: BankAccountResponse = {
        recipientCode: response.data.recipient_code,
        name: response.data.name,
        accountNumber: response.data.details.account_number,
        bankCode: response.data.details.bank_code,
        currency: response.data.currency,
      }

      setBankAccounts([...bankAccounts, newBankAccount])
      setIsAddBankOpen(false)
      setBankForm({ accountName: "", accountNumber: "", bankCode: "" })
    } catch (error: any) {
      setAddBankError(error.response?.data?.message || "Failed to add bank account. Please try again.")
    } finally {
      setIsAddingBank(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedAccount || !amount) {
      setWithdrawalStatus({
        type: "error",
        message: "Please select a bank account and enter an amount",
      })
      return
    }

    const withdrawalAmount = parseFloat(amount)
    if (withdrawalAmount <= 0) {
      setWithdrawalStatus({
        type: "error",
        message: "Please enter a valid amount",
      })
      return
    }

    if (withdrawalAmount > (userProfile?.ngnBalance || 0)) {
      setWithdrawalStatus({
        type: "error",
        message: "Insufficient balance",
      })
      return
    }

    try {
      setIsWithdrawing(true)
      setWithdrawalStatus({ type: null, message: "" })

      await initiateWithdrawal(selectedAccount, withdrawalAmount)

      setWithdrawalStatus({
        type: "success",
        message: `Withdrawal of ${userProfile?.ngnCurrency} ${withdrawalAmount.toLocaleString()} initiated successfully! Funds will arrive within 1 minute .`,
      })

      setAmount("")
      setSelectedAccount("")

      setTimeout(async () => {
        const updatedProfile = await getProfile()
        setUserProfile(updatedProfile)
      }, 1000)
    } catch (error: any) {
      setWithdrawalStatus({
        type: "error",
        message: error.response?.data?.message || "Withdrawal failed. Please try again.",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const selectedAccountDetails = bankAccounts.find((acc) => acc.recipientCode === selectedAccount)
  const selectedBankName = NIGERIAN_BANKS.find((bank) => bank.code === bankForm.bankCode)?.name
  const getBankNameFromCode = (code: string) => {
    return NIGERIAN_BANKS.find((bank) => bank.code === code)?.name || "Bank"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userType="freelancer" userEmail={userProfile?.email || ""} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Withdraw Funds</h1>
          <p className="text-gray-600">Transfer money to your bank account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-accent to-secondary rounded-xl shadow-lg p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Available Balance</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold">
                {userProfile?.ngnCurrency || "NGN"}{" "}
                {userProfile?.ngnBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 }) || "0.00"}
              </p>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Withdrawal Details</h2>
                <p className="text-gray-600">Enter the amount and select your bank account</p>
              </div>

              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {userProfile?.ngnCurrency || "NGN"}
                    </span>
                    <input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-20 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      You will receive: {userProfile?.ngnCurrency}{" "}
                      {parseFloat(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                {/* Bank Account Selection */}
                <div>
                  <label htmlFor="bank-account" className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account
                  </label>
                  {bankAccounts.length > 0 ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all flex items-center justify-between"
                      >
                        {selectedAccountDetails ? (
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <div>
                              <p className="font-medium text-gray-900">{selectedAccountDetails.name}</p>
                              <p className="text-sm text-gray-500">
                                {selectedAccountDetails.accountNumber} • {getBankNameFromCode(selectedAccountDetails.bankCode)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Select bank account</span>
                        )}
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isAccountDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                          {bankAccounts.map((account) => (
                            <button
                              key={account.recipientCode}
                              onClick={() => {
                                setSelectedAccount(account.recipientCode)
                                setIsAccountDropdownOpen(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                            >
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <div>
                                <p className="font-medium text-gray-900">{account.name}</p>
                                <p className="text-sm text-gray-500">
                                  {account.accountNumber} • {getBankNameFromCode(account.bankCode)}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-amber-800">
                        No bank accounts added yet. Add one to continue.
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Bank Button */}
                <button
                  onClick={() => setIsAddBankOpen(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Bank Account
                </button>

                {/* Status Messages */}
                {withdrawalStatus.type && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      withdrawalStatus.type === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {withdrawalStatus.type === "success" ? (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <p
                      className={`text-sm ${
                        withdrawalStatus.type === "success" ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {withdrawalStatus.message}
                    </p>
                  </div>
                )}

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={!selectedAccount || !amount || isWithdrawing || parseFloat(amount) <= 0}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
                >
                  {isWithdrawing ? "Processing..." : "Withdraw Funds"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            {selectedAccountDetails && amount && parseFloat(amount) > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Withdrawal Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium text-gray-900">
                      {userProfile?.ngnCurrency} {parseFloat(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee</span>
                    <span className="font-medium text-gray-900">{userProfile?.ngnCurrency} 0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>
                      {userProfile?.ngnCurrency} {parseFloat(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-gray-600 mb-2">To Account</p>
                    <p className="font-medium text-gray-900">{selectedAccountDetails.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedAccountDetails.accountNumber} • {getBankNameFromCode(selectedAccountDetails.bankCode)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Withdrawal Information</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">Withdrawals are processed within seconds </p>
                </div>
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">No withdrawal fees</p>
                </div>
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Minimum withdrawal: {userProfile?.ngnCurrency} 100.00
                  </p>
                </div>
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">All transactions are secured and encrypted</p>
                </div>
              </div>
            </div>

            {/* Saved Accounts */}
            {bankAccounts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Saved Accounts</h3>
                <div className="space-y-2">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.recipientCode}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{account.name}</p>
                        <p className="text-xs text-gray-500">{account.accountNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Bank Modal */}
      {isAddBankOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add Bank Account</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter your bank account details to add a new withdrawal method
                  </p>
                </div>
                <button
                  onClick={() => setIsAddBankOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Bank Selection */}
                <div>
                  <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
                    Bank
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                      className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all flex items-center justify-between"
                    >
                      <span className={bankForm.bankCode ? "text-gray-900" : "text-gray-500"}>
                        {selectedBankName || "Select your bank"}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isBankDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                        {NIGERIAN_BANKS.map((bank) => (
                          <button
                            key={bank.code}
                            onClick={() => {
                              setBankForm({ ...bankForm, bankCode: bank.code })
                              setIsBankDropdownOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-gray-900"
                          >
                            {bank.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    id="account-number"
                    type="text"
                    placeholder="0123456789"
                    maxLength={10}
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    id="account-name"
                    type="text"
                    placeholder="John Doe"
                    value={bankForm.accountName}
                    onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Error Message */}
                {addBankError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{addBankError}</p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAddBankOpen(false)}
                  disabled={isAddingBank}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBank}
                  disabled={isAddingBank}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isAddingBank ? "Adding..." : "Add Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}