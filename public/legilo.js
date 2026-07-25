/*!
 * Legilo 0.1.0: reading-aid widget (self-hosted, no tracking).
 * Note: this widget is a reading aid and no substitute for accessible
 * development. It does not create conformance with WCAG/EN 301 549/BFSG/BaFG.
 * OpenDyslexic font: SIL Open Font License 1.1 (see assets/fonts/OFL.txt).
 */
(function () {
'use strict';
if (window.__legiloLoaded) return;
window.__legiloLoaded = true;
var BAKED = {"pos":"bl","offx":16,"offy":16,"color":"b45309","color2":"ffffff","size":"m","radius":50,"icon":"access","lang":"he","features":["profiles","fontsize","spacing","font","align","contrast","saturation","bluefilter","colorblind","links","focus","cursor","guide","mask","animations","images","tts","structure"],"mobile":"show","hide":0,"hotkey":0,"css":"base","statement":"","fontCss":"@font-face{font-family:'OpenDyslexic';src:url('legilo-opendyslexic-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap;}","homeUrl":"https://legilo.eu"};
var I18N = {"he":{"rtl":true,"title":"הגדרות תצוגה","open":"פתיחת הגדרות תצוגה","close":"סגירה","back":"חזרה","reset":"איפוס הכל","hideWidget":"הסתרה (הפעלה זו)","statement":"הצהרת נגישות","structureTitle":"מבנה העמוד","headings":"כותרות","landmarks":"אזורים","structureEmpty":"לא נמצאו כותרות בעמוד זה.","on":"פעיל","off":"כבוי","f":{"fontsize":"גודל טקסט","spacing":"ריווח","font":"גופן","contrast":"ניגודיות","saturation":"צבעים","bluefilter":"מסנן אור כחול","colorblind":"עיוורון צבעים","links":"הדגשת קישורים","focus":"הדגשת פוקוס","cursor":"סמן גדול","guide":"סרגל קריאה","mask":"מסכת קריאה","animations":"עצירת אנימציות","images":"הסתרת תמונות","structure":"מבנה העמוד","tts":"הקראה","ttsrate":"מהירות הקראה","align":"יישור טקסט","profiles":"פרופילים"},"s":{"fontsize":["כבוי","גדול","גדול יותר","הכי גדול"],"font":["כבוי","קריא","דיסלקציה"],"contrast":["כבוי","כהה","בהיר","הפוך"],"saturation":["כבוי","גווני אפור","נמוך","גבוה"],"bluefilter":["כבוי","קל","בינוני","חזק"],"colorblind":{"1":"חולשת אדום","2":"חולשת ירוק","3":"חולשת כחול"},"align":["כבוי","שמאל","מרכז","ימין"],"tts":["כבוי","הקראת העמוד","הצבע והקרא"],"ttsrate":{"1":"איטי יותר","2":"רגיל","3":"מהיר יותר"}},"p":{"vision":"ראייה טובה יותר","motion":"פחות תנועה","focus":"ריכוז","dyslexia":"דיסלקציה"}},"en":{"title":"Display settings","open":"Open display settings","close":"Close","back":"Back","reset":"Reset all","hideWidget":"Hide (this session)","statement":"Accessibility statement","structureTitle":"Page structure","headings":"Headings","landmarks":"Landmarks","structureEmpty":"No headings found on this page.","on":"On","off":"Off","f":{"fontsize":"Font size","spacing":"Spacing","font":"Font","contrast":"Contrast","saturation":"Colors","bluefilter":"Blue filter","colorblind":"Color blindness","links":"Highlight links","focus":"Highlight focus","cursor":"Big cursor","guide":"Reading guide","mask":"Reading mask","animations":"Stop animations","images":"Hide images","structure":"Page structure","tts":"Read aloud","ttsrate":"Reading speed","align":"Align text","profiles":"Profiles"},"s":{"fontsize":["Off","Large","Larger","Largest"],"font":["Off","Readable","Dyslexia"],"contrast":["Off","Dark","Light","Inverted"],"saturation":["Off","Grayscale","Low","High"],"bluefilter":["Off","Light","Medium","Strong"],"colorblind":{"1":"Red weakness","2":"Green weakness","3":"Blue weakness"},"align":["Off","Left","Center","Right"],"tts":["Off","Read page","Point & read"],"ttsrate":{"1":"Slower","2":"Normal","3":"Faster"}},"p":{"vision":"Better visibility","motion":"Less motion","focus":"Focus","dyslexia":"Dyslexia"}}};
var VERSION = '0.1.0';
var KEYS = ['pos', 'offx', 'offy', 'color', 'color2', 'size', 'radius',
'icon', 'lang', 'features', 'mobile', 'hide', 'hotkey', 'css', 'statement'];
var script = document.currentScript;
var cfg = {};
KEYS.forEach(function (k) {
cfg[k] = BAKED[k];
if (script && script.dataset && script.dataset[k] !== undefined && script.dataset[k] !== '') {
cfg[k] = script.dataset[k];
}
if (window.LegiloConfig && window.LegiloConfig[k] !== undefined) {
cfg[k] = window.LegiloConfig[k];
}
});
cfg.fontCss = BAKED.fontCss || '';
if (typeof cfg.features === 'string') {
cfg.features = cfg.features.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}
if (!Array.isArray(cfg.features) || !cfg.features.length) {
cfg.features = ['profiles', 'fontsize', 'spacing', 'font', 'align', 'contrast', 'saturation',
'bluefilter', 'colorblind', 'links', 'focus', 'cursor', 'guide', 'mask', 'animations', 'images', 'tts', 'structure'];
}
cfg.offx = parseInt(cfg.offx, 10) || 0;
cfg.offy = parseInt(cfg.offy, 10) || 0;
cfg.radius = Math.max(0, Math.min(50, parseInt(cfg.radius, 10) || 0));
cfg.color = '#' + String(cfg.color || '0b5fb0').replace('#', '');
cfg.color2 = '#' + String(cfg.color2 || 'ffffff').replace('#', '');
cfg.hide = cfg.hide === 1 || cfg.hide === '1' || cfg.hide === true || cfg.hide === 'true';
cfg.hotkey = cfg.hotkey === 1 || cfg.hotkey === '1' || cfg.hotkey === true || cfg.hotkey === 'true';
var useCss = cfg.css !== 'none';
function store(getter) {
try { return getter(); } catch (e) { return null; }
}
if (store(function () { return sessionStorage.getItem('legilo:hidden'); })) return;
if (cfg.mobile === 'hide' && window.matchMedia('(max-width: 768px)').matches) return;
function detectLang() {
var candidates = [document.documentElement.lang]
.concat(navigator.languages || [navigator.language]);
for (var i = 0; i < candidates.length; i++) {
if (!candidates[i]) continue;
var code = String(candidates[i]).toLowerCase().substring(0, 2);
if (I18N[code]) return code;
}
return 'en';
}
var T = I18N[cfg.lang === 'auto' ? detectLang() : cfg.lang] || I18N.en || {};
var RTL = !!T.rtl;
var FEATURE_LEVELS = {
fontsize: 4, spacing: 2, font: 3, align: 4, contrast: 4, saturation: 4,
bluefilter: 4, colorblind: 4, links: 2, focus: 2, cursor: 2, guide: 2,
mask: 2, animations: 2, images: 2, tts: 3
};
var FEATURES = [];
cfg.features.forEach(function (k) {
if (FEATURE_LEVELS[k] && !FEATURES.some(function (f) { return f.k === k; })) {
FEATURES.push({ k: k, n: FEATURE_LEVELS[k] });
}
});
var PROFILES = {
vision: { fontsize: 2, links: 1, focus: 1, cursor: 1 },
motion: { animations: 1, saturation: 2 },
focus: { mask: 1, animations: 1 },
dyslexia: { font: 2, spacing: 1, guide: 1 }
};
var PROFILE_KEYS = ['vision', 'motion', 'focus', 'dyslexia'].filter(function (p) {
return Object.keys(PROFILES[p]).every(function (k) {
return cfg.features.indexOf(k) !== -1;
});
});
var showProfiles = cfg.features.indexOf('profiles') !== -1 && PROFILE_KEYS.length > 0;
var STORAGE_KEY = 'legilo:v1';
var states = {};
var ttsRate = 2; // read-aloud speed: 1 slower, 2 normal, 3 faster
FEATURES.forEach(function (f) { states[f.k] = 0; });
function pageIsLight() {
try {
var c = getComputedStyle(document.body).backgroundColor || '';
if (!c || c === 'transparent' || /,\s*0\s*\)$/.test(c)) {
c = getComputedStyle(document.documentElement).backgroundColor || '';
}
if (!c || c === 'transparent' || /,\s*0\s*\)$/.test(c)) return true; // browser default is white
var m = c.match(/(\d+)\D+(\d+)\D+(\d+)/);
if (!m) return true;
return (0.299 * m[1] + 0.587 * m[2] + 0.114 * m[3]) > 140;
} catch (e) { return false; }
}
var saved = store(function () { return JSON.parse(localStorage.getItem(STORAGE_KEY)); });
if (saved && saved.states) {
FEATURES.forEach(function (f) {
if (f.k === 'tts') return; // never autostart read-aloud
var v = parseInt(saved.states[f.k], 10) || 0;
if (v > 0 && v < f.n) states[f.k] = v;
});
var r = parseInt(saved.rate, 10);
if (r >= 1 && r <= 3) ttsRate = r;
} else {
if (states.animations !== undefined &&
window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
states.animations = 1;
}
if (states.contrast !== undefined) {
if (window.matchMedia('(prefers-contrast: more)').matches) {
states.contrast = window.matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 2;
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches && pageIsLight()) {
states.contrast = 1;
}
}
}
function saveStates() {
var out = {};
FEATURES.forEach(function (f) { if (f.k !== 'tts') out[f.k] = states[f.k] || 0; });
store(function () { return localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, states: out, rate: ttsRate })); });
}
var NOT_W = ':not(#legilo-host):not(#legilo-host *):not(#legilo-overlays):not(#legilo-overlays *)';
var NOT_ICON = ':not(i):not([class*="icon"]):not([class*="fa-"]):not([class*="glyphicon"]):not([class*="material-symbols"]):not([class*="material-icons"])';
var CURSOR_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIxSURBVGhD7ZovkIJAFMZfJBKJF41GopF40Ug0XiTSLhqJF4nGi0Qj0WgkGoncfNyuA0/lj7DLc8bfzM6cw+K+j3vft4gS/fNJRBkRxer1y1F4nlcREcaBiFw+QTpVHMdVkiRaRE5EH3ySZGoBIMuyynVdiLgQkc8nSuUqAJxOp2q1WkFESUQhnyyRlgBwuVyqzWajW2rPT5DGjQDNbrd7CXM/FABewdydAoB0c/cKAJLNPUgAkGruwQI00sw9WgCQZO6nBAAp5n5aAJBg7kkCwNLmnixAs5S5ZxMAljD3rAKAbXPPLgDYNLcRAcCWuY0J0Jg2t3EBwKS5rQgApsxtTQAwYW6rAgAzd8QLGsssAo7HY/0+Y4ZqJ4xJzCKgKIrKcRxd0JiBx5qTmEUA2G63KAi97fFFTDJYAK5yF3me66v6xRcxySAByHE8BC7Lkh9qsV6vIaDgi5ikV0AURdeeTdOUH26B42ouHttboVNAGIa6oJSITrjCXeA/pB7XTzbnUO4KQCFBEOji9Y0Yervu9S7wfuq8NVvLCDcCsNGoXsZobjQOUgZp00UjUpPGucZoCTifz31b/R7F9SWSzUi9CkBrqP7FwgGfqFhx0fewGal1MexOsa93D5IitfR9X/fseeC9OiJSTKR+q0WOI/tVZKSOYVCkKjNjiONhpCKh4KvG98+//GQptCIVnwkaO7duy3tRLIY6UrFjIwgahf/M+ZnXNPiNhY5L/D0mCN68WZI/ZvzTVUq3SvMAAAAASUVORK5CYII=';
var CURSOR_HAND = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA+0lEQVRo3u2ZQQ7EIAhFi8fQ+x/NXqOzMnFMOqKAjOaza6z2PxELel0wXyPLwWOMT/183zdtAdAKb00ThCzF55y/2lJK6hC0SrwVRLBYQm/ie22uHiizzxVYPCH1gokHVhoAAAAAAAAAAADYHqCX//f6SvqTpviZTFOaXpOneA0I8hYvhaB/EC+BCJKAGxFfi9Os1sLsTqFdGrbjcnemMLJcyge0xHO8orqErGbdDMAqWJFKcAB2mH0kcwAAQCcX8grkkXPTs5dQPQMav333GFgBMXrsznrpV2boXQ8MFTRvINtVZEfUxEecSnBihGuzd2Vm16zWwmEwJfsAnnqXFlm0OgkAAAAASUVORK5CYII=';
var CSSF = {
spacing: 'body, body *' + NOT_W + '{line-height:1.6!important;letter-spacing:.12em!important;word-spacing:.16em!important;}',
links: 'body a[href]' + NOT_W + '{text-decoration:underline!important;text-underline-offset:2px!important;background-color:#ffe36e!important;color:#111!important;}' +
'body a[href] *' + NOT_W + '{color:#111!important;}',
readable: 'body, body *' + NOT_W + NOT_ICON + '{font-family:Arial,Verdana,"Helvetica Neue",sans-serif!important;}',
dyslexic: 'body, body *' + NOT_W + NOT_ICON + '{font-family:"OpenDyslexic",Arial,sans-serif!important;}',
cursor: 'body, body *{cursor:url("' + CURSOR_PNG + '") 3 2, auto!important;}' +
'body a[href],body a[href] *,body button,body button *,body [role="button"],body label,' +
'body select,body summary,body input[type="submit"],body input[type="button"],body input[type="checkbox"],body input[type="radio"]' +
'{cursor:url("' + CURSOR_HAND + '") 22 4, pointer!important;}',
animations: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;}',
images: 'body img,body svg,body video,body picture,body figure{visibility:hidden!important;}' +
'body,body *' + NOT_W + '{background-image:none!important;}',
focus: ':focus{outline:3px solid #e8a600!important;outline-offset:2px!important;box-shadow:0 0 0 5px rgba(0,0,0,.55)!important;}',
alignL: 'body p' + NOT_W + ',body li' + NOT_W + ',body td,body th,body dd,body dt,body blockquote,body figcaption{text-align:left!important;}',
alignC: 'body p' + NOT_W + ',body li' + NOT_W + ',body td,body th,body dd,body dt,body blockquote,body figcaption{text-align:center!important;}',
alignR: 'body p' + NOT_W + ',body li' + NOT_W + ',body td,body th,body dd,body dt,body blockquote,body figcaption{text-align:right!important;}',
dark: 'body, body *' + NOT_W + '{background-color:#121212!important;color:#f2f2f2!important;border-color:#666!important;text-shadow:none!important;box-shadow:none!important;}' +
'body a[href], body a[href] *{color:#9dc6ff!important;}' +
'body input,body textarea,body select,body button{background-color:#1e1e1e!important;color:#fff!important;}',
light: 'body, body *' + NOT_W + '{background-color:#fff!important;color:#000!important;border-color:#888!important;text-shadow:none!important;box-shadow:none!important;}' +
'body a[href], body a[href] *{color:#0645ad!important;}',
invertMedia: 'body img,body picture,body video,body iframe,body embed,body object,body canvas,body [style*="background-image"]{filter:invert(1) hue-rotate(180deg)!important;}'
};
function cbEnsureDefs() {
if (document.getElementById('legilo-cbdefs')) return;
var mats = [
'1 0 0 0 0 -0.2549 1.2549 0 0 0 0.3031 -0.5451 1.242 0 0 0 0 0 1 0',
'1 0 0 0 0 -0.4375 1.4375 0 0 0 0.2625 -0.5625 1.3 0 0 0 0 0 1 0',
'1 0 0 0 0 0.035 1.532 -0.567 0 0 0.035 -0.51 1.475 0 0 0 0 0 1 0'
];
var svg = '<svg id="legilo-cbdefs" xmlns="http://www.w3.org/2000/svg" width="0" height="0"' +
' style="position:absolute" aria-hidden="true" focusable="false"><defs>';
for (var i = 0; i < 3; i++) {
svg += '<filter id="legilo-cb' + (i + 1) + '" color-interpolation-filters="sRGB">' +
'<feColorMatrix type="matrix" values="' + mats[i] + '"/>' +
'</filter>';
}
var holder = document.createElement('div');
holder.innerHTML = svg + '</defs></svg>';
document.body.appendChild(holder.firstChild);
}
var styleEl = null;
function setPageCss(css) {
if (!styleEl) {
styleEl = document.createElement('style');
styleEl.id = 'legilo-style';
}
styleEl.textContent = css ? '@media screen{\n' + css + '\n}' : '';
document.head.appendChild(styleEl);
}
var FS_LEVELS = [1, 1.15, 1.3, 1.55];
var FS_SEL = 'h1,h2,h3,h4,h5,h6,p,a,li,dt,dd,td,th,span,label,strong,em,b,small,' +
'blockquote,figcaption,legend,button,input,textarea,select,summary,caption,pre,code';
var ICON_RE = /(^|[\s_-])(icon|fa|glyphicon|material)/i;
var fsApplied = false;
var fsObserver = null;
function fsApplyTo(el, factor) {
if (el.closest && el.closest('#legilo-host')) return;
if (ICON_RE.test(el.className || '')) return;
if (factor === 1) {
if (el.dataset.legiloFs) {
el.style.removeProperty('font-size');
delete el.dataset.legiloFs;
}
return;
}
var org = parseFloat(el.dataset.legiloFs);
if (!org) {
org = parseFloat(getComputedStyle(el).fontSize) || 16;
el.dataset.legiloFs = org;
}
el.style.setProperty('font-size', (org * factor).toFixed(2) + 'px', 'important');
}
function applyFontSize() {
var factor = FS_LEVELS[states.fontsize || 0];
if (factor === 1 && !fsApplied) { fsObserve(false); return; }
var els = document.body.querySelectorAll(FS_SEL);
for (var i = 0; i < els.length; i++) fsApplyTo(els[i], factor);
fsApplied = factor !== 1;
fsObserve(fsApplied);
}
function fsObserve(on) {
if (on && !fsObserver && window.MutationObserver) {
fsObserver = new MutationObserver(function (muts) {
var factor = FS_LEVELS[states.fontsize || 0];
if (factor === 1) return;
muts.forEach(function (m) {
for (var i = 0; i < m.addedNodes.length; i++) {
var n = m.addedNodes[i];
if (n.nodeType !== 1 || n.id === 'legilo-host' || n.id === 'legilo-overlays') continue;
if (n.matches && n.matches(FS_SEL)) fsApplyTo(n, factor);
if (n.querySelectorAll) {
var els = n.querySelectorAll(FS_SEL);
for (var j = 0; j < els.length; j++) fsApplyTo(els[j], factor);
}
}
});
});
fsObserver.observe(document.body, { childList: true, subtree: true });
} else if (!on && fsObserver) {
fsObserver.disconnect();
fsObserver = null;
}
}
function pauseMedia() {
var media = document.querySelectorAll('video, audio');
for (var i = 0; i < media.length; i++) {
if (!media[i].paused) { try { media[i].pause(); } catch (e) { } }
}
}
function ttsSupported() {
return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
}
function ttsPickVoice(lc) {
var voices = [];
try { voices = speechSynthesis.getVoices() || []; } catch (e) { return null; }
lc = String(lc).toLowerCase().substring(0, 2);
var match = voices.filter(function (v) {
return v.lang && v.lang.toLowerCase().indexOf(lc) === 0;
});
var local = match.filter(function (v) { return v.localService; });
return local[0] || match[0] || null;
}
var HL_NAME = 'legilo-tts';
var hlStyleEl = null;
var hlText = '';
var hlRuns = [];
var hlRunIdx = 0;
function hlSupported() {
return typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';
}
function hlClear() {
if (hlSupported()) { try { CSS.highlights.delete(HL_NAME); } catch (e) { } }
}
function hlReset(text, runs) {
hlText = text || '';
hlRuns = runs || [];
hlRunIdx = 0;
hlClear();
}
function hlEnsureStyle() {
if (hlStyleEl) return;
hlStyleEl = document.createElement('style');
hlStyleEl.id = 'legilo-tts-style';
hlStyleEl.textContent = '@media screen{::highlight(' + HL_NAME + '){background-color:#ffcf40;color:#111;}}';
document.head.appendChild(hlStyleEl);
}
function ttsCollect(rootEl) {
var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, IFRAME: 1, OBJECT: 1 };
var text = '';
var runs = [];
var run = null;
var walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
acceptNode: function (n) {
var p = n.parentNode;
if (!p || SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
if (p.closest && (p.closest('#legilo-host') || p.closest('#legilo-overlays'))) {
return NodeFilter.FILTER_REJECT;
}
return NodeFilter.FILTER_ACCEPT;
}
});
var node, i, c, ws;
while ((node = walker.nextNode()) && text.length < 20000) {
var s = node.nodeValue;
for (i = 0; i < s.length; i++) {
c = s.charAt(i);
ws = c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f' || c === '\u00a0';
if (ws) {
if (text.length && text.charAt(text.length - 1) !== ' ') text += ' ';
run = null;
} else {
if (!run) {
run = { ts: text.length, te: text.length, node: node, no: i };
runs.push(run);
}
text += c;
run.te = text.length;
}
}
run = null; // a node change ends the run
}
return { text: text.replace(/\s+$/, ''), runs: runs };
}
function hlWordAt(pos, len) {
if (!hlRuns.length || !hlText || !hlSupported()) return;
while (pos < hlText.length && hlText.charAt(pos) === ' ') pos++;
var end = (len && len > 0) ? Math.min(pos + len, hlText.length) : -1;
if (end < 0) {
end = hlText.indexOf(' ', pos);
if (end < 0) end = hlText.length;
}
if (end <= pos) return;
while (hlRunIdx > 0 && hlRuns[hlRunIdx].ts > pos) hlRunIdx--;
while (hlRunIdx < hlRuns.length - 1 && hlRuns[hlRunIdx].te <= pos) hlRunIdx++;
var a = hlRuns[hlRunIdx];
if (!a || pos < a.ts || pos >= a.te) return;
var bIdx = hlRunIdx;
while (bIdx < hlRuns.length - 1 && hlRuns[bIdx].te < end) bIdx++;
var b = hlRuns[bIdx];
var endInB = Math.min(end, b.te);
try {
var range = document.createRange();
range.setStart(a.node, a.no + (pos - a.ts));
range.setEnd(b.node, b.no + (endInB - b.ts));
hlEnsureStyle();
CSS.highlights.set(HL_NAME, new Highlight(range));
} catch (e) { }
}
function ttsStop() {
if (ttsSupported()) { try { speechSynthesis.cancel(); } catch (e) { } }
hlClear();
}
function ttsDone() {
if (states.tts === 1) {
states.tts = 0;
renderButtons();
}
}
function ttsSpeak(text, resetWhenDone, collected) {
if (collected) {
hlReset(collected.text, collected.runs);
text = collected.text;
} else {
hlReset('', null);
text = String(text || '').replace(/\s+/g, ' ').substring(0, 20000).trim();
}
if (!text) return false;
var sentences = text.match(/[^.!?。！？]+[.!?。！？]*\s*/g) || [text];
var parts = [];
var current = '';
var consumed = 0;
sentences.forEach(function (s) {
if ((current + s).length > 180) {
if (current) { parts.push({ t: current, o: consumed }); consumed += current.length; }
while (s.length > 180) {
parts.push({ t: s.substring(0, 180), o: consumed });
consumed += 180;
s = s.substring(180);
}
current = s;
} else {
current += s;
}
});
if (current) parts.push({ t: current, o: consumed });
var withHl = !!(collected && hlRuns.length && hlSupported());
var langCode = document.documentElement.lang || (cfg.lang !== 'auto' ? cfg.lang : 'en');
var voice = ttsPickVoice(langCode);
try { speechSynthesis.cancel(); } catch (e) { }
parts.forEach(function (part, i) {
var u = new SpeechSynthesisUtterance(part.t);
u.lang = langCode;
u.rate = [1, 0.75, 1, 1.25][ttsRate] || 1;
if (voice) u.voice = voice;
if (withHl) {
u.onboundary = function (e) {
hlWordAt(part.o + (e.charIndex || 0), e.charLength);
};
}
u.onerror = function () { hlClear(); if (resetWhenDone) ttsDone(); };
if (i === parts.length - 1) {
u.onend = function () { hlClear(); if (resetWhenDone) ttsDone(); };
}
speechSynthesis.speak(u);
});
return true;
}
function ttsStart() {
if (!ttsSupported()) { states.tts = 0; return; }
var sel = '';
try { sel = String(window.getSelection()).trim(); } catch (e) { }
var ok;
if (sel) {
ok = ttsSpeak(sel, true);
} else {
var main = document.querySelector('main, [role="main"], article') || document.body;
ok = ttsSpeak('', true, ttsCollect(main));
}
if (!ok) states.tts = 0;
}
var HOVER_SEL = 'p,h1,h2,h3,h4,h5,h6,li,td,th,dt,dd,blockquote,figcaption,caption,label,legend,summary,a,button';
var hoverListening = false;
var hoverTimer = null;
var hoverLast = null;
function hoverSpeak(el, delay) {
hoverLast = el;
clearTimeout(hoverTimer);
if (!el) return;
hoverTimer = setTimeout(function () {
ttsSpeak('', false, ttsCollect(el));
}, delay);
}
function onHoverOver(e) {
var el = e.target && e.target.closest ? e.target.closest(HOVER_SEL) : null;
if (el && (el.closest('#legilo-host') || el.closest('#legilo-overlays'))) el = null;
if (el === hoverLast) return;
hoverSpeak(el, 350);
}
function onHoverFocus(e) {
var el = e.target && e.target.closest ? e.target.closest(HOVER_SEL) : null;
if (!el || el.closest('#legilo-host') || el.closest('#legilo-overlays')) return;
hoverSpeak(el, 150);
}
function hoverListen(on) {
if (on && !hoverListening && ttsSupported()) {
document.addEventListener('mouseover', onHoverOver, true);
document.addEventListener('focusin', onHoverFocus, true);
hoverListening = true;
} else if (!on && hoverListening) {
document.removeEventListener('mouseover', onHoverOver, true);
document.removeEventListener('focusin', onHoverFocus, true);
hoverListening = false;
hoverLast = null;
clearTimeout(hoverTimer);
}
}
function apply() {
var frags = [];
var rootFilters = [];
if (states.contrast === 3) rootFilters.push('invert(1)', 'hue-rotate(180deg)');
if (states.saturation === 1) rootFilters.push('grayscale(1)');
if (states.saturation === 2) rootFilters.push('saturate(.4)');
if (states.saturation === 3) rootFilters.push('saturate(2.4)');
if (states.colorblind) {
cbEnsureDefs();
rootFilters.push('url("#legilo-cb' + states.colorblind + '")');
}
if (rootFilters.length) frags.push('html{filter:' + rootFilters.join(' ') + '!important;background:#fff;}');
if (states.contrast === 3) frags.push(CSSF.invertMedia);
if (states.contrast === 1) frags.push(CSSF.dark);
if (states.contrast === 2) frags.push(CSSF.light);
if (states.spacing) frags.push(CSSF.spacing);
if (states.links) frags.push(CSSF.links);
if (states.font === 1) frags.push(CSSF.readable);
if (states.font === 2) frags.push(cfg.fontCss + CSSF.dyslexic);
if (states.cursor) frags.push(CSSF.cursor);
if (states.animations) { frags.push(CSSF.animations); pauseMedia(); }
if (states.images) frags.push(CSSF.images);
if (states.focus) frags.push(CSSF.focus);
if (states.align === 1) frags.push(CSSF.alignL);
if (states.align === 2) frags.push(CSSF.alignC);
if (states.align === 3) frags.push(CSSF.alignR);
setPageCss(frags.join('\n'));
applyFontSize();
syncOverlays();
var ui = states.contrast === 3 ? 'invert(1) hue-rotate(180deg)' : '';
host.style.filter = ui;
overlayHost.style.filter = ui;
frameWatch(!!(states.cursor || states.guide || states.mask));
refreshFrames();
}
var overlayHost = document.createElement('div');
overlayHost.id = 'legilo-overlays';
var oRoot = overlayHost.attachShadow({ mode: 'open' });
oRoot.innerHTML =
'<style>' +
':host{position:fixed;inset:0;pointer-events:none;z-index:2147483645;display:block;}' +
'@media print{:host{display:none!important;}}' +
'.warm{position:absolute;inset:0;background:#ff9a3c;display:none;}' +
'.guide{position:absolute;left:0;right:0;height:12px;background:' + cfg.color + ';' +
'border-top:2px solid #fff;border-bottom:2px solid #fff;opacity:.9;display:none;}' +
'.mask{position:absolute;left:0;right:0;background:rgba(10,10,10,.55);display:none;}' +
'</style>' +
'<div class="warm" part="warm"></div>' +
'<div class="guide" part="guide"></div>' +
'<div class="mask mask-t" part="mask"></div><div class="mask mask-b" part="mask"></div>';
var warmEl = oRoot.querySelector('.warm');
var WARM_OPACITY = [0, .14, .27, .4];
var guideEl = oRoot.querySelector('.guide');
var maskT = oRoot.querySelector('.mask-t');
var maskB = oRoot.querySelector('.mask-b');
var mouseY = window.innerHeight / 2;
function onMove(e) {
mouseY = e.clientY;
positionOverlays();
}
function onTouch(e) {
if (e.touches && e.touches.length) {
mouseY = e.touches[0].clientY;
positionOverlays();
}
}
function positionOverlays() {
if (states.guide) guideEl.style.top = (mouseY - 6) + 'px';
if (states.mask) {
var half = 55;
maskT.style.top = '0';
maskT.style.height = Math.max(0, mouseY - half) + 'px';
maskB.style.top = (mouseY + half) + 'px';
maskB.style.height = Math.max(0, window.innerHeight - mouseY - half) + 'px';
}
}
var moveListening = false;
function syncOverlays() {
var warm = states.bluefilter || 0;
warmEl.style.display = warm ? 'block' : 'none';
warmEl.style.opacity = WARM_OPACITY[warm] || 0;
guideEl.style.display = states.guide ? 'block' : 'none';
maskT.style.display = states.mask ? 'block' : 'none';
maskB.style.display = states.mask ? 'block' : 'none';
var need = !!(states.guide || states.mask);
if (need && !moveListening) {
document.addEventListener('mousemove', onMove, { passive: true });
document.addEventListener('touchstart', onTouch, { passive: true });
document.addEventListener('touchmove', onTouch, { passive: true });
moveListening = true;
} else if (!need && moveListening) {
document.removeEventListener('mousemove', onMove);
document.removeEventListener('touchstart', onTouch);
document.removeEventListener('touchmove', onTouch);
moveListening = false;
}
if (need) positionOverlays();
}
function eachFrameDoc(fn) {
var ifr = document.getElementsByTagName('iframe');
for (var i = 0; i < ifr.length; i++) {
var d = null;
try { d = ifr[i].contentDocument; } catch (e) { d = null; }
if (d && d.head && d.body) {
try { fn(d, ifr[i]); } catch (e) { }
}
}
}
function syncFrameCursor() {
eachFrameDoc(function (d) {
var el = d.getElementById('legilo-cursor');
if (states.cursor) {
if (!el) {
el = d.createElement('style');
el.id = 'legilo-cursor';
d.head.appendChild(el);
}
el.textContent = '@media screen{' + CSSF.cursor + '}';
} else if (el && el.parentNode) {
el.parentNode.removeChild(el);
}
});
}
var frameMoves = [];
function frameBindMove(on) {
for (var i = 0; i < frameMoves.length; i++) {
var r = frameMoves[i];
try {
r.doc.removeEventListener('mousemove', r.move);
r.doc.removeEventListener('touchstart', r.touch);
r.doc.removeEventListener('touchmove', r.touch);
} catch (e) { }
}
frameMoves = [];
if (!on) return;
eachFrameDoc(function (d, frame) {
var move = function (e) {
mouseY = frame.getBoundingClientRect().top + e.clientY;
positionOverlays();
};
var touch = function (e) {
if (e.touches && e.touches.length) {
mouseY = frame.getBoundingClientRect().top + e.touches[0].clientY;
positionOverlays();
}
};
d.addEventListener('mousemove', move, { passive: true });
d.addEventListener('touchstart', touch, { passive: true });
d.addEventListener('touchmove', touch, { passive: true });
frameMoves.push({ doc: d, move: move, touch: touch });
});
}
function refreshFrames() {
syncFrameCursor();
frameBindMove(!!(states.guide || states.mask));
}
var watchedFrames = [];
var frameObserver = null;
function watchFrame(frame) {
if (frame.__legiloWatched) return;
frame.__legiloWatched = true;
watchedFrames.push(frame);
frame.addEventListener('load', refreshFrames);
}
function frameWatch(on) {
if (on) {
var ex = document.getElementsByTagName('iframe');
for (var i = 0; i < ex.length; i++) watchFrame(ex[i]);
if (!frameObserver && window.MutationObserver) {
frameObserver = new MutationObserver(function (muts) {
var found = false;
for (var m = 0; m < muts.length; m++) {
var added = muts[m].addedNodes;
for (var a = 0; a < added.length; a++) {
var n = added[a];
if (n.nodeType !== 1) continue;
if (n.tagName === 'IFRAME') { watchFrame(n); found = true; }
else if (n.getElementsByTagName) {
var inner = n.getElementsByTagName('iframe');
for (var j = 0; j < inner.length; j++) { watchFrame(inner[j]); found = true; }
}
}
}
if (found) refreshFrames();
});
frameObserver.observe(document.documentElement, { childList: true, subtree: true });
}
} else if (frameObserver) {
frameObserver.disconnect();
frameObserver = null;
}
}
var SIZES = { s: 40, m: 48, l: 56 };
var trigSize = SIZES[cfg.size] || 48;
var ICONS = {
access: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm5.6 5.1-3.9.9v2l1.6 4.8a.9.9 0 0 1-1.7.6L12 14.9l-1.6 3.7a.9.9 0 0 1-1.7-.6l1.6-4.8v-2l-3.9-.9a.9.9 0 0 1 .4-1.75l4 .95h2.4l4-.95a.9.9 0 0 1 .4 1.75z"/></svg>',
person: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a4.2 4.2 0 1 1 0 8.4A4.2 4.2 0 0 1 12 2zm0 10.2c4.5 0 8.2 1.9 8.2 4.2V21H3.8v-4.6c0-2.3 3.7-4.2 8.2-4.2z"/></svg>',
eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5c5 0 9.3 2.9 11 7-1.7 4.1-6 7-11 7S2.7 16.1 1 12c1.7-4.1 6-7 11-7zm0 2.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>',
aa: '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17" font-size="13" font-weight="bold" text-anchor="middle" fill="currentColor" font-family="Arial,sans-serif">Aa</text></svg>'
};
function fico(inner) {
return '<svg class="fico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"' +
' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}
var FICONS = {
fontsize: fico('<path d="M4 19V7m0 0h5m-5 0v3" stroke-width="1.6"/><path d="M13 19V4h7m-7 0v4"/>'),
spacing: fico('<path d="M3 12h18M6 8l-3 4 3 4M18 8l3 4-3 4"/>'),
font: fico('<path d="M6 19L11 5l5 14M8.2 14h5.6"/><path d="M19 12v7m0-5.5a2.6 2.6 0 1 0-2.6 4.3" stroke-width="1.6"/>'),
contrast: fico('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>'),
saturation: fico('<path d="M12 3.5c3.6 4.5 6.3 7.7 6.3 10.7a6.3 6.3 0 0 1-12.6 0c0-3 2.7-6.2 6.3-10.7z"/>'),
bluefilter: fico('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5"/>'),
colorblind: fico('<circle cx="9" cy="9.5" r="4.6"/><circle cx="15" cy="9.5" r="4.6"/><circle cx="12" cy="14.5" r="4.6"/>'),
links: fico('<path d="M10 14a4 4 0 0 0 6 .4l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-6-.4L5.4 12.2a4 4 0 0 0 5.7 5.7l1.5-1.5"/>'),
focus: fico('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>'),
cursor: fico('<path d="M6 3l13 10.5-5.5.9 3 5.4-2.8 1.5-2.9-5.5L6 19.5z" fill="currentColor" stroke="none"/>'),
guide: fico('<path d="M3 5.5h18M3 18.5h18"/><rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor" stroke="none"/>'),
mask: fico('<rect x="3" y="3.5" width="18" height="5.5" rx="1" fill="currentColor" stroke="none" opacity=".85"/><rect x="3" y="15" width="18" height="5.5" rx="1" fill="currentColor" stroke="none" opacity=".85"/><path d="M5 12h14" stroke-width="1.4"/>'),
animations: fico('<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>'),
images: fico('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.4" fill="currentColor" stroke="none"/><path d="M5.5 16.5l3.5-3.5 2.5 2.5 3.5-3.5 3.5 3.5"/><path d="M4 4l16 16" stroke-width="1.6"/>'),
structure: fico('<path d="M4 6h16M7 12h13M10 18h10"/><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="7.5" cy="18" r="1" fill="currentColor" stroke="none"/>'),
tts: fico('<path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z" fill="currentColor" stroke="none"/><path d="M16 9a4.2 4.2 0 0 1 0 6M18.6 6.5a8 8 0 0 1 0 11"/>'),
align: fico('<path d="M4 6h16M4 10h10M4 14h16M4 18h8"/>')
};
function posCss(pos) {
var h = { style: '', panel: '' };
var x = cfg.offx + 'px', y = cfg.offy + 'px';
var tf = [];
if (pos === 'tl') { h.style = 'top:' + y + ';left:' + x; h.panel = 'top:calc(100% + 10px);left:0;'; }
else if (pos === 'tc') { h.style = 'top:' + y + ';left:50%'; tf.push('translateX(-50%)'); h.panel = 'top:calc(100% + 10px);left:50%;transform:translateX(-50%);'; }
else if (pos === 'tr') { h.style = 'top:' + y + ';right:' + x; h.panel = 'top:calc(100% + 10px);right:0;'; }
else if (pos === 'lc') { h.style = 'top:50%;left:' + x; tf.push('translateY(-50%)'); h.panel = 'left:calc(100% + 10px);top:50%;transform:translateY(-50%);'; }
else if (pos === 'rc') { h.style = 'top:50%;right:' + x; tf.push('translateY(-50%)'); h.panel = 'right:calc(100% + 10px);top:50%;transform:translateY(-50%);'; }
else if (pos === 'bl') { h.style = 'bottom:' + y + ';left:' + x; h.panel = 'bottom:calc(100% + 10px);left:0;'; }
else if (pos === 'bc') { h.style = 'bottom:' + y + ';left:50%'; tf.push('translateX(-50%)'); h.panel = 'bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);'; }
else { h.style = 'bottom:' + y + ';right:' + x; h.panel = 'bottom:calc(100% + 10px);right:0;'; }
if (tf.length) h.style += ';transform:' + tf.join(' ');
return h;
}
var anchor = posCss(cfg.pos);
var panelReserve = (cfg.pos === 'lc' || cfg.pos === 'rc') ? 24 : cfg.offy + trigSize + 22;
var host = document.createElement('div');
host.id = 'legilo-host';
host.setAttribute('style', 'position:fixed;z-index:2147483646;' + anchor.style);
var root = useCss ? host.attachShadow({ mode: 'open' }) : host;
var PANEL_CSS =
':host{all:initial;display:block;}' +
'@media print{:host{display:none!important;}}' +
'*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}' +
'.wrap{position:relative;}' +
'.trigger{width:' + trigSize + 'px;height:' + trigSize + 'px;border:2px solid rgba(255,255,255,.9);' +
'border-radius:' + cfg.radius + '%;background:' + cfg.color + ';color:' + cfg.color2 + ';cursor:pointer;' +
'display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.35);padding:0;}' +
'.trigger svg{width:62%;height:62%;}' +
'.trigger:hover{transform:scale(1.06);}' +
'.trigger:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #e8a600;outline-offset:2px;}' +
'.panel{position:absolute;' + anchor.panel + 'width:min(340px,calc(100vw - 24px));' +
'max-height:calc(100vh - ' + panelReserve + 'px);max-height:calc(100dvh - ' + panelReserve + 'px);' +
'background:#fff;color:#1a1a1a;border-radius:12px;box-shadow:0 6px 30px rgba(0,0,0,.35);display:none;' +
'flex-direction:column;overflow:hidden;font-size:14px;}' +
'.panel.open{display:flex;}' +
'.head{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;' +
'background:' + cfg.color + ';color:' + cfg.color2 + ';}' +
'.head h2{font-size:15px;font-weight:600;}' +
'.head button{background:transparent;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;padding:4px 6px;}' +
'.body{overflow-y:auto;padding:10px;}' +
'.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}' +
'.grid button.ft:nth-of-type(odd):last-of-type{grid-column:1/-1;}' +
'.temporow{grid-column:1/-1;display:flex;gap:6px;}' +
'.temporow[hidden]{display:none;}' +
'.temporow button{flex:1;font-size:12px;padding:4px 8px;border-radius:16px;border:1px solid #c9c9c9;background:#fff;cursor:pointer;color:#1a1a1a;}' +
'.temporow button.on{background:' + cfg.color + ';color:' + cfg.color2 + ';border-color:' + cfg.color + ';}' +
'button.ft{display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:3px;padding:6px 10px;min-height:44px;' +
'border:1px solid #c9c9c9;border-radius:9px;background:#f7f7f7;color:#1a1a1a;cursor:pointer;text-align:start;font-size:13px;width:100%;}' +
'button.ft .top{display:flex;align-items:center;gap:7px;}' +
'button.ft .chev{margin-inline-start:auto;font-size:16px;line-height:1;opacity:.6;}' +
'.fico{width:17px;height:17px;flex:none;opacity:.85;}' +
'.profiles{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;}' +
'button.prof{font-size:12px;padding:5px 10px;border-radius:16px;border:1px solid #c9c9c9;' +
'background:#f7f7f7;color:#1a1a1a;cursor:pointer;}' +
'button.prof.on{background:' + cfg.color + ';color:' + cfg.color2 + ';border-color:' + cfg.color + ';}' +
'.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}' +
'button.ft:hover{border-color:' + cfg.color + ';}' +
'button.ft .st{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:11.5px;color:#555;}' +
'button.ft .st:empty{display:none;}' +
'button.ft .st .dots{display:inline-flex;gap:3px;flex:none;}' +
'button.ft .st .dot{width:6px;height:6px;border-radius:50%;border:1px solid currentColor;opacity:.55;}' +
'button.ft .st .dot.on{background:currentColor;opacity:1;}' +
'button.ft.on{border-color:' + cfg.color + ';background:' + cfg.color + ';color:' + cfg.color2 + ';}' +
'button.ft.on .st{color:inherit;}' +
'.ptitle{font-size:11.5px;font-weight:600;color:#667;margin:0 0 4px;}' +
'.foot{border-top:1px solid #ddd;padding:8px 10px;display:flex;flex-direction:column;gap:6px;}' +
'.foot .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}' +
'.foot button,.foot a{font-size:12.5px;color:#1a1a1a;background:#eee;border:1px solid #bbb;border-radius:7px;' +
'padding:7px 10px;cursor:pointer;text-decoration:none;display:inline-block;}' +
'.foot button.hidew{background:transparent;border:0;text-decoration:underline;color:#667;' +
'font-size:11px;padding:7px 2px;cursor:pointer;}' +
'.foot button.hidew:hover{color:#1a1a1a;}' +
'.foot a.brandbtn{display:inline-flex;align-items:center;justify-content:center;margin-inline-start:auto;' +
'background:transparent;border:0;padding:5px;color:#667;}' +
'.foot a.brandbtn:hover{color:#1a1a1a;}' +
'.foot a.brandbtn svg{width:15px;height:15px;display:block;}' +
'.view{display:none;}' +
'.view.open{display:block;}' +
'.view h3{font-size:13px;margin:10px 0 6px;color:#444;}' +
'.view ul{list-style:none;}' +
'.view li a{display:block;padding:7px 9px;border-radius:7px;color:#1a1a1a;text-decoration:none;font-size:13px;cursor:pointer;}' +
'.view li a:hover{background:#eee;}' +
'.view .lvl2{padding-left:14px;}.view .lvl3{padding-left:28px;}.view .lvl4,.view .lvl5,.view .lvl6{padding-left:42px;}' +
'.view .empty{color:#666;font-size:12.5px;padding:6px 0;}' +
'.backrow{margin-bottom:8px;}' +
'.back{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:600;' +
'padding:5px 12px 5px 9px;border:1px solid #c9c9c9;border-radius:16px;background:#fafafa;' +
'color:#1a1a1a;cursor:pointer;}' +
'.back:hover{background:' + cfg.color + ';color:' + cfg.color2 + ';border-color:' + cfg.color + ';}' +
'@media (prefers-reduced-motion: reduce){.trigger:hover{transform:none;}}';
function esc(s) {
return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
});
}
var gridHtml = FEATURES.map(function (f) {
var b = '<button class="ft" part="feature" data-f="' + f.k + '" aria-pressed="false">' +
'<span class="top">' + (FICONS[f.k] || '') +
'<span class="lbl">' + esc(T.f && T.f[f.k] || f.k) + '</span></span>' +
'<span class="st" part="state"></span></button>';
if (f.k === 'tts' && T.s && T.s.ttsrate) {
b += '<div class="temporow" part="tempo" role="group" aria-label="' +
esc(T.f && T.f.ttsrate || '') + '" hidden>';
for (var ti = 1; ti <= 3; ti++) {
b += '<button class="tempo" data-r="' + ti + '" aria-pressed="false">' +
esc(T.s.ttsrate[ti]) + '</button>';
}
b += '</div>';
}
return b;
}).join('');
if (cfg.features.indexOf('structure') !== -1) {
gridHtml += '<button class="ft" part="feature" data-f="structure">' +
'<span class="top">' + FICONS.structure +
'<span class="lbl">' + esc(T.f && T.f.structure || 'structure') + '</span>' +
'<span class="chev" aria-hidden="true">&rsaquo;</span></span></button>';
}
var BARE = '#legilo-host ';
var BARE_CSS =
BARE + '.panel{display:none;}' +
BARE + '.panel.open{display:flex;flex-direction:column;}' +
BARE + '.view{display:none;}' +
BARE + '.view.open{display:block;}' +
BARE + '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}' +
BARE + '.trigger{cursor:pointer;}' +
BARE + '.trigger svg{width:32px;height:32px;display:block;}' +
BARE + '.fico{width:17px;height:17px;}' +
BARE + '.brandbtn svg{width:15px;height:15px;}';
root.innerHTML =
'<style>' + (useCss ? PANEL_CSS : BARE_CSS) + '</style>' +
'<div class="wrap">' +
'<button class="trigger" part="trigger" aria-haspopup="dialog" aria-expanded="false" aria-label="' + esc(T.open) + '"' +
(cfg.hide ? ' style="display:none"' : '') + '>' + (ICONS[cfg.icon] || ICONS.access) + '</button>' +
'<div class="panel" part="panel" role="dialog"' + (RTL ? ' dir="rtl"' : '') + ' aria-label="' + esc(T.title) + '">' +
'<div class="head" part="head"><h2 part="title">' + esc(T.title) + '</h2>' +
'<button class="close" part="close" aria-label="' + esc(T.close) + '">&times;</button></div>' +
'<div class="body" part="body">' +
'<div class="main">' +
(showProfiles ? '<h3 class="ptitle" part="profiles-title">' + esc(T.f && T.f.profiles || 'Profiles') + '</h3>' +
'<div class="profiles" part="profiles">' + PROFILE_KEYS.map(function (p) {
return '<button class="prof" part="profile" data-p="' + p + '" aria-pressed="false">' +
esc(T.p && T.p[p] || p) + '</button>';
}).join('') + '</div>' : '') +
'<div class="grid" part="grid">' + gridHtml + '</div></div>' +
'<div class="view" role="group" aria-label="' + esc(T.structureTitle) + '">' +
'<div class="backrow"><button class="back">&lsaquo; ' + esc(T.back) + '</button></div>' +
'<div class="structure-list"></div>' +
'</div>' +
'</div>' +
'<div class="foot" part="foot">' +
'<div class="row">' +
'<button class="reset" part="reset">' + esc(T.reset) + '</button>' +
(cfg.statement ? '<a part="statement" href="' + esc(cfg.statement) + '" target="_blank" rel="noopener">' + esc(T.statement) + '</a>' : '') +
'<button class="hidew" part="hide">' + esc(T.hideWidget) + '</button>' +
(BAKED.homeUrl ?
'<a class="brandbtn" part="brandlink" href="' + esc(BAKED.homeUrl) + '/" target="_blank" rel="noopener"' +
' aria-label="Legilo" title="Legilo">' +
'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>' +
'<path d="M12 10.5V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.3" r="1.4" fill="currentColor"/></svg>' +
'</a>' : '') +
'</div>' +
'<div class="sr" aria-live="polite"></div>' +
'</div>' +
'</div></div>';
var trigger = root.querySelector('.trigger');
var panel = root.querySelector('.panel');
var mainView = root.querySelector('.main');
var structView = root.querySelector('.view');
var structList = root.querySelector('.structure-list');
function renderButtons() {
var btns = root.querySelectorAll('button.ft');
for (var i = 0; i < btns.length; i++) {
var f = btns[i].dataset.f;
if (f === 'structure') continue;
var v = states[f] || 0;
var stEl = btns[i].querySelector('.st');
var names = T.s && T.s[f];
var n = maxState(f);
if (!v) {
stEl.innerHTML = '';
} else {
var html = '<span class="stname">' + esc(names ? names[v] : T.on) + '</span>';
if (n > 2) {
var dots = '';
for (var d = 1; d < n; d++) dots += '<span class="dot' + (d <= v ? ' on' : '') + '"></span>';
html += '<span class="dots" aria-hidden="true">' + dots + '</span>';
}
stEl.innerHTML = html;
}
btns[i].classList.toggle('on', v > 0);
btns[i].setAttribute('aria-pressed', v > 0 ? 'true' : 'false');
btns[i].setAttribute('part', v > 0 ? 'feature feature-active' : 'feature');
}
var tr = root.querySelector('.temporow');
if (tr) {
tr.hidden = !(states.tts > 0);
var tbs = tr.querySelectorAll('button.tempo');
for (var t2 = 0; t2 < tbs.length; t2++) {
var tOn = parseInt(tbs[t2].dataset.r, 10) === ttsRate;
tbs[t2].classList.toggle('on', tOn);
tbs[t2].setAttribute('aria-pressed', tOn ? 'true' : 'false');
}
}
var profs = root.querySelectorAll('button.prof');
for (var j = 0; j < profs.length; j++) {
var active = profileActive(profs[j].dataset.p);
profs[j].classList.toggle('on', active);
profs[j].setAttribute('aria-pressed', active ? 'true' : 'false');
}
}
function profileActive(p) {
var def = PROFILES[p];
var any = false;
for (var k in def) {
if (states[k] === undefined) continue;
any = true;
if (states[k] !== def[k]) return false;
}
return any;
}
function toggleProfile(p) {
var def = PROFILES[p];
var on = profileActive(p);
for (var k in def) {
if (states[k] === undefined) continue;
states[k] = on ? 0 : def[k];
}
}
function announce(f) {
var live = root.querySelector('.sr');
if (!live) return;
var v = states[f] || 0;
var names = T.s && T.s[f];
var label = (T.f && T.f[f]) || f;
live.textContent = '';
live.textContent = label + ': ' + (names ? names[v] : (v ? T.on : T.off));
}
function announceProfile(p) {
var live = root.querySelector('.sr');
if (!live) return;
var label = (T.p && T.p[p]) || p;
live.textContent = '';
live.textContent = label + ': ' + (profileActive(p) ? T.on : T.off);
}
function maxState(f) {
for (var i = 0; i < FEATURES.length; i++) if (FEATURES[i].k === f) return FEATURES[i].n;
return 2;
}
root.addEventListener('click', function (e) {
var btn = e.composedPath ? e.composedPath()[0] : e.target;
while (btn && btn !== root && !(btn.tagName === 'BUTTON' || btn.tagName === 'A')) btn = btn.parentNode;
if (!btn || btn === root) return;
if (btn === trigger) { togglePanel(); return; }
if (btn.classList.contains('close')) { closePanel(); return; }
if (btn.classList.contains('back')) { showMain(); return; }
if (btn.classList.contains('reset')) {
resetAll();
return;
}
if (btn.classList.contains('prof')) {
toggleProfile(btn.dataset.p);
apply(); renderButtons(); saveStates(); announceProfile(btn.dataset.p);
return;
}
if (btn.classList.contains('hidew')) {
store(function () { return sessionStorage.setItem('legilo:hidden', '1'); });
destroy();
return;
}
if (btn.classList.contains('tempo')) {
ttsRate = parseInt(btn.dataset.r, 10) || 2;
renderButtons(); saveStates();
return;
}
if (btn.classList.contains('ft')) {
var f = btn.dataset.f;
if (f === 'structure') { showStructure(); return; }
states[f] = ((states[f] || 0) + 1) % maxState(f);
if (f === 'tts') {
ttsStop();
hoverListen(false);
if (states.tts === 1) ttsStart();
else if (states.tts === 2) hoverListen(true);
}
apply(); renderButtons(); saveStates(); announce(f);
}
});
var lastView = 'main'; // show the last used view when reopening
function showMain() {
lastView = 'main';
structView.classList.remove('open');
mainView.style.display = '';
var back = root.querySelector('.back');
if (back) trigger.focus();
var first = root.querySelector('button.ft');
if (first) first.focus();
}
function showStructure() {
lastView = 'structure';
var html = '';
var heads = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
var items = [];
for (var i = 0; i < heads.length; i++) {
if (heads[i].closest('#legilo-host')) continue;
var txt = (heads[i].textContent || '').trim();
if (!txt || !heads[i].getClientRects().length) continue;
items.push({ el: heads[i], txt: txt.substring(0, 80), lvl: heads[i].tagName[1] });
}
html += '<h3>' + esc(T.headings) + '</h3>';
if (!items.length) {
html += '<p class="empty">' + esc(T.structureEmpty) + '</p>';
} else {
html += '<ul>' + items.map(function (it, idx) {
return '<li><a href="#" data-idx="' + idx + '" class="lvl' + it.lvl + '">' + esc(it.txt) + '</a></li>';
}).join('') + '</ul>';
}
var lm = document.querySelectorAll('main,nav,header,footer,aside,[role="main"],[role="navigation"],[role="banner"],[role="contentinfo"],[role="search"]');
var lmItems = [];
for (var j = 0; j < lm.length; j++) {
if (lm[j].closest('#legilo-host') || !lm[j].getClientRects().length) continue;
var label = lm[j].getAttribute('aria-label');
var name = lm[j].tagName.toLowerCase();
lmItems.push({ el: lm[j], txt: name + (label ? ': ' + label : '') });
}
if (lmItems.length) {
html += '<h3>' + esc(T.landmarks) + '</h3><ul>' + lmItems.map(function (it, idx) {
return '<li><a href="#" data-lm="' + idx + '">' + esc(it.txt) + '</a></li>';
}).join('') + '</ul>';
}
structList.innerHTML = html;
var links = structList.querySelectorAll('a');
for (var k = 0; k < links.length; k++) {
links[k].addEventListener('click', function (e) {
e.preventDefault();
var t = this.dataset.idx !== undefined ? items[this.dataset.idx].el : lmItems[this.dataset.lm].el;
if (window.matchMedia('(max-width: 768px)').matches) closePanel();
t.scrollIntoView({ block: 'start' });
t.setAttribute('tabindex', '-1');
t.focus({ preventScroll: true });
});
}
mainView.style.display = 'none';
structView.classList.add('open');
var back = root.querySelector('.back');
if (back) back.focus();
}
var open = false;
function togglePanel() { open ? closePanel() : openPanel(); }
function openPanel() {
open = true;
panel.classList.add('open');
trigger.setAttribute('aria-expanded', 'true');
if (lastView === 'structure' && cfg.features.indexOf('structure') !== -1) {
showStructure(); // rebuild the list, content may have changed
} else {
showMainSilent();
var first = root.querySelector('.close');
if (first) first.focus();
}
if (!cfg.hide) document.addEventListener('mousedown', onDocDown, true);
}
function showMainSilent() {
structView.classList.remove('open');
mainView.style.display = '';
}
function closePanel() {
open = false;
panel.classList.remove('open');
trigger.setAttribute('aria-expanded', 'false');
document.removeEventListener('mousedown', onDocDown, true);
if (!cfg.hide) trigger.focus();
}
function onDocDown(e) {
var path = e.composedPath ? e.composedPath() : [];
if (path.indexOf(host) === -1) closePanel();
}
root.addEventListener('keydown', function (e) {
if (!open) return;
if (e.key === 'Escape') { e.stopPropagation(); closePanel(); }
});
function onHotkey(e) {
if (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
e.preventDefault();
togglePanel();
}
}
function mount() {
document.body.appendChild(overlayHost);
document.body.appendChild(host);
renderButtons();
if (cfg.hotkey) document.addEventListener('keydown', onHotkey);
var any = false;
FEATURES.forEach(function (f) { if (states[f.k]) any = true; });
if (any) apply();
}
function destroy() {
ttsStop();
hoverListen(false);
if (hlStyleEl && hlStyleEl.parentNode) { hlStyleEl.parentNode.removeChild(hlStyleEl); }
hlStyleEl = null;
var cbDefs = document.getElementById('legilo-cbdefs');
if (cbDefs && cbDefs.parentNode) cbDefs.parentNode.removeChild(cbDefs);
document.removeEventListener('keydown', onHotkey);
fsObserve(false);
if (fsApplied) {
var els = document.body.querySelectorAll(FS_SEL);
for (var i = 0; i < els.length; i++) fsApplyTo(els[i], 1);
fsApplied = false;
}
if (moveListening) {
document.removeEventListener('mousemove', onMove);
document.removeEventListener('touchstart', onTouch);
document.removeEventListener('touchmove', onTouch);
moveListening = false;
}
frameBindMove(false);
eachFrameDoc(function (d) {
var el = d.getElementById('legilo-cursor');
if (el && el.parentNode) el.parentNode.removeChild(el);
});
frameWatch(false);
for (var wf = 0; wf < watchedFrames.length; wf++) {
try {
watchedFrames[wf].removeEventListener('load', refreshFrames);
delete watchedFrames[wf].__legiloWatched;
} catch (e) { }
}
watchedFrames = [];
document.removeEventListener('mousedown', onDocDown, true);
if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
if (host.parentNode) host.parentNode.removeChild(host);
if (overlayHost.parentNode) overlayHost.parentNode.removeChild(overlayHost);
delete window.__legiloLoaded;
delete window.Legilo;
}
function resetAll() {
ttsStop();
hoverListen(false);
FEATURES.forEach(function (f) { states[f.k] = 0; });
apply(); renderButtons(); saveStates();
}
function apiSet(key, level) {
var max = 0;
for (var i = 0; i < FEATURES.length; i++) if (FEATURES[i].k === key) max = FEATURES[i].n;
if (!max) return false; // unbekannt oder per features= nicht konfiguriert
level = parseInt(level, 10);
if (isNaN(level)) level = 0;
level = Math.max(0, Math.min(max - 1, level));
states[key] = level;
if (key === 'tts') {
ttsStop();
hoverListen(false);
if (level === 1) ttsStart();
else if (level === 2) hoverListen(true);
}
apply(); renderButtons(); saveStates(); announce(key);
return true;
}
function apiGet(key) {
for (var i = 0; i < FEATURES.length; i++) {
if (FEATURES[i].k === key) return states[key] || 0;
}
return undefined;
}
function apiFeatures() {
return FEATURES.map(function (f) {
return { key: f.k, levels: f.n, state: states[f.k] || 0 };
});
}
window.Legilo = {
version: VERSION,
open: openPanel,
close: closePanel,
toggle: togglePanel,
reset: resetAll,
set: apiSet,
get: apiGet,
features: apiFeatures,
destroy: destroy
};
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', mount);
} else {
mount();
}
})();