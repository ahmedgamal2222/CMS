'use client';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';

const ROLES: Record<string, string> = {
  super_admin: 'مدير رئيسي',
  admin: 'مدير',
  editor: 'محرر',
  viewer: 'مشاهد',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#ef4444',
  admin: '#f97316',
  editor: '#6366f1',
  viewer: '#6b7280',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' });
  const { user: me } = useAuthStore();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.list({ search });
      setUsers(data.users);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const submit = async () => {
    if (!form.name || !form.email) { toast.error('الاسم والبريد مطلوبان'); return; }
    if (!editing && !form.password) { toast.error('كلمة المرور مطلوبة'); return; }
    try {
      if (editing) {
        await usersApi.update(editing.id, { name: form.name, email: form.email, role: form.role, password: form.password || undefined });
        toast.success('تم تحديث المستخدم');
      } else {
        await usersApi.create(form);
        toast.success('تم إضافة المستخدم');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', email: '', password: '', role: 'editor' });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل العملية');
    }
  };

  const del = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await usersApi.delete(id);
      toast.success('تم حذف المستخدم');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الحذف');
    }
  };

  const openEdit = (user: any) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
          المستخدمون <span className="text-gray-400 text-base font-normal">({total})</span>
        </h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'editor' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
          style={{ background: 'var(--color-primary)' }}>
          <Plus className="w-4 h-4" /> مستخدم جديد
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="cms-card space-y-4">
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{editing ? 'تعديل المستخدم' : 'مستخدم جديد'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">الاسم</label>
              <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">كلمة المرور {editing && '(اتركها فارغة للإبقاء على القديمة)'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder={editing ? '••••••••' : 'كلمة المرور'}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الدور</label>
              <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="editor">محرر</option>
                <option value="admin">مدير</option>
                <option value="viewer">مشاهد</option>
                {me?.role === 'super_admin' && <option value="super_admin">مدير رئيسي</option>}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'var(--color-primary)' }}>
              {editing ? 'حفظ التغييرات' : 'إضافة المستخدم'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-text)' }}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="ابحث عن مستخدم..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full ps-9 pe-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      </div>

      <div className="cms-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لا توجد مستخدمون</p>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'var(--color-surface)' }}>
              <tr className="text-sm text-gray-500 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <th className="px-4 py-3 text-start font-medium">المستخدم</th>
                <th className="px-4 py-3 text-start font-medium">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-start font-medium">الدور</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">تاريخ الانضمام</th>
                <th className="px-4 py-3 text-start font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className={`border-b text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 ${i === users.length - 1 ? 'border-0' : ''}`}
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: ROLE_COLORS[user.role] || 'var(--color-primary)' }}>
                        {user.name?.charAt(0)}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{user.name}</span>
                      {user.id === me?.id && <span className="text-xs text-gray-400">(أنت)</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ background: ROLE_COLORS[user.role] || '#6b7280' }}>
                      {ROLES[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.is_active ? 'badge-published' : 'badge-draft'}`}>
                      {user.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString('ar')}
                  </td>
                  <td className="px-4 py-3">
                    {user.id !== me?.id && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(user)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => del(user.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
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
