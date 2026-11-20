'use client';
import { useState, useMemo } from 'react';
import { mediaApi } from '@/lib/api';
import { toast } from 'sonner';
import { Youtube, Upload, X, Film, Link2, Loader2, CheckCircle2 } from 'lucide-react';

export interface VideoValue {
  video_url: string;
  video_type: 'youtube' | 'vimeo' | 'file' | 'other';
  video_thumbnail?: string;
}

interface Props {
  value: VideoValue;
  onChange: (v: VideoValue) => void;
  label?: string;
  folder?: string;
}

const YT_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

/** استخراج معرف يوتيوب من أي صيغة رابط */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(YT_RE);
  return m ? m[1] : null;
}

/** بناء كل بيانات الفيديو من رابط واحد */
export function parseVideoUrl(url: string): VideoValue {
  const clean = (url || '').trim();
  if (!clean) return { video_url: '', video_type: 'youtube' };
  const yt = getYouTubeId(clean);
  if (yt) {
    return {
      video_url: clean,
      video_type: 'youtube',
      video_thumbnail: `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg`,
    };
  }
  if (VIMEO_RE.test(clean)) return { video_url: clean, video_type: 'vimeo' };
  if (/\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(clean)) return { video_url: clean, video_type: 'file' };
  return { video_url: clean, video_type: 'other' };
}

/** رابط التضمين الجاهز */
export function getEmbedUrl(video: VideoValue): string | null {
  const yt = getYouTubeId(video.video_url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1`;
  const vm = video.video_url.match(VIMEO_RE);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?title=0&byline=0`;
  return null;
}

export function VideoField({ value, onChange, label = 'الفيديو', folder = '/videos' }: Props) {
  const [tab, setTab] = useState<'url' | 'upload'>(value.video_type === 'file' ? 'upload' : 'url');
  const [urlInput, setUrlInput] = useState(value.video_url || '');
  const [uploading, setUploading] = useState(false);

  const embedUrl = useMemo(() => getEmbedUrl(value), [value]);

  const applyUrl = () => {
    const parsed = parseVideoUrl(urlInput);
    onChange(parsed);
    if (parsed.video_url) {
      toast.success(
        parsed.video_type === 'youtube' ? 'تم التعرف على فيديو يوتيوب ✅'
          : parsed.video_type === 'vimeo' ? 'تم التعرف على فيديو فيميو ✅'
          : parsed.video_type === 'file' ? 'تم ربط ملف الفيديو ✅'
          : 'تم حفظ الرابط'
      );
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const { data } = await mediaApi.upload(fd);
      onChange({ video_url: data.media.file_url, video_type: 'file' });
      setUrlInput(data.media.file_url);
      toast.success('تم رفع الفيديو بنجاح');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'فشل رفع الفيديو (الحد 100 ميجابايت)');
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    onChange({ video_url: '', video_type: 'youtube' });
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Film className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          {label}
        </h3>
        {value.video_url && (
          <button type="button" onClick={clear} className="text-xs text-red-500 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> إزالة
          </button>
        )}
      </div>

      <div className="flex p-1 rounded-xl gap-1" style={{ background: 'rgba(0,0,0,0.04)' }}>
        {[
          { key: 'url' as const, label: 'رابط يوتيوب / فيميو', icon: Youtube },
          { key: 'upload' as const, label: 'رفع من الجهاز', icon: Upload },
        ].map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t.key ? 'var(--color-surface)' : 'transparent',
              color: tab === t.key ? 'var(--color-primary)' : '#6b7280',
              boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
            <input
              type="url"
              dir="ltr"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onBlur={applyUrl}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyUrl(); } }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pr-9 pl-3 py-2.5 border rounded-lg text-sm text-left"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }}
            />
          </div>
          <button type="button" onClick={applyUrl}
            className="px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
            style={{ background: 'var(--color-primary)' }}>
            تطبيق
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 py-7 border-2 border-dashed rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
          style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
          <input type="file" accept="video/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.currentTarget.value = ''; }} />
          {uploading
            ? <><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} /><span className="text-xs text-gray-500">جارٍ الرفع...</span></>
            : <><Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>اختر ملف فيديو من جهازك</span>
              <span className="text-xs text-gray-400">MP4, WEBM, MOV — حتى 100 ميجابايت</span></>}
        </label>
      )}

      {value.video_url && (
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {(value.video_type === 'youtube' || value.video_type === 'vimeo') && embedUrl ? (
            <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
              <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          ) : /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(value.video_url) ? (
            <video src={value.video_url} controls className="w-full" style={{ aspectRatio: '16 / 9', background: '#000' }} />
          ) : (
            <a href={value.video_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
              <Link2 className="w-4 h-4" /> فتح رابط الفيديو
            </a>
          )}
          <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-gray-500">
              {value.video_type === 'youtube' ? 'يوتيوب' : value.video_type === 'vimeo' ? 'فيميو' : value.video_type === 'file' ? 'ملف مرفوع' : 'رابط خارجي'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
