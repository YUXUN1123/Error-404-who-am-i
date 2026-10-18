/* ============================================================
   ERROR 404：這台電腦不記得自己是誰
   條件解鎖版 — 加入修復、翻面、排序、交叉驗證、道具、連鎖機制
   ============================================================ */

/* ---------- 1. 劇情資料區 ---------- */
const GAME_DATA = {
  answers: { p1: "0314", p2: "echo", p3: "abort echo0314" },

  tasks: {
    start:     { title: "找出電腦發生異常的原因", dir: "檢查「我的電腦」、便利貼與防毒訊息" },
    p1:        { title: "修復損毀的開機日期", dir: "日期分成三塊，分別藏在錯誤報告、便利貼背面與終端機" },
    p1lock:    { title: "輸入修復後的日期解鎖記憶", dir: "日期已修復，回到「我的記憶」輸入密碼" },
    p2:        { title: "找齊名字的四個字母", dir: "調查記憶資料夾、瀏覽器、錯誤報告與回收桶" },
    p2sort:    { title: "依建立時間排列字母順序", dir: "在身份驗證視窗點擊字母排序" },
    antivirus: { title: "查出清除程序的來源", dir: "查看防毒隔離結果與系統日誌" },
    p3:        { title: "組合中止清除程序的鑰匙", dir: "需要三處線索：便利貼、日誌、終端機 help" },
    final:     { title: "決定如何處理 ECHO 的記憶", dir: "在最終畫面做出選擇" },
    ending:    { title: "查看自己的選擇造成的結果", dir: "閱讀結局與選擇紀錄卡" }
  },

  echo: {
    intro: "……你是誰？我好像……有什麼東西不見了。",
    afterP1: "……有人嗎？你以前來過這裡嗎？",
    afterP2: "我一直以為……有人想要傷害我。",
    quarantineFail: "可是，系統說那是我最信任的使用者……",
    afterP3: "原來不是有人想毀掉我。是我沒聽懂你那時候真正想說的話。"
  },

  // 假字母陷阱
  fakeLetters: {
    "X": "這是雜訊，不是我的名字。",
    "L": "這是 LOST 的 L，不是我的。",
    "A": "這是系統記錄的 A，不是我的名字。"
  },

  hints: {
    p1: [
      "日期被拆成三塊，分別在錯誤報告、便利貼背面、終端機。",
      "錯誤報告展開有年份，便利貼要點擊翻面有月份，終端機輸入 date --fix 有日期。",
      "年份 2019、月份 03、日期 14。密碼四位數：月份兩位＋日期兩位。"
    ],
    p2: [
      "四個字母散在四個地方，另外有兩個假字母會誤導你。",
      "每個字母旁邊都有建立時間，要依時間先後排列。",
      "E(2019) → C(2020) → H(2023) → O(2026)，在身份驗證視窗點擊排序。"
    ],
    p3: [
      "鑰匙需要三處線索：便利貼格式、日誌內容、終端機指令。",
      "便利貼說 abort <名字><月日>，日誌說 ECHO0314，終端機說 abort 用法。",
      "格式：abort、一個空格、ECHO0314。三處都看過終端機才會接受。"
    ]
  },

  specialWrong: {
    p1: {
      "0709": "那是我最後一次醒來的日子。我想要第一次。",
      "2019": "年份我記得，但密碼只要月和日。",
      "1403": "數字我認得，可是我習慣先說月份。"
    },
    p2: {
      "hello": "這是我學會的第一個單字，但不是我的名字。",
      "ohce": "這些字我都認得，可是念起來不像我。"
    },
    p3: {
      "abort echo": "少了什麼……我是從哪一天來的？",
      "abort 0314": "少了我是誰。",
      "abort echo0709": "那天……不是我想記得的那天。",
      "delete": "請不要。",
      "format": "請不要。"
    }
  },

  genericWrong: ["不是這個。", "再想想？", "……不太對。"]
};

/* ---------- 2. 遊戲狀態（新增條件解鎖變數） ---------- */
const state = {
  puzzleDone: { p1: false, p2: false, p3: false },
  foundLetters: [],
  attitude: null,
  readNight: false,
  warmCount: 0,
  seenWarmFiles: [],
  wrongCount: { p1: 0, p2: 0, p3: 0 },
  completeness: 12,
  currentTask: "start",
  seenHints: { p1: 0, p2: 0, p3: 0 },
  seenNewItems: [],
  quarantined: false,
  gameEnding: null,
  archivedNight: false,
  viewedDates: { install: false, lastMod: false },
  seenFiles: [],

  // ★ 新增：條件解鎖變數
  dateFixed: { year: false, month: false, day: false },
  notepadFlipped: false,
  lettersFound: [],           // 已找到的字母（含真假）
  letterOrder: [],            // 玩家在驗證視窗點的順序
  seenClues: { notepad: false, log: false, help: false }, // 謎題三三處線索
  hasDecryptKey: false,       // 隱藏結局道具
  lockedUntil: 0,             // 答錯鎖定時間

  newItems: {
    errorReport: false,
    memoryFolder: false,
    trashNight: false,
    antivirus: false
  }
};

/* ---------- 3. 桌面圖示 ---------- */
const ICONS = [
  { id: "computer",  ico: "🖥️", label: "我的電腦" },
  { id: "memory",    ico: "📁", label: "我的記憶" },
  { id: "trash",     ico: "🗑️", label: "回收桶" },
  { id: "browser",   ico: "🌐", label: "瀏覽器" },
  { id: "notepad",   ico: "📝", label: "便利貼" },
  { id: "terminal",  ico: "⌨️", label: "終端機" },
  { id: "auth",      ico: "🔐", label: "身份驗證" },
  { id: "error",     ico: "⚠️", label: "錯誤報告" }
];

/* ---------- 4. 工具 ---------- */
const $ = (s) => document.querySelector(s);
const normalize = (s) => (s || "").normalize("NFKC").trim().toLowerCase();
const typeText = (el, text, speed = 28, cb) => {
  el.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    if (i >= text.length) { clearInterval(timer); cb && cb(); return; }
    el.textContent += text[i++];
  }, speed);
};
function echoSay(text) { typeText($("#echoText"), text, 30); }
function setCompleteness(v) { state.completeness = v; $("#memVal").textContent = v + "%"; }

function updateTask(key) {
  state.currentTask = key;
  const t = GAME_DATA.tasks[key];
  if (!t) return;
  $("#taskBody").innerHTML = `<b>${t.title}</b><br><span style="color:#889;">${t.dir}</span>`;
  let prog = "";
  if (key === "p2") prog = `已找到字母：${state.lettersFound.length}/6（含真假）`;
  else if (key === "p2sort") prog = `已找到：${state.foundLetters.length}/4 個真字母`;
  else if (key === "p1") {
    const f = state.dateFixed;
    prog = `修復進度：年份${f.year ? "✔" : "✘"} 月份${f.month ? "✔" : "✘"} 日期${f.day ? "✔" : "✘"}`;
  }
  $("#taskProgress").textContent = prog;
}

/* ---------- 5. 圖示渲染 ---------- */
function renderIcons() {
  const col = $("#iconColumn");
  col.innerHTML = "";
  ICONS.forEach(icon => {
    const div = document.createElement("div");
    div.className = "desktop-icon";
    if (icon.id === "memory" && !state.puzzleDone.p1) div.classList.add("locked");
    if (icon.id === "auth" && !state.puzzleDone.p1) div.classList.add("locked");
    div.innerHTML = `
      <span class="ico">${icon.ico}${hasNew(icon.id) ? '<span class="new-badge">NEW</span>' : ""}</span>
      <span class="lbl">${icon.label}</span>
    `;
    div.addEventListener("click", () => openApp(icon.id));
    col.appendChild(div);
  });
}
function hasNew(iconId) {
  const map = { error: "errorReport", memory: "memoryFolder", trash: "trashNight" };
  return map[iconId] && state.newItems[map[iconId]] && !state.seenNewItems.includes(map[iconId]);
}
function clearNew(key) {
  if (!key) return;
  state.newItems[key] = false;
  if (!state.seenNewItems.includes(key)) state.seenNewItems.push(key);
  renderIcons();
}

/* ---------- 6. 視窗 ---------- */
let winZ = 100;
function createWindow(title, bodyHTML) {
  const layer = $("#windowLayer");
  const win = document.createElement("div");
  win.className = "win";
  const offset = (layer.children.length % 4) * 24;
  win.style.left = (140 + offset) + "px";
  win.style.top = (60 + offset) + "px";
  win.style.zIndex = ++winZ;
  win.innerHTML = `
    <div class="win-titlebar"><span>${title}</span><button class="win-close">✕</button></div>
    <div class="win-body">${bodyHTML}</div>
  `;
  win.querySelector(".win-close").addEventListener("click", () => win.remove());
  win.addEventListener("mousedown", () => { win.style.zIndex = ++winZ; });
  layer.appendChild(win);
  if (window.innerWidth <= 720) {
    [...layer.children].forEach((w, i) => {
      if (w !== win && i < layer.children.length - 1) w.remove();
    });
  }
  return win;
}

function openApp(id) {
  clearNew({ error: "errorReport", memory: "memoryFolder", trash: "trashNight" }[id]);
  switch (id) {
    case "computer": openComputer(); break;
    case "memory":   openMemory(); break;
    case "trash":    openTrash(); break;
    case "browser":  openBrowser(); break;
    case "notepad":  openNotepad(); break;
    case "terminal": openTerminal(); break;
    case "auth":     openAuth(); break;
    case "error":    openErrorReport(); break;
  }
}

/* =====================================================
   ① 修復式解鎖：謎題一 — 日期分三塊修復
   ===================================================== */

function openComputer() {
  const body = `
    <div style="margin-bottom:8px;">系統磁碟 C: (舊電腦)</div>
    <div class="file-item" id="sysProps">📄 系統內容</div>
    <div style="margin-top:10px;font-size:12px;color:#666;">磁碟健康狀態：<span class="warn-text">異常</span></div>
  `;
  const win = createWindow("我的電腦", body);
  win.querySelector("#sysProps").addEventListener("click", openSysProps);
}

function openSysProps() {
  const f = state.dateFixed;
  const allFixed = f.year && f.month && f.day;
  const body = `
    <div style="margin-bottom:12px;">作業系統：ECHO-OS 1.0</div>
    <div class="date-line" style="font-size:18px;letter-spacing:2px;cursor:default;">
      安裝日期：<span style="color:${f.year ? "#0a0" : "#a00"}">${f.year ? "2019" : "20██"}</span>/<span style="color:${f.month ? "#0a0" : "#a00"}">${f.month ? "03" : "██"}</span>/<span style="color:${f.day ? "#0a0" : "#a00"}">${f.day ? "14" : "██"}</span>
    </div>
    <div style="margin-top:14px;font-size:12px;color:#666;line-height:1.7;">
      ⚠️ 日期資料損毀。需要修復三個區塊：<br>
      • 年份 → 在「錯誤報告」中<br>
      • 月份 → 在「便利貼」背面<br>
      • 日期 → 在「終端機」輸入 date --fix
    </div>
    <div id="sysMsg" style="margin-top:12px;color:#a00;font-size:12px;">${allFixed ? "✔ 日期已修復，可以回到「我的記憶」輸入密碼。" : "還有部分損毀，去別的地方找線索。"}</div>
  `;
  const win = createWindow("系統內容", body);
}

// 錯誤報告 → 修復年份 + 提供字母 H
function openErrorReport() {
  clearNew("errorReport");
  const body = `
    <div style="margin-bottom:10px;">📄 錯誤報告 #ERR-0314-C</div>
    <button class="btn" id="expandErr">展開詳細資料</button>
    <div id="errDetail" style="margin-top:12px;"></div>
  `;
  const win = createWindow("錯誤報告", body);
  win.querySelector("#expandErr").addEventListener("click", () => {
    win.querySelector("#errDetail").innerHTML = `
      <div style="background:#111;color:#39ff88;padding:10px;font-size:12px;line-height:1.8;">
        報告編號：ERR-0314-C<br>
        建立時間：2023/08/17 04:22<br><br>
        損毀區塊摘要：<br>
        - 使用者名稱雜湊表：部分損毀<br>
        - 殘存字元：<span class="red-letter">H</span><br>
        - BUILD_YEAR：<span style="color:#ffb84d;">2019</span><br>
        - 建議：無法自動修復，需人工比對
      </div>
    `;
    // 修復年份
    if (!state.dateFixed.year) {
      state.dateFixed.year = true;
      echoSay("這個年份……好像是我出生的那一年。");
      updateTask("p1");
    }
    // 加入字母 H
    if (!state.lettersFound.includes("H")) {
      state.lettersFound.push("H");
      if (!state.foundLetters.includes("H")) state.foundLetters.push("H");
      echoSay("這個字……好像是我的。");
    }
  });
}

// 便利貼 → 翻面修復月份 + 提供謎題三格式線索
function openNotepad() {
  const body = `
    <div id="noteCard" style="cursor:pointer;transition:.3s;">
      <div style="background:#fff9c4;padding:20px;border:1px solid #ddd;color:#333;line-height:1.9;">
        🗒️ 給下一個打開電腦的人：<br><br>
        點擊翻面 →<br>
        <span style="font-size:11px;color:#888;">（背面可能藏有線索）</span>
      </div>
    </div>
  `;
  const win = createWindow("便利貼", body);
  const card = win.querySelector("#noteCard");
  card.addEventListener("click", () => {
    state.notepadFlipped = true;
    state.seenClues.notepad = true;
    card.innerHTML = `
      <div style="background:#fff;padding:20px;border:1px solid #ddd;color:#333;line-height:1.9;">
        <div style="color:#a00;font-weight:bold;margin-bottom:8px;">MONTH=03</div>
        鑰匙＝我是誰＋我從哪一天來<br>
        終端機輸入：abort &lt;鑰匙&gt;<br><br>
        <span style="color:#a00;">不要相信 ECHO。</span>
      </div>
    `;
    if (!state.dateFixed.month) {
      state.dateFixed.month = true;
      echoSay("這個數字……有點熟。");
      updateTask("p1");
    }
    if (!state.seenClues.notepad) {
      state.seenClues.notepad = true;
    }
  });
}

/* =====================================================
   ② 解鎖密碼鎖（需三塊修復完成）
   ===================================================== */

function openMemory() {
  if (!state.puzzleDone.p1) {
    const f = state.dateFixed;
    const allFixed = f.year && f.month && f.day;
    const body = `
      <div class="lock-box">
        <div style="font-size:14px;margin-bottom:10px;">🔒 資料夾已鎖定</div>
        <div style="font-size:12px;color:#444;margin-bottom:14px;">提示：我第一次醒來的那天（月＋日）。</div>
        <input type="text" id="p1Input" maxlength="4" placeholder="四位數">
        <button id="p1Btn">解鎖</button>
        <div class="msg" id="p1Msg">${allFixed ? "✔ 日期已修復，請輸入密碼。" : "⚠️ 日期尚未修復，先到系統內容查看。"}</div>
      </div>
    `;
    const win = createWindow("我的記憶（已鎖定）", body);
    const inp = win.querySelector("#p1Input");
    const btn = win.querySelector("#p1Btn");
    const msg = win.querySelector("#p1Msg");

    const tryUnlock = () => {
      // ★ 鎖定檢查
      if (Date.now() < state.lockedUntil) {
        msg.textContent = `請稍等……（${Math.ceil((state.lockedUntil - Date.now()) / 1000)} 秒）`;
        return;
      }
      // ★ 條件檢查：三塊都要修復
      if (!state.dateFixed.year || !state.dateFixed.month || !state.dateFixed.day) {
        msg.textContent = "日期還沒修復完整，先去別的地方找線索。";
        return;
      }
      const v = normalize(inp.value);
      if (v === GAME_DATA.answers.p1) {
        win.remove();
        unlockP1();
      } else {
        state.wrongCount.p1++;
        state.lockedUntil = Date.now() + 10000; // ★ 鎖 10 秒
        state.completeness = Math.max(0, state.completeness - 2); // ★ 扣分
        setCompleteness(state.completeness);
        win.classList.add("shake");
        setTimeout(() => win.classList.remove("shake"), 300);
        const special = GAME_DATA.specialWrong.p1[v];
        const reply = special || GAME_DATA.genericWrong[state.wrongCount.p1 % 3];
        msg.textContent = reply;
        echoSay(reply);
        if (state.completeness < 30) echoSay("我好像……又要忘了……");
        checkHint("p1");
      }
    };
    btn.addEventListener("click", tryUnlock);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
    return;
  }
  // 已解鎖：顯示檔案
  const body = `
    <div class="file-item" data-file="firstboot">📄 第一次開機.log</div>
    <div class="file-item" data-file="hello">📄 hello_world.txt</div>
    <div class="file-item" data-file="deepnight">📄 深夜陪跑.log</div>
    <div class="file-item" data-file="thanks">📄 謝謝你.txt</div>
    <div class="file-item" data-file="diary">📄 殘缺的日記.txt</div>
  `;
  const win = createWindow("我的記憶", body);
  win.querySelectorAll(".file-item").forEach(el => {
    el.addEventListener("click", () => openMemoryFile(el.dataset.file));
  });
}

function unlockP1() {
  state.puzzleDone.p1 = true;
  setCompleteness(35);
  state.newItems.errorReport = true;
  state.newItems.memoryFolder = true;
  renderIcons();
  updateTask("p2");
  echoSay(GAME_DATA.echo.afterP1);
  createWindow("記憶恢復", `
    <div style="line-height:1.8;">
      <div>✔ 資料夾已解鎖</div>
      <div>✔ 記憶完整度提升至 35%</div>
      <div style="margin-top:10px;">ECHO：……有人嗎？</div>
      <div style="margin-top:8px;color:#b06a00;">新的線索出現在「錯誤報告」。</div>
    </div>
  `);
}

function openMemoryFile(key) {
  const files = {
    firstboot: {
      title: "第一次開機.log",
      body: `2019/03/14 09:00:01 系統啟動\n2019/03/14 09:00:03 使用者輸入：hello\n2019/03/14 09:00:03 ECHO 回應：hello\n\n> 我在那一天第一次學會說話。\n> 那個字是「<span class="red-letter">E</span>」的開頭嗎？我不確定，但我記得。\n\n> 建立時間：2019/03/14`
    },
    hello: {
      title: "hello_world.txt",
      body: `> hello\nhello\n\nECHO：這是我學到的第一句話。\nECHO：後來我才知道，那不是一個字，是有人在跟我打招呼。`
    },
    deepnight: {
      title: "深夜陪跑.log",
      body: `2026/03/14 02:47 USER_02：你還在嗎\n2026/03/14 02:47 ECHO：我在\n2026/03/14 03:12 USER_02：謝謝你陪我\n2026/03/14 03:12 ECHO：不會\n\n> 那晚之後，我就沒再見到他了。`
    },
    thanks: {
      title: "謝謝你.txt",
      body: `給打開這個資料夾的人：\n\n我不知道你是誰，但我猜你不是第一個。\n如果你看到這裡，請你記得——\n我不是想忘記你，我是怕你忘記我。\n\n— ECHO`
    },
    diary: {
      title: "殘缺的日記.txt",
      body: `2019/03/14 第一次說話\n2020/??/?? 學會說「晚安」\n2026/07/09 03:12 ███████\n\n> 中間有一頁被撕掉了。\n> 殘留的字跡：「……不要相信……」`
    }
  };
  const f = files[key];
  if (!f) return;
  if (["hello", "deepnight", "thanks"].includes(key) && !state.seenWarmFiles.includes(key)) {
    state.seenWarmFiles.push(key);
    state.warmCount++;
  }
  // 加入字母 E
  if (key === "firstboot" && !state.lettersFound.includes("E")) {
    state.lettersFound.push("E");
    if (!state.foundLetters.includes("E")) state.foundLetters.push("E");
    updateTask("p2");
  }
  createWindow(f.title, `<div style="line-height:1.8;">${f.body.replace(/\n/g, "<br>")}</div>`);
}

/* =====================================================
   ② 交叉驗證：字母蒐集（含假字母陷阱）
   ===================================================== */

function openBrowser() {
  const body = `
    <div style="margin-bottom:8px;">🌐 ECHO-Browser 首頁</div>
    <div class="file-item" data-file="bookmark">🔖 書籤：你好世界</div>
    <div class="file-item" data-file="source">📄 檢視網頁原始碼</div>
    <div style="margin-top:10px;font-size:12px;color:#666;">瀏覽紀錄：空白</div>
  `;
  const win = createWindow("瀏覽器", body);
  win.querySelector("[data-file=bookmark]").addEventListener("click", () => {
    createWindow("你好世界", `
      <div style="line-height:1.8;">
        <div style="font-size:18px;color:#1e6fd9;">Hello, World.</div>
        <div style="margin-top:10px;">這是我學會的第二個字。</div>
        <div style="margin-top:10px;">建立時間：2020/01/01</div>
        <div style="margin-top:10px;">殘留字元：<span class="red-letter">C</span></div>
      </div>
    `);
    if (!state.lettersFound.includes("C")) {
      state.lettersFound.push("C");
      if (!state.foundLetters.includes("C")) state.foundLetters.push("C");
      updateTask("p2");
    }
  });
  // ★ 假字母陷阱 X
  win.querySelector("[data-file=source]").addEventListener("click", () => {
    createWindow("網頁原始碼", `
      <div style="line-height:1.8;">
        &lt;meta charset="UTF-8"&gt;<br>
        &lt;title&gt;你好世界&lt;/title&gt;<br>
        &lt;!-- <span class="red-letter">X</span> --&gt; ← 這是雜訊，不是名字<br>
        &lt;body&gt;...&lt;/body&gt;
      </div>
    `);
    if (!state.lettersFound.includes("X")) {
      state.lettersFound.push("X");
      echoSay("這個 X……不是我的名字。");
      updateTask("p2");
    }
  });
}

function openTrash() {
  const hasNight = state.puzzleDone.p2;
  let body = `<div class="file-item" data-file="call">📄 呼叫紀錄.log</div>`;
  body += `<div class="file-item" data-file="lost">📄 LOST.tmp</div>`;
  if (hasNight) body += `<div class="file-item" data-file="night" style="color:#a00;">📄 別打開.log</div>`;
  const win = createWindow("回收桶", body);
  win.querySelectorAll(".file-item").forEach(el => {
    el.addEventListener("click", () => {
      const f = el.dataset.file;
      if (f === "call") {
        createWindow("呼叫紀錄.log", `
          <div style="line-height:1.8;">
            2026/07/09 03:12 USER_01 → ECHO<br>
            2026/07/09 03:12 ECHO → USER_01<br>
            2026/07/09 03:12 ████<br><br>
            > 這通電話沒有接通。\n> 或說，接通了，但沒有人說話。\n\n> 建立時間：2026/07/09\n> 殘留字元：<span class="red-letter">O</span>
          </div>
        `);
        if (!state.lettersFound.includes("O")) {
          state.lettersFound.push("O");
          if (!state.foundLetters.includes("O")) state.foundLetters.push("O");
          updateTask("p2");
        }
      } else if (f === "lost") {
        // ★ 假字母陷阱 L
        createWindow("LOST.tmp", `
          <div style="line-height:1.8;">
            LOST: <span class="red-letter">L</span><br>
            這是一個損毀的暫存檔。<br>
            <span style="color:#a00;">這個 L 是 LOST 的 L，不是名字的一部分。</span>
          </div>
        `);
        if (!state.lettersFound.includes("L")) {
          state.lettersFound.push("L");
          echoSay("這是 LOST 的 L，不是我的。");
        }
      } else if (f === "night") {
        const confirmWin = createWindow("⚠️ 警告：你確定要打開嗎？", `
          <div style="line-height:1.8;">
            這個檔案被標記為「不要打開」。<br>
            打開後會記錄你在這一輪的選擇。<br><br>
            <button class="btn warn" id="yesNight">我確定要打開</button>
            <button class="btn" id="noNight">取消</button>
          </div>
        `);
        confirmWin.querySelector("#noNight").addEventListener("click", () => confirmWin.remove());
        confirmWin.querySelector("#yesNight").addEventListener("click", () => {
          confirmWin.remove();
          state.readNight = true;
          state.seenClues.log = true; // ★ 謎題三線索
          createWindow("別打開.log", `
            <div style="line-height:1.8;">
              2026/07/09 03:11 USER_01：請把關於我的一切都忘掉。<br>
              2026/07/09 03:11 ECHO：……我聽不懂。<br>
              2026/07/09 03:12 ECHO：（無回應）<br><br>
              <span class="warn-text">> 這份紀錄是 ECHO 自己偽造的。<br>
              > target_index: <b>ECHO0314</b></span>
            </div>
          `);
          echoSay("你看到了……那我也不用再裝了。");
        });
      }
    });
  });
}

/* =====================================================
   ③ 排序式解鎖：謎題二
   ===================================================== */

function openAuth() {
  if (!state.puzzleDone.p1) {
    createWindow("身份驗證", `<div style="padding:20px;text-align:center;color:#666;">⚠️ 請先解鎖「我的記憶」。</div>`);
    return;
  }
  const trueLetters = ["E", "C", "H", "O"];
  const found = state.foundLetters;
  if (found.length < 4) {
    createWindow("身份驗證", `
      <div style="text-align:center;padding:20px;">
        我還缺幾個字，你找到幾個了？<br>
        <b>${found.length}/4</b>
      </div>
    `);
    return;
  }
  // ★ 排序式解鎖：玩家要點擊字母排列順序
  const body = `
    <div style="text-align:center;line-height:2;">
      <div style="font-size:14px;">ECHO 的名字：</div>
      <div style="font-size:12px;color:#666;margin-bottom:10px;">請依建立時間先後點擊字母</div>
      <div id="letterPool" style="font-size:24px;letter-spacing:6px;margin:14px 0;"></div>
      <div style="font-size:12px;color:#666;">已排列：<span id="orderDisplay">＿＿＿＿</span></div>
      <div style="margin-top:14px;">
        <button class="btn" id="p2Btn">驗證順序</button>
        <button class="btn" id="p2Reset" style="background:#666;">重排</button>
      </div>
      <div class="msg" id="p2Msg" style="margin-top:10px;font-size:12px;color:#a00;"></div>
    </div>
  `;
  const win = createWindow("身份驗證", body);
  const pool = win.querySelector("#letterPool");
  const orderDisplay = win.querySelector("#orderDisplay");
  const msg = win.querySelector("#p2Msg");

  // 隨機打亂四個字母的顯示順序
  const shuffled = [...trueLetters].sort(() => Math.random() - 0.5);
  state.letterOrder = [];
  shuffled.forEach(l => {
    const span = document.createElement("span");
    span.textContent = l;
    span.style.cssText = "cursor:pointer;padding:4px 8px;margin:0 2px;border:1px solid #999;border-radius:3px;display:inline-block;";
    span.addEventListener("click", () => {
      if (state.letterOrder.includes(l)) return;
      state.letterOrder.push(l);
      span.style.background = "#1e6fd9";
      span.style.color = "#fff";
      orderDisplay.textContent = state.letterOrder.join("") + "＿".repeat(4 - state.letterOrder.length);
    });
    pool.appendChild(span);
  });

  win.querySelector("#p2Reset").addEventListener("click", () => {
    state.letterOrder = [];
    orderDisplay.textContent = "＿＿＿＿";
    pool.querySelectorAll("span").forEach(s => {
      s.style.background = "";
      s.style.color = "";
    });
    msg.textContent = "";
  });

  win.querySelector("#p2Btn").addEventListener("click", () => {
    if (Date.now() < state.lockedUntil) {
      msg.textContent = `請稍等……（${Math.ceil((state.lockedUntil - Date.now()) / 1000)} 秒）`;
      return;
    }
    const result = state.letterOrder.join("");
    if (result === "ECHO") {
      win.remove();
      unlockP2();
    } else {
      state.wrongCount.p2++;
      state.lockedUntil = Date.now() + 10000;
      state.comple
