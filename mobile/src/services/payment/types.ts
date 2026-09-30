export type SupportedUpiAppId = "google_pay" | "phonepe" | "paytm" | "bhim" | "generic_upi";

export interface UPIAppInfo {
  id: SupportedUpiAppId;
  name: string;
  packageNameAndroid: string;
  schemeIOS: string;
  iconName: string;
  isInstalled?: boolean;
}

export type PaymentGatewayType = "upi_intent" | "phonepe_pg" | "mock_sandbox";

export interface InitiatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  merchantVpa: string;
  merchantName: string;
  transactionRef: string;
  selectedUpiApp?: SupportedUpiAppId;
}

export interface InitiatePaymentResult {
  success: boolean;
  transactionRef: string;
  deepLinkUrl?: string;
  requiresAppHandoff: boolean;
  error?: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  transactionRef: string;
  rawGatewayResponse?: any;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  paymentStatus: "paid" | "failed" | "pending";
  orderStatus: "confirmed" | "pending" | "failed";
  transactionRef: string;
  gatewayMessage?: string;
  error?: string;
}

export interface PaymentGatewayAdapter {
  id: PaymentGatewayType;
  displayName: string;
  isMock: boolean;
  initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult>;
}
