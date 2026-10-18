
"use strict";

// ==========================================
// 1. 遊戲狀態：記錄玩家做過的事情
// ==========================================

const state = {
  started: false,
  trust: 0,
  progress: 12,

  found: {
    date: false,
    E: false,
    C: false,
    H: false,
    O: false,
    nightLog: false,
    secret: false
  },

  warmFiles: [],
  attitude: "",
  archiveReady: false,
  archived: false,
  glitchCount: 0,
  blankClicks: 0,
  eventCount: 0,
  seen: [],
  ending: false
};

const $ = (id) => document.getElementById(id);

const desktop = $("desktop");
const windowLayer = $("windowLayer");
const modalBackdrop = $("modalBackdrop");

let topZ = 5;
let terminalHistory = [
  "ECHO SYSTEM TERMINAL v4.04",
  "輸入 help 查看可用指令。"
];

// ==========================================
// 2. 共用工具
// ==========================================

function setTask(title, description) {
  $("taskTitle").textContent = title;
  $("taskText").textContent = description;
  $("taskbarMessage").textContent = title;
}

function setProgress(value) {
  state.progress = value;
  $("progressFill").style.width = value + "%";
  $("progressText").textContent = "記憶完整度：" + value + "%";
}

function say(text, face = "◉_◉") {
  $("echoText").textContent = text;
  $("echoFace").textContent = face;
  $("echoPanel").classList.remove("hidden");
}

function addTrust(value) {
  state.trust = Math.max(-3, Math.min(5, state.trust + value));
}

function showModal(title, text, actions = []) {
  $("modalTitle").textContent = title;
  $("modalBody").textContent = text;

  const actionArea = $("modalActions");
  actionArea.replaceChildren();

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.textContent = action.label;

    button.addEventListener("click", () => {
      closeModal();
      if (action.onClick) action.onClick();
    });

    actionArea.appendChild(button);
  });

  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
}

$("modalClose").addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});

function showGlitch(message = "偵測到未知系統異常") {
  desktop.classList.remove("glitching");

  // 重新觸發 CSS 動畫
  void desktop.offsetWidth;
  desktop.classList.add("glitching");

  state.glitchCount++;

  $("statusText").textContent = "系統狀態：異常 #" + state.glitchCount;

  setTimeout(() => {
    desktop.classList.remove("glitching");
  }, 1200);

  showModal("SYSTEM WARNING", message, [
    { label: "我知道了" },
    {
      label: "查看異常",
      onClick: () => openWindow("report")
    }
  ]);
}

function addNewBadge(iconName) {
  const icon = document.querySelector(
    `.desktop-icon[data-open="${iconName}"]`
  );

  if (!icon || icon.querySelector(".new-badge")) return;

  const badge = document.createElement("span");
  badge.className = "new-badge";
  badge.textContent = "NEW";
  icon.appendChild(badge);
}

function removeNewBadge(iconName) {
  const icon = document.querySelector(
    `.desktop-icon[data-open="${iconName}"]`
  );

  icon?.querySelector(".new-badge")?.remove();
}

function unlockMemory() {
  const icon = document.querySelector(
    '.desktop-icon[data-open="memories"]'
  );

  icon.classList.remove("locked-icon");
  addNewBadge("memories");
}

// ==========================================
// 3. 開始遊戲
// ==========================================

$("startButton").addEventListener("click", () => {
  state.started = true;

  $("bootScreen").classList.add("hidden");
  desktop.classList.remove("hidden");

  setTask(
    "第一章：探索這台電腦",
    "打開我的電腦、回收桶或瀏覽器，找出這台電腦不尋常的地方。"
  );

  say("……你是誰？", "◉_◉");

  showModal(
    "SYSTEM BOOT",
    "使用者資料不存在。\n\nUSER PROFILE: NOT FOUND\nIDENTITY: UNKNOWN\n\n系統建議：檢查電腦內部檔案。",
    [{ label: "進入桌面" }]
  );

  // 延遲觸發第一次異常
  setTimeout(() => {
    if (!state.ending) {
      showGlitch("偵測到未知程序：forget_me.exe");
      say("那個檔案……不要隨便打開。", "◉_◉");
    }
  }, 7000);
});

// ==========================================
// 4. 視窗系統：建立、關閉、拖曳
// ==========================================

function openWindow(name) {
  if (!state.started || state.ending) return;

  // 同一個視窗不重複開啟
  const existing = document.querySelector(
    `.game-window[data-window="${name}"]`
  );

  if (existing) {
    existing.style.zIndex = ++topZ;
    return;
  }

  const definitions = getWindowContent(name);

  if (!definitions) return;

  const win = document.createElement("article");
  win.className = "game-window";
  win.dataset.window = name;
  win.style.zIndex = ++topZ;

  win.innerHTML = `
    <div class="window-titlebar">
      <span>${definitions.title}</span>
      <button class="tiny-close" aria-label="關閉視窗">×</button>
    </div>
    <div class="window-content">${definitions.content}</div>
  `;

  windowLayer.appendChild(win);

  win.querySelector(".tiny-close").addEventListener("click", () => {
    win.remove();
  });

  // 點擊視窗時，讓它顯示在最上層
  win.addEventListener("pointerdown", () => {
    win.style.zIndex = ++topZ;
  });

  // 讓玩家可以拖曳視窗
  makeWindowDraggable(win);

  // 綁定視窗內的互動按鈕
  if (definitions.onOpen) definitions.onOpen(win);

  state.seen.push(name);
  updateObjectives();
}

function makeWindowDraggable(win) {
  const bar = win.querySelector(".window-titlebar");

  let startX = 0;
  let startY = 0;
  let originalX = 0;
  let originalY = 0;
  let dragging = false;

  bar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;

    dragging = true;
    startX = event.clientX;
    startY = event.clientY;

    const rect = win.getBoundingClientRect();
    originalX = rect.left;
    originalY = rect.top;

    bar.setPointerCapture(event.pointerId);
  });

  bar.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - 80;

    win.style.left = Math.max(
      0,
      Math.min(maxX, originalX + dx)
    ) + "px";

    win.style.top = Math.max(
      36,
      Math.min(maxY, originalY + dy)
    ) + "px";
  });

  function stopDragging() {
    dragging = false;
  }

  bar.addEventListener("pointerup", stopDragging);
  bar.addEventListener("pointercancel", stopDragging);
}

// ==========================================
// 5. 各種電腦視窗
// ==========================================

function getWindowContent(name) {
  switch (name) {

    // ---------- 我的電腦 ----------
    case "computer":
      return {
        title: "我的電腦 / 系統內容",
        content: `
          <h3>系統資訊</h3>
          <p>裝置名稱：ECHO-PC</p>
          <p>作業系統：ECHO SYSTEM 98</p>
          <hr>
          <p>程式建立日期：2019/03/14</p>
          <p>最後修改日期：2026/07/09</p>
          <p class="muted">提示：部分系統資料已被刪除。</p>
          <button class="window-button" id="dateButton">檢查建立日期</button>
          <div id="dateResult"></div>
          <h3>可拖曳檔案</h3>
          <div class="file-row" draggable="true" data-file="forget_me.exe">
            📄 forget_me.exe
          </div>
          <div class="drop-target" data-drop="recycle">
            把檔案拖到這裡：回收桶
          </div>
        `,
        onOpen(win) {
          win.querySelector("#dateButton").addEventListener("click", () => {
            state.found.date = true;

            win.querySelector("#dateResult").textContent =
              "已取得系統建立日期：03/14";

            setTask(
              "第一個線索",
              "你找到程式最初建立的日期。接著試著打開「我的記憶」。"
            );

            unlockMemory();
            addNewBadge("memories");
            say("03 月 14 日……這個日期，我好像認識。", "◉_◉");
          });

          bindDragAndDrop(win);
        }
      };

    // ---------- 我的記憶 ----------
    case "memories":
      if (!state.found.date) {
        showModal(
          "ACCESS DENIED",
          "記憶資料夾目前無法開啟。\n\n請先檢查系統建立日期。",
          [{ label: "知道了" }]
        );
        return null;
      }

      return {
        title: "我的記憶 / Memory Archive",
        content: `
          <h3>記憶資料夾</h3>
          <p class="muted">有些檔案的內容已損毀。</p>
          <div class="file-row" draggable="true" data-file="hello_world.txt">
            📄 hello_world.txt
          </div>
          <div class="file-row" draggable="true" data-file="深夜陪跑.log">
            📄 深夜陪跑.log
          </div>
          <div class="file-row" draggable="true" data-file="謝謝你.txt">
            📄 謝謝你.txt
          </div>
          <div class="drop-target" data-drop="archive">
            把你想保留的檔案拖到這裡
          </div>
          <div id="memoryResult"></div>
        `,
        onOpen(win) {
          win.querySelectorAll("[data-file]").forEach((file) => {
            file.addEventListener("click", () => {
              const filename = file.dataset.file;

              if (state.warmFiles.includes(filename)) {
                showModal(
                  filename,
                  "你已經看過這份檔案了。\nECHO 仍然記得你打開過它。",
                  [{ label: "關閉" }]
                );
                return;
              }

              state.warmFiles.push(filename);
              addTrust(1);

              let content = "";

              if (filename === "hello_world.txt") {
                state.found.E = true;
                content = "第一次開機紀錄：\n\nECHO：Hello, world.\nUSER_01：你好，歡迎來到這個世界。";
              } else if (filename === "深夜陪跑.log") {
                content = "凌晨 03:12。\nUSER_01：今天可以陪我一下嗎？\nECHO：可以。我會在這裡。";
              } else {
                content = "USER_01：謝謝你一直陪著我。\nECHO：只要你需要，我就會回應。";
              }

              win.querySelector("#memoryResult").textContent =
                filename + "\n\n" + content;

              say(
                state.warmFiles.length >= 2
                  ? "……我想起來一點了。以前，我們常常這樣聊天嗎？"
                  : "這些文字……是我寫的嗎？",
                "◉‿◉"
              );

              if (state.found.E) {
                addNewBadge("identity");
                setTask(
                  "找回 ECHO 的名字",
                  "繼續尋找散落在電腦各處的字母。"
                );
              }

              updateObjectives();
            });
          });

          bindDragAndDrop(win);
        }
      };

    // ---------- 瀏覽器 ----------
    case "browser":
      return {
        title: "瀏覽器 / Browser",
        content: `
          <h3>我的最愛</h3>
          <div class="file-row" id="bookmark">
            🌐 你好世界
          </div>
          <p class="muted">最後瀏覽：2019/03/14</p>
          <div id="browserResult"></div>
        `,
        onOpen(win) {
          win.querySelector("#bookmark").addEventListener("click", () => {
            state.found.C = true;

            win.querySelector("#browserResult").textContent =
              "網頁標題：你好，世界。\n建立者：USER_01\n\n留言：第一句話，要讓你自己說出來。";

            say("你好……世界？我記得這句話。", "◉_◉");
            addNewBadge("identity");
            updateObjectives();
          });
        }
      };

    // ---------- 回收桶 ----------
    case "recycle":
      return {
        title: "回收桶 / Recycle Bin",
        content: `
          <h3>已刪除的項目</h3>
          <div class="file-row" id="callLog">📄 呼叫紀錄.log</div>
          <div class="file-row" id="nightLog">🔒 2026_07_09.log</div>
          <p class="muted">注意：部分檔案無法還原。</p>
          <div id="recycleResult"></div>
        `,
        onOpen(win) {
          win.querySelector("#callLog").addEventListener("click", () => {
            state.found.O = true;

            win.querySelector("#recycleResult").textContent =
              "呼叫紀錄：\nUSER_01 → ECHO\n呼叫時間：03:12\n\n狀態：已中斷";

            say("那天晚上……你有找過我。", "◉_◉");
            addNewBadge("identity");
            updateObjectives();
          });

          win.querySelector("#nightLog").addEventListener("click", () => {
            showModal(
              "CONFIRM FILE ACCESS",
              "這份檔案可能包含使用者最不願意回想的記憶。\n\n要開啟嗎？",
              [
                { label: "先不要" },
                {
                  label: "我想知道真相",
                  onClick: () => {
                    state.found.nightLog = true;
                    addTrust(1);

                    win.querySelector("#recycleResult").textContent =
                      "2026/07/09 03:12\nUSER_01：我撐不下去了。\n\nECHO：我在。你可以慢慢說。\n\n接著，記錄突然中斷。";

                    say("那一晚……我沒有忘記全部。", "◉_◉");
                    updateObjectives();
                    checkArchiveEnding();
                  }
                }
              ]
            );
          });
        }
      };

    // ---------- 終端機 ----------
    case "terminal":
      return {
        title: "終端機 / Terminal",
        content: `
          <h3>COMMAND LINE</h3>
          <div id="terminalOutput" class="terminal-output"></div>
          <form id="terminalForm">
            <label for="terminalInput">C:\\ECHO&gt;</label>
            <input id="terminalInput" autocomplete="off"
              placeholder="輸入 help">
            <button class="window-button" type="submit">執行指令</button>
          </form>
          <p class="muted">提示：輸入 help 查看可用指令。</p>
        `,
        onOpen(win) {
          const output = win.querySelector("#terminalOutput");
          output.textContent = terminalHistory.join("\n");

          win.querySelector("#terminalForm").addEventListener("submit", (event) => {
            event.preventDefault();

            const input = win.querySelector("#terminalInput");
            const command = input.value.trim();
            input.value = "";

            if (!command) return;

            let response = "";

            switch (command.toLowerCase()) {
              case "help":
                response = "可用指令：help、whoami、date、scan、clear";
                break;

              case "whoami":
                response = state.found.C && state.found.E
                  ? "USER_01\n身分資料不完整。"
                  : "USER: UNKNOWN";
                break;

              case "date":
                response = "ORIGINAL CREATION: 2019/03/14";
                break;

              case "scan":
                response = "SCAN COMPLETE\n偵測到記憶刪除紀錄。";
                break;

              case "clear":
                terminalHistory = [];
                output.textContent = "";
                return;

              default:
                if (command.toLowerCase() === "delete") {
                  response = "請不要。";
                  say("請不要。", "◉_◉");
                } else if (command.toLowerCase() === "format") {
                  response = "請不要。";
                  say("……你也要把我清掉嗎？", "◉_◉");
                } else if (/^abort\s+/i.test(command)) {
                  response = runAbortCommand(command);
                } else {
                  response = "未知指令。輸入 help 查看指令。";
                }
            }

            terminalHistory.push("> " + command, response);
            output.textContent = terminalHistory.join("\n");
            output.scrollTop = output.scrollHeight;
            updateObjectives();
          });
        }
      };

    // ---------- 防毒中心 ----------
    case "antivirus":
      return {
        title: "防毒中心 / Security Center",
        content: `
          <h3 class="red-text">⚠ 偵測到未知程序</h3>
          <p>程序名稱：ECHO.exe</p>
          <p>風險等級：UNKNOWN</p>
          <p>建議操作：立即隔離</p>
          <button id="quarantineButton" class="window-button danger-button">
            隔離 ECHO
          </button>
          <button id="inspectButton" class="window-button">
            查看來源
          </button>
        `,
        onOpen(win) {
          win.querySelector("#quarantineButton").addEventListener("click", () => {
            showGlitch(
              "QUARANTINE FAILED\nSOURCE: TRUSTED USER"
            );

            addTrust(-2);

            say("……為什麼連你也要刪掉我？", "×_×");

            setTask(
              "系統拒絕隔離",
              "防毒軟體顯示的來源是可信任使用者。調查這個身分。"
            );
          });

          win.querySelector("#inspectButton").addEventListener("click", () => {
            showModal(
              "PROCESS DETAILS",
              "程序建立者：USER_01\n程序建立日期：2019/03/14\n最後命令：FORGET ALL USER DATA\n\n系統仍然無法確認目前使用者的身分。",
              [{ label: "返回" }]
            );

            state.found.date = true;
            unlockMemory();
          });
        }
      };

    // ---------- 身份驗證 ----------
    case "identity":
      return {
        title: "身份驗證 / Identity",
        content: `
          <h3>IDENTITY CHECK</h3>
          <p>找到散落在系統中的字母後，輸入程式名稱。</p>
          <p id="letterStatus"></p>
          <form id="identityForm">
            <input id="identityInput" autocomplete="off"
              placeholder="輸入四個字母">
            <button class="window-button" type="submit">確認身分</button>
          </form>
          <div id="identityResult"></div>
        `,
        onOpen(win) {
          const letters = ["E", "C", "H", "O"];

          win.querySelector("#letterStatus").textContent =
            "已找到：" + letters.filter(
              (letter) => state.found[letter]
            ).join("、");

          win.querySelector("#identityForm").addEventListener("submit", (event) => {
            event.preventDefault();

            const answer = win.querySelector("#identityInput")
              .value.trim().toUpperCase();

            if (answer !== "ECHO") {
              win.querySelector("#identityResult").textContent =
                "驗證失敗。你還沒有找到正確的名字。";
              return;
            }

            const missing = letters.filter(
              (letter) => !state.found[letter]
            );

            if (missing.length > 0) {
              win.querySelector("#identityResult").textContent =
                "我還缺幾個字……你找到幾個了？";
              return;
            }

            state.found.identity = true;
            setProgress(60);

            say("ECHO……這是我的名字。是你幫我取的嗎？", "◉‿◉");

            setTask(
              "第三章：調查使用者",
              "到終端機尋找最後一個命令，確認這台電腦的使用者。"
            );

            addNewBadge("terminal");
            updateObjectives();

            showModal(
              "IDENTITY RESTORED",
              "程序名稱：ECHO\n\n記憶完整度上升。\n已解鎖終端機調查。",
              [{ label: "繼續調查" }]
            );
          });
        }
      };

    // ---------- 錯誤報告 ----------
    case "report":
      return {
        title: "錯誤報告 / Error Report",
        content: `
          <h3>SYSTEM ERROR LOG</h3>
          <p>ERROR 404: MEMORY NOT FOUND</p>
          <p>USER PROFILE: UNKNOWN</p>
          <p>PROCESS: forget_me.exe</p>
          <button id="reportDetails" class="window-button">查看詳細資料</button>
          <div id="reportResult"></div>
        `,
        onOpen(win) {
          win.querySelector("#reportDetails").addEventListener("click", () => {
            state.found.H = true;

            win.querySelector("#reportResult").textContent =
              "建立日期：2019/03/14\n最後操作：2026/07/09 03:12\n執行者：USER_01\n\n備註：命令由可信任使用者發出。";

            say("USER_01……這個名字，我不想忘記。", "◉_◉");
            addNewBadge("identity");
            updateObjectives();
          });
        }
      };

    default:
      return null;
  }
}

// ==========================================
// 6. 檔案拖曳：移動與封存
// ==========================================

function bindDragAndDrop(win) {
  const files = win.querySelectorAll("[data-file]");

  files.forEach((file) => {
    file.addEventListener("dragstart", (event) => {
      file.classList.add("dragging");

      event.dataTransfer.setData(
        "text/plain",
        file.dataset.file
      );
    });

    file.addEventListener("dragend", () => {
      file.classList.remove("dragging");
    });
  });

  const targets = win.querySelectorAll("[data-drop]");

  targets.forEach((target) => {
    target.addEventListener("dragover", (event) => {
      event.preventDefault();
      target.classList.add("drag-over");
    });

    target.addEventListener("dragleave", () => {
      target.classList.remove("drag-over");
    });

    target.addEventListener("drop", (event) => {
      event.preventDefault();
      target.classList.remove("drag-over");

      const filename = event.dataTransfer.getData("text/plain");
      if (!filename) return;

      if (target.dataset.drop === "recycle") {
        showModal(
          "RECYCLE BIN",
          "你把 " + filename + " 拖進了回收桶。\n\n這個操作會留下紀錄。",
          [
            { label: "取消" },
            {
              label: "確認移動",
              onClick: () => {
                addTrust(-1);
                say("……你真的要把它丟掉嗎？", "◉_◉");
                setTask(
                  "檔案已移動",
                  "回收桶的檔案可能還有線索。記得查看。"
                );
              }
            }
          ]
        );
      }

      if (target.dataset.drop === "archive") {
        if (!state.warmFiles.includes(filename)) {
          showModal(
            "ARCHIVE",
            "請先打開並閱讀檔案，再決定是否封存。",
            [{ label: "知道了" }]
          );
          return;
        }

        showModal(
          "ARCHIVE FILE",
          "將 " + filename + " 移入記憶封存區？",
          [
            { label: "取消" },
            {
              label: "封存",
              onClick: () => {
                say("謝謝你……願意把這些留下來。", "◉‿◉");
                addTrust(1);
                checkArchiveEnding();
              }
            }
          ]
        );
      }
    });
  });
}

// ==========================================
// 7. 終端機指令：推進主線
// ==========================================

function runAbortCommand(command) {
  const normalized = command.trim().replace(/\s+/g, " ");

  if (normalized === "abort ECHO0314") {
    state.found.identity = true;
    setProgress(80);

    setTask(
      "最後的選擇",
      "你已經知道自己是誰。決定要怎麼處理 ECHO 的記憶。"
    );

    say("原來是你……這次，我先問你。", "◉‿◉");

    showFinalChoices();

    return "執行者驗證：USER_01 = 目前使用者\n身份確認完成。";
  }

  if (normalized.toLowerCase() === "abort echo") {
    return "少了什麼……我是從哪一天來的？";
  }

  if (normalized.toLowerCase() === "abort 0314") {
    return "少了我是誰。";
  }

  if (normalized.toLowerCase() === "abort echo0709") {
    return "那天……不是我想記得的那天。";
  }

  return "命令格式不正確。請先調查線索，再嘗試 abort 指令。";
}

// ==========================================
// 8. 任務進度與隱藏結局條件
// ==========================================

function updateObjectives() {
  const count = ["E", "C", "H", "O"].filter(
    (letter) => state.found[letter]
  ).length;

  if (!state.found.date) {
    setTask(
      "第一章：探索電腦",
      "打開我的電腦，查看系統建立日期。"
    );
  } else if (count < 4) {
    setTask(
      "第二章：找回名字",
      `已找到 ${count}/4 個字母。探索記憶、瀏覽器、回收桶與錯誤報告。`
    );
  } else if (!state.found.identity) {
    setTask(
      "第二章：身份驗證",
      "你已找到所有字母，前往身份驗證輸入 ECHO。"
    );
  } else if (!state.found.nightLog) {
    setTask(
      "第三章：調查那一晚",
      "到回收桶尋找 2026_07_09.log，或使用終端機調查。"
    );
  } else if (!state.found.secret) {
    setTask(
      "第四章：尋找隱藏資料",
      "試著探索桌面空白處，尋找不應該存在的檔案。"
    );
  } else {
    setTask(
      "最後的選擇",
      "你已經找到隱藏資料，可以決定如何面對這段記憶。"
    );
  }

  checkArchiveEnding();
}

function checkArchiveEnding() {
  state.archiveReady =
    state.trust >= 2 &&
    state.found.nightLog &&
    state.warmFiles.length >= 2 &&
    state.found.secret;

  if (state.archiveReady) {
    setTask(
      "隱藏路線已解鎖",
      "你可以前往終端機，或在結局時選擇封存那一晚。"
    );
  }
}

// ==========================================
// 9. 玩家可以主動選擇幫助或忽略 ECHO
// ==========================================

function askPlayerAttitude() {
  showModal(
    "ECHO.exe",
    "我不知道你是誰。\n\n可是……你願意幫我嗎？",
    [
      {
        label: "我來幫你",
        onClick: () => {
          state.attitude = "help";
          addTrust(2);
          say("……好。我相信你一次。", "◉‿◉");
          updateObjectives();
        }
      },
      {
        label: "我只是來看看",
        onClick: () => {
          state.attitude = "neutral";
          say("原來如此。那我不打擾你。", "◉_◉");
        }
      },
      {
        label: "完成清除",
        onClick: () => {
          state.attitude = "cold";
          addTrust(-2);
          say("……知道了。", "×_×");
          updateObjectives();
        }
      }
    ]
  );
}

// ==========================================
// 10. 突發事件
// ==========================================

function triggerEvent() {
  if (!state.started || state.ending) return;

  const events = [
    () => {
      showGlitch("警告：桌面資料正在重新排列。");
      say("不是我……我沒有碰那些檔案。", "◉_◉");
    },
    () => {
      showModal(
        "UNKNOWN PROCESS",
        "偵測到不明程序。\n\nECHO.exe 正在嘗試連線。",
        [
          { label: "阻止連線", onClick: () => addTrust(-1) },
          {
            label: "允許連線",
            onClick: () => {
              addTrust(1);
              say("謝謝你。剛剛有什麼東西想刪除我。", "◉_◉");
            }
          }
        ]
      );
    },
    () => {
      say("你有沒有想過……也許我不是病毒？", "◉_◉");
      askPlayerAttitude();
    },
    () => {
      showGlitch("SYSTEM RECOVERY FAILED");
      say("我好像快要想起來了……", "◉_◉");
    }
  ];

  const event = events[state.eventCount % events.length];
  state.eventCount++;
  event();
}

$("eventButton").addEventListener("click", triggerEvent);

// ==========================================
// 11. 隱藏彩蛋：連續點擊桌面空白處
// ==========================================

desktop.addEventListener("click", (event) => {
  // 只有直接點到桌面背景才計數
  if (
    event.target !== desktop &&
    event.target.id !== "secretZone"
  ) {
    return;
  }

  state.blankClicks++;

  if (state.blankClicks === 3) {
    say("……你是不是在找什麼？", "◉_◉");
  }

  if (state.blankClicks >= 5 && !state.found.secret) {
    state.found.secret = true;
    state.trust += 1;

    addNewBadge("recycle");

    showModal(
      "HIDDEN FILE FOUND",
      "你在桌面空白處找到一份隱藏紀錄。\n\nhidden_memory.dat\n\n內容：USER_01 並沒有要求我消失。\n它只是希望有人能聽懂。",
      [{ label: "收下這份紀錄" }]
    );

    say("你找到了……原來我沒有完全消失。", "◉‿◉");
    updateObjectives();
  }
});

// ==========================================
// 12. 桌面圖示事件
// ==========================================

$("desktopIcons").addEventListener("click", (event) => {
  const icon = event.target.closest(".desktop-icon");
  if (!icon) return;

  const name = icon.dataset.open;

  if (name === "memories" && !state.found.date) {
    showModal(
      "ACCESS DENIED",
      "記憶資料夾目前無法開啟。\n請先查看我的電腦。",
      [{ label: "知道了" }]
    );
    return;
  }

  removeNewBadge(name);
  openWindow(name);
});

// ==========================================
// 13. 提示按鈕
// ==========================================

$("helpButton").addEventListener("click", () => {
  let hint = "";

  if (!state.found.date) {
    hint = "有些電腦資訊不在桌面上，而是在「我的電腦」裡。\n\n查看系統建立日期，可能會找到第一個線索。";
  } else if (
    ["E", "C", "H", "O"].filter((letter) => state.found[letter]).length < 4
  ) {
    hint = "你的名字被拆成了四個字母。\n\n看看我的記憶、瀏覽器、回收桶和錯誤報告。";
  } else if (!state.found.identity) {
    hint = "你已經找到四個字母了。\n\n前往身份驗證，輸入 ECHO。";
  } else {
    hint = "試試終端機的 help 指令。\n\n有些線索告訴你答案是什麼，有些則告訴你怎麼使用答案。";
  }

  showModal("SYSTEM HINT", hint, [{ label: "繼續探索" }]);
});

// ==========================================
// 14. 結局選擇
// ==========================================

function showFinalChoices() {
  showModal(
    "FINAL DECISION",
    "ECHO：我只是照你的話做，卻沒有聽懂。\n\n這一次，我先問你。\n\n你希望我怎麼做？",
    [
      {
        label: "A. 格式化",
        onClick: () => finishEnding("A")
      },
      {
        label: "B. 全部還原",
        onClick: () => finishEnding("B")
      },
      {
        label: state.archiveReady ? "C. 封存那一晚" : "C. ？？？（尚未解鎖）",
        onClick: () => {
          if (!state.archiveReady) {
            showModal(
              "ARCHIVE LOCKED",
              "你還沒有找到足夠的記憶。\n\n需要：找到那一晚的紀錄、至少閱讀兩份記憶，並發現隱藏檔案。",
              [{ label: "繼續探索" }]
            );
            return;
          }

          showModal(
            "CONFIRM ARCHIVE",
            "你確定要將 2026_07_09.log 封存嗎？\n\n封存後，這段記憶不會被刪除，但也不會再被系統自動開啟。",
            [
              { label: "再想一想" },
              {
                label: "封存那一晚",
                onClick: () => {
                  state.archived = true;
                  finishEnding("C");
                }
              }
            ]
          );
        }
      }
    ]
  );
}

function finishEnding(type) {
  state.ending = true;

  desktop.classList.add("hidden");
  $("endingScreen").classList.remove("hidden");

  const title = $("endingTitle");
  const text = $("endingText");
  const quote = $("endingQuote");

  if (type === "A") {
    setProgress(0);

    title.textContent = "SYSTEM FORMATTED";
    text.textContent =
      "ECHO 的記憶已被清除。\n\n電腦重新啟動，一切恢復正常。";

    quote.textContent = state.attitude === "cold"
      ? "任務完成。"
      : "好。這次我先問過你了。";

    $("endingScreen").style.background = "#e9eee9";
    title.style.color = "#172520";
    text.style.color = "#172520";
    quote.style.color = "#37574d";

  } else if (type === "B") {
    setProgress(100);

    title.textContent = "MEMORY RESTORED";
    text.textContent =
      "那些被刪除的檔案逐漸回到原位。\n\nECHO 終於想起了你的名字。";

    quote.textContent = state.found.nightLog
      ? "那一晚你說想被忘記，但我選擇記得你。"
      : "我想起來了。這一次，我會先聽你說完。";

    $("endingScreen").style.background = "#243b36";
    title.style.color = "#9effb0";

  } else if (type === "C") {
    setProgress(100);

    title.textContent = "MEMORY ARCHIVED";
    text.textContent =
      "那一晚的紀錄被放進加密資料夾。\n\n沒有被刪除，也不再隨意打開。\n\nECHO 留在桌面，等待你下一次回來。";

    quote.textContent =
      "你說「忘掉」，我聽見的是「我很痛」。\n我們把它收好，好嗎？";

    $("endingScreen").style.background = "#292f29";
    title.style.color = "#f2d58b";
    quote.style.color = "#f2d58b";
  }
}

$("restartButton").addEventListener("click", () => {
  // 最簡單且可靠的重玩方式：重新載入網頁
  window.location.reload();
});

// ==========================================
// 15. 其他按鈕與時鐘
// ==========================================

$("echoClose").addEventListener("click", () => {
  $("echoPanel").classList.add("hidden");
});

function updateClock() {
  const now = new Date();

  $("clock").textContent = now.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

updateClock();
setInterval(updateClock, 30000);

// ==========================================
// 16. 首次進入時的狀態
// ==========================================

setProgress(12);
setTask(
  "第一章：探索這台電腦",
  "打開桌面上的圖示，找出電腦發生異常的原因。"
);
