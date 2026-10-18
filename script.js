const $ = (selector) => document.querySelector(selector);

const state = {
  started: false,
  items: new Set(),
  logs: [],
  photoDone: false,
  messagesDone: false,
  circuitDone: false,
  memoryDone: false,
  ending: null,
  selectedTile: null,
  puzzle: [],
  messages: [],
  circuits: [],
  clockSeen: false,
  pictureSeen: false,
  secretSeen: false
};

const itemNames = {
  photoPieces: "照片碎片",
  notebook: "筆記本",
  photo: "修復照片",
  messageCode: "記憶編號",
  recording: "錄音筆",
  hiddenLetter: "隱藏的信"
};

const storyStages = [
  {
    title: "陌生的房間",
    text: "你在陌生的房間醒來。電腦顯示：昨日記憶尚未完成備份。",
    hint: "先看看書櫃，也許有什麼被遺忘的東西。"
  },
  {
    title: "不存在的照片",
    text: "照片修復完成了，但照片裡另一個人的臉仍然模糊。",
    hint: "照片修復後，試著打開書桌抽屜。"
  },
  {
    title: "沒有寄出的訊息",
    text: "訊息重新排列後，你發現有人早就知道記憶會被刪除。",
    hint: "打開電腦的空間校正程式，修復電路。"
  },
  {
    title: "被藏起來的房間",
    text: "電路恢復後，房間裡的隱藏櫃子似乎有了反應。",
    hint: "看看房間右側的隱藏櫃子。"
  },
  {
    title: "最後一份記憶",
    text: "你已經找到錄音筆。現在可以嘗試重建完整記憶。",
    hint: "回到電腦，開啟記憶重建程式。"
  }
];

function addItem(id) {
  if (!state.items.has(id)) {
    state.items.add(id);
    addLog("獲得道具：" + itemNames[id]);
    renderInventory();
  }
}

function addLog(text) {
  state.logs.unshift(text);
  renderLogs();
}

function renderInventory() {
  const box = $("#inventory");
  box.replaceChildren();

  if (!state.items.size) {
    box.innerHTML = '<p class="muted">目前沒有道具。</p>';
    return;
  }

  state.items.forEach((id) => {
    const chip = document.createElement("span");
    chip.className = "item";
    chip.textContent = itemNames[id];
    box.append(chip);
  });
}

function renderLogs() {
  const box = $("#logs");
  box.replaceChildren();

  if (!state.logs.length) {
    box.innerHTML = '<p class="muted">開始探索吧。</p>';
    return;
  }

  state.logs.slice(0, 8).forEach((text) => {
    const line = document.createElement("div");
    line.className = "log";
    line.textContent = text;
    box.append(line);
  });
}

function progress() {
  return [
    state.photoDone,
    state.messagesDone,
    state.circuitDone,
    state.memoryDone
  ].filter(Boolean).length * 25;
}

function updateUI() {
  const value = progress();

  $("#progressText").textContent = value + "%";
  $("#progressFill").style.width = value + "%";

  let stage = 0;

  if (state.photoDone) stage = 1;
  if (state.messagesDone) stage = 2;
  if (state.circuitDone) stage = 3;
  if (state.items.has("recording")) stage = 4;

  $("#chapter").textContent =
    "CHAPTER " + String(stage + 1).padStart(2, "0");

  $("#chapterTitle").textContent = storyStages[stage].title;
  $("#storyText").textContent = storyStages[stage].text;
  $("#hintText").textContent = storyStages[stage].hint;

  if (state.memoryDone) {
    $("#chapterTitle").textContent = "昨日的答案";
    $("#storyText").textContent =
      "所有記憶已恢復。現在，最後的選擇交給你。";
    $("#hintText").textContent =
      "打開房門，決定這段記憶的去留。";
  }
}

function showModal(html) {
  $("#modalContent").innerHTML = html;
  $("#modal").classList.remove("hidden");
}

function closeModal() {
  $("#modal").classList.add("hidden");
}

$("#closeModal").onclick = closeModal;

$("#modal").addEventListener("click", (event) => {
  if (event.target.id === "modal") closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

$("#startBtn").onclick = () => {
  state.started = true;
  $("#intro").classList.add("hidden");
  $("#game").classList.remove("hidden");

  addLog("你在房間裡醒來。");

  showModal(`
    <span class="tag">SYSTEM MESSAGE</span>
    <h2>歡迎回來，玩家 0</h2>
    <p>昨日記憶備份未完成。</p>
    <div class="dialogue">
      記憶完整度：0%<br>
      待修復記憶：4 份<br>
      離開條件：完成記憶修復
    </div>
    <button class="primary" data-action="close">開始探索</button>
  `);
};

$("#restartBtn").onclick = () => {
  if (confirm("確定要重新開始嗎？目前進度將會消失。")) {
    location.reload();
  }
};

function inspect(id) {
  if (!state.started || state.ending) return;

  switch (id) {
    case "bookshelf":
      addItem("photoPieces");
      showModal(`
        <span class="tag">ROOM / BOOKSHELF</span>
        <h2>書櫃</h2>
        <p>你在一本舊書裡找到九塊照片碎片。</p>
        <div class="dialogue">
          照片背面有一行字：<br>
          「我們明明說好，要一起記住這一天。」
        </div>
        <p>也許電腦可以修復這張照片。</p>
      `);
      break;

    case "clock":
      state.clockSeen = true;
      showModal(`
        <span class="tag">ROOM / CLOCK</span>
        <h2>停住的時鐘</h2>
        <p>時鐘停在 10:15。</p>
        <div class="dialogue">
          旁邊貼著一張便條：<br>
          「時間不一定可信，先後順序才是答案。」
        </div>
        <p>你把這句話記了下來。</p>
      `);
      break;

    case "picture":
      state.pictureSeen = true;
      showModal(`
        <span class="tag">ROOM / PICTURE</span>
        <h2>牆上的相框</h2>
        ${
          state.photoDone
            ? `<p>原本空白的相框，現在出現了兩個人的合照。</p>
               <p>其中一個人是你，另一個人的臉卻看不清楚。</p>
               <div class="dialogue">相框角落刻著：✦</div>`
            : `<p>相框裡只有一張泛黃的白紙。</p>
               <p>你隱約看見紙上有兩個人的輪廓。</p>`
        }
      `);
      break;

    case "drawer":
      if (!state.photoDone) {
        showModal(`
          <h2>上鎖的抽屜</h2>
          <p>抽屜上有一個星星形狀的凹槽。</p>
          <p>似乎需要先找回某段影像。</p>
        `);
      } else {
        addItem("notebook");
        showModal(`
          <h2>抽屜打開了</h2>
          <p>你找到一本筆記本。</p>
          <div class="dialogue">
            「有些話如果說不出口，就留在昨天吧。」<br><br>
            最後一頁寫著：<br>
            「不要只看訊息上的時間。」
          </div>
          <p>電腦的訊息中心似乎可以使用了。</p>
        `);
      }
      break;

    case "cabinet":
      if (!state.circuitDone) {
        showModal(`
          <h2>隱藏櫃子</h2>
          <p>櫃子沒有把手，旁邊有一個小小的電子燈。</p>
          <div class="dialogue">目前狀態：尚未通電</div>
        `);
      } else {
        addItem("recording");

        showModal(`
          <h2>被藏起來的錄音筆</h2>
          <p>櫃子終於打開了。</p>
          <div class="dialogue">
            ▶ 錄音播放中……<br><br>
            「如果你聽到這段錄音，代表我成功了。」<br>
            「我們做的不是記憶修復。」<br>
            「而是讓一段記憶，重新學會思考。」
          </div>
          <p>你開始懷疑自己究竟是誰。</p>
        `);

        updateUI();
      }
      break;

    case "door":
      if (!state.memoryDone) {
        showModal(`
          <h2>尚未開啟的房門</h2>
          <p>門上的電子面板顯示：</p>
          <div class="dialogue">
            記憶修復進度：${progress()}%<br>
            請完成全部四項修復程序。
          </div>
        `);
      } else {
        showFinal();
      }
      break;

    case "computer":
      showDesktop();
      break;
  }
}

document.querySelectorAll("[data-object]").forEach((button) => {
  button.addEventListener("click", () => inspect(button.dataset.object));
});

function showDesktop() {
  showModal(`
    <span class="tag">MEMORY OS / DESKTOP</span>
    <h2>記憶修復系統</h2>
    <p>桌面上有四個程式。部分功能需要先取得資料才能使用。</p>

    <div class="app-grid">
      <button class="app" data-app="photo"
        ${!state.items.has("photoPieces") ? "disabled" : ""}>
        <span class="app-icon">🖼️</span>
        相片修復
        <br><small>${state.photoDone ? "已完成" : "記憶 01"}</small>
      </button>

      <button class="app" data-app="messages"
        ${!state.items.has("notebook") ? "disabled" : ""}>
        <span class="app-icon">✉️</span>
        訊息中心
        <br><small>${state.messagesDone ? "已完成" : "記憶 02"}</small>
      </button>

      <button class="app" data-app="circuit"
        ${!state.messagesDone ? "disabled" : ""}>
        <span class="app-icon">🔌</span>
        空間校正
        <br><small>${state.circuitDone ? "已完成" : "記憶 03"}</small>
      </button>

      <button class="app" data-app="memory"
        ${!state.items.has("recording") ? "disabled" : ""}>
        <span class="app-icon">🧩</span>
        記憶重建
        <br><small>${state.memoryDone ? "已完成" : "記憶 04"}</small>
      </button>
    </div>

    <button class="choice" data-action="close">離開電腦</button>
  `);
}

/* 第一個小遊戲：九宮格拼圖 */

const photoSolution = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function startPhoto() {
  if (state.photoDone) {
    showModal(`
      <h2>相片修復完成</h2>
      <p>照片裡有兩個人，另一個人的臉仍然模糊。</p>
      <div class="dialogue">記憶碎片 01 已恢復。</div>
      <button class="primary" data-action="desktop">返回桌面</button>
    `);
    return;
  }

  if (!state.puzzle.length) {
    state.puzzle = [...photoSolution];

    do {
      shuffle(state.puzzle);
    } while (state.puzzle.every((value, index) => value === index));
  }

  renderPhoto();
}

function renderPhoto() {
  const symbols = ["☀", "☁", "✦", "🌿", "♡", "☕", "✿", "⌂", "♫"];

  showModal(`
    <span class="tag">MINI GAME 01</span>
    <h2>照片拼圖</h2>
    <p>點擊兩塊圖片，就能交換位置。請將九塊碎片恢復成原本的順序。</p>
    <p class="muted">提示：碎片背面依序標有 1～9。</p>

    <div class="puzzle-grid">
      ${state.puzzle.map((value, index) => `
        <button class="puzzle-tile ${state.selectedTile === index ? "selected" : ""}"
          data-tile="${index}">
          ${symbols[value]}<br>
          <small>${value + 1}</small>
        </button>
      `).join("")}
    </div>

    <div id="gameFeedback"></div>
    <button class="choice" data-action="desktop">返回桌面</button>
  `);
}

function selectTile(index) {
  if (state.selectedTile === null) {
    state.selectedTile = index;
    renderPhoto();
    return;
  }

  const first = state.selectedTile;

  [state.puzzle[first], state.puzzle[index]] =
    [state.puzzle[index], state.puzzle[first]];

  state.selectedTile = null;

  if (state.puzzle.every((value, i) => value === i)) {
    state.photoDone = true;
    addItem("photo");
    addLog("照片修復成功，抽屜似乎解鎖了。");
    updateUI();

    showModal(`
      <span class="tag">MEMORY RESTORED / 01</span>
      <h2>不存在的照片</h2>
      <p>九塊碎片終於拼成完整照片。</p>
      <div class="dialogue">
        照片裡有兩個人。<br>
        一個是你，另一個人的臉被模糊處理。<br><br>
        照片角落有個符號：✦
      </div>
      <p>你聽見房間裡傳來輕微的「喀」一聲。</p>
      <button class="primary" data-action="close">回房間看看</button>
    `);
  } else {
    renderPhoto();
  }
}

/* 第二個小遊戲：訊息排序 */

const messageData = [
  "我們還有其他方法嗎？",
  "你真的決定要刪掉它嗎？",
  "我不想再讓你一個人承受。",
  "我已經把備份準備好了。",
  "如果明天我不記得你了呢？",
  "那就約定好，明天再見。"
];

function startMessages() {
  if (state.messagesDone) {
    showModal(`
      <h2>訊息中心</h2>
      <p>訊息已恢復。</p>
      <div class="dialogue">記憶檔案編號：2416</div>
      <button class="primary" data-action="desktop">返回桌面</button>
    `);
    return;
  }

  if (!state.messages.length) {
    state.messages = [3, 1, 5, 0, 4, 2];
  }

  renderMessages();
}

function renderMessages() {
  showModal(`
    <span class="tag">MINI GAME 02</span>
    <h2>沒有寄出的訊息</h2>
    <p>六封訊息的時間被打亂了。請根據對話邏輯排列正確順序。</p>

    <div class="dialogue">
      筆記本提示：<br>
      先提出疑問，再做出決定。<br>
      最後一句，是關於明天的約定。
    </div>

    <div class="message-list">
      ${state.messages.map((id, index) => `
        <div class="message-row">
          <span>${index + 1}. ${messageData[id]}</span>
          <button class="small-btn" data-move="${index}" data-direction="-1">↑</button>
          <button class="small-btn" data-move="${index}" data-direction="1">↓</button>
        </div>
      `).join("")}
    </div>

    <button class="primary" data-action="checkMessages">確認順序</button>
    <button class="choice" data-action="desktop">返回桌面</button>
    <div id="gameFeedback"></div>
  `);
}

function moveMessage(index, direction) {
  const target = index + direction;

  if (target < 0 || target >= state.messages.length) return;

  [state.messages[index], state.messages[target]] =
    [state.messages[target], state.messages[index]];

  renderMessages();
}

function checkMessages() {
  const correct = [0, 1, 2, 3, 4, 5];

  if (state.messages.every((value, index) => value === correct[index])) {
    state.messagesDone = true;
    addItem("messageCode");
    addLog("訊息排序完成，空間校正程式已解鎖。");
    updateUI();

    showModal(`
      <span class="tag">MEMORY RESTORED / 02</span>
      <h2>沒有寄出的訊息</h2>
      <p>你成功還原了六封訊息。</p>
      <div class="dialogue">
        「如果明天我不記得你了呢？」<br>
        「那就約定好，明天再見。」<br><br>
        系統恢復編號：2416
      </div>
      <p>電腦桌面新增了「空間校正」程式。</p>
      <button class="primary" data-action="desktop">返回桌面</button>
    `);
  } else {
    $("#gameFeedback").innerHTML =
      '<div class="feedback error">順序似乎不對。試著重新思考對話的前後關係。</div>';
  }
}

/* 第三個小遊戲：電路連線 */

const circuitSolution = [1, 1, 1, 1, 1, 1, 1, 1, 1];

function startCircuit() {
  if (state.circuitDone) {
    showModal(`
      <h2>空間校正完成</h2>
      <p>隱藏櫃子已經通電。</p>
      <button class="primary" data-action="desktop">返回桌面</button>
    `);
    return;
  }

  if (!state.circuits.length) {
    state.circuits = [0, 2, 3, 1, 0, 2, 3, 0, 2];
  }

  renderCircuit();
}

function renderCircuit() {
  const symbols = ["─", "│", "╱", "╲"];

  showModal(`
    <span class="tag">MINI GAME 03</span>
    <h2>空間校正</h2>
    <p>點擊方塊旋轉線路，讓所有線路方向一致，恢復電力。</p>

    <div class="dialogue">
      目標：讓九個方塊都成為垂直線路「│」。
    </div>

    <div class="circuit-grid">
      ${state.circuits.map((value, index) => `
        <button class="circuit-tile" data-circuit="${index}">
          ${symbols[value]}
        </button>
      `).join("")}
    </div>

    <button class="primary" data-action="checkCircuit">啟動電源</button>
    <button class="choice" data-action="desktop">返回桌面</button>
    <div id="gameFeedback"></div>
  `);
}

function rotateCircuit(index) {
  state.circuits[index] = (state.circuits[index] + 1) % 4;
  renderCircuit();
}

function checkCircuit() {
  const solved = state.circuits.every((value, index) =>
    value === circuitSolution[index]
  );

  if (solved) {
    state.circuitDone = true;
    addLog("電路恢復，房間裡的隱藏櫃子已解鎖。");
    updateUI();

    showModal(`
      <span class="tag">MEMORY RESTORED / 03</span>
      <h2>電力恢復</h2>
      <p>你聽見房間右側傳來一聲輕響。</p>
      <div class="dialogue">
        空間校正完成。<br>
        隱藏櫃子已解除鎖定。
      </div>
      <button class="primary" data-action="close">回房間看看</button>
    `);
  } else {
    $("#gameFeedback").innerHTML =
      '<div class="feedback error">線路還沒有全部接通。</div>';
  }
}

/* 第四個小遊戲：記憶重建 */

const memoryQuestions = [
  {
    title: "第一次進入房間",
    answer: "photo"
  },
  {
    title: "系統開始備份",
    answer: "message"
  },
  {
    title: "記憶刪除的原因",
    answer: "recording"
  },
  {
    title: "最後一次見面",
    answer: "letter"
  }
];

function startMemory() {
  if (state.memoryDone) {
    showTruth();
    return;
  }

  if (!state.secretSeen) {
    state.secretSeen = true;
    addItem("hiddenLetter");
  }

  showModal(`
    <span class="tag">MINI GAME 04</span>
    <h2>最後一份記憶</h2>
    <p>請把四份證據放到對應的記憶事件中。</p>

    <div class="dialogue">
      隱藏檔案已恢復：<br>
      「最後一次見面，我們留下了一封信。」
    </div>

    <div class="memory-list">
      ${memoryQuestions.map((question, index) => `
        <div class="memory-row">
          <label>${index + 1}. ${question.title}</label>
          <select id="memory${index}">
            <option value="">請選擇證據</option>
            <option value="photo">修復照片</option>
            <option value="message">訊息紀錄</option>
            <option value="recording">錄音筆</option>
            <option value="letter">隱藏的信</option>
          </select>
        </div>
      `).join("")}
    </div>

    <button class="primary" data-action="checkMemory">重建記憶</button>
    <button class="choice" data-action="desktop">返回桌面</button>
    <div id="gameFeedback"></div>
  `);
}

function checkMemory() {
  const answers = memoryQuestions.map((_, index) =>
    $("#memory" + index).value
  );

  const correct = answers.every((answer, index) =>
    answer === memoryQuestions[index].answer
  );

  if (correct) {
    state.memoryDone = true;
    addLog("所有記憶已恢復。");
    updateUI();
    showTruth();
  } else {
    $("#gameFeedback").innerHTML =
      '<div class="feedback error">有些記憶還放錯位置了。</div>';
  }
}

function showTruth() {
  showModal(`
    <span class="tag">MEMORY RESTORED / 100%</span>
    <h2>昨日的答案</h2>

    <p>電腦終於恢復最後一份檔案。</p>

    <div class="dialogue">
      「我們原本只是想保存那些不想忘記的時刻。」<br><br>
      「但系統開始不斷重建記憶中的人物。」<br><br>
      「而你，就是第一個成功被重新生成的人格。」
    </div>

    <p>
      原來你不是被困在房間裡的人。
      你是某個人不願意忘記的記憶。
    </p>

    <p>
      這間房間，是你們曾經共同生活過的地方。
      每次有人啟動系統，你就會重新醒來。
    </p>

    <div class="dialogue">
      系統：記憶修復完成。<br>
      請前往房門，決定這段記憶的去留。
    </div>

    <button class="primary" data-action="close">前往房門</button>
  `);
}

/* 最後的選擇 */

function showFinal() {
  showModal(`
    <span class="tag">FINAL CHOICE</span>
    <h2>你想讓昨天停在哪裡？</h2>

    <p>門終於解鎖了，但系統要求你做出最後的選擇。</p>

    <button class="choice" data-ending="A">
      A. 保留系統，讓昨天永遠存在
    </button>

    <button class="choice" data-ending="B">
      B. 刪除系統，讓記憶成為過去
    </button>

    <button class="choice" data-ending="C">
      C. 將記憶交給下一位玩家
    </button>
  `);
}

function showEnding(type) {
  state.ending = type;

  const endings = {
    A: {
      title: "結局 A：永遠的昨天",
      text: "你選擇保留系統。房間再次被陽光照亮。你可以一次又一次地回到昨天，但每次重新開始，你都會忘記自己曾經做過這個選擇。"
    },
    B: {
      title: "結局 B：真正的明天",
      text: "你選擇刪除系統。房間裡的物品慢慢化為光點。電腦最後顯示：「謝謝你，願意讓昨天成為昨天。」"
    },
    C: {
      title: "隱藏結局 C：第 1 號玩家",
      text: "你沒有保留，也沒有刪除這段記憶，而是把它寫成一封信，留給未來的人。電腦顯示：「PLAYER 0：登出成功。PLAYER 1：歡迎登入。」"
    }
  };

  const ending = endings[type];

  showModal(`
    <div class="ending">
      <div class="ending-symbol">✦</div>
      <span class="tag">THE END</span>
      <h2>${ending.title}</h2>
      <p>${ending.text}</p>
      <button class="primary" data-action="restart">重新體驗</button>
    </div>
  `);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* 統一處理互動 */

$("#modalContent").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.app) {
    const app = button.dataset.app;

    if (app === "photo") startPhoto();
    if (app === "messages") startMessages();
    if (app === "circuit") startCircuit();
    if (app === "memory") startMemory();

    return;
  }

  if (button.dataset.tile !== undefined) {
    selectTile(Number(button.dataset.tile));
    return;
  }

  if (button.dataset.move !== undefined) {
    moveMessage(
      Number(button.dataset.move),
      Number(button.dataset.direction)
    );
    return;
  }

  if (button.dataset.circuit !== undefined) {
    rotateCircuit(Number(button.dataset.circuit));
    return;
  }

  if (button.dataset.ending) {
    showEnding(button.dataset.ending);
    return;
  }

  switch (button.dataset.action) {
    case "close":
      closeModal();
      break;

    case "desktop":
      showDesktop();
      break;

    case "checkMessages":
      checkMessages();
      break;

    case "checkCircuit":
      checkCircuit();
      break;

    case "checkMemory":
      checkMemory();
      break;

    case "restart":
      location.reload();
      break;
  }
});

renderInventory();
renderLogs();
updateUI();
