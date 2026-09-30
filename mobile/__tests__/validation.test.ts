import {
  loginSchema,
  signupSchema,
  addressSchema,
} from "../src/utils/validation";

describe("Validation Schemas (Zod)", () => {
  describe("loginSchema", () => {
    test("validates proper email and password", () => {
      const valid = loginSchema.safeParse({
        email: "customer@gmail.com",
        password: "secretpassword123",
      });
      expect(valid.success).toBe(true);
    });

    test("rejects invalid email or short password", () => {
      const invalid = loginSchema.safeParse({
        email: "not-an-email",
        password: "123",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    test("accepts valid Indian phone number and matching passwords", () => {
      const valid = signupSchema.safeParse({
        fullName: "Aarav Sharma",
        email: "aarav@gmail.com",
        phone: "9876543210",
        password: "securepassword",
        confirmPassword: "securepassword",
      });
      expect(valid.success).toBe(true);
    });

    test("rejects invalid Indian mobile number or password mismatch", () => {
      const invalidPhone = signupSchema.safeParse({
        fullName: "Aarav",
        email: "aarav@gmail.com",
        phone: "12345", // invalid
        password: "securepassword",
        confirmPassword: "securepassword",
      });
      expect(invalidPhone.success).toBe(false);

      const mismatchedPass = signupSchema.safeParse({
        fullName: "Aarav",
        email: "aarav@gmail.com",
        phone: "9876543210",
        password: "passwordA",
        confirmPassword: "passwordB",
      });
      expect(mismatchedPass.success).toBe(false);
    });
  });

  describe("addressSchema", () => {
    test("validates complete address and 6-digit Indian PIN code", () => {
      const valid = addressSchema.safeParse({
        fullName: "Suresh Gupta",
        phone: "9826012345",
        houseBuilding: "House No 42",
        streetArea: "Kothariya Road",
        city: "Nathdwara",
        state: "Rajasthan",
        pincode: "313301",
        isDefault: true,
      });
      expect(valid.success).toBe(true);
    });

    test("rejects invalid PIN code format", () => {
      const invalidPin = addressSchema.safeParse({
        fullName: "Suresh Gupta",
        phone: "9826012345",
        houseBuilding: "House No 42",
        streetArea: "Kothariya Road",
        city: "Nathdwara",
        state: "Rajasthan",
        pincode: "01234", // invalid PIN format
        isDefault: false,
      });
      expect(invalidPin.success).toBe(false);
    });
  });
});
