import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const createDeliverySchema = z.object({
  pickupAddress: z.string(),
  pickupCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  dropoffAddress: z.string(),
  dropoffCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  packageDetails: z.object({
    description: z.string(),
    weight: z.string(),
    fragile: z.boolean(),
    imageUrl: z.string().optional(),
  }),
  recipientInfo: z.object({
    name: z.string(),
    phone: z.string(),
  }),
  paymentMethod: z.enum(["cash", "card", "wallet"]),
  estimatedFare: z.number(),
});

export const createDeliveryProcedure = publicProcedure
  .input(createDeliverySchema)
  .mutation(async ({ input }) => {
    // Simulate creating delivery
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const deliveryId = "DEL-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    return {
      success: true,
      delivery: {
        id: deliveryId,
        ...input,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        estimatedTime: "15-20 mins",
        trackingUrl: `/live-tracking?id=${deliveryId}`,
      },
    };
  });

export default createDeliveryProcedure;