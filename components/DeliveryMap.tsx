import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { MapPin, Navigation, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Delivery } from '@/types';

interface DeliveryMapProps {
  delivery: Delivery;
  showRoute?: boolean;
  style?: any;
}

export function DeliveryMap({ delivery, showRoute = false, style }: DeliveryMapProps) {
  const renderMapContent = () => {
    if (Platform.OS === 'web') {
      // Web-compatible map placeholder with better visual design
      return (
        <View style={styles.webMapContainer}>
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderIcon}>
              <Navigation size={20} color={Colors.primary} />
            </View>
            <Text style={styles.mapHeaderText}>Live Tracking</Text>
            {showRoute && (
              <View style={styles.routeIndicator}>
                <Clock size={14} color={Colors.success} />
                <Text style={styles.routeText}>Active Route</Text>
              </View>
            )}
          </View>
          
          <View style={styles.mapVisualization}>
            <View style={styles.routeLine} />
            <View style={[styles.mapMarker, styles.pickupMarker]}>
              <MapPin size={16} color="white" />
            </View>
            <View style={[styles.mapMarker, styles.dropoffMarker]}>
              <MapPin size={16} color="white" />
            </View>
          </View>
          
          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: Colors.success }]} />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationText}>
                  {delivery.pickupLocation.address || 'Loading address...'}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: Colors.primary }]} />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Delivery Location</Text>
                <Text style={styles.locationText}>
                  {delivery.dropoffLocation.address || 'Loading address...'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    // Mobile placeholder (same design for consistency)
    return (
      <View style={styles.webMapContainer}>
        <View style={styles.mapHeader}>
          <View style={styles.mapHeaderIcon}>
            <Navigation size={20} color={Colors.primary} />
          </View>
          <Text style={styles.mapHeaderText}>Live Tracking</Text>
          {showRoute && (
            <View style={styles.routeIndicator}>
              <Clock size={14} color={Colors.success} />
              <Text style={styles.routeText}>Active Route</Text>
            </View>
          )}
        </View>
        
        <View style={styles.mapVisualization}>
          <View style={styles.routeLine} />
          <View style={[styles.mapMarker, styles.pickupMarker]}>
            <MapPin size={16} color="white" />
          </View>
          <View style={[styles.mapMarker, styles.dropoffMarker]}>
            <MapPin size={16} color="white" />
          </View>
        </View>
        
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: Colors.success }]} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationText}>
                {delivery.pickupLocation.address || 'Loading address...'}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Delivery Location</Text>
              <Text style={styles.locationText}>
                {delivery.dropoffLocation.address || 'Loading address...'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderMapContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  webMapContainer: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  mapHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mapHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  routeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  mapVisualization: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  routeLine: {
    position: 'absolute',
    width: 2,
    height: 120,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  mapMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pickupMarker: {
    backgroundColor: Colors.success,
    top: '30%',
  },
  dropoffMarker: {
    backgroundColor: Colors.primary,
    bottom: '30%',
  },
  locationInfo: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});