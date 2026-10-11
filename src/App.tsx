import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { RoleSwitcher, ActiveRole } from './components/RoleSwitcher';
import { LoginModal } from './components/LoginModal';
import { SmartWelcome } from './components/SmartWelcome';
import { AiBaristaForm } from './components/AiBaristaForm';
import { RecommendationCard } from './components/RecommendationCard';
import { MenuBrowser } from './components/MenuBrowser';
import { InteractiveFloorMap } from './components/InteractiveFloorMap';
import { RoomVibeBoard } from './components/RoomVibeBoard';
import { KitchenDisplay } from './components/KitchenDisplay';
import { ManagerView } from './components/ManagerView';
import { CafeLoyalty } from './components/CafeLoyalty';
import { ReturningCustomerModal } from './components/ReturningCustomerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { CafePulse } from './components/CafePulse';
import { LiveOrderBanner } from './components/LiveOrderBanner';
import { AiProductReviewsSpotlight } from './components/AiProductReviewsSpotlight';
import { playStatusChime } from './utils/audioChime';
import { useOrderStatusPolling } from './hooks/useOrderStatusPolling';
import {
  VisitIntent,
  UserPreferences,
  RecommendationResult,
  CartItem,
  DemoOrder,
  OrderStatus,
  CustomerFeedback,
  VibeBeacon,
  ZoneOccupancy,
  LoyaltyProfile,
  AchievementBadge,
  ReturningCustomer,
  MenuItem,
  CheckInRecord,
} from './types';
import { ALL_MENU_ITEMS, SEATING_ZONES } from './data/menu';

export function getStableCustomerId(name: string, membershipCode?: string): string {
  if (membershipCode && membershipCode.trim()) return membershipCode.trim();
  if (!name || !name.trim()) return 'CID-8492';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idNum = Math.abs(hash % 9000) + 1000;
  return `CID-${idNum}`;
}

const INITIAL_BEACONS: VibeBeacon[] = [
  {
    id: 'b-1',
    author: 'Elena R.',
    zone: 'Focus Corner',
    vibe: 'Heads-Down Focus',
    statusNote: 'Writing microservice specs for Cloud Run. Cortado was on point.',
    seekingChat: false,
    timestamp: '15 mins ago',
  },
  {
    id: 'b-2',
    author: 'Kiran M.',
    zone: 'Social Table',
    vibe: 'Open to Friendly Chat',
    statusNote: 'Brainstorming prompt engineering techniques. Open to brainstorm over filter brew!',
    seekingChat: true,
    timestamp: '25 mins ago',
  },
  {
    id: 'b-3',
    author: 'David S.',
    zone: 'Cozy Lounge',
    vibe: 'Gentle Unwind',
    statusNote: 'Reading architectural case studies with ceremonial matcha.',
    seekingChat: false,
    timestamp: '40 mins ago',
  },
];

const INITIAL_LOYALTY: LoyaltyProfile = {
  customerId: 'CID-8492',
  customerName: 'Valued Guest',
  membershipCode: 'MEM-88',
  stamps: 3,
  weeklyStampCount: 1,
  unlockedRewards: 0,
  morningVisits: 2,
  deepWorkSessions: 3,
  meetingSessions: 1,
  uniqueDrinksTried: ['cortado', 'ceremonial-matcha-latte', 'vanilla-cold-brew'],
  totalVisits: 4,
  lastCheckIn: 'Today at 09:30 AM',
  checkInHistory: [
    {
      id: 'chk-init-1',
      timestamp: 'Today at 09:30 AM',
      type: 'visit_checkin',
      tableNumber: 'Table 4',
      stampsAwarded: 1,
    },
    {
      id: 'chk-init-2',
      timestamp: 'Yesterday at 04:15 PM',
      type: 'order_placed',
      orderToken: '#CF-101',
      tableNumber: 'Table 3',
      stampsAwarded: 1,
    },
    {
      id: 'chk-init-3',
      timestamp: '3 days ago at 10:00 AM',
      type: 'visit_checkin',
      tableNumber: 'Focus Corner',
      stampsAwarded: 1,
    },
  ],
};

export default function App() {
  // Role Management
  const [activeRole, setActiveRole] = useState<ActiveRole>('customer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cafeos_admin_logged') === 'true';
  });
  const [isChefLoggedIn, setIsChefLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cafeos_chef_logged') === 'true';
  });
  const [loginModalRole, setLoginModalRole] = useState<'admin' | 'chef' | null>(null);

  // Customer Navigation Tab
  const [customerTab, setCustomerTab] = useState<'experience' | 'menu' | 'vibe' | 'loyalty' | 'pulse'>('experience');

  // Customer Preferences State (Persisted in localStorage)
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('cafeos_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          userName: parsed.userName || '',
          tableNumber: parsed.tableNumber || '',
          membershipCode: parsed.membershipCode || 'CAFE-VIP',
          intent: parsed.intent || 'deep_work',
          drinkType: parsed.drinkType || 'any',
          temperature: parsed.temperature || 'any',
          dietary: parsed.dietary || 'none',
          budget: parsed.budget || 450,
        };
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      userName: '',
      tableNumber: '',
      membershipCode: 'CAFE-VIP',
      intent: 'deep_work',
      drinkType: 'any',
      temperature: 'any',
      dietary: 'none',
      budget: 450,
    };
  });

  // AI Recommendation State
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState<boolean>(false);
  const [streamingRecText, setStreamingRecText] = useState<string>('');
  const [recError, setRecError] = useState<string | null>(null);
  const [addedPairing, setAddedPairing] = useState<boolean>(false);

  // Dynamic Menu Items (synced with server)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(ALL_MENU_ITEMS);

  // Shared Orders State & polling hook managed below

  // Floor Map Occupancy Data
  const [occupancyData, setOccupancyData] = useState<Record<string, ZoneOccupancy>>({
    'Focus Corner': {
      name: 'Focus Corner',
      recommendedIntent: 'Deep Work',
      noiseLevel: 'Quiet (40 dB)',
      totalSeats: 6,
      occupiedSeats: 4,
      powerOutlets: 'Dedicated surge socket & USB-C at each desk',
    },
    'Social Table': {
      name: 'Social Table',
      recommendedIntent: 'Meeting',
      noiseLevel: 'Lively Buzz (65 dB)',
      totalSeats: 10,
      occupiedSeats: 5,
      powerOutlets: 'Center-run pop-up power strip',
    },
    'Cozy Lounge': {
      name: 'Cozy Lounge',
      recommendedIntent: 'Unwind',
      noiseLevel: 'Mellow Warmth (50 dB)',
      totalSeats: 6,
      occupiedSeats: 3,
      powerOutlets: 'Wall sockets available',
    },
    'Barista Tasting Bench': {
      name: 'Barista Tasting Bench',
      recommendedIntent: 'Surprise Me',
      noiseLevel: 'Artisanal Buzz (58 dB)',
      totalSeats: 4,
      occupiedSeats: 2,
      powerOutlets: 'Under-counter wireless charging pads',
    },
  });
  const [selectedFloorZone, setSelectedFloorZone] = useState<string>('Focus Corner');

  // Customer Loyalty & Member State
  const [loyalty, setLoyalty] = useState<LoyaltyProfile>(() => {
    try {
      const saved = localStorage.getItem('cafeos_loyalty');
      return saved ? JSON.parse(saved) : INITIAL_LOYALTY;
    } catch {
      return INITIAL_LOYALTY;
    }
  });

  const [activeMember, setActiveMember] = useState<ReturningCustomer | null>(() => {
    try {
      const saved = localStorage.getItem('cafeos_active_member');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [hasRedeemedReward, setHasRedeemedReward] = useState<boolean>(false);

  // Feedbacks & Beacons
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [beacons, setBeacons] = useState<VibeBeacon[]>(() => {
    try {
      const saved = localStorage.getItem('cafeos_beacons');
      return saved ? JSON.parse(saved) : INITIAL_BEACONS;
    } catch {
      return INITIAL_BEACONS;
    }
  });

  // Cart & Modals
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cafeos_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Customer active order tracking & real-time order status polling hook
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cafeos_tracked_order_id');
    } catch {
      return null;
    }
  });
  const prevRoleRef = useRef<ActiveRole>(activeRole);

  const {
    orders,
    setOrders,
    fetchOrders,
    statusNotification,
    setStatusNotification,
    lastReportedStatus,
  } = useOrderStatusPolling(activeRole, trackedOrderId);

  // Load customer account from browser storage (keyed by customerId or name)
  const loadCustomerAccount = useCallback((name: string, membershipCode?: string): LoyaltyProfile => {
    const custId = getStableCustomerId(name, membershipCode);
    try {
      const storedMap = localStorage.getItem('cafeos_customer_accounts');
      if (storedMap) {
        const parsed = JSON.parse(storedMap);
        const account = parsed[custId] || (name.trim() ? parsed[name.trim().toLowerCase()] : null);
        if (account) {
          return account as LoyaltyProfile;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      ...INITIAL_LOYALTY,
      customerId: custId,
      customerName: name.trim() || 'Valued Guest',
      membershipCode: membershipCode || 'CAFE-VIP',
    };
  }, []);

  // Sync customer account on name/member code change
  useEffect(() => {
    if (preferences.userName) {
      const acc = loadCustomerAccount(preferences.userName, preferences.membershipCode);
      setLoyalty(acc);
    }
  }, [preferences.userName, preferences.membershipCode, loadCustomerAccount]);

  // Digital Check-In handler (stamps digital card under customer account in browser storage)
  const handleDigitalCheckIn = useCallback((type: 'visit_checkin' | 'order_placement', orderToken?: string) => {
    const custId = getStableCustomerId(preferences.userName, preferences.membershipCode);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';

    setLoyalty((prev) => {
      const nextStamps = Math.min(8, prev.stamps + 1);
      const unlocked = nextStamps === 8 ? prev.unlockedRewards + 1 : prev.unlockedRewards;
      const newEntry: CheckInRecord = {
        id: `chk-${Date.now()}`,
        timestamp: nowStr,
        type: type === 'order_placement' ? 'order_placed' : 'visit_checkin',
        orderToken,
        tableNumber: preferences.tableNumber || undefined,
        stampsAwarded: 1,
      };

      const updatedProfile: LoyaltyProfile = {
        ...prev,
        customerId: custId,
        customerName: preferences.userName || 'Valued Guest',
        stamps: nextStamps,
        totalVisits: prev.totalVisits + 1,
        unlockedRewards: unlocked,
        lastCheckIn: nowStr,
        checkInHistory: [newEntry, ...(prev.checkInHistory || [])],
      };

      try {
        const storedMap = localStorage.getItem('cafeos_customer_accounts');
        const accounts = storedMap ? JSON.parse(storedMap) : {};
        accounts[custId] = updatedProfile;
        if (preferences.userName.trim()) {
          accounts[preferences.userName.trim().toLowerCase()] = updatedProfile;
        }
        localStorage.setItem('cafeos_customer_accounts', JSON.stringify(accounts));
        localStorage.setItem('cafeos_loyalty', JSON.stringify(updatedProfile));
      } catch (e) {
        console.warn(e);
      }

      return updatedProfile;
    });
  }, [preferences.userName, preferences.membershipCode, preferences.tableNumber]);

  // URL Path Detection for /admin and /chef
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === '/admin') {
      if (isAdminLoggedIn) {
        setActiveRole('admin');
      } else {
        setLoginModalRole('admin');
      }
    } else if (pathname === '/chef') {
      if (isChefLoggedIn) {
        setActiveRole('chef');
      } else {
        setLoginModalRole('chef');
      }
    }
  }, [isAdminLoggedIn, isChefLoggedIn]);

  // fetchOrders is provided by useOrderStatusPolling hook above

  // Sync Menu with Server
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (data.allItems && data.allItems.length > 0) {
          setMenuItems(data.allItems);
        }
      }
    } catch (e) {
      console.warn('Menu sync error:', e);
    }
  }, []);

  // Sync Occupancy with Server
  const fetchOccupancy = useCallback(async () => {
    try {
      const res = await fetch('/api/occupancy');
      if (res.ok) {
        const data = await res.json();
        if (data.zones) setOccupancyData(data.zones);
      }
    } catch (e) {
      console.warn('Occupancy sync error:', e);
    }
  }, []);

  // Sync Feedbacks with Server
  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch('/api/feedbacks');
      if (res.ok) {
        const data = await res.json();
        if (data.feedbacks) setFeedbacks(data.feedbacks);
      }
    } catch (e) {
      console.warn('Feedbacks sync error:', e);
    }
  }, []);

  // Polling hook every 3.5s for occupancy and auxiliary sync
  useEffect(() => {
    fetchMenu();
    fetchOccupancy();
    fetchFeedbacks();

    const interval = setInterval(() => {
      fetchOccupancy();
    }, 3500);

    return () => clearInterval(interval);
  }, [fetchMenu, fetchOccupancy, fetchFeedbacks]);

  // Persist LocalStorage items
  useEffect(() => {
    try {
      localStorage.setItem('cafeos_user_profile', JSON.stringify(preferences));
    } catch (e) {
      console.warn(e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      if (activeMember) {
        localStorage.setItem('cafeos_active_member', JSON.stringify(activeMember));
      } else {
        localStorage.removeItem('cafeos_active_member');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [activeMember]);

  useEffect(() => {
    try {
      localStorage.setItem('cafeos_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('cafeos_loyalty', JSON.stringify(loyalty));
    } catch (e) {
      console.warn(e);
    }
  }, [loyalty]);

  useEffect(() => {
    try {
      localStorage.setItem('cafeos_beacons', JSON.stringify(beacons));
    } catch (e) {
      console.warn(e);
    }
  }, [beacons]);

  // Total cart calculation
  const cartTotal = cartItems.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const cartCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  // Dynamic achievement badges based on genuine demo activity
  const earnedBadges: AchievementBadge[] = [
    {
      id: 'morning-regular',
      title: 'Morning Regular',
      description: 'Awarded after 3 qualifying morning visits to start your day.',
      icon: 'Clock',
      earned: loyalty.morningVisits >= 3,
      progressText: `${loyalty.morningVisits} / 3 Morning Visits`,
    },
    {
      id: 'focus-master',
      title: 'Focus Master',
      description: 'Awarded after 5 Deep Work productivity sessions.',
      icon: 'Laptop',
      earned: loyalty.deepWorkSessions >= 5,
      progressText: `${loyalty.deepWorkSessions} / 5 Deep Work Sessions`,
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Awarded after 3 collaborative Meeting sessions at the Social Table.',
      icon: 'Users',
      earned: loyalty.meetingSessions >= 3,
      progressText: `${loyalty.meetingSessions} / 3 Meeting Sessions`,
    },
    {
      id: 'coffee-explorer',
      title: 'Coffee Explorer',
      description: 'Awarded after tasting 5 different artisanal drinks from the roaster.',
      icon: 'Compass',
      earned: loyalty.uniqueDrinksTried.length >= 5,
      progressText: `${loyalty.uniqueDrinksTried.length} / 5 Drinks Tasted`,
    },
    {
      id: 'loyal-companion',
      title: 'Loyal Café Companion',
      description: 'Awarded after 8 qualifying visits and ongoing café loyalty.',
      icon: 'Heart',
      earned: loyalty.totalVisits >= 8,
      progressText: `${loyalty.totalVisits} / 8 Total Visits`,
    },
  ];

  // Role Switching Logic
  const handleRoleChange = (role: ActiveRole) => {
    if (role === 'admin') {
      if (!isAdminLoggedIn) {
        setLoginModalRole('admin');
        return;
      }
    } else if (role === 'chef') {
      if (!isChefLoggedIn) {
        setLoginModalRole('chef');
        return;
      }
    }

    const prevRole = activeRole;
    setActiveRole(role);
    prevRoleRef.current = prevRole;

    // When switching back to customer from chef or admin, check status
    if (role === 'customer' && prevRole !== 'customer' && trackedOrderId) {
      const curOrder = orders.find((o) => o.id === trackedOrderId);
      if (curOrder) {
        if (curOrder.status === 'preparing') {
          playStatusChime('preparing');
          setStatusNotification(`☕ Live Status: Chef is preparing your order (${curOrder.tokenNumber}).`);
        } else if (curOrder.status === 'ready') {
          playStatusChime('ready');
          setStatusNotification(`🎉 In-App Toast: Order ${curOrder.tokenNumber} is READY for collection!`);
        }
      }
    }
  };

  const handleLoginSuccess = (role: 'admin' | 'chef') => {
    if (role === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('cafeos_admin_logged', 'true');
      setActiveRole('admin');
    } else {
      setIsChefLoggedIn(true);
      localStorage.setItem('cafeos_chef_logged', 'true');
      setActiveRole('chef');
    }
  };

  const handleLogoutRole = (role: 'admin' | 'chef') => {
    if (role === 'admin') {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('cafeos_admin_logged');
    } else {
      setIsChefLoggedIn(false);
      localStorage.removeItem('cafeos_chef_logged');
    }
    setActiveRole('customer');
  };

  // Trigger Gemini AI Barista Recommendation with streaming response support
  const handleGenerateRecommendation = async () => {
    setIsLoadingRec(true);
    setStreamingRecText('Connecting to Barista Sommelier (Streaming AI)...');
    setRecError(null);
    setAddedPairing(false);

    try {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: preferences.intent,
          drinkType: preferences.drinkType,
          temperature: preferences.temperature,
          dietary: preferences.dietary,
          budget: preferences.budget,
          userName: preferences.userName || activeMember?.name || '',
          timeOfDay,
          tableNumber: preferences.tableNumber,
          membershipCode: preferences.membershipCode || activeMember?.membershipCode || '',
          previousOrders: activeMember?.pastOrders || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalRecData: any = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.fullText) {
                  setStreamingRecText(`Crafting pairing: ${json.fullText.slice(0, 110)}...`);
                }
                if (json.done && json.result) {
                  finalRecData = json.result;
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        if (finalRecData) {
          setRecommendation(finalRecData);
          if (finalRecData.suggestedZone) {
            setSelectedFloorZone(finalRecData.suggestedZone);
          }
        } else {
          const data = await response.json();
          setRecommendation(data);
          if (data.suggestedZone) {
            setSelectedFloorZone(data.suggestedZone);
          }
        }
      } else {
        const data = await response.json();
        setRecommendation(data);
        if (data.suggestedZone) {
          setSelectedFloorZone(data.suggestedZone);
        }
      }

      // Record activity towards badges
      setLoyalty((prev) => ({
        ...prev,
        totalVisits: prev.totalVisits + 1,
        morningVisits: timeOfDay === 'morning' ? prev.morningVisits + 1 : prev.morningVisits,
        deepWorkSessions: preferences.intent === 'deep_work' ? prev.deepWorkSessions + 1 : prev.deepWorkSessions,
        meetingSessions: preferences.intent === 'meeting' ? prev.meetingSessions + 1 : prev.meetingSessions,
      }));

      // Auto-scroll to recommendation card
      setTimeout(() => {
        const el = document.getElementById('recommendation-anchor');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Failed to get recommendation:', err);
      setRecError(err.message || 'Could not connect to Barista API');
    } finally {
      setIsLoadingRec(false);
      setStreamingRecText('');
    }
  };

  // Cart Management
  const handleAddItem = (item: MenuItem, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleAddPairing = (drink: MenuItem, snack: MenuItem) => {
    handleAddItem(drink, 1);
    handleAddItem(snack, 1);
    setAddedPairing(true);
    setTimeout(() => setAddedPairing(false), 2200);
  };

  // Confirm Demo Order & Post to Shared Orders Store
  const handleConfirmOrder = async (details: {
    customerName: string;
    tableNumber: string;
    paymentMethod: string;
    specialInstructions: string;
    membershipCode: string;
  }) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: details.customerName,
          tableNumber: details.tableNumber,
          membershipCode: details.membershipCode,
          items: cartItems,
          specialInstructions: details.specialInstructions,
          zone: recommendation?.suggestedZone || selectedFloorZone || 'Focus Corner',
          paymentMethod: details.paymentMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const createdOrder: DemoOrder = data.order;
        setOrders((prev) => [createdOrder, ...prev]);

        // Synchronize customer profile name and table number with confirmed order
        setPreferences((prev) => ({
          ...prev,
          userName: details.customerName,
          tableNumber: details.tableNumber !== 'Pickup Counter' ? details.tableNumber : prev.tableNumber,
          membershipCode: details.membershipCode || prev.membershipCode,
        }));

        if (details.customerName) {
          setActiveMember((prev) =>
            prev
              ? { ...prev, name: details.customerName }
              : {
                  name: details.customerName,
                  membershipCode: details.membershipCode || 'CAFE-VIP',
                  favoriteDrink: cartItems[0]?.item.name || 'Cortado',
                  favoriteSnack: cartItems[1]?.item.name || 'Almond Butter Croissant',
                  frequentIntent: preferences.intent,
                  pastOrders: [cartItems.map((c) => c.item.name).join(' + ')],
                }
          );
        }

        // Award loyalty stamps (1 per completed purchase, max 2 stamps per calendar week rule)
        setLoyalty((prev) => {
          const nextStamps = Math.min(8, prev.stamps + 1);
          const unlocked = nextStamps === 8 ? prev.unlockedRewards + 1 : prev.unlockedRewards;
          const drinkIds = cartItems
            .filter((i) => i.item.category === 'drink')
            .map((i) => i.item.id);
          const uniqueDrinks = Array.from(new Set([...prev.uniqueDrinksTried, ...drinkIds]));

          return {
            ...prev,
            stamps: nextStamps,
            unlockedRewards: unlocked,
            uniqueDrinksTried: uniqueDrinks,
          };
        });

        // Track order for live notifications & role switching
        setTrackedOrderId(createdOrder.id);
        localStorage.setItem('cafeos_tracked_order_id', createdOrder.id);
        setStatusNotification(`✓ Order ${createdOrder.tokenNumber} placed! Sent directly to Kitchen Display.`);

        // Digital check-in and stamp award under individual customer ID in browser storage
        handleDigitalCheckIn('order_placement', createdOrder.tokenNumber);

        setCartItems([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);

        // Open live tracking modal
        setActiveTrackingOrderId(createdOrder.id);
        setIsTrackerOpen(true);
      }
    } catch (e) {
      console.error('Failed to create order on server:', e);
    }
  };

  // Kitchen Status Progression Handler
  const handleKitchenUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleKitchenUpdateThreshold = async (orderId: string, minutes: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/threshold`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (e) {
      console.error('Failed to update threshold:', e);
    }
  };

  // Menu Management CRUD Handlers (Manager)
  const handleAddMenuItem = async (newItem: Partial<MenuItem>) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems((prev) => [...prev, data.item]);
      }
    } catch (e) {
      console.error('Failed to add menu item:', e);
    }
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems((prev) => prev.map((m) => (m.id === id ? data.item : m)));
      }
    } catch (e) {
      console.error('Failed to update menu item:', e);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuItems((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete menu item:', e);
    }
  };

  // Feedback Management
  const handleAddFeedback = async (fb: Omit<CustomerFeedback, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fb),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks((prev) => [data.feedback, ...prev]);
      }
    } catch (e) {
      console.error('Failed to submit feedback:', e);
    }
  };

  // Reorder Favorite Combo
  const handleReorderFavorite = (drinkName: string, snackName: string) => {
    const drinkItem = menuItems.find((m) => m.name.toLowerCase() === drinkName.toLowerCase()) || menuItems[0];
    const snackItem = menuItems.find((m) => m.name.toLowerCase() === snackName.toLowerCase()) || menuItems[8];
    handleAddItem(drinkItem, 1);
    handleAddItem(snackItem, 1);
    setIsCartOpen(true);
  };

  // Active tracking order lookup from live shared orders
  const activeTrackingOrder = orders.find((o) => o.id === activeTrackingOrderId) || orders[0] || null;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#261B16] flex flex-col font-sans">
      {/* Role Switcher Bar at Top */}
      <RoleSwitcher
        activeRole={activeRole}
        onChangeRole={handleRoleChange}
        isAdminLoggedIn={isAdminLoggedIn}
        isChefLoggedIn={isChefLoggedIn}
        onLogoutRole={handleLogoutRole}
      />

      {/* Header (Visible in Customer View) */}
      {activeRole === 'customer' && (
        <Header
          activeTab={customerTab}
          setActiveTab={setCustomerTab}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onOpenCart={() => setIsCartOpen(true)}
          userName={preferences.userName || activeMember?.name || ''}
          tableNumber={preferences.tableNumber}
          activeMember={activeMember}
          onOpenMemberModal={() => setIsMemberModalOpen(true)}
          earnedBadgeCount={earnedBadges.filter((b) => b.earned).length}
        />
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* VIEW 1: KITCHEN DISPLAY SYSTEM (CHEF) */}
        {activeRole === 'chef' && (
          <KitchenDisplay
            orders={orders}
            onUpdateStatus={handleKitchenUpdateStatus}
            onUpdateThreshold={handleKitchenUpdateThreshold}
            onRefreshOrders={fetchOrders}
          />
        )}

        {/* VIEW 2: MANAGER PORTAL (ADMIN) */}
        {activeRole === 'admin' && (
          <ManagerView
            orders={orders}
            feedbacks={feedbacks}
            menuItems={menuItems}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onRefreshData={fetchOrders}
          />
        )}

        {/* VIEW 3: CUSTOMER EXPERIENCE */}
        {activeRole === 'customer' && (
          <>
            {/* Live Order Banner & Real-Time Status Notification */}
            <LiveOrderBanner
              order={orders.find((o) => o.id === trackedOrderId) || null}
              notificationMessage={statusNotification}
              onDismissNotification={() => setStatusNotification(null)}
              onOpenTracker={(orderId) => {
                setActiveTrackingOrderId(orderId);
                setIsTrackerOpen(true);
              }}
            />

            {/* Tab: Experience (Smart Welcome + AI Barista + Recommendation) */}
            {customerTab === 'experience' && (
              <div className="space-y-8">
                <SmartWelcome
                  intent={preferences.intent}
                  setIntent={(intent) => {
                    setPreferences((p) => ({ ...p, intent }));
                    // Map intent to floor zone
                    if (intent === 'deep_work') setSelectedFloorZone('Focus Corner');
                    else if (intent === 'meeting') setSelectedFloorZone('Social Table');
                    else if (intent === 'unwind') setSelectedFloorZone('Cozy Lounge');
                    else setSelectedFloorZone('Barista Tasting Bench');
                  }}
                  userName={preferences.userName || activeMember?.name || ''}
                  setUserName={(name) => {
                    setPreferences((p) => ({ ...p, userName: name }));
                    if (name.trim()) {
                      setActiveMember((prev) =>
                        prev
                          ? { ...prev, name: name.trim() }
                          : {
                              name: name.trim(),
                              membershipCode: preferences.membershipCode || 'CAFE-VIP',
                              favoriteDrink: 'Cortado',
                              favoriteSnack: 'Almond Butter Croissant',
                              frequentIntent: preferences.intent,
                              pastOrders: ['Cortado + Almond Butter Croissant'],
                            }
                      );
                    }
                  }}
                  tableNumber={preferences.tableNumber}
                  setTableNumber={(t) => setPreferences((p) => ({ ...p, tableNumber: t }))}
                  onProceed={() => {
                    const el = document.getElementById('taste-profile-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                <div id="taste-profile-section">
                  <AiBaristaForm
                    preferences={preferences}
                    setPreferences={setPreferences}
                    onGenerate={handleGenerateRecommendation}
                    isLoading={isLoadingRec}
                    error={recError}
                    onRetry={handleGenerateRecommendation}
                    streamingText={streamingRecText}
                  />
                </div>

                {recommendation && (
                  <div id="recommendation-anchor">
                    <RecommendationCard
                      recommendation={recommendation}
                      onAddPairing={handleAddPairing}
                      onAddSingleItem={(item) => handleAddItem(item, 1)}
                      addedPairing={addedPairing}
                    />
                  </div>
                )}

                {/* AI Product Reviews & Guest Sentiment Spotlight */}
                <AiProductReviewsSpotlight feedbacks={feedbacks} />
              </div>
            )}

            {/* Tab: Full Specialty Menu */}
            {customerTab === 'menu' && (
              <MenuBrowser onAddItem={(item) => handleAddItem(item, 1)} />
            )}

            {/* Tab: Interactive Room Vibe & Floor Map */}
            {customerTab === 'vibe' && (
              <div className="space-y-8">
                <InteractiveFloorMap
                  occupancyData={occupancyData}
                  highlightedZone={recommendation?.suggestedZone}
                  selectedZone={selectedFloorZone}
                  onSelectZone={(zone) => setSelectedFloorZone(zone)}
                />

                <RoomVibeBoard
                  beacons={beacons}
                  onAddBeacon={(b) => setBeacons((prev) => [{ id: `b-${Date.now()}`, ...b, timestamp: 'Just now' }, ...prev])}
                  userZone={selectedFloorZone}
                />
              </div>
            )}

            {/* Tab: Rewards & Loyalty Stamps */}
            {customerTab === 'loyalty' && (
              <CafeLoyalty
                loyalty={loyalty}
                badges={earnedBadges}
                onRedeemReward={() => {
                  setHasRedeemedReward(true);
                  // Add a complimentary beverage reward item to the bag
                  const freeRewardDrink: MenuItem = {
                    id: 'reward-signature-drink',
                    name: 'Complimentary Barista Reserve Drink (Reward)',
                    category: 'drink',
                    price: 0,
                    description: 'Complimentary single-origin roast unlocked via 8-stamp loyalty passport.',
                    type: 'coffee',
                    temperature: 'hot',
                    dietaryTags: ['Demo Reward', 'Complimentary'],
                    caffeineLevel: 'high',
                    vibeTag: 'Free Reward',
                    available: true,
                  };
                  handleAddItem(freeRewardDrink, 1);
                  setIsCartOpen(true);
                }}
                hasRedeemedReward={hasRedeemedReward}
                customerName={preferences.userName || activeMember?.name || ''}
                tableNumber={preferences.tableNumber}
                onManualCheckIn={() => handleDigitalCheckIn('visit_checkin')}
              />
            )}

            {/* Tab: Feedback */}
            {customerTab === 'pulse' && (
              <CafePulse
                onAddFeedback={handleAddFeedback}
                recentFeedbacks={feedbacks}
              />
            )}
          </>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        userName={preferences.userName || activeMember?.name || ''}
        tableNumber={preferences.tableNumber}
        zone={recommendation?.suggestedZone || selectedFloorZone || 'Focus Corner'}
        membershipCode={preferences.membershipCode || activeMember?.membershipCode || ''}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Order Tracker Modal (Synced with Live Kitchen KDS) */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        order={activeTrackingOrder}
        onLeaveFeedback={() => {
          setIsTrackerOpen(false);
          setCustomerTab('pulse');
        }}
      />

      {/* Recognized Member Modal */}
      <ReturningCustomerModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        userName={preferences.userName || activeMember?.name || ''}
        tableNumber={preferences.tableNumber}
        onUpdateProfile={(name, table) => {
          setPreferences((p) => ({ ...p, userName: name, tableNumber: table }));
          if (name.trim()) {
            setActiveMember((prev) =>
              prev
                ? { ...prev, name: name.trim() }
                : {
                    name: name.trim(),
                    membershipCode: preferences.membershipCode || 'CAFE-VIP',
                    favoriteDrink: 'Cortado',
                    favoriteSnack: 'Almond Butter Croissant',
                    frequentIntent: preferences.intent,
                    pastOrders: ['Cortado + Almond Butter Croissant'],
                  }
            );
          }
        }}
        onSelectCustomer={(cust) => {
          setActiveMember(cust);
          setPreferences((p) => ({
            ...p,
            userName: cust.name,
            membershipCode: cust.membershipCode,
            intent: cust.frequentIntent,
          }));
          setIsMemberModalOpen(false);
        }}
        onReorderFavorite={handleReorderFavorite}
        currentCustomer={activeMember}
      />

      {/* Admin & Chef Login Modal */}
      {loginModalRole && (
        <LoginModal
          isOpen={!!loginModalRole}
          onClose={() => setLoginModalRole(null)}
          targetRole={loginModalRole}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-[#E6DDD4] bg-[#F4EFEA] py-8 text-xs text-[#6B5A50]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div>
              <span className="font-serif font-bold text-[#261B16] text-sm">CaféOS AI</span>
              <span className="mx-2 text-[#C6B8AC]">·</span>
              <span>Your Café. Your Vibe.</span>
            </div>
          </div>

          <div className="font-medium text-[#6B5A50] text-xs">
            Google Cloud Hackathon 2026
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 text-[11px] text-[#8C7A70]">
            <div>
              Built by{' '}
              <a
                href="https://www.linkedin.com/in/naveeng359/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#261B16] hover:underline"
              >
                Naveen Kumar Gajavelli
              </a>
              .
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 pt-4 border-t border-[#EAE2D8] text-center text-[11px] text-[#8C7A70]">
          All rights reserved - CaféOS AI @2026
        </div>
      </footer>
    </div>
  );
}
