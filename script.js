/* ============================================================
   ERROR 404：這台電腦不記得自己是誰
   條件解鎖完整版
   ============================================================ */

/* ---------- 1. 劇情資料 ---------- */
const GAME_DATA = {
  answers: { p1: "0314", p2: "echo", p3: "abort echo0314" },

  tasks: {
    start:     { title: "找出電腦發生異常的原因", dir: "檢查「我的電腦」、便利貼與防毒訊息" },
    p1:        { title: "修復損毀的開機日期", dir: "日期分成三塊，藏在錯誤報告、便利貼背面與終端機" },
    p2:        { title: "找齊名字的四個字母", dir: "調查記憶資料夾、瀏覽器、錯誤報告與回收桶" },
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

/* ---------- 2. 狀態 ---------- */
const state = {
  puzzleDone: { p1: false, p2: false, p3: false },
  foundLetters: [],
  lettersFound: [],
  letterOrder: [],
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
  dateFixed: { year: false, month: false, day: false },
  notepadFlipped: false,
  seenClues: { notepad: false, log: false, help: false },
  lockedUntil: 0,
  newItems: { errorReport: false, memoryFolder: false, trashNight: false }
};

/* ---------- 3. 圖示 ---------- */
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
const typeText = (el, text, speed = 28) => {
  el.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    if (i >= text.length) { clearInterval(timer); return; }
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
  if (key === "p1") {
    const f = state.dateFixed;
    prog = `修復進度：年${f.year ? "✔" : "✘"} 月${f.month ? "✔" : "✘"} 日${f.day ? "✔" : "✘"}`;
  } else if (key === "p2") {
    prog = `已找到字母：${state.foundLetters.length}/4`;
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

/* ---------- 7. 我的電腦 & 系統內容 ---------- */
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
      安裝日期：
      <span style="color:${f.year ? "#0a0" : "#a00"}">${f.year ? "2019" : "20██"}</span>/
      <span style="color:${f.month ? "#0a0" : "#a00"}">${f.month ? "03" : "██"}</span>/
      <span style="color:${f.day ? "#0a0" : "#a00"}">${f.day ? "14" : "██"}</span>
    </div>
    <div style="margin-top:14px;font-size:12px;color:#666;line-height:1.7;">
      ⚠️ 日期資料損毀。需要修復三個區塊：<br>
      • 年份 → 在「錯誤報告」中<br>
      • 月份 → 在「便利貼」背面<br>
      • 日期 → 在「終端機」輸入 date --fix
    </div>
    <div style="margin-top:12px;color:#a00;font-size:12px;">
      ${allFixed ? "✔ 日期已修復，可以回到「我的記憶」輸入密碼。" : "還有部分損毀，去別的地方找線索。"}
    </div>
  `;
  createWindow("系統內容", body);
}

/* ---------- 8. 錯誤報告（修復年份 + 字母 H） ---------- */
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
    if (!state.dateFixed.year) {
      state.dateFixed.year = true;
      echoSay("這個年份……好像是我出生的那一年。");
      updateTask("p1");
    }
    if (!state.foundLetters.includes("H")) {
      state.foundLetters.push("H");
      echoSay("這個字……好像是我的。");
    }
  });
}

/* ---------- 9. 便利貼（翻面修復月份 + 謎題三格式線索） ---------- */
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
  });
}

/* ---------- 10. 我的記憶（密碼鎖 + 檔案） ---------- */
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
