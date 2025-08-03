import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Navigation, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock,
  Package,
  ArrowLeft,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useDelivery } from '@/hooks/delivery-store';
import { useLocation } from '@/hooks/location-store';
import { DeliveryMap } from '@/components/DeliveryMap';
import { Button } from '@/components/Button';
import { StatusStepper } from '@/components/StatusStepper';
import { mockDrivers } from '@/mocks/data';

export default function LiveTrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeDelivery, updateDeliveryStatus } = useDelivery();
  const { startTracking, stopTracking, isTracking, hasPermission, requestPermission } = useLocation();
  
  const [estimatedArrival, setEstimatedArrival] = useState<string>('15 mins');
  
  const isDriver = user?.role === 'driver';
  
  useEffect(() => {
    // Start location tracking when component mounts
    const initializeTracking = async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location access to use live tracking.',
            [
              { text: 'Cancel', onPress: () => router.back() },
              { text: 'Settings', onPress: () => requestPermission() },
            ]
          );
          return;
        }
      }
      
      if (!isTracking) {
        const success = await startTracking();
        if (!success) {
          Alert.alert('Error', 'Failed to start location tracking');
        }
      }
    };

    initializeTracking();

    // Cleanup on unmount
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, []);

  if (!activeDelivery) {
    return (
      <View style={styles.noDeliveryContainer}>
        <Package size={64} color={Colors.textLight} />
        <Text style={styles.noDeliveryTitle}>No Active Delivery</Text>
        <Text style={styles.noDeliveryText}>
          You don&apos;t have any active deliveries to track
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.goBackButton}
        />
      </View>
    );
  }

  const driver = mockDrivers.find(d => d.id === activeDelivery.driverId);

  const handleStatusUpdate = async (newStatus: any) => {
    const success = await updateDeliveryStatus(activeDelivery.id, newStatus);
    if (!success) {
      Alert.alert('Error', 'Failed to update delivery status');
    }
  };

  const handleContactDriver = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Feature Not Available', 'Calling is not available on web');
      return;
    }
    
    Alert.alert(
      'Contact Driver',
      `Call ${driver?.name || 'Driver'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling driver...') },
      ]
    );
  };

  const renderDriverActions = () => {
    if (!isDriver) return null;

    switch (activeDelivery.status) {
      case 'accepted':
        return (
          <Button
            title="Arrived at Pickup"
            onPress={() => handleStatusUpdate('picked_up')}
            icon={<MapPin size={16} color="white" />}
          />
        );
      case 'picked_up':
        return (
          <Button
            title="Start Delivery"
            onPress={() => handleStatusUpdate('in_transit')}
            icon={<Navigation size={16} color="white" />}
          />
        );
      case 'in_transit':
        return (
          <Button
            title="Mark as Delivered"
            onPress={() => handleStatusUpdate('delivered')}
            icon={<Package size={16} color="white" />}
          />
        );
      default:
        return null;
    }
  };

  const renderCustomerActions = () => {
    if (isDriver) return null;

    return (
      <View style={styles.customerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleContactDriver}
        >
          <Phone size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => console.log('Send message')}
        >
          <MessageSquare size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.headerSubtitle}>
            {isDriver ? 'Your current delivery' : 'Track your order'}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <DeliveryMap delivery={activeDelivery} showRoute={true} />
        
        {/* Status Overlay */}
        <View style={styles.statusOverlay}>
          <View style={styles.statusCard}>
            <StatusStepper currentStatus={activeDelivery.status} compact />
          </View>
        </View>
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>ETA: {estimatedArrival}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Package size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>{activeDelivery.items}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.textLight} />
            <Text style={styles.infoText} numberOfLines={1}>
              {isDriver 
                ? (activeDelivery.status === 'accepted' 
                    ? activeDelivery.pickupLocation.address 
                    : activeDelivery.dropoffLocation.address)
                : activeDelivery.dropoffLocation.address
              }
            </Text>
          </View>
        </View>

        {/* Driver Info (for customers) */}
        {!isDriver && driver && (
          <View style={styles.driverInfo}>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverVehicle}>
                {driver.vehicleType} • {driver.licensePlate}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {driver.rating.toFixed(1)}</Text>
                <Text style={styles.completedDeliveries}>
                  {driver.completedDeliveries} deliveries
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {renderDriverActions()}
          {renderCustomerActions()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  statusOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  statusCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  deliveryInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 20,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: Colors.text,
    marginRight: 12,
  },
  completedDeliveries: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionsContainer: {
    gap: 12,
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  noDeliveryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noDeliveryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noDeliveryText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  goBackButton: {
    width: 200,
  },
});