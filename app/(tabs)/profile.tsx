import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { 
  User, 
  Mail, 
  Phone, 
  LogOut, 
  MapPin, 
  CreditCard, 
  Settings, 
  Bell, 
  HelpCircle, 
  ChevronRight,
  Truck
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";
import { Driver } from "@/types";
import { Button } from "@/components/Button";
import { RatingStars } from "@/components/RatingStars";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [isOnline, setIsOnline] = useState(true);
  
  if (!user) return null;
  
  const isDriver = user.role === "driver";
  const driver = isDriver ? user as Driver : undefined;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
            router.replace("/auth");
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderProfileItem = (
    icon: React.ReactNode,
    title: string,
    value: string,
    action?: () => void
  ) => (
    <TouchableOpacity 
      style={styles.profileItem}
      onPress={action}
      disabled={!action}
    >
      <View style={styles.profileItemLeft}>
        {icon}
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {action && <ChevronRight size={20} color={Colors.textLight} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>
              {isDriver ? "Driver" : "Customer"}
            </Text>
            {isDriver && driver?.rating && (
              <View style={styles.ratingContainer}>
                <RatingStars 
                  rating={driver.rating} 
                  size={16} 
                  showLabel
                />
              </View>
            )}
          </View>
        </View>

        {isDriver && (
          <View style={styles.onlineStatusContainer}>
            <Text style={styles.onlineStatusLabel}>
              {isOnline ? "You are online" : "You are offline"}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={isOnline ? Colors.primary : Colors.textLight}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        {renderProfileItem(
          <User size={20} color={Colors.primary} />,
          "Full Name",
          user.name
        )}
        
        {renderProfileItem(
          <Mail size={20} color={Colors.primary} />,
          "Email",
          user.email
        )}
        
        {renderProfileItem(
          <Phone size={20} color={Colors.primary} />,
          "Phone",
          user.phone
        )}

        {isDriver && (
          <>
            {renderProfileItem(
              <Truck size={20} color={Colors.primary} />,
              "Vehicle Type",
              driver?.vehicleType || "Not specified"
            )}
            
            {renderProfileItem(
              <Truck size={20} color={Colors.primary} />,
              "License Plate",
              driver?.licensePlate || "Not specified"
            )}
          </>
        )}
      </View>

      {!isDriver && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          
          {renderProfileItem(
            <MapPin size={20} color={Colors.secondary} />,
            "Home",
            "15 Adeola Odeku St, Victoria Island, Lagos",
            () => console.log("Edit home address")
          )}
          
          {renderProfileItem(
            <MapPin size={20} color={Colors.secondary} />,
            "Work",
            "1 Idejo Street, Victoria Island, Lagos",
            () => console.log("Edit work address")
          )}
          
          <Button
            title="Add New Address"
            variant="outline"
            onPress={() => console.log("Add new address")}
            style={styles.addButton}
          />
        </View>
      )}

      {!isDriver && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          
          {renderProfileItem(
            <CreditCard size={20} color={Colors.accent} />,
            "Credit Card",
            "**** **** **** 4321",
            () => console.log("Edit credit card")
          )}
          
          {renderProfileItem(
            <CreditCard size={20} color={Colors.accent} />,
            "PayStack Wallet",
            "Connected",
            () => console.log("Edit PayStack wallet")
          )}
          
          <Button
            title="Add Payment Method"
            variant="outline"
            onPress={() => console.log("Add payment method")}
            style={styles.addButton}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        {renderProfileItem(
          <Bell size={20} color={Colors.info} />,
          "Notifications",
          "Manage notifications",
          () => console.log("Manage notifications")
        )}
        
        {renderProfileItem(
          <Settings size={20} color={Colors.info} />,
          "App Settings",
          "Language, theme, etc.",
          () => console.log("App settings")
        )}
        
        {renderProfileItem(
          <HelpCircle size={20} color={Colors.info} />,
          "Help & Support",
          "Get help, contact support",
          () => console.log("Help and support")
        )}
      </View>

      <Button
        title="Logout"
        variant="outline"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon={<LogOut size={20} color={Colors.error} />}
        textStyle={{ color: Colors.error }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 4,
  },
  ratingContainer: {
    alignItems: "flex-start",
  },
  onlineStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  onlineStatusLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  section: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 14,
    color: Colors.textLight,
  },
  addButton: {
    marginTop: 16,
  },
  logoutButton: {
    margin: 16,
    marginBottom: 32,
    borderColor: Colors.error,
  },
});