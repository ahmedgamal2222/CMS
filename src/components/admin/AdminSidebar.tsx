'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard, FileText, BookOpen, Image, Users, Settings,
  Languages, Navigation, Tag, FolderOpen, ChevronLeft, Menu,
  LogOut, Globe, MessageSquare, Home
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
  { href: '/admin/pages', label: 'الصفحات', icon: FileText },
  { href: '/admin/posts', label: 'المقالات', icon: BookOpen },
  { href: '/admin/media', label: 'الوسائط', icon: Image },
  {
    label: 'المحتوى',
    icon: FolderOpen,
    children: [
      { href: '/admin/categories', label: 'التصنيفات', icon: FolderOpen },
      { href: '/admin/tags', label: 'الوسوم', icon: Tag },
      { href: '/admin/navigation', label: 'القوائم', icon: Navigation },
    ]
  },
  {
    label: 'الإعدادات',
    icon: Settings,
    children: [
      { href: '/admin/settings', label: 'إعدادات الموقع', icon: Settings },
      { href: '/admin/languages', label: 'اللغات', icon: Globe },
      { href: '/admin/translations', label: 'الترجمات', icon: Languages },
    ]
  },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['المحتوى', 'الإعدادات']);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`admin-sidebar flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ background: 'var(--color-surface)', borderInlineEnd: '1px solid rgba(0,0,0,0.08)' }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
              CMS
            </div>
            <span className="font-heading font-bold text-sm" style={{ color: 'var(--color-text)' }}>المحتوى</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ color: 'var(--color-text)' }}>
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.label);
            return (
              <div key={item.label}>
                {!collapsed && (
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{ color: 'var(--color-text)' }}>
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 opacity-60" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronLeft className={`w-4 h-4 opacity-60 transition-transform ${isOpen ? '-rotate-90' : ''}`} />
                  </button>
                )}
                {(isOpen || collapsed) && (
                  <div className={`${!collapsed ? 'ms-3 ps-3 border-s border-gray-200 dark:border-gray-700' : ''} space-y-1 mt-1`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive(child.href) ? 'text-white shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        style={isActive(child.href)
                          ? { background: 'var(--color-primary)', color: '#fff' }
                          : { color: 'var(--color-text)' }}
                        title={collapsed ? child.label : undefined}
                      >
                        <child.icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>{child.label}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive(item.href!, item.exact) ? 'text-white shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              style={isActive(item.href!, item.exact)
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { color: 'var(--color-text)' }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick links */}
      <div className="px-3 pb-2 space-y-1 border-t pt-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: 'var(--color-text)' }}
          title={collapsed ? 'عرض الموقع' : undefined}>
          <Globe className="w-4 h-4 flex-shrink-0 opacity-60" />
          {!collapsed && <span className="opacity-70 text-xs">عرض الموقع</span>}
        </a>
      </div>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}>
                {user?.name?.charAt(0) || 'م'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
                <p className="text-xs opacity-60 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="خروج">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full p-2 flex justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="خروج">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
