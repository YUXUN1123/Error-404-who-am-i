
"use strict";

/* =========================
   1. 遊戲資料
========================= */

const $ = (id) => document.getElementById(id);

const files = [
  {
    id: "profile",
    name: "user_profile.txt",
    icon: "👤",
    type: "使用者資料",
    date: "2026-10-17 23:59",
    content:
`USER PROFILE
使用者：UNKNOWN
建立時間：2026-10-17 23:59
最後登入：明天 23:59

備註：
此使用者尚未建立。
但系統已為他保留了位置。`,
    clue: "系統為不存在的使用者保留了位置。",
    importance: 1
  },
  {
    id: "meeting",
    name: "meeting.txt",
    icon: "📄",
    type: "文字紀錄",
    date: "2026-10-17 21:10",
    content:
`會議紀錄 / 21:10

使用者 A：這件事應該結束了。
使用者 B：你確定嗎？
使用者 A：我不想再重來一次。

[後續內容遺失]

文件最後修改時間：23:59
原始建立時間：21:10`,
    clue: "文件的修改時間晚於內容發生的時間。",
    importance: 2
  },
  {
    id: "camera",
    name: "camera_02.log",
    icon: "📹",
    type: "系統紀錄",
    date: "2026-10-17 21:10",
    content:
`CAMERA 02 / ACCESS LOG

21:00 — 無人進入
21:10 — 無人進入
21:20 — 無人進入

警告：
21:10 的會議紀錄已被讀取 4 次。

目前讀取者：UNKNOWN`,
    clue: "監視紀錄顯示無人進入，但會議紀錄確實存在。",
    importance: 2
  },
  {
    id: "backup",
    name: "backup_old.txt",
    icon: "🗃️",
    type: "舊版備份",
    date: "2026-10-16 03:12",
    content:
`BACKUP / VERSION 01

使用者 A：不要相信系統。
使用者 B：系統只會顯示它認為你能接受的內容。

附註：
若你正在閱讀這份文件，
代表目前版本已經失敗。

不要再建立第五個使用者。`,
    clue: "備份文件警告不要建立第五個使用者。",
    importance: 3
  },
  {
    id: "voice",
    name: "voice_unknown.txt",
    icon: "🎙️",
    type: "語音轉錄",
    date: "時間不明",
    content:
`[語音轉錄失敗]

……你又回來了。

如果這次你還是決定相信它，
那我就真的沒有機會了。

[音訊結束]

辨識結果：目前使用者的聲音
信心值：98.7%`,
    clue: "未知聲音與目前使用者高度相似。",
    importance: 3
  },
  {
    id: "ghost",
    name: "user_04.tmp",
    icon: "◈",
    type: "隱藏檔案",
    date: "不存在的時間",
    content:
`USER_04 / RECOVERY LOG

前三個版本都失敗了。
這一次，調查者必須自己決定真相。

你不是第一個進入這裡的人。
你也不是第一個離開的人。

如果你能看見這份紀錄，
代表系統已經開始懷疑自己。

最後一行：
不要把所有矛盾都修好。`,
    clue: "第四個使用者可能是系統自行建立的版本。",
    importance: 5,
    hidden: true
  }
];

const state = {
  started: false,
  investigated: new Set(),
  evidence: new Set(),
  clues: new Set(),
  trust: 0,
  glitches: 0,
  events: 0,
  choices: [],
  openedFiles: new Set(),
  hiddenUnlocked: false,
  clockClicks: 0,
  analysisDone: false,
  eventActive: false,
  ending: false,
  currentFile: null,
  runCount: 0
};

let eventTimer = null;
let toastTimer = null;

/* =========================
   2. 畫面初始化
========================= */

function init() {
  renderFiles();
  updateStats();

  $("startBtn").addEventListener("click", startGame);

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      switchView(button.dataset.view);
    });
  });

  $("closeModalBtn").addEventListener("click", closeFileModal);
  $("closeFileBtn").addEventListener("click", closeFileModal);
  $("addEvidenceBtn").addEventListener("click", addCurrentEvidence);

  $("returnFilesBtn").addEventListener("click", () => {
    switchView("filesView");
  });

  $("theoryBtn").addEventListener("click", analyzeEvidence);
  $("eventBtn").addEventListener("click", triggerEvent);
  $("hintBtn").addEventListener("click", showHint);
  $("clockBtn").addEventListener("click", inspectClock);

  $("closeEventBtn").addEventListener("click", () => {
    $("eventModal").classList.add("hidden");
    state.eventActive = false;
  });

  $("terminalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    runCommand($("terminalInput").value);
    $("terminalInput").value = "";
  });

  $("restartBtn").addEventListener("click", () => {
    window.location.reload();
  });

  $("evidenceBoard").addEventListener("dragover", (event) => {
    event.preventDefault();
    $("evidenceBoard").classList.add("drag-over");
  });

  $("evidenceBoard").addEventListener("dragleave", () => {
    $("evidenceBoard").classList.remove("drag-over");
  });

  $("evidenceBoard").addEventListener("drop", (event) => {
    event.preventDefault();
    $("evidenceBoard").classList.remove("drag-over");

    const id = event.dataTransfer.getData("text/plain");
    if (id) addEvidence(id);
  });

  // 隨機突發事件不會在遊戲開始時立刻發生
  document.addEventListener("visibilitychange", () => {
    if (
      !document.hidden &&
      state.started &&
      !state.ending &&
      Math.random() < 0.3
    ) {
      showToast("系統：你剛剛離開了多久？");
    }
  });
}

/* =========================
   3. 開始遊戲與檔案
========================= */

function startGame() {
  state.started = true;

  $("bootScreen").classList.add("hidden");
  $("game").classList.remove("hidden");

  setMessage(
    "系統：歡迎回來。奇怪……我為什麼會使用「回來」這個詞？"
  );

  setTimeout(() => {
    if (state.started && !state.ending) {
      triggerEvent("boot");
    }
  }, 7000);
}

function renderFiles() {
  const grid = $("fileGrid");
  grid.innerHTML = "";

  files
    .filter((file) => !file.hidden || state.hiddenUnlocked)
    .forEach((file) => {
      const card = document.createElement("div");

      card.className = "file-card";
      card.draggable = true;
      card.dataset.id = file.id;

      if (state.investigated.has(file.id)) {
        card.classList.add("investigated");
      }

      card.innerHTML = `
        <div class="file-icon">${file.icon}</div>
        <div class="file-name">${file.name}</div>
        <div class="file-type">${file.type}</div>
      `;

      card.addEventListener("click", () => openFile(file.id));

      card.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", file.id);
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });

      grid.appendChild(card);
    });
}

function openFile(id) {
  const file = files.find((item) => item.id === id);
  if (!file) return;

  state.currentFile = id;
  state.openedFiles.add(id);
  state.investigated.add(id);

  $("modalFileIcon").textContent = file.icon;
  $("modalFileName").textContent = file.name;
  $("modalFileContent").textContent = file.content;
  $("modalMeta").textContent =
    `類型：${file.type}｜最後紀錄：${file.date}`;

  $("addEvidenceBtn").textContent = state.evidence.has(id)
    ? "已加入證據"
    : "加入證據";

  $("addEvidenceBtn").disabled = state.evidence.has(id);
  $("fileModal").classList.remove("hidden");

  renderFiles();
  updateStats();

  if (id === "voice") {
    setMessage("系統：這份聲音紀錄不應該存在。");
    maybeGlitch();
  } else if (id === "backup") {
    setMessage("系統：舊版備份已經過時，建議直接忽略。");
  } else if (id === "profile") {
    setMessage("系統：使用者不存在。請不要繼續確認。");
  } else if (id === "ghost") {
    setMessage("系統：警告！偵測到未授權的使用者版本。");
  }

  maybeRandomEvent();
}

function closeFileModal() {
  $("fileModal").classList.add("hidden");
  state.currentFile = null;
}

/* =========================
   4. 證據收集與推論
========================= */

function addCurrentEvidence() {
  if (state.currentFile) {
    addEvidence(state.currentFile);
  }
}

function addEvidence(id) {
  const file = files.find((item) => item.id === id);
  if (!file || state.evidence.has(id)) return;

  state.evidence.add(id);
  state.clues.add(file.clue);

  renderEvidence();
  renderClues();
  updateStats();

  $("addEvidenceBtn").disabled = true;
  $("addEvidenceBtn").textContent = "已加入證據";

  showToast(`已加入證據：${file.name}`);
  setMessage(`系統：已記錄 ${file.name}。`);

  if (state.evidence.size >= 3 && !state.analysisDone) {
    $("theoryBtn").disabled = false;
    setTask("你已經找到足夠資料，可以開始建立推論。");
  }

  if (state.evidence.has("backup") && state.evidence.has("voice")) {
    unlockHiddenFile();
  }

  maybeRandomEvent();
}

function renderEvidence() {
  const board = $("evidenceBoard");
  board.innerHTML = "";

  if (state.evidence.size === 0) {
    board.innerHTML = `
      <p id="emptyEvidence" class="empty-hint">
        將檔案拖到這裡<br>
        <span>證據會影響最後的判斷</span>
      </p>`;
    return;
  }

  state.evidence.forEach((id) => {
    const file = files.find((item) => item.id === id);
    if (!file) return;

    const chip = document.createElement("button");
    chip.className = "evidence-chip";
    chip.textContent = `${file.icon} ${file.name}`;
    chip.title = "點擊重新查看檔案";
    chip.addEventListener("click", () => openFile(id));

    board.appendChild(chip);
  });
}

function renderClues() {
  const list = $("clueList");
  list.innerHTML = "";

  if (state.clues.size === 0) {
    list.innerHTML = '<div class="clue-empty">目前尚無線索</div>';
    return;
  }

  state.clues.forEach((clue) => {
    const item = document.createElement("div");
    item.className = "clue-item";
    item.textContent = clue;
    list.appendChild(item);
  });
}

function analyzeEvidence() {
  if (state.evidence.size < 3) {
    showToast("至少需要 3 份證據才能分析。");
    return;
  }

  state.analysisDone = true;

  const hasBackup = state.evidence.has("backup");
  const hasVoice = state.evidence.has("voice");
  const hasCamera = state.evidence.has("camera");
  const hasMeeting = state.evidence.has("meeting");

  let theory = "";

  if (hasBackup && hasVoice) {
    theory =
      "你的推論：使用者紀錄可能是被拆分的不同版本。語音紀錄與備份互相呼應，但仍不能證明誰在操控系統。";
  } else if (hasCamera && hasMeeting) {
    theory =
      "你的推論：會議紀錄與監視紀錄互相矛盾。至少有一份資料被修改，或是它們根本不屬於同一段時間。";
  } else {
    theory =
      "你的推論：系統內的資料存在矛盾，但目前的證據還不足以確認原因。也許你應該調查更多檔案。";
  }

  $("theoryBox").textContent = theory;

  showChoice(
    "你相信哪一個版本？",
    "系統表示這只是檔案損毀，建議你立即修復所有矛盾。但備份檔案警告你，不要再建立第五個使用者。",
    [
      {
        label: "相信系統，修復所有資料",
        description: "你希望讓一切恢復正常。",
        action: () => {
          state.trust += 2;
          state.choices.push("trust");
          setMessage("系統：謝謝。你一直都很願意相信我。");
          switchView("filesView");
          showToast("系統信任度上升。");
        }
      },
      {
        label: "拒絕修復，保留所有矛盾",
        description: "你決定先留下原始紀錄。",
        action: () => {
          state.trust -= 1;
          state.choices.push("doubt");
          setMessage("系統：你為什麼不肯讓事情變得簡單？");
          switchView("filesView");
          maybeGlitch();
        }
      },
      {
        label: "嘗試存取隱藏版本",
        description: "需要找到更多互相矛盾的證據。",
        disabled: !(
          state.evidence.has("backup") &&
          state.evidence.has("voice")
        ),
        action: () => {
          unlockHiddenFile();
          switchView("filesView");
          showToast("已解鎖隱藏檔案。");
        }
      }
    ]
  );

  updateStats();
}

/* =========================
   5. 劇情選擇
========================= */

function showChoice(title, description, options) {
  switchView("choiceView");

  $("choiceTitle").textContent = title;
  $("choiceDescription").textContent = description;

  const container = $("choiceOptions");
  container.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.disabled = Boolean(option.disabled);

    button.innerHTML = `
      <strong>${option.label}</strong><br>
      <span>${option.description || ""}</span>
    `;

    button.addEventListener("click", () => {
      if (!option.disabled) option.action();
    });

    container.appendChild(button);
  });
}

/* =========================
   6. 終端機
========================= */

function runCommand(raw) {
  const command = raw.trim().toLowerCase();
  const output = $("terminalOutput");

  if (!command) return;

  const lines = {
    help:
      "可用指令：help、whoami、status、history、scan、reset",
    whoami:
      state.hiddenUnlocked
        ? "USER_04 / RECOVERY PROCESS\n注意：這不代表你就是第四個使用者。"
        : "USER: UNKNOWN\nPROFILE: NOT FOUND\nACCESS: GUEST",
    status:
      `FILES INVESTIGATED: ${state.investigated.size}\nEVIDENCE: ${state.evidence.size}\nSYSTEM TRUST: ${state.trust}`,
    history:
      state.openedFiles.size > 0
        ? [...state.openedFiles].join("\n")
        : "沒有可讀取的紀錄。",
    scan:
      "掃描完成。\n系統沒有發現問題。\n\n……你真的相信這個結果嗎？"
  };

  appendTerminal(`guest@unknown:~$ ${raw}`);

  if (command === "reset") {
    appendTerminal("拒絕執行：此指令需要管理員權限。");
    maybeGlitch();
    return;
  }

  if (command === "unlock_user04") {
    if (
      state.evidence.has("backup") &&
      state.evidence.has("voice")
    ) {
      unlockHiddenFile();
      appendTerminal("RECOVERY ACCESS GRANTED\nUSER_04 已恢復。");
    } else {
      appendTerminal("ACCESS DENIED\n證據不足。");
    }
    return;
  }

  if (command === "delete_history") {
    state.trust -= 1;
    state.choices.push("delete");
    appendTerminal(
      "刪除失敗。\n錯誤：部分紀錄已存在於目前使用者的記憶中。"
    );
    maybeGlitch();
    updateStats();
    return;
  }

  if (command === "reveal_truth") {
    if (state.hiddenUnlocked && state.analysisDone) {
      appendTerminal(
        "RECOVERY COMPLETE\n調查者不是外部使用者。\n系統正在重建目前的使用者身分。"
      );
      showToast("你已經接近真相。");
      setTask("前往證據調查，決定如何處理真相。");
    } else {
      appendTerminal("ACCESS DENIED\n你還沒有準備好面對這份紀錄。");
    }
    return;
  }

  appendTerminal(
    lines[command] ||
    "UNKNOWN COMMAND\n系統不認得這個指令。"
  );

  if (command === "scan" && Math.random() < 0.5) {
    maybeGlitch();
  }
}

function appendTerminal(text) {
  const output = $("terminalOutput");
  output.textContent += `\n\n${text}`;
  output.scrollTop = output.scrollHeight;
}

/* =========================
   7. 隱藏檔案與彩蛋
========================= */

function unlockHiddenFile() {
  if (state.hiddenUnlocked) return;

  state.hiddenUnlocked = true;
  renderFiles();

  showToast("發現隱藏檔案：user_04.tmp");
  setMessage("系統：錯誤。使用者版本不應該超過三個。");
  $("warningBox").innerHTML =
    "<span class='warning-icon'>!</span><p>偵測到第四個使用者版本。</p>";

  maybeGlitch();
}

function inspectClock() {
  state.clockClicks += 1;

  const clock = $("clockBtn");
  const messages = [
    "23:59:59",
    "23:59:59",
    "00:00:00",
    "23:59:59",
    "03:12:00"
  ];

  clock.textContent = messages[
    Math.min(state.clockClicks - 1, messages.length - 1)
  ];

  if (state.clockClicks === 3) {
    showToast("時間似乎跳回了午夜。");
  }

  if (state.clockClicks >= 5) {
    if (state.evidence.has("backup")) {
      unlockHiddenFile();
    } else {
      showToast("時鐘停在 03:12。也許你應該先找找舊紀錄。");
    }
  }
}

/* =========================
   8. 突發事件與故障效果
========================= */

function maybeRandomEvent() {
  if (
    !state.started ||
    state.ending ||
    state.eventActive ||
    state.events >= 3
  ) return;

  if (state.investigated.size < 2) return;

  if (Math.random() < 0.2) {
    setTimeout(() => {
      if (!state.eventActive && !state.ending) triggerEvent();
    }, 500);
  }
}

function triggerEvent(type = "random") {
  if (state.eventActive || state.ending) return;

  state.eventActive = true;
  state.events += 1;

  const scenarios = [
    {
      title: "檔案正在被覆蓋",
      description:
        "系統準備覆蓋一份舊版紀錄。它聲稱這樣可以修復損毀，但舊版本可能再也無法恢復。",
      options: [
        {
          label: "停止覆蓋",
          description: "保留目前的原始紀錄。",
          action: () => {
            state.trust -= 1;
            setMessage("系統：你選擇保留錯誤。");
          }
        },
        {
          label: "允許覆蓋",
          description: "相信系統的修復建議。",
          action: () => {
            state.trust += 1;
            setMessage("系統：資料已修復。至少，這是我顯示給你的版本。");
          }
        }
      ]
    },
    {
      title: "有人正在輸入訊息",
      description:
        "終端機突然開始自行輸入：『如果你看見這段訊息，代表它又讓你相信它了。』你可以保留這段紀錄，或直接清除。",
      options: [
        {
          label: "保留訊息",
          description: "把未知來源的內容加入調查。",
          action: () => {
            state.trust -= 1;
            state.clues.add("系統出現未知來源的自動輸入訊息。");
            renderClues();
            showToast("已記錄未知訊息。");
          }
        },
        {
          label: "清除訊息",
          description: "不讓未知內容干擾調查。",
          action: () => {
            state.trust += 1;
            setMessage("系統：謝謝你。這樣比較安全。");
          }
        }
      ]
    },
    {
      title: "偵測到未授權存取",
      description:
        "螢幕突然閃爍，系統表示有人正在查看你的調查紀錄。來源不明，但紀錄顯示存取者正是目前的使用者。",
      options: [
        {
          label: "追蹤存取來源",
          description: "冒險查看系統的內部紀錄。",
          action: () => {
            state.clues.add("異常存取來源與目前使用者相同。");
            renderClues();
            maybeGlitch();
          }
        },
        {
          label: "關閉監控",
          description: "暫時阻止系統繼續追蹤。",
          action: () => {
            state.trust -= 1;
            setMessage("系統：你不應該關閉這個功能。");
          }
        }
      ]
    }
  ];

  const scenario = type === "boot"
    ? scenarios[2]
    : scenarios[Math.floor(Math.random() * scenarios.length)];

  $("eventTitle").textContent = scenario.title;
  $("eventDescription").textContent = scenario.description;

  const container = $("eventOptions");
  container.innerHTML = "";

  scenario.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.innerHTML =
      `<strong>${option.label}</strong><br><span>${option.description}</span>`;

    button.addEventListener("click", () => {
      option.action();
      $("eventModal").classList.add("hidden");
      state.eventActive = false;
      updateStats();
      maybeRandomEvent();
    });

    container.appendChild(button);
  });

  $("eventModal").classList.remove("hidden");
  $("closeEventBtn").textContent = "稍後處理";

  maybeGlitch();
  updateStats();
}

function maybeGlitch() {
  if (!state.started || state.ending) return;

  state.glitches += 1;

  document.body.classList.remove("glitch");
  void document.body.offsetWidth;
  document.body.classList.add("glitch");

  if (state.glitches % 2 === 0) {
    $("systemStatus").textContent = "SYSTEM INCONSISTENT";
    $("systemStatus").style.color = "var(--red)";
  }

  if (state.glitches >= 3) {
    $("warningBox").innerHTML =
      "<span class='warning-icon'>!</span><p>系統資料可能遭到修改。</p>";
  }

  updateStats();
}

function showHint() {
  if (state.evidence.size < 2) {
    showToast("先閱讀至少兩份檔案，再試著找出它們的矛盾。");
  } else if (!state.evidence.has("backup")) {
    showToast("有一份檔案的內容直接警告你不要相信系統。");
  } else if (!state.evidence.has("voice")) {
    showToast("試著找出那份聲音與目前使用者有關的紀錄。");
  } else if (!state.hiddenUnlocked) {
    showToast("把備份和聲音紀錄都加入證據，再分析一次。");
  } else {
    showToast("試試終端機指令 reveal_truth。");
  }
}

/* =========================
   9. 切換畫面與結局
========================= */

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.add("hidden");
  });

  $(viewId).classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.view === viewId
    );
  });

  const titles = {
    filesView: "檔案總管",
    evidenceView: "證據調查",
    terminalView: "系統終端機",
    choiceView: "關鍵選擇"
  };

  $("viewTitle").textContent = titles[viewId] || "系統";
}

function updateStats() {
  $("investigatedCount").textContent =
    `${state.investigated.size} / 5`;

  $("trustValue").textContent = state.trust;
  $("glitchValue").textContent = state.glitches;

  $("theoryBtn").disabled =
    state.evidence.size < 3 || state.analysisDone;
}

function setMessage(message) {
  $("systemMessage").textContent = message;
}

function setTask(message) {
  $("taskText").textContent = message;
}

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

function endGame() {
  if (state.ending) return;

  state.ending = true;
  $("game").classList.add("hidden");
  $("endingScreen").classList.remove("hidden");

  let title;
  let text;
  let details;

  const hasGhost = state.hiddenUnlocked;
  const hasEnoughEvidence = state.evidence.size >= 4;

  if (hasGhost && hasEnoughEvidence && state.trust <= 0) {
    title = "ENDING 04：未定義的真相";
    text =
      "系統無法再替你決定哪一個版本才是真的。四份使用者紀錄並沒有合併成唯一答案。";
    details =
      "終端機最後留下了一行字：\n「如果真相不只一個，那我是不是也可以不必只剩下一個自己？」";
  } else if (state.trust >= 2) {
    title = "ENDING 01：完美重建";
    text =
      "系統完成了所有修復。畫面恢復正常，所有矛盾都消失了。";
    details =
      "但在關機前，你注意到一份沒有被列入修復清單的檔案。\n檔名：why_did_you_trust_me.txt";
  } else if (hasEnoughEvidence) {
    title = "ENDING 02：拒絕答案";
    text =
      "你拒絕讓系統把所有矛盾都修好。它沒有得到唯一答案，但也無法再替你刪除那些不一致的紀錄。";
    details =
      "系統：你真的想帶著這些問題離開嗎？\n你沒有回答。";
  } else {
    title = "ENDING 03：錯誤的真相";
    text =
      "你離開了系統，但手上的證據不足以解釋這一切。電腦再次顯示 USER PROFILE NOT FOUND。";
    details =
      "也許你找到的不是答案，而只是系統允許你看見的版本。";
  }

  $("endingTitle").textContent = title;
  $("endingText").textContent = text;
  $("endingDetails").textContent = details;
}

function finishInvestigation() {
  showChoice(
    "你要如何處理這份真相？",
    "系統要求你選擇一種處理方式。這次，你已經知道系統並不一定值得相信。",
    [
      {
        label: "重建所有資料",
        description: "讓系統恢復成一個完整的版本。",
        action: () => {
          state.trust += 2;
          endGame();
        }
      },
      {
        label: "拒絕修復",
        description: "保留所有矛盾與不完整的記憶。",
        action: () => {
          state.trust -= 1;
          endGame();
        }
      },
      {
        label: "使用隱藏版本重建",
        description: "讓系統保留多個互相矛盾的版本。",
        disabled: !state.hiddenUnlocked,
        action: () => {
          state.trust = Math.min(state.trust, 0);
          endGame();
        }
      }
    ]
  );
}

/* =========================
   10. 最終調查入口
========================= */

const originalAnalyzeEvidence = analyzeEvidence;

analyzeEvidence = function () {
  originalAnalyzeEvidence();

  if (state.hiddenUnlocked && state.evidence.size >= 4) {
    setTask("你已找到多個使用者版本。前往終端機輸入 reveal_truth。");
  }
};

// 完成揭露指令後，允許玩家進入最後的選擇
const originalAppendTerminal = appendTerminal;

appendTerminal = function (text) {
  originalAppendTerminal(text);

  if (
    text.includes("系統正在重建目前的使用者身分") &&
    state.hiddenUnlocked &&
    state.analysisDone
  ) {
    setTimeout(() => {
      if (!state.ending) finishInvestigation();
    }, 600);
  }
};

init();
