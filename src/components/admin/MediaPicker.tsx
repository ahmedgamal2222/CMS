'use client';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { mediaApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Search, Upload, X, Check, Image as ImageIcon,
  RefreshCw, Folder, Link2
} from 'lucide-react';

interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
  title?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaPicker({ onSelect, onClose, title = 'اختر صورة' }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'library' | 'upload' | 'url'>('library');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await mediaApi.list({ search, folder: 'all' });
      setMedia((data.media || []).filter((m: MediaItem) => m.mime_type?.startsWith('image/')));
    } catch {
      toast.error('فشل تحميل الوسائط');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    const file = accepted[0];
    // Show local preview first
    const localUrl = URL.createObjectURL(file);
    setPreviewFile({ file, url: localUrl });
  }, []);

  const confirmUpload = async () => {
    if (!previewFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', previewFile.file);
      formData.append('folder', '/uploads');
      const { data } = await mediaApi.upload(formData);
      toast.success(`تم رفع ${previewFile.file.name} على R2`);
      URL.revokeObjectURL(previewFile.url);
      onSelect(data.media.file_url);
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل الرفع');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const confirm = () => {
    if (selected) { onSelect(selected); onClose(); }
  };

  const confirmUrl = () => {
    if (urlInput.trim()) { onSelect(urlInput.trim()); onClose(); }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ background: 'var(--color-surface)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0 px-5" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {[
            { id: 'library', label: 'مكتبة الوسائط', icon: ImageIcon },
            { id: 'upload', label: 'رفع صورة', icon: Upload },
            { id: 'url', label: 'رابط خارجي', icon: Link2 },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? '' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              style={tab === t.id ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Library tab */}
          {tab === 'library' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث في الصور..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 border rounded-xl text-sm"
                    style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                  />
                </div>
                <button onClick={load} className="p-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : media.length === 0 ? (
                <div className="py-12 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">لا توجد صور في المكتبة</p>
                  <p className="text-sm text-gray-400 mt-1">ارفع صورة أو أضف رابطاً خارجياً</p>
                  <button onClick={() => setTab('upload')}
                    className="mt-3 text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
                    رفع صورة الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {media.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item.file_url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-3 transition-all group ${selected === item.file_url ? 'ring-3 shadow-lg' : 'border-transparent hover:border-gray-300'}`}
                      style={selected === item.file_url ? { outline: `3px solid var(--color-primary)`, outlineOffset: '2px' } : {}}>
                      <img
                        src={item.file_url}
                        alt={item.file_name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = ''; }}
                      />
                      {selected === item.file_url && (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: 'rgba(99,102,241,0.3)' }}>
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                            <Check className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{item.file_name}</p>
                        <p className="text-white/60 text-xs">{formatSize(item.file_size)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="p-5 space-y-4">
              {previewFile ? (
                /* Preview before upload */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-dashed"
                    style={{ borderColor: 'var(--color-primary)' }}>
                    <img src={previewFile.url} alt="معاينة"
                      className="w-full max-h-64 object-contain bg-gray-50" />
                    <div className="absolute top-2 end-2">
                      <button onClick={() => { URL.revokeObjectURL(previewFile.url); setPreviewFile(null); }}
                        className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-red-50 text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{previewFile.file.name}</p>
                      <p className="text-xs text-gray-400">{formatSize(previewFile.file.size)}</p>
                    </div>
                  </div>
                  <button onClick={confirmUpload} disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
                    style={{ background: 'var(--color-primary)' }}>
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-white" />
                        جاري الرفع على R2...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        رفع على R2 وتأكيد
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Drop zone */
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all`}
                  style={{
                    borderColor: isDragActive ? 'var(--color-primary)' : 'rgba(0,0,0,0.15)',
                    background: isDragActive ? 'rgba(99,102,241,0.04)' : undefined
                  }}>
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <Upload className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                        {isDragActive ? 'أفلت الصورة هنا...' : 'اسحب وأفلت الصورة هنا'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">أو اضغط لاختيار ملف — ستظهر معاينة قبل الرفع</p>
                      <p className="text-xs text-gray-300 mt-2">PNG, JPG, GIF, WebP — حتى 10 ميجابايت</p>
                    </div>
                    <button type="button"
                      className="px-6 py-2.5 rounded-xl text-white font-medium text-sm"
                      style={{ background: 'var(--color-primary)' }}>
                      اختر ملفاً
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL tab */}
          {tab === 'url' && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  رابط الصورة الخارجي
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                  className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono"
                  style={{ borderColor: 'rgba(0,0,0,0.15)' }}
                />
              </div>
              {urlInput && (
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <img src={urlInput} alt="preview" className="w-full h-40 object-cover"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {tab === 'library' && (
            <button onClick={confirm} disabled={!selected}
              className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
              style={{ background: 'var(--color-primary)' }}>
              <Check className="w-4 h-4" />
              اختيار الصورة
            </button>
          )}
          {tab === 'url' && (
            <button onClick={confirmUrl} disabled={!urlInput.trim()}
              className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-white font-medium text-sm hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--color-primary)' }}>
              <Check className="w-4 h-4" />
              استخدام الرابط
            </button>
          )}
          <button onClick={onClose}
            className="px-5 py-2.5 border-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'var(--color-text)' }}>
            إلغاء
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
