import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/hooks/auth-store";
import { DeliveryProvider } from "@/hooks/delivery-store";
import { LocationProvider } from "@/hooks/location-store";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: "#FFFFFF",
      },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen 
        name="delivery/[id]" 
        options={{ 
          title: "Delivery Details",
          animation: "slide_from_right",
        }} 
      />
      <Stack.Screen 
        name="create-delivery" 
        options={{ 
          title: "New Delivery",
          animation: "slide_from_bottom",
        }} 
      />
      <Stack.Screen 
        name="live-tracking" 
        options={{ 
          title: "Live Tracking",
          headerShown: false,
          animation: "slide_from_right",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocationProvider>
            <DeliveryProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </DeliveryProvider>
          </LocationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}