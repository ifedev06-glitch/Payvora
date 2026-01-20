// lib/public.ts
import axios from "axios";
import { BACKEND_BASE_URL } from "@/lib/constatnt";

// Public client - NO auth token
const publicApiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000,
});

// Interfaces
export interface PublicPaymentDetailsResponse {
  linkId: string;
  freelancerName: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  fee: number;
  total: number;
}

export interface InitializeFlutterwaveResponse {
  checkoutUrl: string;
}

// Get public payment details (no auth required)
export async function getPublicPaymentDetails(
  linkId: string
): Promise<PublicPaymentDetailsResponse> {
  const response = await publicApiClient.get<PublicPaymentDetailsResponse>(
    `/public-link/${linkId}`
  );
  return response.data;
}

// Initialize payment (no auth required)
export async function initializePayment(
  linkId: string
): Promise<InitializeFlutterwaveResponse> {
  const response = await publicApiClient.post<InitializeFlutterwaveResponse>(
    `/public-link/${linkId}/initialize`
  );
  return response.data;
}