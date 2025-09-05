import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const updateStatusSchema = z.object({
  deliveryId: z.string(),
  status: z.enum(["assigned", "picked_up", "in_transit", "delivered", "cancelled"]),
  riderId: z.string().optional(),
  otpCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateDeliveryStatusProcedure = publicProcedure
  .input(updateStatusSchema)
  .mutation(async ({ input }) => {
    // Simulate status update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate OTP for pickup confirmation
    const otp = input.status === "picked_up" ? 
      Math.floor(1000 + Math.random() * 9000).toString() : undefined;
    
    return {
      success: true,
      deliveryId: input.deliveryId,
      status: input.status,
      otp,
      message: getStatusMessage(input.status),
      timestamp: new Date().toISOString(),
    };
  });

function getStatusMessage(status: string): string {
  const messages = {
    assigned: "Rider is on the way to pickup",
    picked_up: "Package picked up, heading to destination",
    in_transit: "Package is on the way",
    delivered: "Package delivered successfully",
    cancelled: "Delivery cancelled",
  };
  return messages[status as keyof typeof messages] || "Status updated";
}

export default updateDeliveryStatusProcedure;