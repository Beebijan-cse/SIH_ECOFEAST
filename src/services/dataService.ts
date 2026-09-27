import {
  Profile,
  Kitchen,
  FPU,
  NGO,
  SurplusListing,
  SafetyCheck,
  Match,
  Pickup,
  TraceabilityEvent,
  ImpactMetrics,
  NotificationItem,
  LeaderboardEntry,
  FPUProcessingBatch,
  UserRole,
  FoodCategory,
  StorageType,
  SafetyStatus,
  PickupStatus,
  PickupWorkflowStatus
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_PREFIX = 'ecofeast_';

// RFC 4122 compliant UUID generator for PostgreSQL compatibility
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Fixed UUIDs for initial demo data (fully valid PostgreSQL UUIDs)
export const KITCHEN_USER_ID = '11111111-1111-4111-a111-111111111111';
export const FPU_USER_ID     = '22222222-2222-4222-a222-222222222222';
export const NGO_USER_ID     = '33333333-3333-4333-a333-333333333333';
export const ADMIN_USER_ID   = '44444444-4444-4444-a444-444444444444';

export const KITCHEN_ID_1    = '55555555-5555-4555-a555-111111111111';
export const KITCHEN_ID_2    = '55555555-5555-4555-a555-222222222222';
export const FPU_ID_1        = '77777777-7777-4777-a777-111111111111';
export const NGO_ID_1        = '66666666-6666-4666-a666-111111111111';
export const NGO_ID_2        = '66666666-6666-4666-a666-222222222222';

export const SURPLUS_ID_1    = '88888888-8888-4888-a888-111111111111';
export const SURPLUS_ID_2    = '88888888-8888-4888-a888-222222222222';
export const SURPLUS_ID_3    = '88888888-8888-4888-a888-333333333333';
export const SURPLUS_ID_4    = '88888888-8888-4888-a888-444444444444';
export const SURPLUS_ID_5    = '88888888-8888-4888-a888-555555555555';

export const SEED_PROFILES: Profile[] = [
  {
    id: KITCHEN_USER_ID,
    full_name: 'Chef Rajesh Sharma',
    email: 'kitchen@ecofeast.org',
    phone: '+91 98112 34567',
    organization_name: 'Delhi Tech University Mega Mess',
    role: 'kitchen',
    location: 'Bawana Road, Sector 17, Rohini, New Delhi',
    avatar_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: FPU_USER_ID,
    full_name: 'Ananya Deshmukh',
    email: 'fpu@ecofeast.org',
    phone: '+91 98220 54321',
    organization_name: 'GreenHarvest Agro Food Processing Unit',
    role: 'fpu',
    location: 'Okhla Industrial Area Phase III, New Delhi',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: NGO_USER_ID,
    full_name: 'Vikramjit Singh',
    email: 'ngo@ecofeast.org',
    phone: '+91 98711 99887',
    organization_name: 'Robin Hood Army & Feeding Hope Trust',
    role: 'ngo',
    location: 'Connaught Place & Civil Lines, New Delhi',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: ADMIN_USER_ID,
    full_name: 'Dr. Priya Varma',
    email: 'admin@ecofeast.org',
    phone: '+91 99100 12345',
    organization_name: 'EcoFeast Central Operations Authority',
    role: 'admin',
    location: 'National Capital Region, New Delhi',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const SEED_KITCHENS: Kitchen[] = [
  {
    id: KITCHEN_ID_1,
    profile_id: KITCHEN_USER_ID,
    name: 'Delhi Tech University Mega Mess',
    location: 'Bawana Road, Rohini, New Delhi',
    latitude: 28.7495,
    longitude: 77.1184,
    contact_person: 'Chef Rajesh Sharma (+91 98112 34567)',
    daily_capacity: 1200,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: KITCHEN_ID_2,
    profile_id: KITCHEN_USER_ID,
    name: 'Taj Palace Convention & Banquet Kitchen',
    location: 'Diplomatic Enclave, Chanakyapuri, New Delhi',
    latitude: 28.5960,
    longitude: 77.1724,
    contact_person: 'Executive Chef Anand Roy',
    daily_capacity: 2500,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

export const SEED_FPUS: FPU[] = [
  {
    id: FPU_ID_1,
    profile_id: FPU_USER_ID,
    name: 'GreenHarvest Agro Food Processing Unit',
    location: 'Okhla Industrial Area Phase III, New Delhi',
    contact_person: 'Ananya Deshmukh (+91 98220 54321)',
    processing_capacity: 1500,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  }
];

export const SEED_NGOS: NGO[] = [
  {
    id: NGO_ID_1,
    profile_id: NGO_USER_ID,
    name: 'Robin Hood Army & Feeding Hope Trust',
    location: 'Connaught Place & Civil Lines, New Delhi',
    contact_person: 'Vikramjit Singh (+91 98711 99887)',
    service_area: 'Central & North Delhi (5 Shelter Homes)',
    latitude: 28.6315,
    longitude: 77.2167,
    daily_intake_capacity: 650,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: NGO_ID_2,
    profile_id: NGO_USER_ID,
    name: 'Roti Bank Society - North Hub',
    location: 'Model Town, Delhi',
    contact_person: 'Sunita Mehra (+91 98100 44332)',
    service_area: 'North Delhi, Azadpur, Jahangirpuri',
    latitude: 28.7050,
    longitude: 77.1900,
    daily_intake_capacity: 500,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const SEED_SURPLUS: SurplusListing[] = [
  {
    id: SURPLUS_ID_1,
    kitchen_id: KITCHEN_ID_1,
    food_name: 'Nutritious Steamed Basmati Rice & Dal Makhani',
    food_category: 'Cooked Meals',
    quantity: 45,
    unit: 'kg',
    prepared_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    expiry_time: new Date(Date.now() + 4 * 3600000).toISOString(),
    storage_type: 'Hot Hold (>60°C)',
    safety_status: 'safe',
    pickup_status: 'available',
    description: 'Freshly prepared lunch batch from hostel mess. Kept in steam thermal containers above 65°C.',
    latitude: 28.7495,
    longitude: 77.1184,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: SURPLUS_ID_2,
    kitchen_id: KITCHEN_ID_1,
    food_name: 'Whole Wheat Tawa Rotis & Mixed Veg Korma',
    food_category: 'Cooked Meals',
    quantity: 35,
    unit: 'kg',
    prepared_at: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    expiry_time: new Date(Date.now() + 5 * 3600000).toISOString(),
    storage_type: 'Hot Hold (>60°C)',
    safety_status: 'safe',
    pickup_status: 'matched',
    description: 'Hot vegetarian cooked meal packs, ready in insulated food-grade containers.',
    latitude: 28.7495,
    longitude: 77.1184,
    created_at: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: SURPLUS_ID_3,
    kitchen_id: KITCHEN_ID_2,
    food_name: 'Artisan Assorted Multigrain Breads & Buns',
    food_category: 'Bakery',
    quantity: 25,
    unit: 'kg',
    prepared_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    expiry_time: new Date(Date.now() + 24 * 3600000).toISOString(),
    storage_type: 'Ambient / Dry (15-25°C)',
    safety_status: 'safe',
    pickup_status: 'available',
    description: 'Freshly baked bread loaves and rolls from corporate luncheon, individually paper-wrapped.',
    latitude: 28.5960,
    longitude: 77.1724,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: SURPLUS_ID_4,
    kitchen_id: KITCHEN_ID_1,
    food_name: 'Raw Farm Vegetables (Carrots, Beans, Bell Peppers)',
    food_category: 'Vegetables',
    quantity: 80,
    unit: 'kg',
    prepared_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    expiry_time: new Date(Date.now() + 48 * 3600000).toISOString(),
    storage_type: 'Cold Refrigerated (<4°C)',
    safety_status: 'safe',
    pickup_status: 'available',
    description: 'Surplus prep grade-A washed veggies suitable for FPU dehydration or direct community cooking.',
    latitude: 28.7495,
    longitude: 77.1184,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: SURPLUS_ID_5,
    kitchen_id: KITCHEN_ID_2,
    food_name: 'Paneer Butter Masala (Ambient hold past limit)',
    food_category: 'Cooked Meals',
    quantity: 15,
    unit: 'kg',
    prepared_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    expiry_time: new Date(Date.now() - 1 * 3600000).toISOString(),
    storage_type: 'Ambient / Dry (15-25°C)',
    safety_status: 'unsafe',
    pickup_status: 'cancelled',
    description: 'Flagged by safety inspection due to temperature danger zone (32°C for 4+ hours).',
    latitude: 28.5960,
    longitude: 77.1724,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

export const SEED_SAFETY_CHECKS: SafetyCheck[] = [
  {
    id: '99999999-9999-4999-a999-111111111111',
    surplus_id: SURPLUS_ID_1,
    checked_by: KITCHEN_USER_ID,
    temperature: 68.5,
    appearance_status: 'good',
    packaging_status: 'sealed',
    expiry_status: 'valid',
    overall_status: 'safe',
    notes: 'Hot holding verified with calibrated digital food probe. Texture and steam aroma optimal.',
    checked_at: new Date(Date.now() - 1.8 * 3600000).toISOString()
  },
  {
    id: '99999999-9999-4999-a999-222222222222',
    surplus_id: SURPLUS_ID_2,
    checked_by: KITCHEN_USER_ID,
    temperature: 64.0,
    appearance_status: 'good',
    packaging_status: 'sealed',
    expiry_status: 'valid',
    overall_status: 'safe',
    notes: 'Rotis wrapped in foil trays; curry above 60°C HACCP threshold.',
    checked_at: new Date(Date.now() - 1.2 * 3600000).toISOString()
  }
];

export const SEED_MATCHES: Match[] = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-111111111111',
    surplus_id: SURPLUS_ID_2,
    ngo_id: NGO_ID_1,
    distance_km: 4.8,
    match_score: 94,
    reason: 'Recommended: Robin Hood Army is within 4.8 km, has active volunteer drivers with thermal carriers, and daily intake capacity easily accommodates 35 kg cooked meals.',
    status: 'accepted',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-222222222222',
    surplus_id: SURPLUS_ID_1,
    ngo_id: NGO_ID_2,
    distance_km: 6.2,
    match_score: 89,
    reason: 'Strong Match: Roti Bank North Hub is within 6.2 km, serving 3 nearby night shelters. Excellent match for large basmati rice batches.',
    status: 'suggested',
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 50 * 60000).toISOString()
  }
];

export const SEED_PICKUPS: Pickup[] = [
  {
    id: 'bbbbbbbb-bbbb-4bbb-bbbb-111111111111',
    match_id: 'aaaaaaaa-aaaa-4aaa-aaaa-111111111111',
    ngo_id: NGO_ID_1,
    surplus_id: SURPLUS_ID_2,
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_time: '15:30',
    status: 'in_progress',
    pickup_person: 'Rahul Verma (+91 98765 43210)',
    notes: 'Driver en route with insulated hot boxes (Vehicle DL-1Z-9821).',
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  }
];

export const SEED_TRACEABILITY: TraceabilityEvent[] = [
  {
    id: 'cccccccc-cccc-4ccc-cccc-111111111111',
    surplus_id: SURPLUS_ID_2,
    event_type: 'created',
    actor_id: KITCHEN_USER_ID,
    actor_name: 'Chef Rajesh Sharma',
    location: 'DTU Mega Mess - Central Hot Line',
    description: 'Surplus food batch recorded: 35 kg Whole Wheat Tawa Rotis & Veg Korma.',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString()
  },
  {
    id: 'cccccccc-cccc-4ccc-cccc-222222222222',
    surplus_id: SURPLUS_ID_2,
    event_type: 'safety_checked',
    actor_id: KITCHEN_USER_ID,
    actor_name: 'Chef Rajesh Sharma (Safety Supervisor)',
    location: 'DTU Mess Food Inspection Bay',
    description: 'HACCP Safety Verification: Probe Core Temp 64°C, Packaging Sealed, Appearance Good. Status: SAFE.',
    timestamp: new Date(Date.now() - 75 * 60000).toISOString()
  },
  {
    id: 'cccccccc-cccc-4ccc-cccc-333333333333',
    surplus_id: SURPLUS_ID_2,
    event_type: 'matched',
    actor_id: ADMIN_USER_ID,
    actor_name: 'EcoFeast Smart Matching Algorithm',
    location: 'Cloud Engine',
    description: 'Matched with Robin Hood Army (Score: 94/100, Distance: 4.8 km).',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'cccccccc-cccc-4ccc-cccc-444444444444',
    surplus_id: SURPLUS_ID_2,
    event_type: 'accepted',
    actor_id: NGO_USER_ID,
    actor_name: 'Vikramjit Singh',
    location: 'Robin Hood Army Ops HQ',
    description: 'Donation claim accepted. Transport dispatched.',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'cccccccc-cccc-4ccc-cccc-555555555555',
    surplus_id: SURPLUS_ID_2,
    event_type: 'picked_up',
    actor_id: NGO_USER_ID,
    actor_name: 'Rahul Verma (Driver)',
    location: 'DTU Mess Gate 3 Loading Dock',
    description: 'Food transferred into insulated thermal bags. Departure recorded.',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

export const SEED_IMPACT: ImpactMetrics = {
  id: 'dddddddd-dddd-4ddd-dddd-111111111111',
  organization_id: 'global-ecofeast',
  organization_type: 'global',
  food_saved_kg: 18450,
  meals_supported: 46125,
  people_reached: 36900,
  co2_saved_kg: 46125,
  updated_at: new Date().toISOString()
};

export const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'ld-01',
    organization_id: KITCHEN_ID_1,
    organization_name: 'Delhi Tech University Mega Mess',
    organization_type: 'kitchen',
    food_saved_kg: 5420,
    meals_supported: 13550,
    co2_saved_kg: 13550,
    rank: 1,
    updated_at: new Date().toISOString()
  },
  {
    id: 'ld-02',
    organization_id: NGO_ID_1,
    organization_name: 'Robin Hood Army & Feeding Hope Trust',
    organization_type: 'ngo',
    food_saved_kg: 4890,
    meals_supported: 12225,
    co2_saved_kg: 12225,
    rank: 2,
    updated_at: new Date().toISOString()
  },
  {
    id: 'ld-03',
    organization_id: FPU_ID_1,
    organization_name: 'GreenHarvest Agro Food Processing Unit',
    organization_type: 'fpu',
    food_saved_kg: 3200,
    meals_supported: 8000,
    co2_saved_kg: 8000,
    rank: 3,
    updated_at: new Date().toISOString()
  },
  {
    id: 'ld-04',
    organization_id: KITCHEN_ID_2,
    organization_name: 'Taj Palace Convention & Banquet Kitchen',
    organization_type: 'kitchen',
    food_saved_kg: 2980,
    meals_supported: 7450,
    co2_saved_kg: 7450,
    rank: 4,
    updated_at: new Date().toISOString()
  },
  {
    id: 'ld-05',
    organization_id: NGO_ID_2,
    organization_name: 'Roti Bank Society - North Hub',
    organization_type: 'ngo',
    food_saved_kg: 1960,
    meals_supported: 4900,
    co2_saved_kg: 4900,
    rank: 5,
    updated_at: new Date().toISOString()
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'eeeeeeee-eeee-4eee-eeee-111111111111',
    user_id: KITCHEN_USER_ID,
    title: 'Surplus Verified Safe',
    message: 'Basmati Rice & Dal Makhani passed temperature inspection (68.5°C). Ready for smart distribution.',
    type: 'success',
    read: false,
    created_at: new Date(Date.now() - 40 * 60000).toISOString()
  },
  {
    id: 'eeeeeeee-eeee-4eee-eeee-222222222222',
    user_id: KITCHEN_USER_ID,
    title: 'NGO Accepted Match',
    message: 'Robin Hood Army accepted donation of 35 kg Whole Wheat Rotis. Vehicle en route.',
    type: 'info',
    read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  }
];

export const SEED_FPU_BATCHES: FPUProcessingBatch[] = [
  {
    id: 'fpu-batch-01',
    fpu_id: FPU_ID_1,
    raw_material_name: 'Surplus Farm Greens & Seasonal Vegetables',
    quantity_kg: 120,
    food_category: 'Vegetables',
    source_kitchen: 'DTU Mega Mess',
    input_quantity: 120,
    unit: 'kg',
    processing_type: 'Solar Dehydration & Pulverization',
    stage: 'packed',
    shelf_life_extension_days: 180,
    output_product: 'Nutri-Rich Vegetable Soup Powder & Dried Soup Mix',
    output_product_name: 'Nutri-Rich Vegetable Soup Powder & Dried Soup Mix',
    output_quantity: 18,
    output_quantity_units: 18,
    processing_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    status: 'Ready for Relief Dispatch',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 'fpu-batch-02',
    fpu_id: FPU_ID_1,
    raw_material_name: 'Overripe Banquet Fruit Crates',
    quantity_kg: 85,
    food_category: 'Fruits',
    source_kitchen: 'Taj Palace Convention Banquet',
    input_quantity: 85,
    unit: 'kg',
    processing_type: 'Retort Steam Puree & Pectin Jams',
    stage: 'processed',
    shelf_life_extension_days: 270,
    output_product: 'Fortified Multi-Fruit Spreads & Preserves',
    output_product_name: 'Fortified Multi-Fruit Spreads & Preserves',
    output_quantity: 65,
    output_quantity_units: 65,
    processing_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 270 * 86400000).toISOString().split('T')[0],
    status: 'Thermal Sterilization & Vacuum Cooling',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

// Helper: Haversine distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Ensure store is initialized
function ensureStoreInitialized() {
  if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'initialized')) {
    setStorage('profiles', SEED_PROFILES);
    setStorage('kitchens', SEED_KITCHENS);
    setStorage('fpus', SEED_FPUS);
    setStorage('ngos', SEED_NGOS);
    setStorage('surplus_listings', SEED_SURPLUS);
    setStorage('safety_checks', SEED_SAFETY_CHECKS);
    setStorage('matches', SEED_MATCHES);
    setStorage('pickups', SEED_PICKUPS);
    setStorage('traceability_events', SEED_TRACEABILITY);
    setStorage('impact_metrics', SEED_IMPACT);
    setStorage('leaderboard', SEED_LEADERBOARD);
    setStorage('notifications', SEED_NOTIFICATIONS);
    setStorage('fpu_batches', SEED_FPU_BATCHES);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'initialized', 'true');
  }
}

// Reset store to fresh demo data
export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEY_PREFIX + 'profiles', JSON.stringify(SEED_PROFILES));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'kitchens', JSON.stringify(SEED_KITCHENS));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'fpus', JSON.stringify(SEED_FPUS));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'ngos', JSON.stringify(SEED_NGOS));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'surplus_listings', JSON.stringify(SEED_SURPLUS));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'safety_checks', JSON.stringify(SEED_SAFETY_CHECKS));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'matches', JSON.stringify(SEED_MATCHES));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'pickups', JSON.stringify(SEED_PICKUPS));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'traceability_events', JSON.stringify(SEED_TRACEABILITY));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'impact_metrics', JSON.stringify(SEED_IMPACT));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'leaderboard', JSON.stringify(SEED_LEADERBOARD));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(SEED_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'fpu_batches', JSON.stringify(SEED_FPU_BATCHES));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'initialized', 'true');
}

// Clear store to empty state for testing empty database
export function clearAllData(): void {
  setStorage('profiles', SEED_PROFILES.slice(0, 1)); // Keep current session
  setStorage('kitchens', []);
  setStorage('fpus', []);
  setStorage('ngos', []);
  setStorage('surplus_listings', []);
  setStorage('safety_checks', []);
  setStorage('matches', []);
  setStorage('pickups', []);
  setStorage('traceability_events', []);
  setStorage('impact_metrics', {
    id: generateUUID(),
    organization_id: 'global',
    organization_type: 'global',
    food_saved_kg: 0,
    meals_supported: 0,
    people_reached: 0,
    co2_saved_kg: 0,
    updated_at: new Date().toISOString()
  });
  setStorage('leaderboard', []);
  setStorage('notifications', []);
  setStorage('fpu_batches', []);
}

// ============================================================================
// DATA SERVICE API
// ============================================================================

export const dataService = {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) return data as Profile[];
      } catch (e) {
        console.warn('Supabase fetch profiles warning, falling back to local store:', e);
      }
    }
    return getStorage<Profile[]>('profiles', SEED_PROFILES);
  },

  async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data as Profile;
      } catch (e) {
        console.warn('Supabase fetch profile by id warning:', e);
      }
    }
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  },

  async saveProfile(profile: Profile): Promise<Profile> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').upsert(profile);
      } catch (e) {
        console.warn('Supabase upsert profile warning:', e);
      }
    }
    const profiles = getStorage<Profile[]>('profiles', SEED_PROFILES);
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    setStorage('profiles', profiles);
    return profile;
  },

  // Kitchens
  async getKitchens(): Promise<Kitchen[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('kitchens').select('*');
        if (!error && data && data.length > 0) return data as Kitchen[];
      } catch (e) {
        console.warn('Supabase fetch kitchens warning:', e);
      }
    }
    return getStorage<Kitchen[]>('kitchens', SEED_KITCHENS);
  },

  async getKitchenByProfileId(profileId: string): Promise<Kitchen | null> {
    const kitchens = await this.getKitchens();
    return kitchens.find((k) => k.profile_id === profileId) || null;
  },

  async saveKitchen(kitchen: Kitchen): Promise<Kitchen> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('kitchens').upsert(kitchen);
      } catch (e) {
        console.warn('Supabase upsert kitchen warning:', e);
      }
    }
    const kitchens = getStorage<Kitchen[]>('kitchens', SEED_KITCHENS);
    const idx = kitchens.findIndex((k) => k.id === kitchen.id);
    if (idx >= 0) kitchens[idx] = kitchen;
    else kitchens.push(kitchen);
    setStorage('kitchens', kitchens);
    return kitchen;
  },

  // NGOs
  async getNGOs(): Promise<NGO[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('ngos').select('*');
        if (!error && data && data.length > 0) return data as NGO[];
      } catch (e) {
        console.warn('Supabase fetch ngos warning:', e);
      }
    }
    return getStorage<NGO[]>('ngos', SEED_NGOS);
  },

  async getNGOByProfileId(profileId: string): Promise<NGO | null> {
    const ngos = await this.getNGOs();
    return ngos.find((n) => n.profile_id === profileId) || null;
  },

  async saveNGO(ngo: NGO): Promise<NGO> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('ngos').upsert(ngo);
      } catch (e) {
        console.warn('Supabase upsert ngo warning:', e);
      }
    }
    const ngos = getStorage<NGO[]>('ngos', SEED_NGOS);
    const idx = ngos.findIndex((n) => n.id === ngo.id);
    if (idx >= 0) ngos[idx] = ngo;
    else ngos.push(ngo);
    setStorage('ngos', ngos);
    return ngo;
  },

  // FPUs
  async getFPUs(): Promise<FPU[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('fpus').select('*');
        if (!error && data && data.length > 0) return data as FPU[];
      } catch (e) {
        console.warn('Supabase fetch fpus warning:', e);
      }
    }
    return getStorage<FPU[]>('fpus', SEED_FPUS);
  },

  async getFPUByProfileId(profileId: string): Promise<FPU | null> {
    const fpus = await this.getFPUs();
    return fpus.find((f) => f.profile_id === profileId) || null;
  },

  async saveFPU(fpu: FPU): Promise<FPU> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('fpus').upsert(fpu);
      } catch (e) {
        console.warn('Supabase upsert fpu warning:', e);
      }
    }
    const fpus = getStorage<FPU[]>('fpus', SEED_FPUS);
    const idx = fpus.findIndex((f) => f.id === fpu.id);
    if (idx >= 0) fpus[idx] = fpu;
    else fpus.push(fpu);
    setStorage('fpus', fpus);
    return fpu;
  },

  async getFPUProcessingBatches(): Promise<FPUProcessingBatch[]> {
    ensureStoreInitialized();
    return getStorage<FPUProcessingBatch[]>('fpu_batches', SEED_FPU_BATCHES);
  },

  async saveFPUProcessingBatch(batch: FPUProcessingBatch): Promise<FPUProcessingBatch> {
    const batches = getStorage<FPUProcessingBatch[]>('fpu_batches', SEED_FPU_BATCHES);
    const idx = batches.findIndex((b) => b.id === batch.id);
    if (idx >= 0) batches[idx] = batch;
    else batches.unshift(batch);
    setStorage('fpu_batches', batches);
    return batch;
  },

  // Surplus Listings
  async getSurplusListings(filters?: {
    kitchen_id?: string;
    safety_status?: SafetyStatus;
    pickup_status?: PickupStatus;
  }): Promise<SurplusListing[]> {
    ensureStoreInitialized();
    let listings: SurplusListing[] = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase.from('surplus_listings').select('*, kitchen:kitchens(*)');
        if (filters?.kitchen_id) q = q.eq('kitchen_id', filters.kitchen_id);
        if (filters?.safety_status) q = q.eq('safety_status', filters.safety_status);
        if (filters?.pickup_status) q = q.eq('pickup_status', filters.pickup_status);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data as SurplusListing[];
      } catch (e) {
        console.warn('Supabase fetch surplus warning:', e);
      }
    }
    listings = getStorage<SurplusListing[]>('surplus_listings', SEED_SURPLUS);
    const kitchens = await this.getKitchens();

    // Attach kitchens
    listings = listings.map((item) => ({
      ...item,
      kitchen: kitchens.find((k) => k.id === item.kitchen_id)
    }));

    if (filters?.kitchen_id) {
      listings = listings.filter((l) => l.kitchen_id === filters.kitchen_id);
    }
    if (filters?.safety_status) {
      listings = listings.filter((l) => l.safety_status === filters.safety_status);
    }
    if (filters?.pickup_status) {
      listings = listings.filter((l) => l.pickup_status === filters.pickup_status);
    }
    return listings;
  },

  async getSurplusById(id: string): Promise<SurplusListing | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('surplus_listings').select('*, kitchen:kitchens(*)').eq('id', id).maybeSingle();
        if (!error && data) return data as SurplusListing;
      } catch (e) {
        console.warn('Supabase fetch surplus by id warning:', e);
      }
    }
    const listings = await this.getSurplusListings();
    return listings.find((l) => l.id === id) || null;
  },

  async createSurplusListing(
    data: Omit<SurplusListing, 'id' | 'safety_status' | 'pickup_status' | 'created_at' | 'updated_at'>,
    creatorProfile: Profile
  ): Promise<SurplusListing> {
    ensureStoreInitialized();
    const newId = generateUUID();
    const newListing: SurplusListing = {
      ...data,
      id: newId,
      safety_status: 'pending',
      pickup_status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        // Strip relations before inserting into database
        const { kitchen, ...dbRow } = newListing as any;
        await supabase.from('surplus_listings').insert(dbRow);
      } catch (e) {
        console.warn('Supabase insert surplus warning:', e);
      }
    }

    const current = getStorage<SurplusListing[]>('surplus_listings', SEED_SURPLUS);
    current.unshift(newListing);
    setStorage('surplus_listings', current);

    // Create initial traceability event
    await this.createTraceabilityEvent({
      surplus_id: newId,
      event_type: 'created',
      actor_id: creatorProfile.id,
      actor_name: creatorProfile.full_name,
      location: creatorProfile.organization_name,
      description: `Surplus recorded: ${newListing.quantity} ${newListing.unit} of ${newListing.food_name} (${newListing.storage_type}).`,
      timestamp: new Date().toISOString()
    });

    return newListing;
  },

  async updateSurplusListing(id: string, updates: Partial<SurplusListing>): Promise<SurplusListing | null> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { kitchen, ...dbUpdates } = updates as any;
        await supabase.from('surplus_listings').update(dbUpdates).eq('id', id);
      } catch (e) {
        console.warn('Supabase update surplus warning:', e);
      }
    }
    const current = getStorage<SurplusListing[]>('surplus_listings', SEED_SURPLUS);
    const idx = current.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    const updated = { ...current[idx], ...updates, updated_at: new Date().toISOString() };
    current[idx] = updated;
    setStorage('surplus_listings', current);
    return updated;
  },

  // Safety Checks
  async getSafetyChecks(surplusId?: string): Promise<SafetyCheck[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase.from('safety_checks').select('*');
        if (surplusId) q = q.eq('surplus_id', surplusId);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data as SafetyCheck[];
      } catch (e) {
        console.warn('Supabase fetch safety checks warning:', e);
      }
    }
    const checks = getStorage<SafetyCheck[]>('safety_checks', SEED_SAFETY_CHECKS);
    return surplusId ? checks.filter((c) => c.surplus_id === surplusId) : checks;
  },

  async recordSafetyCheck(
    data: Omit<SafetyCheck, 'id' | 'checked_at'>,
    checkerProfile: Profile
  ): Promise<SafetyCheck> {
    ensureStoreInitialized();
    const newId = generateUUID();
    const newCheck: SafetyCheck = {
      ...data,
      id: newId,
      checked_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('safety_checks').insert(newCheck);
      } catch (e) {
        console.warn('Supabase insert safety check warning:', e);
      }
    }

    const checks = getStorage<SafetyCheck[]>('safety_checks', SEED_SAFETY_CHECKS);
    checks.unshift(newCheck);
    setStorage('safety_checks', checks);

    // Update the surplus listing safety status
    await this.updateSurplusListing(data.surplus_id, {
      safety_status: data.overall_status
    });

    // Record traceability event
    await this.createTraceabilityEvent({
      surplus_id: data.surplus_id,
      event_type: 'safety_checked',
      actor_id: checkerProfile.id,
      actor_name: checkerProfile.full_name,
      location: checkerProfile.organization_name,
      description: `Safety verification complete: status [${data.overall_status.toUpperCase()}]. Probe temperature: ${data.temperature}°C, packaging: ${data.packaging_status}. ${data.notes || ''}`,
      timestamp: new Date().toISOString()
    });

    // Create notification for users
    await this.createNotification({
      user_id: checkerProfile.id,
      title: `Safety Check: ${data.overall_status.toUpperCase()}`,
      message: `Surplus safety assessment logged as ${data.overall_status.toUpperCase()} at ${data.temperature}°C.`,
      type: data.overall_status === 'safe' ? 'success' : 'urgent',
      read: false
    });

    return newCheck;
  },

  // Smart Matching Engine
  async generateMatchesForSurplus(surplusId: string): Promise<Match[]> {
    const surplus = await this.getSurplusById(surplusId);
    if (!surplus || surplus.safety_status !== 'safe') return [];

    const ngos = await this.getNGOs();
    const kitchen = surplus.kitchen || (await this.getKitchens()).find((k) => k.id === surplus.kitchen_id);
    const existingMatches = await this.getMatches();

    const matchesToCreate: Match[] = [];

    for (const ngo of ngos) {
      const exists = existingMatches.find((m) => m.surplus_id === surplusId && m.ngo_id === ngo.id);
      if (exists) {
        matchesToCreate.push(exists);
        continue;
      }

      // Calculate transparent multi-factor match score
      const lat1 = kitchen?.latitude || 28.6139;
      const lon1 = kitchen?.longitude || 77.2090;
      const lat2 = ngo.latitude || 28.6300;
      const lon2 = ngo.longitude || 77.2200;
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      let distanceScore = 40;
      if (distance > 20) distanceScore = 5;
      else if (distance > 10) distanceScore = 20;
      else if (distance > 5) distanceScore = 32;

      const hoursToExpiry = Math.max(
        0,
        (new Date(surplus.expiry_time).getTime() - Date.now()) / (1000 * 3600)
      );
      let urgencyScore = 25;
      if (hoursToExpiry < 3) urgencyScore = 30;
      else if (hoursToExpiry > 24) urgencyScore = 15;

      let categoryScore = 20;
      if (surplus.storage_type.includes('Hot Hold') && distance > 10) {
        categoryScore = 10;
      }

      let capacityScore = 10;
      if (surplus.quantity > ngo.daily_intake_capacity) {
        capacityScore = 4;
      }

      const totalScore = Math.min(100, Math.round(distanceScore + urgencyScore + categoryScore + capacityScore));

      const reason = `Smart Match: ${ngo.name} is ${distance} km away with ${ngo.daily_intake_capacity} kg daily capacity. Food expires in ${Math.round(hoursToExpiry)}h, making dispatch logistics optimal.`;

      const newMatch: Match = {
        id: generateUUID(),
        surplus_id: surplusId,
        ngo_id: ngo.id,
        distance_km: distance,
        match_score: totalScore,
        reason,
        status: 'suggested',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('matches').insert(newMatch);
        } catch (e) {
          console.warn('Supabase insert match warning:', e);
        }
      }

      matchesToCreate.push(newMatch);
    }

    const allMatches = getStorage<Match[]>('matches', SEED_MATCHES);
    for (const m of matchesToCreate) {
      if (!allMatches.some((x) => x.id === m.id)) {
        allMatches.unshift(m);
      }
    }
    setStorage('matches', allMatches);
    return matchesToCreate;
  },

  async getMatches(): Promise<Match[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('matches').select('*');
        if (!error && data && data.length > 0) {
          const surplusList = await this.getSurplusListings();
          const ngos = await this.getNGOs();
          return (data as Match[]).map((m) => ({
            ...m,
            surplus: surplusList.find((s) => s.id === m.surplus_id),
            ngo: ngos.find((n) => n.id === m.ngo_id)
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch matches warning:', e);
      }
    }
    const matches = getStorage<Match[]>('matches', SEED_MATCHES);
    const surplusList = await this.getSurplusListings();
    const ngos = await this.getNGOs();

    return matches.map((m) => ({
      ...m,
      surplus: surplusList.find((s) => s.id === m.surplus_id),
      ngo: ngos.find((n) => n.id === m.ngo_id)
    }));
  },

  async acceptMatch(matchId: string, actorProfile: Profile): Promise<Match | null> {
    ensureStoreInitialized();
    const matches = getStorage<Match[]>('matches', SEED_MATCHES);
    const match = matches.find((m) => m.id === matchId);
    if (!match) return null;

    match.status = 'accepted';
    match.updated_at = new Date().toISOString();
    setStorage('matches', matches);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('matches').update({ status: 'accepted', updated_at: match.updated_at }).eq('id', matchId);
      } catch (e) {
        console.warn('Supabase update match warning:', e);
      }
    }

    // Update surplus status to matched
    await this.updateSurplusListing(match.surplus_id, {
      pickup_status: 'matched'
    });

    const surplus = await this.getSurplusById(match.surplus_id);
    const ngos = await this.getNGOs();
    const ngo = ngos.find((n) => n.id === match.ngo_id);

    // Create a scheduled pickup
    const pickupId = generateUUID();
    const newPickup: Pickup = {
      id: pickupId,
      match_id: match.id,
      ngo_id: match.ngo_id,
      surplus_id: match.surplus_id,
      pickup_date: new Date().toISOString().split('T')[0],
      pickup_time: new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'scheduled',
      pickup_person: `${ngo?.contact_person || 'NGO Logistics Volunteer'}`,
      notes: 'Automated coordination initiated upon match acceptance.',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('pickups').insert(newPickup);
      } catch (e) {
        console.warn('Supabase insert pickup warning:', e);
      }
    }

    const pickups = getStorage<Pickup[]>('pickups', SEED_PICKUPS);
    pickups.unshift(newPickup);
    setStorage('pickups', pickups);

    // Traceability event
    await this.createTraceabilityEvent({
      surplus_id: match.surplus_id,
      event_type: 'accepted',
      actor_id: actorProfile.id,
      actor_name: actorProfile.full_name,
      location: actorProfile.organization_name,
      description: `Match accepted between ${surplus?.kitchen?.name || 'Kitchen'} and ${ngo?.name || 'NGO'}. Pickup scheduled.`,
      timestamp: new Date().toISOString()
    });

    // Notify kitchen and NGO
    await this.createNotification({
      user_id: actorProfile.id,
      title: 'Match Accepted & Pickup Scheduled',
      message: `Pickup confirmed for ${surplus?.food_name || 'surplus food'}. Dispatch logistics initialized.`,
      type: 'success',
      read: false
    });

    return match;
  },

  async rejectMatch(matchId: string, _actorProfile: Profile): Promise<Match | null> {
    ensureStoreInitialized();
    const matches = getStorage<Match[]>('matches', SEED_MATCHES);
    const match = matches.find((m) => m.id === matchId);
    if (!match) return null;

    match.status = 'rejected';
    match.updated_at = new Date().toISOString();
    setStorage('matches', matches);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('matches').update({ status: 'rejected', updated_at: match.updated_at }).eq('id', matchId);
      } catch (e) {
        console.warn('Supabase reject match warning:', e);
      }
    }
    return match;
  },

  // Pickups
  async getPickups(): Promise<Pickup[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('pickups').select('*');
        if (!error && data && data.length > 0) {
          const surplusList = await this.getSurplusListings();
          const ngos = await this.getNGOs();
          return (data as Pickup[]).map((p) => ({
            ...p,
            surplus: surplusList.find((s) => s.id === p.surplus_id),
            ngo: ngos.find((n) => n.id === p.ngo_id)
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch pickups warning:', e);
      }
    }
    const pickups = getStorage<Pickup[]>('pickups', SEED_PICKUPS);
    const surplusList = await this.getSurplusListings();
    const ngos = await this.getNGOs();

    return pickups.map((p) => ({
      ...p,
      surplus: surplusList.find((s) => s.id === p.surplus_id),
      ngo: ngos.find((n) => n.id === p.ngo_id)
    }));
  },

  async updatePickupStatus(
    pickupId: string,
    status: PickupWorkflowStatus,
    actorProfile: Profile,
    notes?: string
  ): Promise<Pickup | null> {
    ensureStoreInitialized();
    const pickups = getStorage<Pickup[]>('pickups', SEED_PICKUPS);
    const pickup = pickups.find((p) => p.id === pickupId);
    if (!pickup) return null;

    pickup.status = status;
    if (notes) pickup.notes = notes;
    if (status === 'completed') {
      pickup.completed_at = new Date().toISOString();
    }
    setStorage('pickups', pickups);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('pickups').update({
          status,
          notes: pickup.notes,
          completed_at: pickup.completed_at
        }).eq('id', pickupId);
      } catch (e) {
        console.warn('Supabase update pickup warning:', e);
      }
    }

    const surplus = await this.getSurplusById(pickup.surplus_id);
    const quantity = surplus?.quantity || 20;

    if (status === 'in_progress') {
      await this.updateSurplusListing(pickup.surplus_id, {
        pickup_status: 'picked_up'
      });

      await this.createTraceabilityEvent({
        surplus_id: pickup.surplus_id,
        event_type: 'picked_up',
        actor_id: actorProfile.id,
        actor_name: actorProfile.full_name,
        location: actorProfile.organization_name,
        description: `Food picked up from source facility. En route in thermal transport.`,
        timestamp: new Date().toISOString()
      });
    } else if (status === 'completed') {
      await this.updateSurplusListing(pickup.surplus_id, {
        pickup_status: 'completed'
      });

      // Record final traceability event
      await this.createTraceabilityEvent({
        surplus_id: pickup.surplus_id,
        event_type: 'completed',
        actor_id: actorProfile.id,
        actor_name: actorProfile.full_name,
        location: actorProfile.organization_name,
        description: `Successfully delivered and distributed to community beneficiaries. ${quantity} kg rescued!`,
        timestamp: new Date().toISOString()
      });

      // Update Impact Metrics (1 kg food ≈ 2.5 meals, 2.5 kg CO2e avoided)
      await this.incrementImpact(quantity);

      // Create completion notification
      await this.createNotification({
        user_id: actorProfile.id,
        title: 'Redistribution Completed!',
        message: `Successfully distributed ${quantity} kg food, serving ~${Math.round(quantity * 2.5)} meals and avoiding ${Math.round(quantity * 2.5)} kg CO₂!`,
        type: 'success',
        read: false
      });
    }

    return pickup;
  },

  // Traceability
  async getTraceabilityEvents(surplusId?: string): Promise<TraceabilityEvent[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase.from('traceability_events').select('*').order('timestamp', { ascending: true });
        if (surplusId) q = q.eq('surplus_id', surplusId);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data as TraceabilityEvent[];
      } catch (e) {
        console.warn('Supabase fetch traceability warning:', e);
      }
    }
    const events = getStorage<TraceabilityEvent[]>('traceability_events', SEED_TRACEABILITY);
    return surplusId ? events.filter((e) => e.surplus_id === surplusId) : events;
  },

  async createTraceabilityEvent(
    event: Omit<TraceabilityEvent, 'id'>
  ): Promise<TraceabilityEvent> {
    ensureStoreInitialized();
    const newId = generateUUID();
    const newEvent: TraceabilityEvent = {
      ...event,
      id: newId
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('traceability_events').insert(newEvent);
      } catch (e) {
        console.warn('Supabase insert traceability warning:', e);
      }
    }

    const events = getStorage<TraceabilityEvent[]>('traceability_events', SEED_TRACEABILITY);
    events.unshift(newEvent);
    setStorage('traceability_events', events);
    return newEvent;
  },

  // Impact Metrics
  async getImpactMetrics(): Promise<ImpactMetrics> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('impact_metrics').select('*').limit(1).maybeSingle();
        if (!error && data) return data as ImpactMetrics;
      } catch (e) {
        console.warn('Supabase fetch impact warning:', e);
      }
    }
    return getStorage<ImpactMetrics>('impact_metrics', SEED_IMPACT);
  },

  async incrementImpact(foodKg: number): Promise<ImpactMetrics> {
    const current = await this.getImpactMetrics();
    const meals = Math.round(foodKg * 2.5);
    const co2 = Math.round(foodKg * 2.5 * 10) / 10;
    const people = Math.round(meals * 0.8);

    const updated: ImpactMetrics = {
      ...current,
      food_saved_kg: current.food_saved_kg + foodKg,
      meals_supported: current.meals_supported + meals,
      people_reached: current.people_reached + people,
      co2_saved_kg: current.co2_saved_kg + co2,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('impact_metrics').upsert(updated);
      } catch (e) {
        console.warn('Supabase update impact warning:', e);
      }
    }

    setStorage('impact_metrics', updated);
    return updated;
  },

  // Leaderboard
  async getLeaderboard(typeFilter?: 'all' | 'kitchen' | 'fpu' | 'ngo'): Promise<LeaderboardEntry[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase.from('leaderboard').select('*').order('rank', { ascending: true });
        if (typeFilter && typeFilter !== 'all') {
          q = q.eq('organization_type', typeFilter);
        }
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data as LeaderboardEntry[];
      } catch (e) {
        console.warn('Supabase fetch leaderboard warning:', e);
      }
    }
    let entries = getStorage<LeaderboardEntry[]>('leaderboard', SEED_LEADERBOARD);
    if (typeFilter && typeFilter !== 'all') {
      entries = entries.filter((e) => e.organization_type === typeFilter);
    }
    return entries
      .sort((a, b) => b.food_saved_kg - a.food_saved_kg)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    ensureStoreInitialized();
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (!error && data) return data as NotificationItem[];
      } catch (e) {
        console.warn('Supabase fetch notifications warning:', e);
      }
    }
    const notifs = getStorage<NotificationItem[]>('notifications', SEED_NOTIFICATIONS);
    return userId ? notifs.filter((n) => n.user_id === userId) : notifs;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch (e) {
        console.warn('Supabase mark notification warning:', e);
      }
    }
    const notifs = getStorage<NotificationItem[]>('notifications', SEED_NOTIFICATIONS);
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      setStorage('notifications', notifs);
    }
  },

  async createNotification(
    data: Omit<NotificationItem, 'id' | 'created_at'>
  ): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      ...data,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('notifications').insert(newNotif);
      } catch (e) {
        console.warn('Supabase insert notification warning:', e);
      }
    }
    const notifs = getStorage<NotificationItem[]>('notifications', SEED_NOTIFICATIONS);
    notifs.unshift(newNotif);
    setStorage('notifications', notifs);
    return newNotif;
  },

  // Sync demo dataset directly into connected Supabase database
  async syncSeedDataToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured yet. Please configure credentials first.' };
    }

    try {
      let insertedCount = 0;

      // 1. Profiles
      try {
        const { error } = await supabase.from('profiles').upsert(SEED_PROFILES);
        if (!error) insertedCount += SEED_PROFILES.length;
      } catch (e) {
        console.warn('Profiles upsert note:', e);
      }

      // 2. Kitchens
      try {
        const { error } = await supabase.from('kitchens').upsert(SEED_KITCHENS);
        if (!error) insertedCount += SEED_KITCHENS.length;
      } catch (e) {
        console.warn('Kitchens upsert note:', e);
      }

      // 3. NGOs
      try {
        const { error } = await supabase.from('ngos').upsert(SEED_NGOS);
        if (!error) insertedCount += SEED_NGOS.length;
      } catch (e) {
        console.warn('NGOs upsert note:', e);
      }

      // 4. FPUs
      try {
        const { error } = await supabase.from('fpus').upsert(SEED_FPUS);
        if (!error) insertedCount += SEED_FPUS.length;
      } catch (e) {
        console.warn('FPUs upsert note:', e);
      }

      // 5. Surplus listings
      try {
        const listingsToInsert = SEED_SURPLUS.map(({ kitchen, ...rest }) => rest);
        const { error } = await supabase.from('surplus_listings').upsert(listingsToInsert);
        if (!error) insertedCount += listingsToInsert.length;
      } catch (e) {
        console.warn('Surplus listings upsert note:', e);
      }

      // 6. Safety checks
      try {
        const { error } = await supabase.from('safety_checks').upsert(SEED_SAFETY_CHECKS);
        if (!error) insertedCount += SEED_SAFETY_CHECKS.length;
      } catch (e) {
        console.warn('Safety checks upsert note:', e);
      }

      // 7. Matches
      try {
        const matchesToInsert = SEED_MATCHES.map(({ surplus, ngo, ...rest }) => rest);
        const { error } = await supabase.from('matches').upsert(matchesToInsert);
        if (!error) insertedCount += matchesToInsert.length;
      } catch (e) {
        console.warn('Matches upsert note:', e);
      }

      // 8. Pickups
      try {
        const pickupsToInsert = SEED_PICKUPS.map(({ surplus, ngo, ...rest }) => rest);
        const { error } = await supabase.from('pickups').upsert(pickupsToInsert);
        if (!error) insertedCount += pickupsToInsert.length;
      } catch (e) {
        console.warn('Pickups upsert note:', e);
      }

      // 9. Traceability events
      try {
        const { error } = await supabase.from('traceability_events').upsert(SEED_TRACEABILITY);
        if (!error) insertedCount += SEED_TRACEABILITY.length;
      } catch (e) {
        console.warn('Traceability upsert note:', e);
      }

      // 10. Impact metrics
      try {
        const { error } = await supabase.from('impact_metrics').upsert(SEED_IMPACT);
        if (!error) insertedCount += 1;
      } catch (e) {
        console.warn('Impact metrics upsert note:', e);
      }

      // 11. Leaderboard
      try {
        const { error } = await supabase.from('leaderboard').upsert(SEED_LEADERBOARD);
        if (!error) insertedCount += SEED_LEADERBOARD.length;
      } catch (e) {
        console.warn('Leaderboard upsert note:', e);
      }

      return {
        success: true,
        message: `Successfully synchronized demo records into your cloud Supabase PostgreSQL database!`,
        count: insertedCount
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error occurred while synchronizing records to Supabase.'
      };
    }
  }
};
