import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { RouteOptimizer } from '@/components/RouteOptimizer';
import { useDelivery } from '@/hooks/delivery-store';
import { useLocation } from '@/hooks/location-store';

export default function RouteOptimizerScreen() {
  const { deliveries } = useDelivery();
  const { currentLocation } = useLocation();

  // Filter only pending deliveries for optimization
  const pendingDeliveries = deliveries.filter(
    d => d.status === 'pending' || d.status === 'accepted'
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Route Optimizer',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: 'white',
        }}
      />
      <RouteOptimizer 
        deliveries={pendingDeliveries}
        currentLocation={currentLocation || undefined}
        onOptimize={(route) => {
          console.log('Optimized route:', route);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});