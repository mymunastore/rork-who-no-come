import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { useAuth } from '@/hooks/auth-store';

export default function DriverAnalyticsScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Performance Analytics',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: 'white',
        }}
      />
      <PerformanceDashboard driverId={user?.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});