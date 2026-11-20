'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sectionsApi } from '@/lib/api';
import { toast } from 'sonner';
import { X, Loader2, Check, Sparkles, Layers } from 'lucide-react';

export interface TemplateSection {
  type: string;
  title: string;
  content: any;
}

export interface TemplateDef {
  key: string;
  name: string;
  desc: string;
  gradient: string;
  sections: TemplateSection[];
}

const HERO = (title: string, subtitle: string, description: string) => ({
  title, subtitle, description,
  image: '', button_text: 'اعرف أكثر', button_url: '#about',
  button2_text: 'تواصل معنا', button2_url: '#contact',
  layout: 'center', overlay: 'rgba(0,0,0,0.45)',
});

export const TEMPLATES: TemplateDef[] = [
  {
    key: 'association',
    name: 'صفحة جمعية / مؤسسة',
    desc: 'هيرو + إحصائيات + مميزات + من نحن + خدمات + فيديو + معرض + دعوة + تواصل',
    gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    sections: [
      { type: 'hero', title: 'Hero / رئيسي', content: HERO('جمعية حضارة', 'نصنع الأثر معًا', 'نعمل على تمكين المجتمع عبر برامج ومبادرات نوعية تساهم في بناء الإنسان وتنمية المكان.') },
      { type: 'stats', title: 'Stats / إحصائيات', content: { title: 'أرقام نفخر بها', subtitle: '', items: [ { value: '12K+', label: 'مستفيد', icon: 'users' }, { value: '48', label: 'برنامج', icon: 'check-circle' }, { value: '120+', label: 'متطوع', icon: 'star' }, { value: '8', label: 'سنوات عطاء', icon: 'calendar' } ] } },
      { type: 'features', title: 'Features / مميزات', content: { title: 'لماذا نحن؟', subtitle: 'قيمنا ومبادئنا', columns: 3, items: [ { icon: 'shield', title: 'شفافية كاملة', description: 'تقارير مالية وبرامجية معلنة لكل مانح ومستفيد.' }, { icon: 'zap', title: 'أثر قابل للقياس', description: 'نقيس نتائج كل برنامج بمؤشرات واضحة.' }, { icon: 'users', title: 'شراكات مجتمعية', description: 'نعمل مع جهات محلية لتحقيق استدامة الأثر.' } ] } },
      { type: 'about', title: 'About / من نحن', content: { title: 'من نحن', subtitle: 'تعرّف علينا', content: 'جمعية حضارة مؤسسة غير ربحية تعمل على تنمية المجتمع من خلال برامج تعليمية وتنموية وإنسانية، بشراكة فاعلة مع الجهات والأفراد.', image: '', button_text: 'تعرف على برامجنا', button_url: '#services', layout: 'image-right' } },
      { type: 'services', title: 'Services / خدمات', content: { title: 'برامجنا', subtitle: 'ما نقدمه', columns: 3, items: [ { icon: 'briefcase', title: 'التمكين المهني', description: 'تدريب وتأهيل للباحثين عن عمل.', url: '#' }, { icon: 'globe', title: 'التعليم والمعرفة', description: 'برامج تعليمية للطلاب والأسر.', url: '#' }, { icon: 'bar-chart', title: 'التنمية الاقتصادية', description: 'دعم المشاريع الصغيرة والأسر المنتجة.', url: '#' } ] } },
      { type: 'video', title: 'Video / فيديو', content: { title: 'شاهد أثرنا', subtitle: 'قصص من الميدان', video_url: '', video_type: 'youtube', video_thumbnail: '' } },
      { type: 'gallery', title: 'Gallery / معرض', content: { title: 'من أعمالنا', subtitle: 'لقطات من الميدان', columns: 3, images: [] } },
      { type: 'cta', title: 'CTA / دعوة', content: { title: 'كن جزءًا من الأثر', subtitle: 'انضم إلينا كمتطوع أو داعم، فكل مساهمة تصنع فرقًا.', button_text: 'تبرع الآن', button_url: '#contact', button2_text: 'تطوّع معنا', button2_url: '#contact', background: 'primary' } },
      { type: 'contact', title: 'Contact / تواصل', content: { title: 'تواصل معنا', subtitle: 'نحن هنا لخدمتك', show_form: true, address: '', phone: '', email: '', map_embed: '' } },
    ],
  },
  {
    key: 'service-landing',
    name: 'صفحة هبوط خدمة',
    desc: 'هيرو + مميزات + خدمات + آراء + دعوة',
    gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    sections: [
      { type: 'hero', title: 'Hero / رئيسي', content: HERO('حلول احترافية لنمو عملك', 'سرعة • جودة • احترافية', 'نقدّم خدمات متكاملة تساعدك على إطلاق مشروعك والوصول إلى عملائك بشكل احترافي.') },
      { type: 'features', title: 'Features / مميزات', content: { title: 'ما يميزنا', subtitle: 'لماذا يختارنا العملاء', columns: 3, items: [ { icon: 'zap', title: 'تنفيذ سريع', description: 'تسليم في الوقت المحدد دون تنازل عن الجودة.' }, { icon: 'shield', title: 'ضمان الجودة', description: 'مراجعة دقيقة لكل مخرج قبل التسليم.' }, { icon: 'headphones', title: 'دعم متواصل', description: 'فريق دعم متاح للإجابة على استفساراتك.' } ] } },
      { type: 'services', title: 'Services / خدمات', content: { title: 'خدماتنا', subtitle: 'اختر ما يناسبك', columns: 3, items: [ { icon: 'briefcase', title: 'الاستشارات', description: 'تحليل الوضع ووضع خطة عمل.', url: '#' }, { icon: 'globe', title: 'التنفيذ', description: 'تنفيذ احترافي بفريق متخصص.', url: '#' }, { icon: 'bar-chart', title: 'المتابعة', description: 'تقارير دورية وقياس للنتائج.', url: '#' } ] } },
      { type: 'testimonials', title: 'Testimonials / آراء', content: { title: 'ماذا يقول عملاؤنا', subtitle: '', items: [ { name: 'أحمد محمد', role: 'مدير تنفيذي', avatar: '', text: 'تجربة احترافية من البداية للنهاية، النتائج تجاوزت التوقعات.' }, { name: 'سارة أحمد', role: 'صاحبة مشروع', avatar: '', text: 'فريق متعاون وسريع، أنصح بالتعامل معهم بقوة.' } ] } },
      { type: 'cta', title: 'CTA / دعوة', content: { title: 'جاهز للبدء؟', subtitle: 'احصل على استشارة مجانية اليوم', button_text: 'اطلب استشارة', button_url: '#contact', button2_text: '', button2_url: '', background: 'primary' } },
    ],
  },
  {
    key: 'about-page',
    name: 'من نحن',
    desc: 'هيرو مختصر + من نحن + إحصائيات + آراء + دعوة',
    gradient: 'linear-gradient(135deg,#10b981,#0ea5e9)',
    sections: [
      { type: 'hero', title: 'Hero / رئيسي', content: { ...HERO('من نحن', 'قصتنا ورؤيتنا', 'رحلة عطاء بدأت بفكرة، وكبرت بثقة المجتمع.'), button2_text: '' } },
      { type: 'about', title: 'About / من نحن', content: { title: 'قصتنا', subtitle: 'البداية', content: 'انطلقنا برؤية واضحة: أن نكون جزءًا من الحل. ومنذ ذلك الحين نعمل على برامج نوعية تخدم الإنسان أولًا.', image: '', button_text: '', button_url: '', layout: 'image-left' } },
      { type: 'stats', title: 'Stats / إحصائيات', content: { title: '', subtitle: '', items: [ { value: '12K+', label: 'مستفيد', icon: 'users' }, { value: '48', label: 'برنامج', icon: 'check-circle' }, { value: '120+', label: 'متطوع', icon: 'star' }, { value: '8', label: 'سنوات', icon: 'calendar' } ] } },
      { type: 'testimonials', title: 'Testimonials / آراء', content: { title: 'قالوا عنا', subtitle: '', items: [ { name: 'خالد علي', role: 'شريك', avatar: '', text: 'شراكة مثمرة، وفريق يعمل بإخلاص.' } ] } },
      { type: 'cta', title: 'CTA / دعوة', content: { title: 'تواصل معنا', subtitle: 'يسعدنا استقبال استفساراتك', button_text: 'اتصل بنا', button_url: '#contact', button2_text: '', button2_url: '', background: 'primary' } },
    ],
  },
  {
    key: 'contact-page',
    name: 'تواصل معنا',
    desc: 'هيرو + نموذج تواصل + فيديو',
    gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    sections: [
      { type: 'hero', title: 'Hero / رئيسي', content: { ...HERO('تواصل معنا', 'نسمعك دائمًا', 'أرسل استفسارك وسنعاود التواصل معك في أقرب وقت.'), button_text: '', button2_text: '' } },
      { type: 'contact', title: 'Contact / تواصل', content: { title: 'بيانات التواصل', subtitle: 'يسعدنا خدمتك', show_form: true, address: '', phone: '', email: '', map_embed: '' } },
      { type: 'video', title: 'Video / فيديو', content: { title: 'تعرف علينا في دقيقة', subtitle: '', video_url: '', video_type: 'youtube', video_thumbnail: '' } },
    ],
  },
];
export function TemplateGallery({ pageId, onApplied, onClose, existingCount = 0 }: {
  pageId: string;
  onApplied: () => void;
  onClose: () => void;
  existingCount?: number;
}) {
  const [applying, setApplying] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const pageIsUsable = !!pageId && pageId !== 'new';

  const apply = async (tpl: TemplateDef) => {
    if (!pageIsUsable) {
      toast.error('احفظ الصفحة أولاً (زر «حفظ») ثم أعد فتح القوالب');
      return;
    }
    if (existingCount > 0 && !confirm(`الصفحة تحتوي ${existingCount} قسمًا. ستُضاف أقسام القالب بعدها. متابعة؟`)) return;

    setApplying(tpl.key);
    let created = 0;
    const failed: { type: string; error: string }[] = [];

    for (const s of tpl.sections) {
      try {
        await sectionsApi.create(pageId, { type: s.type, title: s.title, content: s.content });
        created++;
      } catch (e: any) {
        failed.push({ type: s.type, error: e?.response?.data?.error || e?.message || 'خطأ غير معروف' });
      }
    }

    if (created > 0) onApplied();

    if (failed.length === 0) {
      toast.success(`تم تطبيق «${tpl.name}» بنجاح — ${created} أقسام`);
      onClose();
    } else if (created === 0) {
      toast.error(failed[0].error, { duration: 9000 });
    } else {
      const types = Array.from(new Set(failed.map(f => f.type))).join('، ');
      toast.warning(`أُضيف ${created} قسمًا، وفشل ${failed.length} (${types})`, { duration: 9000 });
      onClose();
    }
    setApplying(null);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>قوالب جاهزة</h3>
              <p className="text-xs text-gray-400">اختر قالبًا كاملًا وأضفه لصفحتك بضغطة واحدة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!pageIsUsable && (
          <div className="mx-5 mt-4 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.14)', color: '#b45309' }}>
            هذه الصفحة غير محفوظة بعد — اضغط «حفظ» أعلى الصفحة ثم أعد فتح القوالب.
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {TEMPLATES.map(tpl => {
            const isApplying = applying === tpl.key;
            return (
              <div key={tpl.key}
                className="rounded-2xl border flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="h-28 relative flex items-center justify-center rounded-t-2xl overflow-hidden"
                  style={{ background: tpl.gradient }}>
                  <Sparkles className="w-9 h-9 text-white/85" />
                  <span className="absolute top-2 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                    style={{ background: 'rgba(0,0,0,0.28)' }}>
                    {tpl.sections.length} أقسام
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{tpl.name}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{tpl.desc}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Array.from(new Set(tpl.sections.map(s => s.type))).slice(0, 6).map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: 'rgba(99,102,241,0.10)', color: 'var(--color-primary)' }}>{t}</span>
                    ))}
                  </div>
                  <button onClick={() => apply(tpl)} disabled={!!applying || !pageIsUsable}
                    className="mt-auto w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 hover:opacity-95 transition-opacity"
                    style={{ background: 'var(--color-primary)' }}>
                    {isApplying
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التطبيق...</>
                      : <><Check className="w-4 h-4" /> استخدم القالب</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t text-xs text-gray-400 flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          نصيحة: بعد التطبيق عدّل النصوص والصور من زر «تعديل» بجانب كل قسم، وشاهد النتيجة في «معاينة مباشرة».
        </div>
      </div>
    </div>,
    document.body
  );
}

