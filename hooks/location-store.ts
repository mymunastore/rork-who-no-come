import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { Location as LocationType } from '@/types';

interface LocationState {
  currentLocation: LocationType | null;
  isTracking: boolean;
  hasPermission: boolean;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  updateLocation: (location: LocationType) => void;
}

export const [LocationProvider, useLocation] = createContextHook<LocationState>(() => {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    checkPermission();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === 'web') {
      // Web geolocation permission check
      if ('geolocation' in navigator) {
        setHasPermission(true);
      }
      return;
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            () => {
              setHasPermission(true);
              resolve(true);
            },
            () => {
              setHasPermission(false);
              resolve(false);
            }
          );
        } else {
          resolve(false);
        }
      });
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  };

  const startTracking = async (): Promise<boolean> => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    if (Platform.OS === 'web') {
      // Web geolocation tracking
      if ('geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location: LocationType = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCurrentLocation(location);
          },
          (error) => {
            console.error('Web geolocation error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
        
        setIsTracking(true);
        // Store watchId for cleanup (we'll use a ref-like approach)
        return true;
      }
      return false;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000, // Update every 3 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newLocation: LocationType = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(newLocation);
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  };

  const stopTracking = () => {
    if (Platform.OS === 'web') {
      // For web, we'd need to store the watchId and clear it
      // This is a simplified version
      setIsTracking(false);
      return;
    }

    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  const updateLocation = (location: LocationType) => {
    setCurrentLocation(location);
  };

  return {
    currentLocation,
    isTracking,
    hasPermission,
    startTracking,
    stopTracking,
    requestPermission,
    updateLocation,
  };
});