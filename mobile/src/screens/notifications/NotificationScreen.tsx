import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { formatDateTime } from "../../utils/formatters";
import { NotificationItem } from "../../types/models";
import { notificationService } from "../../services/supabase/notificationService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Notifications">;
};

export const NotificationScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handlePress = async (item: NotificationItem) => {
    if (!item.is_read) {
      await notificationService.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }

    if (item.data?.order_id) {
      navigation.navigate("OrderTracking", { orderId: item.data.order_id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications & Offers</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <LoadingSpinner message="Checking for store announcements..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You're all caught up! Order updates and festive discount announcements will appear here."
          icon="🔔"
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadNotifications();
              }}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePress(item)}
              style={[
                styles.itemCard,
                !item.is_read && styles.itemCardUnread,
              ]}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>
                  {item.data?.type === "store_announcement" ? "📢" : "📦"}
                </Text>
              </View>

              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={[styles.title, !item.is_read && styles.titleUnread]}>
                    {item.title}
                  </Text>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
  list: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
    alignItems: "flex-start",
  },
  itemCardUnread: {
    backgroundColor: COLORS.primaryLight + "15",
    borderColor: COLORS.primary + "40",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  iconEmoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
  },
  titleUnread: {
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  body: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 3,
  },
  date: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});
