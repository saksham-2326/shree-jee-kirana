import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/supabase/authService";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditProfile">;
};

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, profile, setProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    if (!fullName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const updated = await authService.updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });

      if (updated) {
        setProfile(updated);
        Alert.alert("Success", "Profile updated successfully!");
        navigation.goBack();
      }
    } catch (e: any) {
      setError(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <Input
          label="Full Name *"
          placeholder="e.g. Ramesh Patel"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Phone Number"
          placeholder="e.g. 9876543210"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />

        <Input
          label="Email Address"
          value={user?.email || ""}
          editable={false}
          helperText="Email cannot be changed."
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    height: 52,
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
    padding: SPACING.xl,
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
  saveBtn: {
    marginTop: SPACING.lg,
  },
});
