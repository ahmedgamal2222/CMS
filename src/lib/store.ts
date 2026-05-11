import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        const { data } = await authApi.login(email, password);
        const { token, user } = data;
        Cookies.set('cms_token', token, { expires: 7, sameSite: 'Lax' });
        localStorage.setItem('cms_token', token);
        set({ token, user, isLoading: false });
      },

      logout: () => {
        Cookies.remove('cms_token');
        localStorage.removeItem('cms_token');
        set({ user: null, token: null });
        window.location.href = '/admin/login';
      },

      loadUser: async () => {
        const token = Cookies.get('cms_token') || localStorage.getItem('cms_token');
        if (!token) return;
        try {
          const { data } = await authApi.me();
          set({ user: data.user, token });
        } catch {
          Cookies.remove('cms_token');
          localStorage.removeItem('cms_token');
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: 'cms-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Theme store
interface ThemeSettings {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  colorSurface: string;
  fontHeading: string;
  fontBody: string;
  darkMode: boolean;
}

interface ThemeState extends ThemeSettings {
  setTheme: (settings: Partial<ThemeSettings>) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      colorPrimary: '#6366f1',
      colorSecondary: '#8b5cf6',
      colorAccent: '#f59e0b',
      colorBackground: '#ffffff',
      colorText: '#111827',
      colorSurface: '#f9fafb',
      fontHeading: 'Cairo',
      fontBody: 'Tajawal',
      darkMode: false,

      setTheme: (settings) => {
        set(settings);
        get().applyTheme();
      },

      applyTheme: () => {
        if (typeof document === 'undefined') return;
        const state = get();
        const root = document.documentElement;
        root.style.setProperty('--color-primary', state.colorPrimary);
        root.style.setProperty('--color-secondary', state.colorSecondary);
        root.style.setProperty('--color-accent', state.colorAccent);
        root.style.setProperty('--color-background', state.colorBackground);
        root.style.setProperty('--color-text', state.colorText);
        root.style.setProperty('--color-surface', state.colorSurface);
        root.style.setProperty('--font-heading', state.fontHeading);
        root.style.setProperty('--font-body', state.fontBody);
        root.style.setProperty('--radius', '0.5rem');
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    { name: 'cms-theme' }
  )
);
