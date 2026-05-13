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

// ─── Site Settings Store ───────────────────────────────────────────────────
export interface SiteSettingsData {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  footer_text: string;
  show_logo_navbar: boolean;
  show_name_navbar: boolean;
  show_logo_footer: boolean;
  show_name_footer: boolean;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_background: string;
  color_text: string;
  color_surface: string;
  font_heading: string;
  font_body: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
  social_youtube: string;
  [key: string]: string | boolean;
}

interface SiteSettingsState {
  settings: SiteSettingsData;
  loaded: boolean;
  setSettings: (raw: Record<string, string>) => void;
}

const defaultSiteSettings: SiteSettingsData = {
  site_name: '',
  site_description: '',
  site_logo: '',
  site_favicon: '',
  site_email: '',
  site_phone: '',
  site_address: '',
  footer_text: '',
  show_logo_navbar: true,
  show_name_navbar: true,
  show_logo_footer: true,
  show_name_footer: true,
  color_primary: '#6366f1',
  color_secondary: '#8b5cf6',
  color_accent: '#f59e0b',
  color_background: '#ffffff',
  color_text: '#111827',
  color_surface: '#f9fafb',
  font_heading: 'Cairo',
  font_body: 'Tajawal',
  social_facebook: '',
  social_twitter: '',
  social_instagram: '',
  social_linkedin: '',
  social_youtube: '',
};

export const useSiteSettingsStore = create<SiteSettingsState>()((set) => ({
  settings: { ...defaultSiteSettings },
  loaded: false,
  setSettings: (raw: Record<string, string>) => {
    const parsed: SiteSettingsData = { ...defaultSiteSettings };
    for (const [k, v] of Object.entries(raw)) {
      if (k.startsWith('show_')) {
        (parsed as any)[k] = v !== 'false';
      } else {
        (parsed as any)[k] = v ?? '';
      }
    }
    set({ settings: parsed, loaded: true });
  },
}));

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
