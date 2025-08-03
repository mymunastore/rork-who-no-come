import { Address, Customer, Delivery, Driver, PaymentMethod } from "@/types";

export const mockDrivers: Driver[] = [
  {
    id: "d1",
    name: "John Rider",
    email: "john@whnocome.com",
    phone: "+2341234567890",
    role: "driver",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    vehicleType: "Motorcycle - Bajaj",
    licensePlate: "LG-234-KJA",
    isOnline: true,
    currentLocation: {
      latitude: 6.5244,
      longitude: 3.3792,
    },
    completedDeliveries: 342,
    rating: 4.8,
  },
  {
    id: "d2",
    name: "Sarah Speed",
    email: "sarah@whnocome.com",
    phone: "+2341987654321",
    role: "driver",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    vehicleType: "Motorcycle - Honda",
    licensePlate: "KD-567-LAS",
    isOnline: true,
    currentLocation: {
      latitude: 6.5143,
      longitude: 3.3842,
    },
    completedDeliveries: 215,
    rating: 4.9,
  },
  {
    id: "d3",
    name: "Michael Express",
    email: "michael@whnocome.com",
    phone: "+2348765432109",
    role: "driver",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    vehicleType: "Motorcycle - Suzuki",
    licensePlate: "AB-901-XYZ",
    isOnline: false,
    currentLocation: {
      latitude: 6.5344,
      longitude: 3.3692,
    },
    completedDeliveries: 178,
    rating: 4.7,
  },
];

export const mockCustomer: Customer = {
  id: "c1",
  name: "Alex User",
  email: "alex@example.com",
  phone: "+2349876543210",
  role: "customer",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  savedAddresses: [
    {
      id: "a1",
      name: "Home",
      address: "15 Adeola Odeku St, Victoria Island, Lagos",
      latitude: 6.4281,
      longitude: 3.4219,
      isDefault: true,
    },
    {
      id: "a2",
      name: "Work",
      address: "1 Idejo Street, Victoria Island, Lagos",
      latitude: 6.4331,
      longitude: 3.4234,
      isDefault: false,
    },
  ],
  paymentMethods: [
    {
      id: "pm1",
      type: "card",
      details: "**** **** **** 4321",
      isDefault: true,
    },
    {
      id: "pm2",
      type: "wallet",
      details: "PayStack Wallet",
      isDefault: false,
    },
    {
      id: "pm3",
      type: "cash",
      details: "Cash on Delivery",
      isDefault: false,
    },
  ],
};

export const mockDeliveries: Delivery[] = [
  {
    id: "del1",
    customerId: "c1",
    driverId: "d1",
    pickupLocation: {
      latitude: 6.4281,
      longitude: 3.4219,
      address: "15 Adeola Odeku St, Victoria Island, Lagos",
    },
    dropoffLocation: {
      latitude: 6.4561,
      longitude: 3.3841,
      address: "23 Alfred Rewane Road, Ikoyi, Lagos",
    },
    status: "in_transit",
    items: "Documents package",
    notes: "Please call when you arrive",
    price: 1500,
    distance: 5.2,
    estimatedTime: 25,
    createdAt: new Date(),
    paymentMethod: {
      id: "pm1",
      type: "card",
      details: "**** **** **** 4321",
    },
  },
  {
    id: "del2",
    customerId: "c1",
    driverId: "d2",
    pickupLocation: {
      latitude: 6.4331,
      longitude: 3.4234,
      address: "1 Idejo Street, Victoria Island, Lagos",
    },
    dropoffLocation: {
      latitude: 6.4982,
      longitude: 3.3591,
      address: "12 Admiralty Way, Lekki Phase 1, Lagos",
    },
    status: "delivered",
    items: "Food package",
    price: 2000,
    distance: 8.7,
    estimatedTime: 35,
    createdAt: new Date(Date.now() - 86400000), // Yesterday
    completedAt: new Date(Date.now() - 86400000 + 2400000), // 40 minutes after creation
    paymentMethod: {
      id: "pm3",
      type: "cash",
      details: "Cash on Delivery",
    },
    rating: 5,
    review: "Very fast delivery, excellent service!",
  },
  {
    id: "del3",
    customerId: "c1",
    pickupLocation: {
      latitude: 6.4281,
      longitude: 3.4219,
      address: "15 Adeola Odeku St, Victoria Island, Lagos",
    },
    dropoffLocation: {
      latitude: 6.6018,
      longitude: 3.3515,
      address: "Ikeja City Mall, Alausa, Ikeja, Lagos",
    },
    status: "pending",
    items: "Gift package",
    notes: "Fragile items, handle with care",
    price: 3500,
    distance: 18.3,
    estimatedTime: 55,
    createdAt: new Date(),
    scheduledFor: new Date(Date.now() + 7200000), // 2 hours from now
    paymentMethod: {
      id: "pm2",
      type: "wallet",
      details: "PayStack Wallet",
    },
  },
];

export const getNearbyDrivers = (latitude: number, longitude: number): Driver[] => {
  // In a real app, this would filter drivers based on proximity
  return mockDrivers.filter(driver => driver.isOnline);
};

export const getAddressSuggestions = async (query: string): Promise<Address[]> => {
  // Mock function to simulate address search
  if (!query || query.length < 3) return [];
  
  // Sample addresses based on query
  const suggestions: Address[] = [
    {
      id: `sugg-${Date.now()}-1`,
      name: "Business",
      address: `${query} Business Center, Victoria Island, Lagos`,
      latitude: 6.4281 + (Math.random() * 0.02),
      longitude: 3.4219 + (Math.random() * 0.02),
    },
    {
      id: `sugg-${Date.now()}-2`,
      name: "Residence",
      address: `${query} Apartments, Lekki Phase 1, Lagos`,
      latitude: 6.4561 + (Math.random() * 0.02),
      longitude: 3.3841 + (Math.random() * 0.02),
    },
    {
      id: `sugg-${Date.now()}-3`,
      name: "Mall",
      address: `${query} Shopping Mall, Ikeja, Lagos`,
      latitude: 6.6018 + (Math.random() * 0.02),
      longitude: 3.3515 + (Math.random() * 0.02),
    },
  ];
  
  return suggestions;
};