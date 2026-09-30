import { Platform } from "react-native";
import { SupportedUpiAppId } from "../types";

export interface BuildUPIUriParams {
  payeeVpa: string;
  payeeName: string;
  transactionRef: string;
  transactionNote: string;
  amount: number;
  merchantCode?: string;
  selectedApp?: SupportedUpiAppId;
}

/**
 * Builds an NPCI-compliant UPI URI with proper parameter encoding.
 * Standard format: upi://pay?pa=...&pn=...&mc=...&tr=...&tn=...&am=...&cu=INR
 */
export function buildUPIPaymentUri(params: BuildUPIUriParams): string {
  const {
    payeeVpa,
    payeeName,
    transactionRef,
    transactionNote,
    amount,
    merchantCode = "5411", // Default MCC for grocery stores
    selectedApp = "generic_upi",
  } = params;

  if (!payeeVpa) throw new Error("Payee VPA is required for UPI payment");
  if (!amount || amount <= 0) throw new Error("Amount must be greater than 0");
  if (!transactionRef) throw new Error("Transaction reference is required");

  // Format amount to exact 2 decimal places
  const formattedAmount = amount.toFixed(2);

  const queryParams = new URLSearchParams();
  queryParams.append("pa", payeeVpa);
  queryParams.append("pn", payeeName);
  queryParams.append("mc", merchantCode);
  queryParams.append("tr", transactionRef);
  queryParams.append("tn", transactionNote);
  queryParams.append("am", formattedAmount);
  queryParams.append("cu", "INR");
  queryParams.append("url", "shreejeekirana://payment-callback");

  const queryString = queryParams.toString();

  // App-specific scheme routing for iOS and explicit Android targeting
  if (Platform.OS === "ios") {
    switch (selectedApp) {
      case "google_pay":
        return `tez://upi/pay?${queryString}`;
      case "phonepe":
        return `phonepe://pay?${queryString}`;
      case "paytm":
        return `paytmmp://pay?${queryString}`;
      case "bhim":
        return `bhim://pay?${queryString}`;
      default:
        return `upi://pay?${queryString}`;
    }
  }

  // On Android, standard `upi://pay` activates the Android Intent Chooser
  return `upi://pay?${queryString}`;
}
