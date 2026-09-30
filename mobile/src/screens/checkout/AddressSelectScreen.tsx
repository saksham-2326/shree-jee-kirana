import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { Address } from "../../types/models";
import { addressService } from "../../services/supabase/addressService";
import { useAddressStore } from "../../store/addressStore";
import { Button } from "../../components/Button";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddressSelect">;
};

export const AddressSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { addresses, selectedAddressId, setAddresses, selectAddress } =
    useAddressStore();
  const [loading, setLoading] = useState(true);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSelect = (addr: Address) => {
    selectAddress(addr.id);
    navigation.goBack();
  };

  const handleDelete = (addr: Address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to remove this delivery address?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await addressService.deleteAddress(addr.id);
              loadAddresses();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Failed to delete address.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Address</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddEditAddress", {})}
          style={styles.addBtnHeader}
        >
          <Text style={styles.addBtnHeaderText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingSpinner message="Fetching your saved addresses..." />
      ) : addresses.length === 0 ? (
        <EmptyState
          title="No Delivery Address Found"
          description="Add your home or office address to receive fresh groceries right at your doorstep."
          icon="📍"
          actionLabel="+ Add New Address"
          onAction={() => navigation.navigate("AddEditAddress", {})}
        />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedAddressId;
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleSelect(item)}
                style={[
                  styles.addressCard,
                  isSelected && styles.addressCardSelected,
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.full_name}</Text>
                    {item.is_default && (
                      <View style={styles.defaultPill}>
                        <Text style={styles.defaultPillText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                <Text style={styles.phone}>📞 {item.phone}</Text>
                <Text style={styles.addressText}>
                  {item.house_building}, {item.street_area}
                  {item.landmark ? `, Near ${item.landmark}` : ""}
                </Text>
                <Text style={styles.cityText}>
                  {item.city}, {item.state} - {item.pincode}
                </Text>

                {item.delivery_instructions ? (
                  <Text style={styles.instructionsText}>
                    Note: {item.delivery_instructions}
                  </Text>
                ) : null}

                {/* Actions */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AddEditAddress", { address: item })
                    }
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Floating Add Address Button */}
      {addresses.length > 0 && (
        <View style={styles.bottomBar}>
          <Button
            title="+ Add Another Address"
            variant="outline"
            onPress={() => navigation.navigate("AddEditAddress", {})}
            style={styles.addBtn}
          />
        </View>
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
  addBtnHeader: {
    padding: SPACING.xs,
  },
  addBtnHeaderText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "15",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  defaultPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  defaultPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  phone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  cityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  instructionsText: {
    fontSize: 11,
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    padding: 6,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  deleteBtn: {
    paddingVertical: 2,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.error,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  addBtn: {
    width: "100%",
  },
});
