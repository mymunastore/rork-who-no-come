import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6),
  userType: z.enum(["rider", "client", "admin"]),
});

export const loginProcedure = publicProcedure
  .input(loginSchema)
  .mutation(async ({ input }) => {
    // Mock authentication - in production, verify against database
    const { phone, password, userType } = input;
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user data based on type
    const mockUsers = {
      rider: {
        id: "rider-" + Math.random().toString(36).substr(2, 9),
        name: "John Rider",
        phone,
        userType: "rider" as const,
        isOnline: false,
        totalDeliveries: 156,
        rating: 4.8,
        earnings: {
          today: 5200,
          week: 32500,
          month: 145000,
        },
        vehicleInfo: {
          type: "motorcycle",
          plateNumber: "LAG-123XY",
          model: "Honda CB125",
        },
      },
      client: {
        id: "client-" + Math.random().toString(36).substr(2, 9),
        name: "Sarah Client",
        phone,
        userType: "client" as const,
        savedAddresses: [
          {
            id: "1",
            label: "Home",
            address: "123 Victoria Island, Lagos",
            coordinates: { latitude: 6.4281, longitude: 3.4219 },
          },
          {
            id: "2",
            label: "Office",
            address: "45 Marina Road, Lagos Island",
            coordinates: { latitude: 6.4549, longitude: 3.3999 },
          },
        ],
      },
      admin: {
        id: "admin-" + Math.random().toString(36).substr(2, 9),
        name: "Admin User",
        phone,
        userType: "admin" as const,
        permissions: ["view_all", "manage_riders", "manage_deliveries"],
      },
    };
    
    // Return mock user based on type
    const user = mockUsers[userType];
    
    return {
      success: true,
      user,
      token: "mock-jwt-token-" + Math.random().toString(36).substr(2, 9),
    };
  });

export default loginProcedure;