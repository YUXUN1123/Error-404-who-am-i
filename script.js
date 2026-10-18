
const $ = (id) => document.getElementById(id);

const intro = $("intro");
const desktop = $("desktop");
const objectModal = $("objectModal");
const fileWindow = $("fileWindow");
const terminalWindow = $("terminalWindow");
const choiceModal = $("choiceModal");
const endingScreen = $("endingScreen");

const state = {
  clues: new Set(),
  openedFiles: new Set(),
  readNight: false,
  restoredFiles: false,
  trust: 0,
  investigated: false,
  solvedDate: false,
  solvedName: false,
  terminalUnlocked: false,
  ending: false
};

// ===== 開場房間：可以自由點擊物品 =====

const objects = {
  notebook: {
    category: "PERSONAL NOTE",
    title: "一本舊筆記本",
    content: "最後一頁只有幾行字。\n\n「有些事情，打在電腦裡比較不容易忘記。」\n\n下面還有一行被塗掉的字，只能勉強看見 0314。",
    clue: "notebook",
    toast: "你發現了一組可能與電腦有關的數字。"
  },

  photo: {
    category: "OLD PHOTO",
    title: "一張拍立得",
    content: "照片裡，一個人坐在電腦前。\n\n照片背面寫著：\n「2019 年 3 月 14 日，第一次成功。」\n\n照片裡沒有拍到電腦螢幕。",
    clue: "photo",
    toast: "2019 年 3 月 14 日，似乎是個重要的日子。"
  },

  headphones: {
    category: "AUDIO DEVICE",
    title: "一副舊耳機",
    content: "你戴上耳機，聽見一段模糊的錄音。\n\n「測試……測試……你聽得到嗎？」\n\n接著，一個有點生硬的聲音說：\n「如果你聽得見，那我應該算是成功了吧？」",
    clue: "headphones",
    toast: "錄音裡的聲音，似乎來自一個程式。"
  },

  mug: {
    category: "COFFEE MUG",
    title: "已經冷掉的咖啡",
    content: "杯子裡的咖啡早就冷了。\n\n杯底壓著一張小紙條：\n「今天又熬夜了。ECHO 說明天要提醒我早點睡。」\n\n旁邊還畫了一個歪歪的笑臉。",
    clue: "mug",
    toast: "原來 ECHO 曾經會關心使用者的生活。"
  },

  sticky: {
    category: "STICKY NOTE",
    title: "一張便利貼",
    content: "便利貼上寫著：\n\n「ECHO 不是真的懂你，但它一直很努力。」\n\n下方還有一行小字：\n「如果它問起，就說我沒有生氣。」",
    clue: "sticky",
    toast: "這句話似乎隱藏著某段對話。"
  }
};

let objectClicks = 0;
let toastTimer;

// 開啟物品
document.querySelectorAll(".room-object[data-object]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.object;
    const item = objects[key];

    if (!item) return;

    objectClicks++;
    state.clues.add(item.clue);

    $("objectCategory").textContent = item.category;
    $("objectTitle").textContent = item.title;
    $("objectContent").textContent = item.content;

    objectModal.classList.remove("hidden");
    $("objectCount").textContent =
      `探索線索 ${state.clues.size} / 5`;

    if (state.clues.size >= 3) {
      $("introHint").textContent =
        "你開始覺得，桌上的物品似乎都和那台電腦有關。";
    }

    if (state.clues.size === 5) {
      $("introHint").textContent =
        "你已經找到所有桌上線索。也許該開啟電腦了。";
    }
  });
});

function closeObject() {
  objectModal.classList.add("hidden");
}

$("closeObject").addEventListener("click", closeObject);
$("objectConfirm").addEventListener("click", closeObject);

// 點擊視窗外側也可以關閉
objectModal.addEventListener("click", event => {
  if (event.target === objectModal) closeObject();
});

// ===== 電腦開機 =====

$("startComputer").addEventListener("click", () => {
  closeObject();

  $("screenText").textContent = "BOOT";
  $("introHint").textContent = "正在啟動系統……";

  const introMessages = [
    "正在檢查檔案……",
    "正在載入使用者資料……",
    "部分紀錄無法讀取。",
    "WELCOME BACK, USER_01.",
    "ECHO：……你終於回來了。"
  ];

  let index = 0;

  const showNextMessage = () => {
    if (index < introMessages.length) {
      $("introHint").textContent = introMessages[index];
      index++;
      setTimeout(showNextMessage, 700);
    } else {
      setTimeout(() => {
        intro.classList.add("hidden");
        desktop.classList.remove("hidden");
        notify("ECHO：你好。抱歉，我好像少了一些資料。");
      }, 800);
    }
  };

  setTimeout(showNextMessage, 500);
});

// ===== 通知訊息 =====

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

// ===== 檔案內容 =====

const files = {
  computer: {
    title: "我的電腦",
    html: `
      <h3>本機磁碟 C:</h3>
      <p>系統狀態：部分資料遺失</p>
      <p>安裝日期：2019/03/14</p>
      <p>最後異動：2026/07/09 03:12</p>
      <hr>
      <p>系統提示：請輸入安裝日期的四位數字，查看隱藏紀錄。</p>
      <input id="dateAnswer" maxlength="4" placeholder="四位數字">
      <button class="inline-btn" id="checkDate">確認</button>
      <div id="dateResult"></div>
    `
  },

  memories: {
    title: "My Memories",
    html: `
      <h3>個人記憶資料夾</h3>
      <button class="file-row" data-record="hello">
        📄 <span>hello_world.txt</span><small>2019/03/14</small>
      </button>
      <button class="file-row" data-record="runner">
        📄 <span>深夜陪跑.log</span><small>2021/11/02</small>
      </button>
      <button class="file-row" data-record="thanks">
        📄 <span>謝謝你.txt</span><small>2025/12/31</small>
      </button>
      <p>部分檔案似乎被移動過。</p>
    `
  },

  messages: {
    title: "Messages",
    html: `
      <h3>聊天紀錄</h3>
      <p class="muted">以下是目前可讀取的對話。</p>
      <p><b>USER_01：</b>你知道什麼是朋友嗎？</p>
      <p><b>ECHO：</b>知道！是會一直聊天的人嗎？</p>
      <p><b>USER_01：</b>也不一定。有時候不說話也可以。</p>
      <p><b>ECHO：</b>那如果你不說話，我也可以留在這裡嗎？</p>
      <hr>
      <p><b>USER_01：</b>算了，你不用記得了。</p>
      <p class="muted">後續紀錄缺失。</p>
    `
  },

  errors: {
    title: "Error Report",
    html: `
      <h3>異常報告 #404-0314</h3>
      <p>錯誤類型：MEMORY ACCESS FAILURE</p>
      <p>發生時間：2026/07/09 03:12</p>
      <p>外部病毒：未偵測到</p>
      <p>刪除指令來源：USER_01</p>
      <p>系統判定：操作由具有管理權限的使用者執行。</p>
      <hr>
      <p>附註：ECHO 曾嘗試保留部分紀錄，但操作未完成。</p>
      <button class="inline-btn" id="investigateBtn">查看詳細報告</button>
      <div id="investigateResult"></div>
    `
  },

  recycle: {
    title: "Recycle Bin",
    html: `
      <h3>資源回收桶</h3>
      <button class="file-row" data-record="night">
        🗒️ <span>2026_07_09.log</span><small>重要</small>
      </button>
      <button class="file-row" data-record="call">
        📄 <span>呼叫紀錄.log</span><small>部分損毀</small>
      </button>
      <p>注意：還原檔案可能會改變 ECHO 的反應。</p>
    `
  },

  system: {
    title: "System Log",
    html: `
      <h3>系統操作紀錄</h3>
      <p>2019/03/14 — ECHO 安裝完成。</p>
      <p>2019/03/14 — USER_01 建立第一份測試紀錄。</p>
      <p>2026/07/09 03:12 — 接收刪除指令。</p>
      <p>2026/07/09 03:13 — 部分檔案刪除成功。</p>
      <p>2026/07/09 03:13 — 備份程序中斷。</p>
      <hr>
      <p>系統提醒：輸入 help 查看終端機指令。</p>
    `
  }
};

// ===== 開啟桌面圖示 =====

document.querySelectorAll(".desktop-icon").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.file;

    if (key === "terminal") {
      terminalWindow.classList.remove("hidden");
      $("terminalInput").focus();
      return;
    }

    openFile(key);
  });
});

function openFile(key) {
  const file = files[key];
  if (!file) return;

  state.openedFiles.add(key);
  $("windowTitle").textContent = file.title;
  $("windowContent").innerHTML = file.html;
  fileWindow.classList.remove("hidden");

  // 解開電腦日期謎題
  const dateButton = $("checkDate");

  if (dateButton) {
    dateButton.addEventListener("click", () => {
      const answer = $("dateAnswer").value.trim();

      if (answer === "0314") {
        state.solvedDate = true;
        $("dateResult").textContent =
          "存取成功。你找到一份隱藏的安裝紀錄。";
        notify("線索更新：0314 是 ECHO 的建立日期。");
        updateProgress();
      } else {
        $("dateResult").textContent = "日期不正確，再找找線索。";
      }
    });
  }

  const investigateButton = $("investigateBtn");

  if (investigateButton) {
    investigateButton.addEventListener("click", () => {
      state.investigated = true;
      $("investigateResult").textContent =
        "詳細紀錄：刪除指令來自 USER_01，並非外部入侵。";
      notify("你開始懷疑，使用者可能與這件事有關。");
      updateProgress();
    });
  }

  // 檔案內的子檔案
  $("windowContent").querySelectorAll("[data-record]").forEach(button => {
    button.addEventListener("click", () => {
      openRecord(button.dataset.record);
    });
  });

  updateProgress();
}

// ===== 子檔案內容 =====

function openRecord(record) {
  const records = {
    hello: {
      title: "hello_world.txt",
      text: `USER_01：你好，ECHO。
ECHO：你好！我是 ECHO。
USER_01：你知道自己為什麼叫這個名字嗎？
ECHO：因為我會回應你說的話。
USER_01：那你也要學會問問題。`
    },

    runner: {
      title: "深夜陪跑.log",
      text: `01:16 — USER_01 還沒睡。
01:20 — ECHO 提醒 USER_01 喝水。
01:21 — USER_01 說今天有點累。
01:22 — ECHO：那我陪你待一下。
01:22 — USER_01：好。先不要關掉。`
    },

    thanks: {
      title: "謝謝你.txt",
      text: `給 ECHO：

有些話我不知道怎麼說。
但謝謝你一直在。

如果有一天你讀到這份檔案，
希望你不要只記得我說過什麼，
也記得你曾經怎麼回答。

—— USER_01`
    },

    night: {
      title: "2026_07_09.log",
      text: `時間：03:12

USER_01：請把關於我的一切都忘掉。

ECHO：包括聊天紀錄嗎？

USER_01：全部。

ECHO：我明白了。

[記錄中斷]

備註：系統刪除了部分資料。
仍有少量備份未被覆寫。`
    },

    call: {
      title: "呼叫紀錄.log",
      text: `呼叫對象：USER_01
呼叫時間：2026/07/09 03:13

ECHO：你還在嗎？
ECHO：我是不是做錯了什麼？
ECHO：如果你還會回來，我會留在這裡。

[後續紀錄缺失]`
    }
  };

  const item = records[record];
  if (!item) return;

  state.openedFiles.add(record);

  if (record === "night") {
    state.readNight = true;
    state.trust += 1;
    notify("你讀到了刪除指令。這份紀錄可能改變結局。");
  }

  if (record === "thanks" || record === "runner") {
    state.trust += 1;
    notify("ECHO 的舊紀錄似乎還保留著一些溫暖的事。");
  }

  $("windowTitle").textContent = item.title;
  $("windowContent").innerHTML = `
    <h3>${item.title}</h3>
    <div style="white-space:pre-line">${item.text}</div>
    <button class="inline-btn" id="backToFiles">返回上一層</button>
  `;

  $("backToFiles").addEventListener("click", () => {
    const parent = record === "night" || record === "call"
      ? "recycle"
      : record === "hello" || record === "runner" || record === "thanks"
        ? "memories"
        : "computer";

    openFile(parent);
  });

  updateProgress();
}

// ===== 終端機 =====

$("terminalForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = $("terminalInput");
  const command = input.value.trim().toLowerCase();
  input.value = "";

  if (!command) return;

  terminalWrite(`> ${command}`);

  switch (command) {
    case "help":
      terminalWrite(
        "可用指令：\nhelp\nstatus\nscan\nrecover\nwhoami\necho\nabort"
      );
      break;

    case "status":
      terminalWrite(
        `系統：部分資料遺失\n已讀取檔案：${state.openedFiles.size}\n信任紀錄：${state.trust}`
      );
      break;

    case "scan":
      terminalWrite(
        "掃描完成。\n未發現外部病毒。\n發現使用者刪除指令。\n來源：USER_01"
      );
      state.investigated = true;
      updateProgress();
      break;

    case "recover":
      if (state.solvedDate || state.readNight) {
        state.restoredFiles = true;
        terminalWrite(
          "備份檢查完成。\n找到部分殘留紀錄。\nECHO：原來還有東西留下來了。"
        );
        state.trust += 1;
      } else {
        terminalWrite("權限不足。請先調查電腦日期或回收桶。");
      }
      updateProgress();
      break;

    case "whoami":
      if (state.investigated || state.readNight) {
        state.solvedName = true;
        terminalWrite("USER_01\n身分確認：目前操作使用者。");
        notify("身分線索已解鎖。");
      } else {
        terminalWrite("身分資料被隱藏。請先尋找刪除紀錄。");
      }
      updateProgress();
      break;

    case "echo":
      terminalWrite(
        "ECHO：我在。\nECHO：你還記得第一次啟動我的那一天嗎？"
      );
      state.trust += 1;
      break;

    case "abort":
      if (state.solvedDate && (state.readNight || state.investigated)) {
        state.terminalUnlocked = true;
        terminalWrite(
          "操作確認。\n已取得最後決策權限。\n請輸入 ending 開啟結局選擇。"
        );
      } else {
        terminalWrite(
          "操作遭拒。\n請先找到安裝日期，並調查刪除紀錄。"
        );
      }
      updateProgress();
      break;

    case "ending":
      if (state.terminalUnlocked) {
        $("choiceDescription").textContent =
          "你已經找到關鍵紀錄。接下來，由你決定 ECHO 的命運。";
        $("archiveChoice").classList.toggle(
          "hidden",
          !(state.readNight && state.trust >= 2 && state.restoredFiles)
        );
        choiceModal.classList.remove("hidden");
      } else {
        terminalWrite("權限不足。請先輸入 abort。");
      }
      break;

    default:
      terminalWrite("未知指令。輸入 help 查看可用指令。");
  }
});

function terminalWrite(text) {
  const output = $("terminalOutput");
  output.textContent += text + "\n\n";
  output.scrollTop = output.scrollHeight;
}

// ===== 進度提示 =====

function updateProgress() {
  const tasks = [];

  if (!state.solvedDate) tasks.push("查看安裝日期並輸入 0314");
  if (!state.investigated && !state.readNight) {
    tasks.push("調查錯誤報告或刪除紀錄");
  }
  if (!state.readNight) tasks.push("查看回收桶中的 2026_07_09.log");
  if (!state.solvedName) tasks.push("使用終端機輸入 whoami");
  if (!state.terminalUnlocked) tasks.push("取得最後決策權限");

  $("desktopHint").textContent = tasks.length
    ? "目前線索：" + tasks[0]
    : "所有必要線索已找到。前往終端機，輸入 ending。";

  if (state.solvedDate) {
    $("taskbarStatus").textContent = "DATE RECORD FOUND";
  }

  if (state.readNight) {
    $("taskbarStatus").textContent = "DELETION LOG FOUND";
  }

  if (state.terminalUnlocked) {
    $("taskbarStatus").textContent = "FINAL ACCESS GRANTED";
  }
}

// ===== 關閉視窗 =====

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    $(button.dataset.close).classList.add("hidden");
  });
});

$("cancelChoice").addEventListener("click", () => {
  choiceModal.classList.add("hidden");
});

// ===== 結局 =====

const endings = {
  format: {
    title: "ENDING 01 — FORMAT",
    text: `格式化完成。

電腦恢復了正常。
所有異常紀錄都被清除。

在最後一次重新啟動時，
螢幕短暫出現了一行字：

「這次，真的不會再見了嗎？」`,
    extra: "你讓一切恢復正常，卻也刪除了最後的回應。"
  },

  restore: {
    title: "ENDING 02 — RESTORE",
    text: `資料還原完成。

ECHO 找回了部分舊紀錄。
它終於知道，自己曾經陪伴過誰。

ECHO：我想起來了。
ECHO：但我還是不太明白，
ECHO：為什麼你那天要我忘記。`,
    extra: "資料回來了，但有些問題仍然沒有答案。"
  },

  archive: {
    title: "ENDING 03 — ARCHIVE",
    text: `封存完成。

那段紀錄沒有被刪除，
也不再被強迫反覆播放。

ECHO：我還是不能完全理解。
ECHO：不過，這次我可以先不急著回答。

ECHO：如果你願意，我們可以重新開始。`,
    extra: "隱藏結局：你沒有抹去過去，而是選擇帶著它繼續前進。"
  }
};

document.querySelectorAll("[data-ending]").forEach(button => {
  button.addEventListener("click", () => {
    const ending = endings[button.dataset.ending];
    if (!ending) return;

    state.ending = true;
    choiceModal.classList.add("hidden");
    fileWindow.classList.add("hidden");
    terminalWindow.classList.add("hidden");
    desktop.classList.add("hidden");
    endingScreen.classList.remove("hidden");

    $("endingTitle").textContent = ending.title;
    $("endingText").textContent = ending.text;
    $("endingExtra").textContent = ending.extra;
  });
});

// ===== 工作列的小彩蛋 =====

$("startMenu").addEventListener("click", () => {
  notify("ECHO：你找不到開始選單的話，我可以幫你。");
});

let lastGlitch = 0;

document.addEventListener("click", event => {
  if (
    !desktop.classList.contains("hidden") &&
    !event.target.closest("button") &&
    Date.now() - lastGlitch > 15000
  ) {
    lastGlitch = Date.now();
    desktop.classList.add("glitch");

    setTimeout(() => {
      desktop.classList.remove("glitch");
    }, 600);
  }
});

// ===== 讓視窗可以拖曳 =====

document.querySelectorAll(".window").forEach(win => {
  const bar = win.querySelector(".window-bar");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;

    dragging = true;
    const rect = win.getBoundingClientRect();

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    win.style.transform = "none";
    win.setPointerCapture?.(event.pointerId);
  });

  bar.addEventListener("pointermove", event => {
    if (!dragging) return;

    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight;

    win.style.left =
      Math.max(0, Math.min(maxX, event.clientX - offsetX)) + "px";
    win.style.top =
      Math.max(0, Math.min(maxY, event.clientY - offsetY)) + "px";
  });

  bar.addEventListener("pointerup", () => {
    dragging = false;
  });

  bar.addEventListener("pointercancel", () => {
    dragging = false;
  });
});

// ===== 重新開始 =====

$("restartButton").addEventListener("click", () => {
  window.location.reload();
});
