import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const listDeliveriesSchema = z.object({
  userType: z.enum(["rider", "client", "admin"]),
  userId: z.string(),
  status: z.enum(["all", "pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"]).optional(),
});

export const listDeliveriesProcedure = publicProcedure
  .input(listDeliveriesSchema)
  .query(async ({ input }) => {
    // Mock deliveries data
    const mockDeliveries = [
      {
        id: "DEL-ABC123",
        pickupAddress: "123 Victoria Island, Lagos",
        dropoffAddress: "45 Marina Road, Lagos Island",
        status: "in_transit" as const,
        estimatedTime: "10 mins",
        fare: 2500,
        distance: "5.2 km",
        rider: {
          id: "rider-1",
          name: "John Doe",
          phone: "+234801234567",
          rating: 4.8,
          plateNumber: "LAG-123XY",
          currentLocation: {
            latitude: 6.4400,
            longitude: 3.4100,
          },
        },
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        id: "DEL-XYZ789",
        pickupAddress: "Lekki Phase 1, Lagos",
        dropoffAddress: "Ikoyi, Lagos",
        status: "pending" as const,
        estimatedTime: "15-20 mins",
        fare: 3000,
        distance: "7.8 km",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: "DEL-QWE456",
        pickupAddress: "Surulere, Lagos",
        dropoffAddress: "Yaba, Lagos",
        status: "delivered" as const,
        estimatedTime: "Delivered",
        fare: 1800,
        distance: "4.1 km",
        rider: {
          id: "rider-2",
          name: "Mike Johnson",
          phone: "+234802345678",
          rating: 4.9,
          plateNumber: "LAG-456AB",
        },
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
        deliveredAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
    ];
    
    // Filter based on status if provided
    let filteredDeliveries = mockDeliveries;
    if (input.status && input.status !== "all") {
      filteredDeliveries = mockDeliveries.filter(d => d.status === input.status);
    }
    
    return {
      success: true,
      deliveries: filteredDeliveries,
      total: filteredDeliveries.length,
    };
  });

export default listDeliveriesProcedure;