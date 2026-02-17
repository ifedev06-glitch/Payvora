// src/app/lib/api.ts
import axios from "axios";
import { BACKEND_BASE_URL, LOGIN_API, REGISTER_API } from "@/lib/constatnt";
import { getToken } from "./auth";

// ---------- Axios instance ----------
const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000,
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("[Axios Request] token:", token);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("[Axios Request] header about to be set:", config.headers?.["Authorization"]);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------- Auth Interfaces ----------
export interface LoginRequest { 
  email: string; 
  password: string; 
}

export interface LoginResponse {  
  success: boolean;
  message: string;
  token: string; 
}

export interface RegisterRequest {
  firstName: string       
  middleName?: string | null 
  surname: string         
  email: string           
  gender: string           
  phoneNumber: string      
  password: string
  businessName:string

}


export interface SignupResponse { 
 id: number;
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  message: string;
}

export interface UserInfo { 
  id: number; 
  name: string; 
  email: string; 
  balance: number; 
}

export interface UserProfileResponse {
  email: string;
  userName: string;     
  firstName: string;
  surname: string;
  usdBalance: number;    
  usdCurrency: string;
  ngnBalance: number;
  ngnCurrency: string;
  usdProcessingBalance: number;
}

export interface FlutterwaveDepositRequest {
  amount: number;
}

export interface FlutterwaveDepositResponse {
  checkoutUrl: string; 
  message?: string;    
}

// ---------- Auth Functions ----------
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(LOGIN_API, credentials);
  return response.data;
}

// ---------- Auth Functions ----------
export async function signupUser(credentials: RegisterRequest): Promise<SignupResponse> {
  const response = await apiClient.post<SignupResponse>(REGISTER_API, credentials);
  return response.data;
}


export async function getProfile(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileResponse>("/user/profile");
  return response.data;
}

// ---------- Flutterwave Function ----------
export async function initializeFlutterwavePayment(
  request: FlutterwaveDepositRequest
): Promise<FlutterwaveDepositResponse> {
  const response = await apiClient.post<FlutterwaveDepositResponse>(
    "/payments/flutterwave",
    request
  );
  return response.data;
}

// ---------- Transfer Interfaces ----------
export interface TransferRequest {
  receiverUsername: string;
  amount: number;
}

export interface TransferResponse {
  senderEmail: string;
  receiverEmail: string;
  amountSent: number;      // in sender currency
  amountReceived: number;  // in receiver currency
  receiverCurrency: string;
  message: string;
}

// ---------- Transfer Function ----------
export async function transferToUser(request: TransferRequest): Promise<TransferResponse> {
  const response = await apiClient.post<TransferResponse>("/payments/transfer", request);
  return response.data;
}

// // ---------- Paystack Interfaces ----------
// export interface RecipientRequest {
//   type: string;           // e.g., "nuban" for Nigerian bank accounts
//   name: string;           // Account holder name
//   accountNumber: string;
//   bankCode: string;       // Paystack bank code
//   currency: string;       // e.g., "NGN"
//   description?: string;
// }

// export interface PaystackRecipientResponse {
//   status: boolean;
//   message: string;
//   data: {
//     name: string;
//     currency: string;

//     details: {
//       account_number: string;
//       bank_code: string;
//     };

//     recipient_code: string;
//   };
// }

// export interface Withdrawal {
//   id: number;
//   amount: number;
//   recipientCode: string;
//   status: string;
//   reference: string;
//   transferCode?: string;
//   createdAt?: string;
//   message?: string;
// }

// // ---------- Paystack Functions ----------

// export async function createRecipient(
//   request: RecipientRequest
// ): Promise<PaystackRecipientResponse> {
//   const response = await apiClient.post<PaystackRecipientResponse>("/paystack/add", request);
//   return response.data;
// }


// export async function initiateWithdrawal(
//   recipientCode: string,
//   amount: number
// ): Promise<Withdrawal> {
//   const response = await apiClient.post<Withdrawal>(
//     "/paystack/withdraw",
//     null,
//     {
//       params: { recipientCode, amount }
//     }
//   );
//   return response.data;
// }


// //--------------Bank aCCOUNTS-----------//

// // ---------- Bank Account (Paystack Recipient) Response ----------
// export interface BankAccountResponse {
//   recipientCode: string;
//   name: string;
//   accountNumber: string;
//   bankCode: string;
//   currency: string;
// }

// export async function getMyBankAccounts(): Promise<BankAccountResponse[]> {
//   const response = await apiClient.get<BankAccountResponse[]>(
//     "/paystack/recipients/my-accounts"
//   );
//   return response.data;
// }


//---------withdrawal history---------------//

export interface WithdrawalHistory {
  amount: number;
  status: string;  
  dateCreated: string;
}

export async function getWithdrawalHistory(): Promise<WithdrawalHistory[]> {
  const response = await apiClient.get<WithdrawalHistory[]>("/payments/history");
  return response.data;
}

export interface CreatePaymentLinkRequest {
  amount: number  // Will be converted to BigDecimal on backend
}

export interface CreatePaymentLinkResponse {
  linkId: string
  paymentUrl: string
  amount: number
  currency: string
  description: string
  status: string
  fee: number
  total: number
}

export async function createPaymentLink(
  request: CreatePaymentLinkRequest
): Promise<CreatePaymentLinkResponse> {
  const response = await apiClient.post<CreatePaymentLinkResponse>(
    "/link/create",
    request
  )
  return response.data
}

// Add these to your api.ts (if not already there)

export interface PublicPaymentDetailsResponse {
  linkId: string
  freelancerName: string
  amount: number
  currency: string
  description: string
  status: string
  fee: number
  total: number
}

export interface InitializeFlutterwaveResponse {
  checkoutUrl: string
}

// Get public payment details (no auth required)
export async function getPublicPaymentDetails(
  linkId: string
): Promise<PublicPaymentDetailsResponse> {
  const response = await apiClient.get<PublicPaymentDetailsResponse>(
    `/public-link/${linkId}`
  )
  return response.data
}

// Initialize payment (no auth required)
export interface InitializeFlutterwaveResponse {
  checkoutUrl: string
}

export async function initializePayment(linkId: string): Promise<InitializeFlutterwaveResponse> {
  const response = await apiClient.post<InitializeFlutterwaveResponse>(
    `/public-link/${linkId}/initialize`
  );
  return response.data;
}

// Add these interfaces after your existing interfaces
export interface ConvertUsdToNgnRequest {
  usdAmount: number;
}

export interface ConversionResponse {
  usdWalletBalance: number;
  ngnWalletBalance: number;
  usdConverted: number;
  ngnReceived: number;
  conversionRate: number;
  conversionFee: number,
  message: string;
}

export async function convertUsdToNgn(
  usdAmount: number
): Promise<ConversionResponse> {
  const response = await apiClient.post<ConversionResponse>(
    "/payments/convert-usd-to-ngn",
    null,
    {
      params: { usdAmount }
    }
  );
  return response.data;
}

export async function getExchangeRate(): Promise<number> {
  const response = await apiClient.get<number>("/payments/rate");
  return response.data;
}

// ---------- Flutterwave Beneficiary Interfaces ----------
export interface RecipientRequest {
  account_number: string;
  account_bank: string;
  beneficiary_name?: string; // Optional - Flutterwave fetches it
}

export interface BeneficiaryData {
  id: number;
  accountNumber: string;
  bankCode: string;
  fullName: string;
  createdAt: string;
  bankName: string;
}

export interface FlutterwaveBeneficiaryResponse {
  status: string;
  message: string;
  data: BeneficiaryData;
}

export interface Withdrawal {
  id: number;
  amount: number;
  recipientCode: string; // This comes from your backend as String
  status: string;
  reference: string;
  transferCode?: string;
  createdAt?: string;
  message?: string;
}

// ---------- Flutterwave Functions ----------

export async function createRecipient(
  request: RecipientRequest
): Promise<FlutterwaveBeneficiaryResponse> {
  const response = await apiClient.post<FlutterwaveBeneficiaryResponse>(
    "/paystack/add", // Your backend endpoint
    request
  );
  return response.data;
}

export async function initiateWithdrawal(
  recipientCode: string,
  amount: number
): Promise<Withdrawal> {
  const response = await apiClient.post<Withdrawal>(
    "/paystack/withdraw",
    {
      recipientCode, 
      amount
    }

  );
  return response.data;
}

//--------------Bank ACCOUNTS (Flutterwave)-----------//

export interface BankAccountResponse {
  recipientCode: string; // String to match your backend
  name: string;
  accountNumber: string;
  bankCode: string;
  currency: string;
}

export async function getMyBankAccounts(): Promise<BankAccountResponse[]> {
  const response = await apiClient.get<BankAccountResponse[]>(
    "/paystack/recipients/my-accounts" // Your backend endpoint
  );
  return response.data;
}

// ---------- Transaction Interfaces ----------
export type TransactionType = 
  | "DEPOSIT" 
  | "WITHDRAWAL" 
  | "CONVERSION" 
  | "TRANSFER_SENT"
  | "TRANSFER_RECEIVED"
  | "REFUND"
  | "FEE";

export interface TransactionResponse {
  id: number;
  amount: number;
  currency: string;
  type: TransactionType;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  description?: string;
  reference?: string;
  createdAt: string;
  completedAt?: string;
  availableAt?: string;
  
  // Conversion-specific fields
  convertedAmount?: number;
  convertedCurrency?: string;
  exchangeRate?: number;
  
  // Withdrawal-specific fields
  recipientAccountNumber?: string;
  recipientBankName?: string;
  recipientName?: string;
  
  // Transfer-specific fields
  paystackTransferCode?: string;
  
  failureReason?: string;
  fee?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ---------- Transaction Functions ----------

// Get all transactions
export async function getAllTransactions(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history");
  return response.data;
}

// Get paginated transactions
export async function getTransactionsPaginated(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<TransactionResponse>> {
  const response = await apiClient.get<PaginatedResponse<TransactionResponse>>(
    "/history/paginated",
    {
      params: { page, size }
    }
  );
  return response.data;
}

// Get transactions by type
export async function getTransactionsByType(
  type: TransactionType
): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>(
    `/history/type/${type}`
  );
  return response.data;
}

// Get transactions by date range
export async function getTransactionsByDateRange(
  startDate: string, // ISO format: "2024-01-01T00:00:00"
  endDate: string    // ISO format: "2024-12-31T23:59:59"
): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>(
    "/history/date-range",
    {
      params: { startDate, endDate }
    }
  );
  return response.data;
}

// Get transactions by currency
export async function getTransactionsByCurrency(
  currency: string
): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>(
    `/history/currency/${currency}`
  );
  return response.data;
}

// Get deposits only
export async function getDeposits(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history/deposits");
  return response.data;
}

// Get withdrawals only
export async function getWithdrawals(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history/withdrawals");
  return response.data;
}

// Get conversions only
export async function getConversions(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history/conversions");
  return response.data;
}

// Get sent transfers
export async function getSentTransfers(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history/type/TRANSFER_SENT");
  return response.data;
}

// Get received transfers
export async function getReceivedTransfers(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history/type/TRANSFER_RECEIVED");
  return response.data;
}

// Get refunds
export async function getRefunds(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history/type/REFUND");
  return response.data;
}

// Get fees
export async function getFees(): Promise<TransactionResponse[]> {
  const response = await apiClient.get<TransactionResponse[]>("/history/type/FEE");
  return response.data;
}



export default apiClient;