export interface MenuItem {
  id: string;
  name: string;
  category: 'drink' | 'snack';
  price: number; // in INR
  description: string;
  type: 'coffee' | 'tea' | 'bakery' | 'savory';
  temperature: 'hot' | 'iced' | 'both';
  dietaryTags: string[];
  imageUrl?: string;
  caffeineLevel: 'high' | 'medium' | 'low' | 'none';
  vibeTag: string;
  available?: boolean;
}

export const CAFÉ_DRINKS: MenuItem[] = [
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
  },
];

export const CAFÉ_SNACKS: MenuItem[] = [
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
  },
  {
    id: 'avocado-citrus-tartine',
    name: 'Avocado Citrus Tartine',
    category: 'snack',
    price: 280,
    description: 'Crushed Hass avocado on toasted country sourdough with pink grapefruit & shaved radish.',
    type: 'savory',
    temperature: 'both',
    dietaryTags: ['Vegan', 'Dairy-Free'],
    caffeineLevel: 'none',
    vibeTag: 'Clean Vitality',
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
  },
];

export const ALL_MENU_ITEMS: MenuItem[] = [...CAFÉ_DRINKS, ...CAFÉ_SNACKS];

export interface SeatingZone {
  id: string;
  name: 'Focus Corner' | 'Social Table' | 'Cozy Lounge' | 'Barista Tasting Bench';
  tagline: string;
  description: string;
  powerOutlets: string;
  noiseLevel: 'Quiet (40dB)' | 'Lively Buzz (65dB)' | 'Mellow Warmth (50dB)' | 'Artisanal Buzz (58dB)';
  availableSeats: number;
}

export const SEATING_ZONES: Record<string, SeatingZone> = {
  'Focus Corner': {
    id: 'focus-corner',
    name: 'Focus Corner',
    tagline: 'Quiet deep work haven with high-speed WiFi and power outlets at every desk.',
    description: 'Acoustic wood paneling, ergonomic task chairs, task lighting, and minimal foot traffic.',
    powerOutlets: 'Dedicated outlet & USB-C at every seat',
    noiseLevel: 'Quiet (40dB)',
    availableSeats: 5,
  },
  'Social Table': {
    id: 'social-table',
    name: 'Social Table',
    tagline: 'Sunlit communal oak table perfect for casual chats, collabs, and meetings.',
    description: 'Wide communal bench, natural daylight from high arch windows, upbeat conversational vibe.',
    powerOutlets: 'Center-run pop-up power strip',
    noiseLevel: 'Lively Buzz (65dB)',
    availableSeats: 8,
  },
  'Cozy Lounge': {
    id: 'cozy-lounge',
    name: 'Cozy Lounge',
    tagline: 'Low-slung leather armchairs, bookshelves, and warm lamp glow for slow reading & unwinding.',
    description: 'Vintage rugs, lush monstera plants, soft jazz acoustic playlist, and relaxed posture.',
    powerOutlets: 'Wall sockets available',
    noiseLevel: 'Mellow Warmth (50dB)',
    availableSeats: 4,
  },
  'Barista Tasting Bench': {
    id: 'barista-bench',
    name: 'Barista Tasting Bench',
    tagline: 'Front-row wooden bar stools overlooking the La Marzocco espresso station.',
    description: 'Direct barista conversation, single-origin cupping discovery, and aroma observation.',
    powerOutlets: 'Under-counter wireless charging pads',
    noiseLevel: 'Artisanal Buzz (58dB)',
    availableSeats: 3,
  },
};
