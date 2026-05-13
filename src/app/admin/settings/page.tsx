'use client';
import { useState, useEffect, useRef } from 'react';
import { settingsApi, mediaApi } from '@/lib/api';
import { useThemeStore } from '@/lib/store';
import { toast } from 'sonner';
import { Palette, Globe2, Share2, Code2, Save, Upload, X, Eye } from 'lucide-react';

const tabs = [
  { id: 'general', label: 'عام', icon: Globe2 },
  { id: 'display', label: 'العرض', icon: Eye },
  { id: 'theme', label: 'المظهر', icon: Palette },
  { id: 'social', label: 'التواصل الاجتماعي', icon: Share2 },
  { id: 'advanced', label: 'متقدم', icon: Code2 },
];

const arabicFonts = [
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Almarai', label: 'Almarai' },
  { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Arabic' },
  { value: 'Readex Pro', label: 'Readex Pro' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const { setTheme } = useThemeStore();

  useEffect(() => {
    settingsApi.get().then(({ data }) => setSettings(data.settings));
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab')) setActiveTab(params.get('tab')!);
    }
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const uploadImage = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '/settings');
      const { data } = await mediaApi.upload(formData);
      update(key, data.media.file_url);
      toast.success('تم رفع الصورة بنجاح');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingKey(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      // Apply theme immediately
      setTheme({
        colorPrimary: settings.color_primary,
        colorSecondary: settings.color_secondary,
        colorAccent: settings.color_accent,
        colorBackground: settings.color_background,
        colorText: settings.color_text,
        colorSurface: settings.color_surface,
        fontHeading: settings.font_heading,
        fontBody: settings.font_body,
        darkMode: settings.dark_mode === 'true',
      });
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>الإعدادات</h1>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}>
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-start transition-all ${activeTab === tab.id ? 'text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              style={activeTab === tab.id ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--color-text)' }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 cms-card space-y-5">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <h2 className="text-lg font-heading font-semibold">إعدادات عامة</h2>

              {/* Logo & Favicon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                <ImageField
                  label="شعار الموقع (Logo)"
                  value={settings.site_logo || ''}
                  onChange={v => update('site_logo', v)}
                  onUpload={f => uploadImage('site_logo', f)}
                  uploading={uploadingKey === 'site_logo'}
                />
                <ImageField
                  label="أيقونة الموقع (Favicon)"
                  value={settings.site_favicon || ''}
                  onChange={v => update('site_favicon', v)}
                  onUpload={f => uploadImage('site_favicon', f)}
                  uploading={uploadingKey === 'site_favicon'}
                />
              </div>

              <Field label="اسم الموقع" value={settings.site_name || ''} onChange={v => update('site_name', v)} />
              <Field label="وصف الموقع" value={settings.site_description || ''} onChange={v => update('site_description', v)} textarea />
              <Field label="البريد الإلكتروني" value={settings.site_email || ''} onChange={v => update('site_email', v)} type="email" />
              <Field label="رقم الهاتف" value={settings.site_phone || ''} onChange={v => update('site_phone', v)} />
              <Field label="العنوان" value={settings.site_address || ''} onChange={v => update('site_address', v)} textarea />
              <Field label="نص التذييل" value={settings.footer_text || ''} onChange={v => update('footer_text', v)} />
              <div className="flex items-center gap-3 pt-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>عدد المقالات في الصفحة</label>
                <input type="number" min="1" max="100"
                  value={settings.posts_per_page || '10'}
                  onChange={(e) => update('posts_per_page', e.target.value)}
                  className="w-20 px-3 py-1.5 border rounded-lg text-sm"
                  style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
              </div>
            </>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <>
              <h2 className="text-lg font-heading font-semibold">إعدادات العرض</h2>
              <p className="text-sm opacity-60" style={{ color: 'var(--color-text)' }}>
                تحكم في ما يظهر في شريط التنقل والتذييل
              </p>

              {/* Navbar */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold pt-2 border-t" style={{ color: 'var(--color-text)', borderColor: 'rgba(0,0,0,0.08)' }}>
                  شريط التنقل (Navbar)
                </h3>
                <ToggleField
                  label="إظهار اللوجو في شريط التنقل"
                  description="يعرض صورة الشعار المرفوعة في الإعدادات العامة"
                  checked={settings.show_logo_navbar !== 'false'}
                  onChange={v => update('show_logo_navbar', v ? 'true' : 'false')}
                />
                <ToggleField
                  label="إظهار اسم الموقع في شريط التنقل"
                  description="يعرض اسم الموقع بجانب اللوجو"
                  checked={settings.show_name_navbar !== 'false'}
                  onChange={v => update('show_name_navbar', v ? 'true' : 'false')}
                />
              </div>

              {/* Footer */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold pt-2 border-t" style={{ color: 'var(--color-text)', borderColor: 'rgba(0,0,0,0.08)' }}>
                  التذييل (Footer)
                </h3>
                <ToggleField
                  label="إظهار اللوجو في التذييل"
                  description="يعرض صورة الشعار في أسفل الصفحة"
                  checked={settings.show_logo_footer !== 'false'}
                  onChange={v => update('show_logo_footer', v ? 'true' : 'false')}
                />
                <ToggleField
                  label="إظهار اسم الموقع في التذييل"
                  description="يعرض اسم الموقع في التذييل"
                  checked={settings.show_name_footer !== 'false'}
                  onChange={v => update('show_name_footer', v ? 'true' : 'false')}
                />
              </div>
            </>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <>
              <h2 className="text-lg font-heading font-semibold">إعدادات المظهر</h2>

              {/* Color palette */}
              <div>
                <h3 className="text-sm font-semibold mb-3 opacity-70">الألوان</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ColorField label="اللون الرئيسي" value={settings.color_primary || '#6366f1'} onChange={v => update('color_primary', v)} />
                  <ColorField label="اللون الثانوي" value={settings.color_secondary || '#8b5cf6'} onChange={v => update('color_secondary', v)} />
                  <ColorField label="لون التمييز" value={settings.color_accent || '#f59e0b'} onChange={v => update('color_accent', v)} />
                  <ColorField label="لون الخلفية" value={settings.color_background || '#ffffff'} onChange={v => update('color_background', v)} />
                  <ColorField label="لون النص" value={settings.color_text || '#111827'} onChange={v => update('color_text', v)} />
                  <ColorField label="لون السطح" value={settings.color_surface || '#f9fafb'} onChange={v => update('color_surface', v)} />
                </div>
              </div>

              {/* Color presets */}
              <div>
                <h3 className="text-sm font-semibold mb-3 opacity-70">ألوان جاهزة</h3>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        update('color_primary', preset.primary);
                        update('color_secondary', preset.secondary);
                        update('color_accent', preset.accent);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs hover:shadow-sm transition-all"
                      style={{ borderColor: preset.primary }}>
                      <span className="flex gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ background: preset.primary }} />
                        <span className="w-3 h-3 rounded-full" style={{ background: preset.secondary }} />
                        <span className="w-3 h-3 rounded-full" style={{ background: preset.accent }} />
                      </span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fonts */}
              <div>
                <h3 className="text-sm font-semibold mb-3 opacity-70">الخطوط</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>خط العناوين</label>
                    <select
                      value={settings.font_heading || 'Cairo'}
                      onChange={(e) => update('font_heading', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                      {arabicFonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>خط المحتوى</label>
                    <select
                      value={settings.font_body || 'Tajawal'}
                      onChange={(e) => update('font_body', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                      {arabicFonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--color-primary)', background: settings.color_background }}>
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: settings.font_heading, color: settings.color_primary }}>
                  معاينة العنوان
                </h3>
                <p className="text-sm" style={{ fontFamily: settings.font_body, color: settings.color_text }}>
                  هذا مثال على نص المحتوى مع الخط والألوان المختارة
                </p>
                <button className="mt-2 px-4 py-1.5 rounded-lg text-white text-sm" style={{ background: settings.color_primary }}>
                  زر مثال
                </button>
              </div>
            </>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <>
              <h2 className="text-lg font-heading font-semibold">وسائل التواصل الاجتماعي</h2>
              <Field label="صفحة فيسبوك" value={settings.social_facebook || ''} onChange={v => update('social_facebook', v)} placeholder="https://facebook.com/..." />
              <Field label="حساب تويتر/X" value={settings.social_twitter || ''} onChange={v => update('social_twitter', v)} placeholder="https://twitter.com/..." />
              <Field label="حساب انستغرام" value={settings.social_instagram || ''} onChange={v => update('social_instagram', v)} placeholder="https://instagram.com/..." />
              <Field label="صفحة لينكدإن" value={settings.social_linkedin || ''} onChange={v => update('social_linkedin', v)} placeholder="https://linkedin.com/..." />
              <Field label="قناة يوتيوب" value={settings.social_youtube || ''} onChange={v => update('social_youtube', v)} placeholder="https://youtube.com/..." />
            </>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <>
              <h2 className="text-lg font-heading font-semibold">إعدادات متقدمة</h2>
              <Field label="Google Analytics ID" value={settings.google_analytics || ''} onChange={v => update('google_analytics', v)} placeholder="G-XXXXXXXXXX" />
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>وضع الصيانة</label>
                <input type="checkbox" checked={settings.maintenance_mode === 'true'}
                  onChange={(e) => update('maintenance_mode', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>CSS مخصص</label>
                <textarea
                  value={settings.custom_css || ''}
                  onChange={(e) => update('custom_css', e.target.value)}
                  rows={6}
                  dir="ltr"
                  placeholder="/* CSS مخصص */"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
                  style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>JavaScript مخصص</label>
                <textarea
                  value={settings.custom_js || ''}
                  onChange={(e) => update('custom_js', e.target.value)}
                  rows={6}
                  dir="ltr"
                  placeholder="// JavaScript مخصص"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
                  style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, textarea }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      )}
    </div>
  );
}

function ImageField({ label, value, onChange, onUpload, uploading }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => void;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{label}</label>
      {value ? (
        <div className="flex items-center gap-3 p-3 border rounded-xl" style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
          <img src={value} alt={label} className="h-12 w-auto max-w-32 object-contain rounded" onError={e => (e.currentTarget.style.display = 'none')} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">{value}</p>
          </div>
          <button onClick={() => onChange('')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary transition-colors"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-500">اضغط لرفع صورة</p>
              <p className="text-xs text-gray-400">PNG, JPG, SVG — حتى 5 ميجابايت</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }}
      />
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-400">أو أدخل رابطاً:</span>
        <input type="url" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          className="flex-1 px-3 py-1.5 border rounded-lg text-xs"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
          style={{ border: '2px solid rgba(0,0,0,0.1)' }} />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded text-sm font-mono"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      </div>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl transition-colors"
      style={{ borderColor: 'rgba(0,0,0,0.1)', background: checked ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? '' : 'bg-gray-200'}`}
        style={checked ? { background: 'var(--color-primary)' } : {}}>
        <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

const presets = [
  { name: 'بنفسجي', primary: '#6366f1', secondary: '#8b5cf6', accent: '#f59e0b' },
  { name: 'أخضر', primary: '#10b981', secondary: '#059669', accent: '#f97316' },
  { name: 'أزرق', primary: '#3b82f6', secondary: '#6366f1', accent: '#f59e0b' },
  { name: 'وردي', primary: '#ec4899', secondary: '#f43f5e', accent: '#8b5cf6' },
  { name: 'برتقالي', primary: '#f97316', secondary: '#ef4444', accent: '#3b82f6' },
  { name: 'رمادي', primary: '#374151', secondary: '#6b7280', accent: '#6366f1' },
  { name: 'ذهبي', primary: '#d97706', secondary: '#b45309', accent: '#1d4ed8' },
  { name: 'فيروزي', primary: '#0891b2', secondary: '#0e7490', accent: '#f59e0b' },
];
