import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Filter } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";
import { useDelivery } from "@/hooks/delivery-store";
import { DeliveryCard } from "@/components/DeliveryCard";
import { Delivery, DeliveryStatus } from "@/types";

export default function DeliveriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { deliveries, isLoading } = useDelivery();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | "all">("all");
  
  const isDriver = user?.role === "driver";

  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeFilter === "all") return true;
    return delivery.status === activeFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refresh data from the server
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderFilterButton = (filter: DeliveryStatus | "all", label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No deliveries found</Text>
      <Text style={styles.emptyText}>
        {activeFilter !== "all"
          ? `You don't have any ${activeFilter.replace("_", " ")} deliveries`
          : isDriver
          ? "You haven't been assigned any deliveries yet"
          : "You haven't created any deliveries yet"}
      </Text>
      {!isDriver && activeFilter === "all" && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/create-delivery")}
        >
          <Text style={styles.createButtonText}>Create New Delivery</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isDriver ? "My Deliveries" : "My Orders"}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterScroll}>
          {renderFilterButton("all", "All")}
          {renderFilterButton("pending", "Pending")}
          {renderFilterButton("accepted", "Accepted")}
          {renderFilterButton("picked_up", "Picked Up")}
          {renderFilterButton("in_transit", "In Transit")}
          {renderFilterButton("delivered", "Delivered")}
          {renderFilterButton("cancelled", "Cancelled")}
        </View>
      </View>

      <FlatList
        data={filteredDeliveries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <DeliveryCard delivery={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.background,
    fontWeight: "500",
  },
  cardContainer: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  createButtonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 14,
  },
});