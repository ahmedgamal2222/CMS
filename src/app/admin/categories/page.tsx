'use client';
import { useState, useEffect } from 'react';
import { taxonomyApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Tag, FolderOpen } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#6366f1', parent_id: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await taxonomyApi.listCategories();
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-\u0600-\u06ff]/g, '');

  const submit = async () => {
    if (!form.name) { toast.error('الاسم مطلوب'); return; }
    const payload = { ...form, parent_id: form.parent_id || null };
    try {
      if (editing) {
        await taxonomyApi.updateCategory(editing.id, payload);
        toast.success('تم تحديث التصنيف');
      } else {
        await taxonomyApi.createCategory({ ...payload, slug: payload.slug || autoSlug(form.name) });
        toast.success('تم إضافة التصنيف');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', slug: '', description: '', color: '#6366f1', parent_id: '' });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل العملية');
    }
  };

  const del = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      await taxonomyApi.deleteCategory(id);
      toast.success('تم حذف التصنيف');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحذف');
    }
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color || '#6366f1', parent_id: cat.parent_id || '' });
    setShowForm(true);
  };

  const topLevel = categories.filter(c => !c.parent_id);
  const getChildren = (id: string) => categories.filter(c => c.parent_id === id);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
          التصنيفات <span className="text-gray-400 text-base font-normal">({categories.length})</span>
        </h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', color: '#6366f1', parent_id: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
          style={{ background: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" /> تصنيف جديد
        </button>
      </div>

      {showForm && (
        <div className="cms-card space-y-4">
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{editing ? 'تعديل التصنيف' : 'تصنيف جديد'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">الاسم</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value, slug: p.slug || autoSlug(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الرابط (slug)</label>
              <input type="text" value={form.slug}
                onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">التصنيف الأب</label>
              <select value={form.parent_id} onChange={(e) => setForm(p => ({ ...p, parent_id: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="">— بدون أب —</option>
                {categories.filter(c => !editing || c.id !== editing.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">اللون</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color}
                  onChange={(e) => setForm(p => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 cursor-pointer rounded border" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
                <span className="text-sm text-gray-500">{form.color}</span>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">الوصف</label>
              <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'var(--color-primary)' }}>
              {editing ? 'حفظ التغييرات' : 'إضافة التصنيف'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="cms-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لا توجد تصنيفات</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'var(--color-surface)' }}>
              <tr className="text-sm text-gray-500 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <th className="px-4 py-3 text-start font-medium">التصنيف</th>
                <th className="px-4 py-3 text-start font-medium">الرابط</th>
                <th className="px-4 py-3 text-start font-medium">الأب</th>
                <th className="px-4 py-3 text-start font-medium">التصنيفات الفرعية</th>
                <th className="px-4 py-3 text-start font-medium">المقالات</th>
                <th className="px-4 py-3 text-start font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} className={`border-b text-sm hover:bg-gray-50 ${i === categories.length - 1 ? 'border-0' : ''}`}
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color || '#6366f1' }} />
                      {cat.parent_id && <span className="text-gray-300 text-xs ms-2">└</span>}
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs" dir="ltr">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name || '—' : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{getChildren(cat.id).length}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{cat.post_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(cat.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors">
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
