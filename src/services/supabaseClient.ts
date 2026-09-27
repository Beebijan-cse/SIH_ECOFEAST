import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration storage keys
const STORAGE_URL_KEY = 'ecofeast_supabase_url';
const STORAGE_KEY_KEY = 'ecofeast_supabase_anon_key';

let activeClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

type ConfigListener = (configured: boolean, client: SupabaseClient | null) => void;
const configListeners: ConfigListener[] = [];

export function isValidConfig(url?: string | null, key?: string | null): boolean {
  return (
    typeof url === 'string' &&
    url.trim().length > 0 &&
    url.trim().startsWith('http') &&
    !url.includes('your-project') &&
    typeof key === 'string' &&
    key.trim().length > 0 &&
    !key.includes('your-anon-public-key')
  );
}

// 1. Initial resolution from Vite env, Node process.env, or localStorage
const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const envUrl = (
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.SUPABASE_URL ||
  procEnv.VITE_SUPABASE_URL ||
  procEnv.SUPABASE_URL ||
  ''
).trim();

const envKey = (
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.SUPABASE_ANON_KEY ||
  metaEnv.VITE_SUPABASE_KEY ||
  metaEnv.SUPABASE_KEY ||
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.SUPABASE_PUBLISHABLE_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.SUPABASE_ANON_KEY ||
  procEnv.SUPABASE_KEY ||
  procEnv.VITE_SUPABASE_KEY ||
  ''
).trim();

const localUrl = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_URL_KEY) || '').trim() : '';
const localKey = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY_KEY) || '').trim() : '';

function createSupabaseInstance(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
}

function notifyListeners() {
  const configured = isSupabaseConfigured();
  configListeners.forEach((fn) => {
    try {
      fn(configured, activeClient);
    } catch (e) {
      console.error('Error in configListener:', e);
    }
  });
}

if (isValidConfig(localUrl, localKey)) {
  currentUrl = localUrl;
  currentKey = localKey;
  activeClient = createSupabaseInstance(localUrl, localKey);
} else if (isValidConfig(envUrl, envKey)) {
  currentUrl = envUrl;
  currentKey = envKey;
  activeClient = createSupabaseInstance(envUrl, envKey);
}

export const isSupabaseConfigured = (): boolean => {
  return isValidConfig(currentUrl, currentKey) && activeClient !== null;
};

export const getSupabaseClient = (): SupabaseClient | null => activeClient;

export const getSupabaseConfig = () => {
  const isEnv = isValidConfig(envUrl, envKey);
  const isCustom = isValidConfig(localUrl, localKey);

  return {
    url: currentUrl,
    isConfigured: isSupabaseConfigured(),
    source: isCustom ? ('custom' as const) : isEnv ? ('env' as const) : ('none' as const),
  };
};

export const onSupabaseConfigChange = (listener: ConfigListener) => {
  configListeners.push(listener);
  // Fire immediately with current state
  try {
    listener(isSupabaseConfigured(), activeClient);
  } catch (err) {
    console.error('Initial listener error:', err);
  }
  return () => {
    const idx = configListeners.indexOf(listener);
    if (idx >= 0) configListeners.splice(idx, 1);
  };
};

// Asynchronously fetch server config on initialization (in case env vars are in server process)
export const initSupabaseClient = async (): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    notifyListeners();
    return true;
  }

  try {
    const res = await fetch('/api/supabase/config');
    if (res.ok) {
      const data = await res.json();
      if (data.configured && isValidConfig(data.supabaseUrl, data.supabaseAnonKey)) {
        currentUrl = data.supabaseUrl.trim();
        currentKey = data.supabaseAnonKey.trim();
        activeClient = createSupabaseInstance(currentUrl, currentKey);
        notifyListeners();
        return true;
      }
    }
  } catch (e) {
    console.warn('Could not query server Supabase config:', e);
  }
  return false;
};

// Test connection to Supabase tables
export const testSupabaseConnection = async (
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string; tablesFound?: string[] }> => {
  const url = (testUrl || currentUrl).trim();
  const key = (testKey || currentKey).trim();

  if (!isValidConfig(url, key)) {
    return {
      success: false,
      message: 'Invalid Supabase Project URL or Anon Key. URL must start with https:// and Anon key must be non-empty.',
    };
  }

  try {
    const client = createClient(url, key);
    const tablesToCheck = ['profiles', 'kitchens', 'surplus_listings', 'matches', 'pickups'];
    const accessibleTables: string[] = [];

    for (const table of tablesToCheck) {
      try {
        const { error } = await client.from(table).select('id').limit(1);
        if (!error || error.code === 'PGRST116') {
          accessibleTables.push(table);
        }
      } catch {
        // continue
      }
    }

    if (accessibleTables.length > 0) {
      return {
        success: true,
        message: `Successfully connected to Supabase! Verified access to ${accessibleTables.length} tables (${accessibleTables.join(', ')}).`,
        tablesFound: accessibleTables,
      };
    }

    // Ping root REST API endpoint
    const pingRes = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (pingRes.ok || pingRes.status === 401 || pingRes.status === 404) {
      return {
        success: true,
        message: 'Connected to Supabase endpoint! Ensure you have executed the database schema migration in the Supabase SQL Editor.',
        tablesFound: [],
      };
    }

    return {
      success: false,
      message: `Received status code ${pingRes.status} from Supabase REST endpoint. Please verify your Project URL and Anon Key.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network request to Supabase failed.',
    };
  }
};

// Save custom Supabase credentials from UI
export const setCustomSupabaseConfig = async (
  url: string,
  anonKey: string
): Promise<{ success: boolean; error?: string }> => {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!isValidConfig(cleanUrl, cleanKey)) {
    return { success: false, error: 'Please enter a valid Supabase Project URL and public Anon Key.' };
  }

  const test = await testSupabaseConnection(cleanUrl, cleanKey);
  if (!test.success) {
    return { success: false, error: test.message };
  }

  try {
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    currentUrl = cleanUrl;
    currentKey = cleanKey;
    activeClient = createSupabaseInstance(cleanUrl, cleanKey);
    notifyListeners();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to save configuration.' };
  }
};

export const clearCustomSupabaseConfig = (): void => {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  if (isValidConfig(envUrl, envKey)) {
    currentUrl = envUrl;
    currentKey = envKey;
    activeClient = createSupabaseInstance(envUrl, envKey);
  } else {
    currentUrl = '';
    currentKey = '';
    activeClient = null;
  }
  notifyListeners();
};

// Proxy export for supabase client to allow dynamic updates
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!activeClient) return undefined;
    const value = (activeClient as any)[prop];
    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
});
