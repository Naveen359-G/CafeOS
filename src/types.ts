import { MenuItem, SeatingZone } from './data/menu';
export type { MenuItem, SeatingZone };

export type VisitIntent = 'deep_work' | 'meeting' | 'unwind' | 'surprise_me';

export interface UserPreferences {
  userName: string;
  tableNumber: string;
  membershipCode: string;
  intent: VisitIntent;
  drinkType: 'coffee' | 'tea' | 'any';
  temperature: 'hot' | 'iced' | 'any';
  dietary: 'none' | 'dairy_free' | 'vegan' | 'oat_milk' | 'decaf' | 'nut_free';
  budget: number;
}

export interface RecommendationResult {
  greeting: string;
  drink: MenuItem;
  foodPairing: MenuItem;
  totalEstimatedPrice: number;
  pairingReason: string;
  intentFitExplanation: string;
  suggestedZone: 'Focus Corner' | 'Social Table' | 'Cozy Lounge' | 'Barista Tasting Bench';
  zoneReason: string;
  ambientSoundtrack: string;
  demoQueueEstimateMinutes: number;
  isAiGenerated: boolean;
  aiModelUsed?: string;
  offlineNotice?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

export interface DemoOrder {
  id: string;
  tokenNumber: string;
  customerName: string;
  tableNumber?: string;
  membershipCode?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number; // timestamp in ms
  updatedAt: number;
  preparationStartedAt?: number;
  readyAt?: number;
  completedAt?: number;
  prepWarningThresholdMinutes: number;
  specialInstructions?: string;
  zone: string;
  paymentMethod: string;
}

export interface CustomerFeedback {
  id: string;
  orderToken?: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  timestamp: string;
}

export interface VibeBeacon {
  id: string;
  author: string;
  zone: string;
  vibe: string;
  statusNote: string;
  seekingChat: boolean;
  timestamp: string;
}

export interface ZoneOccupancy {
  name: string;
  recommendedIntent: string;
  noiseLevel: string;
  totalSeats: number;
  occupiedSeats: number;
  powerOutlets: string;
}

export interface CheckInRecord {
  id: string;
  timestamp: string;
  type: 'visit_checkin' | 'order_placed';
  orderToken?: string;
  tableNumber?: string;
  stampsAwarded: number;
  note?: string;
}

export interface LoyaltyProfile {
  customerId: string; // e.g. "CID-8492" or "MEM-88"
  customerName: string;
  membershipCode: string;
  stamps: number; // 0 to 8
  weeklyStampCount: number; // max 2 per calendar week
  lastStampWeekKey?: string;
  unlockedRewards: number;
  morningVisits: number;
  deepWorkSessions: number;
  meetingSessions: number;
  uniqueDrinksTried: string[];
  totalVisits: number;
  lastCheckIn?: string;
  checkInHistory: CheckInRecord[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progressText: string;
}

export interface ReturningCustomer {
  membershipCode: string;
  name: string;
  favoriteDrink: string;
  favoriteSnack: string;
  frequentIntent: VisitIntent;
  pastOrders: string[];
}
