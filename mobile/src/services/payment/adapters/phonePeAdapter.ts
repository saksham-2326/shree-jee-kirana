import { Linking } from "react-native";
import {
  PaymentGatewayAdapter,
  InitiatePaymentParams,
  InitiatePaymentResult,
  VerifyPaymentParams,
  PaymentVerificationResult,
} from "../types";
import { verifyPaymentOnServer } from "../upi/serverVerify";

/**
 * PhonePe Payment Gateway Adapter
 * Production requirements:
 * 1. PhonePe Merchant Account & MID
 * 2. Salt Key & Salt Index configured in Supabase Server Environment
 * 3. Registered Webhook endpoint for server-to-server confirmation
 */
export class PhonePeAdapter implements PaymentGatewayAdapter {
  id = "phonepe_pg" as const;
  displayName = "PhonePe UPI Gateway";
  isMock = false;

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    try {
      // In production, the backend generates the base64 encoded PhonePe PG request payload & checksum
      // and returns the instrumentResponse.intentUrl to launch PhonePe directly.
      const intentUrl = `phonepe://pay?pa=${params.merchantVpa}&pn=${encodeURIComponent(
        params.merchantName
      )}&am=${params.amount}&tr=${params.transactionRef}&cu=INR`;

      const canOpen = await Linking.canOpenURL(intentUrl);
      if (canOpen) {
        await Linking.openURL(intentUrl);
        return {
          success: true,
          transactionRef: params.transactionRef,
          deepLinkUrl: intentUrl,
          requiresAppHandoff: true,
        };
      }

      return {
        success: false,
        transactionRef: params.transactionRef,
        requiresAppHandoff: false,
        error: "PhonePe application is not installed on this device.",
      };
    } catch (err: any) {
      return {
        success: false,
        transactionRef: params.transactionRef,
        requiresAppHandoff: false,
        error: err.message,
      };
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    return await verifyPaymentOnServer(
      params.orderId,
      params.transactionRef,
      "phonepe",
      params.rawGatewayResponse
    );
  }
}
