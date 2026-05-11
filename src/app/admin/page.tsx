'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FileText, BookOpen, Image, Users, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ pages: 0, posts: 0, media: 0, users: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats().then(({ data }) => {
      setStats(data.stats);
      setRecentPosts(data.recent_posts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = [
    { title: 'إجمالي الصفحات', value: stats.pages, icon: FileText, color: 'bg-blue-500', href: '/admin/pages' },
    { title: 'إجمالي المقالات', value: stats.posts, icon: BookOpen, color: 'bg-purple-500', href: '/admin/posts' },
    { title: 'إجمالي الوسائط', value: stats.media, icon: Image, color: 'bg-green-500', href: '/admin/media' },
    { title: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'bg-orange-500', href: '/admin/users' },
  ];

  const statusLabel: Record<string, string> = {
    draft: 'مسودة', published: 'منشور', scheduled: 'مجدول', archived: 'مؤرشف'
  };
  const statusClass: Record<string, string> = {
    draft: 'badge-draft', published: 'badge-published', scheduled: 'badge-scheduled', archived: 'badge-archived'
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome */}
      <div className="cms-card" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: '#fff' }}>
        <h1 className="text-2xl font-heading font-bold">مرحباً، {user?.name} 👋</h1>
        <p className="mt-1 opacity-90">لوحة تحكم نظام إدارة المحتوى</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="cms-card hover:shadow-md transition-shadow flex items-center gap-4 no-underline">
            <div className={`${card.color} p-3 rounded-lg text-white`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
                {loading ? '...' : card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="cms-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            أحدث المقالات
          </h2>
          <Link href="/admin/posts" className="text-sm" style={{ color: 'var(--color-primary)' }}>
            عرض الكل
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد مقالات بعد</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3 flex items-center justify-between">
                <Link href={`/admin/posts/${post.id}`} className="font-medium hover:underline" style={{ color: 'var(--color-text)' }}>
                  {post.title}
                </Link>
                <span className={`text-xs px-2 py-1 rounded-full ${statusClass[post.status] || ''}`}>
                  {statusLabel[post.status] || post.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="cms-card">
        <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          إجراءات سريعة
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'صفحة جديدة', href: '/admin/pages/new' },
            { label: 'مقال جديد', href: '/admin/posts/new' },
            { label: 'رفع وسائط', href: '/admin/media' },
            { label: 'مستخدم جديد', href: '/admin/users/new' },
            { label: 'إعدادات المظهر', href: '/admin/settings?tab=theme' },
            { label: 'إدارة الترجمات', href: '/admin/translations' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
