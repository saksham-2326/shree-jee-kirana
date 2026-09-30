import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { APP_CONFIG } from "../../constants/config";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Information & Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Store Profile Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏪 About Shree Jee Kirana</Text>
          <Text style={styles.infoText}>
            Shree Jee Kirana is a local general grocery store serving fresh, pure chakki flour, pulses, spices, packaged snacks, and household essentials.
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>Lal Bagh, Kothariya Road, Nathdwara, Rajasthan - 313301</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer Helpline</Text>
            <Text style={styles.detailValue}>{APP_CONFIG.supportPhone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Supported UPI</Text>
            <Text style={styles.detailValue}>Google Pay, PhonePe, Paytm, BHIM</Text>
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕒 Store Timings</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Monday – Saturday</Text>
            <Text style={styles.detailValue}>8:00 AM – 9:30 PM</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sunday</Text>
            <Text style={styles.detailValue}>8:00 AM – 2:00 PM</Text>
          </View>
        </View>

        {/* App Version Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 App Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Version</Text>
            <Text style={styles.detailValue}>1.0.0 (Production Build)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Architecture</Text>
            <Text style={styles.detailValue}>React Native CLI + Supabase + UPI</Text>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  container: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});
