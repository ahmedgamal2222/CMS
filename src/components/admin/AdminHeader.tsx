'use client';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Bell, Settings, Sun, Moon, ExternalLink } from 'lucide-react';
import { useThemeStore } from '@/lib/store';

export function AdminHeader() {
  const { user } = useAuthStore();
  const { darkMode, setTheme } = useThemeStore();

  return (
    <header
      className="h-14 px-6 flex items-center justify-between border-b sticky top-0 z-10"
      style={{ background: 'var(--color-surface)', borderColor: 'rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text)' }}>
        <span className="opacity-60">نظام إدارة المحتوى</span>
      </div>

      <div className="flex items-center gap-2">
        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ color: 'var(--color-text)' }}
          title="عرض الموقع"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme({ darkMode: !darkMode })}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ color: 'var(--color-text)' }}
          title={darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings shortcut */}
        <Link
          href="/admin/settings"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ color: 'var(--color-text)' }}
          title="الإعدادات"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer"
          style={{ background: 'var(--color-primary)' }}
          title={user?.name}
        >
          {user?.name?.charAt(0) || 'م'}
        </div>
      </div>
    </header>
  );
}
