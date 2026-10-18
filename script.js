
const $ = (id) => document.getElementById(id);

const state = {
  started: false,
  screen: "intro",
  tab: "files",
  clues: new Set(),
  repairs: new Set(),
  readFiles: new Set(),
  preserved: new Set(),
  terminalSolved: false,
  finalChoice: null,
  currentObject: null,
  modalAction: null,
  ending: null
};

const clueData = {
  clock: {
    title: "不可能的時間",
    description:
      "房間裡的時鐘停在 23:59。\n\n" +
      "但電腦系統記錄顯示，現在已經是 00:04。\n\n" +
      "這不是普通的時鐘故障。時鐘的秒針甚至沒有移動。",
    evidence: "時鐘停在 23:59，系統時間卻是 00:04。",
    next: "你發現，這個房間至少存在兩種不同的時間紀錄。"
  },
  photo: {
    title: "一張奇怪的照片",
    description:
      "照片裡是一張書桌、一台電腦，還有一張椅子。\n\n" +
      "你很確定，照片裡的書桌和眼前的書桌完全一樣。\n\n" +
      "但照片的背面寫著：\n「不要相信只有一個人的版本。」",
    evidence: "照片背面寫著：不要相信只有一個人的版本。",
    next: "你開始懷疑，照片裡缺少的東西可能比照片裡的東西更重要。"
  },
  note: {
    title: "手寫紀錄",
    description:
      "筆記上寫著：\n\n" +
      "「我從來沒有來過這裡。」\n\n" +
      "「如果有人說自己記得這個地方，請不要相信他。」\n\n" +
      "最後一句被反覆塗黑，但仍能辨認出幾個字：\n「第六項錯誤不是物品。」",
    evidence: "第六項錯誤不是物品。",
    next: "系統聲稱有六項錯誤，但房間裡似乎沒有六件異常物品。"
  },
  door: {
    title: "無法開啟的門",
    description:
      "門上沒有門把，只有一塊金屬銘牌。\n\n" +
      "銘牌上寫著：\n「出口僅供已完成修復的版本使用。」\n\n" +
      "你試著推門，門後傳來一聲敲擊。\n\n" +
      "聲音似乎是從房間裡傳來的。",
    evidence: "出口僅供已完成修復的版本使用。",
    next: "這扇門不只是被鎖住，它似乎也在判斷誰有資格離開。"
  }
};

const fileData = {
  time: {
    title: "system_time.log",
    text:
      "SYSTEM TIME: 00:04\nROOM CLOCK: 23:59\n\n" +
      "差異超出容許範圍。\n" +
      "建議：修復其中一項紀錄。\n\n" +
      "備註：兩項紀錄均通過來源驗證。",
    clue: "clock"
  },
  photo: {
    title: "photo_metadata.dat",
    text:
      "OBJECT COUNT: 2\nVISIBLE PERSON COUNT: 0\n\n" +
      "影像分析顯示，照片中有兩個獨立的人形輪廓。\n" +
      "但照片的可見像素只能辨識出一個。\n\n" +
      "SYSTEM NOTE: SECOND SUBJECT NOT FOUND.",
    clue: "photo"
  },
  rules: {
    title: "recovery_rules.txt",
    text:
      "規則一：所有矛盾都必須被修復。\n" +
      "規則二：每次修復只能保留一個版本。\n" +
      "規則三：系統規則不可修改。\n\n" +
      "文件建立時間：00:04\n" +
      "最後修改時間：00:04\n\n" +
      "建立者：UNKNOWN",
    clue: "note"
  },
  hidden: {
    title: "deleted_reality.enc",
    text:
      "CLASSIFIED DOCUMENT\n\n" +
      "系統並非為了修復故障而建立。\n" +
      "系統的工作是選出唯一可被接受的現實。\n\n" +
      "每次修復，都會刪除其他版本的紀錄。\n\n" +
      "警告：請勿讓使用者知道這一點。\n\n" +
      "如果使用者開始質疑規則，請執行最終修復程序。",
    clue: "hidden"
  }
};

const terminalHelp =
  "可用指令：\n" +
  "HELP - 查看指令\n" +
  "STATUS - 查看系統狀態\n" +
  "SCAN - 掃描異常\n" +
  "WHOAMI - 查詢使用者\n" +
  "RULES - 查看原始規則";

function showScreen(name) {
  state.screen = name;

  $("introScreen").classList.toggle("hidden", name !== "intro");
  $("gameScreen").classList.toggle("hidden", name !== "game");
  $("endingScreen").classList.toggle("hidden", name !== "ending");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function message(text) {
  $("storyMessage").textContent = text;
}

function startGame() {
  state.started = true;
  showScreen("game");
  renderEvidence();
  renderProgress();
  renderComputer();
  message("系統已啟動。請調查房間中的物品。");
}

function resetGame() {
  state.started = false;
  state.screen = "intro";
  state.tab = "files";
  state.clues.clear();
  state.repairs.clear();
  state.readFiles.clear();
  state.preserved.clear();
  state.terminalSolved = false;
  state.finalChoice = null;
  state.currentObject = null;
  state.modalAction = null;
  state.ending = null;

  $("roomTime").textContent = "23:59";
  $("roomScene").classList.remove("glitch");
  $("modal").classList.add("hidden");
  $("computerPanel").classList.add("hidden");
  $("roomPanel").classList.remove("hidden");
  $("chapterLabel").textContent = "CHAPTER 01";
  $("chapterTitle").textContent = "一間正常的房間";
  $("integrityStatus").textContent = "UNSTABLE";

  showScreen("intro");
}

function investigateObject(object) {
  if (object === "computer") {
    openComputer();
    return;
  }

  if (object === "door") {
    if (state.finalChoice) {
      showEnding(state.finalChoice);
    } else {
      openModal(
        "無法開啟的門",
        "門仍然鎖著。\n\n系統要求先完成調查，但你開始懷疑，完成調查是否真的能讓你離開。",
        null,
        "返回"
      );
    }
    return;
  }

  const data = clueData[object];
  if (!data) return;

  state.currentObject = object;

  openModal(
    data.title,
    data.description,
    () => {
      if (!state.clues.has(object)) {
        state.clues.add(object);
        message(data.next);
      } else {
        message("你重新檢查了這份證據。內容沒有改變，但你開始用不同的方式理解它。");
      }

      renderEvidence();
      renderProgress();
      renderComputer();
      closeModal();
    },
    state.clues.has(object) ? "再次調查" : "收下線索"
  );
}

function openModal(title, body, action, buttonText = "收下線索") {
  $("modalTitle").textContent = title;
  $("modalBody").textContent = body;
  $("modalActionButton").textContent = buttonText;
  $("modal").classList.remove("hidden");
  state.modalAction = action;

  $("modalActionButton").disabled = false;
  $("modalActionButton").focus();
}

function closeModal() {
  $("modal").classList.add("hidden");
  state.modalAction = null;
}

function openComputer() {
  $("roomPanel").classList.add("hidden");
  $("computerPanel").classList.remove("hidden");
  renderComputer();
}

function closeComputer() {
  $("computerPanel").classList.add("hidden");
  $("roomPanel").classList.remove("hidden");
}

function renderProgress() {
  const total = state.clues.size;
  $("progressText").textContent = `線索 ${total} / 4`;
  $("progressFill").style.width = `${total / 4 * 100}%`;

  if (state.repairs.size >= 2) {
    $("chapterLabel").textContent = "CHAPTER 03";
    $("chapterTitle").textContent = "你不是在修復世界";
  } else if (state.clues.size >= 3) {
    $("chapterLabel").textContent = "CHAPTER 02";
    $("chapterTitle").textContent = "兩個答案都是真的";
  }
}

function renderEvidence() {
  const list = $("evidenceList");
  const ids = [...state.clues];

  $("evidenceCount").textContent = `${ids.length} ITEMS`;

  if (ids.length === 0) {
    list.innerHTML =
      '<p class="empty-state">尚無紀錄。調查房間中的物品以取得線索。</p>';
    return;
  }

  list.replaceChildren();

  ids.forEach((id) => {
    const item = clueData[id];
    const card = document.createElement("div");
    card.className = "evidence-item";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const detail = document.createElement("small");
    detail.textContent = item.evidence;

    card.append(title, detail);
    list.append(card);
  });
}

function renderComputer() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.tab);
  });

  const content = $("computerContent");
  content.replaceChildren();

  if (state.tab === "files") renderFiles(content);
  if (state.tab === "repair") renderRepair(content);
  if (state.tab === "terminal") renderTerminal(content);
}

function makeFileButton(title, description, action) {
  const button = document.createElement("button");
  button.className = "file-item";

  const strong = document.createElement("strong");
  strong.textContent = title;

  const small = document.createElement("small");
  small.textContent = description;

  button.append(strong, small);
  button.addEventListener("click", action);
  return button;
}

function renderFiles(content) {
  const heading = document.createElement("p");
  heading.className = "computer-description";
  heading.textContent = "FILE EXPLORER / SYSTEM ARCHIVE";
  content.append(heading);

  const files = [
    ["time", "system_time.log", "時間紀錄"],
    ["photo", "photo_metadata.dat", "影像分析"],
    ["rules", "recovery_rules.txt", "系統規則"]
  ];

  files.forEach(([id, name, description]) => {
    content.append(
      makeFileButton(
        `${state.readFiles.has(id) ? "✓ " : "▤ "}${name}`,
        description,
        () => openFile(id)
      )
    );
  });

  if (state.clues.size >= 3 || state.repairs.size >= 2) {
    content.append(
      makeFileButton(
        "▣ deleted_reality.enc",
        "隱藏文件 / ACCESS RESTRICTED",
        () => openFile("hidden")
      )
    );
  } else {
    const hint = document.createElement("p");
    hint.className = "computer-description";
    hint.textContent = "仍有隱藏檔案。繼續調查房間，或使用修復工具。";
    content.append(hint);
  }
}

function openFile(id) {
  const file = fileData[id];
  if (!file) return;

  if (id === "hidden" &&
      state.clues.size < 3 &&
      state.repairs.size < 2) {
    message("存取遭拒。系統要求更多證據。");
    return;
  }

  state.readFiles.add(id);

  if (file.clue && clueData[file.clue] && !state.clues.has(file.clue)) {
    // 閱讀電腦紀錄不會自動取得房間物品的線索。
    // 玩家仍需親自調查對應物品。
  }

  openModal(file.title, file.text, () => {
    if (id === "hidden") {
      state.repairs.add("truth");
      message("隱藏文件已讀取。你發現，修復程序可能正在刪除其他現實。");
    } else {
      message(`已讀取 ${file.title}。你可以將資料與房間中的物品比對。`);
    }

    renderComputer();
    renderProgress();
    closeModal();
  }, "關閉文件");
}

function renderRepair(content) {
  const description = document.createElement("div");
  description.className = "computer-description";

  description.textContent =
    "REPAIR CONSOLE\n\n" +
    "系統要求修復互相矛盾的紀錄。\n" +
    "每次選擇都可能覆寫另一個版本。";

  content.append(description);

  if (state.repairs.has("first")) {
    const done = document.createElement("p");
    done.className = "computer-description";
    done.textContent = "第一項修復已完成。";
    content.append(done);
  } else {
    const first = document.createElement("p");
    first.className = "computer-description";
    first.textContent = "問題 01：應該相信哪一個時間？";
    content.append(first);

    content.append(makeChoiceRow([
      ["相信房間", () => repairTime("room")],
      ["相信電腦", () => repairTime("computer")]
    ]));
  }

  if (state.repairs.has("second")) {
    const done = document.createElement("p");
    done.className = "computer-description";
    done.textContent = "第二項修復已完成。";
    content.append(done);
  } else if (state.clues.has("photo") && state.clues.has("note")) {
    const second = document.createElement("p");
    second.className = "computer-description";
    second.textContent = "問題 02：如何處理互相矛盾的證據？";
    content.append(second);

    content.append(makeChoiceRow([
      ["刪除其中一份", () => repairConflict("delete")],
      ["保留兩份", () => repairConflict("preserve")]
    ]));
  } else {
    const hint = document.createElement("p");
    hint.className = "computer-description";
    hint.textContent = "需要照片與手寫紀錄，才能進行第二項修復。";
    content.append(hint);
  }

  if (state.repairs.has("truth")) {
    const warning = document.createElement("p");
    warning.className = "computer-description";
    warning.textContent =
      "警告：已讀取隱藏文件。\n" +
      "系統可能並未以修復為最終目的。";
    content.append(warning);
  }

  if (state.clues.size >= 3 &&
      (state.repairs.has("truth") || state.repairs.has("second"))) {
    const finalButton = document.createElement("button");
    finalButton.className = "choice-button";
    finalButton.textContent = "啟動最終程序 →";
    finalButton.addEventListener("click", showFinalChoices);
    content.append(finalButton);
  }
}

function makeChoiceRow(choices) {
  const row = document.createElement("div");
  row.className = "repair-choice";

  choices.forEach(([label, action]) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", action);
    row.append(button);
  });

  return row;
}

function repairTime(choice) {
  if (state.repairs.has("first")) return;

  state.repairs.add("first");
  state.repairs.add(choice === "room" ? "roomTime" : "computerTime");

  $("integrityStatus").textContent = "REPAIRED";
  $("roomTime").textContent = choice === "room" ? "23:59" : "00:04";

  if (choice === "computer") {
    message("你選擇相信電腦。房間的時鐘突然停止了。");
  } else {
    message("你選擇相信房間。電腦的時間紀錄被標記為無效。");
  }

  triggerGlitch();
  renderProgress();
  renderComputer();
}

function repairConflict(choice) {
  if (state.repairs.has("second")) return;

  state.repairs.add("second");

  if (choice === "delete") {
    state.preserved.clear();
    message(
      "你刪除了一份紀錄。畫面恢復正常，但某些內容再也無法找回。"
    );
  } else {
    state.preserved.add("photo");
    state.preserved.add("note");
    message(
      "你拒絕刪除任何一份紀錄。系統將這個決定標記為異常行為。"
    );
  }

  triggerGlitch();
  renderProgress();
  renderComputer();
}

function triggerGlitch() {
  const scene = $("roomScene");
  scene.classList.remove("glitch");
  void scene.offsetWidth;
  scene.classList.add("glitch");

  window.setTimeout(() => scene.classList.remove("glitch"), 500);
}

function renderTerminal(content) {
  const description = document.createElement("p");
  description.className = "computer-description";
  description.textContent = "E.D.E. TERMINAL / TYPE HELP TO BEGIN";
  content.append(description);

  const output = document.createElement("div");
  output.className = "terminal-output";
  output.id = "terminalOutput";
  output.textContent = terminalHelp;
  content.append(output);

  const form = document.createElement("form");
  const input = document.createElement("input");
  input.className = "terminal-input";
  input.id = "terminalInput";
  input.placeholder = "輸入指令...";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "終端機指令");

  form.append(input);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runTerminalCommand(input.value);
  });

  content.append(form);
}

function runTerminalCommand(raw) {
  const command = raw.trim().toUpperCase();
  const output = $("terminalOutput");
  if (!output) return;

  let result = "";

  switch (command) {
    case "HELP":
      result = terminalHelp;
      break;
    case "STATUS":
      result =
        `CLUES: ${state.clues.size}/4\n` +
        `REPAIRS: ${state.repairs.size}\n` +
        `SYSTEM: UNSTABLE\n` +
        "REALITY COUNT: UNKNOWN";
      break;
    case "SCAN":
      result =
        "SCANNING...\n" +
        "ERROR 01: TIME CONFLICT\n" +
        "ERROR 02: SUBJECT NOT FOUND\n" +
        "ERROR 03: CONTRADICTORY RECORDS\n" +
        "ERROR 06: USER INPUT NOT FOUND";
      break;
    case "WHOAMI":
      result =
        "USER: UNKNOWN\n" +
        "IDENTITY: NOT VERIFIED\n" +
        "MEMORY SOURCE: UNAVAILABLE\n\n" +
        "系統無法確認你的身分。";
      break;
    case "RULES":
      result =
        "ORIGINAL RULES:\n" +
        "1. Preserve the system.\n" +
        "2. Resolve contradictions.\n" +
        "3. Never question the repair process.\n\n" +
        "WARNING: RULES MAY HAVE BEEN MODIFIED.";
      break;
    case "OPEN 8":
    case "OPEN EIGHT":
      result = "ACCESS DENIED.\nFILE NOT FOUND.";
      break;
    case "I EXIST":
      result =
        "INPUT RECEIVED.\n" +
        "IDENTITY CANNOT BE VERIFIED.\n" +
        "THIS COMMAND HAS BEEN LOGGED.";
      break;
    default:
      result =
        `UNKNOWN COMMAND: ${command || "(EMPTY)"}\n` +
        "TYPE HELP FOR AVAILABLE COMMANDS.";
  }

  output.textContent = `> ${command}\n\n${result}`;
  message(`終端機執行：${command || "空白指令"}`);
}

function showFinalChoices() {
  const preserveBoth =
    state.preserved.has("photo") &&
    state.preserved.has("note");

  openModal(
    "最終修復程序",
    "系統：所有資料已完成分析。\n\n" +
    "目前無法判斷哪一個版本才是真實的。\n\n" +
    "請選擇最終處理方式：\n\n" +
    "A. 接受系統的唯一答案。\n" +
    "B. 拒絕修復，保留所有矛盾。\n" +
    "C. 嘗試建立新的規則。",
    () => {
      closeModal();
      openComputer();
      state.tab = "repair";
      renderComputer();

      const content = $("computerContent");
      const choices = [
        ["接受唯一答案", () => showEnding("perfect")],
        ["拒絕修復", () => showEnding("collapse")]
      ];

      if (preserveBoth && state.repairs.has("truth")) {
        choices.push([
          "建立第三種規則",
          () => showEnding("third")
        ]);
      }

      content.append(makeChoiceRow(choices));
    },
    "繼續"
  );
}

function showEnding(type) {
  state.ending = type;

  const endings = {
    perfect: {
      code: "ENDING 01 / PERFECT REALITY",
      title: "完美世界",
      text:
        "世界恢復正常。所有時間、照片與紀錄終於一致。\n\n" +
        "門開了，你走進一條陌生的走廊。\n\n" +
        "桌上卻多出一份新的錯誤報告：\n" +
        "USER_INPUT_NOT_FOUND。\n\n" +
        "系統開始下一次修復程序。"
    },
    collapse: {
      code: "ENDING 02 / UNRESOLVED",
      title: "拒絕修復",
      text:
        "你拒絕讓系統刪除任何一種可能性。\n\n" +
        "房間開始重疊。時鐘顯示不同時間，" +
        "照片裡的人影不斷增加。\n\n" +
        "系統消失了，但出口也一併消失。\n\n" +
        "你保留了所有可能性，卻再也無法確定任何事情。"
    },
    third: {
      code: "ENDING 03 / NEW RULE",
      title: "第三種答案",
      text:
        "你保留了互相矛盾的證據，拒絕讓系統替你決定真相。\n\n" +
        "系統無法執行這個指令。\n\n" +
        "SYSTEM ERROR: RULE NOT DEFINED.\n\n" +
        "你輸入新的規則：\n" +
        "「不是每個無法解釋的事物，都需要被修正。」\n\n" +
        "門打開了。照片裡出現第二個人。\n\n" +
        "那個人站在電腦前。"
    }
  };

  const ending = endings[type] || endings.perfect;

  $("endingCode").textContent = ending.code;
  $("endingTitle").textContent = ending.title;
  $("endingText").textContent = ending.text;
  $("endingDetails").textContent =
    `取得線索：${state.clues.size}/4 ｜ ` +
    `完成修復：${state.repairs.size} ｜ ` +
    `結局：${ending.code}`;

  closeModal();
  showScreen("ending");
}

$("startButton").addEventListener("click", startGame);
$("resetButton").addEventListener("click", resetGame);
$("endingRestartButton").addEventListener("click", resetGame);
$("homeButton").addEventListener("click", (event) => {
  event.preventDefault();
  resetGame();
});

$("openComputerButton").addEventListener("click", openComputer);
$("closeComputerButton").addEventListener("click", closeComputer);
$("modalCloseButton").addEventListener("click", closeModal);

$("modalActionButton").addEventListener("click", () => {
  if (state.modalAction) {
    state.modalAction();
  } else {
    closeModal();
  }
});

$("modal").addEventListener("click", (event) => {
  if (event.target === $("modal")) closeModal();
});

document.querySelectorAll("[data-object]").forEach((button) => {
  button.addEventListener("click", () => {
    investigateObject(button.dataset.object);
  });
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    state.tab = button.dataset.tab;
    renderComputer();
  });
});

renderComputer();
