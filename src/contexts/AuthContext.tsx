import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types';
import { dataService, SEED_PROFILES, generateUUID } from '../services/dataService';
import {
  supabase,
  isSupabaseConfigured,
  initSupabaseClient,
  onSupabaseConfigChange,
} from '../services/supabaseClient';

type AuthResult = {
  success: boolean;
  error?: string;
  role?: UserRole;
  user?: Profile;
  requiresEmailConfirmation?: boolean;
};

type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  organizationName: string;
  role: UserRole;
  location: string;
};

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginDemo: (email: string) => Promise<AuthResult>;
  register: (data: RegistrationData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  switchUserRole: (role: UserRole) => Promise<void>;
  refreshSupabaseStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_SESSION_KEY = 'ecofeast_demo_profile_id';
const LEGACY_AUTH_USER_KEY = 'ecofeast_auth_user';

const isDemoRole = (role: unknown): role is Exclude<UserRole, 'admin'> =>
  role === 'kitchen' || role === 'fpu' || role === 'ngo';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

async function getOrCreateAuthProfile(authUser: SupabaseUser): Promise<Profile> {
  const existingProfile = await dataService.getProfileById(authUser.id);
  if (existingProfile) return existingProfile;

  const metadata = authUser.user_metadata || {};
  const requestedRole = metadata.role;
  const profile: Profile = {
    id: authUser.id,
    full_name:
      typeof metadata.full_name === 'string' && metadata.full_name.trim()
        ? metadata.full_name.trim()
        : authUser.email?.split('@')[0] || 'EcoFeast user',
    email: authUser.email || '',
    phone: typeof metadata.phone === 'string' ? metadata.phone : '',
    organization_name:
      typeof metadata.organization_name === 'string' && metadata.organization_name.trim()
        ? metadata.organization_name.trim()
        : 'My Organization',
    // Admin access must be assigned by a trusted process, never from user-editable metadata.
    role: isDemoRole(requestedRole) ? requestedRole : 'kitchen',
    location:
      typeof metadata.location === 'string' && metadata.location.trim()
        ? metadata.location.trim()
        : 'New Delhi',
    avatar_url:
      'https://api.dicebear.com/7.x/shapes/svg?seed=' + encodeURIComponent(authUser.id),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return dataService.saveProfile(profile);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const authSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const clearAuthListener = () => {
      authSubRef.current?.unsubscribe();
      authSubRef.current = null;
    };

    const handleAuthChange = (configured: boolean, client: typeof supabase | null) => {
      setIsSupabaseLive(configured);
      clearAuthListener();

      if (!configured || !client) {
        setUser(null);
        setIsDemoMode(false);
        return;
      }

      localStorage.removeItem(DEMO_SESSION_KEY);
      setUser(null);
      setIsDemoMode(false);

      try {
        const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            void getOrCreateAuthProfile(session.user)
              .then((profile) => {
                if (cancelled) return;
                localStorage.removeItem(DEMO_SESSION_KEY);
                localStorage.removeItem(LEGACY_AUTH_USER_KEY);
                setUser(profile);
                setIsDemoMode(false);
              })
              .catch((error) => {
                console.error('Could not load the signed-in profile:', error);
                if (!cancelled) setUser(null);
              });
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem(DEMO_SESSION_KEY);
            localStorage.removeItem(LEGACY_AUTH_USER_KEY);
            setUser(null);
            setIsDemoMode(false);
          }
        });
        authSubRef.current = subscription;
      } catch (error) {
        console.warn('Failed to attach Supabase auth listener:', error);
      }
    };

    const unsubscribeConfig = onSupabaseConfigChange(handleAuthChange);

    const initializeSession = async () => {
      localStorage.removeItem(LEGACY_AUTH_USER_KEY);
      await initSupabaseClient();

      if (cancelled) return;

      const live = isSupabaseConfigured();
      setIsSupabaseLive(live);

      if (live && supabase) {
        localStorage.removeItem(DEMO_SESSION_KEY);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
          const profile = await getOrCreateAuthProfile(data.session.user);
          if (!cancelled) {
            setUser(profile);
            setIsDemoMode(false);
          }
        } else if (!cancelled) {
          setUser(null);
          setIsDemoMode(false);
        }
        return;
      }

      const storedDemoId = localStorage.getItem(DEMO_SESSION_KEY);
      const demoProfile = SEED_PROFILES.find((profile) => profile.id === storedDemoId);
      if (!cancelled) {
        setUser(demoProfile || null);
        setIsDemoMode(Boolean(demoProfile));
      }
    };

    void initializeSession()
      .catch((error) => {
        console.error('Auth initialization error:', error);
        if (!cancelled) {
          setUser(null);
          setIsDemoMode(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribeConfig();
      clearAuthListener();
    };
  }, []);

  const refreshSupabaseStatus = async () => {
    await initSupabaseClient();
    const live = isSupabaseConfigured();
    setIsSupabaseLive(live);

    if (!live || !supabase) {
      setUser(null);
      setIsDemoMode(false);
      localStorage.removeItem(DEMO_SESSION_KEY);
      return;
    }

    localStorage.removeItem(DEMO_SESSION_KEY);
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (!data.session?.user) {
      setUser(null);
      setIsDemoMode(false);
      return;
    }

    const profile = await getOrCreateAuthProfile(data.session.user);
    setUser(profile);
    setIsDemoMode(false);
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      return { success: false, error: 'Enter your email and password.' };
    }
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'Real sign-in is not configured. Use a clearly labelled demo account to explore.',
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return { success: false, error: 'The email or password is incorrect.' };
      }

      const profile = await getOrCreateAuthProfile(data.user);
      localStorage.removeItem(DEMO_SESSION_KEY);
      localStorage.removeItem(LEGACY_AUTH_USER_KEY);
      setUser(profile);
      setIsDemoMode(false);
      return { success: true, role: profile.role, user: profile };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Sign-in failed. Please try again.'),
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (email: string): Promise<AuthResult> => {
    if (isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Demo accounts are disabled while live Supabase authentication is connected.',
      };
    }

    setIsLoading(true);
    try {
      const demoProfile = SEED_PROFILES.find(
        (profile) => profile.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!demoProfile) {
        return { success: false, error: 'That demo account was not found.' };
      }

      localStorage.setItem(DEMO_SESSION_KEY, demoProfile.id);
      localStorage.removeItem(LEGACY_AUTH_USER_KEY);
      setUser(demoProfile);
      setIsDemoMode(true);
      return { success: true, role: demoProfile.role, user: demoProfile };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationData): Promise<AuthResult> => {
    const cleanEmail = data.email.trim();
    const cleanPassword = data.password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Enter an email address and password.' };
    }
    if (cleanPassword.length < 6) {
      return { success: false, error: 'Use a password with at least 6 characters.' };
    }
    if (!isDemoRole(data.role)) {
      return { success: false, error: 'This role cannot be selected during public registration.' };
    }
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'Registration needs a Supabase connection. Use a demo login to explore the prototype.',
      };
    }

    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: data.fullName.trim(),
            role: data.role,
            organization_name: data.organizationName.trim(),
            phone: data.phone.trim(),
            location: data.location.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (!authData.user) {
        return { success: false, error: 'Supabase did not return a new user account.' };
      }

      if (!authData.session) {
        return { success: true, requiresEmailConfirmation: true };
      }

      const userId = authData.user.id;
      const profile = await getOrCreateAuthProfile(authData.user);

      if (data.role === 'kitchen') {
        await dataService.saveKitchen({
          id: generateUUID(),
          profile_id: userId,
          name: data.organizationName,
          location: data.location,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
          longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
          contact_person: data.fullName + ' (' + data.phone + ')',
          daily_capacity: 500,
        });
      } else if (data.role === 'ngo') {
        await dataService.saveNGO({
          id: generateUUID(),
          profile_id: userId,
          name: data.organizationName,
          location: data.location,
          contact_person: data.fullName + ' (' + data.phone + ')',
          service_area: data.location + ' community clusters',
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
          contact_person: data.fullName + ' (' + data.phone + ')',
          processing_capacity: 1000,
        });
      }

      localStorage.removeItem(DEMO_SESSION_KEY);
      setUser(profile);
      setIsDemoMode(false);
      return { success: true, role: profile.role, user: profile };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, 'Registration failed. Please try again.'),
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!isDemoMode && isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Supabase sign-out error:', error);
      }
    }

    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(LEGACY_AUTH_USER_KEY);
    setUser(null);
    setIsDemoMode(false);
  };

  const switchUserRole = async (targetRole: UserRole) => {
    if (!isDemoMode || isSupabaseConfigured()) return;

    const target = SEED_PROFILES.find((profile) => profile.role === targetRole);
    if (!target) return;

    setIsLoading(true);
    localStorage.setItem(DEMO_SESSION_KEY, target.id);
    setUser(target);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isSupabaseLive,
        isDemoMode,
        login,
        loginDemo,
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

