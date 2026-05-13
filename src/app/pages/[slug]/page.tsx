'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { useSiteSettingsStore } from '@/lib/store';
import { LandingSection, type Section } from '@/components/LandingSection';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PublicPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { settings, loaded } = useSiteSettingsStore();

  useEffect(() => {
    if (!params.slug) return;
    publicApi.page(params.slug)
      .then(({ data }) => {
        setPage(data.page);
        const rawSections: any[] = data.sections || [];
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
        // Update page title
        if (data.page?.meta_title || data.page?.title) {
          document.title = data.page.meta_title || data.page.title;
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
        setLoading(false);
      });
  }, [params.slug]);

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

  if (notFound) {
    return (
      <div dir="rtl" style={{ background: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <PublicNavbar />
        <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 pt-24">
          <div className="text-8xl">404</div>
          <h1 className="text-2xl font-heading font-bold">الصفحة غير موجودة</h1>
          <p className="opacity-50 text-center max-w-md">
            الصفحة التي تبحث عنها غير موجودة أو غير منشورة.
          </p>
          <a href="/"
            className="px-6 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'var(--color-primary)' }}>
            العودة للرئيسية
          </a>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ background: 'var(--color-background)', color: 'var(--color-text)' }}>
      <PublicNavbar />

      <main className="pt-16">
        {/* If page has sections, render them */}
        {sections.length > 0 ? (
          sections.map((section) => (
            <LandingSection key={section.id} section={section} />
          ))
        ) : (
          /* Otherwise render page content (HTML) */
          <div className="max-w-4xl mx-auto px-6 py-16">
            {page?.featured_image && (
              <img src={page.featured_image} alt={page.title}
                className="w-full h-64 object-cover rounded-2xl mb-10" />
            )}
            <h1 className="text-4xl font-heading font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              {page?.title}
            </h1>
            {page?.content && (
              <div
                className="prose prose-lg max-w-none leading-relaxed"
                style={{ color: 'var(--color-text)' }}
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
