'use client';
import { useState, useEffect } from 'react';
import { mediaApi } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, Trash2, Search, Image as ImageIcon, FileText, Film, Music } from 'lucide-react';
import { MediaUploader } from '@/components/admin/MediaUploader';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MediaTypeIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (mime.startsWith('video/')) return <Film className="w-5 h-5 text-purple-500" />;
  if (mime.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
  return <FileText className="w-5 h-5 text-gray-500" />;
}

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await mediaApi.list({ search, folder: 'all' });
      setMedia(data.media);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const del = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    await mediaApi.delete(id);
    toast.success('تم حذف الملف');
    load();
  };

  const delSelected = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${selected.length} ملف؟`)) return;
    await Promise.all(selected.map(id => mediaApi.delete(id)));
    toast.success('تم حذف الملفات المحددة');
    setSelected([]);
    load();
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text)' }}>
          الوسائط <span className="text-gray-400 text-base font-normal">({total})</span>
        </h1>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={delSelected}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-red-500 hover:opacity-90">
              <Trash2 className="w-4 h-4" /> حذف ({selected.length})
            </button>
          )}
          <button onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}>
            <Upload className="w-4 h-4" /> رفع ملفات
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="cms-card">
          <MediaUploader onUploaded={() => load()} />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="ابحث في الوسائط..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm ps-9 pe-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="cms-card text-center py-16">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">لا توجد وسائط مرفوعة</p>
          <button onClick={() => setShowUpload(true)} className="mt-3 text-sm" style={{ color: 'var(--color-primary)' }}>
            ارفع أول ملف
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selected.includes(item.id) ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
              style={selected.includes(item.id) ? { borderColor: 'var(--color-primary)' } : {}}
              onClick={() => setSelected(prev =>
                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
              )}
            >
              {item.mime_type.startsWith('image/') ? (
                <img src={item.file_url} alt={item.alt_text || item.name}
                  className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <MediaTypeIcon mime={item.mime_type} />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <p className="text-white text-xs truncate">{formatSize(item.file_size)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); del(item.id); }}
                  className="p-1 bg-red-500 rounded text-white hover:bg-red-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {selected.includes(item.id) && (
                <div className="absolute top-1 start-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: 'var(--color-primary)' }}>✓</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
