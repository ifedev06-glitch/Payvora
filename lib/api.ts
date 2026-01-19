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

// ---------- Paystack Interfaces ----------
export interface RecipientRequest {
  type: string;           // e.g., "nuban" for Nigerian bank accounts
  name: string;           // Account holder name
  accountNumber: string;
  bankCode: string;       // Paystack bank code
  currency: string;       // e.g., "NGN"
  description?: string;
}

export interface PaystackRecipientResponse {
  status: boolean;
  message: string;
  data: {
    name: string;
    currency: string;

    details: {
      account_number: string;
      bank_code: string;
    };

    recipient_code: string;
  };
}

export interface Withdrawal {
  id: number;
  amount: number;
  recipientCode: string;
  status: string;
  reference: string;
  transferCode?: string;
  createdAt?: string;
  message?: string;
}

// ---------- Paystack Functions ----------

export async function createRecipient(
  request: RecipientRequest
): Promise<PaystackRecipientResponse> {
  const response = await apiClient.post<PaystackRecipientResponse>("/paystack/add", request);
  return response.data;
}


export async function initiateWithdrawal(
  recipientCode: string,
  amount: number
): Promise<Withdrawal> {
  const response = await apiClient.post<Withdrawal>(
    "/paystack/withdraw",
    null,
    {
      params: { recipientCode, amount }
    }
  );
  return response.data;
}


//--------------Bank aCCOUNTS-----------//

// ---------- Bank Account (Paystack Recipient) Response ----------
export interface BankAccountResponse {
  recipientCode: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  currency: string;
}

export async function getMyBankAccounts(): Promise<BankAccountResponse[]> {
  const response = await apiClient.get<BankAccountResponse[]>(
    "/paystack/recipients/my-accounts"
  );
  return response.data;
}


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



export default apiClient;