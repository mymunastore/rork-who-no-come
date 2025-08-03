import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Delivery, DeliveryStatus, Location, PaymentMethod } from "@/types";
import { mockDeliveries, getNearbyDrivers } from "@/mocks/data";
import { useAuth } from "./auth-store";

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

  // Fetch deliveries from storage or mock data
  const deliveriesQuery = useQuery({
    queryKey: ["deliveries", user?.id],
    queryFn: async () => {
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

  // Create delivery mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async (deliveryData: Partial<Delivery>): Promise<Delivery> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!user) throw new Error("User not authenticated");
      
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

  // Update delivery status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DeliveryStatus }): Promise<Delivery> => {
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