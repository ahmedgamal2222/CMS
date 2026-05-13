'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useSiteSettingsStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    publicApi.navigation('header')
      .then(({ data }) => setNavItems(data?.menu?.items || []))
      .catch(() => {});
  }, []);

  const showLogo = settings.show_logo_navbar !== false;
  const showName = settings.show_name_navbar !== false;

  const getHref = (item: NavItem) => {
    if (item.type === 'page' && item.page_slug) {
      return item.page_slug === 'home' ? '/' : `/pages/${item.page_slug}`;
    }
    return item.url || '#';
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}
      style={{
        background: scrolled ? 'var(--color-background)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          {showLogo && settings.site_logo ? (
            <img src={settings.site_logo as string} alt={settings.site_name as string || ''} className="h-9 object-contain" />
          ) : showLogo ? (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
              {(settings.site_name as string)?.charAt(0) || 'C'}
            </div>
          ) : null}
          {showName && settings.site_name && (
            <span className="font-heading font-bold text-lg hidden sm:block"
              style={{ color: scrolled ? 'var(--color-text)' : '#fff' }}>
              {settings.site_name as string}
            </span>
          )}
        </Link>

        {/* Desktop nav items */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                <a
                  href={getHref(item)}
                  target={item.target === '_blank' ? '_blank' : undefined}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ color: scrolled ? 'var(--color-text)' : 'rgba(255,255,255,0.9)' }}>
                  {item.label}
                </a>
                {/* Dropdown for children */}
                {item.children.length > 0 && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border min-w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                    style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                    {item.children.map((child) => (
                      <a key={child.id} href={getHref(child)}
                        target={child.target === '_blank' ? '_blank' : undefined}
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                        style={{ color: 'var(--color-text)' }}>
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile menu toggle */}
          {navItems.length > 0 && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: scrolled ? 'var(--color-text)' : '#fff' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && navItems.length > 0 && (
        <div className="md:hidden border-t px-4 py-3 space-y-1"
          style={{ background: 'var(--color-background)', borderColor: 'rgba(0,0,0,0.08)' }}>
          {navItems.map((item) => (
            <a key={item.id} href={getHref(item)}
              target={item.target === '_blank' ? '_blank' : undefined}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              style={{ color: 'var(--color-text)' }}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
