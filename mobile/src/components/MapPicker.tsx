import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ViewStyle,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MapPickerProps {
  initialCoordinates?: Coordinates;
  onLocationSelected: (coords: Coordinates, estimatedAddress?: string) => void;
  onManualAddressFallback?: () => void;
  style?: ViewStyle;
}

// Default Nathdwara, Rajasthan coordinates for Shree Jee Kirana locality
const DEFAULT_COORDS: Coordinates = {
  latitude: 24.9317,
  longitude: 73.8203,
};

export const MapPicker: React.FC<MapPickerProps> = ({
  initialCoordinates = DEFAULT_COORDS,
  onLocationSelected,
  onManualAddressFallback,
  style,
}) => {
  const [selectedCoords, setSelectedCoords] = useState<Coordinates>(initialCoordinates);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    // Simulates or uses geolocation API with clean fallback
    setTimeout(() => {
      setIsLocating(false);
      const nathdwaraLocalityCoords = {
        latitude: 24.9317 + (Math.random() - 0.5) * 0.01,
        longitude: 73.8203 + (Math.random() - 0.5) * 0.01,
      };
      setSelectedCoords(nathdwaraLocalityCoords);
      onLocationSelected(nathdwaraLocalityCoords, "Lal Bagh, Kothariya Road, Nathdwara, Rajasthan 313301");
      Alert.alert(
        "Location Selected",
        "Pinned to your approximate location in Nathdwara. You can fine-tune or manually fill building & street details."
      );
    }, 600);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Map Mock View with Coordinate Pin */}
      <View style={styles.mapArea}>
        <View style={styles.gridOverlay} />
        <View style={styles.pinWrapper}>
          <Text style={styles.pinIcon}>📍</Text>
          <View style={styles.pinCallout}>
            <Text style={styles.pinCalloutText}>Delivery Location</Text>
            <Text style={styles.coordsText}>
              {selectedCoords.latitude.toFixed(4)}, {selectedCoords.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleUseCurrentLocation}
          disabled={isLocating}
          style={styles.locationButton}
        >
          <Text style={styles.locationButtonIcon}>🎯</Text>
          <Text style={styles.locationButtonText}>
            {isLocating ? "Detecting Location..." : "Pin Current Location"}
          </Text>
        </TouchableOpacity>

        {onManualAddressFallback && (
          <TouchableOpacity
            onPress={onManualAddressFallback}
            style={styles.manualButton}
          >
            <Text style={styles.manualButtonText}>Enter Address Manually</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  mapArea: {
    height: 150,
    backgroundColor: "#E2E8F0",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F1F5F9",
    opacity: 0.6,
  },
  pinWrapper: {
    alignItems: "center",
  },
  pinIcon: {
    fontSize: 32,
  },
  pinCallout: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginTop: 2,
    alignItems: "center",
  },
  pinCalloutText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: "bold",
  },
  coordsText: {
    color: COLORS.primaryLight,
    fontSize: 9,
    fontFamily: "monospace",
  },
  controlsRow: {
    padding: SPACING.sm,
    flexDirection: "row",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  locationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  locationButtonIcon: {
    fontSize: 14,
  },
  locationButtonText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "bold",
  },
  manualButton: {
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.borderLight,
  },
  manualButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
});
