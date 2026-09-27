import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Profile, UserRole } from '../types';
import { dataService, SEED_PROFILES, generateUUID } from '../services/dataService';
import {
  supabase,
  isSupabaseConfigured,
  initSupabaseClient,
  onSupabaseConfigChange,
} from '../services/supabaseClient';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: UserRole; user?: Profile }>;
  register: (data: {
    fullName: string;
    email: string;
    password?: string;
    phone: string;
    organizationName: string;
    role: UserRole;
    location: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUserRole: (role: UserRole) => Promise<void>;
  refreshSupabaseStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'ecofeast_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const authSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  const checkAndInitSession = useCallback(async () => {
    try {
      // First check if server or environment provides Supabase config
      await initSupabaseClient();
      const live = isSupabaseConfigured();
      setIsSupabaseLive(live);

      if (live && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await dataService.getProfileById(session.user.id);
            if (profile) {
              setUser(profile);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
              setIsLoading(false);
              return;
            }
          }
        } catch (supabaseErr) {
          console.warn('Supabase getSession failed, using local session:', supabaseErr);
        }
      }

      // Local storage session check
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const found = await dataService.getProfileById(parsed.id);
        setUser(found || parsed);
      } else {
        // Default to Kitchen Chef for immediate easy exploration in demo/dev mode
        const defaultKitchen = SEED_PROFILES[0];
        setUser(defaultKitchen);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultKitchen));
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to config changes and auth state changes
  useEffect(() => {
    checkAndInitSession();

    // Listen to reactive Supabase configuration changes
    const unsubConfig = onSupabaseConfigChange((configured, client) => {
      setIsSupabaseLive(configured);

      // Clean up previous auth listener if any
      if (authSubRef.current) {
        authSubRef.current.unsubscribe();
        authSubRef.current = null;
      }

      if (configured && client) {
        try {
          const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const profile = await dataService.getProfileById(session.user.id);
              if (profile) {
                setUser(profile);
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              localStorage.removeItem(AUTH_USER_KEY);
            }
          });
          authSubRef.current = subscription;
        } catch (err) {
          console.warn('Failed to attach Supabase auth listener:', err);
        }
      }
    });

    return () => {
      unsubConfig();
      if (authSubRef.current) {
        authSubRef.current.unsubscribe();
        authSubRef.current = null;
      }
    };
  }, [checkAndInitSession]);

  const refreshSupabaseStatus = async () => {
    await initSupabaseClient();
    setIsSupabaseLive(isSupabaseConfigured());
  };

  const login = async (email: string, _password?: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim();

      if (isSupabaseConfigured() && supabase && _password) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: _password,
          });

          if (!error && data.user) {
            let profile = await dataService.getProfileById(data.user.id);
            if (!profile) {
              // Create profile from user_metadata if it was created in Supabase Auth
              const meta = data.user.user_metadata || {};
              profile = {
                id: data.user.id,
                full_name: meta.full_name || cleanEmail.split('@')[0],
                email: data.user.email || cleanEmail,
                phone: meta.phone || '',
                organization_name: meta.organization_name || 'My Organization',
                role: (meta.role as UserRole) || 'kitchen',
                location: meta.location || 'New Delhi',
                avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(data.user.id)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              await dataService.saveProfile(profile);
            }

            setUser(profile);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
            setIsLoading(false);
            return { success: true, role: profile.role, user: profile };
          }

          if (error && !error.message.includes('Invalid login credentials')) {
            console.warn('Supabase auth warning:', error.message);
          }
        } catch (supabaseLoginErr) {
          console.warn('Supabase login request failed:', supabaseLoginErr);
        }
      }

      // Check local profiles (seeded or locally created)
      const profiles = await dataService.getProfiles();
      const matched = profiles.find((p) => p.email.toLowerCase() === cleanEmail.toLowerCase());

      if (matched) {
        setUser(matched);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matched));
        setIsLoading(false);
        return { success: true, role: matched.role, user: matched };
      }

      // If email doesn't exist
      setIsLoading(false);
      return {
        success: false,
        error: 'No account found with this email. Please check your credentials or create a new account.',
      };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password?: string;
    phone: string;
    organizationName: string;
    role: UserRole;
    location: string;
  }) => {
    setIsLoading(true);
    try {
      // Always generate an RFC 4122 compliant UUID so PostgreSQL UUID primary keys are satisfied
      let userId = generateUUID();

      // If Supabase Auth is active, register user with Supabase Auth first
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email.trim(),
            password: data.password || 'EcoFeast2026!',
            options: {
              data: {
                full_name: data.fullName,
                role: data.role,
                organization_name: data.organizationName,
                phone: data.phone,
                location: data.location,
              },
            },
          });

          if (authError) {
            console.warn('Supabase auth signUp error:', authError.message);
            // If user already exists in Supabase Auth, notify user
            if (authError.message.includes('already registered')) {
              setIsLoading(false);
              return { success: false, error: 'An account with this email is already registered in Supabase. Please sign in instead.' };
            }
          } else if (authData.user) {
            userId = authData.user.id;
          }
        } catch (supabaseSignUpErr: any) {
          console.warn('Supabase signUp request failed, proceeding with local profile creation:', supabaseSignUpErr);
        }
      }

      const newProfile: Profile = {
        id: userId,
        full_name: data.fullName,
        email: data.email.trim(),
        phone: data.phone,
        organization_name: data.organizationName,
        role: data.role,
        location: data.location,
        avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(data.organizationName)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await dataService.saveProfile(newProfile);

      // Create role-specific parent record with valid UUIDs
      if (data.role === 'kitchen') {
        await dataService.saveKitchen({
          id: generateUUID(),
          profile_id: userId,
          name: data.organizationName,
          location: data.location,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
          contact_person: `${data.fullName} (${data.phone})`,
          daily_capacity: 500,
        });
      } else if (data.role === 'ngo') {
        await dataService.saveNGO({
          id: generateUUID(),
          profile_id: userId,
          name: data.organizationName,
          location: data.location,
          contact_person: `${data.fullName} (${data.phone})`,
          service_area: `${data.location} community clusters`,
          latitude: 28.6200 + (Math.random() - 0.5) * 0.1,
          longitude: 77.2150 + (Math.random() - 0.5) * 0.1,
          daily_intake_capacity: 450,
        });
      } else if (data.role === 'fpu') {
        await dataService.saveFPU({
          id: generateUUID(),
          profile_id: userId,
          name: data.organizationName,
          location: data.location,
          contact_person: `${data.fullName} (${data.phone})`,
          processing_capacity: 1000,
        });
      }

      setUser(newProfile);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newProfile));
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const switchUserRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    const profiles = await dataService.getProfiles();
    let target = profiles.find((p) => p.role === targetRole);
    if (!target) {
      target = SEED_PROFILES.find((p) => p.role === targetRole) || SEED_PROFILES[0];
    }
    setUser(target);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(target));
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isSupabaseLive,
        login,
        register,
        logout,
        switchUserRole,
        refreshSupabaseStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
