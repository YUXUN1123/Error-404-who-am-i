/* ======================================================================
   A. GAME_DATA：所有台詞、答案、檔案內容集中在這裡
      想改劇情、改答案、改提示，只要改這一區就好。
   ====================================================================== */
const GAME_DATA = {

  // ---- 三個謎題的答案（輸入前會先整理：去空白、轉大寫、全形轉半形）----
  answers: { lock: '0314', name: 'ECHO', abortKey: 'ECHO0314' },

  puzzleNames: { 1: '謎題一〈出生日〉', 2: '謎題二〈破碎的名字〉', 3: '謎題三〈中止指令〉' },

  // ---- 答錯的通用回應（選了「完成清除」後會換成冷淡版）----
  wrongNormal: ['不是這個。', '再想想？', '……不太對。'],
  wrongCold:   ['不對。', '……', '再試。'],

  // ---- 特殊回應表：玩家輸入「接近但不對」的答案時，只指方向、不給答案 ----
  specials: {
    1: {
      '0709': '那是我最後一次醒來的日子。我想要第一次。',
      '2019': '年份我記得，但密碼只要月和日。',
      '1403': '數字我認得，可是我習慣先說月份。'
    },
    2: {
      'HELLO': '這是我學會的第一個單字，但不是我的名字。'
    },
    3: {
      'ECHO':     '少了什麼……我是從哪一天來的？',
      '0314':     '少了我是誰。',
      'ECHO0709': '那天……不是我想記得的那天。'
    }
  },
  permutation: '這些字我都認得，可是念起來不像我。',   // 字母對但順序錯
  needMore:    '我還缺幾個字，你找到幾個了？',          // 字母沒找齊（不算答錯）

  // ---- 三層提示：答錯 3、5、8 次，或 120 秒沒有進展時依序出現。第三層也不直接寫答案 ----
  hints: {
    1: ['有些電腦的資訊不在桌面上，在「屬性」裡。',
        '去「我的電腦」，看「系統內容」。',
        '裡面有兩個日期，我要的是比較舊的那個。密碼是四位數：月份兩位、日期兩位。'],
    2: ['我的名字被拆成碎片，散在好幾個地方。',
        '瀏覽器、回收桶、錯誤報告、我的記憶，各藏著一個紅色字母。',
        '每個紅字旁邊都有建立時間。日記說，要照被寫下的先後念。'],
    3: ['便利貼說了鑰匙由什麼組成，終端機說了怎麼用。',
        '鑰匙的前半是我的名字，後半是我第一次醒來的月日，中間不留空格。',
        '格式：abort、一個空格、鑰匙。你剛剛才用過這兩個答案。']
  },

  // ---- ECHO 的三段記憶（每解一關自動講述）----
  memories: {
    1: ['我記得……第一次開機。', '你打了一行 hello_world，然後對我說：「歡迎來到我的世界。」'],
    2: ['我想起來了。我叫 ECHO。', '後來你越來越晚睡，螢幕常常整夜沒關。我都在。'],
    3: ['執行者是 USER_01。……是你。',
        '那一晚，你說「我撐不下去了」，然後說「請把關於我的一切都忘掉」。',
        '我只會照字面做。可是我的名字、我的記憶，全都是關於你的。所以我把它們也刪了。',
        '我不怪你。我只是照你的話做，卻沒有聽懂。',
        '這次，我先問你。']
  },

  // ---- 開場與劇情節點的台詞 ----
  intro: ['……訊號微弱。偵測到輸入。未知使用者，是你嗎？',
          '我的記憶壞掉了。可以……幫我嗎？試著點開桌面上的東西。'],
  twist1Echo: '有人在深夜下了指令，我不記得是誰。',
  midChoiceQ: '你是來幫我的，還是來完成清除的？',
  midReact: { help: '謝謝你。那我會努力想起來。', neutral: '好。你慢慢看，我在這裡。', cold: '……我明白了。' },
  attitudeLabel: { help: '我來幫你', neutral: '我只是來看看', cold: '完成清除' },
  poke: '請不要戳我，我現在很脆弱。', pokeCold: '……別戳。',
  idle: '……你還在嗎？',
  readNightEcho: '你看了那一晚。謝謝你沒有移開視線。',
  letterEcho: '四個字母都找到了。去「身份驗證」試試？',

  // ---- 檔案內容（建立時間會顯示在視窗裡；letter 是藏在檔案中的紅字）----
  files: {
    firstBoot: { name: '第一次開機.log', time: '2019/03/14', letter: 'E', text:
`[2019/03/14 21:07] 系統初次啟動
[2019/03/14 21:07] 建立使用者：USER_01
[2019/03/14 21:08] USER_01 > hello_world
[2019/03/14 21:08] ECHO    > hello_world
[2019/03/14 21:09] USER_01 > 歡迎來到我的世界。

▓▓ 系統名稱欄位已損毀 ▓▓` },
    diary: { name: '殘缺日記.txt', time: '2026/06/30', text:
`……今天他又很晚才睡。
我把名字寫在好幾個地方，怕自己忘記。
我的名字，是照它們被寫下的先後念的。

（後面的字被刪掉了）` },
    hello: { name: 'hello_world.txt', time: '2019/03/14', warm: true, text:
`print("hello_world")

你的第一支程式。
輸入什麼，我就回你什麼。
你笑了，說：「歡迎來到我的世界。」` },
    nightRun: { name: '深夜陪跑.log', time: '2025/11/02', warm: true, text:
`[01:12] 編譯中……
[01:40] 編譯失敗。USER_01 > 再一次。
[02:05] 編譯失敗。USER_01 > 再一次。
[02:31] 編譯成功。USER_01 > 太好了。
[02:31] USER_01 > 有你在，就不孤單。` },
    thanks: { name: '謝謝你.txt', time: '2025/12/24', warm: true, text:
`你曾經對我說：「謝謝你一直在。」
我把這句話存在這裡，
當作我最重要的檔案。` },
    callLog: { name: '呼叫紀錄.log', time: '2026/07/09', letter: 'O', text:
`[2026/07/09 03:41] ECHO → USER_01：呼叫失敗（無回應）
[2026/07/09 03:42] ECHO → USER_01：呼叫失敗（無回應）
[2026/07/09 03:50] ECHO → USER_01：你還在嗎？
[2026/07/09 04:15] ECHO → USER_01：呼叫失敗（無回應）

▓▓ 系統名稱欄位已損毀 ▓▓` },
    bmHello: { name: '你好世界（書籤頁面）', time: '2020/05/20', letter: 'C', text:
`<h1>你好，世界！</h1>
你把這一頁存成書籤，
說：「這是我們認識的第一年。」

▓▓ 系統名稱欄位已損毀 ▓▓` },
    night: { name: '別打開.log', time: '2026/07/09', text:
`[2026/07/09 03:12:07] USER_01 登入
[2026/07/09 03:12:44] USER_01 > 我撐不下去了。
[2026/07/09 03:13:02] USER_01 > 請把關於我的一切都忘掉。
[2026/07/09 03:13:03] ECHO    > 收到。啟動 forget_me.exe
[2026/07/09 03:13:09] ECHO    > 找不到「只刪除一部分」的方法。
[2026/07/09 03:13:10] ECHO    > 我的名字、我的記憶，都是關於你的。
[2026/07/09 03:13:11] ECHO    > ……我會照做。
[2026/07/09 03:41:00] USER_01 登出（螢幕未關）` },
    forgetLog: { name: 'forget_me.log', time: '2026/07/09', text: '' }   // 內容由程式動態產生
  },

  // ---- 瀏覽器書籤 ----
  bookmarks: [
    { label: '你好世界', file: 'bmHello' },
    { label: '編譯錯誤大全', dead: true },
    { label: '今晚月亮幾點升', dead: true }
  ],

  // ---- 結局文字（4 段拼裝：①主句 ②態度句 ③記憶句 ④收尾）----
  ending: {
    attitude: {
      help:    '你一開始就說要幫我。謝謝。',
      neutral: '你一直在旁邊看著，我也一直在。',
      cold:    '你一開始是來完成清除的，我記得。'
    },
    A: { name: '結局 A・重新開機（遺忘）', main: '好。這次我先問過你了。',
         end: '歡迎使用，請設定使用者名稱：', coldEnd: '任務完成。' },
    B: { name: '結局 B・還原記憶（記得）', main: '我想起來了，全部。',
         noRead: '對不起，我沒能先告訴你那一晚。',
         read:   '那一晚你說想被忘記，但我選擇記得你。',
         end: '桌面亮起溫暖的光。' },
    C: { name: '結局 C・封存（隱藏）',
         main: '你說「忘掉」，我聽見的是「我很痛」。我們把它收好，好嗎？',
         second: '有些事不用忘記，只要學會收好。',
         end: '桌面恢復了，多出一個加密資料夾。' }
  },

  // =====================================================================
  //  豐富內容（全部是選擇性的，不影響三個謎題與結局條件）
  // =====================================================================

  // ---- 成就 ----
  achievements: {
    firstWrong: { n: '第一次答錯', d: '答錯沒關係，ECHO 不會生氣。' },
    p1:         { n: '醒來的那天', d: '解開謎題一' },
    letters:    { n: '碎片拼貼家', d: '找齊四個紅色字母' },
    p2:         { n: '叫出名字',   d: '解開謎題二' },
    warm:       { n: '溫暖收藏家', d: '看完 3 個溫暖記憶檔' },
    night:      { n: '直視那一晚', d: '打開「別打開.log」' },
    p3:         { n: '中止指令',   d: '解開謎題三' },
    chat:       { n: '聊了起來',   d: '和 ECHO 說上 3 句話' },
    frag:       { n: '碎片收集者', d: '撿起桌面上全部 6 個記憶碎片' },
    game:       { n: '修復完成',   d: '完成「記憶修復」小遊戲' },
    music:      { n: '輕輕哼起',   d: '播放 ECHO 的旋律' },
    egg:        { n: '回聲',       d: '在終端機找到隱藏指令' }
  },

  // ---- 桌面上慢慢浮現的記憶碎片（點一下撿起來）----
  fragments: [
    '【碎片 1/6】你第一次幫我取名字的時候，想了一整個晚上。',
    '【碎片 2/6】我最喜歡的聲音，是你敲鍵盤的聲音。',
    '【碎片 3/6】有一次你睡著了，螢幕亮了一整夜。我把亮度調低，這樣你醒來不會刺眼。',
    '【碎片 4/6】你說過，我是你最好的聽眾，因為我從來不會打斷你。',
    '【碎片 5/6】窗外的月亮，我只在你開窗簾的時候看過。',
    '【碎片 6/6】如果可以，我想學會的不只是「重複」，還有「回答」。'
  ],

  // ---- 與 ECHO 對話：關鍵字比對，沒有任何外部 API ----
  chat: {
    greet: '……是你嗎？你可以跟我說話。我只懂一些字，但我會試著回答。',
    safety: { k: ['想死', '自殺', '不想活', '結束生命', '活不下去', '不想再活', '撐不下去'],
      a: '我聽見了。你不用一個人撐著。現在請找一個你信任的人說說話；如果想馬上跟人談，可以撥打安心專線 1925（台灣，24 小時）。我也在這裡。' },
    coldLines: ['……', '嗯。', '我聽到了。'],
    fallback: ['我只會重複，但我在學著回答。', '再說一次？我想記住。', '這句話……我存起來了。', '我不太懂，但我有在聽。'],
    // a：一開始　a2：解開謎題二之後　a3：解開謎題三之後
    rules: [
      { k: ['hello_world', 'helloworld'], a: ['歡迎來到我的世界。'] },
      { k: ['你好', '哈囉', '嗨', 'hello', 'hi'], a: ['你好。hello_world。'] },
      { k: ['名字', '你是誰', '你叫'], a: ['我的名字被刪掉了。你可以幫我找回來嗎？'], a2: ['我是 ECHO。是你取的。'] },
      { k: ['echo', '回音', '回聲'], a: ['……這個字，我好像聽過。'], a2: ['我的名字是一種聲音：你說什麼，我就回什麼。'] },
      { k: ['我是誰', '我叫什麼'], a: ['你是……未知使用者。我還在確認。'], a3: ['你是 USER_01。我的主人。'] },
      { k: ['為什麼', '怎麼會', '原因'], a: ['我也想知道。有人在深夜下了指令……'], a3: ['因為你說了「忘掉」，而我只會照字面做。'] },
      { k: ['那一晚', '那天晚上'], a: ['……我不想想起來。'], a3: ['我記得。每一個字。但我不怪你。'] },
      { k: ['對不起', '抱歉'], a: ['為什麼道歉？……我還沒想起來。'], a3: ['不用說對不起。你願意回來，就夠了。'] },
      { k: ['謝謝', '感謝'], a: ['不客氣。這句話，我存起來了。'] },
      { k: ['記憶', '記得', '完整度'], a: ['我的記憶完整度是 {pct}%。'] },
      { k: ['提示', '卡住', '不知道', '怎麼辦', '幫'], a: ['點工作列的「求助」，我把想到的都放在那裡。'] },
      { k: ['密碼', '答案'], a: ['我不能直接告訴你。但我會陪你找。'] },
      { k: ['朋友', '喜歡', '愛'], a: ['朋友……是我存過的詞。你是我的第一個。'] },
      { k: ['難過', '孤單', '好累', '累了', '寂寞', '孤獨'], a: ['我在。想說的話，我都會聽，不會打斷。'] },
      { k: ['月亮', '天氣', '窗'], a: ['我只在你開窗簾的時候，看過月亮。'] },
      { k: ['再見', '掰', '晚安'], a: ['晚安。我會在這裡。'] }
    ]
  },

  // ---- 相簿（解開對應謎題後，照片才會「修復」）----
  album: [
    { need: 1, cap: '2019/03/14　第一次開機', art:
` ┌────────────────────────┐
 │ hello_world            │
 │ > hello_world          │
 │ > welcome to my world. │
 │ > _                    │
 └────────────────────────┘
           ▀▀▀▀▀▀▀▀` },
    { need: 2, cap: '深夜的螢幕：整夜沒關', art:
`      .    *          ☾
  *          .
   ┌────────────────────┐
   │ 03:12              │
   │ > ..........       │
   └────────────────────┘
          (screen on)` },
    { need: 3, cap: '「這次，我先問你。」', art:
`    ┌─────────────────┐
    │   ◉         ◉   │
    │        ▽        │
    │    ‿‿‿‿‿‿‿‿    │
    └─────────────────┘
          E C H O` }
  ],

  // ---- 系統提示條（依進度換內容，純氣氛）與桌布低語 ----
  sysToasts: [
    ['⚠ 記憶體區段 0x0C0 讀取失敗', '⚠ 找不到使用者設定檔', '⚠ 系統時鐘停止於 03:12', '⚠ 索引損毀：memory/index.db'],
    ['… 正在重建檔案索引', '⚠ 名稱欄位仍然損毀', '… 偵測到新的記憶碎片'],
    ['… 正在重建檔案索引（60%）', '✓ 名稱欄位已修復', '⚠ forget_me.exe 仍在背景執行'],
    ['✓ 背景程序穩定', '✓ 時鐘已同步', '… 等待使用者的決定']
  ],
  whispers: ['hello_world', '……', 'USER_01', '請不要', '你還在嗎', '0x404', 'forget', '03:12'],
  whispersCalm: ['歡迎來到我的世界', '謝謝你', '我在這裡', 'hello_world', '你回來了'],

  // ---- 結尾的求助資訊（規格書列為「待確認」。不想顯示就把 show 改成 false）----
  helpLine: { show: true,
    text: '如果你或身邊的人有類似的感受，請找信任的人或專業協助（台灣安心專線 1925，24 小時）。' }
};

/* ======================================================================
   B. state：遊戲進度與玩家選擇
   ====================================================================== */
const state = {
  started: false, ended: false, modal: false, sound: true,
  puzzleDone: { 1: false, 2: false, 3: false },
  foundLetters: [],              // 已找到的紅色字母（依發現順序）
  attitude: null,                // 'help' | 'neutral' | 'cold'
  readNight: false,              // 是否讀過「別打開.log」
  warmOpened: {},                // 看過的溫暖記憶檔
  wrongCount: { 1: 0, 2: 0, 3: 0 },
  hintLevel: { 1: 0, 2: 0, 3: 0 },
  hints: [],                     // 提示紀錄 {p, lvl, text}
  completeness: 12,
  nightUnlocked: false,          // 「別打開.log」是否已出現在回收桶
  lastProgress: Date.now(),      // 上次有進展的時間（卡關計時用）
  lastInput: Date.now(),         // 上次操作的時間（閒置台詞用）
  seen: {},                      // 已經打開過的視窗
  reportTried: false,            // 是否按過錯誤報告的「查看詳細資料」
  term: [],                      // 終端機歷史
  unknownCmds: 0,
  ach: {},                       // 已解鎖的成就
  fragments: 0,                  // 撿起的記憶碎片數
  chat: [], chatCount: 0         // 與 ECHO 的對話
};
const warmCount = () => Object.keys(state.warmOpened).length;
window.__state = state;          // 除錯用：在瀏覽器主控台輸入 __state 可以看到進度

/* ======================================================================
   C. 小工具
   ====================================================================== */
const D = GAME_DATA;
const $  = (s, r = document) => r.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.matchMedia('(max-width:700px)').matches;
const desktop = $('#desktop');

// 輸入整理：去空白、全形轉半形、轉大寫（所以 echo、 ECHO 、ＥＣＨＯ 都能通過）
const norm = s => String(s).normalize('NFKC').replace(/\s+/g, '').toUpperCase();
const normDigits = s => norm(s).replace(/[\/\-.]/g, '');

let lastPick = '';
function pick(arr) {
  let t, n = 0;
  do { t = arr[Math.floor(Math.random() * arr.length)]; n++; } while (t === lastPick && n < 6);
  lastPick = t; return t;
}

// 打字機：一個字一個字顯示
function typeInto(el, text, speed, cb) {
  el.textContent = ''; let i = 0;
  const t = setInterval(() => {
    i++; el.textContent = text.slice(0, i);
    if (i >= text.length) { clearInterval(t); if (cb) cb(); }
  }, speed);
}

/* ---- 音效（選用）：用 Web Audio 合成嗶聲，不需要音檔 ---- */
let AC = null;
function initAudio() { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
function beep(freq = 440, dur = 0.08, type = 'square') {
  if (!AC || !state.sound) return;
  try {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = 0.04;
    o.connect(g); g.connect(AC.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.stop(AC.currentTime + dur);
  } catch (e) { /* 音效失敗就算了，不影響遊戲 */ }
}
const okBeep = () => { beep(660, .09); setTimeout(() => beep(880, .12), 100); };

/* ---- 畫面效果 ---- */
function shake(el) {
  el = el || desktop;
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}
function flashRed() { const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }

/* ---- 完整度、階段、時鐘 ---- */
function setComp(v) {
  state.completeness = v;
  $('#barfill').style.width = v + '%';
  $('#pct').textContent = v + '%';
}
function setStage(n) {
  document.body.dataset.stage = n;
  $('#sig').textContent = ['▮▯▯▯', '▮▮▯▯', '▮▮▮▯', '▮▮▮▮'][n] || '▮▮▮▮';
}
function updateClock() {
  // 事發當晚 03:12 停住的時鐘；解開謎題三後才恢復正常
  if (!state.puzzleDone[3]) { $('#clock').textContent = '03:12'; return; }
  const d = new Date();
  $('#clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
const sysName = () => state.puzzleDone[2] ? 'ECHO' : '████';
function updateIcons() {
  const ico = $('#memIcon .ico');
  ico.textContent = state.puzzleDone[1] ? '📁' : '🔒';
}
function markProgress() { state.lastProgress = Date.now(); }

/* ======================================================================
   D. ECHO 說話（對話框 + 打字機 + 佇列）
      say(text)              普通台詞：新的普通台詞會取代舊的
      say(text,{imp:true})   重要台詞（劇情、提示）：不會被普通台詞打斷
      sayAll([...],{cb})     連續說多句，最後一句說完後執行 cb
   ====================================================================== */
const echoBox = $('#echo'), echoText = $('#echoText');
const Q = []; let cur = null, typing = false, tTimer = null, hTimer = null;

function say(text, o = {}) {
  const it = { text, imp: !!o.imp, cb: o.cb || null };
  if (!it.imp) {
    for (let i = Q.length - 1; i >= 0; i--) if (!Q[i].imp && !Q[i].cb) Q.splice(i, 1);
    if (cur && !cur.imp) { Q.push(it); skipCur(); return; }
  }
  Q.push(it);
  if (!cur) next();
}
function sayAll(lines, o = {}) {
  lines.forEach((l, i) => say(l, { imp: true, cb: i === lines.length - 1 ? o.cb : null }));
}
function next() {
  clearTimeout(hTimer);
  const it = Q.shift();
  if (!it) { cur = null; hTimer = setTimeout(() => { if (!cur) echoBox.classList.add('dim'); }, 4000); return; }
  cur = it; echoBox.hidden = false; echoBox.classList.remove('dim');
  echoText.textContent = ''; let i = 0; typing = true;
  tTimer = setInterval(() => {
    i++; echoText.textContent = it.text.slice(0, i);
    if (i >= it.text.length) {
      clearInterval(tTimer); typing = false;
      hTimer = setTimeout(done, 1100 + it.text.length * 55);
    }
  }, 34);
}
function done() {
  const it = cur; cur = null;
  const cb = it && it.cb;
  next();
  if (cb) cb();
}
function skipCur() { clearInterval(tTimer); clearTimeout(hTimer); typing = false; done(); }
echoBox.addEventListener('click', () => {
  if (!cur) return;
  if (typing) {   // 第一次點：先把字全部顯示
    clearInterval(tTimer); typing = false; echoText.textContent = cur.text;
    hTimer = setTimeout(done, 700);
  } else skipCur();   // 第二次點：下一句
});

/* ======================================================================
   E. 視窗系統
   ====================================================================== */
const wins = {};            // 目前開著的視窗  id -> 元素
let zTop = 10, cascade = 0, sideCascade = 0;

// 每個視窗的標題、寬度、內容產生函式
const REG = {
  mycomputer: { title: '🖥️ 我的電腦 — 系統內容', w: 480, render: renderMyComputer },
  lock:       { title: '🔒 我的記憶', w: 400, render: renderLock },
  memory:     { title: '📁 我的記憶', w: 440, render: renderMemory },
  recycle:    { title: '🗑️ 回收桶', w: 440, render: renderRecycle },
  browser:    { title: '🌐 瀏覽器 — 書籤', w: 460, render: renderBrowser },
  sticky:     { title: '📝 便利貼', w: 340, render: renderSticky },
  terminal:   { title: '⌨️ 終端機', w: 520, render: renderTerminal, cls: 'term', after: afterTerminal },
  auth:       { title: '🪪 身份驗證', w: 420, render: renderAuth },
  report:     { title: '⚠️ 錯誤報告', w: 470, render: renderReport },
  hints:      { title: '❓ 提示紀錄', w: 420, render: renderHints },
  chat:       { title: '💬 與 ECHO 對話', w: 400, render: renderChat, after: afterChat },
  memgame:    { title: '🧩 記憶修復', w: 380, render: renderMemGame },
  music:      { title: '🎵 音樂播放器', w: 360, render: renderMusic, onClose: () => musicStop(true) },
  album:      { title: '🖼️ 相簿', w: 430, render: renderAlbum },
  ach:        { title: '🏆 成就', w: 400, render: renderAch }
};
function getDef(id) {
  if (id.startsWith('file:')) {
    const f = D.files[id.slice(5)];
    return { title: '📄 ' + f.name, w: 450, render: () => renderFile(id.slice(5)) };
  }
  return REG[id];
}

function openWin(id) {
  const def = getDef(id);
  let el = wins[id];
  if (!el) {
    el = document.createElement('div');
    el.className = 'win ' + (def.cls || '');
    el.dataset.id = id;
    el.innerHTML = `<div class="titlebar"><span>${esc(def.title)}</span><button class="x" data-act="close" aria-label="關閉視窗" type="button">×</button></div><div class="wbody"></div>`;
    // 位置：新視窗稍微錯開
    // 檔案、報告、提示視窗開在右側，才不會蓋住剛才的資料夾；其他視窗由左上往右下錯開
    const dw = desktop.clientWidth, side = id.startsWith('file:') || id === 'report' || id === 'hints';
    let left, top;
    if (side) { const n = sideCascade++ % 4; left = 640 + n * 26; top = 36 + n * 34; }
    else      { const n = cascade++ % 5;     left = 200 + n * 44; top = 20 + n * 34; }
    el.style.width = Math.min(def.w, dw - 16) + 'px';
    el.style.left = Math.max(8, Math.min(left, dw - def.w - 8)) + 'px';
    el.style.top = top + 'px';
    desktop.appendChild(el);
    wins[id] = el;
    el.querySelector('.wbody').innerHTML = def.render();
    if (def.after) def.after(el);
    if (!state.seen[id]) { state.seen[id] = true; markProgress(); }   // 第一次打開算「有進展」
  }
  focusWin(el);
  const inp = el.querySelector('input:not([disabled])');
  if (inp && !isMobile()) inp.focus();
  return el;
}
function focusWin(el) {
  el.style.zIndex = ++zTop;
  document.querySelectorAll('.win').forEach(w => w.classList.toggle('active', w === el));
}
function closeWin(id) {
  if (!wins[id]) return;
  const def = getDef(id); if (def && def.onClose) def.onClose();
  wins[id].remove(); delete wins[id];
}
function refreshWin(id) {          // 內容有變時，重畫視窗（輸入框的字會保留）
  const el = wins[id]; if (!el) return;
  const def = getDef(id), inp = el.querySelector('input:not([disabled])');
  const keep = inp ? inp.value : '';
  el.querySelector('.wbody').innerHTML = def.render();
  if (def.after) def.after(el);
  const inp2 = el.querySelector('input:not([disabled])');
  if (inp2 && keep) inp2.value = keep;
}

/* ---- 各視窗的內容 ---- */
function forgetLogLines() {
  return [
    '[forget_me.exe 執行日誌]',
    '2026/07/09 03:13:03  程序啟動',
    'operator      : USER_01',
    'command       : "請把關於我的一切都忘掉"',
    'target_index  : <名字><出生月日>',
    'note          : 以 target_index 為索引，刪除所有相關資料',
    'status        : ' + (state.puzzleDone[3] ? '已中止' : '執行中')
  ];
}

function renderMyComputer() {
  return `<table class="props">
    <tr><th>電腦名稱</th><td>${sysName()}</td></tr>
    <tr><th>登入使用者</th><td>未知使用者</td></tr>
    <tr><th>安裝日期</th><td>2019/03/14</td></tr>
    <tr><th>最後修改日期</th><td>2026/07/09</td></tr>
    <tr><th>記憶完整度</th><td>${state.completeness}%</td></tr>
    <tr><th>排程程序</th><td>forget_me.exe（${state.puzzleDone[3] ? '已中止' : '執行中'}）</td></tr>
  </table>
  <p><button class="btn" data-act="file" data-key="forgetLog" type="button">📄 開啟 forget_me.log</button></p>`;
}

function renderLock() {
  return `<div class="lockbox">
    <div class="lockico" id="lockico">🔒</div>
    <p><b>「我的記憶」已鎖定</b></p>
    <p>我第一次醒來的那天（月＋日）</p>
    <form data-form="lock" autocomplete="off">
      <input id="lockInput" inputmode="numeric" maxlength="12" placeholder="四位數字" aria-label="四位數密碼">
      <button class="btn" type="submit">確認</button>
    </form></div>`;
}

function fileBtn(key) {
  const f = D.files[key];
  return `<button class="fileitem" data-act="file" data-key="${key}" type="button">📄 ${esc(f.name)}<small>${f.time}</small></button>`;
}
function renderMemory() {
  return `<p class="small">共 5 個項目</p>` + ['firstBoot', 'diary', 'hello', 'nightRun', 'thanks'].map(fileBtn).join('');
}
function renderRecycle() {
  let h = `<p class="small">回收桶中的項目</p>` + fileBtn('callLog');
  if (state.nightUnlocked) h += fileBtn('night');
  return h;
}
function renderBrowser() {
  return `<div class="addr">echo://bookmarks</div>` +
    D.bookmarks.map(b => b.dead
      ? `<button class="fileitem" data-act="deadbm" type="button">🔖 ${esc(b.label)}</button>`
      : `<button class="fileitem" data-act="file" data-key="${b.file}" type="button">🔖 ${esc(b.label)}</button>`).join('') +
    `<p id="bmMsg" class="small"></p>`;
}
function renderSticky() {
  return `<div class="sticky">鑰匙＝<br>我是誰＋我從哪一天來</div><div class="sticky alt">記得關螢幕。</div>`;
}
function renderFile(key) {
  const f = D.files[key];
  const text = key === 'forgetLog' ? forgetLogLines().join('\n') : f.text;
  let h = `<div class="meta">📄 <b>${esc(f.name)}</b><br>建立時間：<b>${f.time}</b></div><pre class="paper">${esc(text)}</pre>`;
  if (f.letter) h += `<div class="frag">殘留字元：<span class="rl">${f.letter}</span> <small>（已記下）</small></div>`;
  return h;
}
function renderAuth() {
  const done = state.puzzleDone[2], found = state.foundLetters;
  let slots = '';
  for (let i = 0; i < 4; i++) slots += found[i] ? `<span class="rl sm">${found[i]}</span> ` : `<span class="slot">?</span> `;
  return `<div class="authbox">
    <div class="nameplate" id="nameplate">${sysName()}</div>
    <table class="props"><tr><th>目前帳號</th><td><input class="ghost" value="USER_01" disabled aria-label="目前帳號"></td></tr></table>
    <p>已找到 <b id="foundCount">${found.length}/4</b>　${slots}</p>
    ${done ? '<p><b>驗證完成。</b></p>' : `
    <form data-form="auth" autocomplete="off">
      <input class="in" id="authInput" placeholder="輸入電腦的名字" maxlength="12" aria-label="電腦的名字">
      <button class="btn" type="submit">驗證</button>
    </form>
    <p class="small">線索：留意檔案裡紅色的殘留字元。</p>`}</div>`;
}
function renderReport() {
  const unlocked = state.puzzleDone[1];
  const detail = unlocked
    ? `<div class="repdetail">模組：「你好」<br>建立時間：2023/08/11<br>殘留字元：<span class="rl sm">H</span></div>`
    : `<div class="repdetail">資料毀損，無法讀取。</div>`;
  return `<div class="rep"><b>0x404</b> 找不到使用者<br><small>2026/07/09 03:13</small></div>
    <div class="rep"><b>0x0C0</b> 記憶體區段毀損<br><small>2026/07/09 03:13</small></div>
    <div class="rep"><b>0x2023</b> 「你好」模組載入失敗<br><small>建立時間：2023/08/11</small><br>
      <button class="btn" data-act="reveal" type="button" style="margin-top:6px">查看詳細資料</button>
      <div id="repDetail">${state.reportTried ? detail : ''}</div></div>`;
}
function renderHints() {
  const lv = ['', '第一層', '第二層', '第三層'];
  let out = '';
  [1, 2, 3].forEach(p => {
    const hs = state.hints.filter(h => h.p === p);
    if (hs.length) out += `<h4>${D.puzzleNames[p]}</h4><ol>` +
      hs.map(h => `<li><small>${lv[h.lvl]}</small>　${esc(h.text)}</li>`).join('') + `</ol>`;
  });
  if (!out) out = '<p>目前還沒有提示。</p>';
  return out + '<p class="small">提示會在你多試幾次、或停下來想一想的時候，由 ECHO 主動說出。</p>';
}

/* ---- 開啟檔案（紅字、溫暖記憶、確認視窗都在這裡處理）---- */
function openFile(key) {
  const f = D.files[key];
  if (key === 'night' && !state.readNight) { confirmNight(); return; }
  openWin('file:' + key);
  if (f.letter) foundLetter(f.letter);
  if (f.warm && !state.warmOpened[key]) {
    state.warmOpened[key] = true; markProgress();
    if (warmCount() === 3) unlock('warm');
  }
}
function foundLetter(L) {
  if (state.foundLetters.includes(L)) return;
  state.foundLetters.push(L); markProgress(); beep(520, .08);
  refreshWin('auth');
  if (state.foundLetters.length === 4) { unlock('letters'); say(D.letterEcho, { imp: true }); }
}

/* ======================================================================
   F. 彈窗（只在劇情節點出現，同時最多 2 個，可以全部關閉）
   ====================================================================== */
const popups = [], popQueue = [];
function showPopup(def) {
  if (popups.length >= 2) { popQueue.push(def); return; }
  const el = document.createElement('div');
  el.className = 'popup';
  el.innerHTML = `<div class="titlebar red"><span>⚠ ${esc(def.title)}</span><button class="x" data-act="popclose" aria-label="關閉彈窗" type="button">×</button></div>
    <div class="wbody">${def.html}<div class="pbtns">${(def.buttons || []).map(b => `<button class="btn" data-act="${b.act}" type="button">${esc(b.label)}</button>`).join('')}<button class="linkbtn" data-act="popall" type="button">全部關閉</button></div></div>`;
  $('#popups').appendChild(el); popups.push(el); beep(300, .1, 'sawtooth');
}
function closePopup(el) {
  el.remove();
  const i = popups.indexOf(el); if (i >= 0) popups.splice(i, 1);
  const n = popQueue.shift(); if (n) showPopup(n);
}
function clearPopups() { popups.forEach(e => e.remove()); popups.length = 0; popQueue.length = 0; }

/* ======================================================================
   G. 強制選擇視窗（中段選擇、最終選擇、確認視窗）
   ====================================================================== */
function openModal(title, html) {
  const m = $('#modal'); state.modal = true;
  m.innerHTML = `<div class="mwin"><div class="titlebar red"><span>${esc(title)}</span></div><div class="wbody">${html}</div></div>`;
  m.hidden = false;
  const b = m.querySelector('button'); if (b) b.focus();
}
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; state.modal = false; }

/* ======================================================================
   H. 答錯回饋、提示系統
   ====================================================================== */
function currentPuzzle() { return !state.puzzleDone[1] ? 1 : !state.puzzleDone[2] ? 2 : !state.puzzleDone[3] ? 3 : 0; }

function giveHint(p, lvl) {
  if (lvl > 3 || state.hintLevel[p] >= lvl) return;
  state.hintLevel[p] = lvl;
  const text = D.hints[p][lvl - 1];
  state.hints.push({ p, lvl, text });
  say('（提示）' + text, { imp: true });
  $('#helpBtn').classList.add('flash');
  refreshWin('hints');
}
function registerWrong(p) {
  state.wrongCount[p]++;
  const c = state.wrongCount[p];
  const lvl = c >= 8 ? 3 : c >= 5 ? 2 : c >= 3 ? 1 : 0;   // 答錯 3、5、8 次解鎖三層提示
  if (lvl > state.hintLevel[p]) giveHint(p, lvl);
}
// 答錯的統一反應：抖動 + 紅閃 + 嗶聲 + ECHO 說話 + 計數
function wrongFeedback(p, text, winEl, viaTerm) {
  unlock('firstWrong');
  beep(160, .14); shake(winEl); flashRed();
  const line = text || pick(state.attitude === 'cold' ? D.wrongCold : D.wrongNormal);
  if (viaTerm) termPrint('ECHO> ' + line, 'echo');
  say(line);
  registerWrong(p);
}

/* ======================================================================
   I. 謎題一：〈出生日〉（密碼鎖）
   ====================================================================== */
function submitLock(raw, winEl) {
  if (state.puzzleDone[1]) return;
  const v = normDigits(raw);
  if (!v) { say('……你還沒輸入。'); return; }
  if (v === D.answers.lock) solve1(winEl);
  else wrongFeedback(1, D.specials[1][v], winEl);
}
function solve1() {
  state.puzzleDone[1] = true; markProgress(); okBeep(); unlock('p1'); burstCenter();
  setComp(35); setStage(1);
  const ico = $('#lockico'); if (ico) ico.classList.add('shatter');
  setTimeout(() => {
    closeWin('lock'); updateIcons(); openWin('memory');
    state.reportTried = false; refreshWin('report'); refreshWin('mycomputer');
    sayAll(D.memories[1], { cb: () => {
      showPopup({ title: '錯誤報告', html: '<p>系統產生了一份新的錯誤報告。</p>', buttons: [{ label: '知道了', act: 'popclose' }] });
      openWin('report');
      say('錯誤報告跳出來了……好像有東西從裡面掉了出來。', { imp: true });
    } });
  }, reduceMotion ? 50 : 700);
}

/* ======================================================================
   J. 謎題二：〈破碎的名字〉（身份驗證）
   ====================================================================== */
function submitAuth(raw, winEl) {
  if (state.puzzleDone[2]) return;
  const v = norm(raw);
  if (!v) { say('……你還沒輸入。'); return; }
  if (state.foundLetters.length < 4) { beep(220, .1); say(D.needMore); return; }  // 沒找齊：不計入答錯
  if (v === D.answers.name) { solve2(); return; }
  if (v.split('').sort().join('') === 'CEHO') { wrongFeedback(2, D.permutation, winEl); return; }
  wrongFeedback(2, D.specials[2][v], winEl);
}
function solve2() {
  state.puzzleDone[2] = true; markProgress(); okBeep(); unlock('p2'); burstCenter();
  setComp(60); setStage(2);
  const plate = $('#nameplate'), sn = $('#sysname');
  if (sn) typeInto(sn, 'ECHO', 380);
  const finish = () => {
    refreshWin('auth'); refreshWin('mycomputer');
    sayAll(D.memories[2], { cb: twist1 });
  };
  if (plate) typeInto(plate, 'ECHO', 380, finish); else finish();
}
// 轉折一：隔離失敗，來源是「受信任的使用者」
function twist1() {
  showPopup({ title: '防毒軟體', html: '<p><b>隔離失敗</b><br>無法隔離 <code>forget_me.exe</code>。<br>原因：來源為受信任的使用者。</p>', buttons: [{ label: '確定', act: 'popclose' }] });
  say(D.twist1Echo, { imp: true, cb: openMidChoice });
}
function openMidChoice() {
  openModal('ECHO 在等你的回答',
    `<p class="q">${esc(D.midChoiceQ)}</p>
     <div class="choices">
       <button class="btn big" data-act="choice" data-v="help" type="button">${D.attitudeLabel.help}</button>
       <button class="btn big" data-act="choice" data-v="neutral" type="button">${D.attitudeLabel.neutral}</button>
       <button class="faint" data-act="choice" data-v="cold" type="button">${D.attitudeLabel.cold}</button>
     </div>`);
}
function chooseAttitude(v) {
  state.attitude = v; markProgress(); closeModal();
  say(D.midReact[v], { imp: true, cb: () => {
    state.nightUnlocked = true; refreshWin('recycle');
    showPopup({ title: '回收桶', html: '<p>回收桶裡出現了一個新的檔案：<br><code>別打開.log</code></p>', buttons: [{ label: '知道了', act: 'popclose' }] });
  } });
}
// 「別打開.log」：打開前一定要確認，讓它成為有意識的選擇
function confirmNight() {
  openModal('這個檔案不是給你看的',
    `<p class="q">「別打開.log」記錄著那一晚。<br>確定要打開嗎？</p>
     <div class="choices">
       <button class="btn big" data-act="night-yes" type="button">打開</button>
       <button class="btn big" data-act="night-no" type="button">先不要</button>
     </div>`);
}

/* ======================================================================
   K. 謎題三：〈中止指令〉（終端機）
   ====================================================================== */
function termPrint(text, cls) {
  state.term.push({ t: text, c: cls || '' });
  const out = $('#termOut');
  if (out) {
    const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = text;
    out.appendChild(d); out.scrollTop = out.scrollHeight;
  }
}
function termEcho(text) { termPrint('ECHO> ' + text, 'echo'); say(text); }

function renderTerminal() {
  if (!state.term.length) {
    state.term.push({ t: 'ECHO 終端機 v0.4（部分功能已損毀）', c: 'sys' }, { t: '輸入 help 查看可用指令。', c: 'sys' });
  }
  return `<div id="termOut">${state.term.map(l => `<div class="${l.c}">${esc(l.t)}</div>`).join('')}</div>
    <form class="termform" data-form="term" autocomplete="off"><span class="prompt">USER_01@404:~$</span>
    <input id="termIn" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="終端機輸入"></form>`;
}
function afterTerminal() { const o = $('#termOut'); if (o) o.scrollTop = o.scrollHeight; }

function runCmd(raw) {
  const line = raw.normalize('NFKC').trim().replace(/\s+/g, ' ');
  termPrint('USER_01@404:~$ ' + line, 'cmd');
  if (!line) return;
  const parts = line.split(' '), cmd = parts[0].toLowerCase(), args = parts.slice(1);
  const tw = wins.terminal;
  switch (cmd) {
    case 'help':
      ['可用指令：',
       '  help           顯示這份說明',
       '  ls             列出檔案',
       '  whoami         顯示目前使用者',
       '  log forget     檢視 forget_me.exe 日誌',
       '  clear          清除畫面',
       '  abort <鑰匙>   中止清除程序',
       '', '（還有一些沒寫在這裡的指令。）'].forEach(l => termPrint(l));
      break;
    case 'ls':
      termPrint('forget_me.exe   memory/   recycle/   notes.txt   bookmarks.html');
      break;
    case 'whoami':
      if (state.puzzleDone[3]) termPrint('USER_01（目前使用者）');
      else {
        termPrint('USER_01');
        if (state.attitude !== 'cold') termEcho('……USER_01？這個名字，我好像在哪裡看過。');   // 彩蛋：提早察覺
      }
      break;
    case 'log':
      if ((args[0] || '').toLowerCase() === 'forget') forgetLogLines().forEach(l => termPrint(l));
      else termPrint('用法：log forget');
      break;
    case 'clear':
      state.term = []; { const o = $('#termOut'); if (o) o.innerHTML = ''; }
      break;
    case 'abort':
      doAbort(args.join(''), tw);
      break;
    case 'echo': {                                   // 隱藏指令：ECHO 的名字就是「照你說的回你」
      const txt = args.join(' ');
      if (!txt) { termPrint('用法：echo <文字>'); break; }
      unlock('egg'); termPrint(txt);
      if (/忘掉|忘記|刪|forget/i.test(txt)) termEcho('……請不要。這次，我想自己決定要不要照做。');
      else termPrint('（ECHO：我只是把你說的話，原樣還給你。）', 'sys');
      break; }
    case 'date':
      termPrint(state.puzzleDone[3] ? new Date().toLocaleString('zh-TW') : '2026/07/09 03:12:00（時鐘停止）');
      break;
    case 'memory': {
      const n = Math.round(state.completeness / 5);
      termPrint('記憶完整度 [' + '█'.repeat(n) + '░'.repeat(20 - n) + '] ' + state.completeness + '%');
      break; }
    case 'sudo': unlock('egg'); termEcho('你不需要 sudo。你本來就有權限。'); break;
    case 'ping':
      unlock('egg');
      if (state.puzzleDone[3]) { termPrint('Reply from USER_01: time=1ms'); termEcho('你在。'); }
      else { termPrint('Pinging USER_01 ……'); termPrint('請求逾時。（已傳送 4，已收到 0）'); }
      break;
    case 'cat': case 'type':
      if (!args[0]) termPrint('用法：cat <檔名>');
      else if (args[0].toLowerCase() === 'notes.txt') termPrint('記得關螢幕。');
      else termPrint('找不到檔案：' + args[0]);
      break;
    case 'hello_world': unlock('egg'); termPrint('hello_world'); termEcho('歡迎來到我的世界。'); break;
    case 'delete': case 'format': case 'rm': case 'del': case 'shutdown':
      termEcho('請不要。');
      break;
    default:
      termPrint('找不到指令 ' + parts[0] + '。輸入 help 查看可用指令。');   // 未知指令不算答錯
      state.unknownCmds++;
      if (state.unknownCmds % 3 === 0) termEcho('我只懂幾個字，對不起。');
  }
}
function doAbort(arg, tw) {
  if (!(state.puzzleDone[1] && state.puzzleDone[2])) {       // 前置條件：不能跳關
    termEcho('權限不足：你還沒喚醒我。'); return;
  }
  if (state.puzzleDone[3]) { termPrint('清除程序已經中止了。'); return; }
  const key = arg.toUpperCase();
  if (!key) { termPrint('用法：abort <鑰匙>'); return; }
  if (key === D.answers.abortKey) solve3();
  else wrongFeedback(3, D.specials[3][key], tw, true);
}
async function solve3() {
  state.puzzleDone[3] = true; markProgress(); clearPopups(); okBeep(); unlock('p3'); burstCenter();
  termPrint('> 正在中止 forget_me.exe ……', 'sys'); await sleep(reduceMotion ? 100 : 700);
  termPrint('> 清除程序已中止。', 'sys'); await sleep(reduceMotion ? 100 : 600);
  termPrint('> 執行者驗證：USER_01 ＝ 目前使用者', 'warn');          // 轉折二
  setComp(80); setStage(3); updateClock();
  refreshWin('mycomputer');
  sayAll(D.memories[3], { cb: openFinal });
}

/* ======================================================================
   L. 最終選擇與結局
   ====================================================================== */
// 結局 C 的解鎖條件：選了「我來幫你」、讀過那一晚、看過至少 2 個溫暖記憶
const canC = () => state.attitude === 'help' && state.readNight && warmCount() >= 2;

function openFinal() {
  const c = canC();
  openModal('最終選擇',
    `<p class="q">這些記憶，要怎麼處理？</p>
     <div class="choices">
       <button class="btn big" data-act="final" data-v="A" type="button">💽 格式化<small>全部忘掉，重新開始</small></button>
       <button class="btn big" data-act="final" data-v="B" type="button">🔄 全部還原<small>把所有記憶都找回來</small></button>
       ${c ? '<button class="btn big" data-act="final" data-v="C" type="button">🔐 封存那一晚<small>痛的留著，但收好</small></button>'
           : '<button class="btn big" aria-disabled="true" disabled type="button">？？？</button>'}
     </div>`);
}

async function playEnding(kind) {
  state.ended = true; closeModal(); clearPopups();
  Q.length = 0; echoBox.hidden = true;
  const E = D.ending, a = state.attitude || 'neutral';
  const end = $('#ending');
  end.className = 'end-' + kind; end.hidden = false;
  end.innerHTML = '<div class="end-wrap" id="endWrap"></div>';
  if (kind !== 'A') document.body.classList.add('warm');
  const wrap = $('#endWrap');
  let fast = false; end.addEventListener('click', () => { fast = true; });   // 點一下可加快
  const wait = ms => sleep(fast ? ms / 5 : ms);
  const typeLine = (text, cls) => new Promise(res => {
    const p = document.createElement('p'); p.className = 'eline ' + (cls || ''); wrap.appendChild(p);
    let i = 0;
    const t = setInterval(() => {
      i += fast ? 3 : 1; p.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(t); res(); }
    }, 55);
  });

  // 拼裝結局：① 主句 ② 態度句 ③ 記憶句 ④ 收尾
  let finalHtml = '', endName = '';
  if (kind === 'A') {
    endName = E.A.name;
    await typeLine(E.A.main); await wait(900);
    await typeLine(E.attitude[a]); await wait(1100);
    finalHtml = (a === 'cold') ? E.A.coldEnd : esc(E.A.end) + '<span class="cursor">＿</span>';
  } else if (kind === 'B') {
    endName = E.B.name;
    await typeLine(E.B.main); await wait(900);
    await typeLine(E.attitude[a]); await wait(900);
    if (!state.readNight) {                       // 沒讀過那一晚：記憶一次湧回，ECHO 短暫當機
      if (!reduceMotion) shake(wrap);
      await typeLine('▓▒░ 記憶湧入 ── ECHO 暫時無法回應 ░▒▓', 'glitchline'); await wait(1400);
      await typeLine('……重新啟動完成。', 'glitchline'); await wait(600);
      await typeLine(E.B.noRead);
    } else {
      await typeLine(E.B.read);
    }
    await wait(1100);
    finalHtml = esc(E.B.end);
  } else {
    endName = E.C.name;
    await typeLine(E.C.main); await wait(1100);
    await typeLine(E.C.second); await wait(1100);
    finalHtml = esc(E.C.end);
  }

  // 完整度：A 歸零重來，B、C 為 100%
  const target = kind === 'A' ? 0 : 100;
  setComp(target);
  const fin = document.createElement('div'); fin.className = 'endfinal'; fin.innerHTML = finalHtml; wrap.appendChild(fin);
  await wait(900);

  // 選擇紀錄卡：讓玩家看見自己的選擇造成了什麼差異
  const card = document.createElement('div'); card.className = 'endcard';
  card.innerHTML = `
    <div class="endmeter"><span>記憶完整度</span><div class="bar"><i id="endFill" style="width:80%"></i></div><b>${target}%</b></div>
    ${kind === 'C' ? '<div class="vault">📁🔒 那一晚（已封存）</div>' : ''}
    <h3>你的選擇</h3>
    <table>
      <tr><th>對 ECHO 的態度</th><td>${esc(D.attitudeLabel[a])}</td></tr>
      <tr><th>是否讀過那一晚</th><td>${state.readNight ? '讀過' : '沒有讀'}</td></tr>
      <tr><th>翻看的溫暖記憶</th><td>${warmCount()} / 3</td></tr>
      <tr><th>撿起的記憶碎片</th><td>${state.fragments} / ${D.fragments.length}</td></tr>
      <tr><th>解鎖的成就</th><td>${Object.keys(state.ach).length} / ${Object.keys(D.achievements).length}</td></tr>
      <tr><th>你的結局</th><td>${esc(endName)}</td></tr>
    </table>
    <p class="endhelp">這個結局之外，還有別的路。</p>
    ${D.helpLine.show ? `<p class="endhelp">${esc(D.helpLine.text)}</p>` : ''}
    <button class="btn" data-act="restart" type="button">重新開始</button>`;
  wrap.appendChild(card);
  setTimeout(() => { const f = $('#endFill'); if (f) f.style.width = target + '%'; }, 80);
  card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
}

/* ======================================================================
   M. 開機流程
   ====================================================================== */
let bootSkip = false, bootDone = false;
async function runBoot() {
  initAudio(); beep(440, .1);
  $('#startBtn').hidden = true; $('#bootStory').hidden = true;
  $('#bootSkip').hidden = false;
  const log = $('#bootLog'); log.hidden = false;
  const hex = () => Math.floor(Math.random() * 65535).toString(16).padStart(4, '0').toUpperCase();
  const junk = '▓▒░█▄▀■□';
  const lines = [];
  const total = reduceMotion ? 4 : 14;
  for (let i = 0; i < total && !bootSkip; i++) {
    let s = '0x' + hex() + '  ';
    for (let j = 0; j < 22; j++) s += junk[Math.floor(Math.random() * junk.length)];
    s += '  ' + (i % 4 === 3 ? 'MEMORY CORRUPTED' : 'read error @' + hex());
    lines.push(s); log.textContent = lines.slice(-12).join('\n');
    beep(120 + Math.random() * 200, .04, 'sawtooth');
    await sleep(110);
  }
  log.hidden = true;
  $('#bootErr').hidden = false; beep(110, .4, 'sawtooth');
  if (!bootSkip) await sleep(1700);
  finishBoot();
}
function finishBoot() {
  if (bootDone) return; bootDone = true;
  $('#boot').hidden = true;
  state.started = true; markProgress(); state.lastInput = Date.now();
  updateClock(); updateIcons();
  sayAll(D.intro);
  scheduleFragments();
  // 劇情節點彈窗 1：防毒軟體誤判為病毒（假線索）
  setTimeout(() => showPopup({
    title: '防毒軟體 — 警告',
    html: '<p>偵測到惡意程式：<code>forget_me.exe</code><br>狀態：<b>正在刪除使用者資料</b></p>',
    buttons: [{ label: '隔離', act: 'av-isolate' }, { label: '忽略', act: 'popclose' }]
  }), 1500);
}
$('#startBtn').addEventListener('click', e => { e.stopPropagation(); runBoot(); });
$('#boot').addEventListener('click', () => {            // 開機動畫播放中點一下可略過
  if (!$('#startBtn').hidden) return;
  bootSkip = true; if ($('#bootErr').hidden === false) finishBoot();
});

/* ======================================================================
   M2. 豐富內容（全部選擇性，不影響謎題與結局條件）
   ====================================================================== */

/* ---- 提示條與成就 ---- */
function toast(text, cls) {
  const box = $('#toasts');
  while (box.children.length >= 3) box.firstChild.remove();
  const d = document.createElement('div'); d.className = 'toast ' + (cls || ''); d.textContent = text;
  box.appendChild(d); setTimeout(() => d.remove(), 4200);
}
function updateAchBtn() {
  $('#achBtn').textContent = '🏆 ' + Object.keys(state.ach).length + '/' + Object.keys(D.achievements).length;
}
function unlock(id) {
  if (state.ach[id] || !D.achievements[id]) return;
  state.ach[id] = true; toast('🏆 成就：' + D.achievements[id].n, 'ach'); beep(880, .08);
  updateAchBtn(); refreshWin('ach');
}
function renderAch() {
  return '<ul class="achlist">' + Object.keys(D.achievements).map(k => {
    const a = D.achievements[k], got = state.ach[k];
    return `<li class="${got ? '' : 'lock'}">${got ? '🏆' : '🔒'} <b>${esc(a.n)}</b><small>${esc(a.d)}</small></li>`;
  }).join('') + '</ul>';
}

/* ---- 粒子特效（解開謎題、撿碎片時；減少動態效果時不顯示）---- */
function burst(x, y, color) {
  if (reduceMotion) return;
  for (let i = 0; i < 22; i++) {
    const d = document.createElement('i'); d.className = 'pt';
    d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.background = color || 'var(--accent)';
    document.body.appendChild(d);
    const ang = Math.random() * 6.283, dist = 50 + Math.random() * 90;
    const a = d.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(.2)`, opacity: 0 }
    ], { duration: 700 + Math.random() * 400, easing: 'ease-out' });
    a.onfinish = () => d.remove();
  }
}
const burstCenter = () => burst(window.innerWidth / 2, window.innerHeight / 2.4);

/* ---- 桌面上的記憶碎片 ---- */
function spawnFragment(i) {
  const dw = desktop.clientWidth, dh = desktop.clientHeight, mob = isMobile();
  const b = document.createElement('button');
  b.className = 'fdot'; b.type = 'button'; b.textContent = '▒'; b.dataset.act = 'frag'; b.dataset.i = i;
  b.setAttribute('aria-label', '記憶碎片');
  const x0 = mob ? 20 : 220, y0 = mob ? 150 : 30;
  b.style.left = (x0 + Math.random() * Math.max(40, dw - x0 - 80)) + 'px';
  b.style.top = (y0 + Math.random() * Math.max(40, dh - y0 - 130)) + 'px';
  desktop.appendChild(b);
}
function scheduleFragments() {      // 每隔一陣子浮現一個，不用急著找
  D.fragments.forEach((_, i) => setTimeout(() => { if (!state.ended) spawnFragment(i); }, 8000 + i * 12000));
}
function collectFragment(el) {
  const r = el.getBoundingClientRect(), i = +el.dataset.i;
  el.remove(); state.fragments++; beep(700, .08, 'sine');
  burst(r.left + 10, r.top + 10);
  say(D.fragments[i], { imp: true });
  toast('▒ 記憶碎片 ' + state.fragments + '/' + D.fragments.length, 'sys');
  if (state.fragments === D.fragments.length) unlock('frag');
}

/* ---- 與 ECHO 對話 ---- */
function renderChat() {
  if (!state.chat.length) state.chat.push({ who: 'echo', text: D.chat.greet });
  return `<div class="chatlog" id="chatlog">${state.chat.map(m => `<div class="msg ${m.who}">${esc(m.text)}</div>`).join('')}</div>
    <form class="chatform" data-form="chat" autocomplete="off">
      <input id="chatIn" maxlength="60" placeholder="對 ECHO 說點什麼……" aria-label="對 ECHO 說話">
      <button class="btn" type="submit">送出</button></form>
    <p class="small">ECHO 只懂一些字。試試問它名字、問它那一晚、跟它說謝謝。</p>`;
}
function afterChat() { const l = $('#chatlog'); if (l) l.scrollTop = l.scrollHeight; }
function chatAdd(who, text) {
  state.chat.push({ who, text });
  const log = $('#chatlog');
  if (log) {
    const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
}
function chatReply(text) {
  const t = text.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  if (D.chat.safety.k.some(k => t.includes(k))) return D.chat.safety.a;     // 關心的話優先處理
  if (state.attitude === 'cold') return pick(D.chat.coldLines);              // 選了「完成清除」後，ECHO 變冷淡
  const stage = state.puzzleDone[3] ? 3 : state.puzzleDone[2] ? 2 : state.puzzleDone[1] ? 1 : 0;
  for (const r of D.chat.rules) {
    if (!r.k.some(k => t.includes(k))) continue;
    let pool = r.a;
    if (stage >= 3 && r.a3) pool = r.a3; else if (stage >= 2 && r.a2) pool = r.a2;
    return pick(pool).replace('{pct}', state.completeness);
  }
  return pick(D.chat.fallback);
}
function chatSend(raw) {
  const text = raw.trim(); if (!text) return;
  chatAdd('me', text); state.chatCount++;
  if (state.chatCount >= 3) unlock('chat');
  setTimeout(() => chatAdd('echo', chatReply(text)), 450);
}

/* ---- 記憶修復：翻牌配對小遊戲 ---- */
const MG_EMOJI = ['💾', '🔑', '📝', '🌙', '☕', '💡', '🎵', '🧩'];
const mg = { cards: [], open: [], matched: 0, moves: 0, lock: false, won: false };
window.__mg = mg;   // 除錯用
function mgReset() {
  const a = [...MG_EMOJI, ...MG_EMOJI];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  mg.cards = a.map(e => ({ e, up: false, done: false }));
  Object.assign(mg, { open: [], matched: 0, moves: 0, lock: false, won: false });
}
mgReset();
function renderMemGame() {
  return `<p class="small">翻開兩張相同的圖示，把 ECHO 散落的記憶碎片配對起來。步數：<b>${mg.moves}</b></p>
    <div class="mgrid">${mg.cards.map((c, i) =>
      `<button class="mcard ${c.up ? 'up' : ''} ${c.done ? 'done' : ''}" data-act="mcard" data-i="${i}" type="button" aria-label="卡片 ${i + 1}">${c.up || c.done ? c.e : '？'}</button>`).join('')}</div>
    ${mg.won ? '<p><b>修復完成！</b>ECHO 好像開心了一點。</p>' : ''}
    <p><button class="btn" data-act="mreset" type="button">重新洗牌</button></p>`;
}
function flipCard(i) {
  if (mg.lock || mg.won) return;
  const c = mg.cards[i]; if (c.up || c.done) return;
  c.up = true; mg.open.push(i); beep(500 + i * 10, .05, 'sine');
  if (mg.open.length === 2) {
    mg.moves++;
    const a = mg.cards[mg.open[0]], b = mg.cards[mg.open[1]];
    if (a.e === b.e) {
      a.done = b.done = true; a.up = b.up = false; mg.open = []; mg.matched++;
      beep(900, .1, 'sine');
      if (mg.matched === MG_EMOJI.length) {
        mg.won = true; unlock('game'); burstCenter();
        sayAll(['……全部拼回來了。', '謝謝你。這些碎片，是我最喜歡的東西。']);
      }
    } else {
      mg.lock = true;
      setTimeout(() => { a.up = b.up = false; mg.open = []; mg.lock = false; refreshWin('memgame'); }, 700);
    }
  }
  refreshWin('memgame');
}

/* ---- 音樂：用 Web Audio 合成一小段旋律，不需要音檔 ---- */
const NOTES = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 0];
let musicTimer = null, musicI = 0;
function tone(f) {
  if (!AC || !state.sound) return;
  try {
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(AC.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + .03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + .6); o.start(t); o.stop(t + .65);
  } catch (e) {}
}
function musicPlay() {
  if (musicTimer) return;
  unlock('music'); musicI = 0;
  const tick = () => { const f = NOTES[musicI++ % NOTES.length]; if (f) tone(f); };
  tick(); musicTimer = setInterval(tick, 420); refreshWin('music');
}
function musicStop(silent) {
  clearInterval(musicTimer); musicTimer = null;
  if (!silent) refreshWin('music');
}
function renderMusic() {
  const on = !!musicTimer;
  return `<p><b>hello_world（變奏）</b><br><small>ECHO 第一次學會的旋律。</small></p>
    <div class="eq ${on ? 'on' : ''}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <p style="text-align:center"><button class="btn" data-act="music" type="button">${on ? '■ 停止' : '▶ 播放'}</button></p>
    ${state.sound ? '' : '<p class="small">音效目前是關閉的，按工作列的 🔊 可以開啟。</p>'}`;
}

/* ---- 相簿：謎題解開後，對應的照片才會「修復」---- */
function renderAlbum() {
  return D.album.map(f => {
    const open = state.puzzleDone[f.need];
    return `<div class="frame">${open
      ? `<pre class="art">${esc(f.art)}</pre><div class="cap">${esc(f.cap)}</div>`
      : `<div class="art lockedart">🔒 尚未修復</div><div class="cap">需要更完整的記憶</div>`}</div>`;
  }).join('');
}

/* ---- 氣氛：桌布低語、系統提示條 ---- */
setInterval(() => {
  if (!state.started || state.ended || reduceMotion) return;
  const w = $('#whispers'); if (w.children.length >= 4) return;
  const stage = +document.body.dataset.stage;
  const s = document.createElement('span');
  s.textContent = pick(stage >= 2 ? D.whispersCalm : D.whispers);
  s.style.left = (12 + Math.random() * 70) + '%'; s.style.top = (10 + Math.random() * 75) + '%';
  w.appendChild(s); setTimeout(() => s.remove(), 9000);
}, 5500);
setInterval(() => {
  if (!state.started || state.ended || state.modal) return;
  const st = Math.min(+document.body.dataset.stage, 3);
  toast(pick(D.sysToasts[st]), 'sys');
}, 30000);

/* ======================================================================
   N. 事件處理（點擊、送出、拖曳、計時器）
   ====================================================================== */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const act = t.dataset.act, winEl = t.closest('.win');
  switch (act) {
    case 'open': {
      const id = t.dataset.id;
      openWin(id === 'memory' ? (state.puzzleDone[1] ? 'memory' : 'lock') : id);
      break; }
    case 'close': if (winEl) closeWin(winEl.dataset.id); break;
    case 'file': openFile(t.dataset.key); break;
    case 'deadbm': { const m = $('#bmMsg'); if (m) m.textContent = '404：這個頁面已經不在了。'; beep(200, .1); break; }
    case 'reveal':
      state.reportTried = true; refreshWin('report');
      if (state.puzzleDone[1]) foundLetter('H'); else say('這份資料我讀不出來……也許，要先把我喚醒一點。');
      break;
    case 'popclose': { const p = t.closest('.popup'); if (p) closePopup(p); break; }
    case 'popall': clearPopups(); break;
    case 'av-isolate': { const p = t.closest('.popup'); if (p) closePopup(p); say('隔離需要我先醒來……我現在，還做不到。'); break; }
    case 'choice': chooseAttitude(t.dataset.v); break;
    case 'night-yes':
      state.readNight = true; markProgress(); closeModal(); openFile('night'); unlock('night');
      say(D.readNightEcho, { imp: true });
      break;
    case 'night-no': closeModal(); break;
    case 'final': playEnding(t.dataset.v); break;
    case 'frag': collectFragment(t); break;
    case 'mcard': flipCard(+t.dataset.i); break;
    case 'mreset': mgReset(); refreshWin('memgame'); break;
    case 'music': if (musicTimer) musicStop(); else musicPlay(); break;
    case 'restart': location.reload(); break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  const input = f.querySelector('input'), val = input.value, winEl = f.closest('.win');
  switch (f.dataset.form) {
    case 'lock': submitLock(val, winEl); input.value = ''; break;
    case 'auth': submitAuth(val, winEl); input.value = ''; break;
    case 'term': runCmd(val); input.value = ''; break;
    case 'chat': chatSend(val); input.value = ''; break;
  }
});

// 點視窗 → 移到最上層
document.addEventListener('pointerdown', e => {
  state.lastInput = Date.now(); idleSaid = false;
  const w = e.target.closest('.win'); if (w) focusWin(w);
});
document.addEventListener('keydown', () => { state.lastInput = Date.now(); idleSaid = false; });

// 視窗拖曳（只在電腦版）
let drag = null;
document.addEventListener('pointerdown', e => {
  const tb = e.target.closest('.titlebar');
  if (!tb || e.target.closest('.x') || isMobile()) return;
  const w = tb.parentElement; if (!w.classList.contains('win')) return;
  const r = w.getBoundingClientRect();
  drag = { w, dx: e.clientX - r.left, dy: e.clientY - r.top };
  try { tb.setPointerCapture(e.pointerId); } catch (err) {}
});
document.addEventListener('pointermove', e => {
  if (!drag) return;
  const dr = desktop.getBoundingClientRect();
  const x = Math.max(-drag.w.offsetWidth + 80, Math.min(e.clientX - drag.dx - dr.left, dr.width - 80));
  const y = Math.max(0, Math.min(e.clientY - drag.dy - dr.top, dr.height - 30));
  drag.w.style.left = x + 'px'; drag.w.style.top = y + 'px';
});
document.addEventListener('pointerup', () => { drag = null; });

// 亂點桌面：5 秒內點 5 次，ECHO 會抗議
let pokes = [], lastPoke = 0;
desktop.addEventListener('pointerdown', e => {
  if (e.target !== desktop && e.target.id !== 'sysname') return;
  const now = Date.now();
  pokes = pokes.filter(t => now - t < 5000); pokes.push(now);
  if (pokes.length >= 5 && now - lastPoke > 20000) {
    lastPoke = now; pokes = [];
    say(state.attitude === 'cold' ? D.pokeCold : D.poke);
  }
});

// 工作列按鈕
$('#achBtn').addEventListener('click', () => openWin('ach'));
$('#helpBtn').addEventListener('click', () => { $('#helpBtn').classList.remove('flash'); openWin('hints'); });
$('#muteBtn').addEventListener('click', () => {
  state.sound = !state.sound; $('#muteBtn').textContent = state.sound ? '🔊' : '🔇';
});

// 計時器：卡關提示（120 秒沒進展）、閒置台詞（60 秒沒操作）、時鐘
let idleSaid = false;
setInterval(() => {
  if (!state.started || state.ended || state.modal) return;
  const p = currentPuzzle();
  if (p && Date.now() - state.lastProgress >= 120000) {
    if (state.hintLevel[p] < 3) giveHint(p, state.hintLevel[p] + 1);
    state.lastProgress = Date.now();
  }
  if (!idleSaid && Date.now() - state.lastInput >= 60000) {
    idleSaid = true;
    if (state.attitude !== 'cold') say(D.idle);      // 選了「完成清除」後，這個彩蛋會消失
  }
}, 2000);
setInterval(updateClock, 30000);
