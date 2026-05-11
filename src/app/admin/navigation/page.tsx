'use client';
import { useState, useEffect } from 'react';
import { navigationApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Menu, ExternalLink } from 'lucide-react';

const LOCATIONS = [
  { value: 'header', label: 'الرأس (Header)' },
  { value: 'footer', label: 'التذييل (Footer)' },
  { value: 'sidebar', label: 'الشريط الجانبي' },
  { value: 'mobile', label: 'الهاتف' },
];

const LINK_TYPES = [
  { value: 'page', label: 'صفحة' },
  { value: 'post', label: 'مقال' },
  { value: 'custom', label: 'رابط مخصص' },
  { value: 'category', label: 'تصنيف' },
];

const defaultItem = { title: '', url: '', link_type: 'custom', open_in_new_tab: false };

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
    if (!itemForm.title || !itemForm.url) { toast.error('العنوان والرابط مطلوبان'); return; }
    try {
      if (editingItem) {
        await navigationApi.updateItem(editingItem.id, itemForm);
        toast.success('تم تحديث العنصر');
      } else {
        await navigationApi.addItem(activeMenu.id, { ...itemForm, order_index: (activeMenu.items?.length || 0) + 1 });
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
    setItemForm({ title: item.title, url: item.url, link_type: item.link_type || 'custom', open_in_new_tab: item.open_in_new_tab || false });
    setShowItemForm(true);
  };

  const currentMenu = menus.find(m => m.id === activeMenu?.id);

  return (
    <div className="space-y-5" dir="rtl">
      <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
        قوائم التنقل
      </h1>

      <div className="grid grid-cols-3 gap-5">
        {/* Menus panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">القوائم</h2>
            <button onClick={() => setShowMenuForm(!showMenuForm)}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded"
              style={{ color: 'var(--color-primary)' }}>
              <Plus className="w-3 h-3" /> جديد
            </button>
          </div>

          {showMenuForm && (
            <div className="cms-card space-y-3 text-sm">
              <input type="text" placeholder="اسم القائمة" value={menuForm.name}
                onChange={(e) => setMenuForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
              <select value={menuForm.location} onChange={(e) => setMenuForm(p => ({ ...p, location: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={createMenu} className="flex-1 py-1.5 rounded text-white text-xs"
                  style={{ background: 'var(--color-primary)' }}>إضافة</button>
                <button onClick={() => setShowMenuForm(false)} className="px-3 py-1.5 border rounded text-xs"
                  style={{ borderColor: 'rgba(0,0,0,0.15)' }}>إلغاء</button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-gray-400 text-sm">جاري التحميل...</p>
          ) : menus.length === 0 ? (
            <div className="cms-card p-6 text-center">
              <Menu className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">لا توجد قوائم</p>
            </div>
          ) : (
            <div className="space-y-1">
              {menus.map(menu => (
                <div key={menu.id}
                  onClick={() => setActiveMenu(menu)}
                  className={`cms-card py-2.5 px-3 cursor-pointer flex items-center justify-between hover:shadow-md transition-shadow ${activeMenu?.id === menu.id ? 'ring-2' : ''}`}
                  style={activeMenu?.id === menu.id ? { ringColor: 'var(--color-primary)' } : {}}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{menu.name}</p>
                    <p className="text-xs text-gray-400">{LOCATIONS.find(l => l.value === menu.location)?.label || menu.location}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delMenu(menu.id); }}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items panel */}
        <div className="col-span-2 space-y-3">
          {!activeMenu ? (
            <div className="cms-card p-12 text-center">
              <Menu className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">اختر قائمة من القائمة اليسرى</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>{currentMenu?.name || activeMenu.name}</h2>
                <button onClick={() => { setEditingItem(null); setItemForm({ ...defaultItem }); setShowItemForm(!showItemForm); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                  style={{ background: 'var(--color-primary)' }}>
                  <Plus className="w-3.5 h-3.5" /> إضافة عنصر
                </button>
              </div>

              {showItemForm && (
                <div className="cms-card space-y-3">
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{editingItem ? 'تعديل العنصر' : 'عنصر جديد'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">العنوان</label>
                      <input type="text" value={itemForm.title}
                        onChange={(e) => setItemForm((p: any) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">نوع الرابط</label>
                      <select value={itemForm.link_type}
                        onChange={(e) => setItemForm((p: any) => ({ ...p, link_type: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                        {LINK_TYPES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">الرابط / المسار</label>
                      <input type="text" value={itemForm.url} dir="ltr"
                        placeholder="/about أو https://example.com"
                        onChange={(e) => setItemForm((p: any) => ({ ...p, url: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="new_tab" checked={itemForm.open_in_new_tab}
                        onChange={(e) => setItemForm((p: any) => ({ ...p, open_in_new_tab: e.target.checked }))}
                        className="rounded" />
                      <label htmlFor="new_tab" className="text-sm" style={{ color: 'var(--color-text)' }}>فتح في تبويب جديد</label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addItem} className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ background: 'var(--color-primary)' }}>
                      {editingItem ? 'حفظ التغييرات' : 'إضافة'}
                    </button>
                    <button onClick={() => { setShowItemForm(false); setEditingItem(null); }}
                      className="px-4 py-2 border rounded-lg text-sm"
                      style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              <div className="cms-card overflow-hidden p-0">
                {!currentMenu?.items?.length ? (
                  <div className="p-8 text-center text-gray-400 text-sm">لا توجد عناصر في هذه القائمة</div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                    {(currentMenu?.items || []).map((item: any) => (
                      <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded flex items-center justify-center text-gray-400"
                            style={{ background: 'var(--color-surface)' }}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.title}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1" dir="ltr">
                              {item.url}
                              {item.open_in_new_tab && <ExternalLink className="w-3 h-3" />}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditItem(item)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-500">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => delItem(item.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
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
