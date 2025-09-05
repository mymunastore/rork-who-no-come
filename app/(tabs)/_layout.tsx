import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Home, Package, User, Plus } from "lucide-react-native";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";

export default function TabLayout() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const isDriver = user.role === "driver";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      
      {!isDriver && (
        <Tabs.Screen
          name="create-delivery"
          options={{
            title: "New Delivery",
            tabBarButton: (props) => {
              return (
                <TouchableOpacity
                  style={styles.newDeliveryButton}
                  onPress={() => router.push("/create-delivery")}
                  activeOpacity={0.7}
                >
                  <View style={styles.plusButton}>
                    <Plus color="#FFFFFF" size={24} />
                  </View>
                </TouchableOpacity>
              );
            },
          }}
        />
      )}
      
      <Tabs.Screen
        name="deliveries"
        options={{
          title: isDriver ? "My Deliveries" : "My Orders",
          tabBarIcon: ({ color }) => <Package color={color} size={24} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: Colors.background,
    borderTopColor: Colors.border,
  },
  tabBarLabel: {
    fontSize: 12,
  },
  header: {
    backgroundColor: Colors.background,
  },
  newDeliveryButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});