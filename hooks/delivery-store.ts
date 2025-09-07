import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Delivery, DeliveryStatus, Location, PaymentMethod } from "@/types";
import { mockDeliveries, getNearbyDrivers } from "@/mocks/data";
import { useAuth } from "./auth-store";
import { trpc } from "@/lib/trpc";

interface DeliveryState {
  deliveries: Delivery[];
  activeDelivery: Delivery | null;
  createDelivery: (deliveryData: Partial<Delivery>) => Promise<Delivery>;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => Promise<boolean>;
  rateDelivery: (id: string, rating: number, review?: string) => Promise<boolean>;
  cancelDelivery: (id: string) => Promise<boolean>;
  getDeliveryById: (id: string) => Delivery | undefined;
  isLoading: boolean;
}

export const [DeliveryProvider, useDelivery] = createContextHook<DeliveryState>(() => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);

  // Try to fetch from backend first, fallback to local storage/mock data
  const backendDeliveriesQuery = trpc.deliveries.list.useQuery(
    {
      userType: user?.role === "driver" ? "rider" : "client",
      userId: user?.id || "",
      status: "all",
    },
    {
      enabled: !!user,
      retry: 1,
      retryDelay: 1000,
    }
  );

  // Log backend query status
  useEffect(() => {
    if (backendDeliveriesQuery.isSuccess) {
      console.log("✅ Backend deliveries fetched successfully:", backendDeliveriesQuery.data);
    }
    if (backendDeliveriesQuery.isError) {
      console.log("⚠️ Backend deliveries fetch failed (will use fallback):", backendDeliveriesQuery.error?.message);
    }
  }, [backendDeliveriesQuery.isSuccess, backendDeliveriesQuery.isError, backendDeliveriesQuery.data, backendDeliveriesQuery.error]);

  // Fallback to local storage if backend fails
  const deliveriesQuery = useQuery({
    queryKey: ["deliveries", user?.id],
    queryFn: async () => {
      // First try to use backend data if available
      if (backendDeliveriesQuery.data?.deliveries) {
        const backendDeliveries = backendDeliveriesQuery.data.deliveries.map((d: any) => ({
          id: d.id,
          customerId: user?.id || "",
          driverId: d.rider?.id,
          pickupLocation: {
            latitude: 6.5244,
            longitude: 3.3792,
            address: d.pickupAddress,
          },
          dropoffLocation: {
            latitude: 6.4541,
            longitude: 3.3947,
            address: d.dropoffAddress,
          },
          status: d.status,
          items: "Package",
          price: d.fare,
          distance: parseFloat(d.distance),
          estimatedTime: parseInt(d.estimatedTime),
          createdAt: new Date(d.createdAt),
          paymentMethod: {
            id: "default",
            type: "cash",
            details: "Cash on delivery",
            isDefault: true,
          } as PaymentMethod,
        }));
        
        // Save to local storage
        await AsyncStorage.setItem("deliveries", JSON.stringify(backendDeliveries));
        return backendDeliveries;
      }
      
      // Fallback to local storage
      try {
        const storedDeliveries = await AsyncStorage.getItem("deliveries");
        if (storedDeliveries) {
          return JSON.parse(storedDeliveries) as Delivery[];
        }
        // Use mock data for initial load
        return mockDeliveries;
      } catch (error) {
        console.error("Failed to load deliveries:", error);
        return mockDeliveries;
      }
    },
    enabled: !!user,
  });

  // Sync deliveries state with query data
  useEffect(() => {
    if (deliveriesQuery.data) {
      setDeliveries(deliveriesQuery.data);
      
      // Set active delivery if there's one in progress
      const active = deliveriesQuery.data.find(d => 
        d.status !== "delivered" && d.status !== "cancelled"
      );
      
      if (active) {
        setActiveDelivery(active);
      } else {
        setActiveDelivery(null);
      }
    }
  }, [deliveriesQuery.data]);

  // Save deliveries to storage
  const saveDeliveries = async (updatedDeliveries: Delivery[]) => {
    try {
      await AsyncStorage.setItem("deliveries", JSON.stringify(updatedDeliveries));
    } catch (error) {
      console.error("Failed to save deliveries:", error);
    }
  };

  // Try backend first, fallback to local creation
  const backendCreateMutation = trpc.deliveries.create.useMutation();
  
  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async (deliveryData: Partial<Delivery>): Promise<Delivery> => {
      if (!user) throw new Error("User not authenticated");
      
      // Try to create via backend first
      try {
        console.log("📤 Attempting to create delivery via backend...");
        const backendResult = await backendCreateMutation.mutateAsync({
          pickupAddress: deliveryData.pickupLocation?.address || "",
          pickupCoordinates: {
            latitude: deliveryData.pickupLocation?.latitude || 0,
            longitude: deliveryData.pickupLocation?.longitude || 0,
          },
          dropoffAddress: deliveryData.dropoffLocation?.address || "",
          dropoffCoordinates: {
            latitude: deliveryData.dropoffLocation?.latitude || 0,
            longitude: deliveryData.dropoffLocation?.longitude || 0,
          },
          packageDetails: {
            description: deliveryData.items || "Package",
            weight: "1kg",
            fragile: false,
          },
          recipientInfo: {
            name: user.name,
            phone: user.phone || "",
          },
          paymentMethod: (deliveryData.paymentMethod?.type || "cash") as "cash" | "card" | "wallet",
          estimatedFare: deliveryData.price || 0,
        });
        
        if (backendResult.success && backendResult.delivery) {
          console.log("✅ Delivery created successfully via backend:", backendResult.delivery.id);
          // Convert backend format to our Delivery type
          return {
            id: backendResult.delivery.id,
            customerId: user.id,
            pickupLocation: deliveryData.pickupLocation as Location,
            dropoffLocation: deliveryData.dropoffLocation as Location,
            status: "pending",
            items: deliveryData.items || "Package",
            notes: deliveryData.notes,
            price: backendResult.delivery.estimatedFare || deliveryData.price || 0,
            distance: deliveryData.distance || 0,
            estimatedTime: deliveryData.estimatedTime || 0,
            createdAt: new Date(),
            scheduledFor: deliveryData.scheduledFor,
            paymentMethod: deliveryData.paymentMethod as PaymentMethod,
          };
        }
      } catch (error) {
        console.log("⚠️ Backend creation failed, using local creation:", error);
      }
      
      // Fallback to local creation
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new delivery
      const newDelivery: Delivery = {
        id: `del-${Date.now()}`,
        customerId: user.id,
        pickupLocation: deliveryData.pickupLocation as Location,
        dropoffLocation: deliveryData.dropoffLocation as Location,
        status: "pending",
        items: deliveryData.items || "Package",
        notes: deliveryData.notes,
        price: deliveryData.price || 0,
        distance: deliveryData.distance || 0,
        estimatedTime: deliveryData.estimatedTime || 0,
        createdAt: new Date(),
        scheduledFor: deliveryData.scheduledFor,
        paymentMethod: deliveryData.paymentMethod as PaymentMethod,
      };
      
      // In a real app, this would assign a driver based on availability
      // For demo purposes, we'll randomly assign one of our mock drivers
      const availableDrivers = getNearbyDrivers(
        newDelivery.pickupLocation.latitude,
        newDelivery.pickupLocation.longitude
      );
      
      if (availableDrivers.length > 0) {
        const randomDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
        newDelivery.driverId = randomDriver.id;
        newDelivery.status = "accepted";
      }
      
      return newDelivery;
    },
    onSuccess: (newDelivery) => {
      const updatedDeliveries = [...deliveries, newDelivery];
      setDeliveries(updatedDeliveries);
      setActiveDelivery(newDelivery);
      saveDeliveries(updatedDeliveries);
    },
  });

  // Try backend first for status updates
  const backendUpdateStatusMutation = trpc.deliveries.updateStatus.useMutation();
  
  // Update delivery status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DeliveryStatus }): Promise<Delivery> => {
      // Try backend first
      try {
        const backendResult = await backendUpdateStatusMutation.mutateAsync({
          deliveryId: id,
          status: status as any,
          riderId: user?.id || "",
        });
        
        if (backendResult.success) {
          console.log("✅ Delivery status updated via backend:", status);
        }
      } catch (error) {
        console.log("⚠️ Backend status update failed, using local update:", error);
      }
      
      // Continue with local update
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const deliveryIndex = deliveries.findIndex(d => d.id === id);
      if (deliveryIndex === -1) throw new Error("Delivery not found");
      
      const updatedDelivery = { ...deliveries[deliveryIndex], status };
      
      // If delivery is completed, add completion timestamp
      if (status === "delivered") {
        updatedDelivery.completedAt = new Date();
      }
      
      return updatedDelivery;
    },
    onSuccess: (updatedDelivery) => {
      const updatedDeliveries = deliveries.map(d => 
        d.id === updatedDelivery.id ? updatedDelivery : d
      );
      
      setDeliveries(updatedDeliveries);
      
      if (updatedDelivery.status === "delivered" || updatedDelivery.status === "cancelled") {
        setActiveDelivery(null);
      } else {
        setActiveDelivery(updatedDelivery);
      }
      
      saveDeliveries(updatedDeliveries);
    },
  });

  // Rate delivery mutation
  const rateDeliveryMutation = useMutation({
    mutationFn: async ({ id, rating, review }: { id: string; rating: number; review?: string }): Promise<Delivery> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const deliveryIndex = deliveries.findIndex(d => d.id === id);
      if (deliveryIndex === -1) throw new Error("Delivery not found");
      
      const updatedDelivery = { 
        ...deliveries[deliveryIndex], 
        rating, 
        review 
      };
      
      return updatedDelivery;
    },
    onSuccess: (updatedDelivery) => {
      const updatedDeliveries = deliveries.map(d => 
        d.id === updatedDelivery.id ? updatedDelivery : d
      );
      
      setDeliveries(updatedDeliveries);
      saveDeliveries(updatedDeliveries);
    },
  });

  return {
    deliveries,
    activeDelivery,
    isLoading: deliveriesQuery.isLoading || createDeliveryMutation.isPending || updateStatusMutation.isPending,
    
    createDelivery: async (deliveryData: Partial<Delivery>) => {
      return createDeliveryMutation.mutateAsync(deliveryData);
    },
    
    updateDeliveryStatus: async (id: string, status: DeliveryStatus) => {
      try {
        await updateStatusMutation.mutateAsync({ id, status });
        return true;
      } catch (error) {
        console.error("Failed to update delivery status:", error);
        return false;
      }
    },
    
    rateDelivery: async (id: string, rating: number, review?: string) => {
      try {
        await rateDeliveryMutation.mutateAsync({ id, rating, review });
        return true;
      } catch (error) {
        console.error("Failed to rate delivery:", error);
        return false;
      }
    },
    
    cancelDelivery: async (id: string) => {
      try {
        await updateStatusMutation.mutateAsync({ id, status: "cancelled" });
        return true;
      } catch (error) {
        console.error("Failed to cancel delivery:", error);
        return false;
      }
    },
    
    getDeliveryById: (id: string) => {
      return deliveries.find(d => d.id === id);
    },
  };
});