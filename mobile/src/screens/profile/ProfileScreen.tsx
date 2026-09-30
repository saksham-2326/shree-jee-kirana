import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { APP_CONFIG } from "../../constants/config";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/supabase/authService";

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "ProfileTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, profile, isAuthenticated, clearSession } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to sign out of Shree Jee Kirana?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.signOut();
            clearSession();
            navigation.replace("Auth");
          } catch {
            clearSession();
            navigation.replace("Auth");
          }
        },
      },
    ]);
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${APP_CONFIG.supportPhone}`);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account & Profile</Text>
        </View>
        <View style={styles.unauthContainer}>
          <Text style={styles.unauthEmoji}>👤</Text>
          <Text style={styles.unauthTitle}>Sign in to Your Account</Text>
          <Text style={styles.unauthSubtitle}>
            Save delivery addresses, track orders, and checkout seamlessly with UPI.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Auth")}
            style={styles.signInBtn}
          >
            <Text style={styles.signInBtnText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.full_name || "Store Customer"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
            {profile?.phone && <Text style={styles.userPhone}>📞 {profile.phone}</Text>}
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            onPress={() => navigation.navigate("OrdersTab")}
            style={styles.menuItem}
          >
            <Text style={styles.menuEmoji}>🛍️</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuLabel}>My Orders</Text>
              <Text style={styles.menuSub}>Track live deliveries and past orders</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("AddressSelect")}
            style={styles.menuItem}
          >
            <Text style={styles.menuEmoji}>📍</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuLabel}>Saved Addresses</Text>
              <Text style={styles.menuSub}>Manage home and work delivery locations</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={styles.menuItem}
          >
            <Text style={styles.menuEmoji}>🔔</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuLabel}>Notifications & Offers</Text>
              <Text style={styles.menuSub}>Store announcements and discount alerts</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.menuItem}
          >
            <Text style={styles.menuEmoji}>✏️</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuLabel}>Edit Profile</Text>
              <Text style={styles.menuSub}>Update your name and contact phone</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={styles.menuItem}
          >
            <Text style={styles.menuEmoji}>⚙️</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuLabel}>Store Settings & Info</Text>
              <Text style={styles.menuSub}>App version, operating hours, policies</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support & Helpline */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Help with an Order?</Text>
          <Text style={styles.supportText}>
            Our store team is available from 8:00 AM to 9:30 PM to assist you.
          </Text>
          <TouchableOpacity onPress={handleCallSupport} style={styles.callSupportBtn}>
            <Text style={styles.callSupportText}>📞 Call {APP_CONFIG.supportPhone}</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: "600",
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuEmoji: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuTextCol: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  supportCard: {
    backgroundColor: COLORS.primaryLight + "30",
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  supportText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: SPACING.md,
  },
  callSupportBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  callSupportText: {
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: "800",
  },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.errorLight,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  logoutBtnText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "800",
  },
  unauthContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },
  unauthEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  unauthTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  unauthSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
  },
  signInBtnText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: "800",
  },
});
