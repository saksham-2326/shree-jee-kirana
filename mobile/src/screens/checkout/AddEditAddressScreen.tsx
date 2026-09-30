import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { MapPicker } from "../../components/MapPicker";
import { addressService } from "../../services/supabase/addressService";
import { useAddressStore } from "../../store/addressStore";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddEditAddress">;
  route: RouteProp<RootStackParamList, "AddEditAddress">;
};

export const AddEditAddressScreen: React.FC<Props> = ({ navigation, route }) => {
  const existingAddress = route.params?.address;
  const isEditing = Boolean(existingAddress);

  const [fullName, setFullName] = useState(existingAddress?.full_name || "");
  const [phone, setPhone] = useState(existingAddress?.phone || "");
  const [houseBuilding, setHouseBuilding] = useState(existingAddress?.house_building || "");
  const [streetArea, setStreetArea] = useState(existingAddress?.street_area || "");
  const [landmark, setLandmark] = useState(existingAddress?.landmark || "");
  const [city, setCity] = useState(existingAddress?.city || "Nathdwara");
  const [state, setState] = useState(existingAddress?.state || "Rajasthan");
  const [pincode, setPincode] = useState(existingAddress?.pincode || "313301");
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    existingAddress?.delivery_instructions || ""
  );
  const [isDefault, setIsDefault] = useState(existingAddress?.is_default || false);

  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number } | undefined>(
    existingAddress?.latitude && existingAddress?.longitude
      ? { latitude: existingAddress.latitude, longitude: existingAddress.longitude }
      : undefined
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { selectAddress } = useAddressStore();

  const handleSave = async () => {
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter the contact person's name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!houseBuilding.trim() || !streetArea.trim()) {
      setError("Please enter your complete house/building and street/area address.");
      return;
    }
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        houseBuilding: houseBuilding.trim(),
        streetArea: streetArea.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        isDefault,
      };

      if (isEditing && existingAddress) {
        const updated = await addressService.updateAddress(existingAddress.id, payload, coords);
        selectAddress(updated.id);
      } else {
        const created = await addressService.addAddress(payload, coords);
        selectAddress(created.id);
      }

      navigation.goBack();
    } catch (e: any) {
      setError(e.message || "Failed to save delivery address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Google Maps Location Pinning */}
        <Text style={styles.sectionTitle}>Pin Delivery Location on Google Maps</Text>
        <MapPicker
          initialCoordinates={
            coords?.latitude && coords?.longitude
              ? { latitude: coords.latitude, longitude: coords.longitude }
              : undefined
          }
          onLocationSelected={(c, est) => {
            setCoords(c);
            if (est && !streetArea) {
              setStreetArea(est);
            }
          }}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Address Form Inputs */}
        <Text style={styles.sectionTitle}>Address Details</Text>

        <Input
          label="Full Name *"
          placeholder="e.g. Ramesh Patel"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="10-Digit Phone Number *"
          placeholder="e.g. 9876543210"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />

        <Input
          label="Flat / House No. / Building / Floor *"
          placeholder="e.g. Flat 302, Sai Residency"
          value={houseBuilding}
          onChangeText={setHouseBuilding}
        />

        <Input
          label="Street / Colony / Locality / Sector *"
          placeholder="e.g. MG Road, Near Jain Temple"
          value={streetArea}
          onChangeText={setStreetArea}
        />

        <Input
          label="Landmark (Optional)"
          placeholder="e.g. Opposite Sharma Dairy"
          value={landmark}
          onChangeText={setLandmark}
        />

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Input
              label="City *"
              placeholder="e.g. Nathdwara"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={styles.halfCol}>
            <Input
              label="PIN Code *"
              placeholder="e.g. 313301"
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
        </View>

        <Input
          label="State *"
          placeholder="e.g. Rajasthan"
          value={state}
          onChangeText={setState}
        />

        <Input
          label="Delivery Instructions (Optional)"
          placeholder="e.g. Ring the doorbell, leave near gate"
          value={deliveryInstructions}
          onChangeText={setDeliveryInstructions}
        />

        {/* Default Address Switch */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsDefault(!isDefault)}
          style={styles.defaultCheckboxRow}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
            {isDefault && <Text style={styles.checkboxCheck}>✓</Text>}
          </View>
          <Text style={styles.defaultLabel}>Set as primary default address</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <Button
          title={isEditing ? "Save Address Changes" : "Save Delivery Address"}
          onPress={handleSave}
          loading={saving}
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    height: 52,
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
  container: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  errorBox: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  halfCol: {
    flex: 1,
  },
  defaultCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxCheck: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: "bold",
  },
  defaultLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  saveBtn: {
    marginTop: SPACING.sm,
  },
});
