import { supabase } from "../../supabase/client";
import { PaymentVerificationResult } from "../types";

/**
 * Communicates with the backend (Supabase Edge Function or RPC) to verify payment authenticity.
 * CRITICAL RULE: Client never decides payment status. Backend must verify.
 */
export async function verifyPaymentOnServer(
  orderId: string,
  transactionRef: string,
  gateway: string,
  rawGatewayResponse: any = {}
): Promise<PaymentVerificationResult> {
  try {
    // 1. First attempt to call the Supabase Edge Function `verify-payment`
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke("verify-payment", {
      body: {
        order_id: orderId,
        transaction_ref: transactionRef,
        gateway: gateway,
        raw_response: rawGatewayResponse,
        status: rawGatewayResponse?.status || "success",
      },
    });

    if (!edgeError && edgeData) {
      return {
        isVerified: edgeData.payment_status === "paid",
        paymentStatus: edgeData.payment_status || "failed",
        orderStatus: edgeData.order_status || "pending",
        transactionRef,
        gatewayMessage: edgeData.message,
      };
    }

    // 2. Fallback to direct Postgres RPC `verify_and_complete_payment`
    const isSuccess = rawGatewayResponse?.status !== "failed";
    const { data: rpcData, error: rpcError } = await supabase.rpc("verify_and_complete_payment", {
      p_order_id: orderId,
      p_transaction_ref: transactionRef,
      p_gateway: gateway,
      p_raw_response: rawGatewayResponse,
      p_is_success: isSuccess,
    });

    if (rpcError) {
      return {
        isVerified: false,
        paymentStatus: "failed",
        orderStatus: "pending",
        transactionRef,
        error: rpcError.message,
      };
    }

    return {
      isVerified: rpcData.payment_status === "paid",
      paymentStatus: rpcData.payment_status || "failed",
      orderStatus: rpcData.order_status || "pending",
      transactionRef,
    };
  } catch (err: any) {
    return {
      isVerified: false,
      paymentStatus: "failed",
      orderStatus: "pending",
      transactionRef,
      error: err.message || "Failed to reach backend payment verification server",
    };
  }
}
