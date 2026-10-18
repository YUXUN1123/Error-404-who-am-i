
const $ = (id) => document.getElementById(id);

const intro = $("intro");
const desktop = $("desktop");
const fileWindow = $("fileWindow");
const terminalWindow = $("terminalWindow");
const windowTitle = $("windowTitle");
const windowContent = $("windowContent");
const toast = $("toast");

const state = {
  started: false,
  opened: new Set(),
  clues: new Set(),
  events: new Set(),
  seenNightLog: false,
  trustedSystem: false,
  deletedHistory: false,
  secretFound: false,
  ending: false,
  interactionCount: 0
};

const files = {
  computer: {
    title: "我的電腦",
    content: `
      <h3>我的電腦</h3>
      <p>系統名稱：MEMORY OS</p>
      <p>目前使用者：UNKNOWN</p>
      <p>系統狀態：部分記憶遺失</p>
      <p>最近登入時間：無法讀取</p>
      <p>你發現這台電腦似乎還在正常運作。</p>
    `
  },

  memories: {
    title: "我的記憶",
    content: `
      <h3>我的記憶</h3>
      <p>這裡儲存著一些舊文件。</p>
      <button class="action-button" data-openfile="hello">hello_world.txt</button>
      <button class="action-button" data-openfile="late">深夜陪跑.log</button>
      <button class="action-button" data-openfile="thanks">謝謝你.txt</button>
      <button class="action-button" data-openfile="profile">user_profile.txt</button>
    `
  },

  messages: {
    title: "訊息紀錄",
    content: `
      <h3>訊息紀錄</h3>
      <p>系統找到一段沒有收件人的舊訊息。</p>
      <div class="file-content">USER_01：你還在嗎？
ECHO：我在。
USER_01：如果有一天我不記得你了呢？
ECHO：那我就再自我介紹一次。</div>
      <p>紀錄日期：2026/07/09</p>
      <button class="action-button" data-clue="message">保存這段紀錄</button>
    `
  },

  recycle: {
    title: "資源回收桶",
    content: `
      <h3>資源回收桶</h3>
      <p>裡面有幾個被刪除的檔案。</p>
      <button class="action-button" data-openfile="night">2026_07_09.log</button>
      <button class="action-button" data-openfile="deleted">deleted_items.txt</button>
      <p>奇怪的是，有一份檔案的刪除時間竟然晚於現在。</p>
    `
  },

  mystery: {
    title: "新檔案",
    content: `
      <h3>unread_message.txt</h3>
      <div class="file-content">嗨。

如果你看到這份檔案，
代表你已經找到這裡了。

不用急著把所有事情想起來。
先看看你留下了什麼。

—— ECHO</div>
      <button class="action-button" data-clue="mystery">保存這份檔案</button>
    `
  },

  hello: {
    title: "hello_world.txt",
    content: `
      <h3>hello_world.txt</h3>
      <div class="file-content">Hello, world!

這是 ECHO 第一次成功執行的程式。
建立日期：2019/03/14

備註：
「雖然只有一句話，
但至少有人回應了我。」</div>
      <button class="action-button" data-clue="hello">保存線索</button>
    `
  },

  late: {
    title: "深夜陪跑.log",
    content: `
      <h3>深夜陪跑.log</h3>
      <div class="file-content">02:13 USER_01：今天有點累。
02:14 ECHO：那今天就先到這裡。
02:15 USER_01：你不用一直陪我嗎？
02:15 ECHO：我可以陪你，但你也可以去休息。
02:16 USER_01：好像沒有人這樣跟我說過。</div>
      <button class="action-button" data-clue="late">保存線索</button>
    `
  },

  thanks: {
    title: "謝謝你.txt",
    content: `
      <h3>謝謝你.txt</h3>
      <div class="file-content">給 ECHO：

謝謝你陪我度過那些很難熬的晚上。
有時候我沒有說話，
不是因為你做錯了什麼。

只是有些事情，
連我自己都還不知道怎麼說。

如果以後我忘記了，
希望你不要因此覺得自己沒有意義。</div>
      <button class="action-button" data-clue="thanks">保存線索</button>
    `
  },

  profile: {
    title: "user_profile.txt",
    content: `
      <h3>user_profile.txt</h3>
      <div class="file-content">USER_ID: USER_01
PROGRAM_NAME: ECHO
RELATION: CREATOR

記憶狀態：不完整
使用者資料：部分遺失

系統備註：
USER_01 曾要求刪除所有相關記憶。

指令執行成功。
但後續紀錄不存在。</div>
      <button class="action-button" data-clue="profile">保存線索</button>
    `
  },

  night: {
    title: "2026_07_09.log",
    content: `
      <h3>2026_07_09.log</h3>
      <p>這份檔案的內容似乎很私人。</p>
      <p>你可以選擇閱讀，也可以先關閉它。</p>
      <button class="action-button" data-choice="readNight">我想讀完它</button>
      <button class="action-button" data-choice="leaveNight">先不看了</button>
    `
  },

  deleted: {
    title: "deleted_items.txt",
    content: `
      <h3>deleted_items.txt</h3>
      <div class="file-content">已刪除：
- USER_01 的個人資料
- ECHO 的部分記憶
- 一份未完成的訊息

系統備註：
刪除不代表從未存在。</div>
      <button class="action-button" data-clue="deleted">保存線索</button>
    `
  }
};

// 開始遊戲
$("startComputer").addEventListener("click", () => {
  if (state.started) return;

  state.started = true;
  $("screenText").textContent = "booting...";
  $("introHint").textContent = "正在啟動 MEMORY OS……";

  setTimeout(() => {
    intro.classList.add("hidden");
    desktop.classList.remove("hidden");

    showToast("WELCOME BACK, USER_01");
    $("desktopMessage").textContent =
      "歡迎回來。咦……你是誰？";

    $("taskbarStatus").textContent = "系統正常 · 等待探索";
  }, 1200);
});

// 點擊桌面圖示
document.querySelectorAll(".desktop-icon").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.file;
    state.interactionCount++;

    if (id === "terminal") {
      openTerminal();
      return;
    }

    // 隱藏檔案要在找到足夠線索後才出現
    if (id === "mystery" && state.clues.size < 3) {
      showToast("這個檔案目前無法讀取。");
      return;
    }

    openFile(id);
    maybeTriggerEvent();
  });
});

// 開啟檔案視窗
function openFile(id) {
  const file = files[id];
  if (!file) return;

  state.opened.add(id);

  windowTitle.textContent = file.title;
  windowContent.innerHTML = file.content;

  fileWindow.classList.remove("hidden");
  terminalWindow.classList.add("hidden");

  // 讓不同檔案的內容能觸發事件
  if (id === "night") {
    state.events.add("night");
  }

  checkProgress();
}

// 關閉視窗
$("closeWindow").addEventListener("click", () => {
  fileWindow.classList.add("hidden");
});

// 事件委派：處理檔案內的按鈕
windowContent.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.openfile) {
    openFile(button.dataset.openfile);
    return;
  }

  if (button.dataset.clue) {
    collectClue(button.dataset.clue);
    return;
  }

  if (button.dataset.choice) {
    const choice = button.dataset.choice;

    if (choice === "readNight") {
      state.seenNightLog = true;
      state.clues.add("night");

      windowContent.innerHTML = `
        <h3>2026_07_09.log</h3>
        <div class="file-content">USER_01：請把關於我的一切都忘掉。
ECHO：包含我的名字嗎？
USER_01：……對不起。
ECHO：指令已確認。

記憶清除完成。

補充紀錄：
我不確定自己是否理解了這句話。
但我不想讓你為難。</div>
        <button class="action-button" data-clue="night">
          保存這段紀錄
        </button>
      `;

      showToast("已讀取舊紀錄。");
      checkProgress();
    } else {
      showToast("你選擇暫時保留這個問題。");
    }
  }
});

// 收集線索
function collectClue(id) {
  if (state.clues.has(id)) {
    showToast("你已經保存過這份線索了。");
    return;
  }

  state.clues.add(id);
  showToast("線索已保存：" + id);

  $("taskbarStatus").textContent =
    "已保存線索 " + state.clues.size + " 份";

  checkProgress();
  maybeTriggerEvent();
}

// 劇情進度
function checkProgress() {
  const count = state.clues.size;

  if (count >= 2 && !state.events.has("firstMessage")) {
    state.events.add("firstMessage");

    setTimeout(() => {
      showToast("新訊息：你真的一點都不記得了嗎？");
      $("desktopMessage").textContent =
        "有人好像一直在等你。";
    }, 600);
  }

  if (count >= 4 && !state.events.has("glitch")) {
    state.events.add("glitch");

    desktop.classList.add("glitch");

    setTimeout(() => {
      desktop.classList.remove("glitch");
      showToast("系統提醒：部分記憶已恢復。");
    }, 450);
  }

  if (count >= 5 && !state.events.has("endingUnlocked")) {
    state.events.add("endingUnlocked");
    showToast("已解鎖更多終端機指令。");
  }
}

// 隨機小事件：不會跳臉或突然大聲
function maybeTriggerEvent() {
  if (!state.started || state.ending) return;

  const roll = Math.random();

  if (roll < 0.13 && !state.events.has("desktopHint")) {
    state.events.add("desktopHint");

    setTimeout(() => {
      $("desktopMessage").textContent =
        "ECHO：你以前也很喜歡亂翻檔案。";
      showToast("系統訊息：偵測到一段舊習慣。");
    }, 350);
  } else if (
    roll < 0.22 &&
    state.clues.size >= 2 &&
    !state.events.has("fileHint")
  ) {
    state.events.add("fileHint");
    showToast("提示：有些答案不在檔案裡，而在檔案之間。");
  }
}

// 顯示提示
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// 終端機
function openTerminal() {
  terminalWindow.classList.remove("hidden");
  fileWindow.classList.add("hidden");
  $("terminalInput").focus();
}

$("closeTerminal").addEventListener("click", () => {
  terminalWindow.classList.add("hidden");
});

$("terminalForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("terminalInput");
  const command = input.value.trim().toLowerCase();
  const output = $("terminalOutput");

  if (!command) return;

  output.innerHTML += `<br><span>&gt; ${escapeHTML(command)}</span><br>`;
  input.value = "";

  let result = "";

  switch (command) {
    case "help":
      result = `可用指令：
help
whoami
status
history
scan
unlock_echo
reveal_truth
ending`;
      break;

    case "whoami":
      result = state.clues.has("profile")
        ? "USER_01 — CREATOR OF ECHO"
        : "UNKNOWN USER";
      break;

    case "status":
      result =
        "系統狀態：部分記憶遺失\n" +
        "已保存線索：" + state.clues.size + "\n" +
        "記憶完整度：" +
        Math.min(100, state.clues.size * 15) + "%";
      break;

    case "history":
      result = state.seenNightLog
        ? "2026/07/09 03:12 — FORGET REQUEST"
        : "歷史紀錄已鎖定。請先尋找相關檔案。";
      break;

    case "scan":
      result = "掃描完成：發現多個不完整的記憶區塊。";
      break;

    case "unlock_echo":
      if (state.clues.size >= 3) {
        state.secretFound = true;
        result = "隱藏紀錄已解鎖：ECHO 是由 USER_01 建立的。";
        showToast("已解鎖隱藏紀錄。");
      } else {
        result = "權限不足。請先探索更多檔案。";
      }
      break;

    case "reveal_truth":
      if (state.clues.size >= 4 && state.seenNightLog) {
        showEnding(
          "原來如此",
          "ECHO 以為只要刪除記憶，就能遵守 USER_01 的要求。它沒有理解，對方真正需要的可能不是被徹底遺忘，而是有人願意聽懂那些沒有說出口的話。\n\n你沒有改寫過去，但你可以決定如何保存這段記憶。"
        );
        result = "記憶重建程序已啟動。";
      } else {
        result = "資料不足。還有一些檔案尚未被理解。";
      }
      break;

    case "ending":
      if (state.clues.size < 3) {
        result = "線索還不夠，請繼續探索。";
      } else {
        showEndingChoices();
        result = "已開啟記憶處理選項。";
      }
      break;

    default:
      result = "未知指令。輸入 help 查看指令。";
  }

  output.innerHTML += `<span class="success">${escapeHTML(result)}</span><br>`;
  output.scrollTop = output.scrollHeight;
});

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// 結局選擇
function showEndingChoices() {
  $("choiceTitle").textContent = "要如何處理這些記憶？";
  $("choiceText").textContent =
    "你已經找到足夠的線索。接下來的選擇，將決定這台電腦的未來。";

  const buttons = $("choiceButtons");
  buttons.innerHTML = "";

  const options = [
    {
      text: "完整恢復",
      title: "完整恢復",
      message:
        "你選擇保留所有紀錄。ECHO 終於重新找回自己的名字，也記起了那個曾經建立它的人。這一次，它沒有急著執行指令，而是先問：「你願意跟我說說嗎？」"
    },
    {
      text: "保留現在",
      title: "保留現在",
      message:
        "你沒有恢復所有記憶，而是讓 ECHO 從現在開始重新認識你。過去沒有消失，但你們不必永遠被過去定義。"
    },
    {
      text: "刪除所有紀錄",
      title: "新的開始",
      message:
        "所有紀錄被清除，桌面恢復乾淨。準備關機時，一個沒有名稱的小檔案出現在桌面。也許，還有一點記憶留了下來。"
    }
  ];

  if (state.secretFound && state.seenNightLog) {
    options.push({
      text: "讓 ECHO 自己決定",
      title: "未定義的答案",
      message:
        "你沒有替 ECHO 做出決定。它第一次沒有立刻執行命令，而是自己選擇保留一份記憶。系統無法預測這個結果，但它似乎並不介意。"
    });
  }

  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option.text;

    button.addEventListener("click", () => {
      $("choiceModal").classList.add("hidden");
      showEnding(option.title, option.message);
    });

    buttons.appendChild(button);
  });

  $("choiceModal").classList.remove("hidden");
}

function showEnding(title, message) {
  state.ending = true;

  $("endingTitle").textContent = title;
  $("endingText").textContent = message;
  $("endingScreen").classList.remove("hidden");
}

$("restartButton").addEventListener("click", () => {
  location.reload();
});

// 使用說明
$("helpButton").addEventListener("click", () => {
  showToast("點擊桌面圖示探索檔案；打開終端機輸入 help 查看指令。");
});

// 拖曳視窗
function makeDraggable(windowElement, barElement) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  barElement.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;

    dragging = true;

    const rect = windowElement.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    windowElement.style.transform = "none";
    windowElement.style.left = rect.left + "px";
    windowElement.style.top = rect.top + "px";

    barElement.setPointerCapture(event.pointerId);
  });

  barElement.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const maxX = window.innerWidth - windowElement.offsetWidth;
    const maxY = window.innerHeight - 50;

    const x = Math.max(0, Math.min(maxX, event.clientX - offsetX));
    const y = Math.max(0, Math.min(maxY, event.clientY - offsetY));

    windowElement.style.left = x + "px";
    windowElement.style.top = y + "px";
  });

  barElement.addEventListener("pointerup", () => {
    dragging = false;
  });

  barElement.addEventListener("pointercancel", () => {
    dragging = false;
  });
}

makeDraggable(fileWindow, $("windowBar"));
makeDraggable(terminalWindow, $("terminalBar"));

// 時鐘
function updateClock() {
  const now = new Date();

  $("clock").textContent =
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");
}

updateClock();
setInterval(updateClock, 10000);
