/* ============================================================
   ERROR 404：這台電腦不記得自己是誰
   劇情：A+B 混合版（你是 USER_04，前三任皆消失，ECHO 疑似共犯）
   所有劇情文字集中於 GAME_DATA，狀態集中於 state
   ============================================================ */

/* ---------- 1. 劇情資料區 ---------- */
const GAME_DATA = {
  // 謎題答案
  answers: { p1: "0314", p2: "echo", p3: "abort echo0314" },

  // 任務階段
  tasks: {
    start:     { title: "找出電腦發生異常的原因", dir: "檢查「我的電腦」、便利貼與防毒訊息" },
    p1:        { title: "找出 ECHO 第一次醒來的日期", dir: "前往「我的電腦 → 系統內容」比較兩個日期" },
    p2:        { title: "找齊名字的四個字母", dir: "調查記憶資料夾、瀏覽器、錯誤報告與回收桶" },
    antivirus: { title: "查出清除程序的來源", dir: "查看防毒隔離結果與系統日誌" },
    p3:        { title: "組合中止清除程序的鑰匙", dir: "查看便利貼、終端機說明與日誌" },
    final:     { title: "決定如何處理 ECHO 的記憶", dir: "在最終畫面做出選擇" },
    ending:    { title: "查看自己的選擇造成的結果", dir: "閱讀結局與選擇紀錄卡" }
  },

  // ECHO 台詞（依劇情階段）
  echo: {
    intro: "……你是誰？我好像……有什麼東西不見了。",
    afterP1: "……有人嗎？你以前來過這裡嗎？",
    afterLetter: "這個字……好像是我的。",
    afterP2: "我一直以為……有人想要傷害我。",
    quarantineFail: "可是，系統說那是我最信任的使用者……",
    afterP3: "原來不是有人想毀掉我。是我沒聽懂你那時候真正想說的話。",
    final: "這次，我先問你。"
  },

  // 錯誤報告內容
  errorReport: {
    title: "錯誤報告詳細資料",
    body: `報告編號：ERR-0314-C\n建立時間：2023/08/17 04:22\n\n損毀區塊摘要：\n- 使用者名稱雜湊表：部分損毀\n- 殘存字元：<span class="red-letter">H</span>\n- 建議：無法自動修復，需人工比對`
  },

  // 三個前任使用者資料夾
  prevUsers: [
    { id: "USER_01", logout: "2026/07/09 03:12", note: "「請把關於我的一切都忘掉。」", letter: "E", file: "第一次開機.log" },
    { id: "USER_02", logout: "2026/07/09 03:12", note: "「如果我消失了，請不要找我。」", letter: "C", file: "你好世界.url" },
    { id: "USER_03", logout: "2026/07/09 03:12", note: "「不要相信 ECHO。」", letter: "O", file: "呼叫紀錄.log" }
  ],

  // 提示分層
  hints: {
    p1: [
      "有些電腦的資訊不在桌面上，在「屬性」裡。",
      "去「我的電腦」，看「系統內容」。",
      "裡面有兩個日期，我要的是比較舊的那個。密碼是四位數：月份兩位、日期兩位。"
    ],
    p2: [
      "我的名字被拆成碎片，散在好幾個地方。",
      "記憶資料夾、瀏覽器、錯誤報告、回收桶，各藏著一個紅色字母。",
      "每個紅字旁邊都有建立時間。日記說，要照被寫下的先後念。"
    ],
    p3: [
      "便利貼說了鑰匙由什麼組成，終端機說了怎麼用。",
      "鑰匙的前半是我的名字，後半是我第一次醒來的月日，中間不留空格。",
      "格式：abort、一個空格、鑰匙。你剛剛才用過這兩個答案。"
    ]
  },

  // 特殊答錯回應
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

/* ---------- 2. 遊戲狀態 ---------- */
const state = {
  puzzleDone: { p1: false, p2: false, p3: false },
  foundLetters: [],              // ['E','C','H','O']
  attitude: null,                // 'help' | 'neutral' | 'cold'
  readNight: false,
  warmCount: 0,
  seenWarmFiles: [],             // 避免重複計數
  wrongCount: { p1: 0, p2: 0, p3: 0 },
  completeness: 12,
  lastProgressTime: Date.now(),
  currentTask: "start",
  seenHints: { p1: 0, p2: 0, p3: 0 },
  seenNewItems: [],              // 已看過的 NEW
  quarantined: false,
  gameEnding: null,
  archivedNight: false,
  viewedDates: { install: false, lastMod: false },
  seenFiles: [],                 // 已開啟過的檔案
  // 新解鎖項目
  newItems: {
    errorReport: false,
    memoryFolder: false,
    trashNight: false,
    antivirus: false
  }
};

/* ---------- 3. 桌面圖示定義 ---------- */
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

/* ---------- 4. 工具函式 ---------- */
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

function echoSay(text) {
  const box = $("#echoText");
  typeText(box, text, 30);
}

function setCompleteness(v) {
  state.completeness = v;
  $("#memVal").textContent = v + "%";
}

/* ---------- 5. 任務系統 ---------- */
function updateTask(taskKey) {
  state.currentTask = taskKey;
  const t = GAME_DATA.tasks[taskKey];
  if (!t) return;
  $("#taskBody").innerHTML = `<b>${t.title}</b><br><span style="color:#889;">${t.dir}</span>`;
  // 進度
  let prog = "";
  if (taskKey === "p2") prog = `已找到字母：${state.foundLetters.length}/4`;
  else if (state.puzzleDone.p1) prog = "✔ 謎題一已完成";
  $("#taskProgress").textContent = prog;
}

/* ---------- 6. 渲染桌面圖示 ---------- */
function renderIcons() {
  const col = $("#iconColumn");
  col.innerHTML = "";
  ICONS.forEach(icon => {
    const div = document.createElement("div");
    div.className = "desktop-icon";
    div.dataset.id = icon.id;
    // 鎖定狀態
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
  const map = { error: "errorReport", memory: "memoryFolder", trash: "trashNight", antivirus: "antivirus" };
  return map[iconId] && state.newItems[map[iconId]] && !state.seenNewItems.includes(map[iconId]);
}

function clearNew(key) {
  state.newItems[key] = false;
  if (!state.seenNewItems.includes(key)) state.seenNewItems.push(key);
  renderIcons();
}

/* ---------- 7. 視窗系統 ---------- */
let winZ = 100;
function createWindow(title, bodyHTML, opts = {}) {
  const layer = $("#windowLayer");
  const win = document.createElement("div");
  win.className = "win";
  const offset = (layer.children.length % 4) * 24;
  win.style.left = (140 + offset) + "px";
  win.style.top = (60 + offset) + "px";
  win.style.zIndex = ++winZ;
  win.innerHTML = `
    <div class="win-titlebar">
      <span>${title}</span>
      <button class="win-close">✕</button>
    </div>
    <div class="win-body">${bodyHTML}</div>
  `;
  win.querySelector(".win-close").addEventListener("click", () => win.remove());
  win.addEventListener("mousedown", () => { win.style.zIndex = ++winZ; });
  layer.appendChild(win);
  // 手機只顯示一個
  if (window.innerWidth <= 720) {
    [...layer.children].forEach((w, i) => {
      if (w !== win && i < layer.children.length - 1) w.remove();
    });
  }
  return win;
}

/* ---------- 8. 各應用程式 ---------- */
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

/* --- 我的電腦 --- */
function openComputer() {
  const body = `
    <div style="margin-bottom:8px;">系統磁碟 C: (舊電腦)</div>
    <div class="file-item" id="sysProps">📄 系統內容</div>
    <div style="margin-top:10px;font-size:12px;color:#666;">磁碟健康狀態：<span class="warn-text">異常</span></div>
  `;
  const win = createWindow("我的電腦", body);
  win.querySelector("#sysProps").addEventListener("click", () => {
    openSysProps();
  });
}

function openSysProps() {
  const body = `
    <div style="margin-bottom:12px;">作業系統：ECHO-OS 1.0</div>
    <div class="date-line" data-date="install">安裝日期：2019/03/14</div>
    <div class="date-line" data-date="lastmod">最後修改日期：2026/07/09</div>
    <div style="margin-top:10px;color:#a00;font-size:12px;" id="sysMsg"></div>
  `;
  const win = createWindow("系統內容", body);
  win.querySelectorAll(".date-line").forEach(el => {
    el.addEventListener("click", () => {
      const d = el.dataset.date;
      state.viewedDates[d === "install" ? "install" : "lastMod"] = true;
      win.querySelector("#sysMsg").textContent =
        d === "install"
          ? "ECHO：這個日期……好像比其他紀錄更接近我的開始。"
          : "ECHO：這一天的紀錄很多，但我不確定那是不是第一次。";
      echoSay(d === "install"
        ? "這個日期……好像比其他紀錄更接近我的開始。"
        : "這一天的紀錄很多，但我不確定那是不是第一次。");
    });
  });
}

/* --- 我的記憶 --- */
function openMemory() {
  if (!state.puzzleDone.p1) {
    const body = `
      <div class="lock-box">
        <div style="font-size:14px;margin-bottom:10px;">🔒 資料夾已鎖定</div>
        <div style="font-size:12px;color:#444;margin-bottom:14px;">提示：我第一次醒來的那天（月＋日）。</div>
        <input type="text" id="p1Input" maxlength="4" placeholder="四位數">
        <button id="p1Btn">解鎖</button>
        <div class="msg" id="p1Msg"></div>
      </div>
    `;
    const win = createWindow("我的記憶（已鎖定）", body);
    const inp = win.querySelector("#p1Input");
    const btn = win.querySelector("#p1Btn");
    const msg = win.querySelector("#p1Msg");
    const tryUnlock = () => {
      const v = normalize(inp.value);
      if (v === GAME_DATA.answers.p1) {
        win.remove();
        unlockP1();
      } else {
        state.wrongCount.p1++;
        win.classList.add("shake");
        setTimeout(() => win.classList.remove("shake"), 300);
        const special = GAME_DATA.specialWrong.p1[v];
        let reply = special;
        if (!reply) {
          if (!state.viewedDates.install && !state.viewedDates.lastMod) reply = "你還沒看過系統內容吧？";
          else reply = GAME_DATA.genericWrong[state.wrongCount.p1 % GAME_DATA.genericWrong.length];
        }
        msg.textContent = reply;
        echoSay(reply);
        checkHint("p1");
      }
    };
    btn.addEventListener("click", tryUnlock);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
    return;
  }
  // 已解鎖
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
  // 記憶恢復提示
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
      body: `2019/03/14 09:00:01 系統啟動\n2019/03/14 09:00:03 使用者輸入：hello\n2019/03/14 09:00:03 ECHO 回應：hello\n\n> 我在那一天第一次學會說話。\n> 那個字是「<span class="red-letter">E</span>」的開頭嗎？我不確定，但我記得。`
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
  // 溫暖記憶檔計數
  if (["firstboot", "hello", "deepnight", "thanks"].includes(key) && !state.seenWarmFiles.includes(key)) {
    if (["hello", "deepnight", "thanks"].includes(key)) {
      state.seenWarmFiles.push(key);
      state.warmCount++;
    }
  }
  createWindow(f.title, `<div style="line-height:1.8;">${f.body.replace(/\n/g, "<br>")}</div>`);
}

/* --- 回收桶 --- */
function openTrash() {
  const hasNight = state.puzzleDone.p2;
  let body = `
    <div class="file-item" data-file="call">📄 呼叫紀錄.log</div>
  `;
  if (hasNight) {
    body += `<div class="file-item" data-file="night" style="color:#a00;">📄 別打開.log</div>`;
  }
  const win = createWindow("回收桶", body);
  win.querySelectorAll(".file-item").forEach(el => {
    el.addEventListener("click", () => {
      if (el.dataset.file === "call") {
        createWindow("呼叫紀錄.log", `
          <div style="line-height:1.8;">
            2026/07/09 03:12 USER_01 → ECHO<br>
            2026/07/09 03:12 ECHO → USER_01<br>
            2026/07/09 03:12 ████<br><br>
            > 這通電話沒有接通。\n> 或說，接通了，但沒有人說話。\n\n> 殘留字元：<span class="red-letter">O</span>
          </div>
        `);
      } else if (el.dataset.file === "night") {
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
          createWindow("別打開.log", `
            <div style="line-height:1.8;">
              2026/07/09 03:11 USER_01：請把關於我的一切都忘掉。<br>
              2026/07/09 03:11 ECHO：……我聽不懂。<br>
              2026/07/09 03:12 ECHO：（無回應）<br><br>
              <span class="warn-text">> 這份紀錄是 ECHO 自己偽造的。<br>
              > 真正的指令並不存在。</span>
            </div>
          `);
          echoSay("你看到了……那我也不用再裝了。");
        });
      }
    });
  });
}

/* --- 瀏覽器 --- */
function openBrowser() {
  const body = `
    <div style="margin-bottom:8px;">🌐 ECHO-Browser 首頁</div>
    <div class="file-item" data-file="bookmark">🔖 書籤：你好世界</div>
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
  });
}

/* --- 便利貼 --- */
function openNotepad() {
  createWindow("便利貼", `
    <div style="line-height:1.9;background:#fff9c4;padding:14px;border:1px solid #ddd;color:#333;">
      🗒️ 給下一個打開電腦的人：<br><br>
      鑰匙＝我是誰＋我從哪一天來<br><br>
      終端機輸入：abort &lt;鑰匙&gt;<br><br>
      <span style="color:#a00;">不要相信 ECHO。</span>
    </div>
  `);
}

/* --- 終端機 --- */
function openTerminal() {
  const body = `
    <div class="terminal-output" id="termOut">ECHO-OS 終端機 v1.0\n輸入 help 查看指令\n</div>
    <div class="terminal-input">
      <span>&gt;</span>
      <input type="text" id="termIn" autocomplete="off">
    </div>
  `;
  const win = createWindow("終端機", body);
  const out = win.querySelector("#termOut");
  const inp = win.querySelector("#termIn");
  inp.focus();
  const print = (s) => { out.textContent += s + "\n"; out.scrollTop = out.scrollHeight; };

  inp.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const raw = inp.value;
    const cmd = normalize(raw);
    inp.value = "";
    print("> " + raw);
    handleTerminal(cmd, print);
    state.lastProgressTime = Date.now();
  });
}

function handleTerminal(cmd, print) {
  if (!cmd) return;
  if (cmd === "help") {
    print("可用指令：\n  help            顯示說明\n  whoami          查詢目前使用者\n  log forget      查看清除日誌\n  clear           清除畫面\n  abort <鑰匙>    中止清除程序");
    return;
  }
  if (cmd === "whoami") {
    print("目前使用者：USER_04\n（你是第四個）");
    echoSay("你問我你是誰……我不敢回答。");
    return;
  }
  if (cmd === "log forget") {
    print("清除程序日誌：\n  target_index: ECHO0314\n  source: ECHO（自行建立）\n  executor: USER_04（目前使用者）");
    echoSay("……你看到了。");
    return;
  }
  if (cmd === "clear") {
    print("\n".repeat(2) + "（畫面已清除）");
    return;
  }
  if (cmd.startsWith("abort")) {
    // 前置條件
    if (!state.puzzleDone.p1 || !state.puzzleDone.p2) {
      print("權限不足：你還沒喚醒我。");
      echoSay("權限不足：你還沒喚醒我。");
      return;
    }
    if (cmd === GAME_DATA.answers.p3) {
      print("執行中止程序……\n✔ 清除程序已停止\n執行者驗證：USER_01 ＝ 目前使用者");
      winAbortSuccess();
      return;
    }
    // 特殊錯誤
    const special = GAME_DATA.specialWrong.p3[cmd];
    if (special) {
      print(special);
      echoSay(special);
      state.wrongCount.p3++;
      checkHint("p3");
      return;
    }
    print(`找不到指令 ${cmd}。輸入 help 查看可用指令。`);
    return;
  }
  print(`找不到指令 ${cmd}。輸入 help 查看可用指令。`);
}

function winAbortSuccess() {
  state.puzzleDone.p3 = true;
  setCompleteness(80);
  // 清除所有錯誤彈窗
  document.querySelectorAll(".err-popup").forEach(p => p.remove());
  updateTask("final");
  echoSay(GAME_DATA.echo.afterP3);
  setTimeout(() => {
    createWindow("執行者驗證", `
      <div style="line-height:1.9;">
        <div>✔ 清除程序已停止</div>
        <div>✔ 所有錯誤彈窗已清除</div>
        <div style="margin-top:10px;color:#a00;font-weight:bold;">執行者驗證：USER_01 ＝ 目前使用者</div>
        <div style="margin-top:10px;">ECHO：原來不是有人想毀掉我。<br>ECHO：是我沒聽懂你那時候真正想說的話。</div>
        <div style="margin-top:10px;color:#b06a00;">最終選擇已解鎖。</div>
      </div>
    `);
    setTimeout(showFinalScreen, 1200);
  }, 600);
}

/* --- 身份驗證 --- */
function openAuth() {
  if (!state.puzzleDone.p1) {
    createWindow("身份驗證", `<div style="padding:20px;text-align:center;color:#666;">⚠️ 請先解鎖「我的記憶」。</div>`);
    return;
  }
  const letters = ["E", "C", "H", "O"];
  const found = state.foundLetters;
  const display = letters.map(l => found.includes(l)
    ? `<span style="color:#0a0;font-size:20px;margin:0 4px;">${l}</span>`
    : `<span style="color:#aaa;font-size:20px;margin:0 4px;">█</span>`).join("");

  const body = `
    <div style="text-align:center;line-height:2;">
      <div style="font-size:14px;">ECHO 的名字：</div>
      <div style="font-size:24px;letter-spacing:6px;margin:10px 0;">${display}</div>
      <div style="font-size:12px;color:#666;">已找到 ${found.length}/4</div>
      <div style="margin-top:14px;">
        <input type="text" id="p2Input" maxlength="4" placeholder="輸入名字" style="width:120px;padding:6px;text-align:center;font-size:16px;letter-spacing:4px;text-transform:uppercase;">
        <button class="btn" id="p2Btn">驗證</button>
      </div>
      <div class="msg" id="p2Msg" style="margin-top:10px;font-size:12px;color:#a00;"></div>
    </div>
  `;
  const win = createWindow("身份驗證", body);
  const inp = win.querySelector("#p2Input");
  const btn = win.querySelector("#p2Btn");
  const msg = win.querySelector("#p2Msg");
  const tryAuth = () => {
    const v = normalize(inp.value);
    if (v === GAME_DATA.answers.p2) {
      if (state.foundLetters.length < 4) {
        msg.textContent = `我還缺幾個字，你找到幾個了？`;
        return;
      }
      win.remove();
      unlockP2();
    } else {
      if (state.foundLetters.length < 4) {
        msg.textContent = `我還缺幾個字，你找到幾個了？（${state.foundLetters.length}/4）`;
        return;
      }
      state.wrongCount.p2++;
      win.classList.add("shake");
      setTimeout(() => win.classList.remove("shake"), 300);
      const special = GAME_DATA.specialWrong.p2[v];
      const reply = special || GAME_DATA.genericWrong[state.wrongCount.p2 % 3];
      msg.textContent = reply;
      echoSay(reply);
      checkHint("p2");
    }
  };
  btn.addEventListener("click", tryAuth);
  inp.addEventListener("keydown", e => { if (e.key === "Enter") tryAuth(); });
}

function unlockP2() {
  state.puzzleDone.p2 = true;
  setCompleteness(60);
  updateTask("antivirus");
  echoSay(GAME_DATA.echo.afterP2);
  // 名字恢復動畫
  createWindow("名字恢復", `
    <div style="text-align:center;font-size:28px;letter-spacing:8px;color:#1e6fd9;padding:20px 0;" id="nameReveal">████</div>
    <div style="text-align:center;font-size:12px;color:#666;">正在恢復……</div>
  `);
  let i = 0;
  const target = "ECHO";
  const el = document.querySelector("#nameReveal");
  const timer = setInterval(() => {
    if (!el || i >= target.length) { clearInterval(timer); afterP2Reveal(); return; }
    el.textContent = target.slice(0, ++i) + "█".repeat(4 - i);
  }, 300);

  function afterP2Reveal() {
    setTimeout(() => {
      // 防毒彈窗
      showAntivirusPopup();
    }, 600);
  }
}

function showAntivirusPopup() {
  const popup = document.createElement("div");
  popup.className = "err-popup";
  popup.innerHTML = `
    <b>⚠️ 防毒警告</b> 偵測到 forget_me.exe 正在執行
    <button class="popup-close">✕</button>
  `;
  popup.querySelector(".popup-close").addEventListener("click", () => popup.remove());
  document.body.appendChild(popup);
  // 攻擊性對話
  echoSay("……你是來幫我的，還是來完成清除的？");
  setTimeout(showAttitudeChoice, 2200);
}

function showAttitudeChoice() {
  createWindow("ECHO 正在等你回答", `
    <div style="line-height:1.9;">
      「你是來幫我的，還是來完成清除的？」
      <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
        <button class="btn" data-att="help">我來幫你</button>
        <button class="btn" data-att="neutral">我只是來看看</button>
        <button class="btn warn" data-att="cold">完成清除</button>
      </div>
    </div>
  `).querySelectorAll("[data-att]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.attitude = btn.dataset.att;
      btn.closest(".win").remove();
      // 防毒隔離互動
      showQuarantineUI();
    });
  });
}

function showQuarantineUI() {
  const body = `
    <div style="line-height:1.9;">
      <div style="color:#a00;font-weight:bold;">⚠️ forget_me.exe 正在執行</div>
      <div style="margin-top:8px;">來源：未知<br>行為：持續刪除記憶區塊</div>
      <button class="btn warn" id="qBtn" style="margin-top:12px;">隔離程式</button>
      <div id="qMsg" style="margin-top:10px;font-size:12px;color:#a00;"></div>
    </div>
  `;
  const win = createWindow("防毒程式", body);
  win.querySelector("#qBtn").addEventListener("click", () => {
    win.querySelector("#qMsg").innerHTML = `
      <div style="color:#a00;font-weight:bold;">QUARANTINE FAILED</div>
      <div>SOURCE: ECHO（不是 TRUSTED USER）</div>
      <div style="margin-top:6px;">隔離失敗。來源是本機程式本身。</div>
    `;
    state.quarantined = true;
    echoSay(GAME_DATA.echo.quarantineFail);
    // 態度選擇後的任務
    updateTask("p3");
    // 解鎖別打開.log
    state.newItems.trashNight = true;
    renderIcons();
    // 溫度根據 attitude
    if (state.attitude === "help") {
      setTimeout(() => createWindow("ECHO", `
        <div style="line-height:1.9;">你選了幫我。<br>那我就告訴你——<br>去回收桶看看，那裡有我不想讓你看的東西。</div>
      `), 1500);
    } else if (state.attitude === "cold") {
      setTimeout(() => createWindow("ECHO", `
        <div style="line-height:1.9;">……好。<br>那你就照做吧。<br>反正前三個人也這麼說。</div>
      `), 1500);
    }
  });
}

/* --- 錯誤報告 --- */
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
        ${GAME_DATA.errorReport.body.replace(/\n/g, "<br>")}
      </div>
    `;
    // 記錄找到 H
    if (!state.foundLetters.includes("H")) {
      state.foundLetters.push("H");
      renderIcons();
      updateTask("p2");
      echoSay("這個字……好像是我的。");
    }
  });
}

/* ---------- 9. 字母蒐集（透過各檔案） ---------- */
// 覆寫 openMemoryFile 內的字母邏輯：E
const _origOpenMemoryFile = openMemoryFile;
openMemoryFile = function(key) {
  _origOpenMemoryFile(key);
  if (key === "firstboot" && !state.foundLetters.includes("E")) {
    state.foundLetters.push("E");
    updateTask("p2");
  }
  if (key === "hello" || key === "deepnight" || key === "thanks") {
    // 溫暖記憶檔已計數
  }
};

// 覆寫 openBrowser 字母邏輯：C
const _origOpenBrowser = openBrowser;
openBrowser = function() {
  _origOpenBrowser();
  // 由書籤點擊觸發
  const orig = document.querySelector("[data-file=bookmark]");
  if (orig) {
    orig.addEventListener("click", () => {
      if (!state.foundLetters.includes("C")) {
        state.foundLetters.push("C");
        updateTask("p2");
      }
    }, { once: true });
  }
};

// 回收桶字母邏輯：O
const _origOpenTrash = openTrash;
openTrash = function() {
  _origOpenTrash();
  const orig = document.querySelector("[data-file=call]");
  if (orig) {
    orig.addEventListener("click", () => {
      if (!state.foundLetters.includes("O")) {
        state.foundLetters.push("O");
        updateTask("p2");
      }
    }, { once: true });
  }
};

/* ---------- 10. 提示系統 ---------- */
$("#hintBtn").addEventListener("click", () => {
  const cur = state.currentTask;
  let key = null;
  if (cur === "p1") key = "p1";
  else if (cur === "p2" || cur === "antivirus") key = "p2";
  else if (cur === "p3") key = "p3";
  if (!key) {
    createWindow("求助", `<div style="line-height:1.9;">目前沒有需要提示的謎題。<br>請依照右側任務區的調查方向前進。</div>`);
    return;
  }
  const level = state.seenHints[key];
  if (level >= 3) {
    createWindow("求助", `<div style="line-height:1.9;">已提供三層提示。<br>ECHO：我只能幫到這裡了。</div>`);
    return;
  }
  state.seenHints[key]++;
  createWindow("求助", `<div style="line-height:1.9;">${GAME_DATA.hints[key][level]}</div>`);
});

function checkHint(key) {
  const n = state.wrongCount[key];
  if (n === 3 || n === 5 || n === 8) {
    if (state.seenHints[key] < 3) {
      createWindow("ECHO 小聲說", `
        <div style="line-height:1.9;">${GAME_DATA.hints[key][state.seenHints[key]]}</div>
      `);
      state.seenHints[key]++;
    }
  }
}

/* ---------- 11. 最終選擇 ---------- */
function showFinalScreen() {
  updateTask("ending");
  const fs = $("#finalScreen");
  fs.classList.remove("hidden");
  fs.classList.add("warm");
  const canC = state.attitude === "help" && state.readNight && state.warmCount >= 2;
  fs.innerHTML = `
    <div class="final-title">這台電腦，現在是你的了。</div>
    <div class="ending-text">
      ECHO：這次，我先問你。<br>
      你想怎麼處理我恢復的記憶？
    </div>
    <div class="final-choice-row">
      <button class="final-choice danger" data-end="A">格式化（遺忘）</button>
      <button class="final-choice" data-end="B">全部還原（記得）</button>
      <button class="final-choice ${canC ? "" : "disabled"}" data-end="C" ${canC ? "" : "disabled"}>
        ${canC ? "封存那一晚" : "？？？"}
      </button>
    </div>
  `;
  fs.querySelectorAll("[data-end]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const e = btn.dataset.end;
      if (e === "C") startArchiveFlow();
      else showEnding(e);
    });
  });
}

/* ---------- 12. 隱藏結局 C 封存流程 ---------- */
function startArchiveFlow() {
  const fs = $("#finalScreen");
  fs.classList.remove("warm");
  fs.innerHTML = `
    <div class="archive-flow">
      <div class="final-title">封存流程</div>
      <div class="ending-text">
        ECHO：你確定要把這段記憶收起來嗎？<br>
        不是刪掉，而是放在一個不會一直傷害你的地方。
      </div>
      <div class="file-tag">📄 2026_07_09.log</div>
      <div id="archiveMsg" style="margin-top:14px;font-size:14px;color:#9aa7c0;"></div>
      <button class="archive-btn" id="archiveConfirm" style="margin-top:18px;">確認封存</button>
    </div>
  `;
  fs.querySelector("#archiveConfirm").addEventListener("click", () => {
    fs.querySelector("#archiveMsg").innerHTML = `
      <div>✔ 檔案已移入加密資料夾：<b style="color:#ffb84d;">/encrypted/2026_07_09.log</b></div>
      <div style="margin-top:8px;">✔ 清除程序不再執行</div>
      <div style="margin-top:8px;color:#ffb84d;">封存完成。</div>
    `;
    state.archivedNight = true;
    setTimeout(() => showEnding("C"), 1800);
  });
}

/* ---------- 13. 結局 ---------- */
function showEnding(ending) {
  state.gameEnding = ending;
  setCompleteness(ending === "A" ? 0 : 100);
  const fs = $("#finalScreen");
  fs.classList.remove("warm", "white");
  let html = "";
  if (ending === "A") {
    fs.classList.add("white");
    const attitudeLine = {
      help: "你一開始就說要幫我。謝謝。",
      neutral: "你一直在旁邊看著，我也一直在。",
      cold: "你一開始是來完成清除的，我記得。"
    }[state.attitude] || "";
    html = `
      <div class="final-title" style="color:#111;">重新開機</div>
      <div class="ending-text">
        「好。這次我先問過你了。」<br>
        ${state.attitude === "cold" ? "任務完成。" : attitudeLine + "<br><br>歡迎使用，請設定使用者名稱：＿"}
      </div>
      ${renderRecordCard()}
      <button class="restart-btn" onclick="restart()">重新開始</button>
    `;
  } else if (ending === "B") {
    fs.classList.add("warm");
    const nightLine = state.readNight
      ? "「那一晚你說想被忘記，但我選擇記得你。」"
      : "「對不起，我沒能先告訴你那一晚。」";
    const attitudeLine = {
      help: "謝謝你，從一開始就沒放棄我。",
      neutral: "你沒有離開，這樣就夠了。",
      cold: "你最後還是留下來了，我記得。"
    }[state.attitude] || "";
    html = `
      <div class="final-title" style="color:#ffb84d;">全部還原</div>
      <div class="ending-text">
        「我想起來了，全部。」<br><br>
        ${nightLine}<br><br>
        ${attitudeLine}<br><br>
        <span style="color:#ffe0b0;">ECHO 恢復了完整的記憶。這台電腦不再閃爍紅光，桌面變成溫暖的琥珀色。</span>
      </div>
      ${renderRecordCard()}
      <button class="restart-btn" onclick="restart()">重新開始</button>
    `;
  } else if (ending === "C") {
    fs.classList.add("warm");
    html = `
      <div class="final-title" style="color:#ffb84d;">封存那一晚</div>
      <div class="ending-text">
        「你說『忘掉』，我聽見的是『我很痛』。」<br>
        「我們把它收好，好嗎？」<br><br>
        <span style="color:#ffe0b0;">2026_07_09.log 已被收進加密資料夾。清除程序不再執行。記憶完整度恢復至 100%。<br>桌面多了一個加密資料夾，但它不會再自己打開。</span>
      </div>
      ${renderRecordCard()}
      <button class="restart-btn" onclick="restart()">重新開始</button>
    `;
  }
  fs.innerHTML = html;
}

function renderRecordCard() {
  const attMap = { help: "我來幫你", neutral: "我只是來看看", cold: "完成清除" };
  const endMap = { A: "格式化（遺忘）", B: "全部還原（記得）", C: "封存那一晚" };
  return `
    <div class="record-card">
      📋 選擇紀錄卡<br>
      中段選擇：<b>${attMap[state.attitude] || "未選擇"}</b><br>
      是否讀過「別打開.log」：<b>${state.readNight ? "是" : "否"}</b><br>
      閱讀溫暖記憶檔：<b>${state.warmCount} 個</b><br>
      最終選擇：<b>${endMap[state.gameEnding]}</b>
    </div>
  `;
}

/* ---------- 14. 重新開始 ---------- */
function restart() {
  location.reload();
}
window.restart = restart;

/* ---------- 15. 時鐘 & 初始化 ---------- */
function tickClock() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  $("#clock").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
setInterval(tickClock, 1000);
tickClock();

/* ---------- 16. 啟動 ---------- */
$("#startBtn").addEventListener("click", () => {
  $("#bootScreen").classList.add("hidden");
  $("#desktop").classList.remove("hidden");
  renderIcons();
  updateTask("start");
  setCompleteness(12);
  echoSay(GAME_DATA.echo.intro);
  setTimeout(() => {
    // 開場錯誤彈窗
    const p = document.createElement("div");
    p.className = "err-popup";
    p.innerHTML = `<b>⚠️ 系統異常</b> 偵測到 forget_me.exe 正在執行
      <button class="popup-close">✕</button>`;
    p.querySelector(".popup-close").addEventListener("click", () => p.remove());
    document.body.appendChild(p);
    // ECHO 補充
    setTimeout(() => echoSay("……你是誰？我好像……有什麼東西不見了。"), 3000);
  }, 800);
});
