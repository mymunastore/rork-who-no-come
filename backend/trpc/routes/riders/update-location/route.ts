import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const updateLocationSchema = z.object({
  riderId: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    heading: z.number().optional(),
    speed: z.number().optional(),
  }),
  deliveryId: z.string().optional(),
});

export const updateRiderLocationProcedure = publicProcedure
  .input(updateLocationSchema)
  .mutation(async ({ input }) => {
    // In production, this would update the database and notify via WebSocket
    
    return {
      success: true,
      riderId: input.riderId,
      location: input.location,
      timestamp: new Date().toISOString(),
      deliveryId: input.deliveryId,
    };
  });

export default updateRiderLocationProcedure;