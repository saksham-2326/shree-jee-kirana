import { buildUPIPaymentUri } from "../src/services/payment/upi/upiIntent";
import { paymentService } from "../src/services/payment/paymentService";

describe("UPI Payment Architecture (Zero Razorpay)", () => {
  test("generates NPCI-compliant UPI URI with encoded parameters", () => {
    const uri = buildUPIPaymentUri({
      payeeVpa: "shreejeekirana@upi",
      payeeName: "Shree Jee Kirana Store",
      transactionRef: "SJKTXN123456789",
      transactionNote: "Order SJK-20260927-ABC123",
      amount: 450.5,
      merchantCode: "5411",
    });

    expect(uri.startsWith("upi://pay?")).toBe(true);
    expect(uri).toContain("pa=shreejeekirana%40upi");
    expect(uri).toContain("am=450.50");
    expect(uri).toContain("cu=INR");
    expect(uri).toContain("mc=5411");
    expect(uri).toContain("tr=SJKTXN123456789");
  });

  test("throws error when payee VPA or invalid amount is provided", () => {
    expect(() =>
      buildUPIPaymentUri({
        payeeVpa: "",
        payeeName: "Shree Jee Kirana",
        transactionRef: "TXN123",
        transactionNote: "Note",
        amount: 100,
      })
    ).toThrow("Payee VPA is required");

    expect(() =>
      buildUPIPaymentUri({
        payeeVpa: "merchant@upi",
        payeeName: "Shree Jee Kirana",
        transactionRef: "TXN123",
        transactionNote: "Note",
        amount: 0, // non-positive amount
      })
    ).toThrow("Amount must be greater than 0");
  });

  test("payment service provides active UPI intent gateway adapter", () => {
    paymentService.setGateway("upi_intent");
    const active = paymentService.getActiveGateway();

    expect(active.id).toBe("upi_intent");
    expect(active.isMock).toBe(false);
  });

  test("isolated mock sandbox adapter is accessible for development mode", () => {
    paymentService.setGateway("mock_sandbox");
    const mock = paymentService.getActiveGateway();

    expect(mock.id).toBe("mock_sandbox");
    expect(mock.isMock).toBe(true);
  });
});
