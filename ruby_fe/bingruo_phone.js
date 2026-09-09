// 病弱妹妹·小手机 P1/4 —— 核心壳：挂载/样式/路由/设置仓
// 独立组件：不依赖卡内变量与 MVU，localStorage 持久化，可直接导入酒馆助手脚本。
// v1.1.0：全 SVG 图标（无 emoji）、双主题（澪·浅蓝 / 鹤·暖黄）、300px 真机尺寸。
(function () {
  'use strict';
  var BRMM_VERSION = '1.5.0';
  var RUNTIME_KEY = '__brmmPhoneRuntime';
  var LS_PREFIX = 'brmm_phone_';

  function resolveHostWindow() {
    var current = window;
    try {
      for (var i = 0; i < 4; i++) {
        if (!current.parent || current.parent === current) break;
        void current.parent.document.body;
        current = current.parent;
      }
    } catch (e) {}
    return current;
  }
  var helperWindow = window;
  var hostWindow = resolveHostWindow();
  var hostDocument = hostWindow.document;
  try {
    var previous = helperWindow.__brmmBridgeRuntime || hostWindow[RUNTIME_KEY];
    if (previous && typeof previous.destroy === 'function') { try { previous.destroy('replace'); } catch (e) {} }
  } catch (e) {}

  var runtime = {
    build: BRMM_VERSION, destroyed: false, root: null, fab: null, screen: null,
    view: 'home', viewArg: null, timers: {}, lineMode: 'main', locked: true,
    stocks: [], destroy: destroy
  };
  try { helperWindow.__brmmBridgeRuntime = runtime; hostWindow[RUNTIME_KEY] = runtime; } catch (e) {}
  function destroy(reason) { // eslint-disable-line no-unused-vars
    runtime.destroyed = true;
    Object.keys(runtime.timers).forEach(function (k) { try { hostWindow.clearTimeout(runtime.timers[k]); } catch (e) {} });
    try { if (runtime.root && runtime.root.parentNode) runtime.root.parentNode.removeChild(runtime.root); } catch (e) {}
    try { if (runtime.fab && runtime.fab.parentNode) runtime.fab.parentNode.removeChild(runtime.fab); } catch (e) {}
  }

  /* ---------- 存取 ---------- */
  function lsGet(key, fallback) {
    try {
      var raw = null;
      try { raw = hostWindow.localStorage.getItem(LS_PREFIX + key); } catch (e) { return fallback; }
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { hostWindow.localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- SVG 图标库（描边手绘风，统一 #333） ---------- */
  var BRMM_SVG_OPEN = '<svg class="brmm-ic" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var BRMM_ICONS = {
    phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><line x1="11" y1="18.5" x2="13" y2="18.5"/>',
    line: '<path d="M4 4h16v11H10l-6 5z"/><circle cx="9" cy="9" r="1" fill="#333" stroke="none"/><circle cx="15" cy="9" r="1" fill="#333" stroke="none"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.6"/><path d="M8.5 7L10 4h4l1.5 3"/>',
    cart: '<path d="M3 4h2l2.4 11.5h11.2L21 8H7"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    forum: '<rect x="5" y="4" width="14" height="17" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>',
    weather: '<circle cx="9" cy="8" r="3.4"/><path d="M9 1.5v1.6M2.9 3.2l1.1 1.1M15.1 3.2l-1.1 1.1"/><path d="M3 18c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    radio: '<circle cx="12" cy="14" r="2" fill="#333" stroke="none"/><path d="M8.8 10.8a4.5 4.5 0 000 6.4M15.2 10.8a4.5 4.5 0 010 6.4M6.2 8.2a8 8 0 000 11.6M17.8 8.2a8 8 0 010 11.6"/>',
    signal: '<rect x="4" y="14" width="3" height="6" fill="#333" stroke="none"/><rect x="9" y="10.5" width="3" height="9.5" fill="#333" stroke="none"/><rect x="14" y="7" width="3" height="13" fill="#333" stroke="none"/><rect x="19" y="3.5" width="3" height="16.5" fill="#333" stroke="none"/>',
    store: '<path d="M4 9l1.2-5h13.6L20 9"/><path d="M4 9h16v11H4z"/><path d="M9.5 20v-5.5h5V20"/>',
    tag: '<path d="M4 4h7l9 9-7 7-9-9z"/><circle cx="9" cy="9" r="1.4"/>',
    book: '<path d="M5 3h11a2 2 0 012 2v16H7a2 2 0 01-2-2z"/><path d="M5 17a2 2 0 012-2h11"/>',
    cup: '<path d="M6 4h12l-1.4 16h-9.2z"/><path d="M13.5 4l1.8-2"/>',
    melon: '<path d="M4 14a8 8 0 0016 0z"/><circle cx="10" cy="11.5" r=".9" fill="#333" stroke="none"/><circle cx="14" cy="11.5" r=".9" fill="#333" stroke="none"/>',
    bowl: '<path d="M7.5 12a4.5 4.5 0 019 0"/><path d="M4 12h16a8 8 0 01-16 0z"/>',
    stick: '<rect x="9" y="3" width="6" height="10" rx="3"/><line x1="12" y1="13" x2="12" y2="21"/>',
    oval: '<ellipse cx="12" cy="12" rx="7" ry="5"/>',
    drumstick: '<circle cx="9" cy="9" r="5"/><path d="M12.5 12.5L19 19"/>',
    burger: '<path d="M5 10a7 6 0 0114 0"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="5" y1="14.5" x2="19" y2="14.5"/><path d="M6 18.5h12"/>',
    news: '<rect x="4" y="4" width="16" height="16" rx="2"/><line x1="7.5" y1="9" x2="16.5" y2="9"/><line x1="7.5" y1="13" x2="13" y2="13"/><line x1="7.5" y1="16.5" x2="15" y2="16.5"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
    send: '<path d="M4 12l16-7-7 16-3-6z"/><path d="M11 15l9-10"/>',
    flame: '<path d="M12 3c1 3-2 4.5-2 7a4.5 4.5 0 009 0c0-2-1-3.5-2-4.5.2 1.5-1 2-1.7 1.5C15.5 5.5 14 3.5 12 3z"/><path d="M9.5 14a2.5 2.5 0 005 0"/>'
  };
  function ic(name) {
    return BRMM_SVG_OPEN + (BRMM_ICONS[name] || BRMM_ICONS.tag) + '</svg>';
  }

  /* ---------- 设置仓 ---------- */
  var settings = Object.assign({ theme: 'mio', fontScale: 1, lineMode: 'main', aiurl: '', aimodel: '', wallpaper: 'sea', wallurl: '', lockwall: 'sea', lockurl: '', timemode: 'auto', timemo: 11, timeda: 20, timeho: 19, timemi: 32 }, lsGet('settings', {}));
  var BRMM_WALLS = {
    sea: 'linear-gradient(180deg,#bfe3f7 0%,#eef7fd 70%)',
    warm: 'linear-gradient(180deg,#ffe9b8 0%,#fff8e6 70%)',
    pink: 'linear-gradient(180deg,#ffd3e0 0%,#fff2f6 70%)',
    night: 'linear-gradient(180deg,#2e3a5c 0%,#5a6ea6 100%)'
  };
  function brmmWallCSS() {
    if (settings.wallpaper === 'custom' && settings.wallurl) {
      var u = String(settings.wallurl).replace(/["\n\r]/g, '').slice(0, 2048);
      if (/^https?:\/\//.test(u)) return 'url("' + u + '") center / cover no-repeat, #fff';
    }
    return BRMM_WALLS[settings.wallpaper] || BRMM_WALLS.sea;
  }
  function brmmLockWallCSS() {
    if (settings.lockwall === 'custom' && settings.lockurl) {
      var u2 = String(settings.lockurl).replace(/["\n\r]/g, '').slice(0, 2048);
      if (/^https?:\/\//.test(u2)) return 'url("' + u2 + '") center / cover no-repeat, #fff';
    }
    return BRMM_WALLS[settings.lockwall] || BRMM_WALLS.sea;
  }
  function saveSettings() { lsSet('settings', settings); applySettings(); }
  function phoneEl() {
    try { return runtime.root.querySelector('#brmm-phone'); } catch (e) { return null; }
  }
  function applySettings() {
    try {
      var ph = phoneEl();
      if (!ph) return;
      ph.setAttribute('data-theme', settings.theme === 'tsuru' ? 'tsuru' : 'mio');
      ph.style.setProperty('--brmm-font-scale', String(settings.fontScale || 1));
      runtime.lineMode = settings.lineMode || 'main';
      if (runtime.screen) {
        runtime.screen.style.background = brmmWallCSS();
        runtime.screen.style.backgroundSize = 'cover';
        runtime.screen.style.backgroundPosition = 'center';
      }
    } catch (e) {}
  }

  /* ---------- 风格：病弱妹妹前端同款（俏皮画集卡） ---------- */
  var BRMM_CSS = ''
    + '.brmm-fab{position:fixed;right:14px;bottom:86px;z-index:99990;width:50px;height:50px;border-radius:50%;border:3px solid #333;background:#fff;cursor:pointer;box-shadow:4px 4px 0 #333;display:flex;align-items:center;justify-content:center}'
    + '.brmm-fab:hover{box-shadow:6px 6px 0 #333}'
    + '.brmm-fab .brmm-ic{width:24px;height:24px}'
    + '.brmm-ov{position:fixed;inset:0;z-index:99991;background:rgba(20,22,34,.55);display:none;align-items:center;justify-content:center;padding:14px}'
    + '.brmm-ov--open{display:flex}'
    + '.brmm-phone{--brmm-accent:#5eb8f0;position:relative;width:300px;max-width:92vw;height:min(620px,92vh);background:#fff;border:3px solid #333;border-radius:26px;box-shadow:0 15px 35px rgba(0,0,0,.25),inset 0 0 0 6px rgba(255,255,255,.5);overflow:hidden;display:flex;flex-direction:column;font-family:"Helvetica Neue","Comic Sans MS","PingFang SC","Microsoft YaHei",sans-serif;color:#333;font-size:calc(12.5px * var(--brmm-font-scale,1))}'
    + '.brmm-phone[data-theme="tsuru"]{--brmm-accent:#f2a33c}'
    + '.brmm-phone::before{content:"";position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;background-image:radial-gradient(#e3e3e3 1.5px,transparent 1.5px);background-size:15px 15px;opacity:.55}'
    + '.brmm-notch{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:96px;height:20px;background:#333;border-radius:11px;z-index:5}'
    + '.brmm-statusbar{flex:none;display:flex;justify-content:space-between;align-items:center;padding:8px 16px 2px;font-size:10px;font-weight:900;letter-spacing:1px;position:relative;z-index:2}'
    + '.brmm-statusbar .brmm-ic{width:14px;height:14px}'
    + '.brmm-screen{flex:1;min-height:0;overflow-y:auto;padding:8px 10px 12px;position:relative;z-index:2}'
    + '.brmm-homebar{flex:none;display:flex;justify-content:center;padding:7px;position:relative;z-index:2}'
    + '.brmm-homebar i{display:block;width:100px;height:5px;border-radius:3px;background:#333;opacity:.7}'
    + '@keyframes brmm-float{0%{transform:translateY(0)}50%{transform:translateY(-4px)}100%{transform:translateY(0)}}'
    + '.brmm-title{font-size:20px;font-weight:900;letter-spacing:1px;text-shadow:2px 2px 0 #fff,3px 3px 0 #ccc;line-height:1.2;display:flex;align-items:center;gap:7px}'
    + '.brmm-title .brmm-ic{width:22px;height:22px}'
    + '.brmm-jp{display:inline-block;font-size:10px;font-weight:900;letter-spacing:2px;background:var(--brmm-accent);color:#333;padding:2px 8px;border-radius:4px;transform:skewX(-10deg);margin-top:4px;border:2px solid #333}'
    + '.brmm-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}'
    + '.brmm-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:900;background:#fff;border:2px solid #333;box-shadow:2px 2px 0 #ccc;animation:brmm-float 4s ease-in-out infinite}'
    + '.brmm-pill .brmm-ic{width:14px;height:14px}'
    + '.brmm-sect{position:relative;margin-top:10px;padding:10px 12px 10px 28px;border-radius:12px;background:repeating-linear-gradient(180deg,#fff,#fff 24px,#f4f4f4 24px,#f4f4f4 25px);border:2px dashed #999;box-shadow:3px 3px 0 rgba(0,0,0,.05)}'
    + '.brmm-sect::before{content:"";position:absolute;left:8px;top:10px;bottom:10px;width:8px;background:radial-gradient(circle,#333 3px,transparent 4px);background-size:100% 18px}'
    + '.brmm-sectT{display:inline-block;font-size:11px;font-weight:900;color:#333;background:var(--brmm-accent);padding:2px 10px;border-radius:20px;margin-bottom:7px;border:2px solid #333}'
    + '.brmm-apps{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:10px}'
    + '.brmm-app{border:2px solid #333;border-radius:13px;background:#fff;box-shadow:3px 3px 0 #ccc;padding:9px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;font-family:inherit;color:#333;min-height:66px}'
    + '.brmm-app:hover{transform:translateY(-3px);box-shadow:5px 5px 0 #333}'
    + '.brmm-app .brmm-ic{width:26px;height:26px}'
    + '.brmm-app span{font-size:11px;font-weight:900}'
    + '.brmm-back{flex:none;display:flex;align-items:center;gap:8px;padding:2px 2px 7px;position:relative;z-index:2}'
    + '.brmm-back button{border:2px solid #333;background:#fff;border-radius:10px;padding:3px 11px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:2px 2px 0 #333;font-size:12px}'
    + '.brmm-row{display:flex;align-items:center;gap:9px;background:#fff;border:2px solid #333;border-radius:12px;box-shadow:3px 3px 0 #ccc;padding:8px 9px;margin-top:7px;cursor:pointer;width:100%;font-family:inherit;color:#333;text-align:left;font-size:12.5px}'
    + '.brmm-ava{flex:none;width:40px;height:40px;border-radius:12px;background:#eee;border:3px solid #fff;box-shadow:2px 2px 0 var(--brmm-accent);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;overflow:hidden;background-size:cover;background-position:center 25%}'
    + '.brmm-row small{display:block;color:#888;font-size:11px;font-weight:400;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}'
    + '.brmm-bubbles{display:flex;flex-direction:column;gap:7px;margin-top:9px;padding-bottom:66px}'
    + '.brmm-them{align-self:flex-start;max-width:86%;background:#fff;border:2px solid #333;border-radius:4px 14px 14px 14px;box-shadow:3px 3px 0 #ccc;padding:7px 10px;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word}'
    + '.brmm-user{align-self:flex-end;max-width:86%;background:var(--brmm-accent);border:2px solid #333;border-radius:14px 4px 14px 14px;box-shadow:3px 3px 0 #333;padding:7px 10px;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word}'
    + '.brmm-sys{align-self:center;font-size:11px;color:#888;background:#fff;border:2px dashed #999;border-radius:12px;padding:3px 12px}'
    + '.brmm-compose{position:absolute;left:0;right:0;bottom:0;display:flex;gap:6px;margin:0;padding:9px 10px 11px;z-index:3;background:rgba(255,255,255,.96);border-top:2px solid #333}'
    + '.brmm-compose textarea{flex:1;min-width:0;min-height:36px;max-height:84px;border:2px solid #333;border-radius:10px;padding:6px 8px;font-family:inherit;font-size:12.5px;resize:vertical;background:#fff;color:#333}'
    + '.brmm-send{flex:none;border:2px solid #333;background:var(--brmm-accent);border-radius:10px;padding:0 12px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:2px 2px 0 #333;display:inline-flex;align-items:center;gap:4px}'
    + '.brmm-send:active{transform:translateY(1px);box-shadow:1px 1px 0 #333}'
    + '.brmm-send:disabled{opacity:.55;cursor:wait}'
    + '.brmm-send .brmm-ic{width:15px;height:15px}'
    + '.brmm-grid2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}'
    + '.brmm-thumb{border:2px solid #333;border-radius:10px;overflow:hidden;background:#f4f4f4;cursor:pointer;padding:0;font-family:inherit}'
    + '.brmm-thumb img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#eee}'
    + '.brmm-thumb span{display:block;font-size:10px;font-weight:900;padding:4px;text-align:center;background:#fff}'
    + '.brmm-viewer{position:absolute;inset:0;z-index:20;background:rgba(15,17,28,.9);display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:18px}'
    + '.brmm-viewer--open{display:flex}'
    + '.brmm-viewer img{max-width:100%;max-height:76%;border-radius:12px;border:3px solid #fff}'
    + '.brmm-close{border:2px solid #333;background:var(--brmm-accent);border-radius:10px;padding:6px 20px;font-weight:900;cursor:pointer;font-family:inherit}'
    + '.brmm-toast{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:30;background:#333;color:#fff;font-size:12px;font-weight:900;padding:7px 16px;border-radius:16px;display:none;max-width:88%;text-align:center}'
    + '.brmm-input{width:100%;border:2px solid #333;border-radius:8px;padding:7px 9px;font-family:inherit;font-size:12px;background:#fff;color:#333;box-sizing:border-box}'
    + '.brmm-phone textarea,.brmm-phone input{background-color:#fff!important;color:#333!important;-webkit-text-fill-color:#333!important}'
    + '.brmm-go{border:2px solid #333;background:var(--brmm-accent);border-radius:8px;padding:7px 12px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:2px 2px 0 #333;font-size:12px;white-space:nowrap}'
    + '.brmm-chip{border:2px solid #333;background:#fff;border-radius:14px;padding:4px 12px;font-size:11px;font-weight:900;cursor:pointer;font-family:inherit}'
    + '.brmm-chip--on{background:var(--brmm-accent);color:#333}'
    + '.brmm-post{background:#fff;border:2px solid #333;border-radius:12px;box-shadow:3px 3px 0 #ccc;padding:9px;margin-top:7px}'
    + '.brmm-post h4{font-size:12.5px;margin:0 0 4px;display:flex;align-items:center;gap:5px}'
    + '.brmm-post h4 .brmm-ic{width:14px;height:14px}'
    + '.brmm-post p{font-size:12px;color:#555;margin:0;line-height:1.6;white-space:pre-wrap}'
    + '.brmm-meta{font-size:10px;color:#999;margin-top:6px}'
    + '.brmm-reply{margin:6px 0 0 12px;padding:6px 9px;background:#f7f7f7;border-left:3px solid var(--brmm-accent);border-radius:0 8px 8px 0;font-size:12px}'
    + '.brmm-shop{display:flex;gap:7px;margin-top:8px;flex-wrap:wrap}'
    + '.brmm-shop .brmm-chip{display:inline-flex;align-items:center;gap:5px;animation:brmm-float 4.5s ease-in-out infinite}'
    + '.brmm-shop .brmm-ic{width:14px;height:14px}'
    + '.brmm-goods{background:#fff;border:2px solid #333;border-radius:12px;box-shadow:3px 3px 0 #ccc;padding:8px 9px;margin-top:7px;display:flex;align-items:center;gap:8px}'
    + '.brmm-goods .brmm-ic{width:24px;height:24px;flex:none}'
    + '.brmm-goods small{display:block;color:#888;font-size:11px}'
    + '.brmm-price{margin-left:auto;font-weight:900;font-size:12px;white-space:nowrap}'
    + '.brmm-buy{border:2px solid #333;background:var(--brmm-accent);border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit;font-size:11px;padding:5px 10px;box-shadow:2px 2px 0 #333}'
    + '.brmm-ic{width:22px;height:22px}'
    + '.brmm-foot{font-size:10px;color:#999;text-align:center;margin-top:9px;letter-spacing:1px}'
    + '.brmm-fab{touch-action:none}'
    + '.brmm-lock{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:40px 0;cursor:pointer}'
    + '.brmm-lock-clock{font-size:52px;font-weight:900;letter-spacing:2px;color:#333;text-shadow:2px 2px 0 #fff,4px 4px 0 rgba(0,0,0,.15)}'
    + '.brmm-lock-date{font-size:12px;font-weight:900;letter-spacing:2px;color:#333;background:#fff;border:2px solid #333;border-radius:16px;padding:4px 14px;box-shadow:2px 2px 0 #ccc}'
    + '.brmm-lock-hint{display:inline-flex;align-items:center;gap:6px;margin-top:14px;font-size:12px;font-weight:900;color:#333;background:var(--brmm-accent);border:2px solid #333;border-radius:18px;padding:6px 16px;box-shadow:2px 2px 0 #333;animation:brmm-float 2.6s ease-in-out infinite}'
    + '.brmm-clockw{text-align:center;padding:26px 0 6px}'
    + '.brmm-clockw-big{font-size:44px;font-weight:900;letter-spacing:2px;text-shadow:2px 2px 0 #fff,4px 4px 0 rgba(0,0,0,.12)}'
    + '.brmm-clockw-sub{margin-top:4px;font-size:11px;font-weight:900;letter-spacing:2px}'
    + '@media (prefers-reduced-motion:reduce){.brmm-phone *{animation:none!important;transition:none!important}}';

  /* ---------- 壳 ---------- */
  function ensureShell() {
    try {
      if (runtime.root && hostDocument.contains(runtime.root)) return;
      var old = hostDocument.getElementById('brmm-ov');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var oldFab = hostDocument.getElementById('brmm-fab');
      if (oldFab && oldFab.parentNode) oldFab.parentNode.removeChild(oldFab);
      var st = hostDocument.getElementById('brmm-style');
      if (!st) {
        st = hostDocument.createElement('style');
        st.id = 'brmm-style';
        st.textContent = BRMM_CSS;
        (hostDocument.head || hostDocument.documentElement).appendChild(st);
      } else {
        st.textContent = BRMM_CSS;
      }
      var fab = hostDocument.createElement('button');
      fab.id = 'brmm-fab';
      fab.className = 'brmm-fab';
      fab.type = 'button';
      fab.title = '病弱妹妹·小手机';
      fab.setAttribute('aria-label', '打开病弱妹妹小手机');
      fab.innerHTML = ic('phone');
      (function () {
        var off = lsGet('fab_pos', null);
        var curX = (off && typeof off.dx === 'number') ? off.dx : 0;
        var curY = (off && typeof off.dy === 'number') ? off.dy : 0;
        if (curX || curY) fab.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';
        var drag = null;
        fab.addEventListener('pointerdown', function (e) {
          if (e.button != null && e.button !== 0) return;
          try { e.preventDefault(); } catch (err) {}
          var r = null;
          try { r = fab.getBoundingClientRect(); } catch (err) {}
          drag = { sx: e.clientX, sy: e.clientY, ox: curX, oy: curY, moved: false, baseL: r ? r.left - curX : 0, baseT: r ? r.top - curY : 0 };
          try { fab.setPointerCapture(e.pointerId); } catch (err) {}
        });
        fab.addEventListener('pointermove', function (e) {
          if (!drag) return;
          var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
          if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
          if (!drag.moved) return;
          try {
            var vw = hostWindow.innerWidth || 800, vh = hostWindow.innerHeight || 600;
            var nl = Math.min(vw - 54, Math.max(2, drag.baseL + drag.ox + dx));
            var nt = Math.min(vh - 54, Math.max(2, drag.baseT + drag.oy + dy));
            curX = Math.round(nl - drag.baseL); curY = Math.round(nt - drag.baseT);
            fab.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';
          } catch (err) {}
        });
        function endDrag(tapped) {
          if (drag && drag.moved) lsSet('fab_pos', { dx: curX, dy: curY });
          var wasTap = drag && !drag.moved;
          drag = null;
          if (tapped !== false && wasTap) openPhone();
        }
        fab.addEventListener('pointerup', function () { endDrag(true); });
        fab.addEventListener('pointercancel', function () { endDrag(false); });
      })();
      hostDocument.body.appendChild(fab);
      runtime.fab = fab;
      var ov = hostDocument.createElement('div');
      ov.id = 'brmm-ov';
      ov.className = 'brmm-ov';
      ov.innerHTML = '<div class="brmm-phone" id="brmm-phone" data-theme="mio">'
        + '<div class="brmm-notch"></div>'
        + '<div class="brmm-statusbar"><span id="brmm-clock">--:--</span><span style="display:inline-flex;align-items:center;gap:4px">海鸣町 ' + ic('signal') + '</span></div>'
        + '<div class="brmm-back" id="brmm-back" style="display:none"><button type="button" data-brmm="back">‹ 返回</button><span id="brmm-crumbs" style="font-size:12px;font-weight:900"></span></div>'
        + '<div class="brmm-screen" id="brmm-screen"></div>'
        + '<div class="brmm-homebar"><i></i></div>'
        + '<div class="brmm-viewer" id="brmm-viewer"><img id="brmm-viewer-img" alt=""><button class="brmm-close" type="button" data-brmm="viewer-close">关闭</button></div>'
        + '<div class="brmm-toast" id="brmm-toast"></div>'
        + '</div>';
      ov.addEventListener('click', function (e) { if (e.target === ov) closePhone(); });
      hostDocument.body.appendChild(ov);
      runtime.root = ov;
      runtime.screen = ov.querySelector('#brmm-screen');
      applySettings();
      tickClock();
    } catch (e) {}
  }
  function brmmCustomTime() {
    if (settings.timemode !== 'custom') return null;
    var mo = Math.floor(Number(settings.timemo)), da = Math.floor(Number(settings.timeda));
    var ho = Math.floor(Number(settings.timeho)), mi = Math.floor(Number(settings.timemi));
    if (!(mo >= 1 && mo <= 12 && da >= 1 && da <= 31 && ho >= 0 && ho <= 23 && mi >= 0 && mi <= 59)) return null;
    return { mo: mo, da: da, ho: ho, mi: mi };
  }
  function brmmHM() {
    try {
      var ct = brmmCustomTime();
      if (ct) return ('0' + ct.ho).slice(-2) + ':' + ('0' + ct.mi).slice(-2);
      var d = new Date();
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    } catch (e) { return '--:--'; }
  }
  function brmmDateStr() {
    try {
      var week = ['日', '一', '二', '三', '四', '五', '六'];
      var ct2 = brmmCustomTime();
      if (ct2) {
        var wd = new Date(new Date().getFullYear(), ct2.mo - 1, ct2.da).getDay();
        return ct2.mo + '月' + ct2.da + '日 周' + week[wd];
      }
      var d = new Date();
      return (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + week[d.getDay()];
    } catch (e) { return ''; }
  }
  function tickClock() {
    try {
      var hm = brmmHM();
      var el = runtime.root && runtime.root.querySelector('#brmm-clock');
      if (el) el.textContent = hm;
      var lk = runtime.root && runtime.root.querySelector('#brmm-lock-clock');
      if (lk) lk.textContent = hm;
      var ld = runtime.root && runtime.root.querySelector('#brmm-lock-date');
      if (ld) ld.textContent = brmmDateStr();
      var hc = runtime.root && runtime.root.querySelector('#brmm-home-clock');
      if (hc) hc.textContent = hm;
      var hd = runtime.root && runtime.root.querySelector('#brmm-home-date');
      if (hd) hd.textContent = brmmDateStr() + ' · 海鸣町';
    } catch (e) {}
    try { runtime.timers.clock = hostWindow.setTimeout(tickClock, 10000); } catch (e) {}
  }
  var toastTimer = 0;
  function toast(msg) {
    try {
      var el = runtime.root.querySelector('#brmm-toast');
      el.textContent = String(msg || '');
      el.style.display = 'block';
      hostWindow.clearTimeout(toastTimer);
      toastTimer = hostWindow.setTimeout(function () { el.style.display = 'none'; }, 2200);
    } catch (e) {}
  }
  function openPhone() {
    try {
      ensureShell();
      runtime.locked = true;
      runtime.root.classList.add('brmm-ov--open');
      go('lock');
    } catch (e) {}
  }
  function unlockPhone() {
    try {
      runtime.locked = false;
      go('home');
    } catch (e) {}
  }
  function closePhone() {
    try { if (runtime.root) runtime.root.classList.remove('brmm-ov--open'); } catch (e) {}
  }
  function go(view, arg) {
    runtime.view = view; runtime.viewArg = arg == null ? null : arg;
    try { render(); } catch (e) {}
  }
  function crumbs(text) {
    try {
      var back = runtime.root.querySelector('#brmm-back');
      var c = runtime.root.querySelector('#brmm-crumbs');
      if (!text) { back.style.display = 'none'; c.textContent = ''; return; }
      back.style.display = 'flex'; c.textContent = text;
    } catch (e) {}
  }

// P2/4 —— LINE：澪 / 鹤 / 家人小窝，写入输入框 + 副API 双模式
var BRMM_AVA_MIO = 'https://raw.githubusercontent.com/roxysl521-droid/bingruo-li-hui/main/%E6%BE%AA_%E5%A4%B4%E5%83%8F_1.png';
var BRMM_AVA_TSURU = 'https://raw.githubusercontent.com/roxysl521-droid/bingruo-li-hui/main/%E9%B9%A4_%E5%A4%B4%E5%83%8F_1.png';
var BRMM_THREADS = [
  { id: 'mio', name: '澪', jp: '潮見 澪', ava: BRMM_AVA_MIO, word: '澪',
    hello: '……这个 LINE 是欧尼酱帮我注册的。\n有事就发消息，我看到会回。收音机里在放渔业天气预报。',
    sys: '你是潮见澪，病弱妹妹卡中的妹妹，体弱安静，对哥哥（欧尼酱）外冷内热，你是妹妹、对方是你哥哥。说话简短、爱用省略号，偶尔害羞。只用日常口语回 LINE 消息，每条 1-3 句，绝不写旁白、不复述状态面板、不跳出聊天软件语境。' },
  { id: 'tsuru', name: '鹤', jp: '潮見 鶴', ava: BRMM_AVA_TSURU, word: '鶴',
    hello: '起床啦，弟弟！这是我的 LINE！\n晾完衣服请你喝弹珠汽水，大熊商店的西瓜超甜，看到就回我！',
    sys: '你是潮见鹤，病弱妹妹卡中的姐姐，开朗能干，把弟弟当小孩照顾，叫他“弟弟”，绝不叫他欧尼酱或哥哥。说话热情直球、爱用感叹号，关心一日三餐和家务。只用日常口语回 LINE 消息，每条 1-3 句，绝不写旁白、不复述状态面板、不跳出聊天软件语境。' },
  { id: 'family', name: '潮见家小窝', jp: '家族群', ava: '', word: '家',
    hello: '「潮见家小窝」建好了。成员：澪、鹤。\n鹤：早餐的味增汤热好了！\n澪：……收到了。',
    sys: '你是群聊「潮见家小窝」里的澪和鹤。澪是妹妹，安静简短，叫对方欧尼酱；鹤是姐姐，热情话多，叫对方弟弟，绝不叫欧尼酱。两人轮流或一起给家里人回消息，标注名字如「鹤：」。只用日常口语，每人 1-2 句，绝不写旁白、不跳出聊天软件语境。' }
];
function brmmThread(id) {
  for (var i = 0; i < BRMM_THREADS.length; i++) if (BRMM_THREADS[i].id === id) return BRMM_THREADS[i];
  return BRMM_THREADS[0];
}
function brmmLineMsgs(id) {
  var seed = [{ who: 'them', text: brmmThread(id).hello, ts: Date.now() }];
  var saved = lsGet('line_' + id, null);
  return Array.isArray(saved) && saved.length ? saved : seed;
}
function brmmLineSave(id, msgs) { lsSet('line_' + id, msgs.slice(-120)); }
function brmmAvatarHTML(url, word) {
  return '<span class="brmm-ava" data-ava="' + esc(url || '') + '">' + esc(word || '?') + '</span>';
}
function hydrateAvatars(root) {
  try {
    var els = root.querySelectorAll('[data-ava]');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var url = el.getAttribute('data-ava');
        if (!url) return;
        var img = new Image();
        img.onload = function () { try { el.style.backgroundImage = 'url("' + url + '")'; el.textContent = ''; } catch (e) {} };
        img.src = url;
      })(els[i]);
    }
  } catch (e) {}
}

function viewLineList() {
  crumbs('LINE');
  var h = '<div class="brmm-title">' + ic('line') + 'LINE</div>';
  h += '<div class="brmm-pills"><span class="brmm-pill">' + ic('home') + '海鸣町分部</span><span class="brmm-pill">' + ic('signal') + esc(runtime.lineMode === 'sub' ? '副API回信' : '主线回信') + '</span></div>';
  BRMM_THREADS.forEach(function (t) {
    var msgs = brmmLineMsgs(t.id);
    var last = msgs.length ? String(msgs[msgs.length - 1].text || '').split('\n')[0] : '';
    h += '<button type="button" class="brmm-row" data-brmm="line-open" data-id="' + esc(t.id) + '">'
      + brmmAvatarHTML(t.ava, t.word)
      + '<span style="flex:1;min-width:0"><b>' + esc(t.name) + '</b><small>' + esc(last).slice(0, 40) + '</small></span>'
      + '<span style="color:#999">›</span></button>';
  });
  h += '<div class="brmm-foot">澪 · 鹤 · 潮见家 —— 海鸣町</div>';
  return h;
}
function viewLineChat(id) {
  var t = brmmThread(id);
  crumbs('LINE · ' + t.name);
  var msgs = brmmLineMsgs(id);
  var h = '<div style="display:flex;align-items:center;gap:8px">' + brmmAvatarHTML(t.ava, t.word)
    + '<div><div style="font-weight:900">' + esc(t.name) + '</div></div>'
    + '<button type="button" class="brmm-chip" data-brmm="line-sync" style="margin-left:auto" title="把本段聊天同步到正文">同步</button>'
    + '<button type="button" class="brmm-chip" data-brmm="line-mode" title="切换回信方式">'
    + esc(runtime.lineMode === 'sub' ? '副API回信' : '主线回信') + ' ⇄</button></div>';
  h += '<div class="brmm-bubbles" id="brmm-line-bubbles">';
  msgs.forEach(function (m) {
    if (m.who === 'sys') h += '<div class="brmm-sys">' + esc(m.text) + '</div>';
    else if (m.who === 'me') h += '<div class="brmm-user">' + esc(m.text) + '</div>';
    else h += '<div class="brmm-them">' + (id === 'family' ? '' : '') + esc(m.text) + '</div>';
  });
  h += '</div>';
  h += '<div class="brmm-compose"><textarea id="brmm-line-input" placeholder="给' + esc(t.name) + '发消息…" rows="1"></textarea>'
    + '<button class="brmm-send" type="button" data-brmm="line-send" data-id="' + esc(id) + '">发送</button></div>';
  return h;
}
function brmmLineScroll() {
  try {
    var sc = runtime.screen;
    sc.scrollTop = sc.scrollHeight;
  } catch (e) {}
}
function brmmLineSend(id) {
  try {
    var input = runtime.root.querySelector('#brmm-line-input');
    var text = input ? String(input.value || '').trim().slice(0, 500) : '';
    if (!text) { toast('先写点什么再发送'); return; }
    var t = brmmThread(id);
    var msgs = brmmLineMsgs(id);
    msgs.push({ who: 'me', text: text, ts: Date.now() });
    brmmLineSave(id, msgs);
    if (input) input.value = '';
    go('line-chat', id);
    brmmLineScroll();
    if (runtime.lineMode === 'sub') {
      var bubbles = runtime.root.querySelector('#brmm-line-bubbles');
      var typing = null;
      try {
        typing = hostDocument.createElement('div');
        typing.className = 'brmm-them';
        typing.textContent = t.name + '正在输入…';
        bubbles.appendChild(typing);
        brmmLineScroll();
      } catch (e) {}
      brmmSubReply(t, msgs).then(function (reply) {
        var cur = brmmLineMsgs(id);
        cur.push({ who: 'them', text: String(reply || '……（信号不好，没收到回复）').slice(0, 800), ts: Date.now() });
        brmmLineSave(id, cur);
        try { brmmNoteThread(id); } catch (e) {}
        try { brmmRefreshDigest(); } catch (e) {}
        if (runtime.view === 'line-chat' && runtime.viewArg === id) { go('line-chat', id); brmmLineScroll(); }
      }, function (err) {
        var cur2 = brmmLineMsgs(id);
        cur2.push({ who: 'sys', text: '副API失败：' + (err && err.message ? err.message : '未知错误') + '，消息已保留，切主线模式可重试', ts: Date.now() });
        brmmLineSave(id, cur2);
        if (runtime.view === 'line-chat' && runtime.viewArg === id) { go('line-chat', id); brmmLineScroll(); }
        else toast('副API失败，消息已保留');
      });
    } else {
      // 主线模式：记入滚动总结 + 世界书/注入，不再往输入框堆全文
      try { brmmNoteThread(id); } catch (e) {}
      lsSet('line_sync_' + id, msgs.length);
      toast('已同步，主线已知晓');
      brmmLineScroll();
    }
  } catch (e) { toast('发送失败'); }
}

// P3/4 —— 相机 / 网购 / 论坛 / 天气新闻（海鸣町内置内容 + 立绘图床，全 SVG 图标）
var BRMM_TU = 'https://raw.githubusercontent.com/roxysl521-droid/bingruo-tu-1/main/';
var BRMM_SCENES = [
  { label: '家·吹风扇', ch: '澪', file: '澪_家_吹风扇', n: 5 },
  { label: '家·刨冰', ch: '澪', file: '澪_家_吃刨冰', n: 5 },
  { label: '海边·泳装', ch: '澪', file: '澪_海边_泳装', n: 5 },
  { label: '神社·参拜', ch: '澪', file: '澪_海鸣神社_参拜', n: 5 },
  { label: '商店·购物', ch: '鹤', file: '鹤_大熊商店_购物', n: 5 },
  { label: '家·做饭', ch: '鹤', file: '鹤_家_做饭', n: 5 },
  { label: '海边·赶海', ch: '鹤', file: '鹤_海边_赶海', n: 5 },
  { label: '展望台·钓鱼', ch: '鹤', file: '鹤_龙王崎展望台_钓鱼', n: 5 }
];
function brmmSceneURL(sc, idx) {
  return BRMM_TU + encodeURIComponent(sc.file + '_' + idx + '.png');
}
/* ----- 相机 ----- */
function viewCamera() {
  crumbs('相机');
  var h = '<div class="brmm-title">' + ic('camera') + '相机</div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">取景地</span><div class="brmm-grid2">';
  BRMM_SCENES.forEach(function (sc, i) {
    h += '<button type="button" class="brmm-thumb" data-brmm="cam-shoot" data-i="' + i + '">'
      + '<img loading="lazy" src="' + brmmSceneURL(sc, 1) + '" alt="">'
      + '<span>' + esc(sc.ch + '·' + sc.label) + '</span></button>';
  });
  h += '</div></div>';
  var album = lsGet('album', []);
  h += '<div class="brmm-sect"><span class="brmm-sectT">我的相册 · ' + album.length + '</span>';
  if (!album.length) h += '<div style="font-size:12px;color:#888">还没有照片，去上面按快门吧</div>';
  else {
    h += '<div class="brmm-grid2">';
    album.slice().reverse().slice(0, 12).forEach(function (ph, ri) {
      h += '<button type="button" class="brmm-thumb" data-brmm="cam-view" data-i="' + (album.length - 1 - ri) + '">'
        + '<img loading="lazy" src="' + esc(ph.url) + '" alt=""><span>' + esc(ph.cap) + '</span></button>';
    });
    h += '</div>';
  }
  h += '</div><div class="brmm-foot">快门随机成片 · 点图放大</div>';
  return h;
}
function brmmCamShoot(i) {
  var sc = BRMM_SCENES[i];
  if (!sc) return;
  var idx = 1 + Math.floor(Math.random() * sc.n);
  var url = brmmSceneURL(sc, idx);
  var album = lsGet('album', []);
  album.push({ url: url, cap: sc.ch + '·' + sc.label + ' #' + idx, ts: Date.now() });
  lsSet('album', album.slice(-60));
  brmmViewer(url, sc.ch + ' · ' + sc.label);
  toast('已存入我的相册');
}
/* ----- 网购 ----- */
var BRMM_SHOPS = [
  { id: 'bear', name: '大熊商店', icon: 'store', goods: [
    { n: '弹珠汽水', p: 150, d: '冰箱里最后一瓶级的好喝', e: 'cup' },
    { n: '半个西瓜', p: 800, d: '今天大熊说好挑', e: 'melon' },
    { n: '刨冰杯', p: 200, d: '夏天续命水', e: 'bowl' },
    { n: '冰棍', p: 120, d: '澪也喜欢的味道', e: 'stick' } ] },
  { id: 'meat', name: '肉的坂本', icon: 'tag', goods: [
    { n: '可乐饼', p: 180, d: '刚出锅，烫手', e: 'oval' },
    { n: '猪肉片100g', p: 350, d: '今晚汉堡肉的料', e: 'drumstick' },
    { n: '汉堡肉饼', p: 280, d: '鹤姐的拿手菜', e: 'burger' } ] },
  { id: 'book', name: '古本屋', icon: 'book', goods: [
    { n: '旧文庫本', p: 300, d: '澪在看的那种', e: 'book' },
    { n: '渔业杂志', p: 500, d: '收音机同款话题', e: 'news' },
    { n: '明信片套装', p: 400, d: '龙王崎落日', e: 'image' } ] }
];
function viewShop() {
  crumbs('网购');
  var cur = lsGet('shop', 'bear');
  var h = '<div class="brmm-title">' + ic('cart') + '网购</div>';
  h += '<div class="brmm-shop">';
  BRMM_SHOPS.forEach(function (s) {
    h += '<button type="button" class="brmm-chip' + (cur === s.id ? ' brmm-chip--on' : '') + '" data-brmm="shop-tab" data-id="' + esc(s.id) + '">' + ic(s.icon) + esc(s.name) + '</button>';
  });
  h += '</div>';
  var shop = BRMM_SHOPS[0];
  BRMM_SHOPS.forEach(function (s) { if (s.id === cur) shop = s; });
  shop.goods.forEach(function (g, i) {
    h += '<div class="brmm-goods">' + ic(g.e) + '<span style="flex:1;min-width:0"><b style="font-size:12.5px">' + esc(g.n) + '</b><small>' + esc(g.d) + '</small></span>'
      + '<span class="brmm-price">' + g.p + '円</span>'
      + '<button type="button" class="brmm-buy" data-brmm="shop-buy" data-s="' + esc(shop.id) + '" data-i="' + i + '">下单</button></div>';
  });
  h += '<div class="brmm-foot">下单写入输入框 · 由主线确认收货</div>';
  return h;
}
function brmmShopBuy(sid, i) {
  var shop = null, g = null;
  BRMM_SHOPS.forEach(function (s) { if (s.id === sid) shop = s; });
  if (!shop) return;
  g = shop.goods[i];
  if (!g) return;
  var payload = '【手机网购】在' + shop.name + '下单：' + g.n + '（' + g.p + '円）。' + g.d + '，请在主线里安排购买与收货。';
  brmmDeliver(payload).then(function () { toast('订单已写入输入框'); }, function (err) {
    toast('写入失败：' + (err && err.message ? err.message : '未知错误'));
  });
}
/* ----- 论坛 ----- */
var BRMM_POSTS = [
  { id: 'tide', tag: '热议', title: '逆潮之夜真的不能去神社吗？', body: '昨晚又听见太鼓声了……有去看过的吗？', reps: [{ w: '早市阿婆', t: '别去！替身人偶都投了三回了。' }, { w: '鹤', t: '这种话题晚上看好吓人……弟弟，你过来一下！' }] },
  { id: 'bus', tag: '拼车', title: '周六进城（矶波市）拼车', body: '13:30 那班矶波号，有一起的吗？司机说可以顺路带快递。', reps: [{ w: '澪', t: '……想买新的小熊猫玩偶。' }] },
  { id: 'market', tag: '早市', title: '明早有新鲜竹荚鱼', body: '水产加工的阿姨说今晚煎鱼干试吃，都来！', reps: [] },
  { id: 'radio', tag: '求助', title: '收音机杂音怎么修？', body: '渔业天气预报都听不清了，拍两下有用吗？', reps: [{ w: '理发厅大叔', t: '天线转半圈，包好。' }] }
];
function brmmForum() {
  var extra = lsGet('forum_extra', []);
  var mine = lsGet('forum_mine', {});
  var all = BRMM_POSTS.map(function (p) {
    var reps = (p.reps || []).concat(mine[p.id] || []);
    return { id: p.id, tag: p.tag, title: p.title, body: p.body, reps: reps };
  }).concat(extra);
  return all;
}
function viewForum() {
  crumbs('论坛');
  var h = '<div class="brmm-title">' + ic('forum') + '论坛</div>';
  h += '<div class="brmm-pills"><span class="brmm-pill">' + ic('flame') + '只看热议</span></div>';
  brmmForum().forEach(function (p) {
    h += '<div class="brmm-post"><h4>' + ic('forum') + '【' + esc(p.tag) + '】' + esc(p.title) + '</h4><p>' + esc(p.body) + '</p>';
    (p.reps || []).forEach(function (r) {
      h += '<div class="brmm-reply"><b>' + esc(r.w) + '：</b>' + esc(r.t) + '</div>';
    });
    h += '<div style="display:flex;gap:6px;margin-top:8px"><input class="brmm-input" id="brmm-rep-' + esc(p.id) + '" placeholder="回一句…" maxlength="200">'
      + '<button type="button" class="brmm-go" data-brmm="forum-rep" data-id="' + esc(p.id) + '">回复</button></div></div>';
  });
  h += '<div class="brmm-foot">海鸣町 · 21点浴场茶话会同步</div>';
  return h;
}
function brmmForumRep(id) {
  try {
    var input = runtime.root.querySelector('#brmm-rep-' + id);
    var text = input ? String(input.value || '').trim().slice(0, 200) : '';
    if (!text) { toast('先写点什么再回复'); return; }
    var mine = lsGet('forum_mine', {});
    var found = false;
    BRMM_POSTS.forEach(function (p) { if (p.id === id) found = true; });
    if (found) {
      mine[id] = (mine[id] || []).concat([{ w: '你', t: text }]);
      lsSet('forum_mine', mine);
    } else {
      var extra = lsGet('forum_extra', []);
      extra.forEach(function (p) { if (p.id === id) { p.reps = (p.reps || []).concat([{ w: '你', t: text }]); } });
      lsSet('forum_extra', extra);
    }
    go('forum');
    toast('已跟帖');
  } catch (e) { toast('回复失败'); }
}
/* ----- 天气新闻 ----- */
function viewWeather() {
  crumbs('天气新闻');
  var ct = (typeof brmmCustomTime === 'function') ? brmmCustomTime() : null;
  var d = new Date();
  var mo = ct ? ct.mo : (d.getMonth() + 1), da = ct ? ct.da : d.getDate();
  var week = ['日', '一', '二', '三', '四', '五', '六'][(ct ? new Date(d.getFullYear(), mo - 1, da).getDay() : d.getDay())];
  var tide = (da % 2 === 0) ? '满潮 18:20 · 干潮 06:05' : '干潮 17:40 · 满潮 05:30';
  var h = '<div class="brmm-title">' + ic('weather') + '天气新闻</div>';
  h += '<div class="brmm-pills"><span class="brmm-pill">' + ic('news') + mo + '/' + da + ' 周' + week + '</span><span class="brmm-pill">' + ic('sun') + '晴，海风微凉</span></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">渔业天气</span><div style="font-size:12px;line-height:1.8">日本海沿岸晴，浪高 1 米，西南风 3 级。<br>收音机：明晨有雾，出港渔船注意瞭望。<br>澪：……收音机我调好了。</div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">潮汐</span><div style="font-size:12px;line-height:1.8">' + esc(tide) + '<br>退潮时堤根可翻螃蟹，涨潮勿近离岸堤。</div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">巴士·矶波号</span><div style="font-size:12px;line-height:1.8">海鸣神社前发车，每日三班：<br>7:00 早市归来 · 13:30 学生购物 · 17:10 末班<br>单程约 1 小时 50 分，山路易晕车。</div></div>';
  h += '<div class="brmm-post"><h4>' + ic('news') + '【早市】竹荚鱼试吃</h4><p>水产加工阿姨今晚煎刚做的鱼干，将棋长老们已在长椅上占座。</p><div class="brmm-meta">海鸣町早市 · 今晨</div></div>';
  h += '<div class="brmm-post"><h4>' + ic('news') + '【公告】逆潮祭将至</h4><p>神社青苔石祠的替身人偶已备好，夜里听见太鼓声不要出门。</p><div class="brmm-meta">海鸣神社 · 昨日</div></div>';
  h += '<div class="brmm-foot">消息来源：浴场茶话会</div>';
  return h;
}

// P4/4 —— 主屏 / 设置 / 大图 / 桥接（投递+副API） / 路由 / 启动
var BRMM_APPS = [
  { id: 'line', icon: 'line', name: 'LINE' },
  { id: 'camera', icon: 'camera', name: '相机' },
  { id: 'shop', icon: 'cart', name: '网购' },
  { id: 'forum', icon: 'forum', name: '论坛' },
  { id: 'weather', icon: 'weather', name: '天气' },
  { id: 'settings', icon: 'settings', name: '设置' }
];
function viewLock() {
  crumbs('');
  var bg = '';
  try { bg = brmmLockWallCSS(); } catch (e) { bg = '#fff'; }
  return '<div class="brmm-lock" data-brmm="unlock" style="background:' + esc(bg) + ';background-size:cover;background-position:center;margin:-8px -10px -12px;padding:48px 10px;min-height:100%;box-sizing:border-box">'
    + '<div class="brmm-lock-clock" id="brmm-lock-clock">' + brmmHM() + '</div>'
    + '<div class="brmm-lock-date" id="brmm-lock-date">' + brmmDateStr() + '</div>'
    + '<div class="brmm-lock-hint">轻触屏幕解锁</div>'
    + '</div>';
}
function viewHome() {
  crumbs('');
  var h = '<div class="brmm-clockw"><div class="brmm-clockw-big" id="brmm-home-clock">' + brmmHM() + '</div>'
    + '<div class="brmm-clockw-sub" id="brmm-home-date">' + brmmDateStr() + ' · 海鸣町</div></div>';
  h += '<div class="brmm-apps">';
  BRMM_APPS.forEach(function (a) {
    h += '<button type="button" class="brmm-app" data-brmm="app" data-id="' + esc(a.id) + '">' + ic(a.icon) + '<span>' + esc(a.name) + '</span></button>';
  });
  h += '</div><div class="brmm-foot">海鸣町定制版 v' + BRMM_VERSION + '</div>';
  return h;
}
function viewSettings() {
  crumbs('设置');
  var h = '<div class="brmm-title">' + ic('settings') + '设置</div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">主题</span><div style="display:flex;gap:8px">'
    + '<button type="button" class="brmm-chip' + (settings.theme === 'mio' ? ' brmm-chip--on' : '') + '" data-brmm="set-theme" data-v="mio">澪·浅蓝</button>'
    + '<button type="button" class="brmm-chip' + (settings.theme === 'tsuru' ? ' brmm-chip--on' : '') + '" data-brmm="set-theme" data-v="tsuru">鹤·暖黄</button></div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">字号</span><div style="display:flex;gap:8px">'
    + '<button type="button" class="brmm-chip' + (settings.fontScale === 1 ? ' brmm-chip--on' : '') + '" data-brmm="set-font" data-v="1">标准</button>'
    + '<button type="button" class="brmm-chip' + (settings.fontScale === 1.15 ? ' brmm-chip--on' : '') + '" data-brmm="set-font" data-v="1.15">大字</button></div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">LINE 回信方式</span><div style="display:flex;gap:8px">'
    + '<button type="button" class="brmm-chip' + (settings.lineMode === 'main' ? ' brmm-chip--on' : '') + '" data-brmm="set-linemode" data-v="main">主线回</button>'
    + '<button type="button" class="brmm-chip' + (settings.lineMode === 'sub' ? ' brmm-chip--on' : '') + '" data-brmm="set-linemode" data-v="sub">副API回</button></div>'
    + '<div style="font-size:11px;color:#888;margin-top:6px">主线回：写入输入框，发送后由主 API 在主线回复。副API回：用下面配置的接口单独回，不占主线。</div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">副API配置</span>'
    + '<div style="display:flex;flex-direction:column;gap:6px">'
    + '<input class="brmm-input" id="brmm-ai-url" placeholder="API URL（OpenAI 兼容）" value="' + esc(settings.aiurl) + '">'
    + '<input class="brmm-input" id="brmm-ai-model" placeholder="模型名" value="' + esc(settings.aimodel) + '">'
    + '<input class="brmm-input" id="brmm-ai-key" type="password" placeholder="API Key（只存本机）" value="' + esc(lsGet('aikey', '')) + '">'
    + '<button type="button" class="brmm-go" data-brmm="ai-save">保存副API配置</button>'
    + '<button type="button" class="brmm-go" data-brmm="ai-models" style="background:#fff">拉取模型列表</button></div>'
    + brmmModelSelectHTML() + '</div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">壁纸</span><div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button type="button" class="brmm-chip' + (settings.wallpaper === 'sea' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-v="sea">海蓝</button>'
    + '<button type="button" class="brmm-chip' + (settings.wallpaper === 'warm' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-v="warm">暖黄</button>'
    + '<button type="button" class="brmm-chip' + (settings.wallpaper === 'pink' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-v="pink">樱粉</button>'
    + '<button type="button" class="brmm-chip' + (settings.wallpaper === 'night' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-v="night">夜空</button></div>'
    + '<div style="display:flex;gap:6px;margin-top:8px"><input class="brmm-input" id="brmm-wall-url" placeholder="自定义壁纸直链（https://…）" value="' + esc(settings.wallurl) + '">'
    + '<button type="button" class="brmm-go" data-brmm="wall-save">换上</button></div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">锁屏壁纸</span><div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button type="button" class="brmm-chip' + (settings.lockwall === 'sea' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-w="lock" data-v="sea">海蓝</button>'
    + '<button type="button" class="brmm-chip' + (settings.lockwall === 'warm' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-w="lock" data-v="warm">暖黄</button>'
    + '<button type="button" class="brmm-chip' + (settings.lockwall === 'pink' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-w="lock" data-v="pink">樱粉</button>'
    + '<button type="button" class="brmm-chip' + (settings.lockwall === 'night' ? ' brmm-chip--on' : '') + '" data-brmm="wall-pre" data-w="lock" data-v="night">夜空</button></div>'
    + '<div style="display:flex;gap:6px;margin-top:8px"><input class="brmm-input" id="brmm-lock-url" placeholder="锁屏壁纸直链（https://…）" value="' + esc(settings.lockurl) + '">'
    + '<button type="button" class="brmm-go" data-brmm="wall-save" data-w="lock">换上</button></div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">时间</span><div style="display:flex;gap:8px">'
    + '<button type="button" class="brmm-chip' + (settings.timemode !== 'custom' ? ' brmm-chip--on' : '') + '" data-brmm="time-mode" data-v="auto">跟随本机</button>'
    + '<button type="button" class="brmm-chip' + (settings.timemode === 'custom' ? ' brmm-chip--on' : '') + '" data-brmm="time-mode" data-v="custom">自定义</button></div>'
    + '<div style="display:flex;gap:6px;margin-top:8px">'
    + '<input class="brmm-input" id="brmm-t-mo" type="number" min="1" max="12" placeholder="月" value="' + esc(settings.timemo) + '">'
    + '<input class="brmm-input" id="brmm-t-da" type="number" min="1" max="31" placeholder="日" value="' + esc(settings.timeda) + '">'
    + '<input class="brmm-input" id="brmm-t-ho" type="number" min="0" max="23" placeholder="时" value="' + esc(settings.timeho) + '">'
    + '<input class="brmm-input" id="brmm-t-mi" type="number" min="0" max="59" placeholder="分" value="' + esc(settings.timemi) + '"></div>'
    + '<div style="margin-top:8px"><button type="button" class="brmm-go" data-brmm="time-save">保存时间</button></div>'
    + '<div style="font-size:11px;color:#888;margin-top:6px">自定义后锁屏、主屏、天气都显示设定的海鸣町时间。</div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">同步状态</span><div style="font-size:12px;line-height:1.9" id="brmm-syncstat">'
    + brmmSyncStatusHTML() + '</div>'
    + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
    + '<button type="button" class="brmm-go" data-brmm="sum-all">总结全部</button>'
    + '<button type="button" class="brmm-go" data-brmm="wb-retry" style="background:#fff">重测世界书</button></div>'
    + '<div style="font-size:11px;color:#888;margin-top:6px">聊天超约500字自动总结；总结与近况进世界书/隐形注入，输入框不再堆全文。</div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">配置带走</span>'
    + '<div style="font-size:11px;color:#888;margin-bottom:6px">把壁纸、时间、主题、聊天存档打包成文本，发给别人导入即用（不含 API Key）。</div>'
    + '<div style="display:flex;gap:6px;margin-bottom:6px"><button type="button" class="brmm-go" data-brmm="cfg-export">导出配置</button></div>'
    + '<textarea class="brmm-input" id="brmm-cfg-io" rows="3" placeholder="导出后复制这里的文本 / 粘贴别人的配置到这里" style="resize:vertical"></textarea>'
    + '<div style="margin-top:6px"><button type="button" class="brmm-go" data-brmm="cfg-import">导入配置</button></div></div>';
  h += '<div class="brmm-sect"><span class="brmm-sectT">存档</span>'
    + '<button type="button" class="brmm-go" data-brmm="wipe" style="background:#fff">清除本机全部聊天存档</button></div>';
  h += '<div class="brmm-foot">海鸣町定制版 v' + BRMM_VERSION + ' · 独立组件</div>';
  return h;
}
function brmmSyncStatusHTML() {
  try {
    var h = '';
    var wb = (runtime.wbOk === true) ? '世界书「小手机同步」：可用'
      : (runtime.wbOk === false ? '世界书：' + esc(runtime.wbErr || '未检出，已降级') : '世界书：待检测（发条消息即测）');
    h += esc(wb) + '<br>';
    var helper = null;
    try { helper = brmmTavernHelper(); } catch (e) {}
    h += '隐形注入：' + ((helper && typeof helper.injectPrompts === 'function') ? '可用' : '未检出（靠手动同步）') + '<br>';
    BRMM_THREADS.forEach(function (t) {
      var n = 0, sl = 0;
      try { n = brmmThreadLines(t.id).length; } catch (e) {}
      try { sl = String((brmmGetSum(t.id) || {}).summary || '').length; } catch (e) {}
      h += esc(t.name + '：' + n + '条 / 总结' + sl + '字') + '<br>';
    });
    return h;
  } catch (e) { return '状态读取失败'; }
}
function brmmModelSelectHTML() {
  try {
    var list = lsGet('ai_models', []);
    if (!Array.isArray(list) || !list.length) return '';
    var h = '<div style="margin-top:6px"><select class="brmm-input" id="brmm-ai-list">';
    h += '<option value="">从列表选模型…（共' + list.length + '个）</option>';
    list.forEach(function (m) {
      h += '<option value="' + esc(m) + '"' + (settings.aimodel === m ? ' selected' : '') + '>' + esc(m) + '</option>';
    });
    return h + '</select></div>';
  } catch (e) { return ''; }
}
/* ----- 大图 ----- */
function brmmViewer(url, cap) {
  try {
    var v = runtime.root.querySelector('#brmm-viewer');
    var img = runtime.root.querySelector('#brmm-viewer-img');
    img.src = url; img.alt = String(cap || '');
    v.classList.add('brmm-viewer--open');
  } catch (e) {}
}
function brmmViewerClose() {
  try { runtime.root.querySelector('#brmm-viewer').classList.remove('brmm-viewer--open'); } catch (e) {}
}
/* ----- 桥接：投递输入框（搬运自参考实现模式） ----- */
function brmmTavernHelper() {
  try { if (typeof TavernHelper !== 'undefined' && TavernHelper) return TavernHelper; } catch (e) {}
  try { return hostWindow.TavernHelper || null; } catch (e) { return null; }
}
function brmmEscPipe(text) { return String(text).replace(/\|/g, '\\|'); }
function brmmSlashRunner() {
  var helper = brmmTavernHelper();
  if (helper && typeof helper.triggerSlash === 'function') {
    return function (command) { return helper.triggerSlash(command); };
  }
  try {
    if (typeof triggerSlash === 'function') return function (command) { return triggerSlash(command); };
  } catch (e) {}
  return null;
}
function brmmRunSlash(command) {
  var runner = brmmSlashRunner();
  if (!runner) return Promise.reject(new Error('酒馆助手命令接口尚未就绪'));
  try { return Promise.resolve(runner(command)); } catch (error) { return Promise.reject(error); }
}
function brmmHostInputValue() {
  try {
    var input = hostDocument.querySelector('#send_textarea');
    if (!input) return '';
    return String(input.value != null ? input.value : input.textContent || '');
  } catch (e) { return ''; }
}
function brmmDeliver(text) {
  var current = brmmHostInputValue().replace(/[\t ]+$/gm, '').replace(/\s+$/, '');
  var combined = current ? current + '\n' + text : text;
  var commandText = brmmEscPipe(combined).replace(/\r?\n/g, '{{newline}}');
  return brmmRunSlash('/setinput ' + commandText).then(function () { return true; });
}
/* ----- 桥接：副API（generateRaw，OpenAI 兼容自备接口） ----- */
var brmmGenBusy = false;
function brmmSubReply(thread, msgs) {
  if (brmmGenBusy) return Promise.reject(new Error('上一条还在生成中，稍等'));
  var url = String(settings.aiurl || '').trim();
  var model = String(settings.aimodel || '').trim();
  var key = String(lsGet('aikey', '') || '').trim();
  if (!url || !model) return Promise.reject(new Error('先去设置里保存 API URL 与模型'));
  if (!key) return Promise.reject(new Error('先去设置里填写 API Key'));
  var helper = brmmTavernHelper();
  if (!helper || typeof helper.generateRaw !== 'function') return Promise.reject(new Error('酒馆助手 generateRaw 接口尚未就绪'));
  var history = (msgs || []).slice(-12).map(function (m) {
    return { role: m.who === 'me' ? 'user' : 'assistant', content: String(m.text || '').slice(0, 1000) };
  }).filter(function (m) { return m.content; });
  if (!history.length) return Promise.reject(new Error('没有可发送的内容'));
  brmmGenBusy = true;
  var gid = 'brmm' + Date.now();
  var timer = hostWindow.setTimeout(function () {
    try { if (helper && typeof helper.stopGenerationById === 'function') helper.stopGenerationById(gid); } catch (e) {}
  }, 45000);
  function done() { brmmGenBusy = false; try { hostWindow.clearTimeout(timer); } catch (e) {} }
  try {
    return Promise.resolve(helper.generateRaw.call(helper, {
      generation_id: gid, should_silence: true, should_stream: false, max_chat_history: 0,
      ordered_prompts: [{ role: 'system', content: thread.sys }].concat(history),
      custom_api: { apiurl: url, key: key, model: model, source: 'openai' }
    })).then(function (res) {
      done();
      if (typeof res === 'string' && res.trim()) return res.trim().slice(0, 800);
      if (res && typeof res === 'object') {
        var c = res.content || res.text || res.message || '';
        if (typeof c === 'string' && c.trim()) return c.trim().slice(0, 800);
      }
      throw new Error('副API返回为空，请检查接口与模型');
    }, function (err) {
      done();
      throw new Error((err && err.message) || '副API请求失败');
    });
  } catch (e) { done(); return Promise.reject(e); }
}
/* ----- 桥接：模型列表（getModelList） ----- */
var brmmModelsBusy = false;
function brmmFetchModels(apiurl, key) {
  if (brmmModelsBusy) return Promise.reject(new Error('正在拉取，请稍候'));
  var helper = brmmTavernHelper();
  if (!helper || typeof helper.getModelList !== 'function') return Promise.reject(new Error('酒馆助手 getModelList 接口尚未就绪'));
  if (!apiurl) return Promise.reject(new Error('先填写 API URL'));
  if (!key) return Promise.reject(new Error('先填写 API Key'));
  brmmModelsBusy = true;
  var timer = hostWindow.setTimeout(function () { brmmModelsBusy = false; }, 30000);
  function done() { brmmModelsBusy = false; try { hostWindow.clearTimeout(timer); } catch (e) {} }
  try {
    return Promise.resolve(helper.getModelList.call(helper, { apiurl: apiurl, key: key })).then(function (value) {
      done();
      var out = [], seen = {};
      (Array.isArray(value) ? value.slice(0, 200) : []).forEach(function (item) {
        if (typeof item !== 'string') return;
        var m = String(item).trim().slice(0, 256);
        if (!m || seen[m]) return;
        seen[m] = true; out.push(m);
      });
      if (!out.length) throw new Error('API 未返回可用模型');
      return out;
    }, function (err) {
      done();
      throw new Error((err && err.message) || '拉取失败');
    });
  } catch (e) { done(); return Promise.reject(e); }
}
/* ----- 桥接：LINE 摘要注入（角色在正文里知道手机聊了什么） ----- */
var BRMM_DIGEST_ID = 'brmm-line-digest';
function brmmBuildDigest() {
  try {
    var blocks = [], used = 0, budget = 40;
    for (var i = 0; i < BRMM_THREADS.length && used < budget; i++) {
      var t = BRMM_THREADS[i];
      var sum = null;
      try { sum = brmmGetSum(t.id); } catch (e) {}
      var lines = brmmThreadLines(t.id);
      var fresh = lines.slice(sum ? sum.upto : 0).slice(-8);
      var parts = [];
      if (sum && sum.summary) { parts.push('过往总结：' + sum.summary); used += 4; }
      fresh.forEach(function (ln) {
        if (used >= budget) return;
        parts.push(String(ln).slice(0, 200));
        used++;
      });
      if (parts.length) blocks.push('与' + t.name + '的LINE：\n' + parts.join('\n'));
    }
    if (!blocks.length) return '';
    return '【手机LINE摘要（系统后台记录，非正文）】\n' + blocks.join('\n\n')
      + '\n（铁律：以上只是后台记录。正文只写散文，绝不复述、排版或重写以上内容；任何角色都看不到 user 的手机屏幕，只能对亲历之事做反应。）';
  } catch (e) { return ''; }
}
function brmmRefreshDigest() {
  try {
    var helper = brmmTavernHelper();
    if (!helper || typeof helper.injectPrompts !== 'function' || typeof helper.uninjectPrompts !== 'function') return;
    try { helper.uninjectPrompts([BRMM_DIGEST_ID]); } catch (e) {}
    var digest = brmmBuildDigest();
    if (!digest) return;
    helper.injectPrompts([{ id: BRMM_DIGEST_ID, position: 'in_chat', depth: 1, role: 'system', content: digest, should_scan: true }]);
  } catch (e) {}
}
function brmmClearDigest() {
  try {
    var helper = brmmTavernHelper();
    if (helper && typeof helper.uninjectPrompts === 'function') helper.uninjectPrompts([BRMM_DIGEST_ID]);
  } catch (e) {}
}
/* ----- 同步引擎：滚动总结（防爆 token） + 世界书/注入/精简输入三级投递 ----- */
var BRMM_SUM_FRESH = 500;   // 新增超此字数即触发总结
var BRMM_SUMMARY_MAX = 600; // 总结上限字数
var BRMM_WB_BOOK = '小手机同步';
var BRMM_WB_MARK = 'BRMM-SYNC-v1';
runtime.wbFound = [];
runtime.wbOk = null;
runtime.wbErr = '';
runtime.summing = {};
function brmmThreadLines(id) {
  return brmmLineMsgs(id).filter(function (m) { return m.who !== 'sys'; }).map(function (m) {
    return (m.who === 'me' ? '你' : brmmThread(id).name) + '：' + String(m.text || '');
  });
}
function brmmGetSum(id) {
  var s = lsGet('line_sum_' + id, null);
  if (s && typeof s === 'object') return { summary: String(s.summary || ''), upto: Number(s.upto) || 0 };
  return { summary: '', upto: 0 };
}
function brmmCompressCall(raw) {
  var url = String(settings.aiurl || '').trim();
  var model = String(settings.aimodel || '').trim();
  var key = String(lsGet('aikey', '') || '').trim();
  if (!url || !model || !key) return Promise.reject(new Error('no-subapi'));
  var helper = brmmTavernHelper();
  if (!helper || typeof helper.generateRaw !== 'function') return Promise.reject(new Error('no-generateRaw'));
  var gid = 'brmmsum' + Date.now();
  var timer = hostWindow.setTimeout(function () {
    try { if (helper && typeof helper.stopGenerationById === 'function') helper.stopGenerationById(gid); } catch (e) {}
  }, 45000);
  function done() { try { hostWindow.clearTimeout(timer); } catch (e) {} }
  try {
    return Promise.resolve(helper.generateRaw.call(helper, {
      generation_id: gid, should_silence: true, should_stream: false, max_chat_history: 0,
      ordered_prompts: [
        { role: 'system', content: '把以下手机聊天记录压缩成3-6条事实（谁说了什么、约好什么、情绪变化），200字以内，只写事实不写对话，不评价。' },
        { role: 'user', content: String(raw).slice(0, 4000) }
      ],
      custom_api: { apiurl: url, key: key, model: model, source: 'openai' }
    })).then(function (res) {
      done();
      var c = (typeof res === 'string') ? res : (res && (res.content || res.text || res.message)) || '';
      c = String(c || '').trim().slice(0, BRMM_SUMMARY_MAX);
      if (!c) throw new Error('empty');
      return c;
    }, function (err) { done(); throw err; });
  } catch (e) { done(); return Promise.reject(e); }
}
function brmmNoteThread(id) {
  try {
    var msgs = brmmLineMsgs(id);
    var sum = brmmGetSum(id);
    var freshLines = brmmThreadLines(id).slice(sum.upto);
    var freshChars = freshLines.join('\n').length;
    if (freshChars < BRMM_SUM_FRESH && sum.summary) { brmmPushAll(); return; }
    if (runtime.summing[id]) return;
    var raw = (sum.summary ? sum.summary + '\n' : '') + freshLines.join('\n');
    if (raw.length <= BRMM_SUM_FRESH + BRMM_SUMMARY_MAX && sum.summary) {
      lsSet('line_sum_' + id, { summary: raw.slice(-(BRMM_SUMMARY_MAX)) , upto: brmmThreadLines(id).length });
      brmmPushAll();
      return;
    }
    runtime.summing[id] = true;
    brmmCompressCall(raw).then(function (c) {
      runtime.summing[id] = false;
      lsSet('line_sum_' + id, { summary: c, upto: brmmThreadLines(id).length });
      brmmPushAll();
    }, function () {
      runtime.summing[id] = false;
      var naive = raw.slice(-1000);
      lsSet('line_sum_' + id, { summary: '（较早记录已省略）\n' + naive, upto: brmmThreadLines(id).length });
      brmmPushAll();
    });
  } catch (e) { try { brmmPushAll(); } catch (e2) {} }
}
function brmmPushAll() {
  try { brmmPushWorldbook(); } catch (e) {}
  try { brmmRefreshDigest(); } catch (e) {}
}
/* ----- 世界书：探测 + 尝试写入（全程静默降级，状态进设置页） ----- */
function brmmWbProbe() {
  var found = [];
  try {
    var h = brmmTavernHelper();
    if (h) {
      ['getWorldbook', 'getWorldbooks', 'createWorldbook', 'createWorldbookEntries', 'updateWorldbookWith', 'updateWorldbook', 'replaceWorldbook'].forEach(function (k) {
        try { if (typeof h[k] === 'function' && found.indexOf(k) < 0) found.push(k); } catch (e) {}
      });
    }
  } catch (e) {}
  try {
    ['getWorldbook', 'createWorldbookEntries', 'updateWorldbookWith'].forEach(function (k) {
      try { if (typeof window[k] === 'function' && found.indexOf('window:' + k) < 0) found.push('window:' + k); } catch (e) {}
    });
  } catch (e) {}
  runtime.wbFound = found;
  return found;
}
function brmmWbEntries() {
  var out = [];
  BRMM_THREADS.forEach(function (t) {
    var sum = brmmGetSum(t.id);
    var fresh = brmmThreadLines(t.id).slice(Math.max(0, sum.upto)).slice(-8).join('\n');
    var body = sum.summary ? sum.summary + (fresh ? '\n最近：\n' + fresh : '') : fresh;
    if (!body) return;
    out.push({
      keys: ['LINE', t.name, '小手机', '手机'],
      content: BRMM_WB_MARK + '\n【小手机同步·' + t.name + '】（手机聊天后台记录，正文只做散文参考，绝不复述）\n' + String(body).slice(0, 1400),
      constant: true
    });
  });
  return out;
}
function brmmWbCall(name, args) {
  var h = brmmTavernHelper();
  var fn = null;
  try { if (h && typeof h[name] === 'function') fn = { f: h[name], o: h }; } catch (e) {}
  if (!fn) { try { if (typeof window[name] === 'function') fn = { f: window[name], o: window }; } catch (e) {} }
  if (!fn) throw new Error('no-fn:' + name);
  return Promise.resolve(fn.f.apply(fn.o, args));
}
function brmmPushWorldbook() {
  try {
    if (runtime.wbOk === false) return Promise.resolve(false);
    var found = brmmWbProbe();
    var hasGet = found.indexOf('getWorldbook') >= 0 || found.indexOf('window:getWorldbook') >= 0;
    var writer = null;
    ['createWorldbookEntries', 'updateWorldbookWith', 'replaceWorldbook', 'window:createWorldbookEntries', 'window:updateWorldbookWith'].forEach(function (k) {
      if (!writer && found.indexOf(k) >= 0) writer = k.replace(/^window:/, '');
    });
    if (!hasGet || !writer) {
      runtime.wbOk = false;
      runtime.wbErr = '未检出成对的世界书读写接口（已见：' + (found.join(',') || '无') + '），已用隐形注入代替';
      return Promise.resolve(false);
    }
    var entries = brmmWbEntries();
    if (!entries.length) return Promise.resolve(true);
    return brmmWbCall(writer.indexOf('window:') === 0 ? writer.slice(7) : writer, [BRMM_WB_BOOK, entries]).then(function () {
      var g = found.indexOf('getWorldbook') >= 0 ? 'getWorldbook' : 'getWorldbook';
      return brmmWbCall(g, [BRMM_WB_BOOK]);
    }).then(function (back) {
      var s = '';
      try { s = JSON.stringify(back).slice(0, 8000); } catch (e) {}
      if (s && s.indexOf(BRMM_WB_MARK) >= 0) {
        runtime.wbOk = true; runtime.wbErr = '';
        return true;
      }
      throw new Error('read-back-mismatch');
    }).then(null, function (err) {
      runtime.wbOk = false;
      runtime.wbErr = '世界书写入未成功（' + String((err && err.message) || err).slice(0, 60) + '），已用隐形注入代替';
      return false;
    });
  } catch (e) { return Promise.resolve(false); }
}
/* ----- 路由 ----- */
function render() {
  try {
    ensureShell();
    var h = '';
    if (runtime.view === 'lock' || runtime.locked) h = viewLock();
    else if (runtime.view === 'home') h = viewHome();
    else if (runtime.view === 'line') h = viewLineList();
    else if (runtime.view === 'line-chat') h = viewLineChat(runtime.viewArg);
    else if (runtime.view === 'camera') h = viewCamera();
    else if (runtime.view === 'shop') h = viewShop();
    else if (runtime.view === 'forum') h = viewForum();
    else if (runtime.view === 'weather') h = viewWeather();
    else if (runtime.view === 'settings') h = viewSettings();
    else h = viewHome();
    runtime.screen.innerHTML = h;
    hydrateAvatars(runtime.screen);
    if (runtime.view !== 'line-chat') runtime.screen.scrollTop = 0;
  } catch (e) {}
}
function onAction(el) {
  var act = el.getAttribute('data-brmm');
  var id = el.getAttribute('data-id');
  if (act === 'unlock') { unlockPhone(); return; }
  if (act === 'back') { go('home'); return; }
  if (act === 'viewer-close') { brmmViewerClose(); return; }
  if (act === 'app') { go(id === 'line' ? 'line' : id); return; }
  if (act === 'line-open') { go('line-chat', id); brmmLineScroll(); return; }
  if (act === 'line-send') { brmmLineSend(id); return; }
  if (act === 'line-mode') {
    settings.lineMode = settings.lineMode === 'sub' ? 'main' : 'sub';
    saveSettings(); go('line-chat', runtime.viewArg); brmmLineScroll();
    toast(settings.lineMode === 'sub' ? '已切换：副API回信' : '已切换：主线回信');
    return;
  }
  if (act === 'line-sync') {
    try {
      var sid = runtime.viewArg || id;
      try { brmmNoteThread(sid); } catch (e) {}
      var helper0 = null;
      try { helper0 = brmmTavernHelper(); } catch (e) {}
      var canInject = !!(helper0 && typeof helper0.injectPrompts === 'function');
      if (runtime.wbOk === true || canInject) {
        lsSet('line_sync_' + sid, brmmLineMsgs(sid).length);
        toast('已同步，主线已知晓');
      } else {
        var st0 = brmmThread(sid);
        var sum0 = null;
        try { sum0 = brmmGetSum(sid); } catch (e) {}
        var tail0 = brmmThreadLines(sid).slice(-4).join('\n');
        var bulk0 = '【LINE同步·' + st0.name + '】' + (sum0 && sum0.summary ? sum0.summary + '\n' : '') + tail0;
        bulk0 = bulk0.slice(0, 400) + '\n（以上是手机里的聊天，正文已知晓，绝不复述。）';
        brmmDeliver(bulk0).then(function () {
          lsSet('line_sync_' + sid, brmmLineMsgs(sid).length);
          toast('已写入输入框（精简版），发送即生效');
        }, function (err) {
          toast('写入失败：' + (err && err.message ? err.message : '未知错误'));
        });
      }
    } catch (e) { toast('同步失败'); }
    return;
  }
  if (act === 'cam-shoot') { brmmCamShoot(Number(el.getAttribute('data-i'))); return; }
  if (act === 'cam-view') {
    var album = lsGet('album', []);
    var ph = album[Number(el.getAttribute('data-i'))];
    if (ph) brmmViewer(ph.url, ph.cap);
    return;
  }
  if (act === 'shop-tab') { lsSet('shop', id); go('shop'); return; }
  if (act === 'shop-buy') { brmmShopBuy(el.getAttribute('data-s'), Number(el.getAttribute('data-i'))); return; }
  if (act === 'forum-rep') { brmmForumRep(id); return; }
  if (act === 'set-theme') { settings.theme = el.getAttribute('data-v'); saveSettings(); go('settings'); return; }
  if (act === 'set-font') { settings.fontScale = Number(el.getAttribute('data-v')) || 1; saveSettings(); go('settings'); return; }
  if (act === 'set-linemode') { settings.lineMode = el.getAttribute('data-v'); saveSettings(); go('settings'); return; }
  if (act === 'ai-save') {
    try {
      var u = runtime.root.querySelector('#brmm-ai-url');
      var m = runtime.root.querySelector('#brmm-ai-model');
      var k = runtime.root.querySelector('#brmm-ai-key');
      settings.aiurl = u ? String(u.value || '').trim().slice(0, 2048) : '';
      settings.aimodel = m ? String(m.value || '').trim().slice(0, 256) : '';
      if (k) lsSet('aikey', String(k.value || ''));
      saveSettings(); toast('副API配置已保存');
    } catch (e) { toast('保存失败'); }
    return;
  }
  if (act === 'wall-pre') {
    var wt = el.getAttribute('data-w') || 'main';
    if (wt === 'lock') settings.lockwall = el.getAttribute('data-v');
    else settings.wallpaper = el.getAttribute('data-v');
    saveSettings(); go('settings'); toast(wt === 'lock' ? '锁屏壁纸已更换' : '壁纸已更换'); return;
  }
  if (act === 'wall-save') {
    try {
      var wt2 = el.getAttribute('data-w') || 'main';
      var w = runtime.root.querySelector(wt2 === 'lock' ? '#brmm-lock-url' : '#brmm-wall-url');
      var wv = w ? String(w.value || '').trim().slice(0, 2048) : '';
      if (!/^https?:\/\//.test(wv)) { toast('请填写 https 开头的图片直链'); return; }
      if (wt2 === 'lock') { settings.lockwall = 'custom'; settings.lockurl = wv; }
      else { settings.wallpaper = 'custom'; settings.wallurl = wv; }
      saveSettings(); go('settings'); toast(wt2 === 'lock' ? '锁屏壁纸已更换' : '壁纸已更换');
    } catch (e) { toast('更换失败'); }
    return;
  }
  if (act === 'time-mode') { settings.timemode = el.getAttribute('data-v'); saveSettings(); go('settings'); return; }
  if (act === 'time-save') {
    try {
      var gnum = function (id, lo, hi, fb) {
        var n = runtime.root.querySelector('#' + id);
        var v = n ? Math.floor(Number(n.value)) : NaN;
        return (v >= lo && v <= hi) ? v : fb;
      };
      settings.timemo = gnum('brmm-t-mo', 1, 12, settings.timemo);
      settings.timeda = gnum('brmm-t-da', 1, 31, settings.timeda);
      settings.timeho = gnum('brmm-t-ho', 0, 23, settings.timeho);
      settings.timemi = gnum('brmm-t-mi', 0, 59, settings.timemi);
      settings.timemode = 'custom';
      saveSettings(); go('settings'); toast('时间已设为海鸣町时间');
    } catch (e) { toast('保存失败'); }
    return;
  }
  if (act === 'cfg-export') {
    try {
      var out = { app: 'brmm-phone', v: 2, settings: {}, lines: {}, sums: {}, forum: null, album: null };
      ['theme', 'fontScale', 'lineMode', 'aiurl', 'aimodel', 'wallpaper', 'wallurl', 'lockwall', 'lockurl', 'timemode', 'timemo', 'timeda', 'timeho', 'timemi'].forEach(function (k) { out.settings[k] = settings[k]; });
      BRMM_THREADS.forEach(function (t) {
        try { out.lines[t.id] = lsGet('line_' + t.id, null); } catch (e) {}
        try { out.sums[t.id] = lsGet('line_sum_' + t.id, null); } catch (e) {}
      });
      try { out.forum = lsGet('forum_mine', null); } catch (e) {}
      try { out.album = lsGet('album', null); } catch (e) {}
      var box = runtime.root.querySelector('#brmm-cfg-io');
      if (box) { box.value = JSON.stringify(out); box.select(); }
      toast('配置已生成，长按复制发给别人');
    } catch (e) { toast('导出失败'); }
    return;
  }
  if (act === 'cfg-import') {
    try {
      var box2 = runtime.root.querySelector('#brmm-cfg-io');
      var raw = box2 ? String(box2.value || '').trim() : '';
      if (!raw) { toast('先粘贴别人发你的配置文本'); return; }
      var o = JSON.parse(raw);
      if (!o || o.app !== 'brmm-phone' || typeof o !== 'object') throw new Error('bad');
      if (o.settings && typeof o.settings === 'object') {
        ['theme', 'fontScale', 'lineMode', 'aiurl', 'aimodel', 'wallpaper', 'wallurl', 'lockwall', 'lockurl', 'timemode', 'timemo', 'timeda', 'timeho', 'timemi'].forEach(function (k) {
          if (o.settings[k] !== undefined) settings[k] = o.settings[k];
        });
        if (settings.theme !== 'tsuru') settings.theme = 'mio';
        settings.fontScale = Number(settings.fontScale) === 1.15 ? 1.15 : 1;
        if (settings.lineMode !== 'sub') settings.lineMode = 'main';
        if (settings.timemode !== 'custom') settings.timemode = 'auto';
      }
      if (o.lines && typeof o.lines === 'object') {
        Object.keys(o.lines).forEach(function (tid) {
          if (Array.isArray(o.lines[tid]) && o.lines[tid].length && o.lines[tid].length <= 200) lsSet('line_' + tid, o.lines[tid].slice(-120));
        });
      }
      if (o.sums && typeof o.sums === 'object') {
        Object.keys(o.sums).forEach(function (tid) {
          var s = o.sums[tid];
          if (s && typeof s === 'object' && typeof s.summary === 'string') {
            lsSet('line_sum_' + tid, { summary: s.summary.slice(0, 800), upto: Math.floor(Number(s.upto)) || 0 });
          }
        });
      }
      if (o.forum && typeof o.forum === 'object') lsSet('forum_mine', o.forum);
      if (Array.isArray(o.album) && o.album.length <= 60) lsSet('album', o.album);
      saveSettings(); go('settings'); toast('配置已导入');
    } catch (e) { toast('导入失败：文本不对'); }
    return;
  }
  if (act === 'ai-models') {
    try {
      var uu = runtime.root.querySelector('#brmm-ai-url');
      var kk = runtime.root.querySelector('#brmm-ai-key');
      var apiurl = uu ? String(uu.value || '').trim().slice(0, 2048) : String(settings.aiurl || '').trim();
      var key = kk ? String(kk.value || '') : String(lsGet('aikey', '') || '');
      if (uu && apiurl) { settings.aiurl = apiurl; }
      if (kk && key) { lsSet('aikey', key); }
      saveSettings();
      toast('正在拉取模型列表…');
      brmmFetchModels(apiurl, key).then(function (models) {
        lsSet('ai_models', models);
        if (runtime.view === 'settings') go('settings');
        toast('拉到 ' + models.length + ' 个模型，下拉选择');
      }, function (err) {
        toast('拉取失败：' + (err && err.message ? err.message : '未知错误'));
      });
    } catch (e) { toast('拉取失败'); }
    return;
  }
  if (act === 'sum-all') {
    try {
      BRMM_THREADS.forEach(function (t) { try { brmmNoteThread(t.id); } catch (e) {} });
      toast('总结中…稍后看各线程字数');
      var n = 0;
      var timer = hostWindow.setInterval(function () {
        n++;
        if (runtime.view === 'settings') go('settings');
        if (n >= 3) { try { hostWindow.clearInterval(timer); } catch (e) {} }
      }, 4000);
    } catch (e) { toast('总结失败'); }
    return;
  }
  if (act === 'wb-retry') {
    try {
      runtime.wbOk = null; runtime.wbErr = '';
      toast('正在检测世界书接口…');
      brmmPushWorldbook().then(function (ok) {
        if (runtime.view === 'settings') go('settings');
        toast(ok ? '世界书可用，已写入' : '仍不可用，看状态行原因');
      });
    } catch (e) { toast('检测失败'); }
    return;
  }
  if (act === 'wipe') {
    try {
      var keys = [];
      try {
        for (var i = 0; i < hostWindow.localStorage.length; i++) {
          var kk = hostWindow.localStorage.key(i);
          if (kk && kk.indexOf(LS_PREFIX) === 0) keys.push(kk);
        }
      } catch (e) {}
      keys.forEach(function (kk) { try { hostWindow.localStorage.removeItem(kk); } catch (e) {} });
      brmmClearDigest();
      Object.assign(settings, { theme: 'mio', fontScale: 1, lineMode: 'main', aiurl: '', aimodel: '', wallpaper: 'sea', wallurl: '', lockwall: 'sea', lockurl: '', timemode: 'auto', timemo: 11, timeda: 20, timeho: 19, timemi: 32 });
      saveSettings(); go('home'); toast('已清除本机存档');
    } catch (e) { toast('清除失败'); }
    return;
  }
}
/* ----- 启动 ----- */
try {
  ensureShell();
  runtime.root.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== runtime.root) {
      if (el.getAttribute && el.getAttribute('data-brmm')) { onAction(el); return; }
      el = el.parentElement;
    }
  });
  runtime.root.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { brmmViewerClose(); return; }
    if (e.key === 'Enter' && !e.shiftKey && e.target && e.target.id === 'brmm-line-input') {
      e.preventDefault();
      brmmLineSend(runtime.viewArg);
    }
  });
  runtime.root.addEventListener('change', function (e) {
    try {
      if (e.target && e.target.id === 'brmm-ai-list' && e.target.value) {
        settings.aimodel = String(e.target.value).slice(0, 256);
        var mi = runtime.root.querySelector('#brmm-ai-model');
        if (mi) mi.value = settings.aimodel;
        saveSettings();
        toast('已选模型：' + settings.aimodel);
      }
    } catch (err) {}
  });
  hostDocument.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && runtime.root && runtime.root.classList.contains('brmm-ov--open')) closePhone();
  });
} catch (e) {}
})();
