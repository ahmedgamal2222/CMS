'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sectionsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Edit2, Eye, EyeOff,
  Image as ImageIcon, Type, Star, Users, Phone, LayoutGrid,
  MessageSquare, Award, TrendingUp, Sliders, X, Check, GripVertical,
  Sparkles, FolderOpen, Play, Layers
} from 'lucide-react';
import { MediaPicker } from './MediaPicker';
import { TemplateGallery } from './TemplateGallery';
import { SectionsPreview } from './SectionPreview';
import { VideoField } from './VideoField';

export type SectionType =
  | 'hero' | 'slider' | 'features' | 'about' | 'services'
  | 'testimonials' | 'gallery' | 'contact' | 'cta' | 'stats' | 'video' | 'custom';

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
  { type: 'video',        label: 'Video / فيديو',          icon: Play,         description: 'فيديو يوتيوب أو مرفوع من الجهاز',           color: '#ef4444' },
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
    case 'video':
      return { title: 'شاهد الفيديو', subtitle: '', video_url: '', video_type: 'youtube', video_thumbnail: '' };
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
          <ImagePickerField label="صورة الشريحة" value={slide.image} onChange={v => updateSlide(i, 'image', v)} />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="نص الزر" value={slide.button_text} onChange={v => updateSlide(i, 'button_text', v)} />
            <FieldInput label="رابط الزر" value={slide.button_url} onChange={v => updateSlide(i, 'button_url', v)} />
          </div>
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
      <ImagePickerField label="صورة الخلفية" value={content.image} onChange={v => onChange({ ...content, image: v })} />
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
  if (type === 'about') return (
    <div className="space-y-3">
      <FieldInput label="العنوان" value={content.title} onChange={v => onChange({ ...content, title: v })} />
      <FieldInput label="العنوان الفرعي" value={content.subtitle} onChange={v => onChange({ ...content, subtitle: v })} />
      <FieldInput label="المحتوى" value={content.content} onChange={v => onChange({ ...content, content: v })} textarea />
      <ImagePickerField label="الصورة" value={content.image} onChange={v => onChange({ ...content, image: v })} />
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="نص الزر" value={content.button_text} onChange={v => onChange({ ...content, button_text: v })} />
        <FieldInput label="رابط الزر" value={content.button_url} onChange={v => onChange({ ...content, button_url: v })} />
      </div>
    </div>
  );

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

function ImagePickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="https://... أو اختر من المكتبة"
          className="flex-1 px-3 py-2 border rounded-xl text-sm font-mono min-w-0"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
        <button type="button" onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium flex-shrink-0 hover:shadow-sm transition-all"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'rgba(99,102,241,0.05)' }}>
          <FolderOpen className="w-3.5 h-3.5" />
          المكتبة
        </button>
      </div>
      {value && (
        <div className="mt-2 relative rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <img src={value} alt="" className="w-full h-32 object-cover"
            onError={e => (e.currentTarget.style.display = 'none')} />
          <button onClick={() => onChange('')}
            className="absolute top-2 start-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}
      {showPicker && (
        <MediaPicker
          title={`اختر ${label}`}
          onSelect={url => { onChange(url); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ─── Portal wrapper (SSR-safe) ────────────────────────────────────────────────
function ClientPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─── Add Section Modal ────────────────────────────────────────────────────────
function AddSectionModal({ onClose, onAdd, saving }: {
  onClose: () => void;
  onAdd: (type: SectionType) => void;
  saving: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" dir="rtl">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          style={{ background: 'var(--color-surface)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-primary)', opacity: 1 }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>إضافة قسم جديد</h3>
                <p className="text-xs text-gray-400">اختر نوع القسم الذي تريد إضافته للصفحة</p>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {/* Section type grid */}
          <div className="overflow-y-auto p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTION_TYPES.map(st => (
                <button
                  key={st.type}
                  onClick={() => { if (!saving) onAdd(st.type); }}
                  disabled={saving}
                  className="group flex flex-col items-start p-4 border-2 rounded-xl hover:shadow-md transition-all text-start disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'var(--color-surface)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = st.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: st.color + '18' }}>
                    <st.icon className="w-5 h-5" style={{ color: st.color }} />
                  </div>
                  <p className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text)' }}>{st.label}</p>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{st.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}

// ─── Edit Drawer ──────────────────────────────────────────────────────────────
function EditDrawer({ section, content, onChange, onSave, onClose, saving }: {
  section: Section;
  content: any;
  onChange: (v: any) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const meta = SECTION_TYPES.find(t => t.type === section.type) || SECTION_TYPES[SECTION_TYPES.length - 1];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg flex flex-col h-full shadow-2xl"
          style={{ background: 'var(--color-surface)' }}>
          {/* Colored top stripe */}
          <div className="h-1 flex-shrink-0" style={{ background: meta.color }} />
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: meta.color + '18' }}>
              <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                {section.title || meta.label}
              </h3>
              <p className="text-xs text-gray-400">تعديل محتوى القسم</p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5">
            {section.type === 'video' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">عنوان القسم</label>
                  <input type="text" value={(content || {}).title || ''}
                    onChange={e => onChange({ ...(content || {}), title: e.target.value })}
                    placeholder="شاهد الفيديو"
                    className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">وصف فرعي (اختياري)</label>
                  <input type="text" value={(content || {}).subtitle || ''}
                    onChange={e => onChange({ ...(content || {}), subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
                </div>
                <VideoField
                  label="مصدر الفيديو"
                  value={{
                    video_url: (content || {}).video_url || '',
                    video_type: (content || {}).video_type || 'youtube',
                    video_thumbnail: (content || {}).video_thumbnail,
                  }}
                  onChange={v => onChange({ ...(content || {}), ...v })}
                />
              </div>
            ) : (
              <GenericEditor content={content} onChange={onChange} type={section.type} />
            )}
          </div>
          {/* Footer */}
          <div className="flex gap-2 px-5 py-4 border-t flex-shrink-0"
            style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-white font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
              style={{ background: 'var(--color-primary)' }}>
              <Check className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button onClick={onClose}
              className="px-5 py-2.5 border-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'var(--color-text)' }}>
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}

// ─── Main SectionsBuilder ─────────────────────────────────────────────────────
export function SectionsBuilder({ pageId }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editContent, setEditContent] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      const newSection = {
        ...data.section,
        content: typeof data.section.content === 'string' ? JSON.parse(data.section.content) : (data.section.content || content),
        settings: {},
      };
      setSections(prev => [...prev, newSection]);
      setShowAddModal(false);
      toast.success(`تم إضافة "${meta?.label}" بنجاح`);
      // Auto-open edit drawer for the new section
      setEditingSection(newSection);
      setEditContent(newSection.content);
    } catch { toast.error('فشل الإضافة'); }
    finally { setSaving(null); }
  };

  const saveSection = async () => {
    if (!editingSection) return;
    setSaving(editingSection.id);
    try {
      await sectionsApi.update(pageId, editingSection.id, { content: editContent });
      setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, content: editContent } : s));
      setEditingSection(null);
      toast.success('تم حفظ التغييرات');
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
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      await sectionsApi.delete(pageId, section.id);
      setSections(prev => prev.filter(s => s.id !== section.id));
      if (editingSection?.id === section.id) setEditingSection(null);
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
    setEditingSection(section);
    setEditContent(section.content);
  };

  const cancelEdit = () => { setEditingSection(null); setEditContent(null); };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  const sectionMeta = (type: SectionType) => SECTION_TYPES.find(t => t.type === type) || SECTION_TYPES[SECTION_TYPES.length - 1];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Add Section Modal */}
      {showAddModal && (
        <AddSectionModal
          onClose={() => setShowAddModal(false)}
          onAdd={addSection}
          saving={saving === 'new'}
        />
      )}

      {/* Edit Drawer */}
      {editingSection && (
        <EditDrawer
          section={editingSection}
          content={editContent}
          onChange={setEditContent}
          onSave={saveSection}
          onClose={cancelEdit}
          saving={saving === editingSection.id}
        />
      )}

      {/* Template Gallery */}
      {showTemplates && (
        <TemplateGallery
          pageId={pageId}
          existingCount={sections.length}
          onApplied={load}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Live Preview */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col" dir="rtl" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0"
            style={{ background: '#0f172a' }}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Eye className="w-4 h-4" /> معاينة مباشرة — {sections.length} أقسام
            </div>
            <button onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--color-primary)' }}>
              <X className="w-4 h-4" /> إغلاق
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto my-4 rounded-2xl overflow-hidden shadow-2xl"
              style={{ maxWidth: 1100, background: 'var(--color-background, #fff)' }}>
              <SectionsPreview sections={sections} />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>أقسام الصفحة</h3>
          <p className="text-xs text-gray-400 mt-0.5">{sections.length} {sections.length === 1 ? 'قسم' : 'أقسام'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'var(--color-text)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            قوالب جاهزة
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'var(--color-text)' }}>
            <Eye className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            معاينة مباشرة
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            style={{ background: 'var(--color-primary)' }}>
            <Plus className="w-4 h-4" />
            إضافة قسم
          </button>
        </div>
      </div>

      {/* Sections list */}
      {sections.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed text-center py-16 space-y-3"
          style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.08)' }}>
            <LayoutGrid className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>لا توجد أقسام بعد</p>
            <p className="text-sm text-gray-400 mt-1">ابدأ ببناء صفحتك بإضافة أول قسم</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: 'var(--color-primary)' }}>
            <Sparkles className="w-4 h-4" />
            أضف أول قسم
          </button>
          <button onClick={() => setShowTemplates(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 hover:bg-gray-50 transition-colors mr-2"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'var(--color-text)' }}>
            <Layers className="w-4 h-4" />
            أو ابدأ بقالب جاهز
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sections.map((section, idx) => {
            const meta = sectionMeta(section.type);
            const isActive = !!section.is_active;
            const isEditing = editingSection?.id === section.id;

            return (
              <div key={section.id}
                className={`rounded-xl border-2 transition-all ${isEditing ? 'shadow-md' : 'shadow-sm hover:shadow-md'} ${!isActive ? 'opacity-55' : ''}`}
                style={{
                  borderColor: isEditing ? meta.color : 'rgba(0,0,0,0.07)',
                  background: 'var(--color-surface)',
                }}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {/* Colored left accent bar */}
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: meta.color }} />

                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => move(idx, -1)} disabled={idx === 0}
                      className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 transition-colors">
                      <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <span className="text-xs font-bold text-gray-300 leading-none">{idx + 1}</span>
                    <button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1}
                      className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 transition-colors">
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  {/* Section icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.color + '15' }}>
                    <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {section.title || meta.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
                  </div>

                  {/* Status badge */}
                  <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${isActive ? 'text-green-700 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {isActive ? 'ظاهر' : 'مخفي'}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleActive(section)}
                      title={isActive ? 'إخفاء القسم' : 'إظهار القسم'}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors sm:hidden">
                      {isActive ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button onClick={() => toggleActive(section)}
                      title={isActive ? 'إخفاء' : 'إظهار'}
                      className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      {isActive ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button
                      onClick={() => isEditing ? cancelEdit() : startEdit(section)}
                      className="p-2 rounded-lg transition-colors"
                      style={isEditing
                        ? { background: meta.color + '15', color: meta.color }
                        : { color: 'var(--color-text)' }}
                      title="تعديل القسم">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteSection(section)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                      title="حذف القسم">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add more button at bottom */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium flex items-center justify-center gap-2 hover:shadow-sm transition-all"
            style={{ borderColor: 'rgba(99,102,241,0.3)', color: 'var(--color-primary)', background: 'rgba(99,102,241,0.03)' }}>
            <Plus className="w-4 h-4" />
            إضافة قسم آخر
          </button>
        </div>
      )}
    </div>
  );
}
