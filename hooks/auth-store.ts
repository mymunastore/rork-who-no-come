import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Customer, Driver, User, UserRole } from "@/types";
import { mockCustomer, mockDrivers } from "@/mocks/data";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (userData: Partial<User>, password: string) => Promise<boolean>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored user on mount
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo purposes, we're using mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let loggedInUser: User | null = null;
      
      if (role === "customer") {
        // Check if email matches our mock customer
        if (email.toLowerCase() === mockCustomer.email.toLowerCase()) {
          loggedInUser = mockCustomer;
        }
      } else if (role === "driver") {
        // Find a driver with matching email
        const driver = mockDrivers.find(
          d => d.email.toLowerCase() === email.toLowerCase()
        );
        if (driver) {
          loggedInUser = driver;
        }
      }
      
      if (loggedInUser) {
        setUser(loggedInUser);
        await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to register the user
      // For demo purposes, we'll just simulate success
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new user object
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || "New User",
        email: userData.email || "",
        phone: userData.phone || "",
        role: userData.role || "customer",
      };
      
      setUser(newUser);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };
});