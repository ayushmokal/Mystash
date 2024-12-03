import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(s => ({ ...s, session, user: session?.user ?? null }));
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState(s => ({ ...s, session, user: session?.user ?? null }));
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setState(s => ({ ...s, profile: null, loading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setState(s => ({ 
        ...s, 
        profile: data || null,
        loading: false 
      }));
    } catch (error) {
      console.error('Error loading user profile:', error);
      setState(s => ({ ...s, loading: false }));
    }
  }

  async function signUp(email: string, password: string, username: string) {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create a profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
    }

    navigate('/login?verified=false');
  }

  async function signIn(email: string, password: string, remember = false) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        persistSession: remember,
      },
    });

    if (error) throw error;
    
    // Get the username from user metadata or email
    const username = data.user?.user_metadata?.username || data.user?.email?.split('@')[0];
    navigate(`/${username}`);
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  }

  async function signInWithGithub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('/');
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    navigate('/');
  }

  const value = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}