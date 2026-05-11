'use client';
import { useState, useEffect } from 'react';
import { taxonomyApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, X, Hash } from 'lucide-react';

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await taxonomyApi.listTags();
      setTags(data.tags);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const name = input.trim();
    if (!name) return;
    try {
      await taxonomyApi.createTag({ name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-\u0600-\u06ff]/g, '') });
      toast.success('تمت إضافة الوسم');
      setInput('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الإضافة');
    }
  };

  const saveEdit = async (id: string) => {
    try {
      await taxonomyApi.updateTag(id, { name: editName, slug: editName.toLowerCase().replace(/\s+/g, '-') });
      toast.success('تم التحديث');
      setEditingId(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل التحديث');
    }
  };

  const del = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الوسم؟')) return;
    try {
      await taxonomyApi.deleteTag(id);
      toast.success('تم الحذف');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
        الوسوم <span className="text-gray-400 text-base font-normal">({tags.length})</span>
      </h1>

      {/* Add form */}
      <div className="cms-card">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>إضافة وسم جديد</p>
        <div className="flex gap-2 max-w-sm">
          <input type="text" placeholder="اسم الوسم..." value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
          <button onClick={add}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-1"
            style={{ background: 'var(--color-primary)' }}>
            <Plus className="w-4 h-4" /> إضافة
          </button>
        </div>
      </div>

      {/* Tags grid */}
      {loading ? (
        <div className="cms-card p-8 text-center text-gray-400">جاري التحميل...</div>
      ) : tags.length === 0 ? (
        <div className="cms-card p-12 text-center">
          <Hash className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">لا توجد وسوم</p>
        </div>
      ) : (
        <div className="cms-card">
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm border group"
                style={{ borderColor: 'rgba(0,0,0,0.15)', background: 'var(--color-surface)' }}>
                {editingId === tag.id ? (
                  <>
                    <input type="text" value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(tag.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="bg-transparent outline-none text-sm w-24"
                      autoFocus />
                    <button onClick={() => saveEdit(tag.id)} className="text-green-500 hover:text-green-600 text-xs">✓</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  </>
                ) : (
                  <>
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span style={{ color: 'var(--color-text)' }}>{tag.name}</span>
                    {tag.post_count > 0 && (
                      <span className="text-xs text-gray-400 ms-1">({tag.post_count})</span>
                    )}
                    <button onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                      className="opacity-0 group-hover:opacity-100 ms-1 text-blue-400 hover:text-blue-600 transition-opacity text-xs">✏</button>
                    <button onClick={() => del(tag.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
