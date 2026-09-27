export type UserRole = 'kitchen' | 'fpu' | 'ngo' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  organization_name: string;
  role: UserRole;
  location: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Kitchen {
  id: string;
  profile_id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  contact_person: string;
  daily_capacity: number;
  created_at?: string;
}

export interface FPU {
  id: string;
  profile_id: string;
  name: string;
  location: string;
  contact_person: string;
  processing_capacity: number;
  created_at?: string;
}

export interface NGO {
  id: string;
  profile_id: string;
  name: string;
  location: string;
  contact_person: string;
  service_area: string;
  latitude: number;
  longitude: number;
  daily_intake_capacity: number;
  created_at?: string;
}

export type FoodCategory =
  | 'Cooked Meals'
  | 'Rice'
  | 'Vegetables'
  | 'Fruits'
  | 'Bakery'
  | 'Dairy'
  | 'Packaged Food'
  | 'Other';

export type StorageType =
  | 'Hot Hold (>60°C)'
  | 'Cold Refrigerated (<4°C)'
  | 'Ambient / Dry (15-25°C)'
  | 'Frozen (<-18°C)';

export type SafetyStatus = 'pending' | 'safe' | 'unsafe' | 'expired';

export type PickupStatus =
  | 'available'
  | 'matched'
  | 'scheduled'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export interface SurplusListing {
  id: string;
  kitchen_id: string;
  food_name: string;
  food_category: FoodCategory;
  quantity: number;
  unit: string;
  prepared_at: string;
  expiry_time: string;
  storage_type: StorageType;
  safety_status: SafetyStatus;
  pickup_status: PickupStatus;
  description?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  // Augmented UI fields
  kitchen?: Kitchen;
}

export interface SafetyCheck {
  id: string;
  surplus_id: string;
  checked_by: string;
  temperature: number; // in Celsius
  appearance_status: 'good' | 'fair' | 'poor';
  packaging_status: 'sealed' | 'intact' | 'compromised';
  expiry_status: 'valid' | 'near_expiry' | 'expired';
  overall_status: 'safe' | 'unsafe' | 'expired' | 'pending';
  notes?: string;
  checked_at?: string;
}

export type MatchStatus = 'suggested' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Match {
  id: string;
  surplus_id: string;
  ngo_id: string;
  distance_km: number;
  match_score: number; // 0 - 100
  reason: string;
  status: MatchStatus;
  created_at?: string;
  updated_at?: string;
  // Augmented
  surplus?: SurplusListing;
  ngo?: NGO;
}

export type PickupWorkflowStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Pickup {
  id: string;
  match_id?: string;
  ngo_id: string;
  surplus_id: string;
  pickup_date: string;
  pickup_time: string;
  status: PickupWorkflowStatus;
  pickup_person: string;
  notes?: string;
  completed_at?: string;
  created_at?: string;
  // Augmented
  surplus?: SurplusListing;
  ngo?: NGO;
}

export type TraceabilityEventType =
  | 'created'
  | 'safety_checked'
  | 'matched'
  | 'accepted'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'delivered'
  | 'completed';

export interface TraceabilityEvent {
  id: string;
  surplus_id: string;
  event_type: TraceabilityEventType;
  actor_id?: string;
  location?: string;
  description: string;
  timestamp: string;
  actor_name?: string;
}

export interface ImpactMetrics {
  id: string;
  organization_id: string;
  organization_type: 'kitchen' | 'fpu' | 'ngo' | 'global';
  food_saved_kg: number;
  meals_supported: number;
  people_reached: number;
  co2_saved_kg: number;
  updated_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_type: 'kitchen' | 'fpu' | 'ngo';
  food_saved_kg: number;
  meals_supported: number;
  co2_saved_kg: number;
  rank: number;
  updated_at?: string;
}

export interface FPUProcessingBatch {
  id: string;
  fpu_id: string;
  source_surplus_id?: string;
  raw_material_name: string;
  quantity_kg: number;
  food_category?: string;
  source_kitchen?: string;
  input_quantity?: number;
  unit?: string;
  processing_type?: string;
  shelf_life_extension_days?: number;
  output_product?: string;
  output_quantity?: number;
  status?: string;
  stage: 'received' | 'processed' | 'packed' | 'redistributed';
  output_product_name: string;
  output_quantity_units: number;
  processing_date: string;
  expiry_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
