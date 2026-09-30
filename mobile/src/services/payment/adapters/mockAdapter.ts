import {
  PaymentGatewayAdapter,
  InitiatePaymentParams,
  InitiatePaymentResult,
  VerifyPaymentParams,
  PaymentVerificationResult,
} from "../types";
import { verifyPaymentOnServer } from "../upi/serverVerify";

/**
 * STRICTLY SEPARATED DEVELOPMENT SANDBOX SIMULATOR
 * Used for testing the complete end-to-end checkout & stock deduction lifecycle
 * when running in emulator/simulator without physical UPI apps installed.
 * Never confused with production payments.
 */
export class MockSandboxAdapter implements PaymentGatewayAdapter {
  id = "mock_sandbox" as const;
  displayName = "Sandbox UPI Simulator (Dev Only)";
  isMock = true;

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    // Simulates payment initiation with a unique transaction reference
    return {
      success: true,
      transactionRef: params.transactionRef,
      deepLinkUrl: `mock://upi/pay?tr=${params.transactionRef}&am=${params.amount}`,
      requiresAppHandoff: false,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    // Sends verification request to server with dev flag
    return await verifyPaymentOnServer(
      params.orderId,
      params.transactionRef,
      "mock_sandbox",
      {
        status: "success",
        sandbox: true,
        vpa: "sandbox@upi",
      }
    );
  }
}
