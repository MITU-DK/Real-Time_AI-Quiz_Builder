// ─── Auth Store (Zustand)
// Manages JWT token and user info.
// Only the token is persisted in localStorage.
// User profile is always fetched fresh from the DB via GET /api/auth/me.

import { create } from 'zustand';
import { getMe } from '../services/api';

interface AuthUser {
  id: number;
  email: string;
  display_name: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  hydrate: () => Promise<void>; // Restore session on app start 
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => {

    localStorage.setItem('token', token);

    set({ token, user, isAuthenticated: true });  //user info from db.
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Token exists — mark as authenticated immediately so ProtectedRoute passes,
    // then fetch fresh user profile from the database.
    set({ token, isAuthenticated: true });

    try {
      const user = await getMe() as AuthUser;
      set({ user });
    }
    catch {
      // Token is invalid or expired — clean up
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
}));
