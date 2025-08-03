import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Star, Phone } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Driver } from "@/types";

interface DriverCardProps {
  driver: Driver;
  onPress?: () => void;
  onCallPress?: () => void;
  compact?: boolean;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  onPress,
  onCallPress,
  compact = false,
}) => {
  const handleCallPress = (e: any) => {
    e.stopPropagation();
    if (onCallPress) {
      onCallPress();
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
        testID={`driver-card-${driver.id}`}
      >
        <Image
          source={{ uri: driver.avatar }}
          style={styles.compactAvatar}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName}>{driver.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={12} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.compactRating}>{driver.rating}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.compactCallButton}
          onPress={handleCallPress}
        >
          <Phone size={16} color={Colors.background} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`driver-card-${driver.id}`}
    >
      <View style={styles.header}>
        <Image
          source={{ uri: driver.avatar }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{driver.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.rating}>{driver.rating}</Text>
            <Text style={styles.deliveries}>
              ({driver.completedDeliveries} deliveries)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vehicle:</Text>
          <Text style={styles.detailValue}>{driver.vehicleType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plate Number:</Text>
          <Text style={styles.detailValue}>{driver.licensePlate}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={handleCallPress}
      >
        <Phone size={16} color={Colors.background} />
        <Text style={styles.callButtonText}>Call Driver</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginLeft: 4,
  },
  deliveries: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  callButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  callButtonText: {
    color: Colors.background,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Compact styles
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 2,
  },
  compactRating: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text,
    marginLeft: 4,
  },
  compactCallButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});