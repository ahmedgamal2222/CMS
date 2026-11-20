'use client';
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Calendar, User, Clock, ArrowRight, Share2, Tag } from 'lucide-react';

function ytId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  return m ? m[1] : null;
}
function vmId(url: string): string | null {
  const m = (url || '').match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return m ? m[1] : null;
}

function fmtDate(d?: string) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return d; }
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.post(params.slug)
      .then(({ data }) => setPost(data.post))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div dir="rtl">
        <PublicNavbar />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>المقال غير موجود</h1>
          <a href="/" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>العودة للرئيسية ←</a>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const url: string = post.video_url || '';
  const yt = ytId(url);
  const vm = vmId(url);
  const isFile = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(url);

  return (
    <div dir="rtl" style={{ background: 'var(--color-background)', color: 'var(--color-text)' }}>
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-5 pt-28 pb-20">
        <a href="/" className="inline-flex items-center gap-2 text-sm mb-6 opacity-70 hover:opacity-100"
          style={{ color: 'var(--color-primary)' }}>
          <ArrowRight className="w-4 h-4" /> العودة
        </a>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm opacity-70">
            {post.author_name && <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author_name}</span>}
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{fmtDate(post.published_at || post.created_at)}</span>
            {post.reading_time > 0 && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.reading_time} دقيقة قراءة</span>}
            {post.category_name && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: 'var(--color-primary)' }}>{post.category_name}</span>
            )}
          </div>
        </header>

        {post.featured_image && (
          <img src={post.featured_image} alt={post.title}
            className="w-full rounded-2xl shadow-lg object-cover mb-8" style={{ maxHeight: 460 }} />
        )}

        {/* فيديو المقال */}
        {url && (
          <div className="mb-9">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '16 / 9', background: '#000' }}>
              {yt ? (
                <iframe src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1`}
                  className="absolute inset-0 w-full h-full" allowFullScreen
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              ) : vm ? (
                <iframe src={`https://player.vimeo.com/video/${vm}?title=0&byline=0`}
                  className="absolute inset-0 w-full h-full" allowFullScreen
                  title={post.title} allow="autoplay; fullscreen; picture-in-picture" />
              ) : isFile ? (
                <video src={url} controls poster={post.video_thumbnail || post.featured_image || undefined}
                  className="absolute inset-0 w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl text-white text-sm font-semibold"
                    style={{ background: 'var(--color-primary)' }}>مشاهدة الفيديو</a>
                </div>
              )}
            </div>
            <p className="text-xs opacity-60 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
              فيديو المقال
            </p>
          </div>
        )}

        {post.excerpt && (
          <p className="text-lg leading-relaxed font-medium mb-6 pb-6 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.08)', opacity: 0.85 }}>{post.excerpt}</p>
        )}

        <article
          className="leading-loose text-[17px]"
          style={{ color: 'var(--color-text)' }}
          dangerouslySetInnerHTML={{ __html: post.content || '' }} />

        {/* الوسوم والمشاركة */}
        <div className="mt-12 pt-6 border-t flex flex-wrap items-center justify-between gap-4"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <div className="flex flex-wrap items-center gap-2">
            {(post.tags || []).map((t: any) => (
              <span key={t.id || t.name}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(99,102,241,0.10)', color: 'var(--color-primary)' }}>
                <Tag className="w-3 h-3" /> {t.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60 flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> مشاركة</span>
            {[
              { label: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`, color: '#111827' },
              { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(post.title)}`, color: '#25D366' },
              { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=`, color: '#1877F2' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                style={{ background: s.color }}>{s.label}</a>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
