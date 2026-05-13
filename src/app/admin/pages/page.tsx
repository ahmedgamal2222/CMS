'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await pagesApi.list({ search, status });
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status]);

  const del = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return;
    await pagesApi.delete(id);
    toast.success('تم حذف الصفحة');
    load();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, [string, string]> = {
      published: ['منشورة', 'badge-published'],
      draft: ['مسودة', 'badge-draft'],
      archived: ['مؤرشفة', 'badge-archived'],
    };
    const [label, cls] = map[s] || [s, ''];
    return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
          الصفحات <span className="text-gray-400 text-base font-normal">({total})</span>
        </h1>
        <Link href="/admin/pages/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" /> صفحة جديدة
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="ابحث في الصفحات..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          <option value="">كل الحالات</option>
          <option value="published">منشورة</option>
          <option value="draft">مسودة</option>
          <option value="archived">مؤرشفة</option>
        </select>
      </div>

      {/* Table */}
      <div className="cms-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لا توجد صفحات بعد</p>
            <Link href="/admin/pages/new" className="mt-3 inline-block text-sm" style={{ color: 'var(--color-primary)' }}>
              أنشئ أول صفحة
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'var(--color-surface)' }}>
              <tr className="text-sm text-gray-500 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <th className="px-4 py-3 text-start font-medium">العنوان</th>
                <th className="px-4 py-3 text-start font-medium">الرابط</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">الكاتب</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, i) => (
                <tr key={page.id} className={`border-b text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${i === pages.length - 1 ? 'border-0' : ''}`}
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{page.title}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{page.slug === 'home' ? '/' : `/pages/${page.slug}`}</td>
                  <td className="px-4 py-3">{statusBadge(page.status)}</td>
                  <td className="px-4 py-3 text-gray-500">{page.author_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(page.created_at).toLocaleDateString('ar')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/pages/${page.id}`}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors" title="تعديل">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={page.slug === 'home' ? '/' : `/pages/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-green-50 text-green-500 transition-colors" title="عرض الصفحة">
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => del(page.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors" title="حذف">
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
