/*
 * Ruby宇宙·动态模块调度器 v1.3
 * 功能：每楼扫描最近对话，统计各模块角色出场频率；
 *      连续N楼未出场的模块，自动disable其"重条目"（分析/日程/日历/衣柜类），
 *      角色重新出场时自动恢复。demand开关不受影响。
 * 依赖：Tavern Helper（eventOn MESSAGE_RECEIVED）
 * v1.2: 唤醒只恢复本次休眠disable的条目(slept记录)；MOD_CHARS去重
 * v1.3: 模块总览关闭时连带 disable 该模块【前缀】常驻(constant)条目，uid 记入 constOff；总览打开只恢复 constOff 内条目
 * v1.3: 模块总览关闭时连带 disable 该模块【前缀】常驻(constant)条目，uid 记入 constOff；总览打开只恢复 constOff 内条目
 */
(function () {
  'use strict';
  const SLOT = '__RUBY_DYNAMIC_SCHEDULER__';
  const WINDOW_SIZE = 6;       // 扫描最近6楼
  const IDLE_THRESHOLD = 4;    // 连续4轮无出场→休眠
  const SAVE_KEY = 'ruby_dyn_sched_v1';

  // 模块→角色名清单（用于出场检测）
  const MOD_CHARS = {"萦绕": ["萦绕"], "岁岁年年": ["岁岁年年"], "白清夜": ["白清夜"], "路莲鱼": ["路莲鱼"], "谷映晴": ["谷映晴"], "简珣祎": ["简珣祎"], "姜来": ["姜来"], "李淑纯": ["李淑纯"], "花糖水": ["花糖水"], "洛云希": ["洛云希"], "夏沐": ["夏沐","小沐"], "禾青苗": ["禾青苗"], "白沐桐": ["白沐桐"], "林筱墨": ["林筱墨"], "林栀栀": ["林栀栀"], "魔丸学校": ["魔丸学校"], "梅子久": ["梅子久"], "白知鹊": ["白知鹊", "广益中学", "李知行"], "陈芊禾": ["陈芊禾", "澜景市", "林屿舟"], "柚梓": ["柚梓", "大学城", "乌龙茶"], "雪之下琉璃": ["雪之下", "琉璃", "小雪", "猫娘"], "洛潮汐": ["洛潮汐", "潮汐"], "四禧丸子": ["恬豆","沐霂","梨安","又一","四禧丸子","禧运楼","虚拟主播","直播"], "筒子楼2008": ["洪晓彤", "洪晓蕾", "洪晓花", "苏悦", "林秀", "李莉", "唐果", "沈念", "齐冰", "齐雪", "文馨"], "心动2004": ["叶竹澜", "孙荪", "廖瑜"], "六中2001": ["宁萱", "陈怡杨", "李茜汐", "李星星", "雨桐"], "林霜": ["林霜", "林雪", "苏甜", "陈渡微", "肖楚笙", "郑维邦"], "浣溪宗": ["娑罗剪", "楼逞", "商枳", "枸那", "芙蕖", "辛夷", "铁衣", "桃儿", "陈圆圆", "陈君瑾", "陈玺"], "汤岛物语": ["藤雾", "文子", "龙子", "静子"], "人间尚有余温": ["佐野真夏", "齐藤优香", "竹内雅子", "松本健", "齐藤甚太"], "天降属性": ["白峰千冬", "红林刻子", "陈星瞳", "久世纱英", "神代栞", "花菱柚叶", "如月澄", "月见里雪乃", "宫本静流", "宫本璃绪", "朝雾言叶", "水濑诗织"], "妹妹日常": ["神宫寺凛", "星野瑠夏", "绫濑夕凪", "咲夜幽", "雪宫堇", "时雨光", "月読零", "朝雾千夏", "白鸟结衣", "神圆玲奈", "黒澤雫"], "羚樋洞": ["姜秀律", "池安", "尹昭贞", "崔圣允", "金恩艺", "申娥", "姜星伊"], "蒹葭苍苍": ["林葭", "聂晓芸", "蒋悦萍", "姜若菁", "商子蕊", "祝月芷", "韩清芜", "祁葵", "文馨", "林闻夏"], "五色棱光": ["林初霁", "温凉", "夏橙", "阮初初", "江绮"], "临海市二中": ["郭思雨", "方子怡", "林欣悦"], "嫂子日常": ["楚青妤", "温软", "夏知遥", "林清音", "宋浅予", "宋漫兮", "傅云闲", "沈梨绾", "沈昭明"], "青梅正宗": ["沈鹿笙", "沈婉宁", "秦溯", "姜棠"], "乡镇": ["沈金钗", "金钗", "黄甜", "安瑶", "曹莹莹", "李福堂", "信悟能", "曹旺", "暖香阁", "福记"], "商枝市": ["朱虹", "陈可", "裴姝权", "周英英", "王伊珞", "黄映珝", "阮琅", "江映淮", "橘猫", "关歆"], "栖澜镇": ["沈漾", "沈澪", "沈建国", "沈明远", "沈春兰", "沈秋萍", "沈辉", "李秋月"], "正太控": ["颜舒", "周晚", "周敏", "赵清月", "苏巧珍", "林倾语", "沈砚", "纪岫", "温野", "夏果", "蒋骁", "牛志强"], "海棠": ["顾海棠", "景媛", "朱艺", "高雯", "刘玉兰", "周雨涵", "秦赢关", "肖京津", "李双洙", "禾佳", "劳贵南", "吕穆崆"], "广海理工": ["刘云舒", "苏启白", "苏曼丽", "沈辞", "王知遥", "叶轻璇", "宋稚", "林千惠"], "寄宿高中": ["林夏", "祝丹丹", "黄茉莉", "杨思思", "赵佳", "李琳", "季雅萱", "吴涛"], "何人驻足的夏天": ["月城紫苑", "水无月若叶", "水瀬汐", "水瀬澪", "神代蛍"], "江岸编年史": ["纪弦", "柯萝", "一诺"], "琴乃": ["春川琴乃", "铃木杏奈"], "沈仁职校": ["周红梅", "林心兰", "李佳茹"], "御木市": ["乔千攻", "普利凯特", "伊卡洛斯", "路西法", "米勒", "嘉丽安", "艾露迪", "爱丽丝", "Nova", "凯特", "攻爷"], "岁寒新正": ["云知意", "林纾璃", "王嬷嬷", "陈管事", "王妈妈", "陈伯"], "苏晚霁": ["苏晚霁", "田所浩二"], "三明月": ["三明月"], "澜景市": ["澜景市"], "白露晞": ["白露晞"], "双子": ["双子"], "倒贴小萝莉": ["七条爱子", "七条莉莉", "七条卡佳", "七条家"], "女拳师": ["谭珠", "穆宁雪", "吴娴", "凌晓", "顾尔洁", "林婉", "张薇", "沐洋泉", "杨媛媛", "吴诗诗"], "绿帽妻子": ["林婉宁", "林婉清", "沈晴", "赵祥琴", "苏曼云", "顾妍", "苏玲", "白瑾", "沈悦", "墨照雪", "洛幽"], "祁念": ["祁念"], "林银铃": ["林银铃", "000"], "西莉亚": ["西莉亚", "Celia", "法尔兰"], "写小说": ["林暖", "赵明", "方雨", "江南旧园", "向阳幼儿园"], "租借男友": ["温知晚", "陆时予", "周念安", "罗兰", "霍千黎", "裴今歌", "姜朝渔", "季明舒", "步玲燕", "椎名律", "织部宵", "傅霁", "许不倦"]};

  // 模块→可休眠条目的comment关键词（重条目特征）
  const HEAVY_PATTERNS = ['分析', '日程', '日历', '衣柜', '状态分析', '关系分析', '速览', '速查', '时间线', '周日程'];

  const HW = (() => { try { if (window.parent && window.parent !== window) return window.parent; } catch (_) {} return window; })();
  function wbMutex(fn) { try { const M = HW.__RUBY_WB_MUTEX__ || (window.parent && window.parent.__RUBY_WB_MUTEX__); return M ? M(fn) : fn(); } catch (_) { return fn(); } } /* 活引用: 调用时查询（注册中心可能晚于本脚本就绪） */
  function fn(name) {
    try { if (typeof window[name] === 'function') return window[name].bind(window); } catch (_) {}
    try { if (window.TavernHelper && typeof window.TavernHelper[name] === 'function') return window.TavernHelper[name].bind(window.TavernHelper); } catch (_) {}
    try { if (typeof HW[name] === 'function') return HW[name].bind(HW); } catch (_) {}
    try { if (HW.TavernHelper && typeof HW.TavernHelper[name] === 'function') return HW.TavernHelper[name].bind(HW.TavernHelper); } catch (_) {}
    return null;
  }

  // state: { modName: { idleCount: n, sleeping: bool } }
  let state = {};
  try { state = JSON.parse(HW.localStorage.getItem(SAVE_KEY) || '{}'); } catch (_) { state = {}; }
  // 聊天切换时重置
  try {
    const chatId = HW.SillyTavern && HW.SillyTavern.getContext ? HW.SillyTavern.getContext().chatId : null;
    if (state.__chatId !== chatId) {
      const constKeep = {};
      for (const k in state) {
        if (state[k] && Array.isArray(state[k].constOff) && state[k].constOff.length)
          constKeep[k] = state[k].constOff;
      }
      state = { __chatId: chatId };
      for (const k in constKeep) state[k] = { idleCount: 0, sleeping: false, constOff: constKeep[k] };
    }
  } catch (_) {}

  function saveState() { try { HW.localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {} }

  function getRecentText() {
    const read = fn('getChatMessages');
    if (!read) return '';
    try {
      const msgs = read('::' + (-WINDOW_SIZE) + '::' ) || [];
      // 兼容: 若不返回数组，用另一种调用
      let texts = [];
      if (Array.isArray(msgs)) {
        for (const m of msgs) { if (m && m.message) texts.push(String(m.message)); }
      } else {
        const ctx = HW.SillyTavern.getContext();
        const chat = ctx.chat || [];
        for (let i = Math.max(0, chat.length - WINDOW_SIZE); i < chat.length; i++) {
          texts.push(String((chat[i] && chat[i].mes) || ''));
        }
      }
      return texts.join('\n');
    } catch (_) {
      try {
        const ctx = HW.SillyTavern.getContext();
        const chat = ctx.chat || [];
        let texts = [];
        for (let i = Math.max(0, chat.length - WINDOW_SIZE); i < chat.length; i++) {
          texts.push(String((chat[i] && chat[i].mes) || ''));
        }
        return texts.join('\n');
      } catch (__) { return ''; }
    }
  }

  async function tick() {
    if (Object.keys(MOD_CHARS).length === 0) return;
    const text = getRecentText();
    if (!text) return;

    const update = fn('updateWorldbookWith');
    const getWB = fn('getWorldbook');
    if (typeof update !== 'function' || typeof getWB !== 'function') return;

    let bookName = '';
    try {
      const names = await Promise.resolve(fn('getCharWorldbookNames')('current'));
      bookName = String((names && (names.primary || names.name)) || '');
    } catch (_) {}
    if (!bookName) return;

    // 出场检测
    const active = new Set();
    for (const mod in MOD_CHARS) {
      for (const ch of MOD_CHARS[mod]) {
        if (text.indexOf(ch) >= 0) { active.add(mod); break; }
      }
    }

    // 更新idle计数
    let changed = false;
    for (const mod in MOD_CHARS) {
      if (!state[mod]) state[mod] = { idleCount: 0, sleeping: false };
      if (active.has(mod)) {
        if (state[mod].sleeping) {
          state[mod].sleeping = false;
          changed = true; // 唤醒
        }
        state[mod].idleCount = 0;
      } else {
        state[mod].idleCount++;
        if (state[mod].idleCount >= IDLE_THRESHOLD && !state[mod].sleeping) {
          state[mod].sleeping = true;
          state[mod].slept = []; // 本次休眠期间由调度器disable的uid记录（唤醒时只恢复这些）
          changed = true; // 休眠
        }
      }
    }
    if (!changed) { saveState(); try { HW.dispatchEvent(new CustomEvent('ruby-mvu-refresh')); } catch (_) {} return; }

    // 执行世界书调整
    try {
      await wbMutex(() => update(bookName, entries => {
        const list = Array.isArray(entries) ? entries : [];
        /* 在回调内用最新列表重算force_off（消除读-写竞态：玩家同时切开关不丢写） */
        const forceOffMods = new Set();
        for (const e of list) {
          const cm = String(e.comment || '');
          if (cm.startsWith('【模块总览】')) {
            const modName = cm.slice('【模块总览】'.length).trim();
            if (modName && e.enabled === false) forceOffMods.add(modName);
          }
        }
        return list.map(e => {
          const cm = String(e.comment || '');
          const m = cm.match(/^【([^】]+)】/);
          if (!m || m[1] === '模块总览') return e;
          const mod = m[1];
          // force_off的模块：调度器完全不碰（尊重玩家强制关闭）
          /* v1.3: 总览关 → 停该模块常驻；总览开 → 只恢复本调度器关掉的 constOff */
          if (forceOffMods.has(mod)) {
            if (e.constant === true) {
              const curOn = e.enabled === true ? true : (e.enabled === false ? false : true);
              if (curOn) {
                if (!state[mod]) state[mod] = { idleCount: 0, sleeping: false, constOff: [] };
                if (!Array.isArray(state[mod].constOff)) state[mod].constOff = [];
                if (state[mod].constOff.indexOf(e.uid) < 0) state[mod].constOff.push(e.uid);
                return Object.assign({}, e, { enabled: false });
              }
            }
            return e;
          }
          if (state[mod] && Array.isArray(state[mod].constOff) && state[mod].constOff.indexOf(e.uid) >= 0) {
            state[mod].constOff = state[mod].constOff.filter(function (x) { return x !== e.uid; });
            if (e.constant === true && e.enabled === false)
              return Object.assign({}, e, { enabled: true });
          }
          const st = state[mod];
          if (!st) return e;
          // 只调度重条目
          let isHeavy = false;
          for (const p of HEAVY_PATTERNS) { if (cm.indexOf(p) >= 0) { isHeavy = true; break; } }
          if (!isHeavy) return e;
          // 休眠→disable重条目（记录slept）；唤醒→只恢复slept内的条目
          // （v1.2修复：旧版唤醒无条件enable全部HEAVY，会点亮玩家手动关闭/源卡默认禁用的条目）
          const wantEnabled = !st.sleeping;
          const cur = e.enabled === true ? true : (e.enabled === false ? false : e.disable !== true);
          if (wantEnabled) {
            if (Array.isArray(st.slept)) {
              // 本聊天内有记录体系：只恢复自己睡时关掉的
              if (st.slept.indexOf(e.uid) < 0) return e;
              st.slept = st.slept.filter(function (x) { return x !== e.uid; });
            }
            /* st.slept不存在（聊天切换重置后首次唤醒）：回退v1.1全量恢复行为 */
          } else {
            if (cur !== true) return e; // 本就disabled，不记录不操作
            if (!Array.isArray(st.slept)) st.slept = [];
            st.slept.push(e.uid);
          }
          if (cur === wantEnabled) return e;
          return Object.assign({}, e, { enabled: wantEnabled });
        });
      }, { render: 'debounced' }));
      saveState(); try { HW.dispatchEvent(new CustomEvent('ruby-mvu-refresh')); } catch (_) {}
    } catch (_) {}
  }

  // 事件挂载
  function init() {
    const events = HW.tavern_events || {};
    const handler = () => setTimeout(tick, 500);
    for (const name of ['MESSAGE_RECEIVED', 'MESSAGE_SWIPED', 'CHAT_CHANGED']) {
      const ev = events[name] || name.toLowerCase();
      try {
        if (typeof HW.eventOn === 'function') HW.eventOn(ev, handler);
      } catch (_) {}
    }
    // 启动时跑一次
    setTimeout(tick, 2000);
  }
  init();
  HW[SLOT] = { tick, state };
})();