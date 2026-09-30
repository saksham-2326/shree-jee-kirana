import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { formatCurrency } from "../../utils/formatters";
import { useCartStore } from "../../store/cartStore";
import { useAddressStore } from "../../store/addressStore";
import { useAuthStore } from "../../store/authStore";
import { storeService } from "../../services/supabase/notificationService";
import { addressService } from "../../services/supabase/addressService";
import { orderService } from "../../services/supabase/orderService";
import { paymentService } from "../../services/payment/paymentService";
import { SupportedUpiAppId, UPIAppInfo } from "../../services/payment/types";
import { StoreSettings } from "../../types/models";
import { Button } from "../../components/Button";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Checkout">;
};

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const { items, clearCart, getSubtotal, getDiscountSavings, getDeliveryFee, getFinalTotal } =
    useCartStore();
  const { profile } = useAuthStore();
  const { addresses, selectedAddressId, setAddresses, getSelectedAddress } = useAddressStore();

  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "cod" | "pay_at_store">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<SupportedUpiAppId>("generic_upi");
  const [availableUpiApps, setAvailableUpiApps] = useState<UPIAppInfo[]>([]);

  // Processing & Payment verification state
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<any | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verifying" | "failed">("pending");

  useEffect(() => {
    async function loadInitial() {
      try {
        const [settings, addrs, upiApps] = await Promise.all([
          storeService.getStoreSettings(),
          addressService.getAddresses(),
          paymentService.getAvailableUPIApps(),
        ]);
        setStoreSettings(settings);
        setAddresses(addrs);
        setAvailableUpiApps(upiApps);
      } catch (e) {
        console.error("Checkout init error:", e);
      }
    }
    loadInitial();
  }, []);

  const selectedAddress = getSelectedAddress();
  const subtotal = getSubtotal();
  const discountSavings = getDiscountSavings();
  const freeThreshold = storeSettings?.free_delivery_threshold || 499;
  const standardFee = storeSettings?.delivery_fee || 30;
  const deliveryFee = selectedMethod === "pay_at_store" ? 0 : getDeliveryFee(freeThreshold, standardFee);
  const totalAmount = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert(
        "Address Required",
        "Please select or add a delivery address to place your order.",
        [{ text: "Select Address", onPress: () => navigation.navigate("AddressSelect") }]
      );
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create verified order on the backend
      // Backend validates inventory stock and prices atomically
      const orderPayload = {
        addressId: selectedAddress.id,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        paymentMethod: selectedMethod,
        notes: selectedAddress.delivery_instructions || undefined,
      };

      const result = await orderService.createVerifiedOrder(orderPayload);
      if (!result?.success) {
        throw new Error(result?.error || "Failed to create order on server.");
      }

      // 2. Handle Payment Flow
      if (selectedMethod === "cod" || selectedMethod === "pay_at_store") {
        // COD / Pay at Store is confirmed immediately by backend
        clearCart();
        setIsProcessing(false);
        navigation.replace("OrderTracking", { orderId: result.order_id });
        return;
      }

      // 3. UPI PAYMENT FLOW (Strictly No Razorpay)
      setVerifyingOrder(result);
      setVerificationStatus("pending");

      const upiResult = await paymentService.initiatePayment({
        orderId: result.order_id,
        orderNumber: result.order_number,
        amount: Number(result.total_amount),
        customerName: profile?.full_name || selectedAddress.full_name,
        customerPhone: profile?.phone || selectedAddress.phone,
        merchantVpa: result.upi_vpa || storeSettings?.upi_vpa || "shreejeekirana@upi",
        merchantName: result.upi_merchant_name || storeSettings?.upi_merchant_name || "Shree Jee Kirana",
        transactionRef: result.upi_transaction_ref,
        selectedUpiApp: selectedUpiApp,
      });

      if (!upiResult.success && !upiResult.requiresAppHandoff) {
        throw new Error(upiResult.error || "Could not launch UPI application.");
      }

      // Keep verification modal open so user can confirm after returning from GPay/PhonePe
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      Alert.alert("Checkout Error", err.message || "Failed to process checkout. Please try again.");
    }
  };

  /**
   * User returns from UPI app (or taps 'I Have Completed Payment')
   * Backend verifies transaction before marking paid.
   */
  const handleVerifyUpiPayment = async () => {
    if (!verifyingOrder) return;
    setVerificationStatus("verifying");

    try {
      const verifyResult = await paymentService.verifyPayment({
        orderId: verifyingOrder.order_id,
        transactionRef: verifyingOrder.upi_transaction_ref,
        rawGatewayResponse: {
          vpa: verifyingOrder.upi_vpa,
          status: "success",
        },
      });

      if (verifyResult.isVerified && verifyResult.paymentStatus === "paid") {
        clearCart();
        setVerifyingOrder(null);
        navigation.replace("OrderTracking", { orderId: verifyingOrder.order_id });
      } else {
        setVerificationStatus("failed");
        Alert.alert(
          "Payment Verification Pending",
          "We have not yet received payment confirmation from the bank. If money was deducted, it will be automatically confirmed shortly, or you can retry.",
          [{ text: "OK" }]
        );
      }
    } catch (e: any) {
      setVerificationStatus("failed");
      Alert.alert("Verification Error", e.message || "Could not verify payment with backend.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📍 Delivery Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AddressSelect")}>
              <Text style={styles.changeLink}>
                {selectedAddress ? "Change" : "Add Address"}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressBox}>
              <Text style={styles.addressName}>{selectedAddress.full_name}</Text>
              <Text style={styles.addressPhone}>📞 {selectedAddress.phone}</Text>
              <Text style={styles.addressDetails}>
                {selectedAddress.house_building}, {selectedAddress.street_area}
                {selectedAddress.landmark ? `, Near ${selectedAddress.landmark}` : ""}
              </Text>
              <Text style={styles.addressCity}>
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("AddEditAddress", {})}
              style={styles.noAddressBox}
            >
              <Text style={styles.noAddressText}>+ Add New Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Select Payment Method</Text>

          {/* UPI Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedMethod("upi")}
            style={[
              styles.methodOption,
              selectedMethod === "upi" && styles.methodOptionSelected,
            ]}
          >
            <View style={styles.radioRow}>
              <View
                style={[
                  styles.radioOuter,
                  selectedMethod === "upi" && styles.radioOuterSelected,
                ]}
              >
                {selectedMethod === "upi" && <View style={styles.radioInner} />}
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>UPI Payment</Text>
                  <View style={styles.recommendedPill}>
                    <Text style={styles.recommendedText}>FASTEST</Text>
                  </View>
                </View>
                <Text style={styles.methodSub}>
                  Google Pay, PhonePe, Paytm, BHIM or any UPI app
                </Text>
              </View>
            </View>

            {/* UPI App Selection Grid */}
            {selectedMethod === "upi" && (
              <View style={styles.upiAppsContainer}>
                <Text style={styles.upiAppsLabel}>Select Preferred UPI Application:</Text>
                <View style={styles.upiAppsGrid}>
                  {availableUpiApps.map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      onPress={() => setSelectedUpiApp(app.id)}
                      style={[
                        styles.upiAppChip,
                        selectedUpiApp === app.id && styles.upiAppChipSelected,
                      ]}
                    >
                      <Text style={styles.upiAppEmoji}>
                        {app.id === "google_pay"
                          ? "🔵"
                          : app.id === "phonepe"
                          ? "🟣"
                          : app.id === "paytm"
                          ? "🔷"
                          : app.id === "bhim"
                          ? "🇮🇳"
                          : "⚡"}
                      </Text>
                      <Text
                        style={[
                          styles.upiAppName,
                          selectedUpiApp === app.id && styles.upiAppNameSelected,
                        ]}
                      >
                        {app.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Optional: Cash on Delivery (if enabled by store) */}
          {storeSettings?.cod_enabled && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedMethod("cod")}
              style={[
                styles.methodOption,
                selectedMethod === "cod" && styles.methodOptionSelected,
              ]}
            >
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedMethod === "cod" && styles.radioOuterSelected,
                  ]}
                >
                  {selectedMethod === "cod" && <View style={styles.radioInner} />}
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Cash on Delivery (COD)</Text>
                  <Text style={styles.methodSub}>Pay cash to delivery partner at doorstep</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Optional: Pay & Collect at Store */}
          {storeSettings?.pay_at_store_enabled && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedMethod("pay_at_store")}
              style={[
                styles.methodOption,
                selectedMethod === "pay_at_store" && styles.methodOptionSelected,
              ]}
            >
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedMethod === "pay_at_store" && styles.radioOuterSelected,
                  ]}
                >
                  {selectedMethod === "pay_at_store" && <View style={styles.radioInner} />}
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Pay & Collect at Store</Text>
                  <Text style={styles.methodSub}>Pre-packed pickup from Main Bazaar store</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items Snapshot */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Items in Order ({items.length})</Text>
          <View style={styles.itemsSummaryList}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.itemSummaryRow}>
                <Text style={styles.itemSummaryName} numberOfLines={1}>
                  {item.quantity}x {item.product.name}
                </Text>
                <Text style={styles.itemSummaryPrice}>
                  {formatCurrency((item.product.discount_price ?? item.product.price) * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Payment Summary</Text>
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Items Subtotal</Text>
            <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
          </View>

          {discountSavings > 0 && (
            <View style={styles.priceLine}>
              <Text style={styles.savingLabel}>Store Discounts</Text>
              <Text style={styles.savingValue}>-{formatCurrency(discountSavings)}</Text>
            </View>
          )}

          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>
              {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Total Amount Payable</Text>
            <Text style={styles.finalTotalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Place Order Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total To Pay</Text>
          <Text style={styles.bottomTotalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <Button
          title={selectedMethod === "upi" ? "Pay via UPI →" : "Place Order →"}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          size="lg"
          style={styles.placeOrderBtn}
        />
      </View>

      {/* UPI Payment Verification Modal */}
      {verifyingOrder && (
        <Modal transparent visible animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalEmoji}>💳</Text>
              <h2 style={styles.modalTitle}>UPI Payment Handoff</h2>
              <Text style={styles.modalDesc}>
                We opened your UPI app for order #{verifyingOrder.order_number} (
                {formatCurrency(Number(verifyingOrder.total_amount))}).
              </Text>
              <Text style={styles.modalSubDesc}>
                Once you complete the payment in Google Pay / PhonePe / Paytm, tap below to confirm:
              </Text>

              <View style={styles.txnRefBox}>
                <Text style={styles.txnRefLabel}>TRANSACTION REFERENCE</Text>
                <Text style={styles.txnRefVal}>{verifyingOrder.upi_transaction_ref}</Text>
              </View>

              <Button
                title={verificationStatus === "verifying" ? "Verifying with Bank..." : "I Have Paid — Confirm Order"}
                onPress={handleVerifyUpiPayment}
                loading={verificationStatus === "verifying"}
                size="lg"
                style={styles.confirmPayBtn}
              />

              <TouchableOpacity
                onPress={() => setVerifyingOrder(null)}
                style={styles.cancelVerifyBtn}
              >
                <Text style={styles.cancelVerifyText}>Cancel & Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 110,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  changeLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  addressBox: {
    backgroundColor: COLORS.borderLight,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  addressPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  addressDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  addressCity: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  noAddressBox: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primaryLight + "30",
    borderRadius: RADIUS.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  noAddressText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  methodOption: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  methodOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "15",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  recommendedPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  methodSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  upiAppsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  upiAppsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  upiAppsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  upiAppChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  upiAppChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  upiAppEmoji: {
    fontSize: 12,
  },
  upiAppName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  upiAppNameSelected: {
    color: COLORS.primaryDark,
  },
  itemsSummaryList: {
    gap: 6,
  },
  itemSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemSummaryName: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemSummaryPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  priceLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  savingLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  savingValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finalTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.lg,
  },
  bottomTotalLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  placeOrderBtn: {
    minWidth: 180,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  modalBox: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  modalSubDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  txnRefBox: {
    backgroundColor: COLORS.borderLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  txnRefLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  txnRefVal: {
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  confirmPayBtn: {
    width: "100%",
    marginBottom: SPACING.sm,
  },
  cancelVerifyBtn: {
    padding: SPACING.sm,
  },
  cancelVerifyText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
});
