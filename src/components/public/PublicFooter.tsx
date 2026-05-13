'use client';
import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api';
import { useSiteSettingsStore } from '@/lib/store';

interface NavItem {
  id: string;
  label: string;
  url: string;
  type: string;
  target: string;
  page_slug?: string;
  children: NavItem[];
}

export function PublicFooter() {
  const [footerItems, setFooterItems] = useState<NavItem[]>([]);
  const { settings } = useSiteSettingsStore();

  useEffect(() => {
    publicApi.navigation('footer')
      .then(({ data }) => setFooterItems(data?.menu?.items || []))
      .catch(() => {});
  }, []);

  const showLogo = settings.show_logo_footer !== false;
  const showName = settings.show_name_footer !== false;

  const getHref = (item: NavItem) => {
    if (item.type === 'page' && item.page_slug) {
      return item.page_slug === 'home' ? '/' : `/pages/${item.page_slug}`;
    }
    return item.url || '#';
  };

  return (
    <footer className="pt-12 pb-6 px-6 border-t"
      style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Top section */}
        <div className="flex flex-col md:flex-row gap-8 pb-8 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          {/* Brand */}
          <div className="flex flex-col gap-3 md:w-64 flex-shrink-0">
            {showLogo && settings.site_logo && (
              <img src={settings.site_logo as string} alt={settings.site_name as string || ''}
                className="h-10 object-contain self-start opacity-90" />
            )}
            {showName && settings.site_name && (
              <p className="font-heading font-bold text-lg opacity-90">{settings.site_name as string}</p>
            )}
            {settings.site_description && (
              <p className="text-sm opacity-50 leading-relaxed">{settings.site_description as string}</p>
            )}

            {/* Social links */}
            <div className="flex gap-3 mt-1 flex-wrap">
              {settings.social_facebook && (
                <a href={settings.social_facebook as string} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80"
                  style={{ background: '#1877f2' }}>f</a>
              )}
              {settings.social_twitter && (
                <a href={settings.social_twitter as string} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80"
                  style={{ background: '#000' }}>X</a>
              )}
              {settings.social_instagram && (
                <a href={settings.social_instagram as string} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80"
                  style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>ig</a>
              )}
              {settings.social_linkedin && (
                <a href={settings.social_linkedin as string} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80"
                  style={{ background: '#0077b5' }}>in</a>
              )}
              {settings.social_youtube && (
                <a href={settings.social_youtube as string} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80"
                  style={{ background: '#ff0000' }}>▶</a>
              )}
            </div>
          </div>

          {/* Footer nav links */}
          {footerItems.length > 0 && (
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6">
              {/* Group items — top-level as headings, children as sub-links */}
              {footerItems.map((item) => (
                <div key={item.id}>
                  {item.children.length > 0 ? (
                    <>
                      <p className="text-sm font-semibold mb-3 opacity-80">{item.label}</p>
                      <ul className="space-y-2">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <a href={getHref(child)}
                              target={child.target === '_blank' ? '_blank' : undefined}
                              className="text-sm opacity-50 hover:opacity-100 transition-opacity">
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a href={getHref(item)}
                      target={item.target === '_blank' ? '_blank' : undefined}
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contact info */}
          {(settings.site_email || settings.site_phone || settings.site_address) && (
            <div className="md:w-52 flex-shrink-0 space-y-2">
              <p className="text-sm font-semibold mb-3 opacity-80">تواصل معنا</p>
              {settings.site_email && (
                <a href={`mailto:${settings.site_email}`}
                  className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity">
                  <span>✉️</span> {settings.site_email as string}
                </a>
              )}
              {settings.site_phone && (
                <a href={`tel:${settings.site_phone}`}
                  className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity">
                  <span>📞</span> {settings.site_phone as string}
                </a>
              )}
              {settings.site_address && (
                <p className="flex items-start gap-2 text-sm opacity-50">
                  <span>📍</span> {settings.site_address as string}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="pt-5 text-center">
          <p className="text-xs opacity-40">
            {settings.footer_text as string || `© ${new Date().getFullYear()} ${settings.site_name as string || ''} — جميع الحقوق محفوظة`}
          </p>
        </div>
      </div>
    </footer>
  );
}
