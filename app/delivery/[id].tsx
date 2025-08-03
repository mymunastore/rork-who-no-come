import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  MapPin, 
  Package, 
  Clock, 
  CreditCard, 
  Phone, 
  MessageSquare, 
  X,
  CheckCircle,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";
import { useDelivery } from "@/hooks/delivery-store";
import { Button } from "@/components/Button";
import { StatusStepper } from "@/components/StatusStepper";
import { DriverCard } from "@/components/DriverCard";
import { RatingStars } from "@/components/RatingStars";
import { DeliveryMap } from "@/components/DeliveryMap";
import { mockDrivers } from "@/mocks/data";

export default function DeliveryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getDeliveryById, updateDeliveryStatus, rateDelivery, cancelDelivery } = useDelivery();
  
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const delivery = getDeliveryById(id);
  const isDriver = user?.role === "driver";
  
  if (!delivery) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Delivery not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          style={styles.goBackButton}
        />
      </View>
    );
  }
  
  const driver = mockDrivers.find(d => d.id === delivery.driverId);
  
  const handleStatusUpdate = async (newStatus: any) => {
    const success = await updateDeliveryStatus(delivery.id, newStatus);
    if (success) {
      if (newStatus === "delivered") {
        setShowRatingModal(true);
      }
    } else {
      Alert.alert("Error", "Failed to update delivery status");
    }
  };
  
  const handleCancel = async () => {
    Alert.alert(
      "Cancel Delivery",
      "Are you sure you want to cancel this delivery?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          onPress: async () => {
            const success = await cancelDelivery(delivery.id);
            if (success) {
              router.back();
            } else {
              Alert.alert("Error", "Failed to cancel delivery");
            }
          },
          style: "destructive",
        },
      ]
    );
  };
  
  const handleSubmitRating = async () => {
    const success = await rateDelivery(delivery.id, rating, review);
    if (success) {
      setShowRatingModal(false);
      Alert.alert("Thank You", "Your rating has been submitted");
    } else {
      Alert.alert("Error", "Failed to submit rating");
    }
  };
  
  const renderActionButton = () => {
    if (delivery.status === "cancelled" || delivery.status === "delivered") {
      return null;
    }
    
    if (isDriver) {
      switch (delivery.status) {
        case "accepted":
          return (
            <Button
              title="Picked Up Package"
              onPress={() => handleStatusUpdate("picked_up")}
            />
          );
        case "picked_up":
          return (
            <Button
              title="In Transit"
              onPress={() => handleStatusUpdate("in_transit")}
            />
          );
        case "in_transit":
          return (
            <Button
              title="Delivered"
              onPress={() => handleStatusUpdate("delivered")}
            />
          );
        default:
          return null;
      }
    } else {
      // Customer actions
      if (delivery.status === "pending") {
        return (
          <Button
            title="Cancel Delivery"
            variant="outline"
            onPress={handleCancel}
            textStyle={{ color: Colors.error }}
          />
        );
      }
      
      return (
        <View style={styles.customerActions}>
          <Button
            title="Contact Driver"
            variant="outline"
            onPress={() => console.log("Contact driver")}
            icon={<Phone size={16} color={Colors.primary} />}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            icon={<X size={16} color={Colors.error} />}
            style={{ flex: 1 }}
            textStyle={{ color: Colors.error }}
          />
        </View>
      );
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
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
        
        <StatusStepper currentStatus={delivery.status} />
        
        {/* Real-time Map */}
        {(delivery.status === 'accepted' || delivery.status === 'picked_up' || delivery.status === 'in_transit') && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Live Tracking</Text>
            <View style={styles.mapContainer}>
              <DeliveryMap delivery={delivery} showRoute={true} />
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          <View style={styles.detailItem}>
            <Package size={20} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Package</Text>
              <Text style={styles.detailValue}>{delivery.items}</Text>
            </View>
          </View>
          
          {delivery.notes && (
            <View style={styles.detailItem}>
              <MessageSquare size={20} color={Colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValue}>{delivery.notes}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Clock size={20} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Estimated Time</Text>
              <Text style={styles.detailValue}>{delivery.estimatedTime} minutes</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <CreditCard size={20} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{delivery.paymentMethod.details}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          
          <View style={styles.locationItem}>
            <View style={styles.locationIconContainer}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationValue}>
                {delivery.pickupLocation.address || "Address not specified"}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationDivider} />
          
          <View style={styles.locationItem}>
            <View style={styles.locationIconContainer}>
              <MapPin size={20} color={Colors.secondary} />
            </View>
            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>Dropoff Location</Text>
              <Text style={styles.locationValue}>
                {delivery.dropoffLocation.address || "Address not specified"}
              </Text>
            </View>
          </View>
        </View>
        
        {driver && !isDriver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver</Text>
            <DriverCard 
              driver={driver} 
              onCallPress={() => console.log(`Calling ${driver.name}`)}
            />
          </View>
        )}
        
        {delivery.rating && delivery.status === "delivered" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <View style={styles.ratingContainer}>
              <RatingStars rating={delivery.rating} size={24} showLabel />
              {delivery.review && (
                <View style={styles.reviewContainer}>
                  <Text style={styles.reviewText}>{delivery.review}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {renderActionButton()}
      </View>
      
      {/* Rating Modal */}
      {showRatingModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Delivery</Text>
              <TouchableOpacity 
                onPress={() => setShowRatingModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" }}
                style={styles.deliveryImage}
              />
              
              <Text style={styles.ratingTitle}>How was your delivery?</Text>
              
              <RatingStars
                rating={rating}
                size={36}
                editable
                onRatingChange={setRating}
                showLabel
              />
              
              <TextInput
                style={styles.reviewInput}
                placeholder="Add a comment (optional)"
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              <Button
                title="Submit Rating"
                onPress={handleSubmitRating}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  goBackButton: {
    width: 200,
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  section: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
  },
  locationItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 16,
    color: Colors.text,
  },
  locationDivider: {
    height: 24,
    width: 1,
    backgroundColor: Colors.border,
    marginLeft: 18,
    marginVertical: 4,
  },
  customerActions: {
    flexDirection: "row",
    marginTop: 24,
  },
  ratingContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  reviewContainer: {
    marginTop: 16,
    width: "100%",
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: "italic",
    textAlign: "center",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    alignItems: "center",
  },
  deliveryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  reviewInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    marginBottom: 16,
    minHeight: 80,
    color: Colors.text,
  },
  submitButton: {
    width: "100%",
    marginTop: 8,
  },
  mapSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
});