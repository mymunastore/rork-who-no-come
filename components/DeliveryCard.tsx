import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MapPin, Package, Clock, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Delivery } from "@/types";

interface DeliveryCardProps {
  delivery: Delivery;
  onPress?: () => void;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ 
  delivery,
  onPress,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/delivery/${delivery.id}`);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return Colors.warning;
      case "accepted":
        return Colors.info;
      case "picked_up":
      case "in_transit":
        return Colors.primary;
      case "delivered":
        return Colors.success;
      case "cancelled":
        return Colors.error;
      default:
        return Colors.textLight;
    }
  };

  const formatStatus = (status: string): string => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`delivery-card-${delivery.id}`}
    >
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusIndicator, 
              { backgroundColor: getStatusColor(delivery.status) }
            ]} 
          />
          <Text style={styles.statusText}>{formatStatus(delivery.status)}</Text>
        </View>
        <Text style={styles.price}>₦{delivery.price.toLocaleString()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.locationContainer}>
          <MapPin size={16} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {delivery.pickupLocation.address || "Pickup location"}
          </Text>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color={Colors.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {delivery.dropoffLocation.address || "Dropoff location"}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Package size={14} color={Colors.textLight} />
            <Text style={styles.detailText}>{delivery.items}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={14} color={Colors.textLight} />
            <Text style={styles.detailText}>
              {delivery.scheduledFor 
                ? formatDate(delivery.scheduledFor)
                : `${delivery.estimatedTime} mins`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {formatDate(delivery.createdAt)}
        </Text>
        <ChevronRight size={16} color={Colors.textLight} />
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  content: {
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});