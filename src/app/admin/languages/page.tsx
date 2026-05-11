'use client';
import { useState, useEffect } from 'react';
import { languagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Check, Globe } from 'lucide-react';

const COMMON_LANGS = [
  { code: 'ar', name: 'Arabic', native_name: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  { code: 'en', name: 'English', native_name: 'English', direction: 'ltr', flag: '🇬🇧' },
  { code: 'fr', name: 'French', native_name: 'Français', direction: 'ltr', flag: '🇫🇷' },
  { code: 'de', name: 'German', native_name: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', native_name: 'Español', direction: 'ltr', flag: '🇪🇸' },
  { code: 'tr', name: 'Turkish', native_name: 'Türkçe', direction: 'ltr', flag: '🇹🇷' },
  { code: 'ur', name: 'Urdu', native_name: 'اردو', direction: 'rtl', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian', native_name: 'فارسی', direction: 'rtl', flag: '🇮🇷' },
  { code: 'zh', name: 'Chinese', native_name: '中文', direction: 'ltr', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', native_name: '日本語', direction: 'ltr', flag: '🇯🇵' },
];

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', native_name: '', direction: 'ltr', flag_emoji: '' });

  const load = () => languagesApi.list().then(({ data }) => { setLanguages(data.languages); setLoading(false); });
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.code || !form.name || !form.native_name) { toast.error('جميع الحقول مطلوبة'); return; }
    try {
      await languagesApi.create(form);
      toast.success('تم إضافة اللغة');
      setShowAdd(false);
      setForm({ code: '', name: '', native_name: '', direction: 'ltr', flag_emoji: '' });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الإضافة');
    }
  };

  const quickAdd = async (lang: typeof COMMON_LANGS[0]) => {
    const exists = languages.some(l => l.code === lang.code);
    if (exists) { toast.error('اللغة موجودة بالفعل'); return; }
    try {
      await languagesApi.create({ code: lang.code, name: lang.name, native_name: lang.native_name, direction: lang.direction, flag_emoji: lang.flag });
      toast.success(`تم إضافة ${lang.native_name}`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الإضافة');
    }
  };

  const setDefault = async (id: string) => {
    await languagesApi.update(id, { is_default: 1 });
    toast.success('تم تعيين اللغة الافتراضية');
    load();
  };

  const toggleActive = async (id: string, current: number) => {
    await languagesApi.update(id, { is_active: current ? 0 : 1 });
    load();
  };

  const del = async (id: string) => {
    if (!confirm('سيتم حذف جميع ترجمات هذه اللغة. هل أنت متأكد؟')) return;
    try {
      await languagesApi.delete(id);
      toast.success('تم حذف اللغة');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>اللغات</h1>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
          style={{ background: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" /> إضافة لغة
        </button>
      </div>

      {/* Quick add common languages */}
      <div className="cms-card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>إضافة سريعة</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_LANGS.map((lang) => {
            const exists = languages.some(l => l.code === lang.code);
            return (
              <button key={lang.code} onClick={() => quickAdd(lang)} disabled={exists}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${exists ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-sm'}`}
                style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>
                <span>{lang.flag}</span>
                <span>{lang.native_name}</span>
                {exists && <Check className="w-3 h-3 text-green-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom add form */}
      {showAdd && (
        <div className="cms-card space-y-4">
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>إضافة لغة مخصصة</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">رمز اللغة (مثل: ar, en)</label>
              <input type="text" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toLowerCase() }))}
                placeholder="ar" maxLength={5}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">اسم اللغة (بالإنجليزية)</label>
              <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Arabic"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الاسم الأصلي</label>
              <input type="text" value={form.native_name} onChange={(e) => setForm(p => ({ ...p, native_name: e.target.value }))}
                placeholder="العربية"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">اتجاه الكتابة</label>
              <select value={form.direction} onChange={(e) => setForm(p => ({ ...p, direction: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="rtl">من اليمين لليسار</option>
                <option value="ltr">من اليسار لليمين</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الرمز التعبيري للعلم</label>
              <input type="text" value={form.flag_emoji} onChange={(e) => setForm(p => ({ ...p, flag_emoji: e.target.value }))}
                placeholder="🇸🇦"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'var(--color-primary)' }}>إضافة</button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>إلغاء</button>
          </div>
        </div>
      )}

      {/* Languages list */}
      <div className="cms-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'var(--color-surface)' }}>
              <tr className="text-sm text-gray-500 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <th className="px-4 py-3 text-start font-medium">اللغة</th>
                <th className="px-4 py-3 text-start font-medium">الرمز</th>
                <th className="px-4 py-3 text-start font-medium">الاتجاه</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <tr key={lang.id} className="border-b text-sm" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag_emoji}</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>{lang.native_name}</p>
                        <p className="text-xs text-gray-400">{lang.name}</p>
                      </div>
                      {lang.is_default ? (
                        <span className="text-xs px-2 py-0.5 rounded-full badge-published">افتراضية</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500">{lang.code}</td>
                  <td className="px-4 py-3 text-gray-500">{lang.direction === 'rtl' ? 'RTL' : 'LTR'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(lang.id, lang.is_active)}
                      className={`text-xs px-2 py-0.5 rounded-full ${lang.is_active ? 'badge-published' : 'badge-draft'}`}>
                      {lang.is_active ? 'نشطة' : 'معطلة'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!lang.is_default && (
                        <button onClick={() => setDefault(lang.id)}
                          className="text-xs px-2 py-1 rounded text-white hover:opacity-90"
                          style={{ background: 'var(--color-secondary)' }}>
                          تعيين افتراضية
                        </button>
                      )}
                      {!lang.is_default && (
                        <button onClick={() => del(lang.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
