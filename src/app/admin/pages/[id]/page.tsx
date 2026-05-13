'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { pagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { RichEditor } from '@/components/admin/RichEditor';
import { SectionsBuilder } from '@/components/admin/SectionsBuilder';
import { Save, Eye, ArrowRight, LayoutGrid, FileText, ExternalLink, Copy } from 'lucide-react';
import Link from 'next/link';

export default function PageEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'sections'>('content');
  const [form, setForm] = useState({
    title: '', slug: '', content: '', meta_title: '', meta_description: '',
    meta_keywords: '', status: 'draft', template: 'default', featured_image: '',
    order_index: 0,
  });

  useEffect(() => {
    if (!isNew) {
      pagesApi.get(params.id).then(({ data }) => {
        setForm({ ...data.page });
        setLoading(false);
      });
    }
  }, [params.id]);

  const updateSlug = (title: string) => {
    if (isNew) {
      const slug = title.toLowerCase()
        .replace(/[\u0600-\u06FF ]+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(p => ({ ...p, slug }));
    }
  };

  const save = async (status?: string) => {
    if (!form.title) { toast.error('العنوان مطلوب'); return; }
    setSaving(true);
    try {
      const payload = { ...form, status: status || form.status };
      if (isNew) {
        const { data } = await pagesApi.create(payload);
        toast.success('تم إنشاء الصفحة');
        router.replace(`/admin/pages/${data.page.id}`);
      } else {
        await pagesApi.update(params.id, payload);
        toast.success('تم حفظ الصفحة');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--color-text)' }}>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
            {isNew ? 'صفحة جديدة' : 'تعديل الصفحة'}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNew && form.slug && (
            <a
              href={form.slug === 'home' ? '/' : `/pages/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>
              <Eye className="w-4 h-4" />
              عرض الصفحة
            </a>
          )}
          <button onClick={() => save('draft')} disabled={saving}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>
            حفظ كمسودة
          </button>
          <button onClick={() => save('published')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'var(--color-primary)' }}>
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'نشر الصفحة'}
          </button>
        </div>
      </div>

      {/* Tabs (only when editing existing page) */}
      {!isNew && (
        <div className="flex gap-1 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'content' ? 'border-current' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            style={activeTab === 'content' ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}>
            <FileText className="w-4 h-4" />
            المحتوى
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'sections' ? 'border-current' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            style={activeTab === 'sections' ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}>
            <LayoutGrid className="w-4 h-4" />
            الأقسام / Sections
          </button>
        </div>
      )}

      {/* Sections builder tab */}
      {!isNew && activeTab === 'sections' && (
        <div>
          <SectionsBuilder pageId={params.id} />
        </div>
      )}

      {/* Content tab */}
      {(isNew || activeTab === 'content') && (
      <div className="flex gap-5 flex-wrap lg:flex-nowrap">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          <div className="cms-card space-y-4">
            <input
              type="text"
              placeholder="عنوان الصفحة..."
              value={form.title}
              onChange={(e) => { setForm(p => ({ ...p, title: e.target.value })); updateSlug(e.target.value); }}
              className="w-full text-2xl font-heading font-bold border-0 border-b pb-3 outline-none bg-transparent"
              style={{ borderColor: 'rgba(0,0,0,0.1)', color: 'var(--color-text)' }}
            />
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>الرابط:</span>
              <input type="text" value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))}
                className="flex-1 border-b outline-none bg-transparent text-sm font-mono"
                style={{ borderColor: 'rgba(0,0,0,0.1)', color: 'var(--color-text)' }} />
            </div>
            {/* Public URL display */}
            {!isNew && form.slug && (
              <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                style={{ background: 'rgba(99,102,241,0.06)', color: 'var(--color-primary)' }}>
                <span className="opacity-60">الرابط العام:</span>
                <span className="font-mono font-medium flex-1 truncate" dir="ltr">
                  {form.slug === 'home' ? '/' : `/pages/${form.slug}`}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    title="نسخ الرابط"
                    onClick={() => {
                      const url = form.slug === 'home' ? window.location.origin : `${window.location.origin}/pages/${form.slug}`;
                      navigator.clipboard.writeText(url);
                      toast.success('تم نسخ الرابط');
                    }}
                    className="p-1 rounded hover:opacity-70 transition-opacity">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={form.slug === 'home' ? '/' : `/pages/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="فتح الصفحة"
                    className="p-1 rounded hover:opacity-70 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="cms-card">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>المحتوى</label>
            <RichEditor value={form.content} onChange={(v) => setForm(p => ({ ...p, content: v }))} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Status */}
          <div className="cms-card space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>الإعدادات</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="draft">مسودة</option>
                <option value="published">منشورة</option>
                <option value="archived">مؤرشفة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">القالب</label>
              <select value={form.template} onChange={(e) => setForm(p => ({ ...p, template: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="default">افتراضي</option>
                <option value="full-width">عرض كامل</option>
                <option value="landing">صفحة هبوط</option>
                <option value="contact">تواصل معنا</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الترتيب</label>
              <input type="number" value={form.order_index}
                onChange={(e) => setForm(p => ({ ...p, order_index: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          {/* Featured Image */}
          <div className="cms-card space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>الصورة المميزة</h3>
            {form.featured_image ? (
              <div className="space-y-2">
                <img src={form.featured_image} alt="" className="w-full rounded-lg object-cover h-32" />
                <button onClick={() => setForm(p => ({ ...p, featured_image: '' }))}
                  className="text-xs text-red-500 hover:underline">إزالة الصورة</button>
              </div>
            ) : (
              <input type="url" placeholder="رابط الصورة..."
                value={form.featured_image}
                onChange={(e) => setForm(p => ({ ...p, featured_image: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            )}
          </div>

          {/* SEO */}
          <div className="cms-card space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>SEO</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">عنوان SEO</label>
              <input type="text" value={form.meta_title}
                onChange={(e) => setForm(p => ({ ...p, meta_title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">وصف SEO</label>
              <textarea value={form.meta_description}
                onChange={(e) => setForm(p => ({ ...p, meta_description: e.target.value }))}
                rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الكلمات المفتاحية</label>
              <input type="text" value={form.meta_keywords}
                onChange={(e) => setForm(p => ({ ...p, meta_keywords: e.target.value }))}
                placeholder="كلمة1, كلمة2, ..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
