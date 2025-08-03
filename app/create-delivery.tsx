import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { 
  MapPin, 
  Package, 
  CreditCard, 
  MessageSquare, 
  ChevronRight,
  Search,
  X,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";
import { useDelivery } from "@/hooks/delivery-store";
import { Button } from "@/components/Button";
import { Address, Location, PaymentMethod } from "@/types";
import { getAddressSuggestions, mockCustomer } from "@/mocks/data";

export default function CreateDeliveryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createDelivery, isLoading } = useDelivery();
  
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [items, setItems] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isScheduled] = useState(false);
  const [scheduledDate] = useState<Date | undefined>(undefined);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<Address[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load saved addresses and payment methods
  useEffect(() => {
    if (user && user.role === "customer") {
      // In a real app, this would come from the user's profile
      // For demo, we're using mock data
      const savedAddresses = mockCustomer.savedAddresses;
      const savedPaymentMethods = mockCustomer.paymentMethods;
      
      if (savedAddresses.length > 0) {
        const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
        setPickupLocation({
          latitude: defaultAddress.latitude,
          longitude: defaultAddress.longitude,
          address: defaultAddress.address,
        });
      }
      
      if (savedPaymentMethods.length > 0) {
        const defaultPayment = savedPaymentMethods.find(pm => pm.isDefault) || savedPaymentMethods[0];
        setPaymentMethod(defaultPayment);
      }
    }
  }, [user]);
  
  // Search for addresses
  useEffect(() => {
    const searchAddresses = async () => {
      if (searchQuery.length >= 3) {
        const suggestions = await getAddressSuggestions(searchQuery);
        setAddressSuggestions(suggestions);
      } else {
        setAddressSuggestions([]);
      }
    };
    
    searchAddresses();
  }, [searchQuery]);
  
  const handleAddressSuggestionSelect = (address: Address) => {
    const location: Location = {
      latitude: address.latitude,
      longitude: address.longitude,
      address: address.address,
    };
    
    if (isSearchingPickup) {
      setPickupLocation(location);
    } else {
      setDropoffLocation(location);
    }
    
    setSearchQuery("");
    setAddressSuggestions([]);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!pickupLocation) newErrors.pickup = "Pickup location is required";
    if (!dropoffLocation) newErrors.dropoff = "Dropoff location is required";
    if (!items.trim()) newErrors.items = "Package description is required";
    if (!paymentMethod) newErrors.payment = "Payment method is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const calculateDeliveryDetails = () => {
    // In a real app, this would calculate based on distance, time, etc.
    // For demo purposes, we'll use mock values
    
    if (!pickupLocation || !dropoffLocation) return null;
    
    // Calculate mock distance (in km)
    const lat1 = pickupLocation.latitude;
    const lon1 = pickupLocation.longitude;
    const lat2 = dropoffLocation.latitude;
    const lon2 = dropoffLocation.longitude;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    
    // Calculate price based on distance
    const basePrice = 500; // Base price in Naira
    const pricePerKm = 100; // Price per km in Naira
    const price = basePrice + (distance * pricePerKm);
    
    // Calculate estimated time (1 km = 3 minutes)
    const estimatedTime = Math.max(15, Math.round(distance * 3));
    
    return {
      distance: parseFloat(distance.toFixed(1)),
      price: Math.round(price),
      estimatedTime,
    };
  };
  
  const deliveryDetails = calculateDeliveryDetails();
  
  const handleCreateDelivery = async () => {
    if (!validateForm() || !deliveryDetails) return;
    
    try {
      const newDelivery = await createDelivery({
        pickupLocation: pickupLocation as Location,
        dropoffLocation: dropoffLocation as Location,
        items,
        notes,
        price: deliveryDetails.price,
        distance: deliveryDetails.distance,
        estimatedTime: deliveryDetails.estimatedTime,
        scheduledFor: isScheduled ? scheduledDate : undefined,
        paymentMethod: paymentMethod as PaymentMethod,
      });
      
      Alert.alert(
        "Success",
        "Your delivery has been created!",
        [
          {
            text: "View Details",
            onPress: () => router.replace(`/delivery/${newDelivery.id}`),
          },
          {
            text: "Go to Home",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch {
      Alert.alert("Error", "Failed to create delivery. Please try again.");
    }
  };
  
  const renderAddressSearch = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for an address..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <X size={16} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      {addressSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {addressSuggestions.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={styles.suggestionItem}
              onPress={() => handleAddressSuggestionSelect(address)}
            >
              <MapPin size={16} color={Colors.primary} />
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionText}>{address.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create New Delivery</Text>
        
        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          
          {isSearchingPickup && renderAddressSearch()}
          
          {!isSearchingPickup && (
            <>
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  pickupLocation ? styles.locationButtonFilled : {},
                  errors.pickup ? styles.inputError : {},
                ]}
                onPress={() => setIsSearchingPickup(true)}
              >
                <MapPin size={20} color={Colors.primary} />
                <Text style={[
                  styles.locationButtonText,
                  pickupLocation ? styles.locationButtonTextFilled : {},
                ]}>
                  {pickupLocation ? pickupLocation.address : "Select pickup location"}
                </Text>
                <ChevronRight size={16} color={Colors.textLight} />
              </TouchableOpacity>
              
              {errors.pickup && (
                <Text style={styles.errorText}>{errors.pickup}</Text>
              )}
              
              {/* Saved Addresses */}
              <View style={styles.savedAddressesContainer}>
                <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>
                
                {mockCustomer.savedAddresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={styles.savedAddressItem}
                    onPress={() => {
                      setPickupLocation({
                        latitude: address.latitude,
                        longitude: address.longitude,
                        address: address.address,
                      });
                    }}
                  >
                    <MapPin size={16} color={Colors.primary} />
                    <View style={styles.savedAddressContent}>
                      <Text style={styles.savedAddressName}>{address.name}</Text>
                      <Text style={styles.savedAddressText}>{address.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
        
        {/* Dropoff Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dropoff Location</Text>
          
          {!isSearchingPickup && renderAddressSearch()}
          
          {isSearchingPickup && (
            <>
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  dropoffLocation ? styles.locationButtonFilled : {},
                  errors.dropoff ? styles.inputError : {},
                ]}
                onPress={() => setIsSearchingPickup(false)}
              >
                <MapPin size={20} color={Colors.secondary} />
                <Text style={[
                  styles.locationButtonText,
                  dropoffLocation ? styles.locationButtonTextFilled : {},
                ]}>
                  {dropoffLocation ? dropoffLocation.address : "Select dropoff location"}
                </Text>
                <ChevronRight size={16} color={Colors.textLight} />
              </TouchableOpacity>
              
              {errors.dropoff && (
                <Text style={styles.errorText}>{errors.dropoff}</Text>
              )}
            </>
          )}
        </View>
        
        {/* Package Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          
          <View style={styles.inputContainer}>
            <Package size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, errors.items ? styles.inputError : {}]}
              placeholder="What are you sending?"
              value={items}
              onChangeText={setItems}
            />
          </View>
          
          {errors.items && (
            <Text style={styles.errorText}>{errors.items}</Text>
          )}
          
          <View style={styles.inputContainer}>
            <MessageSquare size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Add notes for the driver (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.paymentMethodsContainer}>
            {mockCustomer.paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  paymentMethod?.id === method.id ? styles.paymentMethodSelected : {},
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <CreditCard 
                  size={20} 
                  color={paymentMethod?.id === method.id ? Colors.background : Colors.primary} 
                />
                <Text style={[
                  styles.paymentMethodText,
                  paymentMethod?.id === method.id ? styles.paymentMethodTextSelected : {},
                ]}>
                  {method.details}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {errors.payment && (
            <Text style={styles.errorText}>{errors.payment}</Text>
          )}
        </View>
        
        {/* Delivery Summary */}
        {deliveryDetails && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Delivery Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>{deliveryDetails.distance} km</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Time</Text>
              <Text style={styles.summaryValue}>{deliveryDetails.estimatedTime} mins</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price</Text>
              <Text style={styles.summaryPrice}>₦{deliveryDetails.price.toLocaleString()}</Text>
            </View>
          </View>
        )}
        
        <Button
          title="Create Delivery"
          onPress={handleCreateDelivery}
          loading={isLoading}
          disabled={isLoading || !deliveryDetails}
          style={styles.createButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper function to convert degrees to radians
function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: Colors.text,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionContent: {
    marginLeft: 8,
    flex: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  locationButtonFilled: {
    backgroundColor: Colors.card,
  },
  locationButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.textLight,
  },
  locationButtonTextFilled: {
    color: Colors.text,
  },
  savedAddressesContainer: {
    marginTop: 16,
  },
  savedAddressesTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  savedAddressItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  savedAddressContent: {
    marginLeft: 8,
    flex: 1,
  },
  savedAddressName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  savedAddressText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  inputIcon: {
    marginTop: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 36,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 4,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  paymentMethodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minWidth: "48%",
  },
  paymentMethodSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  paymentMethodTextSelected: {
    color: Colors.background,
    fontWeight: "500",
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  createButton: {
    marginTop: 8,
  },
});