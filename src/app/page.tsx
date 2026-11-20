'use client';
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api';
import { useSiteSettingsStore } from '@/lib/store';
import { LandingSection, type Section } from '@/components/LandingSection';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, loaded } = useSiteSettingsStore();

  useEffect(() => {
    publicApi.landing()
      .catch(() => ({ data: { sections: [] } }))
      .then((landingRes) => {
        const rawSections: any[] = landingRes.data.sections || [];
        setSections(
          rawSections
            .filter((s: any) => s.is_active)
            .map((s: any) => ({
              ...s,
              content: typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {}),
              settings: typeof s.settings === 'string' ? JSON.parse(s.settings) : (s.settings || {}),
            }))
            .sort((a: any, b: any) => a.order_index - b.order_index)
        );
        setLoading(false);
      });
  }, []);

  if (loading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary, #6366f1)' }} />
        </div>
      </div>
    );
  }

  // No sections yet — show default splash (no admin button for public visitors)
  if (sections.length === 0) {
    return (
      <div dir="rtl" style={{ background: 'var(--color-background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <PublicNavbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 p-8 pt-24">
          {settings.site_logo ? (
            <img src={settings.site_logo as string} alt={settings.site_name as string || 'Logo'} className="h-20 object-contain" />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white text-3xl font-bold"
              style={{ background: 'linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }}>
              {(settings.site_name as string)?.charAt(0) || 'C'}
            </div>
          )}
          <h1 className="text-4xl font-heading font-bold text-center" style={{ color: 'var(--color-text)' }}>
            {settings.site_name as string || 'نظام إدارة المحتوى'}
          </h1>
          <p className="text-center max-w-md opacity-60" style={{ color: 'var(--color-text)' }}>
            {settings.site_description as string || 'منصة متكاملة لإدارة المحتوى الرقمي'}
          </p>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: 'var(--color-background)', color: 'var(--color-text)' }}>
      <PublicNavbar />
      <main className="pt-16">
        {sections.map((section) => (
          <LandingSection key={section.id} section={section} />
        ))}
      </main>
      <PublicFooter />
    </div>
  );
}
