'use client';
import { useState, useEffect } from 'react';
import { sectionsApi, mediaApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Edit2, Eye, EyeOff,
  Image as ImageIcon, Type, Star, Users, Phone, LayoutGrid,
  MessageSquare, Award, TrendingUp, Sliders, X, Check, GripVertical
} from 'lucide-react';

export type SectionType =
  | 'hero' | 'slider' | 'features' | 'about' | 'services'
  | 'testimonials' | 'gallery' | 'contact' | 'cta' | 'stats' | 'custom';

interface Section {
  id: string;
  page_id: string;
  type: SectionType;
  title: string | null;
  content: any;
  settings: any;
  order_index: number;
  is_active: number;
}

interface Props {
  pageId: string;
}

const SECTION_TYPES: { type: SectionType; label: string; icon: any; description: string; color: string }[] = [
  { type: 'hero',         label: 'Hero / رئيسي',          icon: ImageIcon,    description: 'قسم رئيسي مع صورة وعنوان وأزرار',        color: '#6366f1' },
  { type: 'slider',       label: 'Slider / سلايدر',        icon: Sliders,      description: 'شرائح متعددة مع صور وعناوين',             color: '#8b5cf6' },
  { type: 'features',     label: 'Features / مميزات',      icon: Star,         description: 'عرض مميزات أو خدمات بشبكة',               color: '#f59e0b' },
  { type: 'about',        label: 'About / من نحن',         icon: Users,        description: 'قسم التعريف بالشركة أو الفريق',            color: '#10b981' },
  { type: 'services',     label: 'Services / خدمات',       icon: LayoutGrid,   description: 'عرض قائمة الخدمات',                        color: '#3b82f6' },
  { type: 'testimonials', label: 'Testimonials / آراء',    icon: MessageSquare,description: 'آراء وتقييمات العملاء',                     color: '#ec4899' },
  { type: 'gallery',      label: 'Gallery / معرض',         icon: ImageIcon,    description: 'معرض صور',                                  color: '#14b8a6' },
  { type: 'stats',        label: 'Stats / إحصائيات',       icon: TrendingUp,   description: 'أرقام وإحصائيات مميزة',                    color: '#f97316' },
  { type: 'cta',          label: 'CTA / دعوة للعمل',       icon: Award,        description: 'قسم دعوة للعمل مع زر',                     color: '#a855f7' },
  { type: 'contact',      label: 'Contact / تواصل',        icon: Phone,        description: 'نموذج التواصل ومعلومات الاتصال',            color: '#ef4444' },
  { type: 'custom',       label: 'Custom / مخصص',          icon: Type,         description: 'قسم HTML/نص مخصص',                         color: '#6b7280' },
];

// ─── Default content for each section type ───────────────────────────────────
function defaultContent(type: SectionType): any {
  switch (type) {
    case 'hero':
      return { title: 'عنوان الصفحة الرئيسية', subtitle: 'الوصف الفرعي', description: 'نص تفصيلي يصف المحتوى', image: '', button_text: 'اعرف أكثر', button_url: '#', button2_text: '', button2_url: '', layout: 'center', overlay: 'rgba(0,0,0,0.45)' };
    case 'slider':
      return {
        autoplay: true, interval: 5000, show_arrows: true, show_dots: true,
        slides: [
          { title: 'الشريحة الأولى', subtitle: 'وصف فرعي', description: '', image: '', button_text: 'اعرف أكثر', button_url: '#', overlay: 'rgba(0,0,0,0.4)' },
        ]
      };
    case 'features':
      return {
        title: 'مميزاتنا', subtitle: 'لماذا تختارنا؟', columns: 3,
        items: [
          { icon: 'star', title: 'ميزة أولى', description: 'وصف الميزة الأولى' },
          { icon: 'shield', title: 'ميزة ثانية', description: 'وصف الميزة الثانية' },
          { icon: 'zap', title: 'ميزة ثالثة', description: 'وصف الميزة الثالثة' },
        ]
      };
    case 'about':
      return { title: 'من نحن', subtitle: 'تعرف علينا', content: 'نص التعريف بالشركة أو المنظمة...', image: '', button_text: 'اعرف أكثر', button_url: '#', layout: 'image-right' };
    case 'services':
      return {
        title: 'خدماتنا', subtitle: 'ما نقدمه لك', columns: 3,
        items: [
          { icon: 'briefcase', title: 'خدمة أولى', description: 'وصف الخدمة الأولى', url: '#' },
          { icon: 'globe', title: 'خدمة ثانية', description: 'وصف الخدمة الثانية', url: '#' },
          { icon: 'bar-chart', title: 'خدمة ثالثة', description: 'وصف الخدمة الثالثة', url: '#' },
        ]
      };
    case 'testimonials':
      return {
        title: 'آراء عملائنا', subtitle: 'ماذا يقول عملاؤنا عنا؟',
        items: [
          { name: 'أحمد محمد', role: 'مدير تنفيذي', avatar: '', text: 'خدمة رائعة وفريق محترف، نتائج مذهلة!' },
          { name: 'سارة أحمد', role: 'مصممة جرافيك', avatar: '', text: 'تجربة ممتازة وتعامل راقي، أنصح بالتعامل معهم.' },
        ]
      };
    case 'gallery':
      return { title: 'معرض الصور', subtitle: 'أعمالنا', columns: 3, images: [] };
    case 'stats':
      return {
        title: 'أرقامنا تتحدث', subtitle: '',
        items: [
          { value: '500+', label: 'عميل راضٍ', icon: 'users' },
          { value: '10+', label: 'سنوات خبرة', icon: 'calendar' },
          { value: '1000+', label: 'مشروع منجز', icon: 'check-circle' },
          { value: '24/7', label: 'دعم فني', icon: 'headphones' },
        ]
      };
    case 'cta':
      return { title: 'هل أنت مستعد للبدء؟', subtitle: 'تواصل معنا اليوم واحصل على استشارة مجانية', button_text: 'تواصل الآن', button_url: '#contact', button2_text: 'اعرف أكثر', button2_url: '#about', background: 'primary' };
    case 'contact':
      return { title: 'تواصل معنا', subtitle: 'نحن هنا لمساعدتك', show_form: true, address: '', phone: '', email: '', map_embed: '' };
    case 'custom':
      return { html: '<p>أضف محتواك المخصص هنا...</p>' };
    default:
      return {};
  }
}

// ─── Section Editor Forms ─────────────────────────────────────────────────────
function SliderEditor({ content, onChange }: { content: any; onChange: (v: any) => void }) {
  const slides = content.slides || [];

  const updateSlide = (i: number, field: string, value: string) => {
    const updated = slides.map((s: any, idx: number) => idx === i ? { ...s, [field]: value } : s);
    onChange({ ...content, slides: updated });
  };

  const addSlide = () => {
    onChange({
      ...content,
      slides: [...slides, { title: 'شريحة جديدة', subtitle: '', description: '', image: '', button_text: '', button_url: '#', overlay: 'rgba(0,0,0,0.4)' }]
    });
  };

  const removeSlide = (i: number) => {
    onChange({ ...content, slides: slides.filter((_: any, idx: number) => idx !== i) });
  };

  const moveSlide = (i: number, dir: -1 | 1) => {
    const arr = [...slides];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange({ ...content, slides: arr });
  };

  return (
    <div className="space-y-4">
      {/* Global settings */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={content.autoplay ?? true} onChange={e => onChange({ ...content, autoplay: e.target.checked })} />
          تشغيل تلقائي
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={content.show_arrows ?? true} onChange={e => onChange({ ...content, show_arrows: e.target.checked })} />
          أسهم التنقل
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={content.show_dots ?? true} onChange={e => onChange({ ...content, show_dots: e.target.checked })} />
          نقاط التنقل
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm">المدة (ms):</label>
          <input type="number" value={content.interval ?? 5000} min={1000} step={500}
            onChange={e => onChange({ ...content, interval: Number(e.target.value) })}
            className="w-24 px-2 py-1 border rounded text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
        </div>
      </div>

      {/* Slides */}
      {slides.map((slide: any, i: number) => (
        <div key={i} className="border rounded-xl p-4 space-y-3" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">شريحة {i + 1}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => removeSlide(i)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <FieldInput label="العنوان" value={slide.title} onChange={v => updateSlide(i, 'title', v)} />
          <FieldInput label="العنوان الفرعي" value={slide.subtitle} onChange={v => updateSlide(i, 'subtitle', v)} />
          <FieldInput label="الوصف" value={slide.description} onChange={v => updateSlide(i, 'description', v)} />
          <FieldInput label="رابط الصورة" value={slide.image} onChange={v => updateSlide(i, 'image', v)} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="نص الزر" value={slide.button_text} onChange={v => updateSlide(i, 'button_text', v)} />
            <FieldInput label="رابط الزر" value={slide.button_url} onChange={v => updateSlide(i, 'button_url', v)} />
          </div>
          {slide.image && (
            <img src={slide.image} alt="" className="w-full h-32 object-cover rounded-lg mt-1" onError={e => (e.currentTarget.style.display = 'none')} />
          )}
        </div>
      ))}

      <button onClick={addSlide}
        className="w-full py-2.5 border-2 border-dashed rounded-xl text-sm flex items-center justify-center gap-2 hover:border-primary transition-colors"
        style={{ borderColor: 'rgba(99,102,241,0.4)', color: 'var(--color-primary)' }}>
        <Plus className="w-4 h-4" /> إضافة شريحة
      </button>
    </div>
  );
}

function HeroEditor({ content, onChange }: { content: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <FieldInput label="العنوان" value={content.title} onChange={v => onChange({ ...content, title: v })} />
      <FieldInput label="العنوان الفرعي" value={content.subtitle} onChange={v => onChange({ ...content, subtitle: v })} />
      <FieldInput label="الوصف" value={content.description} onChange={v => onChange({ ...content, description: v })} textarea />
      <FieldInput label="رابط الصورة" value={content.image} onChange={v => onChange({ ...content, image: v })} placeholder="https://..." />
      {content.image && <img src={content.image} alt="" className="w-full h-32 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = 'none')} />}
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="نص الزر الأول" value={content.button_text} onChange={v => onChange({ ...content, button_text: v })} />
        <FieldInput label="رابط الزر الأول" value={content.button_url} onChange={v => onChange({ ...content, button_url: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="نص الزر الثاني" value={content.button2_text} onChange={v => onChange({ ...content, button2_text: v })} />
        <FieldInput label="رابط الزر الثاني" value={content.button2_url} onChange={v => onChange({ ...content, button2_url: v })} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">محاذاة المحتوى</label>
        <select value={content.layout || 'center'} onChange={e => onChange({ ...content, layout: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
          <option value="right">يمين</option>
        </select>
      </div>
    </div>
  );
}

function FeaturesEditor({ content, onChange }: { content: any; onChange: (v: any) => void }) {
  const items = content.items || [];
  const updateItem = (i: number, field: string, v: string) =>
    onChange({ ...content, items: items.map((x: any, idx: number) => idx === i ? { ...x, [field]: v } : x) });
  const addItem = () => onChange({ ...content, items: [...items, { icon: 'star', title: 'ميزة جديدة', description: '' }] });
  const removeItem = (i: number) => onChange({ ...content, items: items.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="العنوان" value={content.title} onChange={v => onChange({ ...content, title: v })} />
        <FieldInput label="الوصف الفرعي" value={content.subtitle} onChange={v => onChange({ ...content, subtitle: v })} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">عدد الأعمدة</label>
        <select value={content.columns || 3} onChange={e => onChange({ ...content, columns: Number(e.target.value) })}
          className="w-32 px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
        </select>
      </div>
      <div className="space-y-2">
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-3 space-y-2" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">بند {i + 1}</span>
              <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldInput label="العنوان" value={item.title} onChange={v => updateItem(i, 'title', v)} />
              <FieldInput label="الأيقونة" value={item.icon} onChange={v => updateItem(i, 'icon', v)} placeholder="star, shield, zap..." />
            </div>
            <FieldInput label="الوصف" value={item.description} onChange={v => updateItem(i, 'description', v)} textarea />
          </div>
        ))}
      </div>
      <button onClick={addItem}
        className="w-full py-2 border-2 border-dashed rounded-lg text-sm flex items-center justify-center gap-1 hover:border-primary transition-colors"
        style={{ borderColor: 'rgba(99,102,241,0.4)', color: 'var(--color-primary)' }}>
        <Plus className="w-4 h-4" /> إضافة بند
      </button>
    </div>
  );
}

function TestimonialsEditor({ content, onChange }: { content: any; onChange: (v: any) => void }) {
  const items = content.items || [];
  const updateItem = (i: number, field: string, v: string) =>
    onChange({ ...content, items: items.map((x: any, idx: number) => idx === i ? { ...x, [field]: v } : x) });
  const addItem = () => onChange({ ...content, items: [...items, { name: 'اسم العميل', role: 'المسمى الوظيفي', avatar: '', text: 'نص الشهادة...' }] });
  const removeItem = (i: number) => onChange({ ...content, items: items.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="العنوان" value={content.title} onChange={v => onChange({ ...content, title: v })} />
        <FieldInput label="الوصف الفرعي" value={content.subtitle} onChange={v => onChange({ ...content, subtitle: v })} />
      </div>
      {items.map((item: any, i: number) => (
        <div key={i} className="border rounded-lg p-3 space-y-2" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">شهادة {i + 1}</span>
            <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FieldInput label="الاسم" value={item.name} onChange={v => updateItem(i, 'name', v)} />
            <FieldInput label="المسمى" value={item.role} onChange={v => updateItem(i, 'role', v)} />
          </div>
          <FieldInput label="الصورة (رابط)" value={item.avatar} onChange={v => updateItem(i, 'avatar', v)} placeholder="https://..." />
          <FieldInput label="نص الشهادة" value={item.text} onChange={v => updateItem(i, 'text', v)} textarea />
        </div>
      ))}
      <button onClick={addItem}
        className="w-full py-2 border-2 border-dashed rounded-lg text-sm flex items-center justify-center gap-1"
        style={{ borderColor: 'rgba(99,102,241,0.4)', color: 'var(--color-primary)' }}>
        <Plus className="w-4 h-4" /> إضافة شهادة
      </button>
    </div>
  );
}

function GenericEditor({ content, onChange, type }: { content: any; onChange: (v: any) => void; type: SectionType }) {
  if (type === 'slider') return <SliderEditor content={content} onChange={onChange} />;
  if (type === 'hero') return <HeroEditor content={content} onChange={onChange} />;
  if (type === 'features' || type === 'services') return <FeaturesEditor content={content} onChange={onChange} />;
  if (type === 'testimonials') return <TestimonialsEditor content={content} onChange={onChange} />;

  // Generic key-value editor for remaining types
  return (
    <div className="space-y-3">
      {Object.entries(content || {}).map(([key, val]) => {
        if (typeof val === 'object') return null;
        return (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1">{key}</label>
            {typeof val === 'string' && val.length > 60 ? (
              <textarea value={val as string} onChange={e => onChange({ ...content, [key]: e.target.value })}
                rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            ) : (
              <input type="text" value={String(val)} onChange={e => onChange({ ...content, [key]: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Helper Field Components ──────────────────────────────────────────────────
function FieldInput({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      ) : (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      )}
    </div>
  );
}

// ─── Main SectionsBuilder ─────────────────────────────────────────────────────
export function SectionsBuilder({ pageId }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<any>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await sectionsApi.list(pageId);
      setSections(data.sections.map((s: any) => ({
        ...s,
        content: typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {}),
        settings: typeof s.settings === 'string' ? JSON.parse(s.settings) : (s.settings || {}),
      })));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (pageId) load(); }, [pageId]);

  const addSection = async (type: SectionType) => {
    const content = defaultContent(type);
    const meta = SECTION_TYPES.find(t => t.type === type);
    setSaving('new');
    try {
      const { data } = await sectionsApi.create(pageId, { type, title: meta?.label || type, content });
      setSections(prev => [...prev, {
        ...data.section,
        content: typeof data.section.content === 'string' ? JSON.parse(data.section.content) : (data.section.content || content),
        settings: {},
      }]);
      setShowAddPanel(false);
      toast.success(`تم إضافة سيكشن ${meta?.label}`);
    } catch { toast.error('فشل الإضافة'); }
    finally { setSaving(null); }
  };

  const saveSection = async (section: Section) => {
    setSaving(section.id);
    try {
      await sectionsApi.update(pageId, section.id, { content: editContent });
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, content: editContent } : s));
      setEditingId(null);
      toast.success('تم الحفظ');
    } catch { toast.error('فشل الحفظ'); }
    finally { setSaving(null); }
  };

  const toggleActive = async (section: Section) => {
    const newVal = section.is_active ? 0 : 1;
    try {
      await sectionsApi.update(pageId, section.id, { is_active: newVal });
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_active: newVal } : s));
    } catch { toast.error('فشل التحديث'); }
  };

  const deleteSection = async (section: Section) => {
    if (!confirm('هل أنت متأكد من حذف هذا السيكشن؟')) return;
    try {
      await sectionsApi.delete(pageId, section.id);
      setSections(prev => prev.filter(s => s.id !== section.id));
      toast.success('تم الحذف');
    } catch { toast.error('فشل الحذف'); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const newSections = [...sections];
    const j = index + dir;
    if (j < 0 || j >= newSections.length) return;
    [newSections[index], newSections[j]] = [newSections[j], newSections[index]];
    setSections(newSections);
    try {
      await sectionsApi.reorder(pageId, newSections.map(s => s.id));
    } catch { toast.error('فشل إعادة الترتيب'); load(); }
  };

  const startEdit = (section: Section) => {
    setEditingId(section.id);
    setEditContent(section.content);
  };

  const cancelEdit = () => { setEditingId(null); setEditContent(null); };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  const sectionMeta = (type: SectionType) => SECTION_TYPES.find(t => t.type === type) || SECTION_TYPES[SECTION_TYPES.length - 1];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>أقسام الصفحة</h3>
          <p className="text-xs text-gray-400 mt-0.5">{sections.length} قسم — اسحب لإعادة الترتيب</p>
        </div>
        <button
          onClick={() => setShowAddPanel(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" />
          {showAddPanel ? 'إغلاق' : 'إضافة قسم'}
        </button>
      </div>

      {/* Add panel */}
      {showAddPanel && (
        <div className="cms-card border-2 p-4" style={{ borderColor: 'var(--color-primary)', borderStyle: 'dashed' }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>اختر نوع القسم</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SECTION_TYPES.map(st => (
              <button
                key={st.type}
                onClick={() => addSection(st.type)}
                disabled={saving === 'new'}
                className="flex items-start gap-2.5 p-3 border rounded-xl hover:shadow-sm transition-all text-start"
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: st.color + '20' }}>
                  <st.icon className="w-4 h-4" style={{ color: st.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{st.label}</p>
                  <p className="text-xs text-gray-400 truncate">{st.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sections list */}
      {sections.length === 0 && !showAddPanel ? (
        <div className="cms-card text-center py-12">
          <LayoutGrid className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">لا توجد أقسام بعد</p>
          <button onClick={() => setShowAddPanel(true)}
            className="mt-3 text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
            أضف أول قسم
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => {
            const meta = sectionMeta(section.type);
            const isEditing = editingId === section.id;

            return (
              <div key={section.id}
                className={`cms-card overflow-hidden transition-all ${!section.is_active ? 'opacity-50' : ''}`}>
                {/* Section header */}
                <div className="flex items-center gap-3 p-4">
                  {/* drag handle / order */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <GripVertical className="w-4 h-4 text-gray-300 mx-auto" />
                    <button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: meta.color + '20' }}>
                    <meta.icon className="w-4.5 h-4.5" style={{ color: meta.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {section.title || meta.label}
                    </p>
                    <p className="text-xs text-gray-400">{meta.label}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(section)}
                      title={section.is_active ? 'إخفاء' : 'إظهار'}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      {section.is_active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button onClick={() => isEditing ? cancelEdit() : startEdit(section)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      {isEditing ? <X className="w-4 h-4 text-gray-500" /> : <Edit2 className="w-4 h-4 text-gray-500" />}
                    </button>
                    <button onClick={() => deleteSection(section)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Edit panel */}
                {isEditing && (
                  <div className="border-t p-4 space-y-4" style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'var(--color-surface)' }}>
                    <GenericEditor content={editContent} onChange={setEditContent} type={section.type} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => saveSection(section)} disabled={saving === section.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
                        style={{ background: 'var(--color-primary)' }}>
                        <Check className="w-4 h-4" />
                        {saving === section.id ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                      <button onClick={cancelEdit}
                        className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
