import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// IN-MEMORY SHARED DATA STORE (Kitchen, Customer & Manager Sync)
// -------------------------------------------------------------

export interface MenuItemRecord {
  id: string;
  name: string;
  category: 'drink' | 'snack';
  price: number;
  description: string;
  type: 'coffee' | 'tea' | 'bakery' | 'savory';
  temperature: 'hot' | 'iced' | 'both';
  dietaryTags: string[];
  imageUrl?: string;
  caffeineLevel: 'high' | 'medium' | 'low' | 'none';
  vibeTag: string;
  available: boolean;
}

export interface OrderItemRecord {
  item: MenuItemRecord;
  quantity: number;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

export interface OrderRecord {
  id: string;
  tokenNumber: string;
  customerName: string;
  tableNumber?: string;
  membershipCode?: string;
  items: OrderItemRecord[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number; // timestamp in ms
  updatedAt: number;
  preparationStartedAt?: number;
  readyAt?: number;
  completedAt?: number;
  prepWarningThresholdMinutes: number; // default 2 minutes
  specialInstructions?: string;
  zone: string;
  paymentMethod: string;
}

export interface CustomerFeedbackRecord {
  id: string;
  orderToken?: string;
  rating: number;
  tags: string[];
  comment: string;
  timestamp: string;
}

// Canonical default menu
let DYNAMIC_MENU: MenuItemRecord[] = [
  {
    id: 'cortado',
    name: 'Cortado',
    category: 'drink',
    price: 210,
    description: 'Double ristretto with equal parts warm silky milk for optimal espresso sweetness.',
    type: 'coffee',
    temperature: 'hot',
    dietaryTags: ['Dairy', 'Oat Milk Option'],
    imageUrl: '/src/assets/images/drink_specialty_coffee_1791712895591.jpg',
    caffeineLevel: 'high',
    vibeTag: 'Sharp & Balanced',
    available: true,
  },
  {
    id: 'vanilla-cold-brew',
    name: 'Vanilla Cold Brew',
    category: 'drink',
    price: 240,
    description: '16-hour slow steep cold brew steeped with real Madagascan vanilla pods.',
    type: 'coffee',
    temperature: 'iced',
    dietaryTags: ['Vegan', 'Dairy-Free'],
    caffeineLevel: 'high',
    vibeTag: 'Sustained Stamina',
    available: true,
  },
  {
    id: 'oat-milk-flat-white',
    name: 'Oat Milk Flat White',
    category: 'drink',
    price: 260,
    description: 'Rich double espresso micro-foamed with velvety Swedish oat milk.',
    type: 'coffee',
    temperature: 'hot',
    dietaryTags: ['Vegan', 'Oat Milk', 'Dairy-Free'],
    imageUrl: '/src/assets/images/drink_specialty_coffee_1791712895591.jpg',
    caffeineLevel: 'medium',
    vibeTag: 'Comfort Work Fuel',
    available: true,
  },
  {
    id: 'cardamom-spiced-latte',
    name: 'Cardamom Spiced Latte',
    category: 'drink',
    price: 280,
    description: 'Specialty espresso infused with hand-crushed green cardamom and jaggery foam.',
    type: 'coffee',
    temperature: 'hot',
    dietaryTags: ['Vegetarian', 'Oat Milk Option'],
    caffeineLevel: 'medium',
    vibeTag: 'Aromatic & Cozy',
    available: true,
  },
  {
    id: 'ceremonial-matcha-latte',
    name: 'Ceremonial Matcha Latte',
    category: 'drink',
    price: 290,
    description: 'First-harvest stone-ground Uji matcha whisked with silky steamed milk.',
    type: 'tea',
    temperature: 'both',
    dietaryTags: ['Vegetarian', 'Oat Milk Option', 'Antioxidant'],
    imageUrl: '/src/assets/images/drink_matcha_latte_1791712910756.jpg',
    caffeineLevel: 'medium',
    vibeTag: 'Zen & Focused Calm',
    available: true,
  },
  {
    id: 'cascara-sparkler',
    name: 'Cascara Sparkler',
    category: 'drink',
    price: 220,
    description: 'Effervescent dried coffee cherry tea with blood orange & fresh rosemary.',
    type: 'tea',
    temperature: 'iced',
    dietaryTags: ['Vegan', 'Gluten-Free', 'Low Sugar'],
    caffeineLevel: 'low',
    vibeTag: 'Crisp & Refreshing',
    available: true,
  },
  {
    id: 'pour-over-single-origin',
    name: 'Pour-Over Single Origin',
    category: 'drink',
    price: 270,
    description: 'Ethiopian Yirgacheffe slow-brewed on V60 with jasmine floral & peach notes.',
    type: 'coffee',
    temperature: 'hot',
    dietaryTags: ['Vegan', 'Gluten-Free', 'Black Coffee'],
    caffeineLevel: 'high',
    vibeTag: 'Artisanal Connoisseur',
    available: true,
  },
  {
    id: 'dark-chocolate-mocha',
    name: 'Dark Chocolate Mocha',
    category: 'drink',
    price: 290,
    description: 'Single-origin 70% Belgian dark chocolate, double espresso and microfoam.',
    type: 'coffee',
    temperature: 'both',
    dietaryTags: ['Vegetarian', 'Indulgent'],
    caffeineLevel: 'medium',
    vibeTag: 'Velvety Reward',
    available: true,
  },
  // Snacks (6)
  {
    id: 'almond-butter-croissant',
    name: 'Almond Butter Croissant',
    category: 'snack',
    price: 190,
    description: 'Twice-baked flaky laminated butter pastry filled with toasted almond frangipane.',
    type: 'bakery',
    temperature: 'hot',
    dietaryTags: ['Contains Nuts', 'Vegetarian'],
    imageUrl: '/src/assets/images/food_artisan_bakery_1791712926374.jpg',
    caffeineLevel: 'none',
    vibeTag: 'Crisp & Sweet',
    available: true,
  },
  {
    id: 'truffle-mushroom-toast',
    name: 'Truffle Mushroom Toast',
    category: 'snack',
    price: 260,
    description: 'Cultured butter sourdough toast with pan-seared wild mushrooms & white truffle drizzle.',
    type: 'savory',
    temperature: 'hot',
    dietaryTags: ['Vegetarian', 'Savory Umami'],
    caffeineLevel: 'none',
    vibeTag: 'Gourmet Energy',
    available: true,
  },
  {
    id: 'sea-salt-caramel-cookie',
    name: 'Sea Salt Caramel Cookie',
    category: 'snack',
    price: 140,
    description: 'Freshly baked chewy brown butter cookie topped with molten caramel & Maldon flakes.',
    type: 'bakery',
    temperature: 'hot',
    dietaryTags: ['Vegetarian'],
    caffeineLevel: 'none',
    vibeTag: 'Quick Sweet Pick-me-up',
    available: true,
  },
  {
    id: 'avocado-citrus-tartine',
    name: 'Avocado Citrus Tartine',
    category: 'snack',
    price: 280,
    description: 'Crushed Haas avocado on toasted country sourdough with pink grapefruit & shaved radish.',
    type: 'savory',
    temperature: 'both',
    dietaryTags: ['Vegan', 'Dairy-Free'],
    caffeineLevel: 'none',
    vibeTag: 'Clean Vitality',
    available: true,
  },
  {
    id: 'dark-chocolate-brownie',
    name: 'Dark Chocolate Brownie',
    category: 'snack',
    price: 180,
    description: 'Dense Valrhona 72% chocolate brownie with toasted California walnuts.',
    type: 'bakery',
    temperature: 'both',
    dietaryTags: ['Vegetarian', 'Contains Nuts'],
    caffeineLevel: 'none',
    vibeTag: 'Rich & Comforting',
    available: true,
  },
  {
    id: 'spinach-feta-savory-danish',
    name: 'Spinach & Feta Savory Danish',
    category: 'snack',
    price: 210,
    description: 'Golden puff pastry square with creamed baby spinach, dill and authentic Greek feta.',
    type: 'savory',
    temperature: 'hot',
    dietaryTags: ['Vegetarian', 'Savory'],
    caffeineLevel: 'none',
    vibeTag: 'Flaky & Satisfying',
    available: true,
  },
];

// Seeded Initial Orders
const now = Date.now();
let ORDERS: OrderRecord[] = [
  {
    id: 'ord-101',
    tokenNumber: '#CF-101',
    customerName: 'Aarav M.',
    tableNumber: 'Table 3',
    membershipCode: 'MEM-88',
    items: [
      { item: DYNAMIC_MENU[0], quantity: 1 }, // Cortado
      { item: DYNAMIC_MENU[8], quantity: 1 }, // Croissant
    ],
    totalAmount: 400,
    status: 'completed',
    createdAt: now - 18 * 60 * 1000,
    updatedAt: now - 12 * 60 * 1000,
    preparationStartedAt: now - 17 * 60 * 1000,
    readyAt: now - 13 * 60 * 1000,
    completedAt: now - 12 * 60 * 1000,
    prepWarningThresholdMinutes: 2,
    specialInstructions: 'Warm the croissant lightly please',
    zone: 'Focus Corner',
    paymentMethod: 'Simulated UPI',
  },
  {
    id: 'ord-102',
    tokenNumber: '#CF-102',
    customerName: 'Priya K.',
    tableNumber: 'Table 7',
    membershipCode: 'MEM-42',
    items: [
      { item: DYNAMIC_MENU[4], quantity: 2 }, // Matcha Latte x2
      { item: DYNAMIC_MENU[11], quantity: 1 }, // Avocado Tartine
    ],
    totalAmount: 860,
    status: 'ready',
    createdAt: now - 6 * 60 * 1000,
    updatedAt: now - 1 * 60 * 1000,
    preparationStartedAt: now - 5 * 60 * 1000,
    readyAt: now - 1 * 60 * 1000,
    prepWarningThresholdMinutes: 2,
    specialInstructions: 'Oat milk for both matchas',
    zone: 'Social Table',
    paymentMethod: 'Simulated Card',
  },
  {
    id: 'ord-103',
    tokenNumber: '#CF-103',
    customerName: 'Liam Chen',
    tableNumber: 'Counter 2',
    items: [
      { item: DYNAMIC_MENU[1], quantity: 1 }, // Vanilla Cold Brew
      { item: DYNAMIC_MENU[9], quantity: 1 }, // Truffle Mushroom Toast
    ],
    totalAmount: 500,
    status: 'preparing',
    createdAt: now - 3 * 60 * 1000,
    updatedAt: now - 2 * 60 * 1000,
    preparationStartedAt: now - 2 * 60 * 1000,
    prepWarningThresholdMinutes: 2,
    specialInstructions: 'Extra ice in cold brew',
    zone: 'Barista Tasting Bench',
    paymentMethod: 'Pay at Counter',
  },
  {
    id: 'ord-104',
    tokenNumber: '#CF-104',
    customerName: 'Zara N.',
    tableNumber: 'Table 4',
    items: [
      { item: DYNAMIC_MENU[3], quantity: 1 }, // Cardamom Latte
      { item: DYNAMIC_MENU[12], quantity: 1 }, // Brownie
    ],
    totalAmount: 460,
    status: 'new',
    createdAt: now - 45 * 1000, // 45 seconds ago
    updatedAt: now - 45 * 1000,
    prepWarningThresholdMinutes: 2,
    specialInstructions: '',
    zone: 'Cozy Lounge',
    paymentMethod: 'Simulated UPI',
  },
];

let FEEDBACKS: CustomerFeedbackRecord[] = [
  {
    id: 'fb-1',
    orderToken: '#CF-101',
    rating: 5,
    tags: ['Flawless Roast', 'Great Acoustic Playlist'],
    comment: 'The cortado double-ristretto punch was calibrated to perfection. Focus Corner quietness let me crush 2 hours of deep work.',
    timestamp: '10:15 AM',
  },
  {
    id: 'fb-2',
    orderToken: '#CF-102',
    rating: 5,
    tags: ['Super Fast Prep', 'Perfect Seating Vibe'],
    comment: 'Matcha microfoam was velvety, avocado citrus tartine was super fresh. Loved the communal table lighting.',
    timestamp: '11:40 AM',
  },
];

// Fallback rule-based recommendation generator
function generateCuratedFallback(intent: string, drinkType: string, temperature: string, dietary: string) {
  const availableDrinks = DYNAMIC_MENU.filter((m) => m.category === 'drink' && m.available);
  const availableSnacks = DYNAMIC_MENU.filter((m) => m.category === 'snack' && m.available);

  let drink = availableDrinks[0] || DYNAMIC_MENU[0];
  let snack = availableSnacks[0] || DYNAMIC_MENU[8];
  let zone: 'Focus Corner' | 'Social Table' | 'Cozy Lounge' | 'Barista Tasting Bench' = 'Focus Corner';
  let zoneReason = 'Acoustic dampening and power outlets keep your productivity uninterrupted.';
  let pairingReason = 'The buttery almond notes enhance the espresso profile without palate fatigue.';
  let intentFit = 'Selected for steady caffeine delivery and zero distractions.';
  let music = 'Deep Lo-Fi Study Beats (64 BPM)';

  if (intent === 'unwind') {
    zone = 'Cozy Lounge';
    zoneReason = 'Plush seating, warm table lamps, and soft acoustic textures for effortless relaxation.';
    if (drinkType === 'tea') {
      drink = availableDrinks.find((d) => d.id === 'ceremonial-matcha-latte') || drink;
      snack = availableSnacks.find((s) => s.id === 'sea-salt-caramel-cookie') || snack;
      pairingReason = 'L-theanine in ceremonial matcha creates smooth calm, balanced by warm sea-salt caramel sweetness.';
      intentFit = 'A restorative blend designed to help you decompress from a busy day.';
      music = 'Warm Japanese Jazz & Rain Ambience';
    } else {
      drink = availableDrinks.find((d) => d.id === 'cardamom-spiced-latte') || drink;
      snack = availableSnacks.find((s) => s.id === 'dark-chocolate-brownie') || snack;
      pairingReason = 'Aromatic crushed cardamom cuts through rich dark chocolate for pure comfort.';
      intentFit = 'A warming treat designed to soothe and refresh your spirits.';
      music = 'Acoustic Bossa Nova & Vinyl Warmth';
    }
  } else if (intent === 'meeting') {
    zone = 'Social Table';
    zoneReason = 'Spacious communal oak table with natural sunlight and ambient collaborative energy.';
    drink = availableDrinks.find((d) => d.id === 'oat-milk-flat-white') || drink;
    snack = availableSnacks.find((s) => s.id === 'spinach-feta-savory-danish') || snack;
    pairingReason = 'Easy-to-share savory pastry pairs harmoniously with velvety micro-foamed oat flat white.';
    intentFit = 'Great balance of conversational energy and light savory replenishment.';
    music = 'Modern Downtempo Instrumental Nu-Jazz';
  } else if (intent === 'surprise_me') {
    zone = 'Barista Tasting Bench';
    zoneReason = 'Right in front of the espresso bar to watch the barista dial in single-origin extractions.';
    drink = availableDrinks.find((d) => d.id === 'cascara-sparkler') || drink;
    snack = availableSnacks.find((s) => s.id === 'avocado-citrus-tartine') || snack;
    pairingReason = 'Bright citrus notes of cascara sparkler elevate the tangy grapefruit and Haas avocado.';
    intentFit = 'An adventurous pairing of coffee fruit effervescence and artisanal sourdough.';
    music = 'Eclectic Indie Folk & Acoustic Grooves';
  } else {
    // Deep Work
    zone = 'Focus Corner';
    if (temperature === 'iced') {
      drink = availableDrinks.find((d) => d.id === 'vanilla-cold-brew') || drink;
      snack = availableSnacks.find((s) => s.id === 'truffle-mushroom-toast') || snack;
      pairingReason = 'Slow-steeped high-clarity caffeine with savory umami toast sustains long focus blocks.';
      intentFit = 'Zero sugar crash, high focus retention, and sustained energy.';
    } else {
      drink = availableDrinks.find((d) => d.id === 'pour-over-single-origin') || drink;
      snack = availableSnacks.find((s) => s.id === 'almond-butter-croissant') || snack;
      pairingReason = 'Clean Ethiopian floral notes balance the toasted almond frangipane beautifully.';
      intentFit = 'Complex aromatic pour-over provides clean, sustained clarity for uninterrupted focus.';
    }
  }

  return {
    greeting: 'Welcome to CaféOS AI',
    drink,
    foodPairing: snack,
    totalEstimatedPrice: drink.price + snack.price,
    pairingReason,
    intentFitExplanation: intentFit,
    suggestedZone: zone,
    zoneReason,
    ambientSoundtrack: music,
    demoQueueEstimateMinutes: Math.floor(Math.random() * 3) + 4,
    isAiGenerated: false,
    aiModelUsed: 'Curated Barista Engine (Fallback)',
  };
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Auth Endpoint for Demo Roles (/admin and /chef)
app.post('/api/auth/login', (req, res) => {
  const { role, loginId, password } = req.body;

  if (role === 'admin') {
    if (loginId === 'Cafe-admin' && password === 'Admin-CafeOS1') {
      return res.json({ success: true, role: 'admin', name: 'Floor Manager' });
    }
    return res.status(401).json({ success: false, message: 'Invalid Admin ID or Password' });
  }

  if (role === 'chef') {
    if (loginId === 'Cafe-chef' && password === 'Chef-Cafe1') {
      return res.json({ success: true, role: 'chef', name: 'Head Barista / Chef' });
    }
    return res.status(401).json({ success: false, message: 'Invalid Chef ID or Password' });
  }

  res.status(400).json({ success: false, message: 'Unknown role' });
});

// 2. Orders API (Shared for Customer, Kitchen KDS & Manager)
app.get('/api/orders', (_req, res) => {
  res.json({ orders: ORDERS });
});

app.post('/api/orders', (req, res) => {
  const { customerName, tableNumber, membershipCode, items, specialInstructions, zone, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  const tokenNumber = `#CF-${Math.floor(100 + Math.random() * 900)}`;
  const totalAmount = items.reduce((sum: number, i: any) => sum + i.item.price * i.quantity, 0);
  const currentTime = Date.now();

  const newOrder: OrderRecord = {
    id: `ord-${Date.now()}`,
    tokenNumber,
    customerName: customerName || 'Café Guest',
    tableNumber: tableNumber || 'Counter Pickup',
    membershipCode: membershipCode || '',
    items,
    totalAmount,
    status: 'new',
    createdAt: currentTime,
    updatedAt: currentTime,
    prepWarningThresholdMinutes: 2, // 2 minutes default warning threshold
    specialInstructions: specialInstructions || '',
    zone: zone || 'Focus Corner',
    paymentMethod: paymentMethod || 'Simulated UPI',
  };

  ORDERS.unshift(newOrder); // Add to top of queue
  res.status(201).json({ order: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = ORDERS.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const currentTime = Date.now();
  order.status = status;
  order.updatedAt = currentTime;

  if (status === 'preparing' && !order.preparationStartedAt) {
    order.preparationStartedAt = currentTime;
  } else if (status === 'ready' && !order.readyAt) {
    order.readyAt = currentTime;
  } else if (status === 'completed' && !order.completedAt) {
    order.completedAt = currentTime;
  }

  res.json({ order });
});

app.patch('/api/orders/:id/threshold', (req, res) => {
  const { id } = req.params;
  const { minutes } = req.body;

  const order = ORDERS.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.prepWarningThresholdMinutes = Number(minutes) || 2;
  order.updatedAt = Date.now();
  res.json({ order });
});

// 3. Dynamic Menu API (Customer browse + Manager CRUD)
app.get('/api/menu', (_req, res) => {
  res.json({
    drinks: DYNAMIC_MENU.filter((m) => m.category === 'drink'),
    snacks: DYNAMIC_MENU.filter((m) => m.category === 'snack'),
    allItems: DYNAMIC_MENU,
  });
});

app.post('/api/menu', (req, res) => {
  const { name, category, price, description, type, temperature, dietaryTags, vibeTag, caffeineLevel, imageUrl } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Missing required menu fields' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newItem: MenuItemRecord = {
    id: `${id}-${Date.now()}`,
    name,
    category,
    price: Number(price),
    description: description || '',
    type: type || (category === 'drink' ? 'coffee' : 'bakery'),
    temperature: temperature || 'both',
    dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : ['Vegetarian'],
    caffeineLevel: caffeineLevel || 'medium',
    vibeTag: vibeTag || 'Artisanal Selection',
    imageUrl: imageUrl || '',
    available: true,
  };

  DYNAMIC_MENU.push(newItem);
  res.status(201).json({ item: newItem });
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const itemIndex = DYNAMIC_MENU.findIndex((m) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  DYNAMIC_MENU[itemIndex] = {
    ...DYNAMIC_MENU[itemIndex],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : DYNAMIC_MENU[itemIndex].price,
  };

  res.json({ item: DYNAMIC_MENU[itemIndex] });
});

app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = DYNAMIC_MENU.length;
  DYNAMIC_MENU = DYNAMIC_MENU.filter((m) => m.id !== id);
  if (DYNAMIC_MENU.length === initialLength) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({ success: true });
});

// 4. Floor Map Occupancy API (Live Simulated Occupancy)
app.get('/api/occupancy', (_req, res) => {
  // Count active orders in each zone
  const activeOrders = ORDERS.filter((o) => o.status !== 'completed');
  const focusCount = activeOrders.filter((o) => o.zone === 'Focus Corner').length;
  const socialCount = activeOrders.filter((o) => o.zone === 'Social Table').length;
  const loungeCount = activeOrders.filter((o) => o.zone === 'Cozy Lounge').length;
  const benchCount = activeOrders.filter((o) => o.zone === 'Barista Tasting Bench').length;

  res.json({
    zones: {
      'Focus Corner': {
        name: 'Focus Corner',
        recommendedIntent: 'Deep Work',
        noiseLevel: 'Quiet (40 dB)',
        totalSeats: 6,
        occupiedSeats: Math.min(6, 4 + focusCount),
        powerOutlets: 'Dedicated surge socket & USB-C at each desk',
      },
      'Social Table': {
        name: 'Social Table',
        recommendedIntent: 'Meeting',
        noiseLevel: 'Lively Buzz (65 dB)',
        totalSeats: 10,
        occupiedSeats: Math.min(10, 5 + socialCount),
        powerOutlets: 'Center-run pop-up power strip',
      },
      'Cozy Lounge': {
        name: 'Cozy Lounge',
        recommendedIntent: 'Unwind',
        noiseLevel: 'Mellow Warmth (50 dB)',
        totalSeats: 6,
        occupiedSeats: Math.min(6, 2 + loungeCount),
        powerOutlets: 'Wall sockets available',
      },
      'Barista Tasting Bench': {
        name: 'Barista Tasting Bench',
        recommendedIntent: 'Surprise Me',
        noiseLevel: 'Artisanal Buzz (58 dB)',
        totalSeats: 4,
        occupiedSeats: Math.min(4, 1 + benchCount),
        powerOutlets: 'Under-counter wireless charging pads',
      },
    },
  });
});

// 5. Customer Feedback API
app.get('/api/feedbacks', (_req, res) => {
  res.json({ feedbacks: FEEDBACKS });
});

app.post('/api/feedbacks', (req, res) => {
  const { rating, tags, comment, orderToken } = req.body;
  const newFeedback: CustomerFeedbackRecord = {
    id: `fb-${Date.now()}`,
    orderToken: orderToken || '',
    rating: Number(rating) || 5,
    tags: Array.isArray(tags) ? tags : [],
    comment: comment || '',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  FEEDBACKS.unshift(newFeedback);
  res.status(201).json({ feedback: newFeedback });
});

// 6. Gemini Recommendation API
app.post('/api/recommendation', async (req, res) => {
  try {
    const {
      intent = 'deep_work',
      drinkType = 'any',
      temperature = 'any',
      dietary = 'none',
      budget = 500,
      userName = '',
      timeOfDay = 'morning',
      tableNumber = '',
      membershipCode = '',
      previousOrders = [],
    } = req.body;

    const availableDrinks = DYNAMIC_MENU.filter((m) => m.category === 'drink' && m.available);
    const availableSnacks = DYNAMIC_MENU.filter((m) => m.category === 'snack' && m.available);

    if (!ai) {
      console.warn('GEMINI_API_KEY not set. Using curated barista recommendation.');
      const fallback = generateCuratedFallback(intent, drinkType, temperature, dietary);
      if (userName) fallback.greeting = `Welcome back, ${userName}!`;
      return res.json(fallback);
    }

    const drinksCatalogPrompt = availableDrinks
      .map((d) => `- ${d.name} (₹${d.price}) [Temp: ${d.temperature}, Type: ${d.type}, Dietary: ${d.dietaryTags.join('/')}]`)
      .join('\n');

    const snacksCatalogPrompt = availableSnacks
      .map((s) => `- ${s.name} (₹${s.price}) [Type: ${s.type}, Dietary: ${s.dietaryTags.join('/')}]`)
      .join('\n');

    const historyPrompt = previousOrders && previousOrders.length > 0
      ? `Customer has previously enjoyed: ${previousOrders.slice(0, 3).join(', ')}. If relevant, personalize based on their taste preferences.`
      : '';

    const menuPromptContext = `
MENU OF REALISTIC CAFÉ DRINKS (Must pick EXACTLY one of these by exact name and price):
${drinksCatalogPrompt}

MENU OF ARTISANAL SNACKS (Must pick EXACTLY one of these by exact name and price):
${snacksCatalogPrompt}

CAFÉ SEATING ZONES:
- "Focus Corner": Quiet zone, ergonomic chairs, power outlets, acoustic dampening. Ideal for deep work & solo focus.
- "Social Table": Large sunny communal oak table, ambient hum. Ideal for meetings, collaborative work & lively discussions.
- "Cozy Lounge": Leather armchairs, vintage rugs, bookshelves, warm lamps. Ideal for unwinding, reading, or slow chats.
- "Barista Tasting Bench": Interactive seats facing espresso machines. Ideal for "Surprise Me" and coffee discovery.
`;

    const userPrompt = `
You are the master barista and spatial companion for "CaféOS AI - Your Café. Your Vibe."
Analyze the customer's visit context:
- Customer Name: ${userName ? userName : 'Guest'}
- Visit Intent: ${intent} (Choices: deep_work, meeting, unwind, surprise_me)
- Time of Day: ${timeOfDay}
- Preferred Drink Type: ${drinkType} (coffee, tea, or any)
- Temperature Preference: ${temperature} (hot, iced, or any)
- Dietary Preference: ${dietary} (none, dairy_free, vegan, oat_milk, decaf, nut_free)
- Budget: ₹${budget}
- Table Status: ${tableNumber ? `Seated at ${tableNumber}` : 'Ordering at Counter / Looking for seat'}
- Membership: ${membershipCode ? `Recognized Member (${membershipCode})` : 'Guest'}
${historyPrompt}

STRICT CONSTRAINTS:
1. Recommend ONLY 1 drink and 1 snack from the provided menu list. DO NOT invent items or change prices.
2. The total sum (drink price + snack price) should ideally be within the customer's budget ₹${budget} if possible.
3. Respect dietary constraints strictly (e.g. if vegan or dairy-free, don't recommend dairy pastry or milk drinks without oat milk).
4. Provide a warm, personalized 1-2 sentence explanation for WHY this pairing fits their intent and time of day.
5. Provide a specific food-drink pairing rationale.
6. Select the best café zone ("Focus Corner", "Social Table", "Cozy Lounge", or "Barista Tasting Bench") and explain why it suits their purpose.
7. Suggest an ambient background soundtrack vibe (e.g., "Acoustic Folk Strings", "Deep Lo-Fi House 65 BPM").
8. Provide a realistic demo queue prep time estimate between 3 and 7 minutes.
`;

    // Fast generation with 4.5s timeout protection to prevent slow loading or hanging
    const callPromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `${menuPromptContext}\n\n${userPrompt}`,
      config: {
        systemInstruction: 'You are the intelligent Barista Sommelier for CaféOS AI. Return strictly valid JSON conforming to the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            drinkName: { type: Type.STRING },
            drinkPrice: { type: Type.INTEGER },
            snackName: { type: Type.STRING },
            snackPrice: { type: Type.INTEGER },
            pairingReason: { type: Type.STRING },
            intentFitExplanation: { type: Type.STRING },
            suggestedZone: { type: Type.STRING },
            zoneReason: { type: Type.STRING },
            ambientSoundtrack: { type: Type.STRING },
            demoQueueEstimateMinutes: { type: Type.INTEGER },
          },
          required: [
            'greeting',
            'drinkName',
            'drinkPrice',
            'snackName',
            'snackPrice',
            'pairingReason',
            'intentFitExplanation',
            'suggestedZone',
            'zoneReason',
            'ambientSoundtrack',
            'demoQueueEstimateMinutes',
          ],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out (4500ms limit)')), 4500)
    );

    const response = await Promise.race([callPromise, timeoutPromise]);

    const parsed = JSON.parse(response.text || '{}');

    // Match with verified menu items
    let matchedDrink = availableDrinks.find(
      (d) => d.name.toLowerCase() === (parsed.drinkName || '').toLowerCase()
    );
    if (!matchedDrink) {
      matchedDrink = availableDrinks.find(
        (d) => parsed.drinkName && d.name.toLowerCase().includes(parsed.drinkName.toLowerCase())
      ) || availableDrinks[0] || DYNAMIC_MENU[0];
    }

    let matchedSnack = availableSnacks.find(
      (s) => s.name.toLowerCase() === (parsed.snackName || '').toLowerCase()
    );
    if (!matchedSnack) {
      matchedSnack = availableSnacks.find(
        (s) => parsed.snackName && s.name.toLowerCase().includes(parsed.snackName.toLowerCase())
      ) || availableSnacks[0] || DYNAMIC_MENU[8];
    }

    const verifiedZone = ['Focus Corner', 'Social Table', 'Cozy Lounge', 'Barista Tasting Bench'].includes(parsed.suggestedZone)
      ? parsed.suggestedZone
      : 'Focus Corner';

    const queueEstimate = Number(parsed.demoQueueEstimateMinutes) || 5;

    res.json({
      greeting: parsed.greeting || `Welcome to CaféOS AI, ${userName || 'Friend'}!`,
      drink: matchedDrink,
      foodPairing: matchedSnack,
      totalEstimatedPrice: matchedDrink.price + matchedSnack.price,
      pairingReason: parsed.pairingReason || 'A harmonious balance of artisanal flavor profiles.',
      intentFitExplanation: parsed.intentFitExplanation || 'Curated specifically for your current visit rhythm.',
      suggestedZone: verifiedZone,
      zoneReason: parsed.zoneReason || 'Optimal comfort and productivity environment.',
      ambientSoundtrack: parsed.ambientSoundtrack || 'Curated Café Acoustic Selection',
      demoQueueEstimateMinutes: Math.min(Math.max(queueEstimate, 3), 10),
      isAiGenerated: true,
      aiModelUsed: 'Gemini 3.1 Flash Lite',
    });
  } catch (error: any) {
    console.error('Error generating AI recommendation:', error);
    const { intent = 'deep_work', drinkType = 'any', temperature = 'any', dietary = 'none', userName = '' } = req.body || {};
    const fallback = generateCuratedFallback(intent, drinkType, temperature, dietary);
    if (userName) fallback.greeting = `Welcome back, ${userName}!`;
    res.json({
      ...fallback,
      offlineNotice: 'Fast Barista fallback applied instantly for high-speed browsing.',
    });
  }
});

// 7. Gemini Manager Operational Pulse & Shift Insights
app.post('/api/manager-insight', async (req, res) => {
  try {
    const activeOrders = ORDERS.filter((o) => o.status !== 'completed');
    const completedOrders = ORDERS.filter((o) => o.status === 'completed');
    const totalRevenue = ORDERS.reduce((sum, o) => sum + o.totalAmount, 0);

    // Compute popular items
    const itemCountMap: Record<string, number> = {};
    ORDERS.forEach((o) => {
      o.items.forEach((itemObj) => {
        itemCountMap[itemObj.item.name] = (itemCountMap[itemObj.item.name] || 0) + itemObj.quantity;
      });
    });
    const popularItems = Object.entries(itemCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count} ordered)`)
      .join(', ');

    // Calculate overdue orders (> 2 minutes in new or preparing)
    const nowTime = Date.now();
    const overdueCount = activeOrders.filter((o) => {
      const elapsedMins = (nowTime - o.createdAt) / (1000 * 60);
      return elapsedMins > (o.prepWarningThresholdMinutes || 2);
    }).length;

    const feedbackSnippet = FEEDBACKS.slice(0, 4)
      .map((f) => `"${f.comment}" (${f.rating}★)`)
      .join('; ');

    if (!ai) {
      return res.json({
        summary: `Currently tracking ${activeOrders.length} active orders with ${overdueCount} orders exceeding prep threshold. Top sellers are ${popularItems || 'Cortado and Cold Brew'}. Guest sentiment is averaging 4.9/5.0.`,
        actionableRecommendation: 'Rebalance barista stations to prioritize preparing tickets over 2 minutes and prep secondary batch of cold brew before next wave.',
        bottleneck: overdueCount > 0 ? `${overdueCount} orders pending over threshold` : 'Normal kitchen flow',
        customerTrend: 'High demand for specialty plant-based cold drinks during afternoon work hours.',
        isAiGenerated: false,
      });
    }

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `
You are the Operations AI Director for a high-end specialty café called CaféOS.
Analyze current floor & kitchen shift data:
- Total Orders Placed: ${ORDERS.length}
- Completed Orders: ${completedOrders.length}
- Active Brewing Queue: ${activeOrders.length} orders
- Overdue Orders Exceeding Prep Threshold: ${overdueCount} orders
- Simulated Gross Revenue: ₹${totalRevenue}
- Top Selling Items: ${popularItems || 'Cortado, Almond Croissant'}
- Recent Customer Feedback: ${feedbackSnippet || 'Positive response on coffee quality and wifi'}

Generate:
1. "summary": Exactly 2 clear sentences summarizing shift velocity, popular products, and floor flow.
2. "actionableRecommendation": Exactly 1 sharp, high-impact operational directive for the kitchen or manager.
3. "bottleneck": 1 sentence identifying any prep latency or station bottleneck.
4. "customerTrend": 1 sentence capturing observed customer preferences and session intent.
Return strictly JSON.
`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            actionableRecommendation: { type: Type.STRING },
            bottleneck: { type: Type.STRING },
            customerTrend: { type: Type.STRING },
          },
          required: ['summary', 'actionableRecommendation', 'bottleneck', 'customerTrend'],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Manager insight timed out (4500ms limit)')), 4500)
    );

    const response = await Promise.race([callPromise, timeoutPromise]);

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      summary: parsed.summary || 'Shift velocity is consistent with active beverage throughput and positive guest sentiment.',
      actionableRecommendation: parsed.actionableRecommendation || 'Stage milk pitchers and pre-heat sandwich press for upcoming lunch rush.',
      bottleneck: parsed.bottleneck || 'Minimal queue lag observed.',
      customerTrend: parsed.customerTrend || 'Sustained focus orders with oat milk substitutions.',
      isAiGenerated: true,
    });
  } catch (error) {
    console.error('Error generating manager insight:', error);
    res.json({
      summary: 'Café operations are balanced with steady queue turnaround time and high guest satisfaction.',
      actionableRecommendation: 'Ensure cold brew reserves and pastry case display are refreshed for the afternoon rush.',
      bottleneck: 'None reported.',
      customerTrend: 'Steady demand for espresso and light pastries.',
      isAiGenerated: false,
    });
  }
});

// Vite or Static file serving (only when running full server process, not in Vercel serverless)
if (!process.env.VERCEL) {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CaféOS AI server running on http://0.0.0.0:${PORT} (Production: ${isProd})`);
  });
}

export default app;
export { app };

