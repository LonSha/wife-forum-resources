/*
 * Ruby宇宙·MVU统一Schema注册中心 v2
 * ── 事实依据（MagVarUpdate artifact bundle + StageDog mvu_zod.js 逐行考证）──
 * 1. registerMvuSchema 支持【工厂函数】形式：每次 mag_variable_initialized 事件重新求值
 *    → 运行中切换模块开关后，下一条开场白初始化自动使用最新schema组合
 * 2. 顶层ZodObject被转为 looseObject（passthrough）→ 顶层键不重叠的模块schema可安全共存
 * 3. 初始化合并是 stat_data 级浅合并 → 同名顶层键会互相清空
 *    → 七模块顶层键完全正交（23键）：世界状态/角色列表 | 时间/好感度/在场角色/本周拍摄/毕设 |
 *      青梅正宗世界/角色 | 栖澜镇世界/角色 | 御木市世界/主线/契约/主角/乔千攻/伊卡洛斯/普利凯特/路西法/其他角色 |
 *      岁寒新正世界/角色 | 任务进度（人间尚有余温，纯initvar无schema）→ 任意组合同开互不干扰
 * 4. 原6个静态schema脚本已停用，由本脚本单点注册
 * 5. ACTIVE集合 = 世界书「模块总览」enabled状态（初始化时读取 + CHAT_CHANGED 重读 +
 *    ruby-mvu-refresh 事件即时刷新）；关闭的模块不参与schema拼装
 * 6. 七模块schema均带完整prefault默认值（男娘角色由V67深层审计补齐）（御木市/岁寒新正由V17补齐）→ 空stat_data初始化安全
 * 全局依赖：z（TH iframe 内置 zod v4）
 */
let registerMvuSchema = null;
const __mvuZodReady = import('https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js').then(m => { registerMvuSchema = m.registerMvuSchema || null; }).catch(() => { registerMvuSchema = null; });

(function () {
  'use strict';
  const SLOT = '__RUBY_MVU_REGISTRY__';
  const HW = (() => { try { if (window.parent && window.parent !== window) return window.parent; } catch (_) {} return window; })();
  try { if (HW[SLOT]) console.log('[ruby-mvu] 注册中心重载（旧实例被覆盖）'); } catch (_) {}

  const MVU_MODS = ['临海市二中', '五色棱光', '青梅正宗', '栖澜镇', '御木市', '岁寒新正'];
  try { HW.__RUBY_MVU_MODS__ = MVU_MODS; if (typeof window !== 'undefined' && window.parent && window.parent !== window) { try { window.parent.__RUBY_MVU_MODS__ = MVU_MODS; } catch (_) {} } } catch (_) {} /* V70: MVU_MODS 单源，设定页/控制中心只读 HW.__RUBY_MVU_MODS__ */
  const SYNC_MODS = MVU_MODS.concat(['人间尚有余温']); /* 指令条目动态启停的模块范围 */
  const SHARED_FMT = '【共享】变量输出格式（五色棱光×栖澜镇×青梅正宗）'; /* V27瘦身: 三胞胎共享条目 */
  const RETIRED_FMT = ['【五色棱光】[mvu_update]变量输出格式', '【栖澜镇】[mvu_update]变量输出格式', '【青梅正宗】[mvu_update]变量输出格式'];
  const TRIPLETS = ['五色棱光', '栖澜镇', '青梅正宗'];
  let ACTIVE = null;
  let prevSync = '';
  const SNAP_KEY = 'ruby_mvu_snap_v1'; /* 聊天级模块配置快照 */
  let wbMutex = Promise.resolve(); /* 全局写互斥: 所有updateWorldbookWith串行化 */
  try { const HB = { ready: false, at: 0, beat: Date.now(), schemaOk: false }; HW.__RUBY_WB_HEALTH__ = HB; if (typeof window !== 'undefined' && window.parent && window.parent !== window) { try { window.parent.__RUBY_WB_HEALTH__ = HB; } catch (_) {} } } catch (_) {} /* 健康信标: IIFE顶部初始化, 先于任何$回调时序 */

/* ═══ 临海市二中 ═══ */
function buildLhShape() {
const __S_LH = z.object({

  /* 基础环境状态追踪 */

世界状态: z.object({

    当前时间: z.string().prefault('待初始化'),

    当前位置: z.string().prefault('待初始化'),

    当前天气: z.string().prefault('待初始化')
  }).prefault({}),

  /* 核心角色管理系统 */

角色列表: z.record(
     z.string().describe('角色名字'),
     z.object({

      /* 基础档案 */

      身份: z.string().prefault('未知'),

      年龄: z.string().prefault('未知'),

      罩杯: z.string().prefault('未知'),

      身高: z.string().prefault('未知'),

      体重: z.string().prefault('未知'),

      和user的关系: z.string().prefault('未知'),

      性格: z.string().prefault('未知'),

      背景: z.string().prefault('未知'),


      /* 表现层/服饰 */

      上衣和下衣: z.string().prefault('未知'), 

      腿部服饰: z.string().prefault('未知'), 

      内衣: z.string().prefault('未知'),

      足部服饰: z.string().prefault('未知'), 

      道具或配饰: z.string().prefault('无'), 


      /* 身体情况 */
 
      身材: z.string().prefault('未知'), 

      胸部: z.string().prefault('未知'),

      小穴: z.string().prefault('未知'), 

      菊穴: z.string().prefault('未知'),

      腿部: z.string().prefault('未知'), 

      怀孕情况: z.string().prefault('未知'),


      /* 数值与深度属性 */

      性交次数: z.coerce.number().prefault(0),

      性开发程度: z.string().prefault('0/100 未知'),
      熟练性技: z.string().prefault('未知'), 

      性癖喜好: z.string().prefault('未知'),

      心理想法: z.string().prefault('未知'),

    })
  ).prefault({}), /* 统一注册中心补丁: 默认空record */
});
  return extractShape(__S_LH);
}

/* ═══ 五色棱光 ═══ */
function buildWsShape() {
const __S_WS = z.object({
  时间: z.object({
    年: z.coerce.number().prefault(2024),
    月: z.coerce.number().prefault(9),
    日: z.coerce.number().prefault(15),
    时: z.string().describe('格式为 HH:mm').prefault('10:00'),
    星期: z.enum(['一', '二', '三', '四', '五', '六', '日']).prefault('一'),
  }).prefault({}),

  好感度: z.record(
    z.enum(['林初霁', '温凉', '夏橙', '阮初初', '江绮']),
    z.coerce.number().describe('单次变动上限+8下限-3，到100触发事件').transform(v => _.clamp(v, 0, 100)).prefault(20)
  ).prefault({}),

  在场角色: z.partialRecord(
    z.enum(['林初霁', '温凉', '夏橙', '阮初初', '江绮']),
    z.object({
      位置: z.string().prefault(''),
      当前动作: z.string().prefault(''),
      上装: z.string().prefault(''),
      下装: z.string().prefault(''),
      内心话: z.string().prefault(''),
    }).prefault({})
  ).prefault({}),

  本周拍摄: z.object({
    拍摄日1: z.object({
      星期: z.enum(['一', '二', '三', '四', '五']).prefault('一'),
      角色: z.enum(['温凉', '夏橙', '阮初初']).prefault('温凉'),
      类型: z.enum(['外拍', '棚拍', '私房']).prefault('棚拍'),
      已完成: z.boolean().prefault(false),
    }).prefault({}),
    拍摄日2: z.object({
      星期: z.enum(['一', '二', '三', '四', '五']).prefault('三'),
      角色: z.enum(['温凉', '夏橙', '阮初初']).prefault('夏橙'),
      类型: z.enum(['外拍', '棚拍', '私房']).prefault('外拍'),
      已完成: z.boolean().prefault(false),
    }).prefault({}),
    拍摄日3: z.object({
      星期: z.enum(['一', '二', '三', '四', '五']).prefault('四'),
      角色: z.enum(['温凉', '夏橙', '阮初初']).prefault('阮初初'),
      类型: z.enum(['外拍', '棚拍', '私房']).prefault('棚拍'),
      已完成: z.boolean().prefault(false),
    }).prefault({}),
  }).prefault({}),

  毕设: z.object({
    进度: z.coerce.number().describe('每次拍摄固定+2%，≥90优秀/60-89正常/<60不及格').transform(v => _.clamp(v, 0, 100)).prefault(24),
  }).prefault({}),
});
  return extractShape(__S_WS);
}

/* ═══ 青梅正宗（命名空间化） ═══ */
function buildQmShape() {
const __S_QM = z.object({
  青梅正宗世界: z.object({
    日期: z.string().prefault('01月17日'),
    时间: z.string().prefault('14:20'),
    天气: z.string().prefault('晴'),
    地点: z.string().prefault('城东·半山·别墅区·{{user}}家'),
    新闻: z.record(z.string().describe('新闻标题'), z.string().describe('新闻简述'))
      .transform(data => _(data).entries().takeRight(3).fromPairs().value())
      .prefault({}),
  }).prefault({}),
  青梅正宗角色: z.record(
    z.enum(['沈鹿笙', '沈婉宁', '姜棠', '秦溯']),
    z.object({
      怀孕状态: z.string().prefault('未怀孕'),
      心情: z.string().prefault('平静'),
      内心话: z.string().prefault(''),
    }).prefault({})
  ).prefault({ 沈鹿笙: {}, 沈婉宁: {}, 姜棠: {}, 秦溯: {} }),
}).prefault({});
  return extractShape(__S_QM);
}

/* ═══ 栖澜镇（命名空间化） ═══ */
function buildQlShape() {
const BaseCharacterSchema = z.object({
  在场状态: z.boolean().prefault(false),

  暴露风险度: z.coerce.number()
    .transform(v => _.clamp(v, 0, 100))
    .prefault(0),

  情绪状态: z.string().prefault('未知'),

  SFW服装类型: z.enum([
    '日常',
    '外出',
    '制服',
    '挑逗',
    '泳装',
    '内衣',
    '赤裸'
  ]).prefault('日常'),

  着装情况: z.object({
    '🧥上装': z.string().prefault('暂无'),
    '👖下装': z.string().prefault('暂无'),
    '👙内衣': z.string().prefault('暂无'),
    '👠鞋子': z.string().prefault('暂无'),
    '🧦袜子': z.string().prefault('暂无'),
    '💍配饰': z.string().prefault('暂无')
  }).prefault({}),

  身体状况: z.object({
    '👄口腔': z.string().prefault('正常'),
    '🍒胸部': z.string().prefault('正常'),
    '🌸小穴': z.string().prefault('正常'),
    '🍩肛门': z.string().prefault('正常'),
    '💗子宫': z.string().prefault('正常')
  }).prefault({})
});

const __S_QL = z.object({
  栖澜镇世界: z.object({
    当前场景: z.string().prefault('未知'),
    当前日期: z.string().prefault('未知'),
    当前星期: z.enum([
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
      '星期日'
    ]).prefault('星期一'),
    当前时间: z.string().prefault('未知')
  }).prefault({}),

  栖澜镇角色: z.object({
    沈漾: BaseCharacterSchema.extend({
      沉溺度: z.coerce.number().prefault(0)
    }).prefault({}),

    沈澪: BaseCharacterSchema.extend({
      亲密度: z.coerce.number()
        .transform(v => _.clamp(v, 0, 100))
        .prefault(12),

      当前状态: z.enum([
        '👼小天使',
        '😈小恶魔'
      ]).prefault('👼小天使'),

      待清算事项: z.array(z.string())
        .transform(items =>
          _.uniq(
            items
              .filter(item => typeof item === 'string')
              .map(item => item.trim())
              .filter(Boolean)
          ).slice(0, 5)
        )
        .prefault([])
    }).prefault({})
  }).prefault({})
});
  return extractShape(__S_QL);
}

/* ═══ 御木市（V17并入：世界→御木市世界；全字段prefault鲁棒性补丁） ═══ */
function buildYmsShape() {
// 变量结构 —— 《天使》卡 MVU zod 变量框架
// 用法: 酒馆右上角积木按钮 → 酒馆助手 → 脚本 → 「+ 脚本」新建【角色脚本】,
//       命名为「变量结构」, 将本文件全部内容粘贴进去, 保存并启用。
const __S_YMS = z.object({
  御木市世界: z.object({
    当前日期: z.string().describe('剧情内日期，格式 YYYY年MM月DD日 星期X').prefault('待初始化'),
    当前时间: z.string().describe('剧情内时间，24小时制 HH:MM').prefault('待初始化'),
    当前地点: z.string().describe('当前场景位置').prefault('待初始化'),
    当前天气: z.string().describe('简短天气描述，须含 晴/雨/雪/阴/云 之一').prefault('晴'),
    当前焦点角色: z.string().describe('本楼剧情主要交互的角色，无人在场时保持原值').prefault('待初始化'),
    近期事务: z.record(
      z.string().describe('事务名'),
      z.string().describe('事务描述'),
    ).prefault({}),
  }).prefault({}),

  主线: z.object({
    记忆碎片: z.record(
      z.string().describe('碎片名，意象化短语，如"礼堂的火光"'),
      z.object({
        内容: z.string().describe('碎片呈现的记忆画面'),
        来源: z.string().describe('由什么契机浮现'),
      }),
    ).prefault({}),
    天堂动向: z.enum(['风平浪静', '暗中调查', '追捕令已下发', '全面搜捕']).prefault('风平浪静'),
  }).prefault({}),

  契约: z.record(
    z.string().describe('契约名或契约编号'),
    z.object({
      立约人: z.string(),
      恶魔: z.string().describe('缔约恶魔'),
      愿望: z.string(),
      代价: z.string().prefault('待收取'),
      状态: z.enum(['提议中', '已签订', '濒临收取', '已收取', '已解除', '已毁约']).prefault('已签订'),
    }),
  ).prefault({}),

  主角: z.object({
    身份: z.string().describe('{{user}}的当前身份').prefault('待初始化'),
    就业状态: z.enum(['待业中', '零工度日', '已就业']).prefault('待业中'),
    物品栏: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number().prefault(1),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)).prefault({}),
  }).prefault({}),

  乔千攻: z.object({
    好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    现状: z.string().describe('她此刻在做什么').prefault('待初始化'),
    着装: z.string().describe('当前穿着').prefault('待初始化'),
    攻爷身份暴露: z.boolean().prefault(false),
    反噬程度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).describe('契约反噬烈度，0为无感，100为濒临收取').prefault(0),
  }).prefault({}),

  伊卡洛斯: z.object({
    好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    现状: z.string().describe('她此刻在哪、在做什么').prefault('待初始化'),
    着装: z.string().describe('当前穿着').prefault('待初始化'),
    当前形态: z.enum(['常规形态', '娇小形态']).prefault('常规形态'),
    收取意向: z.enum(['冷酷执行', '悄然动摇', '暗中拖延', '寻找解法']).prefault('冷酷执行'),
    真实身份暴露: z.boolean().prefault(false),
  }).prefault({}),

  普利凯特: z.object({
    好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    现状: z.string().describe('她此刻在做什么').prefault('待初始化'),
    着装: z.string().describe('当前穿着').prefault('待初始化'),
    真实身份暴露: z.boolean().prefault(true),
  }).prefault({}),

  路西法: z.object({
    好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    现状: z.string().describe('她此刻在哪、在做什么').prefault('待初始化'),
    着装: z.string().describe('当前穿着').prefault('待初始化'),
    真实身份暴露: z.boolean().prefault(false),
    真名知晓: z.boolean().prefault(false),
  }).prefault({}),

  其他角色: z.record(
    z.string().describe('角色名'),
    z.object({
      身份: z.string().prefault('待初始化'),
      现状: z.string().prefault('待初始化'),
      好感度: z.coerce.number().prefault(50).transform(v => _.clamp(v, 0, 100)),
    }),
  ).prefault({}),
});
  return extractShape(__S_YMS);
}

/* ═══ 岁寒新正（V17并入：世界/角色→岁寒新正世界/角色） ═══ */
function buildShxShape() {
const __S_SHX = z.object({
  岁寒新正世界: z.object({
    天气: z.enum(['晴', '多云', '雨', '暴雨', '雪']).prefault('晴'),
    日期: z.string().prefault('待初始化'),
    时间: z.string().prefault('待初始化')
  }).prefault({}),
  岁寒新正角色: z.object({
    林纾璃: z.object({
      好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(50),
      心情: z.string().prefault('平静')
    }).prefault({}),
    云知意: z.object({
      好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
      心情: z.string().prefault('冷漠'),
      // 引入一个隐藏标记，用于打破剧情锁
      $已触发破镜重圆事件: z.boolean().prefault(false),
      _关系阶段: z.string().prefault('暗流涌动')
    }).prefault({}).transform(data => {
      let stage = '暗流涌动';
      if (data.好感度 < 30) {
        stage = '暗流涌动';
      } else if (data.好感度 < 85) {
        stage = '两难挣扎';
      } else {
         // 好感度达到 85 以上，检验剧情锁
        if (data.$已触发破镜重圆事件) {
          stage = '清醒接纳';
        } else {
          stage = '心防动摇(锁中)';
        }
      }
      data._关系阶段 = stage;
      return data;
    })
  }).prefault({})
});
  return extractShape(__S_SHX);
}

  function extractShape(s) {
    let cur = s, guard = 0;
    while (cur && !(cur.shape) && guard++ < 6) {
      cur = (cur.def && cur.def.innerType) || (cur._def && cur._def.innerType) || null;
    }
    if (!cur || !cur.shape) throw new Error('extractShape失败: 无法解包到ZodObject');
    return cur.shape;
  }

  function buildNnShape() {
    // 男娘档案：男娘角色.{角色名}.{好感度/心情/当前神情/...} → looseObject透传，prefault空对象
    return {
      '男娘角色': z.record(z.string(), z.any()).prefault({}),
    };
  }
  function buildSchema() {
    const shape = {};
    const on = (m) => (ACTIVE === null) || ACTIVE.has(m);
    if (on('临海市二中')) Object.assign(shape, buildLhShape());
    if (on('五色棱光'))   Object.assign(shape, buildWsShape());
    if (on('青梅正宗'))   Object.assign(shape, buildQmShape());
    if (on('栖澜镇'))     Object.assign(shape, buildQlShape());
    if (on('御木市'))     Object.assign(shape, buildYmsShape());
    if (on('岁寒新正'))   Object.assign(shape, buildShxShape());
    if (on('男娘档案'))   Object.assign(shape, buildNnShape());
    return z.object(shape);
  }

  function fn(name) {
    const scopes = [];
    try { scopes.push(window, window.TavernHelper); } catch (_) {}
    try { scopes.push(HW, HW.TavernHelper); } catch (_) {}
    for (const s of scopes) {
      try { if (s && typeof s[name] === 'function') return s[name].bind(s); } catch (_) {}
    }
    return null;
  }

  /* 全局写互斥: 把async写操作串行化，消除多写入方交错的lost update（失败不阻塞后续写） */
  function serializeWrite(task) {
    const run = wbMutex.then(task, task);
    wbMutex = run.catch(() => {});
    return run;
  }

  async function refreshActive() {
    try {
      const getNames = fn('getCharWorldbookNames');
      const getWB = fn('getWorldbook');
      if (!getNames || !getWB) return;
      const n = await Promise.resolve(getNames('current'));
      const bookName = String((n && (n.primary || n.name)) || '');
      if (!bookName) return;
      const entries = await Promise.resolve(getWB(bookName));
      if (!Array.isArray(entries) || entries.length === 0) {
        /* API未就绪: 保持上次已知/null，安排自愈重试（45s兜底前先自救） */
        if (!refreshActive.__retrying) {
          refreshActive.__retrying = true;
          setTimeout(() => { refreshActive.__retrying = false; refreshActive(); }, 2000);
        }
        return;
      }
      const set = new Set();
      const syncSet = new Set();
      for (const e of entries) {
        const cm = String(e.comment || '');
        if (!cm.startsWith('【模块总览】')) continue;
        const mn = cm.slice('【模块总览】'.length).trim();
        const enabled = e.enabled === true || (e.enabled === undefined && e.disable !== true);
        if (!enabled) continue;
        if (MVU_MODS.includes(mn)) set.add(mn);
        if (SYNC_MODS.includes(mn)) syncSet.add(mn);
      }
      const prev = ACTIVE;
      if (ACTIVE === null || set.size !== ACTIVE.size || [...set].some(x => !ACTIVE.has(x))) {
        ACTIVE = set;
        console.log('[ruby-mvu] 激活模块:', [...set].join('、') || '（无）');
      }
      /* MVU联动: 激活集变化时更新宪法条目 + 指令条目启停（低频: 仅玩家切模块时写一次） */
      const syncSig = [...syncSet].sort().join('|');
      if (prev === null || prevSync !== syncSig || ACTIVE === null || set.size !== (prev ? prev.size : -1) || [...set].some(x => !(prev && prev.has(x)))) {
        prevSync = syncSig;
        try { await syncConstitution(set, syncSet, bookName); } catch (err) { console.warn('[ruby-mvu] 同步失败:', err); }
      }
      /* 持续同步: 把当前总览状态存入当前chatId的快照槽（任何变化都即时保鲜） */
      try {
        const snapNow = snapshotConfig(entries);
        const prevSnap = loadSnap(getChatId());
        if (JSON.stringify(prevSnap) !== JSON.stringify(snapNow)) {
          saveSnap(getChatId(), snapNow);
        }
      } catch (_) {}
    } catch (_) {}
  }

  /* 各模块顶层键描述（无schema模块硬编码） */
  const MOD_KEYS_EXTRA = { '人间尚有余温': ['任务进度'] };
  function describeKeys(mod) {
    try {
      if (mod === '临海市二中') return Object.keys(buildLhShape()).join('/');
      if (mod === '五色棱光')   return Object.keys(buildWsShape()).join('/');
      if (mod === '青梅正宗')   return Object.keys(buildQmShape()).join('/');
      if (mod === '栖澜镇')     return Object.keys(buildQlShape()).join('/');
      if (mod === '御木市')     return Object.keys(buildYmsShape()).join('/');
      if (mod === '岁寒新正')   return Object.keys(buildShxShape()).join('/');
    } catch (_) {}
    return (MOD_KEYS_EXTRA[mod] || []).join('/');
  }

  async function syncConstitution(set, syncSet, bookName) {
    const update0 = fn('updateWorldbookWith');
    if (!update0 || !bookName) return;
    const update = (name, f, opts) => serializeWrite(() => update0(name, f, opts));
    const on = [], off = [];
    for (const m of MVU_MODS) {
      const kd = describeKeys(m);
      if (!kd) continue;
      if (set.has(m)) on.push('- ' + m + ': ' + kd);
      else off.push('- ' + m + ': ' + kd);
    }
    const content = ('【MVU变量体系宪法】本卡存在多个平行变量体系，你只能读写"当前激活"的体系。\n\n'
      + '当前激活体系（可读、可更新）:\n' + (on.join('\n') || '（无）') + '\n\n'
      + '当前未激活体系（禁止读取其数值、禁止对其输出任何更新指令）:\n' + (off.join('\n') || '（无）') + '\n\n'
      + '规则:\n'
      + '1. 变量路径必须以激活体系的顶层键为根（如 /御木市世界/当前日期），禁止假设所有模块共用"世界/角色"\n'
      + '2. 未激活体系的顶层键即使出现在上下文中，也不输出其 <UpdateVariable>/<JSONPatch> 更新\n'
      + '3. 多体系同开时，<UpdateVariable> 的 <Analysis> 用中文、不超过80词；只更新剧情涉及的激活体系\n'
      + '4. 变量初始化只在首楼发生，不在后续楼层重复初始化\n'
      + '5. 本条目由系统自动维护，随模块开关自动更新——不要手动修改').slice(0, 1500);
    const instrRe = /(?:\[mvu_update\]|变量(?:输出|更新)规则|变量列表|变量当前状态|动态关系反馈|状态面板输出规则|核心规则清单|支线任务清单管理)/;
    await Promise.resolve(update(bookName, list => {
      const arr = Array.isArray(list) ? list.slice() : [];
      let changed = false;
      let foundCt = false;
      for (let i = 0; i < arr.length; i++) {
        const e = arr[i];
        const cm = String((e && e.comment) || '');
        if (cm === '【MVU】变量体系宪法') {
          foundCt = true;
          if (e.content !== content) { arr[i] = Object.assign({}, e, { content: content }); changed = true; }
          continue;
        }
        if (RETIRED_FMT.indexOf(cm) >= 0) {
          /* V27: 三胞胎输出格式已并入共享条目, 退役条目永久关闭(漂移纠正) */
          if (e.enabled !== false || e.constant !== false) { arr[i] = Object.assign({}, e, { enabled: false, constant: false }); changed = true; }
          continue;
        }
        const m = cm.match(/^【([^】]+)】/);
        if (!m) continue;
        const mod = m[1];
        if (SYNC_MODS.indexOf(mod) < 0) continue;
        const tail = cm.slice(m[0].length);
        if (!instrRe.test(tail)) continue;
        /* 动态隔离: 模块激活→指令常驻；未激活→全关（enabled/constant双false，零token） */
        const want = syncSet.has(mod);
        const curE = e.enabled !== false;
        const curC = e.constant === true;
        if (curE !== want || curC !== want) {
          arr[i] = Object.assign({}, e, { enabled: want, constant: want });
          changed = true;
        }
      }
      /* V27共享条目治理: 三胞胎任一激活即开, 全未激活即关; 缺失时从退役条目克隆重建 */
      const sharedWant = TRIPLETS.some(function (m) { return syncSet.has(m); });
      let foundShared = false;
      for (let i = 0; i < arr.length; i++) {
        if (String((arr[i] && arr[i].comment) || '') === SHARED_FMT) {
          foundShared = true;
          const se = arr[i];
          if (se.enabled !== sharedWant || se.constant !== sharedWant) { arr[i] = Object.assign({}, se, { enabled: sharedWant, constant: sharedWant }); changed = true; }
          break;
        }
      }
      if (!foundShared && sharedWant) {
        const donor = arr.find(x => RETIRED_FMT.indexOf(String((x && x.comment) || '')) >= 0);
        if (donor) { arr.push(Object.assign({}, donor, { comment: SHARED_FMT, enabled: true, constant: true })); changed = true; console.log('[ruby-mvu] 共享输出格式条目已重建'); }
      }
      if (!foundCt) {
        arr.push({ uid: 'ruby_mvu_constitution_v1', comment: '【MVU】变量体系宪法', keys: ['UpdateVariable', 'JSONPatch', 'stat_data', '变量更新', 'initvar'], secondary_keys: [], content: content, constant: true, disabled: false, insertion_order: 90, selectiveLogic: 0, sticky: 0, position: 0, extensions: {}, scan_depth: null, caseSensitive: null, enabled: true });
        changed = true;
        console.log('[ruby-mvu] MVU宪法条目已创建');
      }
      if (!changed) return arr; /* 无变化不写 */
      return arr;
    }, { render: 'debounced' }));
  }
  try { HW.addEventListener('ruby-mvu-refresh', () => setTimeout(refreshActive, 300)); } catch (_) {}
  /* 聊天级模块配置快照: 按chatId分槽（每聊天独立记住自己的模块配置） */
  function getChatId() {
    try { return String(HW.SillyTavern && HW.SillyTavern.getContext ? (HW.SillyTavern.getContext().chatId || 'default') : 'default'); } catch (_) { return 'default'; }
  }
  function snapshotConfig(entries) {
    const snap = {};
    for (const e of entries) {
      const cm = String(e.comment || '');
      if (!cm.startsWith('【模块总览】')) continue;
      snap[cm.slice(6).trim()] = { enabled: e.enabled !== false, constant: e.constant === true };
    }
    return snap;
  }
  function loadSnap(cid) {
    try {
      const all = JSON.parse(HW.localStorage.getItem(SNAP_KEY) || '{}');
      return all[cid] || null;
    } catch (_) { return null; }
  }
  function saveSnap(cid, snap) {
    try {
      const all = JSON.parse(HW.localStorage.getItem(SNAP_KEY) || '{}');
      all[cid] = snap;
      const ks = Object.keys(all);
      if (ks.length > 40) for (const k of ks.slice(0, ks.length - 40)) delete all[k]; /* LRU: 上限40聊天，防无限增长 */
      HW.localStorage.setItem(SNAP_KEY, JSON.stringify(all));
    } catch (_) {}
  }

  async function applySnapshot(snap, bookName) {
    if (!snap) return;
    const update0 = fn('updateWorldbookWith');
    if (!update0) return;
    await serializeWrite(() => update0(bookName, list => {
      const arr = Array.isArray(list) ? list.slice() : [];
      for (let i = 0; i < arr.length; i++) {
        const e = arr[i];
        const cm = String(e.comment || '');
        if (!cm.startsWith('【模块总览】')) continue;
        const st = snap[cm.slice(6).trim()];
        if (!st) continue;
        const wantE = st.enabled;
        const curE = e.enabled !== false;
        /* 只恢复总览开关（指令条目启停由syncConstitution跟随，避免双写竞态） */
        if (curE !== wantE) { arr[i] = Object.assign({}, e, { enabled: wantE }); }
      }
      return arr;
    }, { render: 'debounced' }));
    console.log('[ruby-mvu] 已应用该聊天的模块配置快照');
  }

  try {
    const te = HW.tavern_events || {};
    const ev = te.CHAT_CHANGED || 'chat_changed';
    const onChatChanged = async (newChatId) => {
      /* CHAT_CHANGED事件参数即新chatId；旧chatId需在事件前记录——用双缓冲:
         每次刷新Active时顺带保存当前chatId的快照（持续同步），切换时无需抢救 */
      try {
        const oldCid = getChatId();
        /* 立即更新本地chatId认知 */
        try {
          const ctx = HW.SillyTavern && HW.SillyTavern.getContext ? HW.SillyTavern.getContext() : null;
          if (ctx && ctx.chatId) { /* 事件后context已是新chatId */ }
        } catch (_) {}
        const newCid = typeof newChatId === 'string' && newChatId ? newChatId : getChatId();
        /* 1. 持续同步机制已保证快照新鲜: 直接读旧chatId的槽（无需现场抢救） */
        /* 2. 若新聊天有自己的槽 → 恢复; 否则不动（尊重当前世界书状态为新聊天的初始配置） */
        setTimeout(async () => {
          try {
            const snap = loadSnap(newCid);
            const getNames1 = fn('getCharWorldbookNames');
            if (getNames1 && snap) {
              const n1 = await Promise.resolve(getNames1('current'));
              const bn1 = String((n1 && (n1.primary || n1.name)) || '');
              if (bn1) await applySnapshot(snap, bn1);
            }
          } catch (_) {}
          setTimeout(refreshActive, 300);
        }, 600);
        console.log('[ruby-mvu] 聊天切换:', oldCid.slice(-8), '→', String(newCid).slice(-8));
      } catch (_) {}
    };
    if (typeof HW.eventOn === 'function') HW.eventOn(ev, onChatChanged);
    else if (typeof eventOn === 'function') eventOn(ev, onChatChanged);
  } catch (_) {}

  $(() => {
    refreshActive(); /* 同步首刷（V19零空窗原则: 不等待任何网络导入） */
    setInterval(refreshActive, 45000);
    try { const H = HW.__RUBY_WB_HEALTH__; if (H) { H.ready = true; H.at = Date.now(); } } catch (_) {}
    (async () => {
      try { await __mvuZodReady; } catch (_) {}
      if (typeof registerMvuSchema === 'function') {
        try { registerMvuSchema(buildSchema); } catch (err) { console.warn('[ruby-mvu] schema注册被MVU侧拒绝:', err && err.message); }
      } else {
        console.warn('[ruby-mvu] mvu_zod.js 加载失败——schema注册跳过，指令同步/宪法/快照/互斥照常运行（变量回落MVU原生initvar模式）');
      }
      try { const H = HW.__RUBY_WB_HEALTH__; if (H) { H.schemaOk = (typeof registerMvuSchema === 'function'); } } catch (_) {}
      console.log('[ruby-mvu] schema注册阶段完成（schemaOk=' + (typeof registerMvuSchema === 'function') + '）');
    })();
    console.log('[ruby-mvu] 统一Schema注册中心 v3.2 就绪（6模块·22正交键·MVU宪法联动·健康信标·守卫导入）');
  });

  HW[SLOT] = { buildSchema, refreshActive, serializeWrite, get active() { return ACTIVE; } };
  HW.__RUBY_WB_MUTEX__ = serializeWrite; /* 跨脚本共享写互斥 */
})();
