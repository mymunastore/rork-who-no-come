export type UserRole = 'customer' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  rating?: number;
}

export interface Driver extends User {
  role: 'driver';
  vehicleType: string;
  licensePlate: string;
  isOnline: boolean;
  currentLocation?: Location;
  completedDeliveries: number;
  rating: number;
}

export interface Customer extends User {
  role: 'customer';
  savedAddresses: Address[];
  paymentMethods: PaymentMethod[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Address {
  id: string;
  name: string;
  address: string;
  details?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cash';
  details: string;
  isDefault?: boolean;
}

export type DeliveryStatus = 
  | 'pending' 
  | 'accepted' 
  | 'picked_up' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled';

export interface Delivery {
  id: string;
  customerId: string;
  driverId?: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  status: DeliveryStatus;
  items: string;
  notes?: string;
  price: number;
  distance: number;
  estimatedTime: number;
  createdAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
  paymentMethod: PaymentMethod;
  rating?: number;
  review?: string;
}