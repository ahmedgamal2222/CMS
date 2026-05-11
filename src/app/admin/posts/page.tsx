'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsApi, taxonomyApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    taxonomyApi.listCategories().then(({ data }) => setCategories(data.categories));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await postsApi.list({ search, status, category_id: category });
      setPosts(data.posts);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, category]);

  const del = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    await postsApi.delete(id);
    toast.success('تم حذف المقال');
    load();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, [string, string]> = {
      published: ['منشور', 'badge-published'],
      draft: ['مسودة', 'badge-draft'],
      archived: ['مؤرشف', 'badge-archived'],
      scheduled: ['مجدول', 'badge-scheduled'],
    };
    const [label, cls] = map[s] || [s, ''];
    return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
          المقالات <span className="text-gray-400 text-base font-normal">({total})</span>
        </h1>
        <Link href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" /> مقال جديد
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="ابحث في المقالات..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          <option value="">كل الحالات</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
          <option value="scheduled">مجدول</option>
          <option value="archived">مؤرشف</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          <option value="">كل التصنيفات</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="cms-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لا توجد مقالات بعد</p>
            <Link href="/admin/posts/new" className="mt-3 inline-block text-sm" style={{ color: 'var(--color-primary)' }}>
              أنشئ أول مقال
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'var(--color-surface)' }}>
              <tr className="text-sm text-gray-500 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <th className="px-4 py-3 text-start font-medium">العنوان</th>
                <th className="px-4 py-3 text-start font-medium">التصنيف</th>
                <th className="px-4 py-3 text-start font-medium">الكاتب</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">المشاهدات</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} className={`border-b text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${i === posts.length - 1 ? 'border-0' : ''}`}
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>{post.title}</div>
                    {post.excerpt && <div className="text-xs text-gray-400 truncate max-w-48">{post.excerpt}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {post.category_name ? (
                      <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--color-secondary)' }}>
                        {post.category_name}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{post.author_name}</td>
                  <td className="px-4 py-3">{statusBadge(post.status)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{post.views || 0}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(post.created_at).toLocaleDateString('ar')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/posts/${post.id}`}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => del(post.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
