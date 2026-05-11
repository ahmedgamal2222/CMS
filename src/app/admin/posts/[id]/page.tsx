'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { postsApi, taxonomyApi } from '@/lib/api';
import { toast } from 'sonner';
import { RichEditor } from '@/components/admin/RichEditor';
import { Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PostEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '', featured_image: '',
    meta_title: '', meta_description: '', meta_keywords: '',
    status: 'draft', category_id: '', tags: [] as string[],
  });

  useEffect(() => {
    taxonomyApi.listCategories().then(({ data }) => setCategories(data.categories));
    taxonomyApi.listTags().then(({ data }) => setTags(data.tags));
    if (!isNew) {
      postsApi.get(params.id).then(({ data }) => {
        const p = data.post;
        setForm({
          title: p.title, slug: p.slug, content: p.content || '', excerpt: p.excerpt || '',
          featured_image: p.featured_image || '', meta_title: p.meta_title || '',
          meta_description: p.meta_description || '', meta_keywords: p.meta_keywords || '',
          status: p.status, category_id: p.category_id || '',
          tags: (p.tags || []).map((t: any) => t.id),
        });
        setLoading(false);
      });
    }
  }, [params.id]);

  const updateSlug = (title: string) => {
    if (isNew) {
      const slug = title.toLowerCase()
        .replace(/[\u0600-\u06FF ]+/g, '-')
        .replace(/[^\w-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setForm(p => ({ ...p, slug }));
    }
  };

  const save = async (status?: string) => {
    if (!form.title) { toast.error('العنوان مطلوب'); return; }
    setSaving(true);
    try {
      const payload = { ...form, status: status || form.status };
      if (isNew) {
        const { data } = await postsApi.create(payload);
        toast.success('تم إنشاء المقال');
        router.replace(`/admin/posts/${data.post.id}`);
      } else {
        await postsApi.update(params.id, payload);
        toast.success('تم حفظ المقال');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (id: string) => {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(id) ? p.tags.filter(t => t !== id) : [...p.tags, id]
    }));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--color-text)' }}>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
            {isNew ? 'مقال جديد' : 'تعديل المقال'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save('draft')} disabled={saving}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
            style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>
            حفظ كمسودة
          </button>
          <button onClick={() => save('published')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}>
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'نشر المقال'}
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-wrap lg:flex-nowrap">
        <div className="flex-1 space-y-4">
          <div className="cms-card space-y-4">
            <input type="text" placeholder="عنوان المقال..."
              value={form.title}
              onChange={(e) => { setForm(p => ({ ...p, title: e.target.value })); updateSlug(e.target.value); }}
              className="w-full text-2xl font-heading font-bold border-0 border-b pb-3 outline-none bg-transparent"
              style={{ borderColor: 'rgba(0,0,0,0.1)', color: 'var(--color-text)' }} />
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>الرابط:</span>
              <input type="text" value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))}
                className="flex-1 border-b outline-none bg-transparent text-sm font-mono"
                style={{ borderColor: 'rgba(0,0,0,0.1)', color: 'var(--color-text)' }} />
            </div>
          </div>

          <div className="cms-card">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>محتوى المقال</label>
            <RichEditor value={form.content} onChange={(v) => setForm(p => ({ ...p, content: v }))} />
          </div>

          <div className="cms-card">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>المقتطف</label>
            <textarea value={form.excerpt} onChange={(e) => setForm(p => ({ ...p, excerpt: e.target.value }))}
              rows={3} placeholder="ملخص قصير للمقال..."
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
          </div>
        </div>

        <div className="w-full lg:w-72 space-y-4">
          <div className="cms-card space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>الإعدادات</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="scheduled">مجدول</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">التصنيف</label>
              <select value={form.category_id} onChange={(e) => setForm(p => ({ ...p, category_id: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="">اختر تصنيفاً</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="cms-card space-y-2">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>الوسوم</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${form.tags.includes(tag.id) ? 'text-white border-transparent' : 'hover:border-gray-400'}`}
                    style={form.tags.includes(tag.id) ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : { borderColor: 'rgba(0,0,0,0.2)', color: 'var(--color-text)' }}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="cms-card space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>الصورة المميزة</h3>
            <input type="url" placeholder="رابط الصورة..." value={form.featured_image}
              onChange={(e) => setForm(p => ({ ...p, featured_image: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            {form.featured_image && (
              <img src={form.featured_image} alt="" className="w-full rounded-lg object-cover h-32" />
            )}
          </div>

          <div className="cms-card space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>SEO</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">عنوان SEO</label>
              <input type="text" value={form.meta_title} onChange={(e) => setForm(p => ({ ...p, meta_title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">وصف SEO</label>
              <textarea value={form.meta_description} onChange={(e) => setForm(p => ({ ...p, meta_description: e.target.value }))}
                rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
