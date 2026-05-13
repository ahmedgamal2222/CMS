import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['ar', 'en', 'fr', 'de', 'es', 'tr'];
const DEFAULT_LOCALE = 'ar';

export default function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;

  const response = NextResponse.next();
  response.headers.set('x-next-intl-locale', locale);
  if (!cookieLocale) {
    response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
