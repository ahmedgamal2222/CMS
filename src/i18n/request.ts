import { getRequestConfig } from 'next-intl/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || 'ar';
  const lang = locale;

  try {
    // Try to fetch translations from API
    const [common, admin] = await Promise.all([
      fetch(`${API_URL}/public/translations/${lang}/common`).then(r => r.json()),
      fetch(`${API_URL}/public/translations/${lang}/admin`).then(r => r.json()),
    ]);

    return {
      locale: lang,
      messages: { common, admin },
    };
  } catch {
    // Fallback to local messages
    const messages = (await import(`../../messages/${lang}.json`)).default;
    return { locale: lang, messages };
  }
});
