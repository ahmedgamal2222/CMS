'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export type Section = {
  id: string;
  type: string;
  title: string | null;
  content: any;
  settings: any;
  is_active: number;
  order_index: number;
};

// ─── Slider ───────────────────────────────────────────────────────────────────
function SliderSection({ content, settings }: { content: any; settings: any }) {
  const slides = content?.slides || [];
  const [current, setCurrent] = useState(0);
  const autoplay = content?.autoplay ?? true;
  const interval = content?.interval ?? 5000;
  const showArrows = content?.show_arrows ?? true;
  const showDots = content?.show_dots ?? true;

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [autoplay, interval, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '480px', background: '#0f172a' }}>
      {slides.map((s: any, i: number) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {s.image && (
            <img src={s.image} alt={s.title || ''} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div
            className="absolute inset-0"
            style={{ background: s.overlay || 'rgba(0,0,0,0.5)' }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6 py-20" style={{ minHeight: '480px' }}>
            {s.title && <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 drop-shadow-lg">{s.title}</h2>}
            {s.subtitle && <p className="text-xl md:text-2xl font-medium mb-3 opacity-90">{s.subtitle}</p>}
            {s.description && <p className="max-w-xl text-base opacity-80 mb-8">{s.description}</p>}
            {s.button_text && (
              <a href={s.button_url || '#'}
                className="inline-flex items-center px-7 py-3 rounded-xl font-semibold transition-all hover:scale-105 text-white"
                style={{ background: 'var(--color-primary)' }}>
                {s.button_text}
              </a>
            )}
          </div>
        </div>
      ))}

      {showArrows && slides.length > 1 && (
        <>
          <button onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all backdrop-blur-sm">
            ‹
          </button>
          <button onClick={() => setCurrent(c => (c + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all backdrop-blur-sm">
            ›
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'w-6' : 'bg-white/50'}`}
              style={{ background: i === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ content }: { content: any }) {
  const layout = content?.layout || 'center';
  const alignClass = layout === 'left' ? 'items-start text-start' : layout === 'right' ? 'items-end text-end' : 'items-center text-center';

  return (
    <div className="relative w-full flex flex-col justify-center overflow-hidden" style={{ minHeight: '500px', background: '#0f172a' }}>
      {content?.image && (
        <img src={content.image} alt={content.title || ''} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0" style={{ background: content?.overlay || 'rgba(0,0,0,0.55)' }} />
      <div className={`relative z-10 flex flex-col ${alignClass} px-6 md:px-16 py-20 text-white max-w-5xl mx-auto w-full`}>
        {content?.title && <h1 className="text-5xl md:text-6xl font-heading font-bold mb-5 leading-tight drop-shadow-lg">{content.title}</h1>}
        {content?.subtitle && <p className="text-2xl md:text-3xl font-medium opacity-90 mb-4">{content.subtitle}</p>}
        {content?.description && <p className="text-lg opacity-75 mb-10 max-w-2xl">{content.description}</p>}
        <div className="flex flex-wrap gap-4">
          {content?.button_text && (
            <a href={content.button_url || '#'}
              className="inline-flex items-center px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-105 shadow-xl"
              style={{ background: 'var(--color-primary)' }}>
              {content.button_text}
            </a>
          )}
          {content?.button2_text && (
            <a href={content.button2_url || '#'}
              className="inline-flex items-center px-8 py-3.5 rounded-xl font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all">
              {content.button2_text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Features / Services ──────────────────────────────────────────────────────
function FeaturesSection({ content }: { content: any }) {
  const items = content?.items || [];
  const cols = content?.columns || 3;
  const gridClass = cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader title={content?.title} subtitle={content?.subtitle} />
        <div className={`grid ${gridClass} gap-8`}>
          {items.map((item: any, i: number) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border hover:shadow-lg transition-all"
              style={{ borderColor: 'rgba(0,0,0,0.07)', background: 'var(--color-surface)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white text-2xl font-bold"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                {iconEmoji(item.icon)}
              </div>
              <h3 className="text-lg font-heading font-bold mb-3" style={{ color: 'var(--color-text)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--color-text)' }}>{item.description}</p>
              {item.url && item.url !== '#' && (
                <a href={item.url} className="mt-4 text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                  اعرف أكثر ←
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutSection({ content }: { content: any }) {
  const imageRight = content?.layout !== 'image-left';
  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {!imageRight && content?.image && (
          <div className="w-full md:w-1/2 flex-shrink-0">
            <img src={content.image} alt={content.title || ''} className="w-full rounded-3xl shadow-2xl object-cover" style={{ maxHeight: '400px' }} />
          </div>
        )}
        <div className="flex-1">
          {content?.subtitle && <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary)' }}>{content.subtitle}</p>}
          {content?.title && <h2 className="text-4xl font-heading font-bold mb-6" style={{ color: 'var(--color-text)' }}>{content.title}</h2>}
          {content?.content && <p className="leading-relaxed opacity-80 mb-8" style={{ color: 'var(--color-text)' }}>{content.content}</p>}
          {content?.button_text && (
            <a href={content.button_url || '#'}
              className="inline-flex items-center px-7 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: 'var(--color-primary)' }}>
              {content.button_text}
            </a>
          )}
        </div>
        {imageRight && content?.image && (
          <div className="w-full md:w-1/2 flex-shrink-0">
            <img src={content.image} alt={content.title || ''} className="w-full rounded-3xl shadow-2xl object-cover" style={{ maxHeight: '400px' }} />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection({ content }: { content: any }) {
  const items = content?.items || [];
  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader title={content?.title} subtitle={content?.subtitle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl border hover:shadow-lg transition-all"
              style={{ borderColor: 'rgba(0,0,0,0.07)', background: 'var(--color-surface)' }}>
              <p className="text-sm leading-relaxed mb-6 opacity-80" style={{ color: 'var(--color-text)' }}>"{item.text}"</p>
              <div className="flex items-center gap-3">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                    {item.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.name}</p>
                  <p className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatsSection({ content }: { content: any }) {
  const items = content?.items || [];
  return (
    <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
      <div className="max-w-5xl mx-auto">
        <SectionHeader title={content?.title} subtitle={content?.subtitle} white />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item: any, i: number) => (
            <div key={i} className="text-center text-white">
              <p className="text-4xl font-heading font-bold mb-2">{item.value}</p>
              <p className="text-sm opacity-80">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection({ content }: { content: any }) {
  const isPrimary = content?.background !== 'light';
  return (
    <section className="py-20 px-6 text-center" style={{
      background: isPrimary ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--color-surface)'
    }}>
      <div className="max-w-3xl mx-auto">
        {content?.title && <h2 className={`text-4xl font-heading font-bold mb-4 ${isPrimary ? 'text-white' : ''}`}
          style={!isPrimary ? { color: 'var(--color-text)' } : {}}>{content.title}</h2>}
        {content?.subtitle && <p className={`text-lg mb-10 ${isPrimary ? 'text-white/80' : 'opacity-70'}`}
          style={!isPrimary ? { color: 'var(--color-text)' } : {}}>{content.subtitle}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {content?.button_text && (
            <a href={content.button_url || '#'}
              className="inline-flex items-center px-8 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              style={isPrimary ? { background: 'white', color: 'var(--color-primary)' } : { background: 'var(--color-primary)', color: 'white' }}>
              {content.button_text}
            </a>
          )}
          {content?.button2_text && (
            <a href={content.button2_url || '#'}
              className={`inline-flex items-center px-8 py-3.5 rounded-xl font-semibold border-2 transition-all ${isPrimary ? 'border-white text-white hover:bg-white hover:text-primary' : 'border-primary'}`}
              style={!isPrimary ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}>
              {content.button2_text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function GallerySection({ content }: { content: any }) {
  const images = content?.images || [];
  const cols = content?.columns || 3;
  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3';
  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader title={content?.title} subtitle={content?.subtitle} />
        {images.length > 0 ? (
          <div className={`grid ${gridClass} gap-4`}>
            {images.map((img: any, i: number) => (
              <div key={i} className="overflow-hidden rounded-2xl aspect-square">
                <img src={typeof img === 'string' ? img : img.url} alt={img.alt || ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center opacity-50 py-8" style={{ color: 'var(--color-text)' }}>لا توجد صور بعد</p>
        )}
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactSection({ content }: { content: any }) {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto">
        <SectionHeader title={content?.title} subtitle={content?.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Info */}
          <div className="space-y-5">
            {content?.address && <InfoRow icon="📍" value={content.address} />}
            {content?.phone && <InfoRow icon="📞" value={content.phone} />}
            {content?.email && <InfoRow icon="✉️" value={content.email} />}
            {content?.map_embed && (
              <div className="rounded-2xl overflow-hidden mt-4" style={{ height: '200px' }}>
                <iframe src={content.map_embed} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
              </div>
            )}
          </div>
          {/* Form */}
          {content?.show_form !== false && (
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <input type="text" placeholder="الاسم الكامل" required
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
              <input type="email" placeholder="البريد الإلكتروني" required
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
              <textarea placeholder="الرسالة" rows={5} required
                className="w-full px-4 py-3 rounded-xl border text-sm resize-none"
                style={{ borderColor: 'rgba(0,0,0,0.15)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
              <button type="submit"
                className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: 'var(--color-primary)' }}>
                إرسال الرسالة
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Custom HTML ──────────────────────────────────────────────────────────────
function CustomSection({ content }: { content: any }) {
  if (!content?.html) return null;
  return (
    <section className="py-12 px-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto prose prose-lg" style={{ color: 'var(--color-text)' }}
        dangerouslySetInnerHTML={{ __html: content.html }} />
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, white }: { title?: string; subtitle?: string; white?: boolean }) {
  if (!title && !subtitle) return null;
  return (
    <div className="text-center mb-14">
      {subtitle && (
        <p className="text-sm font-semibold uppercase tracking-widest mb-3"
          style={{ color: white ? 'rgba(255,255,255,0.8)' : 'var(--color-primary)' }}>
          {subtitle}
        </p>
      )}
      {title && (
        <h2 className="text-4xl font-heading font-bold"
          style={{ color: white ? '#fff' : 'var(--color-text)' }}>
          {title}
        </h2>
      )}
    </div>
  );
}

function InfoRow({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl mt-0.5">{icon}</span>
      <p className="text-sm leading-relaxed opacity-80" style={{ color: 'var(--color-text)' }}>{value}</p>
    </div>
  );
}

function iconEmoji(name?: string): string {
  const map: Record<string, string> = {
    star: '⭐', shield: '🛡', zap: '⚡', briefcase: '💼', globe: '🌐', 'bar-chart': '📊',
    heart: '❤️', check: '✅', rocket: '🚀', bolt: '⚡', lock: '🔒', settings: '⚙️',
    phone: '📞', mail: '✉️', map: '🗺', clock: '🕐', users: '👥', award: '🏆',
  };
  return map[name || ''] || '✦';
}

// ─── Main Renderer ────────────────────────────────────────────────────────────
export function LandingSection({ section }: { section: Section }) {
  if (!section.is_active) return null;

  switch (section.type) {
    case 'slider':       return <SliderSection content={section.content} settings={section.settings} />;
    case 'hero':         return <HeroSection content={section.content} />;
    case 'features':     return <FeaturesSection content={section.content} />;
    case 'services':     return <FeaturesSection content={section.content} />;
    case 'about':        return <AboutSection content={section.content} />;
    case 'testimonials': return <TestimonialsSection content={section.content} />;
    case 'stats':        return <StatsSection content={section.content} />;
    case 'cta':          return <CTASection content={section.content} />;
    case 'gallery':      return <GallerySection content={section.content} />;
    case 'contact':      return <ContactSection content={section.content} />;
    case 'custom':       return <CustomSection content={section.content} />;
    default:             return null;
  }
}
