import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const acceptDeliverySchema = z.object({
  deliveryId: z.string(),
  riderId: z.string(),
  riderLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export const acceptDeliveryProcedure = publicProcedure
  .input(acceptDeliverySchema)
  .mutation(async ({ input }) => {
    // Simulate accepting delivery
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      deliveryId: input.deliveryId,
      riderId: input.riderId,
      status: "assigned" as const,
      estimatedPickupTime: "5-7 mins",
      message: "Delivery accepted successfully",
      timestamp: new Date().toISOString(),
    };
  });

export default acceptDeliveryProcedure;