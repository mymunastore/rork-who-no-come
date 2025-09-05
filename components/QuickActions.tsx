import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Package, 
  MapPin, 
  Clock, 
  CreditCard,
  History,
  Settings,
  Plus,
  TrendingUp,
  Navigation2,
  BarChart3,
  Bell
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  route?: string;
  onPress?: () => void;
}

interface QuickActionsProps {
  isDriver?: boolean;
}

export function QuickActions({ isDriver = false }: QuickActionsProps) {
  const router = useRouter();

  const customerActions: QuickAction[] = [
    {
      id: 'new-delivery',
      title: 'New Delivery',
      icon: <Plus size={24} color="white" />,
      color: Colors.primary,
      route: '/create-delivery',
    },
    {
      id: 'track',
      title: 'Track Order',
      icon: <MapPin size={24} color="white" />,
      color: Colors.secondary,
      route: '/live-tracking',
    },
    {
      id: 'history',
      title: 'History',
      icon: <History size={24} color="white" />,
      color: Colors.accent,
      route: '/deliveries',
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: <CreditCard size={24} color="white" />,
      color: Colors.info,
      onPress: () => console.log('Payment methods'),
    },
  ];

  const driverActions: QuickAction[] = [
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 size={24} color="white" />,
      color: Colors.success,
      route: '/driver-analytics',
    },
    {
      id: 'optimize',
      title: 'Optimize',
      icon: <Navigation2 size={24} color="white" />,
      color: Colors.primary,
      route: '/route-optimizer',
    },
    {
      id: 'active',
      title: 'Active',
      icon: <Package size={24} color="white" />,
      color: Colors.secondary,
      route: '/deliveries',
    },
    {
      id: 'notifications',
      title: 'Alerts',
      icon: <Bell size={24} color="white" />,
      color: Colors.warning,
      route: '/notifications',
    },
  ];

  const actions = isDriver ? driverActions : customerActions;

  const handlePress = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route as any);
    } else if (action.onPress) {
      action.onPress();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => handlePress(action)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              {action.icon}
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    alignItems: 'center',
    width: 80,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
});