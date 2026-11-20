/* Shared language system for every page.
   Add <script src="lang.js"></script> before </body>.
   The page's own language is read from <html lang="..">.
   Visitors with a different language get an automatic translation (Google Translate). */
(function () {
  var SRC = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  try { var th = localStorage.getItem('theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
  var LANGS = [['bn','বাংলা'],['en','English'],['hi','हिन्दी'],['ur','اردو'],['ar','العربية'],['es','Español'],['fr','Français'],['pt','Português'],['de','Deutsch'],['ru','Русский'],['tr','Türkçe'],['id','Indonesia'],['ms','Melayu'],['zh-CN','中文'],['ja','日本語']];

  function clearCookie() {
    var past = ';expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = 'googtrans=' + past;
    document.cookie = 'googtrans=' + past + ';domain=' + location.hostname;
    document.cookie = 'googtrans=' + past + ';domain=.' + location.hostname;
  }
  function setTarget(l) {
    clearCookie();
    if (l !== SRC) document.cookie = 'googtrans=/' + SRC + '/' + l + ';path=/';
  }
  function detect() {
    try { var s = localStorage.getItem('lang'); if (s) return s; } catch (e) {}
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'bn'];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i]).toLowerCase().indexOf('bn') === 0) return 'bn';
    }
    try { if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Dhaka') return 'bn'; } catch (e) {}
    var f = String(list[0] || 'bn').toLowerCase();
    if (f.indexOf('zh') === 0) return /tw|hk|hant/.test(f) ? 'zh-TW' : 'zh-CN';
    var b = f.slice(0, 2);
    return b === 'he' ? 'iw' : b;
  }

  var want = detect();
  setTarget(want); /* cookie is set BEFORE the translate script loads, so no reload is needed */

  function init() {
    var css = document.createElement('style');
    css.textContent =
      '.goog-te-banner-frame,.goog-te-balloon-frame,#goog-gt-tt,.goog-tooltip{display:none!important}' +
      'body{top:0!important}' +
      '.goog-text-highlight{background:none!important;box-shadow:none!important}' +
      '#gt_el{display:none}' +
      '.lang-pick{font:inherit;font-size:14px;padding:6px 12px;border-radius:999px;border:1px solid #D8D3C4;background:#fff;color:#17233B;cursor:pointer}' +
      '.lang-fixed{position:fixed;right:12px;bottom:12px;z-index:50;box-shadow:0 1px 6px rgba(0,0,0,.18)}' +
      '@media print{.lang-pick,#gt_el{display:none!important}}' +
      '@media (prefers-color-scheme:dark){.lang-pick{background:#16203A;color:#EDE9DF;border-color:#2D3A5C}}' +
      ':root[data-theme="dark"] .lang-pick{background:#16203A;color:#EDE9DF;border-color:#2D3A5C}' +
      ':root[data-theme="light"] .lang-pick{background:#fff;color:#17233B;border-color:#D8D3C4}';
    document.head.appendChild(css);

    var sel = document.createElement('select');
    sel.className = 'lang-pick notranslate noprint';
    sel.setAttribute('translate', 'no');
    sel.setAttribute('aria-label', 'Language');
    var found = false;
    LANGS.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p[0]; o.textContent = p[1];
      if (p[0] === want) { o.selected = true; found = true; }
      sel.appendChild(o);
    });
    if (!found) {
      var x = document.createElement('option');
      x.value = want; x.textContent = want.toUpperCase(); x.selected = true;
      sel.appendChild(x);
    }
    sel.addEventListener('change', function () {
      try { localStorage.setItem('lang', sel.value); } catch (e) {}
      setTarget(sel.value);
      location.reload();
    });
    var slot = document.getElementById('lang-slot');
    if (slot) { slot.appendChild(sel); } else { sel.className += ' lang-fixed'; document.body.appendChild(sel); }

    if (want !== SRC) {
      var holder = document.createElement('div');
      holder.id = 'gt_el';
      document.body.appendChild(holder);
      window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({ pageLanguage: SRC, autoDisplay: false }, 'gt_el');
      };
      var s = document.createElement('script');
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      document.body.appendChild(s);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
