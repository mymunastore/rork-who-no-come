import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location as LocationType } from '@/types';

interface ExtendedLocation extends LocationType {
  heading?: number;
  speed?: number;
  timestamp?: number;
}

interface LocationHistory {
  locations: ExtendedLocation[];
  totalDistance: number;
}

interface LocationState {
  currentLocation: ExtendedLocation | null;
  isTracking: boolean;
  hasPermission: boolean;
  locationHistory: LocationHistory;
  accuracy: 'high' | 'balanced' | 'low';
  setAccuracy: (accuracy: 'high' | 'balanced' | 'low') => void;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  updateLocation: (location: ExtendedLocation) => void;
  clearHistory: () => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export const [LocationProvider, useLocation] = createContextHook<LocationState>(() => {
  const [currentLocation, setCurrentLocation] = useState<ExtendedLocation | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationHistory>({
    locations: [],
    totalDistance: 0,
  });
  const [accuracy, setAccuracy] = useState<'high' | 'balanced' | 'low'>('balanced');
  const webWatchIdRef = useRef<number | null>(null);

  useEffect(() => {
    checkPermission();
    loadLastLocation();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (webWatchIdRef.current !== null && Platform.OS === 'web') {
        navigator.geolocation.clearWatch(webWatchIdRef.current);
      }
    };
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const loadLastLocation = async () => {
    try {
      const stored = await AsyncStorage.getItem('lastKnownLocation');
      if (stored) {
        setCurrentLocation(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load last location:', error);
    }
  };

  const saveLocation = async (location: ExtendedLocation) => {
    try {
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(location));
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

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
            (position) => {
              const location: ExtendedLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                heading: position.coords.heading || undefined,
                speed: position.coords.speed || undefined,
                timestamp: Date.now(),
              };
              setCurrentLocation(location);
              saveLocation(location);
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

    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    const granted = foregroundStatus === 'granted';
    
    if (granted) {
      // Also request background permissions for continuous tracking
      try {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        console.log('Background location permission:', backgroundStatus);
      } catch (error) {
        console.log('Background permission not available');
      }
    }
    
    setHasPermission(granted);
    return granted;
  };

  const getAccuracyLevel = () => {
    switch (accuracy) {
      case 'high':
        return Location.Accuracy.BestForNavigation;
      case 'balanced':
        return Location.Accuracy.Balanced;
      case 'low':
        return Location.Accuracy.Low;
      default:
        return Location.Accuracy.Balanced;
    }
  };

  const updateLocationWithHistory = (newLocation: ExtendedLocation) => {
    setCurrentLocation(prev => {
      if (prev) {
        const distance = calculateDistance(
          prev.latitude,
          prev.longitude,
          newLocation.latitude,
          newLocation.longitude
        );
        
        setLocationHistory(history => ({
          locations: [...history.locations.slice(-99), newLocation],
          totalDistance: history.totalDistance + distance,
        }));
      }
      return newLocation;
    });
    saveLocation(newLocation);
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
            const location: ExtendedLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: Date.now(),
            };
            updateLocationWithHistory(location);
          },
          (error) => {
            console.error('Web geolocation error:', error);
          },
          {
            enableHighAccuracy: accuracy === 'high',
            timeout: 10000,
            maximumAge: accuracy === 'high' ? 0 : 5000,
          }
        );
        
        webWatchIdRef.current = watchId;
        setIsTracking(true);
        return true;
      }
      return false;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: getAccuracyLevel(),
          timeInterval: accuracy === 'high' ? 1000 : 3000,
          distanceInterval: accuracy === 'high' ? 5 : 10,
        },
        (location) => {
          const newLocation: ExtendedLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: Date.now(),
          };
          updateLocationWithHistory(newLocation);
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
      if (webWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(webWatchIdRef.current);
        webWatchIdRef.current = null;
      }
      setIsTracking(false);
      return;
    }

    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  const updateLocation = (location: ExtendedLocation) => {
    updateLocationWithHistory(location);
  };

  const clearHistory = () => {
    setLocationHistory({ locations: [], totalDistance: 0 });
  };

  return {
    currentLocation,
    isTracking,
    hasPermission,
    locationHistory,
    accuracy,
    setAccuracy,
    startTracking,
    stopTracking,
    requestPermission,
    updateLocation,
    clearHistory,
    calculateDistance,
  };
});