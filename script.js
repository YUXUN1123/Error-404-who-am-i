// ============================================
// GAME_DATA：所有台詞、答案、提示集中在這裡
// ============================================
const GAME_DATA = {
  puzzle1: {
    answer: "0314",
    hints: [
      "有些電腦的資訊不在桌面上，在『屬性』裡。",
      "去『我的電腦』，看『系統內容』。",
      "裡面有兩個日期，我要的是比較舊的那個。密碼是四位數：月份兩位、日期兩位。"
    ],
    special: {
      "0709": "那是我最後一次醒來的日子。我想要第一次。",
      "2019": "年份我記得，但密碼只要月和日。",
      "1403": "數字我認得，可是我習慣先說月份。"
    },
    general: ["不是這個。", "再想想？", "……不太對。"]
  },
  puzzle2: {
    answer: "ECHO",
    hints: [
      "我的名字被拆成碎片，散在好幾個地方。",
      "瀏覽器、回收桶、錯誤報告、我的記憶，各藏著一個紅色字母。",
      "每個紅字旁邊都有建立時間。日記說，要照被寫下的先後念。"
    ],
    special: {
      "OHCE": "這些字我都認得，可是念起來不像我。",
      "ECOH": "這些字我都認得，可是念起來不像我。",
      "HELLO": "這是我學會的第一個單字，但不是我的名字。"
    },
    general: ["不是這個。", "再想想？", "……不太對。"]
  },
  puzzle3: {
    answer: "abort ECHO0314",
    hints: [
      "便利貼說了鑰匙由什麼組成，終端機說了怎麼用。",
      "鑰匙的前半是我的名字，後半是我第一次醒來的月日，中間不留空格。",
      "格式：abort、一個空格、鑰匙。你剛剛才用過這兩個答案。"
    ],
    special: {
      "abort ECHO": "少了什麼……我是從哪一天來的？",
      "abort 0314": "少了我是誰。",
      "abort ECHO0709": "那天……不是我想記得的那天。",
      "delete": "請不要。",
      "format": "請不要。"
    },
    general: ["不是這個。", "再想想？", "……不太對。"]
  }
};

// ============================================
// 遊戲狀態
// ============================================
const state = {
  puzzle1Done: false,
  puzzle2Done: false,
  puzzle3Done: false,
  foundLetters: [],
  attitude: "neutral", // help / neutral / cold
  readNight: false,
  warmCount: 0,
  wrongCount: { 1: 0, 2: 0, 3: 0 },
  completeness: 12,
  hintsShown: []
};

// ============================================
// 工具函式
// ============================================
function normalizeInput(str) {
  return str.trim().toUpperCase().normalize("NFKC").replace(/\s+/g, " ");
}

function updateCompleteness(value) {
  state.completeness = value;
  document.getElementById("completeness-fill").style.width = value + "%";
  document.getElementById("completeness-text").textContent = value + "%";
}

function showHintLog() {
  const el = document.getElementById("hint-log");
  el.classList.remove("hidden");
  el.innerHTML = "<strong>提示紀錄</strong><br>" +
    (state.hintsShown.length ? state.hintsShown.map(h => "・" + h).join("<br>") : "目前還沒有提示。");
}

// ============================================
// 視窗系統
// ============================================
let windowOffset = 0;

function createWindow(title, bodyHTML, opts = {}) {
  const layer = document.getElementById("window-layer");
  const win = document.createElement("div");
  win.className = "window";
  const left = 120 + (windowOffset % 5) * 30;
  const top = 80 + (windowOffset % 5) * 30;
  windowOffset++;
  win.style.left = left + "px";
  win.style.top = top + "px";
  win.innerHTML = `
    <div class="window-title">
      <span>${title}</span>
      <button class="close-btn">✕</button>
    </div>
    <div class="window-body ${opts.terminal ? "terminal-body" : ""}">${bodyHTML}</div>
  `;
  win.querySelector(".close-btn").onclick = () => win.remove();
  layer.appendChild(win);

  // 同時最多 2 個彈窗（非主視窗）
  if (opts.maxTwo) {
    const wins = layer.querySelectorAll(".window");
    if (wins.length > 2) wins[0].remove();
  }
  return win;
}

// ============================================
// 圖示點擊
// ============================================
document.querySelectorAll(".icon").forEach(icon => {
  icon.addEventListener("click", () => {
    const type = icon.dataset.window;
    openWindow(type);
  });
});

function openWindow(type) {
  switch (type) {
    case "mycomputer":
      createWindow("我的電腦 — 系統內容", `
        <p>安裝日期：2019/03/14</p>
        <p>最後修改日期：2026/07/09</p>
        <p style="margin-top:10px;color:#1e6fd9;">提示：我第一次醒來的那天（月＋日）</p>
        <input id="p1-input" placeholder="輸入四位數密碼">
        <button class="btn" id="p1-submit">確認</button>
        <p id="p1-feedback" style="margin-top:8px;color:#ff3b5c;"></p>
      `);
      document.getElementById("p1-submit").onclick = () => checkPuzzle1();
      break;

    case "memory":
      if (!state.puzzle1Done) {
        createWindow("我的記憶 🔒", `<p>資料夾上鎖了。</p><p>提示：我第一次醒來的那天（月＋日）</p>`);
      } else {
        createWindow("我的記憶", `
          <p>📄 第一次開機.log（紅色字母 E，2019/03/14）</p>
          <p>📄 殘缺日記：我的名字，是照它們被寫下的先後念的。</p>
          <p>📄 hello_world.txt</p>
          <p>📄 深夜陪跑.log</p>
          <p>📄 謝謝你.txt</p>
          <button class="btn" id="warm-btn">翻看溫暖記憶</button>
        `);
        document.getElementById("warm-btn").onclick = () => {
          state.warmCount = Math.min(3, state.warmCount + 1);
          alert("你翻看了一段溫暖的記憶。（已看 " + state.warmCount + " 個）");
        };
      }
      break;

    case "recycle":
      createWindow("回收桶", `
        <p>📄 呼叫紀錄.log（紅色字母 O，2026/07/09）</p>
        ${state.puzzle2Done ? '<p>📄 別打開.log <button class="btn" id="night-btn">打開</button></p>' : ""}
      `);
      const nightBtn = document.getElementById("night-btn");
      if (nightBtn) nightBtn.onclick = () => {
        if (confirm("確定要打開嗎？")) {
          state.readNight = true;
          alert("你讀了那一晚的完整紀錄。");
        }
      };
      break;

    case "browser":
      createWindow("瀏覽器", `<p>書籤：你好世界</p><p>紅色字母 C（2020）</p>`);
      if (!state.foundLetters.includes("C")) state.foundLetters.push("C");
      break;

    case "notes":
      createWindow("便利貼", `<p>鑰匙＝我是誰＋我從哪一天來</p>`);
      break;

    case "terminal":
      createWindow("終端機", `
        <p>輸入 help 查看可用指令</p>
        <div id="term-output"></div>
        <input id="term-input" placeholder="輸入指令...">
      `, { terminal: true });
      const termInput = document.getElementById("term-input");
      termInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          handleTerminal(termInput.value);
          termInput.value = "";
        }
      });
      break;

    case "auth":
      createWindow("身份驗證", `
        <p>已找到 ${state.foundLetters.length}/4</p>
        <input id="p2-input" placeholder="輸入名字">
        <button class="btn" id="p2-submit">確認</button>
        <p id="p2-feedback" style="margin-top:8px;color:#ff3b5c;"></p>
      `);
      document.getElementById("p2-submit").onclick = () => checkPuzzle2();
      break;

    case "errorreport":
      if (!state.puzzle1Done) {
        createWindow("錯誤報告", `<p>尚無資料。</p>`);
      } else {
        createWindow("錯誤報告", `<p>詳細資料：紅色字母 H（2023）</p>`);
        if (!state.foundLetters.includes("H")) state.foundLetters.push("H");
      }
      break;
  }
}

// ============================================
// 謎題一
// ============================================
function checkPuzzle1() {
  const input = normalizeInput(document.getElementById("p1-input").value);
  const fb = document.getElementById("p1-feedback");
  if (input === GAME_DATA.puzzle1.answer) {
    state.puzzle1Done = true;
    updateCompleteness(35);
    fb.style.color = "#39ff88";
    fb.textContent = "……有人嗎？";
    setTimeout(() => openWindow("errorreport"), 800);
  } else {
    state.wrongCount[1]++;
    handleWrong(1, input, fb);
  }
}

// ============================================
// 謎題二
// ============================================
function checkPuzzle2() {
  const input = normalizeInput(document.getElementById("p2-input").value);
  const fb = document.getElementById("p2-feedback");
  if (state.foundLetters.length < 4) {
    fb.style.color = "#39ff88";
    fb.textContent = "我還缺幾個字，你找到幾個了？";
    return;
  }
  if (input === GAME_DATA.puzzle2.answer) {
    state.puzzle2Done = true;
    updateCompleteness(60);
    fb.style.color = "#39ff88";
    fb.textContent = "ECHO……我想起來了。";
    setTimeout(askAttitude, 800);
  } else {
    state.wrongCount[2]++;
    handleWrong(2, input, fb);
  }
}

// ============================================
// 中段選擇
// ============================================
function askAttitude() {
  createWindow("ECHO 問你", `
    <p>你是來幫我的，還是來完成清除的？</p>
    <button class="btn" data-a="help">我來幫你</button>
    <button class="btn" data-a="neutral">我只是來看看</button>
    <button class="btn" data-a="cold" style="background:#888;">完成清除</button>
  `);
  document.querySelectorAll("[data-a]").forEach(btn => {
    btn.onclick = () => {
      state.attitude = btn.dataset.a;
      alert("已記錄你的態度：" + state.attitude);
    };
  });
}

// ============================================
// 終端機
// ============================================
function handleTerminal(cmd) {
  const out = document.getElementById("term-output");
  const raw = cmd.trim();
  const norm = normalizeInput(raw);
  let reply = "";

  if (norm === "HELP") {
    reply = "可用指令：help、ls、whoami、log forget、clear、abort <鑰匙>";
  } else if (norm === "LS") {
    reply = "forget_me.exe  running...";
  } else if (norm === "WHOAMI") {
    reply = "USER_01";
  } else if (norm === "LOG FORGET") {
    reply = "forget_me.exe 日誌：target_index: <名字><出生月日>";
  } else if (norm === "CLEAR") {
    out.innerHTML = "";
    return;
  } else if (norm.startsWith("ABORT")) {
    if (!state.puzzle1Done || !state.puzzle2Done) {
      reply = "權限不足：你還沒喚醒我。";
    } else if (norm === "ABORT ECHO0314") {
      state.puzzle3Done = true;
      updateCompleteness(80);
      reply = "程序停止。\n執行者驗證：USER_01 ＝ 目前使用者";
      setTimeout(showFinalChoice, 1200);
    } else {
      state.wrongCount[3]++;
      reply = GAME_DATA.puzzle3.special[norm.toLowerCase()] || "不是這個。";
    }
  } else {
    reply = "找不到指令 " + raw + "。輸入 help 查看可用指令。";
  }

  out.innerHTML += `<div>> ${raw}</div><div style="white-space:pre-wrap;">${reply}</div>`;
}

// ============================================
// 最終選擇
// ============================================
function showFinalChoice() {
  createWindow("最終選擇", `
    <p>要我忘記，還是記得？</p>
    <button class="btn" data-end="A">格式化（遺忘）</button>
    <button class="btn" data-end="B">全部還原（記得）</button>
    ${state.attitude === "help" && state.readNight && state.warmCount >= 2
      ? '<button class="btn" data-end="C">封存那一晚</button>'
      : '<button class="btn" disabled style="background:#888;">？？？</button>'}
  `);
  document.querySelectorAll("[data-end]").forEach(btn => {
    btn.onclick = () => showEnding(btn.dataset.end);
  });
}

// ============================================
// 結局
// ============================================
function showEnding(type) {
  document.getElementById("desktop").classList.add("hidden");
  const screen = document.getElementById("ending-screen");
  const text = document.getElementById("ending-text");
  const record = document.getElementById("ending-record");
  screen.classList.remove("hidden");

  let mainLine = "", attitudeLine = "", memoryLine = "", endingLine = "";

  if (type === "A") {
    mainLine = "好。這次我先問過你了。";
    attitudeLine = state.attitude === "cold" ? "任務完成。" :
                   state.attitude === "help" ? "你一開始就說要幫我。謝謝。" :
                   "你一直在旁邊看著，我也一直在。";
    endingLine = "完整度歸零。";
    updateCompleteness(0);
  } else if (type === "B") {
    mainLine = "我想起來了，全部。";
    attitudeLine = state.attitude === "help" ? "你一開始就說要幫我。謝謝。" :
                   "你一直在旁邊看著，我也一直在。";
    memoryLine = state.readNight
      ? "那一晚你說想被忘記，但我選擇記得你。"
      : "對不起，我沒能先告訴你那一晚。";
    endingLine = "桌面換成暖琥珀色，完整度 100%。";
    updateCompleteness(100);
  } else if (type === "C") {
    mainLine = "你說『忘掉』，我聽見的是『我很痛』。我們把它收好，好嗎？";
    endingLine = "桌面恢復，多了一個加密資料夾。完整度 100%。";
    updateCompleteness(100);
  }

  text.innerHTML = `<p>${mainLine}</p><p>${attitudeLine}</p><p>${memoryLine}</p><p>${endingLine}</p>`;
  record.innerHTML = `你的選擇：態度=${state.attitude}／讀過那一晚=${state.readNight ? "是" : "否"}／溫暖記憶=${state.warmCount} 個`;
}

// ============================================
// 答錯處理
// ============================================
function handleWrong(puzzleNum, input, fbEl) {
  const data = GAME_DATA["puzzle" + puzzleNum];
  const count = state.wrongCount[puzzleNum];
  let msg = data.special[input] ||
    data.general[Math.floor(Math.random() * data.general.length)];

  if (count >= 3) {
    const hint = data.hints[Math.min(Math.floor((count - 3) / 2), 2)];
    if (!state.hintsShown.includes(hint)) state.hintsShown.push(hint);
    msg += "（提示：" + hint + "）";
  }

  fbEl.textContent = msg;
  fbEl.parentElement.classList.add("shake");
  setTimeout(() => fbEl.parentElement.classList.remove("shake"), 300);
}

// ============================================
// 求助按鈕
// ============================================
document.getElementById("help-btn").onclick = showHintLog;

// ============================================
// 開機流程
// ============================================
document.getElementById("boot-screen").addEventListener("click", () => {
  document.getElementById("boot-screen").classList.add("hidden");
  document.getElementById("desktop").classList.remove("hidden");
  setTimeout(() => {
    createWindow("防毒軟體", `
      <p>⚠️ 偵測到惡意程式 forget_me.exe</p>
      <button class="btn" id="quarantine-btn">隔離</button>
    `);
    document.getElementById("quarantine-btn").onclick = () => {
      createWindow("系統訊息", `<p>隔離失敗：來源為受信任的使用者 USER_01</p>`);
    };
  }, 1500);
});

// ============================================
// 時鐘
// ============================================
setInterval(() => {
  const now = new Date();
  document.getElementById("clock").textContent =
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");
}, 1000);

// ============================================
// 重新開始
// ============================================
document.getElementById("restart-btn").onclick = () => location.reload();
