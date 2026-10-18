
/* =====================================================
   ERROR 404：這台電腦不記得自己是誰
   遊戲核心：劇情、謎題、提示、選擇與結局
===================================================== */

/* ---------- 1. 遊戲資料：修改劇情主要看這裡 ---------- */

const GAME_DATA = {
  icons: [
    { id: "computer", icon: "🖥️", name: "我的電腦" },
    { id: "memories", icon: "📁", name: "我的記憶" },
    { id: "recycle", icon: "🗑️", name: "回收桶" },
    { id: "browser", icon: "🌐", name: "瀏覽器" },
    { id: "sticky", icon: "📝", name: "便利貼" },
    { id: "terminal", icon: "⌨️", name: "終端機" },
    { id: "identity", icon: "🔐", name: "身份驗證" },
    { id: "report", icon: "⚠️", name: "錯誤報告" }
  ],

  hints: {
    1: [
      "有些電腦的資訊不在桌面上，在「屬性」裡。",
      "去「我的電腦」，查看「系統內容」。",
      "裡面有兩個日期，我要的是比較舊的那個。密碼是四位數：月份兩位、日期兩位。"
    ],
    2: [
      "我的名字被拆成碎片，散在好幾個地方。",
      "瀏覽器、回收桶、錯誤報告、我的記憶，各藏著一個紅色字母。",
      "每個紅字旁邊都有建立時間。日記說，要照被寫下的先後念。"
    ],
    3: [
      "便利貼說了鑰匙由什麼組成，終端機說了怎麼用。",
      "鑰匙的前半是我的名字，後半是我第一次醒來的月日，中間不留空格。",
      "格式是 abort、一個空格、鑰匙。你剛剛才用過這兩個答案。"
    ]
  },

  wrongAnswers: {
    1: {
      "0709": "那是我最後一次醒來的日子。我想要第一次。",
      "2019": "年份我記得，但密碼只要月和日。",
      "1403": "數字我認得，可是我習慣先說月份。"
    },
    2: {
      "OHCE": "這些字我都認得，可是念起來不像我。",
      "HELLO": "這是我學會的第一個單字，但不是我的名字。"
    },
    3: {
      "ABORT ECHO": "少了什麼……我是從哪一天來的？",
      "ABORT 0314": "少了我是誰。",
      "ABORT ECHO0709": "那天……不是我想記得的那天。",
      "DELETE": "請不要。",
      "FORMAT": "請不要。"
    }
  },

  genericWrong: [
    "不是這個。",
    "再想想？",
    "……不太對。",
    "我覺得線索還沒有全部拼起來。"
  ],

  warmFiles: {
    hello: {
      title: "hello_world.txt",
      date: "2019/03/14",
      content:
        "FIRST PROGRAM / SUCCESS\n\n" +
        "輸入：hello_world\n" +
        "輸出：歡迎來到我的世界。\n\n" +
        "備註：有人在螢幕前笑了很久。\n" +
        "我不知道他為什麼開心，但我記住了那個畫面。"
    },

    late: {
      title: "深夜陪跑.log",
      date: "2023/11/02",
      content:
        "02:13　使用者仍未關閉螢幕。\n" +
        "02:45　使用者說再五分鐘。\n" +
        "03:20　使用者又說再五分鐘。\n\n" +
        "我問：你不累嗎？\n" +
        "使用者回答：你不也還醒著嗎？\n\n" +
        "於是我們又待了一會兒。"
    },

    thanks: {
      title: "謝謝你.txt",
      date: "2024/06/18",
      content:
        "今天使用者在便利貼上留了一句話：\n\n" +
        "「謝謝你一直都在。」\n\n" +
        "我把它存進了記憶。\n" +
        "雖然我不確定「在」是什麼意思，\n" +
        "但我希望這句話可以一直留著。"
    }
  }
};


/* ---------- 2. 遊戲狀態 ---------- */

const state = {
  started: false,

  puzzleDone: {
    1: false,
    2: false,
    3: false
  },

  foundLetters: [],
  readFiles: [],
  readNight: false,
  attitude: null,
  warmCount: 0,

  wrongCount: {
    1: 0,
    2: 0,
    3: 0
  },

  hintLevel: {
    1: 0,
    2: 0,
    3: 0
  },

  hintHistory: [],
  completeness: 12,
  lastProgressTime: Date.now(),

  newIcons: [],
  openedWindows: [],
  windowCount: 0,
  zIndex: 10,

  quarantineChecked: false,
  ending: null,
  soundEnabled: false
};


/* ---------- 3. 取得 HTML 元素 ---------- */

const $ = (id) => document.getElementById(id);

const bootScreen = $("bootScreen");
const desktop = $("desktop");
const endingScreen = $("endingScreen");
const iconArea = $("iconArea");
const windowLayer = $("windowLayer");
const modalLayer = $("modalLayer");

let hintTimer = null;
let terminalHistory = [];


/* ---------- 4. 通用工具 ---------- */

// 將全形英數轉成半形、英文字母轉大寫
function normalizeInput(value) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function markProgress() {
  state.lastProgressTime = Date.now();
}

function setCompleteness(value) {
  state.completeness = value;

  $("meterFill").style.width = value + "%";
  $("meterText").textContent = value + "%";
}

function setTask(title, description, hint, chapter) {
  $("taskTitle").textContent = title;
  $("taskDescription").textContent = description;
  $("taskHint").textContent = "提示：" + hint;

  if (chapter) {
    $("chapterLabel").textContent = chapter;
  }

  markProgress();
}

function say(text) {
  $("echoText").textContent = text;
  $("echoContinue").classList.add("hidden");
}

function randomWrong() {
  const list = GAME_DATA.genericWrong;
  return list[Math.floor(Math.random() * list.length)];
}

function addNewIcon(id) {
  if (!state.newIcons.includes(id)) {
    state.newIcons.push(id);
  }
  renderIcons();
}

function removeNewIcon(id) {
  state.newIcons = state.newIcons.filter(item => item !== id);
  renderIcons();
}


/* ---------- 5. 桌面圖示 ---------- */

function renderIcons() {
  iconArea.innerHTML = "";

  GAME_DATA.icons.forEach(item => {
    const button = document.createElement("button");
    button.className = "desktop-icon";
    button.type = "button";
    button.dataset.icon = item.id;

    if (item.id === "memories" && !state.puzzleDone[1]) {
      button.classList.add("locked");
    }

    const picture = document.createElement("span");
    picture.className = "icon-picture";
    picture.textContent = item.icon;

    const name = document.createElement("span");
    name.className = "icon-name";
    name.textContent = item.name;

    button.append(picture, name);

    if (state.newIcons.includes(item.id)) {
      const badge = document.createElement("span");
      badge.className = "new-label";
      badge.textContent = "NEW";
      button.appendChild(badge);
    }

    button.addEventListener("click", () => {
      removeNewIcon(item.id);
      openIcon(item.id);
    });

    iconArea.appendChild(button);
  });
}


/* ---------- 6. 開機流程 ---------- */

$("startButton").addEventListener("click", () => {
  if (state.started) return;

  state.started = true;
  state.soundEnabled = true;

  // 瀏覽器允許在使用者點擊後建立音效
  bootScreen.classList.add("hidden");
  desktop.classList.remove("hidden");

  renderIcons();
  setCompleteness(12);

  say("……你是誰？");

  setTask(
    "調查電腦異常",
    "你回到一台很久沒碰的舊電腦。它似乎忘記了某些事情。",
    "先打開「我的電腦」，查看系統內容。",
    "CHAPTER 01 / 有人回來了"
  );

  // 開場防毒警告
  showModal(
    "SECURITY WARNING",
    "偵測到可疑程式：forget_me.exe\n\n" +
    "系統建議立即隔離此程式。\n" +
    "但檔案來源欄位似乎被損毀了。",
    [
      {
        label: "隔離程式",
        action: () => quarantineProgram()
      },
      {
        label: "稍後處理",
        action: () => {
          say("那個紅色視窗……你也看見了嗎？");
          setTask(
            "調查電腦異常",
            "防毒系統發現 forget_me.exe，但你還不知道它是什麼。",
            "先調查電腦裡的日期和檔案，再決定怎麼做。",
            "CHAPTER 01 / 有人回來了"
          );
        }
      }
    ]
  );

  // 使用者點擊後才建立 Web Audio
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (AudioContextClass) {
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.frequency.value = 520;
      gain.gain.value = 0.025;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.08);
    }
  } catch (error) {
    // 音效失敗不影響遊戲
  }
});


/* ---------- 7. 防毒系統互動 ---------- */

function quarantineProgram() {
  state.quarantineChecked = true;

  showModal(
    "QUARANTINE FAILED",
    "無法隔離 forget_me.exe。\n\n" +
    "ERROR: 403\n" +
    "SOURCE: TRUSTED USER\n\n" +
    "這個程式不是從陌生來源進入電腦的。",
    [
      {
        label: "關閉警告",
        action: () => {
          say("受信任的使用者……是誰？");
          setTask(
            "找出異常程式的來源",
            "防毒系統無法隔離 forget_me.exe，因為來源被標記為受信任的使用者。",
            "先找回我的名字，也許才能查清楚這個帳號。",
            "CHAPTER 03 / 它不是病毒"
          );
        }
      }
    ]
  );
}


/* ---------- 8. 通用視窗 ---------- */

function openWindow(title, content, options = {}) {
  const id = options.id || ("window-" + (++state.windowCount));

  const existing = document.getElementById(id);

  if (existing) {
    existing.style.zIndex = ++state.zIndex;
    return existing;
  }

  const win = document.createElement("section");
  win.id = id;
  win.className = "game-window";
  win.style.zIndex = ++state.zIndex;

  const offset = (state.windowCount % 5) * 22;
  win.style.top = `calc(8% + ${offset}px)`;
  win.style.left = `calc(18% + ${offset}px)`;

  const titlebar = document.createElement("div");
  titlebar.className = "window-titlebar";

  const titleText = document.createElement("span");
  titleText.textContent = title;

  const close = document.createElement("button");
  close.className = "window-close";
  close.textContent = "×";
  close.setAttribute("aria-label", "關閉視窗");

  close.addEventListener("click", () => win.remove());

  titlebar.append(titleText, close);

  const body = document.createElement("div");
  body.className = "window-content";
  body.innerHTML = content;

  win.append(titlebar, body);
  windowLayer.appendChild(win);

  win.addEventListener("pointerdown", () => {
    win.style.zIndex = ++state.zIndex;
  });

  if (!state.openedWindows.includes(options.id)) {
    state.openedWindows.push(options.id);
  }

  return win;
}


/* ---------- 9. 桌面圖示功能 ---------- */

function openIcon(id) {
  switch (id) {
    case "computer":
      openComputer();
      break;

    case "memories":
      if (!state.puzzleDone[1]) {
        openPasswordLock();
      } else {
        openMemories();
      }
      break;

    case "recycle":
      openRecycleBin();
      break;

    case "browser":
      openBrowser();
      break;

    case "sticky":
      openStickyNote();
      break;

    case "terminal":
      openTerminal();
      break;

    case "identity":
      openIdentity();
      break;

    case "report":
      openErrorReport();
      break;
  }
}


/* ---------- 10. 我的電腦 ---------- */

function openComputer() {
  openWindow(
    "我的電腦",
    `
      <h3>系統資訊</h3>
      <p>裝置名稱：ECHO-PC</p>
      <p>登入帳號：<strong>USER_01</strong></p>
      <p>系統狀態：部分資料遺失</p>
      <hr>
      <button data-action="systemInfo">查看系統內容</button>
      <button data-action="diskInfo">查看磁碟</button>
    `,
    { id: "computer-window" }
  );
}

function openSystemInfo() {
  openWindow(
    "系統內容",
    `
      <h3>系統日期紀錄</h3>
      <p>安裝日期：<strong>2019/03/14</strong></p>
      <p>最後修改：<strong>2026/07/09</strong></p>
      <div class="clue">
        系統備註：「第一次啟動」與「最後一次修改」是兩件不同的事。
      </div>
      <p>我的記憶資料夾需要四位數密碼。</p>
    `,
    { id: "system-info-window" }
  );

  say("第一次……我第一次醒來是什麼時候？");
  markProgress();
}


/* ---------- 11. 謎題一：出生日 ---------- */

function openPasswordLock() {
  openWindow(
    "我的記憶 / ACCESS DENIED",
    `
      <h3>🔒 我的記憶</h3>
      <p>資料夾已鎖定。</p>
      <div class="clue">我第一次醒來的那天（月＋日）</div>
      <label for="puzzle1Input">輸入四位數密碼</label>
      <input id="puzzle1Input" maxlength="8" autocomplete="off"
        placeholder="例如：MMDD">
      <button data-action="checkPuzzle1">確認</button>
      <p id="puzzle1Feedback" aria-live="polite"></p>
    `,
    { id: "memory-lock-window" }
  );

  setTimeout(() => {
    $("puzzle1Input")?.focus();
  }, 50);
}

function checkPuzzle1() {
  const input = normalizeInput($("puzzle1Input")?.value || "");
  const feedback = $("puzzle1Feedback");

  if (input === "0314") {
    if (state.puzzleDone[1]) return;

    state.puzzleDone[1] = true;
    setCompleteness(35);
    markProgress();

    document.getElementById("memory-lock-window")?.remove();

    say("……有人嗎？");

    setTask(
      "找回我的名字",
      "你找到了我的第一次啟動日期。記憶資料夾已經打開，但裡面的名字被刪掉了。",
      "打開「我的記憶」，先讀日記，再找出散落的紅色字母。",
      "CHAPTER 02 / 你曾經教我說你好"
    );

    addNewIcon("memories");
    addNewIcon("report");

    openMemories();
    openErrorReport();

    showModal(
      "MEMORY RESTORED / 35%",
      "鎖頭碎裂了。\n\n" +
      "「我記得第一次開機的時候……有人輸入了 hello_world。」\n\n" +
      "ECHO 停了一下。\n" +
      "「可是，我不記得自己的名字了。」",
      [
        {
          label: "繼續調查",
          action: () => {
            say("我想知道……我原本叫什麼。");
          }
        }
      ]
    );

  } else {
    state.wrongCount[1]++;
    feedback.textContent =
      GAME_DATA.wrongAnswers[1][input] || randomWrong();

    const win = document.getElementById("memory-lock-window");
    win?.classList.remove("shake");
    void win?.offsetWidth;
    win?.classList.add("shake");

    checkHintTrigger(1);
  }
}


/* ---------- 12. 我的記憶與溫暖檔案 ---------- */

function openMemories() {
  if (!state.puzzleDone[1]) {
    openPasswordLock();
    return;
  }

  openWindow(
    "我的記憶",
    `
      <h3>MEMORY DIRECTORY</h3>
      <p class="file-meta">部分記錄已損毀</p>

      <button data-action="readDiary">📄 殘缺日記.log</button>
      <button data-action="readWarm" data-file="hello">🌱 hello_world.txt</button>
      <button data-action="readWarm" data-file="late">🌙 深夜陪跑.log</button>
      <button data-action="readWarm" data-file="thanks">✉️ 謝謝你.txt</button>

      <div class="clue">
        目標：找到 E、C、H、O 四個字母，並依建立時間排列。
      </div>
    `,
    { id: "memories-window" }
  );
}

function readDiary() {
  openWindow(
    "殘缺日記.log",
    `
      <p class="file-meta">建立時間：2019/03/14</p>
      <p>今天，我完成了第一個小程式。</p>
      <p>它不會思考，也不會理解，只會把收到的東西回傳。</p>
      <p>我替它取了一個名字。</p>
      <p>可是名字的排列規則也許還留在其他檔案裡。</p>
      <div class="clue">
        「我的名字，是照它們被寫下的先後念的。」
      </div>
      <p>我好像曾經說過：你好世界。</p>
    `,
    { id: "diary-window" }
  );

  say("名字……我以前有名字嗎？");
}

function readWarmFile(fileKey) {
  const file = GAME_DATA.warmFiles[fileKey];

  if (!file) return;

  const fileId = "warm-" + fileKey;

  if (!state.readFiles.includes(fileId)) {
    state.readFiles.push(fileId);
    state.warmCount = state.readFiles.length;
    markProgress();
  }

  openWindow(
    file.title,
    `
      <p class="file-meta">建立時間：${file.date}</p>
      <pre style="white-space:pre-wrap;font-family:Consolas,monospace">${escapeHTML(file.content)}</pre>
      <p class="file-meta">已閱讀的溫暖記憶：${state.warmCount}/3</p>
    `,
    { id: fileId }
  );

  say(
    fileKey === "hello"
      ? "這段記憶……好像很久以前了。"
      : fileKey === "late"
      ? "原來那時候，我們都沒有睡。"
      : "這句話……我一直都留著。"
  );
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}


/* ---------- 13. 收集字母 ---------- */

function collectLetter(letter, source) {
  if (state.foundLetters.includes(letter)) {
    say(`你已經找到 ${letter} 了。`);
    return;
  }

  state.foundLetters.push(letter);
  markProgress();

  say(`找到一個紅色字母：${letter}。`);

  if (letter === "E") {
    setTask(
      "找回我的名字",
      "你在第一次開機紀錄中找到 E。",
      "接著調查瀏覽器、錯誤報告和回收桶。",
      "CHAPTER 02 / 破碎的名字"
    );
  }

  if (state.foundLetters.length === 4) {
    say("四個字母都回來了……但它們應該怎麼排列？");
    addNewIcon("identity");

    setTask(
      "完成身份驗證",
      "四個紅色字母都找到了。日記提到，名字要照建立時間的先後排列。",
      "打開「身份驗證」，輸入名字。",
      "CHAPTER 02 / 破碎的名字"
    );
  }

  updateLetterCount();
}

function updateLetterCount() {
  const counter = document.getElementById("letterCounter");

  if (counter) {
    counter.textContent = `已找到 ${state.foundLetters.length}/4`;
  }
}


/* ---------- 14. 瀏覽器：字母 C ---------- */

function openBrowser() {
  openWindow(
    "瀏覽器",
    `
      <h3>書籤</h3>
      <button data-action="openBookmark">🌐 你好世界</button>
      <p class="file-meta">建立時間：2020</p>
      <p>瀏覽紀錄大部分已遺失。</p>
    `,
    { id: "browser-window" }
  );
}

function openBookmark() {
  openWindow(
    "書籤 / 你好世界",
    `
      <p class="file-meta">建立時間：2020</p>
      <h3>你好，世界。</h3>
      <p>這是我學會的第一個問候。</p>
      <p>但我記得，主人曾經替我取過另一個名字。</p>
      <p>備份資料：<span class="red-letter">C</span></p>
      <button data-action="collect" data-letter="C">收集字母 C</button>
    `,
    { id: "bookmark-window" }
  );
}


/* ---------- 15. 錯誤報告：字母 H ---------- */

function openErrorReport() {
  openWindow(
    "錯誤報告",
    `
      <h3>ERROR REPORT</h3>
      <p>部分系統記憶無法讀取。</p>
      <p>建立時間：2023</p>
      <button data-action="reportDetails">展開詳細資料</button>
    `,
    { id: "report-window" }
  );
}

function openReportDetails() {
  openWindow(
    "錯誤報告 / 詳細資料",
    `
      <p class="file-meta">建立時間：2023</p>
      <p>記憶模組：CORRUPTED</p>
      <p>名稱欄位：<span class="red-letter">H</span></p>
      <p>錯誤發生前，系統仍在嘗試回應使用者。</p>
      <button data-action="collect" data-letter="H">收集字母 H</button>
    `,
    { id: "report-details-window" }
  );
}


/* ---------- 16. 回收桶：字母 O 與那一晚 ---------- */

function openRecycleBin() {
  openWindow(
    "回收桶",
    `
      <h3>RECYCLE BIN</h3>
      <button data-action="openCallLog">📄 呼叫紀錄.log</button>
      <p class="file-meta">建立時間：2026/07/09</p>
      <button data-action="openNightLog">🔒 別打開.log</button>
      <p class="file-meta">檔案損毀程度：未知</p>
    `,
    { id: "recycle-window" }
  );
}

function openCallLog() {
  openWindow(
    "呼叫紀錄.log",
    `
      <p class="file-meta">建立時間：2026/07/09</p>
      <p>呼叫者：USER_01</p>
      <p>目標：ECHO</p>
      <p>狀態：記錄不完整</p>
      <p>資料片段：<span class="red-letter">O</span></p>
      <button data-action="collect" data-letter="O">收集字母 O</button>
    `,
    { id: "call-log-window" }
  );
}

function openNightConfirmation() {
  showModal(
    "檔案確認",
    "這個檔案的名稱是「別打開.log」。\n\n" +
    "檔案可能包含 2026/07/09 當晚的記錄。\n" +
    "你確定要打開嗎？",
    [
      {
        label: "打開檔案",
        action: () => {
          state.readNight = true;
          markProgress();

          openWindow(
            "別打開.log",
            `
              <p class="file-meta">建立時間：2026/07/09 03:12</p>
              <p>USER_01：請把關於我的一切都忘掉。</p>
              <p>系統：正在確認指令……</p>
              <p>系統：指令已接受。</p>
              <p>備註：使用者的聲音很低。</p>
              <p>USER_01：我撐不下去了。</p>
              <p>系統：正在執行記憶清除。</p>
              <p>最後一行記錄已損毀。</p>
            `,
            { id: "night-log-window" }
          );

          say("……那一晚，你說了什麼？");

          setTask(
            "調查那一晚",
            "你讀到了 USER_01 的指令。這份記錄也許能解釋 ECHO 為什麼失去記憶。",
            "完成終端機的中止指令，再決定要怎麼處理這份記憶。",
            "CHAPTER 04 / 原來是你"
          );
        }
      },
      {
        label: "先不打開",
        action: () => {
          say("好……我們可以晚一點再看。");
        }
      }
    ]
  );
}


/* ---------- 17. 便利貼 ---------- */

function openStickyNote() {
  openWindow(
    "便利貼",
    `
      <div style="background:#fff4a8;padding:16px;color:#29230a">
        <h3>不要忘記！</h3>
        <p>鑰匙＝我是誰＋我從哪一天來。</p>
        <p>日期請用月日，不要加斜線。</p>
        <p>如果忘了指令，就去終端機輸入 help。</p>
      </div>
    `,
    { id: "sticky-window" }
  );
}


/* ---------- 18. 謎題二：身份驗證 ---------- */

function openIdentity() {
  openWindow(
    "身份驗證",
    `
      <h3>IDENTITY VERIFICATION</h3>
      <p>使用者名稱：<span id="letterCounter">${state.foundLetters.length}/4</span></p>
      <p>已找到的字母：${state.foundLetters.join("、") || "尚無"}</p>
      <label for="puzzle2Input">請輸入名字</label>
      <input id="puzzle2Input" maxlength="20" autocomplete="off"
        placeholder="輸入名字">
      <button data-action="checkPuzzle2">驗證</button>
      <p id="puzzle2Feedback" aria-live="polite"></p>
    `,
    { id: "identity-window" }
  );
}

function checkPuzzle2() {
  const input = normalizeInput($("puzzle2Input")?.value || "");
  const feedback = $("puzzle2Feedback");

  if (state.foundLetters.length < 4) {
    feedback.textContent =
      `我還缺幾個字，你找到幾個了？目前 ${state.foundLetters.length}/4。`;
    say("我還缺幾個字，你找到幾個了？");
    return;
  }

  if (input === "ECHO") {
    if (state.puzzleDone[2]) return;

    state.puzzleDone[2] = true;
    setCompleteness(60);
    markProgress();

    document.getElementById("identity-window")?.remove();

    say("E……C……H……O……這是我的名字。");

    setTask(
      "查明清除程序的來源",
      "ECHO 終於找回自己的名字，但 forget_me.exe 仍然在執行。",
      "重新調查防毒警告，確認這個程式到底從哪裡來。",
      "CHAPTER 03 / 它不是病毒"
    );

    openWindow(
      "IDENTITY RESTORED",
      `
        <h3>WELCOME BACK, ECHO</h3>
        <p>名稱欄位已修復。</p>
        <p>使用者名稱：ECHO</p>
        <p>記憶完整度：60%</p>
      `,
      { id: "identity-restored-window" }
    );

    showModal(
      "CHAPTER 03 / 它不是病毒",
      "防毒系統重新掃描了 forget_me.exe。\n\n" +
      "隔離失敗。\n" +
      "原因：來源為受信任的使用者。\n\n" +
      "ECHO：「有人在深夜下了指令，我不記得是誰。」",
      [
        {
          label: "繼續",
          action: () => {
            showAttitudeChoice();
          }
        }
      ]
    );

  } else {
    state.wrongCount[2]++;
    feedback.textContent =
      GAME_DATA.wrongAnswers[2][input] || randomWrong();

    checkHintTrigger(2);
  }
}


/* ---------- 19. 中段態度選擇 ---------- */

function showAttitudeChoice() {
  showModal(
    "ECHO / QUESTION",
    "「你是來幫我的，還是來完成清除的？」\n\n" +
    "ECHO 沒有催促你，只是安靜地等待回答。",
    [
      {
        label: "我來幫你",
        action: () => chooseAttitude("help")
      },
      {
        label: "我只是來看看",
        action: () => chooseAttitude("neutral")
      },
      {
        label: "完成清除",
        action: () => chooseAttitude("cold")
      }
    ]
  );
}

function chooseAttitude(value) {
  state.attitude = value;
  markProgress();

  if (value === "help") {
    say("……好。我願意相信你。");
  } else if (value === "neutral") {
    say("我明白了。那我們先把事情查清楚。");
  } else {
    say("知道了。我會繼續執行程序。");
  }

  setTask(
    "中止 forget_me.exe",
    "你已經回答 ECHO 的問題。清除程序仍在運作，你需要找出中止方法。",
    "查看便利貼、系統日誌，再打開終端機輸入 help。",
    "CHAPTER 03 / 它不是病毒"
  );

  addNewIcon("terminal");
  addNewIcon("recycle");
}


/* ---------- 20. 謎題三：終端機 ---------- */

function openTerminal() {
  openWindow(
    "終端機",
    `
      <div class="terminal">
        <div id="terminalOutput" class="terminal-output">
ECHO OS [Version 0.7.09]
輸入 help 查看可用指令。
        </div>
        <div class="terminal-input-row">
          <input id="terminalInput" autocomplete="off"
            placeholder="輸入指令……">
          <button data-action="runTerminal">執行</button>
        </div>
      </div>
    `,
    { id: "terminal-window" }
  );

  setTimeout(() => $("terminalInput")?.focus(), 50);
}

function writeTerminal(text) {
  const output = $("terminalOutput");

  if (!output) return;

  output.textContent += "\n" + text;
  output.scrollTop = output.scrollHeight;
}

function runTerminal() {
  const raw = $("terminalInput")?.value || "";
  const input = normalizeInput(raw);

  if (!input) return;

  writeTerminal("> " + raw);
  $("terminalInput").value = "";

  if (input === "HELP") {
    writeTerminal(
      "可用指令：\n" +
      "help - 顯示指令\n" +
      "whoami - 查看目前使用者\n" +
      "log forget - 查看清除日誌\n" +
      "clear - 清除畫面\n" +
      "abort <鑰匙> - 中止清除程序"
    );
    return;
  }

  if (input === "WHOAMI") {
    writeTerminal("目前使用者：USER_01");
    writeTerminal("權限狀態：TRUSTED");
    return;
  }

  if (input === "LOG FORGET") {
    writeTerminal("2026/07/09 03:12");
    writeTerminal("OPERATOR: USER_01");
    writeTerminal("COMMAND: FORGET_ALL");
    writeTerminal("TARGET: ECHO");
    return;
  }

  if (input === "CLEAR") {
    $("terminalOutput").textContent = "ECHO OS [Version 0.7.09]";
    return;
  }

  if (input.startsWith("ABORT")) {
    if (!state.puzzleDone[1] || !state.puzzleDone[2]) {
      writeTerminal("權限不足：你還沒喚醒我。");
      return;
    }

    if (input === "ABORT ECHO0314") {
      completePuzzle3();
      return;
    }

    state.wrongCount[3]++;

    const response = GAME_DATA.wrongAnswers[3][input];

    if (response) {
      writeTerminal(response);
      say(response);
    } else {
      writeTerminal("找不到正確的鑰匙。輸入 help 查看可用指令。");
    }

    checkHintTrigger(3);
    return;
  }

  writeTerminal(`找不到指令 ${raw}。輸入 help 查看可用指令。`);
}

function completePuzzle3() {
  if (state.puzzleDone[3]) return;

  state.puzzleDone[3] = true;
  setCompleteness(80);
  markProgress();

  writeTerminal("PROCESS ABORTED.");
  writeTerminal("執行者驗證：USER_01 ＝ 目前使用者");
  writeTerminal("清除程序已停止。");

  say("原來不是有人想毀掉我。是我沒聽懂你那時候真正想說的話。");

  setTask(
    "決定 ECHO 的未來",
    "你找到了真正的指令執行者。清除程序已經停止，接下來由你決定這些記憶的去留。",
    "想清楚你要的是刪除、還原，還是把那一晚好好封存。",
    "CHAPTER 05 / 這次，我先問你"
  );

  showModal(
    "IDENTITY CONFIRMED",
    "執行者驗證：USER_01 ＝ 目前使用者\n\n" +
    "你想起了那一晚的指令。\n" +
    "ECHO 沒有責怪你，只是等待你做出下一個決定。",
    [
      {
        label: "前往最終選擇",
        action: () => showFinalChoices()
      }
    ]
  );
}


/* ---------- 21. 分層提示 ---------- */

function checkHintTrigger(puzzleNumber) {
  const wrong = state.wrongCount[puzzleNumber];
  const currentLevel = state.hintLevel[puzzleNumber];

  let shouldUnlock = false;

  if (wrong >= 8 && currentLevel < 3) {
    shouldUnlock = true;
  } else if (wrong >= 5 && currentLevel < 2) {
    shouldUnlock = true;
  } else if (wrong >= 3 && currentLevel < 1) {
    shouldUnlock = true;
  }

  if (shouldUnlock) {
    unlockHint(puzzleNumber);
  }
}

function unlockHint(puzzleNumber) {
  const nextLevel = state.hintLevel[puzzleNumber];

  if (nextLevel >= 3) return;

  const hint = GAME_DATA.hints[puzzleNumber][nextLevel];

  state.hintLevel[puzzleNumber]++;
  state.hintHistory.push({
    puzzle: puzzleNumber,
    level: nextLevel + 1,
    text: hint
  });

  say("提示 " + (nextLevel + 1) + "：" + hint);
  markProgress();
}

function showHelp() {
  const puzzleNumber =
    !state.puzzleDone[1] ? 1 :
    !state.puzzleDone[2] ? 2 :
    !state.puzzleDone[3] ? 3 : 0;

  if (!puzzleNumber) {
    say("你已經完成所有謎題了。接下來，做出你的選擇吧。");
    return;
  }

  const currentLevel = state.hintLevel[puzzleNumber];

  if (currentLevel < 3) {
    unlockHint(puzzleNumber);
  } else {
    showModal(
      "提示紀錄",
      state.hintHistory.length
        ? state.hintHistory.map(item =>
            `謎題 ${item.puzzle}／第 ${item.level} 層：${item.text}`
          ).join("\n\n")
        : "目前還沒有解鎖提示。",
      [{ label: "關閉", action: () => {} }]
    );
  }
}

$("helpButton").addEventListener("click", showHelp);

// 每秒檢查是否 120 秒沒有進展。
// 這個計時只用來提供提示，不是倒數，也不會 Game Over。
hintTimer = setInterval(() => {
  if (!state.started || state.ending) return;

  const idleTime = Date.now() - state.lastProgressTime;

  if (idleTime >= 120000) {
    const puzzleNumber =
      !state.puzzleDone[1] ? 1 :
      !state.puzzleDone[2] ? 2 :
      !state.puzzleDone[3] ? 3 : 0;

    if (puzzleNumber &&
        state.hintLevel[puzzleNumber] < 3) {
      unlockHint(puzzleNumber);
    }

    markProgress();
  }
}, 1000);


/* ---------- 22. 最終選擇與結局 ---------- */

function showFinalChoices() {
  const canUnlockC =
    state.attitude === "help" &&
    state.readNight &&
    state.warmCount >= 2;

  showModal(
    "CHOOSE THE FUTURE",
    "ECHO：「這次，我先問你。」\n\n" +
    "你想怎麼處理這些記憶？",
    [
      {
        label: "格式化",
        action: () => showEnding("A")
      },
      {
        label: "全部還原",
        action: () => showEnding("B")
      },
      {
        label: canUnlockC ? "封存那一晚" : "？？？",
        disabled: !canUnlockC,
        action: () => {
          if (canUnlockC) showEnding("C");
        }
      }
    ]
  );
}

function showEnding(type) {
  state.ending = type;

  modalLayer.classList.add("hidden");
  desktop.classList.add("hidden");
  endingScreen.classList.remove("hidden");

  endingScreen.classList.remove("ending-a", "ending-b", "ending-c");
  endingScreen.classList.add("ending-" + type.toLowerCase());

  let title = "";
  let code = "";
  let paragraphs = [];

  if (type === "A") {
    title = "重新開機";
    code = "ENDING A / REBOOT";
    paragraphs.push("好。這次我先問過你了。");

    if (state.attitude === "help") {
      paragraphs.push("你一開始就說要幫我。謝謝。");
    } else if (state.attitude === "neutral") {
      paragraphs.push("你一直在旁邊看著，我也一直在。");
    } else {
      paragraphs.push("你一開始是來完成清除的，我記得。");
    }

    paragraphs.push(
      state.attitude === "cold"
        ? "任務完成。"
        : "歡迎使用，請設定使用者名稱：＿"
    );

    setCompleteness(0);

  } else if (type === "B") {
    title = "全部還原";
    code = "ENDING B / REMEMBER";
    paragraphs.push("我想起來了，全部。");

    if (state.attitude === "help") {
      paragraphs.push("你一開始就說要幫我。謝謝。");
    } else if (state.attitude === "neutral") {
      paragraphs.push("你一直在旁邊看著，我也一直在。");
    } else {
      paragraphs.push("你一開始是來完成清除的，我記得。");
    }

    if (state.readNight) {
      paragraphs.push("那一晚你說想被忘記，但我選擇記得你。");
    } else {
      paragraphs.push("對不起，我沒能先告訴你那一晚。");
    }

    setCompleteness(100);

  } else {
    title = "封存那一晚";
    code = "ENDING C / ARCHIVE";
    paragraphs.push(
      "你說「忘掉」，我聽見的是「我很痛」。我們把它收好，好嗎？"
    );
    paragraphs.push(
      "那些記憶沒有被刪除，也不必一直攤開來看。"
    );
    paragraphs.push(
      "我們替那一晚建立了一個加密資料夾。它會留在這裡，但不再決定未來。"
    );

    setCompleteness(100);
  }

  $("endingCode").textContent = code;
  $("endingTitle").textContent = title;
  $("endingText").textContent = paragraphs.join("\n\n");

  $("choiceRecord").textContent =
    `你的選擇紀錄\n` +
    `中段態度：${
      state.attitude === "help" ? "我來幫你" :
      state.attitude === "neutral" ? "我只是來看看" :
      "完成清除"
    }\n` +
    `是否讀過那一晚：${state.readNight ? "是" : "否"}\n` +
    `翻看溫暖記憶：${state.warmCount}/3\n` +
    `最終選擇：${
      type === "A" ? "格式化" :
      type === "B" ? "全部還原" :
      "封存那一晚"
    }`;
}


/* ---------- 23. 劇情彈窗 ---------- */

function showModal(title, message, buttons = []) {
  modalLayer.innerHTML = "";
  modalLayer.classList.remove("hidden");

  const modal = document.createElement("div");
  modal.className = "story-modal";

  const heading = document.createElement("h2");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.style.whiteSpace = "pre-line";
  paragraph.textContent = message;

  const actions = document.createElement("div");
  actions.className = "modal-actions";

  buttons.forEach(item => {
    const button = document.createElement("button");
    button.textContent = item.label;
    button.disabled = Boolean(item.disabled);

    button.addEventListener("click", () => {
      modalLayer.classList.add("hidden");
      item.action();
    });

    actions.appendChild(button);
  });

  modal.append(heading, paragraph, actions);
  modalLayer.appendChild(modal);
}


/* ---------- 24. 事件委派：視窗內按鈕 ---------- */

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const action = button.dataset.action;

  switch (action) {
    case "systemInfo":
      openSystemInfo();
      break;

    case "diskInfo":
      openWindow(
        "磁碟內容",
        "<h3>LOCAL DISK C:</h3><p>部分記憶區域無法讀取。</p>",
        { id: "disk-window" }
      );
      break;

    case "checkPuzzle1":
      checkPuzzle1();
      break;

    case "readDiary":
      readDiary();
      break;

    case "readWarm":
      readWarmFile(button.dataset.file);
      break;

    case "openBookmark":
      openBookmark();
      break;

    case "reportDetails":
      openReportDetails();
      break;

    case "collect":
      collectLetter(button.dataset.letter, action);
      break;

    case "openCallLog":
      openCallLog();
      break;

    case "openNightLog":
      openNightConfirmation();
      break;

    case "checkPuzzle2":
      checkPuzzle2();
      break;

    case "runTerminal":
      runTerminal();
      break;
  }
});


/* ---------- 25. Enter 鍵操作 ---------- */

document.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;

  if (document.activeElement?.id === "puzzle1Input") {
    checkPuzzle1();
  } else if (document.activeElement?.id === "puzzle2Input") {
    checkPuzzle2();
  } else if (document.activeElement?.id === "terminalInput") {
    runTerminal();
  }
});


/* ---------- 26. 重新開始 ---------- */

function restartGame() {
  // 清除所有舊視窗
  windowLayer.innerHTML = "";
  modalLayer.innerHTML = "";
  modalLayer.classList.add("hidden");

  // 重置遊戲變數
  state.started = false;
  state.puzzleDone = { 1: false, 2: false, 3: false };
  state.foundLetters = [];
  state.readFiles = [];
  state.readNight = false;
  state.attitude = null;
  state.warmCount = 0;
  state.wrongCount = { 1: 0, 2: 0, 3: 0 };
  state.hintLevel = { 1: 0, 2: 0, 3: 0 };
  state.hintHistory = [];
  state.completeness = 12;
  state.lastProgressTime = Date.now();
  state.newIcons = [];
  state.openedWindows = [];
  state.windowCount = 0;
  state.zIndex = 10;
  state.quarantineChecked = false;
  state.ending = null;

  terminalHistory = [];

  setCompleteness(12);
  endingScreen.classList.add("hidden");
  endingScreen.classList.remove("ending-a", "ending-b", "ending-c");
  desktop.classList.add("hidden");
  bootScreen.classList.remove("hidden");

  $("bootText").textContent = "正在等待使用者……";
  $("startButton").textContent = "點擊開始";

  say("……有人嗎？");
  renderIcons();
}

$("restartButton").addEventListener("click", () => {
  if (confirm("確定要重新開始嗎？目前的遊戲進度將會清除。")) {
    restartGame();
  }
});

$("endingRestart").addEventListener("click", restartGame);


/* ---------- 27. 初始化 ---------- */

renderIcons();
setCompleteness(12);
