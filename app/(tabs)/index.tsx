import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Package, Clock, Navigation, Bell, TrendingUp, Star } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";
import { useDelivery } from "@/hooks/delivery-store";
import { useNotifications } from "@/hooks/notification-store";
import { DeliveryCard } from "@/components/DeliveryCard";
import { DriverCard } from "@/components/DriverCard";
import { Button } from "@/components/Button";
import { StatusStepper } from "@/components/StatusStepper";
import { QuickActions } from "@/components/QuickActions";
import { mockDrivers } from "@/mocks/data";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeDelivery, deliveries, isLoading } = useDelivery();
  const { unreadCount } = useNotifications();
  
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  const isDriver = user?.role === "driver";
  const recentDeliveries = deliveries
    .filter(d => d.status === "delivered" || d.status === "cancelled")
    .slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refresh data from the server
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!user) return null;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {user.name.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>
            {isDriver ? "Ready for your next delivery?" : "Need something delivered?"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => router.push("/notifications")} 
            style={styles.notificationButton}
          >
            <Bell size={24} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Image 
              source={{ uri: user.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }} 
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <QuickActions isDriver={isDriver} />

      {/* Quick Stats for Drivers */}
      {isDriver && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.success} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={20} color={Colors.warning} />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      )}

      {/* Active Delivery Section */}
      {activeDelivery ? (
        <View style={styles.activeDeliveryContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isDriver ? "Current Delivery" : "Active Order"}
            </Text>
            <TouchableOpacity onPress={() => router.push(`/delivery/${activeDelivery.id}`)}>
              <Text style={styles.seeAllText}>View Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <StatusStepper currentStatus={activeDelivery.status} />
            
            <View style={styles.deliveryDetails}>
              <View style={styles.locationContainer}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {activeDelivery.pickupLocation.address || "Pickup location"}
                </Text>
              </View>
              
              <View style={styles.locationContainer}>
                <MapPin size={16} color={Colors.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {activeDelivery.dropoffLocation.address || "Dropoff location"}
                </Text>
              </View>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Package size={14} color={Colors.textLight} />
                  <Text style={styles.detailText}>{activeDelivery.items}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Clock size={14} color={Colors.textLight} />
                  <Text style={styles.detailText}>
                    {activeDelivery.estimatedTime} mins
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Live Tracking"
                onPress={() => router.push('/live-tracking')}
                style={[styles.trackButton, { flex: 1, marginRight: 8 }]}
                icon={<Navigation size={16} color="white" />}
              />
              <Button
                title="Details"
                variant="outline"
                onPress={() => router.push(`/delivery/${activeDelivery.id}`)}
                style={[styles.trackButton, { flex: 1 }]}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noActiveDeliveryContainer}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }} 
            style={styles.noDeliveryImage}
          />
          <Text style={styles.noDeliveryTitle}>
            {isDriver 
              ? "No active deliveries" 
              : "No active orders"
            }
          </Text>
          <Text style={styles.noDeliveryText}>
            {isDriver 
              ? "You'll see your assigned deliveries here" 
              : "Create a new delivery to get started"
            }
          </Text>
          {!isDriver && (
            <Button
              title="Create New Delivery"
              onPress={() => router.push("/create-delivery")}
              style={styles.createButton}
            />
          )}
        </View>
      )}

      {/* Recent Deliveries Section */}
      {recentDeliveries.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isDriver ? "Recent Deliveries" : "Recent Orders"}
            </Text>
            <TouchableOpacity onPress={() => router.push("/deliveries")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentDeliveries.map(delivery => (
            <DeliveryCard 
              key={delivery.id} 
              delivery={delivery} 
            />
          ))}
        </View>
      )}

      {/* Featured Drivers Section - Only show for customers */}
      {!isDriver && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Drivers</Text>
          </View>

          {mockDrivers
            .filter(driver => driver.rating >= 4.7)
            .map(driver => (
              <DriverCard 
                key={driver.id} 
                driver={driver} 
                onCallPress={() => console.log(`Calling ${driver.name}`)}
              />
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  activeDeliveryContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  noActiveDeliveryContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    margin: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noDeliveryImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  noDeliveryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  noDeliveryText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    width: "100%",
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deliveryDetails: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  trackButton: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
});