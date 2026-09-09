/*
 * Ruby宇宙·统一控制中心 v1
 * 悬浮球入口（随时可开） + 全屏管理面板：
 *   - 模块状态总览（运行中/休眠中/已关闭·27个）+ 一键切换（按需/强制开启/关闭）
 *   - 动态调度器休眠状态 + 重置
 *   - 全局统计（条目/常驻/字数）
 *   - 批量操作（全部按需/强制/关闭）
 * 依赖：酒馆助手（TavernHelper 世界书读写API）
 */
(function () {
  'use strict';
  const SLOT = '__RUBY_CC_V1__';
  const SCHED_KEY = 'ruby_dyn_sched_v1';
  const MVU_MODS = (function(){ try { var H = (window.parent && window.parent !== window) ? window.parent : window; if (H.__RUBY_MVU_MODS__ && H.__RUBY_MVU_MODS__.length) return H.__RUBY_MVU_MODS__; } catch (_) {} return ['临海市二中', '五色棱光', '青梅正宗', '栖澜镇', '御木市', '岁寒新正']; })();
  function wbMutex(fn) { try { const M = HW.__RUBY_WB_MUTEX__ || (window.parent && window.parent.__RUBY_WB_MUTEX__); return M ? M(fn) : fn(); } catch (_) { return fn(); } } /* 活引用: 调用时查询（注册中心可能晚于本脚本就绪） */
  const MVU_INFO = '6模块22顶层键正交命名空间隔离，可任意同开；运行中切换模块后下一条开场白初始化自动套用新schema组合';
  function REG_HEALTH_HTML() { try { const h = HW.__RUBY_WB_HEALTH__ || (window.parent && window.parent.__RUBY_WB_HEALTH__); if (!h || !h.ready) return '<br><span style="color:#ffb08a">⚠ MVU注册中心未就绪：schema未接管，变量回落MVU原生initvar模式（请检查网络或重启聊天）</span>'; if (!h.schemaOk) return '<br><span style="color:#ffb08a">⚠ mvu_zod.js 加载失败：schema未接管（指令同步/宪法/互斥照常运行）</span>'; return ''; } catch (_) { return ''; } }
  const MVU_INSTR_RE = /(?:\[mvu_update\]|变量(?:输出|更新)规则|变量列表|变量当前状态|动态关系反馈|状态面板输出规则|核心规则清单|支线任务清单管理)/;
  function isMvuInstruction(cm) { const t = String(cm || '').replace(/^【[^】]+】/, ''); return MVU_INSTR_RE.test(t); } /* MVU指令心脏: 按需模式也常驻 */
  const PRESETS = {
    '纯县城': { all: 'off' },
    '校园青春': { '临海市二中': 'demand', '青梅正宗': 'demand', '五色棱光': 'demand', '寄宿高中': 'demand', '沈仁职校': 'demand', '林霜': 'demand', '心动2004': 'demand', '六中2001': 'demand', '筒子楼2008': 'demand', '蒹葭苍苍': 'demand', '嫂子日常': 'demand', all: 'off' },
    '都市群像': { '商枝市': 'demand', '广海理工': 'demand', '海棠': 'demand', '正太控': 'demand', '栖澜镇': 'demand', '御木市': 'demand', '江岸编年史': 'demand', '四禧丸子': 'demand', '柚梓': 'demand', '雪之下琉璃': 'demand', '白知鹊': 'demand', '陈芊禾': 'demand', '白沐桐': 'demand', '林筱墨': 'demand', '林栀栀': 'demand', '魔丸学校': 'demand', '梅子久': 'demand','路莲鱼': 'demand', '谷映晴': 'demand', '简珣祎': 'demand', '姜来': 'demand', '李淑纯': 'demand', '花糖水': 'demand', '洛云希': 'demand', '禾青苗': 'demand','白清夜': 'demand','岁岁年年': 'demand','萦绕': 'demand',all: 'off' },
    '日本线': { '人间尚有余温': 'demand', '天降属性': 'demand', '妹妹日常': 'demand', '何人驻足的夏天': 'demand', '琴乃': 'demand', all: 'off' },
    '古典异界': { '浣溪宗': 'demand', '汤岛物语': 'demand', '羚樋洞': 'demand', '岁寒新正': 'demand', all: 'off' },
  };
  const BTN_ID = 'ruby-cc-float-btn';
  const PANEL_ID = 'ruby-cc-panel';
  const STYLE_ID = 'ruby-cc-style';

  const HW = (() => { try { if (window.parent && window.parent !== window) return window.parent; } catch (_) {} return window; })();
  const HD = (() => { try { return HW.document || document; } catch (_) { return document; } })();

  function fn(name) {
    const scopes = [];
    try { scopes.push(window, window.TavernHelper); } catch (_) {}
    try { scopes.push(HW, HW.TavernHelper); } catch (_) {}
    for (const s of scopes) {
      try { if (s && typeof s[name] === 'function') return s[name].bind(s); } catch (_) {}
    }
    return null;
  }

  /* 旧实例清理 */
  try { if (HW[SLOT] && HW[SLOT].destroy) HW[SLOT].destroy(); } catch (_) {}

  const state = { destroyed: false, bookName: '', entries: null, open: false };

  function isEnabled(e) {
    if (!e) return false;
    if (e.enabled === true) return true;
    if (e.enabled === false) return false;
    return e.disable !== true;
  }

  async function loadBook() {
    const getNames = fn('getCharWorldbookNames');
    const getWB = fn('getWorldbook');
    if (!getNames || !getWB) throw new Error('缺少世界书API');
    let name = '';
    try {
      const n = await Promise.resolve(getNames('current'));
      name = String((n && (n.primary || n.name)) || '');
    } catch (_) {}
    if (!name) throw new Error('未能定位世界书');
    const entries = await Promise.resolve(getWB(name));
    if (!Array.isArray(entries)) throw new Error('世界书数据异常');
    state.bookName = name;
    state.entries = entries;
    return entries;
  }

  function collectModules(entries) {
    let sched = {};
    try { sched = JSON.parse(HW.localStorage.getItem(SCHED_KEY) || '{}') || {}; } catch (_) {}
    const map = new Map();
    for (const e of entries) {
      const cm = String(e.comment || '');
      if (cm.startsWith('【模块总览】')) {
        const name = cm.slice('【模块总览】'.length).trim();
        if (!name) continue;
        const st = sched[name] || {};
        map.set(name, {
          name,
          overview: e,
          overviewOn: isEnabled(e),
          count: 0, chars: 0,
          sleeping: st.sleeping === true,
          idleCount: st.idleCount || 0,
        });
      } else if (cm.startsWith('【')) {
        const name = cm.slice(1, cm.indexOf('】'));
        const rec = map.get(name);
        if (rec) {
          rec.count++;
          rec.chars += (String(e.content || '').length);
        }
      }
    }
    return Array.from(map.values());
  }

  function fmtK(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n); }

  function moduleCard(m) {
    const badge = m.overviewOn
      ? (m.sleeping ? '<span class="rc-badge sleep">休眠中</span>' : '<span class="rc-badge run">运行中</span>')
      : '<span class="rc-badge off">已关闭</span>';
    const mvuTag = MVU_MODS.indexOf(m.name) >= 0 ? '<span class="rc-badge mvu">MVU</span>' : '';
    return (
      '<div class="rc-mod" data-mod="' + m.name.replace(/"/g, '') + '">' +
      '<div class="rc-mod-head"><strong>' + m.name + '</strong>' + badge + mvuTag + '</div>' +
      '<div class="rc-mod-meta">' + m.count + '条 · ' + fmtK(m.chars) + '字' +
      (m.sleeping ? ' · 空闲' + m.idleCount + '轮' : '') + '</div>' +
      '<div class="rc-mod-btns">' +
      '<button class="rc-btn b-demand" data-act="demand">按需</button>' +
      '<button class="rc-btn b-force" data-act="force_on">强制</button>' +
      '<button class="rc-btn b-off" data-act="off">关闭</button>' +
      '</div></div>'
    );
  }

  function buildStats(entries) {
    let constant = 0, disabled = 0, chars = 0, enabledChars = 0;
    for (const e of entries) {
      const len = String(e.content || '').length;
      chars += len;
      if (e.constant === true) constant++;
      if (!isEnabled(e)) disabled++;
      else enabledChars += len;
    }
    return { total: entries.length, constant, disabled, chars, enabledChars };
  }

  function panelHTML(mods, stats) {
    const cards = mods.map(moduleCard).join('');
    const mvuOn = mods.filter(m => m.overviewOn && MVU_MODS.indexOf(m.name) >= 0).map(m => m.name);
    const sleeping = mods.filter(m => m.overviewOn && m.sleeping);
    const schedRow = sleeping.length
      ? sleeping.map(m => m.name + '(空闲' + m.idleCount + '轮)').join('、')
      : '无休眠模块';
    return (
      '<div id="' + PANEL_ID + '" class="rc-backdrop">' +
      '<style id="' + STYLE_ID + '">' + CC_CSS + '</style>' +
      '<div class="rc-panel">' +
      '<div class="rc-head"><strong>🌐 Ruby宇宙 · 控制中心</strong>' +
      '<span class="rc-book">' + state.bookName + '</span>' +
      '<button class="rc-btn rc-close" data-act="close">✕</button></div>' +
      '<div class="rc-stats">' +
      '<div class="rc-stat"><b>' + stats.total + '</b><span>世界书条目</span></div>' +
      '<div class="rc-stat"><b>' + mods.length + '</b><span>宇宙模块</span></div>' +
      '<div class="rc-stat"><b>' + stats.constant + '</b><span>常驻条目</span></div>' +
      '<div class="rc-stat"><b>' + fmtK(stats.enabledChars) + '</b><span>启用字数</span></div>' +
      '</div>' +
      '<div class="rc-sched"><b>调度器：</b>' + schedRow +
      ' <button class="rc-btn b-mini" data-act="reset_sched">重置</button></div>' +
      '<div class="rc-mvu"><b>📊 MVU变量：</b>' + (mvuOn.length ? mvuOn.join('、') : '（无激活模块）') + '<br>' + MVU_INFO + REG_HEALTH_HTML() + '</div>' +
      '<div class="rc-actions">' +
      '<button class="rc-btn b-demand" data-act="all_demand">全部按需</button>' +
      '<button class="rc-btn b-force" data-act="all_force">全部强制开启</button>' +
      '<button class="rc-btn b-off" data-act="all_off">全部关闭</button>' +
      '<button class="rc-btn" data-act="refresh">刷新状态</button>' +
      '</div>' +
      '<div class="rc-presets"><b>⚡ 一键组合：</b>' +
      Object.keys(PRESETS).map(function(p){ return '<button class="rc-btn b-preset" data-act="preset" data-preset="' + p + '">' + p + '</button>'; }).join('') +
      '</div>' +
      '<div class="rc-grid">' + cards + '</div>' +
      '<div class="rc-foot">模块关闭=force_off（调度器不碰） · 按需=启用+keys触发 · 强制=启用+常驻 · MVU宪法自动维护</div>' +
      '</div></div>'
    );
  }

  async function applyMode(modName, mode) {
    const update = fn('updateWorldbookWith');
    if (!update || !state.bookName) return;
    const prefix = '【' + modName + '】';
    const ovTitle = '【模块总览】' + modName;
    await wbMutex(() => update(state.bookName, list => {
      return list.map(e => {
        const cm = String(e.comment || '');
        if (!cm.startsWith(prefix) && cm !== ovTitle) return e;
        if (mode === 'off') {
          return isEnabled(e) === false ? e : Object.assign({}, e, { enabled: false });
        }
        const changes = { enabled: true };
        if (mode === 'force_on' || isMvuInstruction(cm)) changes.constant = true;
        else changes.constant = false; /* 按需：恢复非常驻（MVU指令条目除外） */
        if (isEnabled(e) === true && (mode !== 'force_on' || e.constant === true) && (mode !== 'demand' || e.constant === false)) {
          /* 已符合则不动 */
          if (e.constant === (mode === 'force_on' ? true : false)) return e;
        }
        return Object.assign({}, e, changes);
      });
    }, { render: 'debounced' }));
    /* 同步调度器状态：模块被关闭/重启时清它的idle计数 */
    try {
      const sched = JSON.parse(HW.localStorage.getItem(SCHED_KEY) || '{}') || {};
      if (sched[modName]) { sched[modName].idleCount = 0; if (mode !== 'off') sched[modName].sleeping = false; }
      HW.localStorage.setItem(SCHED_KEY, JSON.stringify(sched));
    } catch (_) {}
    try { HW.dispatchEvent(new CustomEvent('ruby-mvu-refresh')); } catch (_) {}
  }

  async function applyAll(mode) {
    const update = fn('updateWorldbookWith');
    if (!update || !state.bookName) return;
    const names = collectModules(state.entries).map(m => m.name);
    await wbMutex(() => update(state.bookName, list => {
      return list.map(e => {
        const cm = String(e.comment || '');
        let hit = false;
        for (const n of names) {
          if (cm === '【模块总览】' + n || cm.startsWith('【' + n + '】')) { hit = true; break; }
        }
        if (!hit) return e;
        if (mode === 'off') return isEnabled(e) === false ? e : Object.assign({}, e, { enabled: false });
        const changes = { enabled: true };
        if (mode === 'force_on' || isMvuInstruction(cm)) changes.constant = true; else changes.constant = false;
        return Object.assign({}, e, changes);
      });
    }, { render: 'debounced' }));
    try { HW.dispatchEvent(new CustomEvent('ruby-mvu-refresh')); } catch (_) {}
  }
  async function applyPreset(name) {
    const update = fn('updateWorldbookWith');
    if (!update || !state.bookName || !state.entries) return;
    const preset = PRESETS[name];
    if (!preset) return;
    const names = collectModules(state.entries).map(m => m.name);
    await wbMutex(() => update(state.bookName, list => {
      return list.map(e => {
        const cm = String(e.comment || '');
        const m = cm.match(/^【([^】]+)】/);
        if (!m) return e;
        let mod = m[1];
        if (mod === '模块总览') mod = cm.slice(6).trim();
        if (names.indexOf(mod) < 0) return e;
        const mode = preset[mod] !== undefined ? preset[mod] : (preset.all || 'off');
        if (mode === 'off') {
          const need = isEnabled(e) === true || e.constant === true;
          return need ? Object.assign({}, e, { enabled: false, constant: false }) : e;
        }
        const wantC = (mode === 'force_on' || isMvuInstruction(cm)) ? true : false;
        if (isEnabled(e) === true && e.constant === wantC) return e;
        return Object.assign({}, e, { enabled: true, constant: wantC });
      });
    }, { render: 'debounced' }));
    try { HW.dispatchEvent(new CustomEvent('ruby-mvu-refresh')); } catch (_) {}
  }

  async function refreshPanel() {
    const panel = HD.getElementById(PANEL_ID);
    if (!panel) return;
    try {
      const entries = await loadBook();
      const mods = collectModules(entries);
      const stats = buildStats(entries);
      const wrap = HD.createElement('div');
      wrap.innerHTML = panelHTML(mods, stats);
      panel.replaceWith(wrap.firstChild);
    } catch (err) { console.error('[ruby-cc]', err); }
  }

  async function handleAct(act, modName, presetName) {
    const panel = HD.getElementById(PANEL_ID);
    if (panel) { const b = panel.querySelector('.rc-foot'); if (b) b.textContent = '执行中… ' + act + (modName ? ' · ' + modName : ''); }
    try {
      if (act === 'close') { closePanel(); return; }
      if (act === 'refresh') { await refreshPanel(); return; }
      if (act === 'reset_sched') { try { HW.localStorage.removeItem(SCHED_KEY); } catch (_) {} await refreshPanel(); return; }
      if (act === 'preset') { await applyPreset(presetName); await refreshPanel(); const p3 = HD.getElementById(PANEL_ID); const f3 = p3 && p3.querySelector('.rc-foot'); if (f3) f3.textContent = '✓ 已应用组合「' + presetName + '」· 未激活模块的MVU指令已全关'; return; }
      if (act.startsWith('all_')) { await applyAll(act.replace('all_', '')); await refreshPanel(); return; }
      if (modName) {
        await applyMode(modName, act);
        await refreshPanel();
        if (act !== 'off') {
          const p2 = HD.getElementById(PANEL_ID);
          const fb = p2 && p2.querySelector('.rc-foot');
          if (fb) fb.textContent = '✓ ' + modName + ' 已开启 · 其角色将在后续对话中自然引入';
        }
        return;
      }
    } catch (err) {
      if (panel) { const b = panel.querySelector('.rc-foot'); if (b) b.textContent = '执行失败: ' + (err && err.message || err); }
      return;
    }
  }

  function bindPanelEvents(panel) {
    panel.addEventListener('click', ev => {
      const btn = ev.target && ev.target.closest ? ev.target.closest('.rc-btn') : null;
      if (!btn) return;
      const act = btn.dataset.act;
      if (!act) return;
      const card = btn.closest('.rc-mod');
      const modName = card ? card.dataset.mod : null;
      handleAct(act, modName, btn.dataset.preset);
    });
  }

  function openPanel() {
    if (state.open) { closePanel(); return; }
    state.open = true;
    const wrap = HD.createElement('div');
    wrap.innerHTML = '<div id="' + PANEL_ID + '" class="rc-backdrop"><div class="rc-panel"><div class="rc-head"><strong>🌐 Ruby宇宙 · 控制中心</strong><button class="rc-btn rc-close" data-act="close">✕</button></div><div class="rc-loading">加载中…</div></div></div>';
    const panel = wrap.firstChild;
    HD.body.appendChild(panel);
    bindPanelEvents(panel);
    refreshPanel();
  }

  function closePanel() {
    state.open = false;
    const p = HD.getElementById(PANEL_ID);
    if (p) p.remove();
  }

  function mountButton() {
    const old = HD.getElementById(BTN_ID);
    if (old) old.remove();
    const btn = HD.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.title = 'Ruby宇宙 · 控制中心';
    btn.textContent = '🌐';
    btn.addEventListener('click', openPanel);
    HD.body.appendChild(btn);
  }

  const CC_CSS = [
    '#ruby-cc-float-btn{position:fixed;right:10px;bottom:92px;z-index:9998;width:40px;height:40px;border-radius:50%;border:1px solid rgba(140,150,190,.4);background:rgba(28,30,44,.86);color:#dfe3ff;font-size:19px;line-height:1;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35);backdrop-filter:blur(4px);transition:transform .15s,box-shadow .15s;}',
    '#ruby-cc-float-btn:hover{transform:scale(1.08);box-shadow:0 8px 26px rgba(80,90,160,.45);}',
    '.rc-backdrop{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(10,11,18,.62);backdrop-filter:blur(4px);}',
    '.rc-panel{width:min(760px,100%);max-height:88vh;overflow:auto;border-radius:14px;background:linear-gradient(168deg,rgba(32,35,52,.97),rgba(24,26,40,.97));border:1px solid rgba(140,150,200,.25);box-shadow:0 30px 80px rgba(0,0,0,.5);color:#dfe3ff;font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;font-size:13.5px;padding:18px 20px 14px;}',
    '.rc-head{display:flex;align-items:center;gap:12px;margin-bottom:14px;}',
    '.rc-head strong{font-size:17px;letter-spacing:.04em;}',
    '.rc-book{flex:1;color:#8e94b8;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.rc-close{min-width:34px;}',
    '.rc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;}',
    '.rc-stat{background:rgba(255,255,255,.05);border:1px solid rgba(140,150,200,.16);border-radius:10px;padding:10px 8px;text-align:center;}',
    '.rc-stat b{display:block;font-size:19px;color:#fff;}',
    '.rc-stat span{font-size:11px;color:#9aa0c4;}',
    '.rc-sched{background:rgba(255,180,80,.08);border:1px solid rgba(255,180,80,.22);border-radius:10px;padding:9px 12px;margin-bottom:12px;font-size:12.5px;color:#e8d9b8;}',
    '.rc-actions{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}',
    '.rc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:8px;}',
    '.rc-mod{background:rgba(255,255,255,.045);border:1px solid rgba(140,150,200,.16);border-radius:10px;padding:10px 11px;}',
    '.rc-mod-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;}',
    '.rc-mod-head strong{font-size:13.5px;color:#fff;}',
    '.rc-badge{font-size:10.5px;padding:2px 8px;border-radius:99px;font-weight:600;}',
    '.rc-badge.run{background:rgba(80,200,140,.16);color:#6fe0a8;}',
    '.rc-badge.sleep{background:rgba(255,180,80,.14);color:#ffcf8a;}',
    '.rc-badge.off{background:rgba(150,155,185,.14);color:#9aa0c4;}',
    '.rc-mod-meta{font-size:11.5px;color:#8e94b8;margin-bottom:8px;}',
    '.rc-mod-btns{display:flex;gap:6px;}',
    '.rc-btn{min-height:26px;padding:4px 12px;font-size:12px;color:#dfe3ff;background:rgba(255,255,255,.06);border:1px solid rgba(140,150,200,.3);border-radius:7px;cursor:pointer;transition:background .14s,border-color .14s;}',
    '.rc-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(170,180,230,.55);}',
    '.rc-btn.b-demand:hover{border-color:#6fe0a8;}',
    '.rc-btn.b-force:hover{border-color:#7ab8ff;}',
    '.rc-btn.b-off:hover{border-color:#ff8a9a;}',
    '.rc-btn.b-mini{min-height:22px;padding:2px 9px;font-size:11px;}',
    '.rc-badge.mvu{background:rgba(140,120,255,.16);color:#b9a8ff;}',
    '.rc-mvu{background:rgba(140,120,255,.07);border:1px solid rgba(140,120,255,.22);border-radius:10px;padding:9px 12px;margin-bottom:12px;font-size:12.5px;color:#cfc8f2;}',
    '.rc-presets{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:12px;font-size:12.5px;color:#c9d2f2;}',
    '.rc-btn.b-preset:hover{border-color:#c9a8ff;background:rgba(140,120,255,.12);}',
    '.rc-foot{margin-top:12px;color:#787e9f;font-size:11.5px;text-align:center;}',
    '.rc-loading{padding:40px;text-align:center;color:#9aa0c4;}',
    '@media (max-width:560px){.rc-panel{padding:14px 12px;}.rc-stats{grid-template-columns:repeat(2,1fr);}.rc-grid{grid-template-columns:1fr 1fr;}}'
  ].join('\n');

  function destroy() {
    state.destroyed = true;
    closePanel();
    const b = HD.getElementById(BTN_ID);
    if (b) b.remove();
  }

  function init() { mountButton(); }
  init();

  state.destroy = destroy;
  state.openPanel = openPanel;
  HW[SLOT] = state;
})();