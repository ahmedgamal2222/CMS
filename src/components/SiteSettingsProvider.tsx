'use client';
import { useEffect } from 'react';
import { publicApi } from '@/lib/api';
import { useSiteSettingsStore } from '@/lib/store';

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const { setSettings } = useSiteSettingsStore();

  useEffect(() => {
    publicApi.settings()
      .then(({ data }) => {
        const raw: Record<string, string> = {};
        // API returns flat key-value object
        for (const [k, v] of Object.entries(data as Record<string, any>)) {
          raw[k] = String(v ?? '');
        }

        // Update document title
        if (raw.site_name) document.title = raw.site_name;

        // Update favicon dynamically
        if (raw.site_favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = raw.site_favicon;
        }

        // Apply CSS theme variables
        const root = document.documentElement;
        if (raw.color_primary)    root.style.setProperty('--color-primary', raw.color_primary);
        if (raw.color_secondary)  root.style.setProperty('--color-secondary', raw.color_secondary);
        if (raw.color_accent)     root.style.setProperty('--color-accent', raw.color_accent);
        if (raw.color_background) root.style.setProperty('--color-background', raw.color_background);
        if (raw.color_text)       root.style.setProperty('--color-text', raw.color_text);
        if (raw.color_surface)    root.style.setProperty('--color-surface', raw.color_surface);
        if (raw.font_heading)     root.style.setProperty('--font-heading', `'${raw.font_heading}', sans-serif`);
        if (raw.font_body)        root.style.setProperty('--font-body', `'${raw.font_body}', sans-serif`);

        // Store in global state
        setSettings(raw);
      })
      .catch(() => { /* silently fail */ });
  }, [setSettings]);

  return <>{children}</>;
}
