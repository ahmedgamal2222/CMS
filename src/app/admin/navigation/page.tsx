'use client';
export const runtime = 'edge';
import { useState, useEffect } from 'react';
import { navigationApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Menu, ExternalLink, Link2, ChevronDown, Globe, FileText, Tag, Hash, Check, X } from 'lucide-react';

const LOCATIONS = [
  { value: 'header', label: 'الرأس', desc: 'Header', icon: '🔝' },
  { value: 'footer', label: 'التذييل', desc: 'Footer', icon: '⬇️' },
  { value: 'sidebar', label: 'الشريط الجانبي', desc: 'Sidebar', icon: '◀️' },
  { value: 'mobile', label: 'الهاتف', desc: 'Mobile', icon: '📱' },
];

const LINK_TYPES = [
  { value: 'page', label: 'صفحة', icon: FileText },
  { value: 'post', label: 'مقال', icon: Tag },
  { value: 'custom', label: 'رابط مخصص', icon: Link2 },
  { value: 'category', label: 'تصنيف', icon: Hash },
];

const defaultItem = { label: '', url: '', type: 'custom', target: '_self' };

export default function NavigationPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<any>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', location: 'header' });
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState<any>({ ...defaultItem });
  const [editingItem, setEditingItem] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await navigationApi.getAll();
      setMenus(data.menus || []);
      if (data.menus?.length && !activeMenu) setActiveMenu(data.menus[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createMenu = async () => {
    if (!menuForm.name) { toast.error('اسم القائمة مطلوب'); return; }
    try {
      await navigationApi.createMenu(menuForm);
      toast.success('تم إنشاء القائمة');
      setShowMenuForm(false);
      setMenuForm({ name: '', location: 'header' });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الإنشاء');
    }
  };

  const delMenu = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه القائمة وجميع عناصرها؟')) return;
    try {
      await navigationApi.deleteMenu(id);
      toast.success('تم حذف القائمة');
      setActiveMenu(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحذف');
    }
  };

  const addItem = async () => {
    if (!itemForm.label) { toast.error('العنوان مطلوب'); return; }
    try {
      const payload = { ...itemForm };
      if (editingItem) {
        await navigationApi.updateItem(editingItem.id, payload);
        toast.success('تم تحديث العنصر');
      } else {
        await navigationApi.addItem(activeMenu.id, { ...payload, order_index: (currentMenu?.items?.length || 0) });
        toast.success('تمت إضافة العنصر');
      }
      setShowItemForm(false);
      setEditingItem(null);
      setItemForm({ ...defaultItem });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل العملية');
    }
  };

  const delItem = async (id: string) => {
    if (!confirm('حذف هذا العنصر؟')) return;
    try {
      await navigationApi.deleteItem(id);
      toast.success('تم الحذف');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحذف');
    }
  };

  const openEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({ label: item.label, url: item.url || '', type: item.type || 'custom', target: item.target || '_self' });
    setShowItemForm(true);
  };

  const currentMenu = menus.find(m => m.id === activeMenu?.id);
  const locationInfo = (val: string) => LOCATIONS.find(l => l.value === val);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
          قوائم التنقل
        </h1>
        <button
          onClick={() => { setShowMenuForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" />
          قائمة جديدة
        </button>
      </div>

      {/* Create menu form */}
      {showMenuForm && (
        <div className="cms-card border-2 space-y-4" style={{ borderColor: 'var(--color-primary)', borderStyle: 'dashed' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>إنشاء قائمة جديدة</h3>
            <button onClick={() => setShowMenuForm(false)} className="p-1 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">اسم القائمة *</label>
              <input type="text" placeholder="مثال: القائمة الرئيسية" value={menuForm.name}
                onChange={(e) => setMenuForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">موقع القائمة</label>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map(l => (
                  <button key={l.value} onClick={() => setMenuForm(p => ({ ...p, location: l.value }))}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all"
                    style={{
                      borderColor: menuForm.location === l.value ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)',
                      background: menuForm.location === l.value ? 'rgba(99,102,241,0.06)' : 'transparent',
                      color: menuForm.location === l.value ? 'var(--color-primary)' : 'var(--color-text)',
                    }}>
                    <span>{l.icon}</span> {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createMenu}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: 'var(--color-primary)' }}>
              <Check className="w-4 h-4" /> إنشاء القائمة
            </button>
            <button onClick={() => setShowMenuForm(false)}
              className="px-4 py-2 border rounded-xl text-sm"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Menus panel */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">القوائم المتاحة</h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : menus.length === 0 ? (
            <div className="cms-card p-8 text-center">
              <Menu className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">لا توجد قوائم بعد</p>
              <button onClick={() => setShowMenuForm(true)}
                className="mt-2 text-xs hover:underline" style={{ color: 'var(--color-primary)' }}>
                أنشئ أول قائمة
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {menus.map(menu => {
                const loc = locationInfo(menu.location);
                const isActive = activeMenu?.id === menu.id;
                return (
                  <div key={menu.id}
                    onClick={() => setActiveMenu(menu)}
                    className={`cms-card py-3 px-3.5 cursor-pointer flex items-center justify-between transition-all ${isActive ? 'ring-2 shadow-md' : 'hover:shadow-md'}`}
                    style={isActive ? { outline: '2px solid var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg flex-shrink-0">{loc?.icon || '🔗'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{menu.name}</p>
                        <p className="text-xs text-gray-400">{loc?.label || menu.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {menu.items?.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{ background: isActive ? 'var(--color-primary)' : '#9ca3af', fontSize: '10px' }}>
                          {menu.items.length}
                        </span>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); delMenu(menu.id); }}
                        className="p-1 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Items panel */}
        <div className="col-span-2 space-y-3">
          {!activeMenu ? (
            <div className="cms-card p-12 text-center">
              <Menu className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">اختر قائمة من اليمين</p>
              <p className="text-sm text-gray-400 mt-1">لعرض وتعديل عناصرها</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold" style={{ color: 'var(--color-text)' }}>{currentMenu?.name || activeMenu.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {locationInfo(currentMenu?.location || activeMenu.location)?.label} ·{' '}
                    {currentMenu?.items?.length || 0} عنصر
                  </p>
                </div>
                <button onClick={() => { setEditingItem(null); setItemForm({ ...defaultItem }); setShowItemForm(v => !v); }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ background: showItemForm && !editingItem ? '#6b7280' : 'var(--color-primary)' }}>
                  {showItemForm && !editingItem ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showItemForm && !editingItem ? 'إلغاء' : 'إضافة عنصر'}
                </button>
              </div>

              {/* Item form */}
              {showItemForm && (
                <div className="cms-card space-y-4 border-2"
                  style={{ borderColor: editingItem ? '#f59e0b' : 'var(--color-primary)', borderStyle: 'dashed' }}>
                  <h4 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                    {editingItem ? '✏️ تعديل العنصر' : '➕ عنصر جديد'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">نص الرابط *</label>
                      <input type="text" value={itemForm.label}
                        onChange={(e) => setItemForm((p: any) => ({ ...p, label: e.target.value }))}
                        placeholder="مثال: الرئيسية"
                        className="w-full px-3 py-2 border rounded-xl text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">نوع الرابط</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {LINK_TYPES.map(lt => (
                          <button key={lt.value} onClick={() => setItemForm((p: any) => ({ ...p, type: lt.value }))}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 text-xs font-medium transition-all"
                            style={{
                              borderColor: itemForm.type === lt.value ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)',
                              background: itemForm.type === lt.value ? 'rgba(99,102,241,0.08)' : 'transparent',
                              color: itemForm.type === lt.value ? 'var(--color-primary)' : 'var(--color-text)',
                            }}>
                            <lt.icon className="w-3 h-3" /> {lt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">الرابط / المسار</label>
                      <input type="text" value={itemForm.url} dir="ltr"
                        placeholder="/about أو https://example.com"
                        onChange={(e) => setItemForm((p: any) => ({ ...p, url: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-xl text-sm font-mono" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                          onClick={() => setItemForm((p: any) => ({ ...p, target: p.target === '_blank' ? '_self' : '_blank' }))}
                          className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${itemForm.target === '_blank' ? '' : 'bg-gray-200'}`}
                          style={itemForm.target === '_blank' ? { background: 'var(--color-primary)' } : {}}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${itemForm.target === '_blank' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>فتح في تبويب جديد</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addItem}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90"
                      style={{ background: 'var(--color-primary)' }}>
                      <Check className="w-4 h-4" />
                      {editingItem ? 'حفظ التغييرات' : 'إضافة العنصر'}
                    </button>
                    <button onClick={() => { setShowItemForm(false); setEditingItem(null); setItemForm({ ...defaultItem }); }}
                      className="px-4 py-2 border rounded-xl text-sm"
                      style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Items list */}
              <div className="cms-card overflow-hidden p-0">
                {!currentMenu?.items?.length ? (
                  <div className="p-10 text-center">
                    <Link2 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm font-medium">لا توجد عناصر في هذه القائمة</p>
                    <button onClick={() => { setEditingItem(null); setItemForm({ ...defaultItem }); setShowItemForm(true); }}
                      className="mt-2 text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
                      أضف أول عنصر
                    </button>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                    {(currentMenu?.items || []).map((item: any, index: number) => {
                      const lt = LINK_TYPES.find(l => l.value === item.type) || LINK_TYPES[2];
                      return (
                        <div key={item.id} className="group px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                          {/* Number */}
                          <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 text-gray-400"
                            style={{ background: 'rgba(0,0,0,0.05)' }}>
                            {index + 1}
                          </span>
                          {/* Icon */}
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.08)' }}>
                            <lt.icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 font-mono" dir="ltr">
                              {item.url || '—'}
                              {item.target === '_blank' && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
                            </p>
                          </div>
                          {/* Type badge */}
                          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full text-gray-500"
                            style={{ background: 'rgba(0,0,0,0.06)' }}>
                            {lt.label}
                          </span>
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditItem(item)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => delItem(item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
