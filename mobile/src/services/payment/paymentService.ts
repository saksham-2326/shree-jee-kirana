import {
  PaymentGatewayAdapter,
  PaymentGatewayType,
  InitiatePaymentParams,
  InitiatePaymentResult,
  VerifyPaymentParams,
  PaymentVerificationResult,
  UPIAppInfo,
  SupportedUpiAppId,
} from "./types";
import { UpiIntentAdapter } from "./adapters/upiIntentAdapter";
import { PhonePeAdapter } from "./adapters/phonePeAdapter";
import { MockSandboxAdapter } from "./adapters/mockAdapter";
import { detectInstalledUPIApps } from "./upi/upiApps";

class PaymentService {
  private adapters: Map<PaymentGatewayType, PaymentGatewayAdapter> = new Map();
  private currentAdapterType: PaymentGatewayType = "upi_intent";

  constructor() {
    this.registerAdapter(new UpiIntentAdapter());
    this.registerAdapter(new PhonePeAdapter());
    this.registerAdapter(new MockSandboxAdapter());
  }

  public registerAdapter(adapter: PaymentGatewayAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public setGateway(type: PaymentGatewayType): void {
    if (!this.adapters.has(type)) {
      throw new Error(`Payment gateway '${type}' is not registered.`);
    }
    this.currentAdapterType = type;
  }

  public getActiveGateway(): PaymentGatewayAdapter {
    const adapter = this.adapters.get(this.currentAdapterType);
    if (!adapter) {
      return this.adapters.get("upi_intent")!;
    }
    return adapter;
  }

  public async getAvailableUPIApps(): Promise<UPIAppInfo[]> {
    return await detectInstalledUPIApps();
  }

  /**
   * Initiates the UPI Payment flow using the active gateway adapter.
   */
  public async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const adapter = this.getActiveGateway();
    return await adapter.initiatePayment(params);
  }

  /**
   * Verifies the UPI transaction with the backend.
   * Never marks payment as successful without backend verification confirmation.
   */
  public async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    const adapter = this.getActiveGateway();
    return await adapter.verifyPayment(params);
  }
}

export const paymentService = new PaymentService();
