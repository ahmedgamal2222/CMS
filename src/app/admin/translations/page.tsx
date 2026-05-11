'use client';
import { useState, useEffect } from 'react';
import { translationsApi, languagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Search, Save, Trash2, Download, Upload } from 'lucide-react';

export default function TranslationsPage() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState('ar');
  const [selectedNs, setSelectedNs] = useState('common');
  const [translations, setTranslations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [edits, setEdits] = useState<Record<string, string>>({});

  const namespaces = ['common', 'admin', 'public', 'errors', 'emails'];

  useEffect(() => {
    languagesApi.list().then(({ data }) => setLanguages(data.languages));
  }, []);

  useEffect(() => {
    load();
  }, [selectedLang, selectedNs]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await translationsApi.list({ language_code: selectedLang, namespace: selectedNs });
      setTranslations(data.translations);
      setEdits({});
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    const changed = Object.entries(edits);
    if (changed.length === 0) { toast.info('لا تغييرات للحفظ'); return; }

    const bulk: Record<string, string> = {};
    for (const [id, value] of changed) {
      const t = translations.find(t => t.id === id);
      if (t) bulk[t.key] = value;
    }

    await translationsApi.bulk({ language_code: selectedLang, namespace: selectedNs, translations: bulk });
    toast.success(`تم حفظ ${changed.length} ترجمة`);
    setEdits({});
    load();
  };

  const addNew = async () => {
    if (!newKey || !newValue) { toast.error('المفتاح والقيمة مطلوبان'); return; }
    await translationsApi.upsert({ language_code: selectedLang, namespace: selectedNs, key: newKey, value: newValue });
    toast.success('تم إضافة الترجمة');
    setNewKey(''); setNewValue('');
    load();
  };

  const del = async (id: string) => {
    await translationsApi.delete(id);
    toast.success('تم حذف الترجمة');
    load();
  };

  const filtered = translations.filter(t =>
    !search || t.key.includes(search) || t.value.includes(search)
  );

  const copyFromArabic = async () => {
    if (selectedLang === 'ar') return;
    const { data: arData } = await translationsApi.list({ language_code: 'ar', namespace: selectedNs });
    const bulk: Record<string, string> = {};
    for (const t of arData.translations) bulk[t.key] = t.key; // copy keys as values for translation
    await translationsApi.bulk({ language_code: selectedLang, namespace: selectedNs, translations: bulk });
    toast.success('تم نسخ مفاتيح الترجمة العربية');
    load();
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>الترجمات</h1>
        <div className="flex gap-2">
          {Object.keys(edits).length > 0 && (
            <button onClick={saveAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
              style={{ background: 'var(--color-primary)' }}>
              <Save className="w-4 h-4" />
              حفظ التغييرات ({Object.keys(edits).length})
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.flag_emoji} {l.native_name}</option>
          ))}
        </select>

        <select value={selectedNs} onChange={(e) => setSelectedNs(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          {namespaces.map(ns => <option key={ns} value={ns}>{ns}</option>)}
        </select>

        <div className="relative flex-1 min-w-48">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="ابحث في الترجمات..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
        </div>

        {selectedLang !== 'ar' && (
          <button onClick={copyFromArabic}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>
            نسخ من العربية
          </button>
        )}
      </div>

      {/* Add new */}
      <div className="cms-card">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>إضافة ترجمة جديدة</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">المفتاح</label>
            <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)}
              placeholder="example_key" dir="ltr"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">الترجمة</label>
            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)}
              placeholder="قيمة الترجمة..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
          </div>
          <button onClick={addNew}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Translations table */}
      <div className="cms-card overflow-hidden p-0">
        <div className="px-4 py-2 border-b text-xs text-gray-500 flex justify-between" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <span>{filtered.length} ترجمة</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">لا توجد ترجمات</div>
        ) : (
          <div className="divide-y" style={{ divideColor: 'rgba(0,0,0,0.06)' }}>
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <code className="w-48 text-xs text-gray-500 flex-shrink-0 truncate" dir="ltr">{t.key}</code>
                <input
                  type="text"
                  defaultValue={t.value}
                  onChange={(e) => setEdits(prev => ({ ...prev, [t.id]: e.target.value }))}
                  className={`flex-1 px-2 py-1 text-sm rounded border transition-colors ${edits[t.id] !== undefined ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-transparent hover:border-gray-200'}`}
                  style={{ color: 'var(--color-text)' }}
                />
                <button onClick={() => del(t.id)} className="text-red-400 hover:text-red-600 flex-shrink-0 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
