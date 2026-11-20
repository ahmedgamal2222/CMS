'use client';
import {
  Sparkles, Shield, Zap, Briefcase, Globe, BarChart3, Users,
  Calendar, CheckCircle2, Headphones, Star, Play, MapPin, Phone, Mail,
} from 'lucide-react';
import { getEmbedUrl, type VideoValue } from './VideoField';

export interface PreviewSection {
  id?: string;
  type: string;
  title?: string | null;
  content: any;
  is_active?: number;
}

const ICONS: Record<string, any> = {
  star: Star, shield: Shield, zap: Zap, briefcase: Briefcase, globe: Globe,
  'bar-chart': BarChart3, users: Users, calendar: Calendar,
  'check-circle': CheckCircle2, headphones: Headphones, sparkles: Sparkles,
};

function Icon({ name }: { name?: string }) {
  const Cmp = ICONS[name || 'star'] || Star;
  return <Cmp className="w-6 h-6" />;
}

function Heading({ title, subtitle }: { title?: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <div className="text-center mb-10 max-w-2xl mx-auto">
      {subtitle && (
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-primary, #6366f1)' }}>{subtitle}</p>
      )}
      {title && (
        <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text, #111827)' }}>{title}</h2>
      )}
      <div className="w-16 h-1 rounded-full mx-auto mt-4"
        style={{ background: 'linear-gradient(90deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }} />
    </div>
  );
}

function Hero({ c }: { c: any }) {
  const hasImage = !!c.image;
  return (
    <section className="relative overflow-hidden" style={{ minHeight: 420 }}>
      {hasImage ? (
        <>
          <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: c.overlay || 'rgba(0,0,0,0.45)' }} />
        </>
      ) : (
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }} />
      )}
      <div className={`relative px-6 py-20 flex flex-col justify-center ${c.layout === 'right' ? 'items-end text-right' : c.layout === 'left' ? 'items-start text-left' : 'items-center text-center'}`}
        style={{ minHeight: 420 }}>
        {c.subtitle && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 text-white/90"
            style={{ background: 'rgba(255,255,255,0.18)' }}>{c.subtitle}</span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-3xl">{c.title}</h1>
        {c.description && <p className="text-white/85 max-w-xl mb-6 leading-relaxed">{c.description}</p>}
        <div className="flex flex-wrap gap-3 justify-center">
          {c.button_text && (
            <span className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
              style={{ background: 'var(--color-primary, #6366f1)' }}>{c.button_text}</span>
          )}
          {c.button2_text && (
            <span className="px-6 py-3 rounded-xl text-sm font-semibold border-2 border-white/70 text-white">{c.button2_text}</span>
          )}
        </div>
      </div>
    </section>
  );
}

function Slider({ c }: { c: any }) {
  const slides = c.slides || [];
  return (
    <section className="px-6 py-10" style={{ background: 'var(--color-surface, #f9fafb)' }}>
      <div className="max-w-5xl mx-auto space-y-4">
        {slides.map((s: any, i: number) => (
          <div key={i} className="relative rounded-2xl overflow-hidden" style={{ minHeight: 220 }}>
            {s.image
              ? <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              : <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg,#6366f1,#8b5cf6)' }} />}
            <div className="absolute inset-0" style={{ background: s.overlay || 'rgba(0,0,0,0.4)' }} />
            <div className="relative px-8 py-12 flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{s.title}</h3>
              {s.description && <p className="text-white/85 text-sm max-w-lg">{s.description}</p>}
              {s.button_text && (
                <span className="mt-4 px-5 py-2 rounded-lg bg-white text-sm font-semibold"
                  style={{ color: 'var(--color-primary)' }}>{s.button_text}</span>
              )}
            </div>
          </div>
        ))}
        {c.show_dots && (
          <div className="flex justify-center gap-1.5 pt-1">
            {slides.map((_: any, i: number) => (
              <span key={i} className="w-2 h-2 rounded-full"
                style={{ background: i === 0 ? 'var(--color-primary)' : 'rgba(0,0,0,0.15)' }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Grid({ c, withUrl }: { c: any; withUrl?: boolean }) {
  const items = c.items || [];
  const cols = c.columns === 2 ? 'md:grid-cols-2' : c.columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  return (
    <section className="px-6 py-16" style={{ background: 'var(--color-background, #fff)' }}>
      <div className="max-w-6xl mx-auto">
        <Heading title={c.title} subtitle={c.subtitle} />
        <div className={`grid grid-cols-1 ${cols} gap-5`}>
          {items.map((it: any, i: number) => (
            <div key={i} className="group p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ borderColor: 'rgba(0,0,0,0.07)', background: 'var(--color-surface, #fff)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.10)', color: 'var(--color-primary, #6366f1)' }}>
                <Icon name={it.icon} />
              </div>
              <h3 className="font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>{it.title}</h3>
              <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--color-text)' }}>{it.description}</p>
              {withUrl && it.url && (
                <span className="inline-block mt-3 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>اعرف أكثر ←</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About({ c }: { c: any }) {
  const reverse = c.layout === 'image-left';
  return (
    <section className="px-6 py-16" style={{ background: 'var(--color-surface, #f9fafb)' }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className={reverse ? 'md:order-2' : ''}>
          {c.subtitle && <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>{c.subtitle}</p>}
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{c.title}</h2>
          <p className="leading-relaxed opacity-75 mb-5 whitespace-pre-line" style={{ color: 'var(--color-text)' }}>{c.content}</p>
          {c.button_text && (
            <span className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'var(--color-primary)' }}>{c.button_text}</span>
          )}
        </div>
        <div className={reverse ? 'md:order-1' : ''}>
          {c.image
            ? <img src={c.image} alt="" className="w-full rounded-2xl shadow-lg object-cover" style={{ maxHeight: 380 }} />
            : <div className="w-full rounded-2xl flex items-center justify-center"
                style={{ minHeight: 280, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                <Sparkles className="w-14 h-14 text-white/80" />
              </div>}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ c }: { c: any }) {
  const items = c.items || [];
  return (
    <section className="px-6 py-16" style={{ background: 'var(--color-background, #fff)' }}>
      <div className="max-w-6xl mx-auto">
        <Heading title={c.title} subtitle={c.subtitle} />
        <div className="grid md:grid-cols-2 gap-5">
          {items.map((it: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl border"
              style={{ borderColor: 'rgba(0,0,0,0.07)', background: 'var(--color-surface)' }}>
              <Star className="w-5 h-5 mb-3" style={{ color: 'var(--color-accent, #f59e0b)' }} />
              <p className="text-sm leading-relaxed mb-4 opacity-80" style={{ color: 'var(--color-text)' }}>&ldquo;{it.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                {it.avatar
                  ? <img src={it.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: 'var(--color-primary)' }}>{(it.name || '؟').charAt(0)}</div>}
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{it.name}</p>
                  <p className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>{it.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function Gallery({ c }: { c: any }) {
  const images = c.images || [];
  const cols = c.columns === 2 ? 'md:grid-cols-2' : c.columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  return (
    <section className="px-6 py-16" style={{ background: 'var(--color-surface, #f9fafb)' }}>
      <div className="max-w-6xl mx-auto">
        <Heading title={c.title} subtitle={c.subtitle} />
        {images.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed flex items-center justify-center py-16 text-sm opacity-50"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'var(--color-text)' }}>
            لا توجد صور في المعرض بعد
          </div>
        ) : (
          <div className={`grid grid-cols-2 ${cols} gap-3`}>
            {images.map((img: any, i: number) => {
              const src = typeof img === 'string' ? img : img?.url || img?.image || '';
              return (
                <div key={i} className="relative overflow-hidden rounded-xl group" style={{ aspectRatio: '4 / 3' }}>
                  <img src={src} alt={typeof img === 'object' ? img?.alt || '' : ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Stats({ c }: { c: any }) {
  const items = c.items || [];
  return (
    <section className="px-6 py-14" style={{ background: 'linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }}>
      <div className="max-w-6xl mx-auto">
        {c.title && <h2 className="text-center text-2xl font-bold text-white mb-10">{c.title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it: any, i: number) => (
            <div key={i} className="text-center text-white">
              <div className="flex justify-center mb-2 opacity-90"><Icon name={it.icon} /></div>
              <p className="text-3xl font-bold">{it.value}</p>
              <p className="text-sm opacity-80 mt-1">{it.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ c }: { c: any }) {
  return (
    <section className="px-6 py-16">
      <div className="max-w-4xl mx-auto rounded-3xl px-8 py-12 text-center"
        style={{ background: c.background === 'dark' ? '#111827' : 'linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }}>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{c.title}</h2>
        {c.subtitle && <p className="text-white/85 mb-6 max-w-xl mx-auto">{c.subtitle}</p>}
        <div className="flex flex-wrap gap-3 justify-center">
          {c.button_text && <span className="px-6 py-3 rounded-xl bg-white text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{c.button_text}</span>}
          {c.button2_text && <span className="px-6 py-3 rounded-xl border-2 border-white/70 text-white text-sm font-bold">{c.button2_text}</span>}
        </div>
      </div>
    </section>
  );
}

function Contact({ c }: { c: any }) {
  return (
    <section className="px-6 py-16" style={{ background: 'var(--color-background, #fff)' }}>
      <div className="max-w-5xl mx-auto">
        <Heading title={c.title} subtitle={c.subtitle} />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {c.address && <p className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text)' }}><MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />{c.address}</p>}
            {c.phone && <p className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text)' }}><Phone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />{c.phone}</p>}
            {c.email && <p className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text)' }}><Mail className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />{c.email}</p>}
          </div>
          {c.show_form && (
            <div className="space-y-3 p-5 rounded-2xl border" style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'var(--color-surface)' }}>
              {['الاسم', 'البريد الإلكتروني', 'الرسالة'].map(f => (
                <div key={f} className="h-10 rounded-lg border flex items-center px-3 text-xs opacity-50"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', color: 'var(--color-text)' }}>{f}</div>
              ))}
              <div className="h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'var(--color-primary)' }}>إرسال</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function VideoBlock({ c }: { c: any }) {
  const v: VideoValue = {
    video_url: c.video_url || '',
    video_type: c.video_type || 'youtube',
    video_thumbnail: c.video_thumbnail,
  };
  const embed = getEmbedUrl(v);
  return (
    <section className="px-6 py-16" style={{ background: c.background === 'dark' ? '#0b1220' : 'var(--color-surface, #f9fafb)' }}>
      <div className="max-w-4xl mx-auto">
        {c.title && <Heading title={c.title} subtitle={c.subtitle} />}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16 / 9', background: '#000' }}>
          {embed ? (
            <iframe src={embed} className="absolute inset-0 w-full h-full" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : v.video_url ? (
            <video src={v.video_url} controls poster={v.video_thumbnail} className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-3">
              <Play className="w-12 h-12" />
              <span className="text-sm">أضف رابط يوتيوب أو ارفع فيديو من جهازك</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SectionPreview({ section }: { section: PreviewSection }) {
  const c = section.content || {};
  switch (section.type) {
    case 'hero': return <Hero c={c} />;
    case 'slider': return <Slider c={c} />;
    case 'features': return <Grid c={c} />;
    case 'services': return <Grid c={c} withUrl />;
    case 'about': return <About c={c} />;
    case 'testimonials': return <Testimonials c={c} />;
    case 'gallery': return <Gallery c={c} />;
    case 'stats': return <Stats c={c} />;
    case 'cta': return <CTA c={c} />;
    case 'contact': return <Contact c={c} />;
    case 'video': return <VideoBlock c={c} />;
    case 'custom': return <div className="px-6 py-10" dangerouslySetInnerHTML={{ __html: c.html || '' }} />;
    default: return null;
  }
}

export function SectionsPreview({ sections }: { sections: PreviewSection[] }) {
  const active = (sections || []).filter(s => s.is_active !== 0);
  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Sparkles className="w-10 h-10 opacity-30" />
        <p className="text-sm opacity-50">لا توجد أقسام للمعاينة — أضف قسمًا أو اختر قالبًا جاهزًا</p>
      </div>
    );
  }
  return (
    <div>
      {active.map((s, i) => <SectionPreview key={s.id || i} section={s} />)}
    </div>
  );
}

