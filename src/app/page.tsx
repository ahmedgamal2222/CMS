import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8" dir="rtl">
      <div
        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white text-3xl font-bold"
        style={{ background: 'linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }}
      >
        CMS
      </div>
      <h1 className="text-4xl font-bold text-center">نظام إدارة المحتوى</h1>
      <p className="text-gray-500 text-center max-w-md">
        منصة متكاملة لإدارة المحتوى الرقمي بكل سهولة واحترافية
      </p>
      <Link
        href="/admin"
        className="px-8 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))' }}
      >
        الدخول إلى لوحة التحكم
      </Link>
    </main>
  );
}
