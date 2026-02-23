/**
 * DirSync — prevents flash of wrong RTL/LTR direction on initial page load.
 *
 * This component injects a tiny inline <script> that runs BEFORE React
 * hydration to set the correct [dir] and [lang] on <html> based on the
 * saved locale in localStorage.
 *
 * Must be rendered inside <head> or at the very top of <body>.
 * Uses dangerouslySetInnerHTML because it is intentionally a synchronous
 * blocking inline script — the only safe way to avoid layout shift.
 */

const LOCALE_STORAGE_KEY = 'shielder_locale';
const RTL_LOCALES = ['ar'];

// Inline script string — runs synchronously before React
const dirSyncScript = `
(function(){
  try {
    var locale = localStorage.getItem('${LOCALE_STORAGE_KEY}') || 'en';
    var rtl = ${JSON.stringify(RTL_LOCALES)}.includes(locale);
    document.documentElement.dir  = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  } catch(e) {}
})();
`.trim();

export function DirSync() {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: dirSyncScript }}
    />
  );
}
