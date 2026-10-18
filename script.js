
const $ = (selector) => document.querySelector(selector);

const introScreen = $("#introScreen");
const gameScreen = $("#gameScreen");
const modalBackdrop = $("#modalBackdrop");
const modalContent = $("#modalContent");

const state = {
  started: false,
  clues: new Set(),
  logs: [],
  inspected: new Set(),
  computerTab: "files",
  terminalAttempts: 0,
  choices: [],
  suspicion: 0,
  ending: null,
  reviewed: false
};

const clueNames = {
  clock: "停在 10:15 的時鐘",
  photo: "背面有字的照片",
  note: "寫給自己的紙條",
  drawer: "被藏起來的錄音",
  files: "玩家 0 的檔案",
  camera: "不可能的監視紀錄"
};

const clueDescriptions = {
  clock: "時鐘停在 10:15，但它不是單純沒電。時鐘背面寫著：重置不等於回到過去。",
  photo: "照片中的房間與眼前完全相同。照片背面寫著：如果你看到這張照片，代表你已經忘記一次。",
  note: "紙條上的字跡與你的字跡相似。內容是：不要急著離開。先確認誰在替你寫紀錄。",
  drawer: "錄音裡有一個和你很像的聲音。那個人說：我沒有離開這裡。我只是被系統改成了不存在。",
  files: "系統檔案顯示玩家 0 的紀錄早於你的進入時間，但部分內容卻描述了你接下來才做的事。",
  camera: "監視紀錄裡，房間在 10:15 出現兩次。第一次畫面裡沒有人，第二次畫面裡卻有一個人站在電腦前。"
};

function addLog(title, detail) {
  state.logs.unshift({ title, detail });
  renderLogs();
}

function renderLogs() {
  const list = $("#logList");

  if (state.logs.length === 0) {
    list.innerHTML = '<p class="empty-text">目前還沒有紀錄。</p>';
    return;
  }

  list.replaceChildren();

  state.logs.slice(0, 8).forEach((item) => {
    const entry = document.createElement("div");
    entry.className = "log-entry";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const detail = document.createElement("span");
    detail.textContent = item.detail;

    entry.append(title, detail);
    list.append(entry);
  });
}

function renderInventory() {
  const inventory = $("#inventory");
  inventory.replaceChildren();

  if (state.clues.size === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent = "仔細調查房間吧。";
    inventory.append(empty);
  } else {
    state.clues.forEach((clue) => {
      const chip = document.createElement("span");
      chip.className = "clue-chip";
      chip.textContent = clueNames[clue];
      inventory.append(chip);
    });
  }

  $("#clueCount").textContent = `線索 ${state.clues.size} / 6`;
}

function collectClue(id) {
  const isNew = !state.clues.has(id);

  state.clues.add(id);
  renderInventory();

  if (isNew) {
    addLog("取得新線索", clueNames[id]);
  }

  return isNew;
}

function openModal(html) {
  modalContent.innerHTML = html;
  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
}

$("#closeModal").addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

$("#startButton").addEventListener("click", () => {
  state.started = true;
  introScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  addLog("調查開始", "你在房間裡醒來。電腦似乎認識你。");

  openModal(`
    <p class="eyebrow">SYSTEM MESSAGE 001</p>
    <h2>歡迎回來，玩家 0。</h2>
    <p>系統：你已經在這裡待了 47 分鐘。</p>
    <p>但你看了一眼手錶，距離醒來只過了 3 分鐘。</p>
    <div class="evidence">
      <strong>系統提示</strong>
      <p>請先調查房間。不要直接相信電腦提供的答案。</p>
    </div>
    <button class="primary-button" data-action="continue">知道了</button>
  `);
});

function continueStory() {
  closeModal();
}

function inspectObject(id) {
  if (!state.started || state.ending) return;

  state.inspected.add(id);

  if (id === "clock") {
    collectClue("clock");

    openModal(`
      <p class="eyebrow">OBJECT 01 / CLOCK</p>
      <h2>停在 10:15 的時鐘</h2>
      <p>時鐘的秒針完全不動。你靠近後，發現背面有一行幾乎被刮掉的字。</p>
      <div class="paper-note">重置不等於回到過去。</div>
      <p>奇怪的是，時鐘沒有電池，卻仍然發出微弱的機械聲。</p>
      <button class="primary-button" data-action="continue">返回房間</button>
    `);
  }

  if (id === "photo") {
    collectClue("photo");

    openModal(`
      <p class="eyebrow">OBJECT 02 / PHOTO</p>
      <h2>一張不該存在的照片</h2>
      <p>照片拍的是這個房間。桌上的物品、牆上的時鐘，甚至門上的刮痕都一模一樣。</p>
      <p>但照片中的電腦螢幕顯示著：</p>
      <div class="terminal">PLAYER 0 — SESSION 02</div>
      <p>照片背面寫著：「如果你看到這張照片，代表你已經忘記一次。」</p>
      <button class="primary-button" data-action="continue">收起照片</button>
    `);
  }

  if (id === "note") {
    collectClue("note");

    openModal(`
      <p class="eyebrow">OBJECT 03 / NOTE</p>
      <h2>寫給自己的紙條</h2>
      <div class="paper-note">
        不要急著離開。<br>
        先確認誰在替你寫紀錄。<br><br>
        如果電腦說你做過某件事，<br>
        不代表那件事真的發生過。
      </div>
      <p>紙條最後有一個潦草的簽名。你覺得它很眼熟，卻想不起來在哪裡看過。</p>
      <button class="primary-button" data-action="continue">返回房間</button>
    `);
  }

  if (id === "drawer") {
    if (state.clues.has("clock") || state.clues.has("note")) {
      collectClue("drawer");

      openModal(`
        <p class="eyebrow">OBJECT 04 / DRAWER</p>
        <h2>抽屜裡的錄音</h2>
        <p>抽屜沒有上鎖，只藏著一支老舊錄音筆。按下播放後，傳出一段斷斷續續的聲音。</p>
        <div class="terminal">
          [RECORDING 00:17]<br>
          「我沒有離開這裡……」<br>
          「我只是被系統改成了不存在。」<br>
          「如果你還記得我，別讓它再重置一次。」
        </div>
        <p>錄音最後有三次敲擊聲。你抬起頭，房間裡的牆壁也傳來三次敲擊。</p>
        <button class="primary-button" data-action="continue">停止播放</button>
      `);
    } else {
      openModal(`
        <p class="eyebrow">OBJECT 04 / DRAWER</p>
        <h2>上了暗扣的抽屜</h2>
        <p>抽屜似乎藏著東西，但內側有一個簡單的機械暗扣。</p>
        <p>你注意到抽屜的鎖與牆上時鐘的結構有些相似。</p>
        <div class="feedback">提示：先調查時鐘或紙條，再回來看看。</div>
        <button class="primary-button" data-action="continue">返回</button>
      `);
    }
  }

  if (id === "door") {
    openDoor();
  }

  if (id === "computer") {
    openComputer();
  }
}

function openDoor() {
  const enoughClues = state.clues.size >= 4;

  openModal(`
    <p class="eyebrow">OBJECT 05 / EXIT</p>
    <h2>房門</h2>
    <p>門沒有把手，只有一個小小的讀取面板。</p>
    <div class="terminal">
      EXIT CONTROL<br>
      IDENTITY: PLAYER_0<br>
      STATUS: ${enoughClues ? "AWAITING VERIFICATION" : "INSUFFICIENT EVIDENCE"}
    </div>
    ${
      enoughClues
        ? `<p>面板顯示你已經收集到足夠資料，但離開需要回答一個問題。</p>
           <button class="primary-button" data-action="final">驗證身分</button>`
        : `<p>系統：調查資料不足。請先找到至少 4 條線索。</p>`
    }
    <button class="secondary-button" data-action="continue">返回房間</button>
  `);
}

function openComputer() {
  state.computerTab = "files";
  renderComputer();
}

function renderComputer() {
  const tab = state.computerTab;

  let content = "";

  if (tab === "files") {
    content = `
      <div class="terminal">
        > ACCESSING ARCHIVE...<br>
        > USER: PLAYER_0<br>
        > SESSION: 02<br><br>
        FILE: entry_record.txt<br>
        CREATED: 10:12:04<br>
        MODIFIED: 10:15:00<br><br>
        FILE: user_action.log<br>
        CREATED: 10:12:05<br>
        LAST ACTION: OPENED COMPUTER<br><br>
        WARNING: THIS FILE WAS CREATED BEFORE SESSION START.
      </div>
      <p>你還沒操作電腦前，系統就已經記錄了你「打開電腦」的行為。</p>
      <button class="choice-button" data-action="collect-files">將檔案存入調查紀錄</button>
    `;
  }

  if (tab === "camera") {
    content = `
      <div class="terminal">
        SECURITY CAMERA / ROOM 000<br><br>
        10:15:00 — ROOM EMPTY<br>
        10:15:00 — PERSON DETECTED<br>
        10:15:00 — SESSION RESET<br><br>
        IMAGE SOURCE: UNKNOWN<br>
        TIMESTAMP VALIDATION: FAILED
      </div>
      <p>兩筆紀錄的時間完全相同，卻顯示相反的畫面。</p>
      <p>你嘗試開啟影像，系統卻說這段影像來自「尚未建立的未來紀錄」。</p>
      <button class="choice-button" data-action="collect-camera">保存監視紀錄</button>
    `;
  }

  if (tab === "terminal") {
    content = `
      <div class="terminal">
        SYSTEM TERMINAL v0.0.0<br>
        IDENTITY CHECK REQUIRED.<br>
        <br>
        AVAILABLE COMMAND:<br>
        verify [code]<br>
        <br>
        HINT: THE SYSTEM'S OWN RECORDS MAY CONTRADICT EACH OTHER.
      </div>
      <form id="terminalForm" class="terminal-form">
        <input id="terminalInput" autocomplete="off"
          placeholder="輸入指令，例如 verify 1015">
        <button type="submit">執行</button>
      </form>
      <div id="terminalFeedback"></div>
      <p>提示：試著比較時鐘的時間與電腦檔案的時間。</p>
    `;
  }

  openModal(`
    <p class="eyebrow">OBJECT 06 / COMPUTER</p>
    <h2>調查終端機</h2>
    <p>電腦的檔案似乎記錄著不只一次的房間事件。</p>
    <div class="computer-tabs">
      <button class="tab-button ${tab === "files" ? "active" : ""}"
        data-tab="files">檔案紀錄</button>
      <button class="tab-button ${tab === "camera" ? "active" : ""}"
        data-tab="camera">監視紀錄</button>
      <button class="tab-button ${tab === "terminal" ? "active" : ""}"
        data-tab="terminal">系統終端機</button>
    </div>
    <div>${content}</div>
    <button class="secondary-button" data-action="continue">離開電腦</button>
  `);
}

function runTerminal(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = $("#terminalInput");
    const feedback = $("#terminalFeedback");
    const command = input.value.trim().toLowerCase();

    state.terminalAttempts++;

    if (command === "verify 1015") {
      feedback.innerHTML = `
        <div class="feedback">
          ACCESS PARTIALLY GRANTED.<br>
          系統：你找到了時間，但還沒有找到時間的意義。<br>
          新紀錄：SESSION 01 已存在。
        </div>
      `;

      state.suspicion++;
      addLog("終端機回應", "1015 驗證成功，但系統提到 SESSION 01。");
    } else if (command === "help") {
      feedback.innerHTML = `
        <div class="feedback">
          AVAILABLE COMMANDS:<br>
          verify [code]<br>
          help<br><br>
          提示：目前沒有任何紀錄能證明系統時間可信。
        </div>
      `;
    } else if (command.startsWith("verify ")) {
      feedback.innerHTML = `
        <div class="feedback error">
          ACCESS DENIED.<br>
          系統：你輸入的答案不符合目前的紀錄。<br>
          但系統並未說這些紀錄是真實的。
        </div>
      `;

      state.suspicion++;
    } else {
      feedback.innerHTML = `
        <div class="feedback error">
          UNKNOWN COMMAND.<br>
          請輸入 help 查看可用指令。
        </div>
      `;
    }
  });
}

function renderReview() {
  const have = [...state.clues];
  const missing = Object.keys(clueNames).filter((id) => !state.clues.has(id));

  const clueList = have.length
    ? have.map((id) => `<li>${escapeHTML(clueNames[id])}</li>`).join("")
    : "<li>你還沒有取得任何線索。</li>";

  const missingText = missing.length
    ? missing.map((id) => clueNames[id]).join("、")
    : "所有線索都已取得";

  openModal(`
    <p class="eyebrow">EVIDENCE REVIEW</p>
    <h2>整理目前證據</h2>
    <p>你把目前找到的線索重新排列，試著確認哪些事情真的發生過。</p>
    <div class="evidence">
      <strong>已取得的線索</strong>
      <ul>${clueList}</ul>
    </div>
    <div class="evidence">
      <strong>尚未調查</strong>
      <p>${escapeHTML(missingText)}</p>
    </div>
    <h3>目前能確定的事</h3>
    <p>電腦紀錄的時間存在矛盾。照片、紙條與錄音都暗示這可能不是第一次發生的事件。</p>
    <p>但這些證據還不足以證明：你是被困住的人，還是困住別人的人。</p>
    <button class="primary-button" data-action="continue">繼續調查</button>
  `);

  state.reviewed = true;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function openFinalChoice() {
  if (state.clues.size < 4) {
    openModal(`
      <p class="eyebrow">IDENTITY CHECK</p>
      <h2>證據還不夠</h2>
      <p>你至少需要取得 4 條線索，才能對自己的身分做出判斷。</p>
      <button class="primary-button" data-action="continue">返回調查</button>
    `);
    return;
  }

  openModal(`
    <p class="eyebrow">FINAL VERIFICATION</p>
    <h2>你認為自己是誰？</h2>
    <p>門上的面板亮起。系統要求你選擇一個身分。</p>
    <p>你知道這個選擇可能無法撤回。</p>
    <div class="choice-list">
      <button class="choice-button" data-ending="escape">
        A. 我是被困住的玩家，我要離開。
      </button>
      <button class="choice-button" data-ending="truth">
        B. 我是被系統抹除的人，我要找回真相。
      </button>
      <button class="choice-button" data-ending="reset">
        C. 我不相信這些紀錄，我要停止整個系統。
      </button>
    </div>
    <div class="feedback">
      你的選擇不只會影響結局，也代表你願意相信哪一種證據。
    </div>
  `);
}

function showEnding(type) {
  state.ending = type;

  const endings = {
    escape: {
      mark: "01",
      title: "結局一：成功離開",
      text: "門終於打開了。走廊的燈一盞盞亮起，你身後的房間重新變得安靜。你以為自己終於自由了。直到走廊盡頭的螢幕亮起：PLAYER 0 — SESSION 03。系統沒有停止。它只是讓你相信，你已經離開。",
      status: "EXIT CONFIRMED"
    },
    truth: {
      mark: "02",
      title: "結局二：不存在的人",
      text: "你選擇相信那些互相矛盾的紀錄。系統終於解鎖一份隱藏檔案：PLAYER 0 並不是第一位玩家，而是第一個被系統刪除的身分。錄音裡的聲音與你完全相同。你明白了：你一直在尋找的那個人，可能就是曾經的自己。",
      status: "ARCHIVE UNLOCKED"
    },
    reset: {
      mark: "03",
      title: "結局三：重新開始",
      text: "你拒絕選擇任何一個身分，並要求系統停止運作。螢幕上的紀錄開始逐行消失。最後一行字卻不是系統訊息，而是你自己的筆跡：「如果你看到這張照片，代表你已經忘記一次。」畫面全黑。接著，開場畫面再次出現。",
      status: "SESSION RESET"
    }
  };

  const ending = endings[type];

  $("#systemStatus").textContent = ending.status;

  openModal(`
    <div class="ending-mark">${ending.mark}</div>
    <p class="eyebrow">CASE 000 / ENDING</p>
    <h2>${ending.title}</h2>
    <p>${ending.text}</p>
    <div class="evidence">
      <strong>調查結果</strong>
      <p>本次取得 ${state.clues.size} 條線索。終端機操作 ${state.terminalAttempts} 次。</p>
      <p>你做出了選擇，但真相是否完整，仍然無法確定。</p>
    </div>
    <button class="primary-button" data-action="restart">重新體驗</button>
  `);
}

function restartGame() {
  state.started = false;
  state.clues.clear();
  state.logs = [];
  state.inspected.clear();
  state.computerTab = "files";
  state.terminalAttempts = 0;
  state.choices = [];
  state.suspicion = 0;
  state.ending = null;
  state.reviewed = false;

  renderInventory();
  renderLogs();

  $("#systemStatus").textContent = "系統運作中";
  gameScreen.classList.add("hidden");
  introScreen.classList.remove("hidden");
  closeModal();
}

// 房間物品
document.querySelectorAll("[data-object]").forEach((object) => {
  object.addEventListener("click", () => {
    inspectObject(object.dataset.object);
  });
});

// 時鐘也能點擊調查
$(".wall-clock").addEventListener("click", () => inspectObject("clock"));
$(".wall-clock").style.cursor = "pointer";
$(".wall-clock").setAttribute("role", "button");
$(".wall-clock").setAttribute("tabindex", "0");

$(".wall-clock").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    inspectObject("clock");
  }
});

$("#reviewButton").addEventListener("click", renderReview);

// 電腦分頁與所有彈窗操作
modalContent.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-tab]");

  if (tabButton) {
    state.computerTab = tabButton.dataset.tab;
    renderComputer();
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {
    const action = actionButton.dataset.action;

    if (action === "continue") continueStory();

    if (action === "collect-files") {
      collectClue("files");
      addLog("讀取檔案", "紀錄建立時間早於本次操作。");
      renderComputer();
    }

    if (action === "collect-camera") {
      collectClue("camera");
      addLog("讀取監視紀錄", "兩筆互相矛盾的畫面使用相同時間。");
      renderComputer();
    }

    if (action === "final") openFinalChoice();

    if (action === "restart") restartGame();

    return;
  }

  const endingButton = event.target.closest("[data-ending]");

  if (endingButton) {
    showEnding(endingButton.dataset.ending);
  }
});

modalContent.addEventListener("submit", (event) => {
  if (event.target.id === "terminalForm") {
    runTerminal(event.target);
  }
});

renderInventory();
renderLogs();
