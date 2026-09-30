import { Linking } from "react-native";
import {
  PaymentGatewayAdapter,
  InitiatePaymentParams,
  InitiatePaymentResult,
  VerifyPaymentParams,
  PaymentVerificationResult,
} from "../types";
import { buildUPIPaymentUri } from "../upi/upiIntent";
import { verifyPaymentOnServer } from "../upi/serverVerify";

export class UpiIntentAdapter implements PaymentGatewayAdapter {
  id = "upi_intent" as const;
  displayName = "UPI (Google Pay, PhonePe, Paytm, BHIM)";
  isMock = false;

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    try {
      const uri = buildUPIPaymentUri({
        payeeVpa: params.merchantVpa,
        payeeName: params.merchantName,
        transactionRef: params.transactionRef,
        transactionNote: `Order ${params.orderNumber} - Shree Jee Kirana`,
        amount: params.amount,
        selectedApp: params.selectedUpiApp,
      });

      const canOpen = await Linking.canOpenURL(uri);
      if (!canOpen) {
        return {
          success: false,
          transactionRef: params.transactionRef,
          requiresAppHandoff: false,
          error: "No compatible UPI app found. Please install Google Pay, PhonePe, Paytm or BHIM.",
        };
      }

      // Launch UPI App
      await Linking.openURL(uri);

      return {
        success: true,
        transactionRef: params.transactionRef,
        deepLinkUrl: uri,
        requiresAppHandoff: true,
      };
    } catch (err: any) {
      return {
        success: false,
        transactionRef: params.transactionRef,
        requiresAppHandoff: false,
        error: err.message || "Failed to launch UPI application.",
      };
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    // Delegates verification to backend
    return await verifyPaymentOnServer(
      params.orderId,
      params.transactionRef,
      "upi_intent",
      params.rawGatewayResponse
    );
  }
}
