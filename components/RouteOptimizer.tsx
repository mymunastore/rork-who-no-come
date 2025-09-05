import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Navigation2, TrendingUp, AlertCircle, MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Delivery } from '@/types';

interface RouteStop {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'pickup' | 'dropoff';
  estimatedTime: number;
  priority: number;
}

interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number;
  totalTime: number;
  savings: {
    distance: number;
    time: number;
  };
}

interface RouteOptimizerProps {
  deliveries: Delivery[];
  currentLocation?: { latitude: number; longitude: number };
  onOptimize?: (route: OptimizedRoute) => void;
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  deliveries,
  currentLocation,
  onOptimize,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [selectedStops, setSelectedStops] = useState<Set<string>>(new Set());

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const optimizeRoute = async () => {
    setIsOptimizing(true);

    // Convert deliveries to stops
    const stops: RouteStop[] = [];
    deliveries.forEach(delivery => {
      if (selectedStops.has(delivery.id) || selectedStops.size === 0) {
        stops.push({
          id: `${delivery.id}-pickup`,
          address: delivery.pickupLocation.address || 'Pickup location',
          latitude: delivery.pickupLocation.latitude,
          longitude: delivery.pickupLocation.longitude,
          type: 'pickup',
          estimatedTime: 5,
          priority: 1,
        });
        stops.push({
          id: `${delivery.id}-dropoff`,
          address: delivery.dropoffLocation.address || 'Dropoff location',
          latitude: delivery.dropoffLocation.latitude,
          longitude: delivery.dropoffLocation.longitude,
          type: 'dropoff',
          estimatedTime: 5,
          priority: 1,
        });
      }
    });

    // Simple nearest neighbor algorithm for route optimization
    const optimizedStops: RouteStop[] = [];
    const remainingStops = [...stops];
    let currentPos = currentLocation || { 
      latitude: stops[0]?.latitude || 0, 
      longitude: stops[0]?.longitude || 0 
    };
    let totalDistance = 0;

    while (remainingStops.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      remainingStops.forEach((stop, index) => {
        const distance = calculateDistance(
          currentPos.latitude,
          currentPos.longitude,
          stop.latitude,
          stop.longitude
        );
        
        // Prioritize pickups before dropoffs
        const typePenalty = stop.type === 'dropoff' && 
          remainingStops.some(s => s.id.split('-')[0] === stop.id.split('-')[0] && s.type === 'pickup') 
          ? 1000 : 0;
        
        const weightedDistance = distance + typePenalty;
        
        if (weightedDistance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const nextStop = remainingStops[nearestIndex];
      optimizedStops.push(nextStop);
      totalDistance += nearestDistance;
      currentPos = { latitude: nextStop.latitude, longitude: nextStop.longitude };
      remainingStops.splice(nearestIndex, 1);
    }

    // Calculate original distance (sequential order)
    let originalDistance = 0;
    let prevPos = currentLocation || { 
      latitude: stops[0]?.latitude || 0, 
      longitude: stops[0]?.longitude || 0 
    };
    
    stops.forEach(stop => {
      originalDistance += calculateDistance(
        prevPos.latitude,
        prevPos.longitude,
        stop.latitude,
        stop.longitude
      );
      prevPos = { latitude: stop.latitude, longitude: stop.longitude };
    });

    const route: OptimizedRoute = {
      stops: optimizedStops,
      totalDistance,
      totalTime: optimizedStops.length * 10 + totalDistance * 2, // Rough estimate
      savings: {
        distance: Math.max(0, originalDistance - totalDistance),
        time: Math.max(0, (originalDistance - totalDistance) * 2),
      },
    };

    setOptimizedRoute(route);
    setIsOptimizing(false);
    
    if (onOptimize) {
      onOptimize(route);
    }
  };

  const toggleStopSelection = (deliveryId: string) => {
    const newSelection = new Set(selectedStops);
    if (newSelection.has(deliveryId)) {
      newSelection.delete(deliveryId);
    } else {
      newSelection.add(deliveryId);
    }
    setSelectedStops(newSelection);
  };

  const applyOptimizedRoute = () => {
    if (optimizedRoute) {
      Alert.alert(
        'Apply Optimized Route',
        `This will reorder ${optimizedRoute.stops.length} stops to save ${optimizedRoute.savings.distance.toFixed(1)}km and ${optimizedRoute.savings.time.toFixed(0)} minutes.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Apply', 
            onPress: () => {
              console.log('Applying optimized route:', optimizedRoute);
              // Here you would update the delivery order in your state/backend
            }
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Navigation2 size={24} color={Colors.primary} />
          <Text style={styles.title}>Route Optimizer</Text>
        </View>
        <TouchableOpacity 
          style={styles.optimizeButton}
          onPress={optimizeRoute}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <TrendingUp size={16} color="white" />
              <Text style={styles.optimizeButtonText}>Optimize</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {deliveries.length === 0 ? (
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No deliveries to optimize</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.deliveryList}>
            {deliveries.map(delivery => (
              <TouchableOpacity
                key={delivery.id}
                style={[
                  styles.deliveryItem,
                  selectedStops.has(delivery.id) && styles.selectedItem,
                ]}
                onPress={() => toggleStopSelection(delivery.id)}
              >
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryId}>#{delivery.id.slice(-6)}</Text>
                  <View style={styles.addressContainer}>
                    <View style={styles.addressRow}>
                      <MapPin size={14} color={Colors.primary} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {delivery.pickupLocation.address}
                      </Text>
                    </View>
                    <View style={styles.addressRow}>
                      <MapPin size={14} color={Colors.secondary} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {delivery.dropoffLocation.address}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.checkbox}>
                  {selectedStops.has(delivery.id) && (
                    <View style={styles.checkmark} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {optimizedRoute && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Optimization Results</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Total Distance</Text>
                  <Text style={styles.statValue}>
                    {optimizedRoute.totalDistance.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Est. Time</Text>
                  <Text style={styles.statValue}>
                    {Math.round(optimizedRoute.totalTime)} min
                  </Text>
                </View>
              </View>
              
              {optimizedRoute.savings.distance > 0 && (
                <View style={styles.savingsContainer}>
                  <TrendingUp size={20} color={Colors.success} />
                  <Text style={styles.savingsText}>
                    Save {optimizedRoute.savings.distance.toFixed(1)}km and {Math.round(optimizedRoute.savings.time)} minutes
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyOptimizedRoute}
              >
                <Text style={styles.applyButtonText}>Apply Optimized Route</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  optimizeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryList: {
    flex: 1,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  selectedItem: {
    backgroundColor: Colors.primaryLight,
  },
  deliveryInfo: {
    flex: 1,
    marginRight: 12,
  },
  deliveryId: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  addressContainer: {
    gap: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
  },
  resultsContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.success}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});