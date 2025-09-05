import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const toggleStatusSchema = z.object({
  riderId: z.string(),
  isOnline: z.boolean(),
  currentLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const toggleRiderStatusProcedure = publicProcedure
  .input(toggleStatusSchema)
  .mutation(async ({ input }) => {
    // Simulate status update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      riderId: input.riderId,
      isOnline: input.isOnline,
      message: input.isOnline ? "You are now online" : "You are now offline",
      timestamp: new Date().toISOString(),
    };
  });

export default toggleRiderStatusProcedure;