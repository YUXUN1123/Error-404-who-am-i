/* ============================================================
   ERROR 404：這台電腦不記得自己是誰
   完整版 — 房間開場 + 三幕 + 三個小遊戲 + 態度選擇
   ============================================================ */

/* ---------- 1. 資料區 ---------- */
const GAME_DATA = {
  answers: { p1: "0314", p2: "echo", p3: "abort echo0314" },

  tasks: {
    p1:        { title: "找回第一次醒來的日子", dir: "去房間看看日曆，把碎紙拼回原位" },
    p2:        { title: "找回 ECHO 遺失的名字", dir: "四個字母藏在不同地方：便利貼、重播動畫、擦灰塵、調頻" },
    p3:        { title: "調查並停止記憶清除程序", dir: "查看防毒結果、終端機、回收桶，組合中止指令" },
    final:     { title: "決定如何處理 ECHO 的記憶", dir: "在最終畫面做出選擇" }
  },

  echo: {
    intro: "你是誰？",
    afterP1: "……有人嗎？你以前來過這裡嗎？",
    afterP2: "我一直以為……有人想要傷害我。",
    quarantineFail: "可是，系統說那是我最信任的使用者……",
    afterP3: "原來不是有人想毀掉我。是我沒聽懂你那時候真正想說的話。"
  },

  // 房間物件台詞
  roomLines: {
    calendar: "日曆停在 3 月。14 號被圈起來，又被用力塗掉了。",
    alarm:    "鬧鐘停在 03:14。你從來沒調過它。",
    notepad:  "便利貼上寫著：第一次醒來的日子 = 月日。",
    radio:    "收音機只發出雜訊。轉盤好像可以調頻。",
    mug:      "馬克杯裡的水早就乾了，杯底留下一個棕色的圈。",
    plant:    "盆栽枯了。你從來沒記得澆水。",
    phone:    "手機沒電了。螢幕上有一條裂痕，從左上角裂到中間。",
    lamp:     "桌燈的燈罩積了一層灰。",
    drawer:   "抽屜裡有一張撕掉一半的照片。一台電腦，一隻手。臉被撕掉了。",
    trash:    "垃圾桶裡有一疊草稿。",
    photo:    "相框倒扣著。背面寫著：「03/14」",
    door:     "門關著。你離開這個房間，已經很久了。",
    computer: "",
    window:   "窗外是夜。或白天。你已經不記得上一次看是什麼時候。"
  },

  hints: {
    p1: ["房間的日曆被塗掉了。", "日曆上的 14 號被圈起來。月份在日曆頂端。", "答案是月份兩位 + 日期兩位：0314。"],
    p2: ["名字被拆成四個字母。", "便利貼有 E，重播動畫有 C，擦灰塵有 O，調頻有 H。", "把找到的字母依找到順序排列，就是 ECHO。"],
    p3: ["中止指令需要格式。", "便利貼說：abort <名字><月日>。", "在終端機輸入 abort ECHO0314。"]
  }
};

/* ---------- 2. 狀態 ---------- */
const state = {
  puzzleDone: { p1: false, p2: false, p3: false },
  foundLetters: [],
  letterFoundAt: [],        // 記錄找到順序
  attitude: null,
  readNight: false,
  warmCount: 0,
  wrongCount: { p1: 0, p2: 0, p3: 0 },
  completeness: 12,
  currentTask: "p1",
  seenHints: { p1: 0, p2: 0, p3: 0 },
  gameEnding: null,
  seenFiles: [],
  roomVisited: {},
  calendarSolved: false,
  dustSolved: false,
  radioSolved: false,
  replaySolved: false,
  // 房間狀態變化
  roomChanges: {
    alarmMoved: false,
    windowShadow: false,
    photoFlipped: false,
    doorOpen: false
  },
  newItems: { errorReport: false, memoryFolder: false, trashNight: false }
};

/* ---------- 3. 工具 ---------- */
const $ = (s) => document.querySelector(s);
const normalize = (s) => (s || "").normalize("NFKC").trim().toLowerCase();

function typeText(el, text, speed = 28, cb) {
  el.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    if (i >= text.length) { clearInterval(timer); cb && cb(); return; }
    el.textContent += text[i++];
  }, speed);
}
function echoSay(text) { typeText($("#echoText"), text, 30); }
function setCompleteness(v) { state.completeness = v; $("#memVal").textContent = v + "%"; }

function updateTask(key) {
  state.currentTask = key;
  const t = GAME_DATA.tasks[key];
  if (!t) return;
  $("#taskBody").innerHTML = `<b>${t.title}</b><br><span style="color:#889;">${t.dir}</span>`;
  let prog = "";
  if (key === "p2") prog = `已找到字母：${state.foundLetters.length}/4`;
  $("#taskProgress").textContent = prog;
}

/* ---------- 4. 序幕與房間 ---------- */
function startPrologue() {
  const el = $("#prologueText");
  const lines = [
    "你離開這個房間，已經 92 天了。",
    "抽屜裡有一台電腦。",
    "它好像……還醒著。"
  ];
  el.innerHTML = lines.map((l, i) => `<div class="line" data-i="${i}">${l}</div>`).join("");
  const divs = el.querySelectorAll(".line");
  divs.forEach((d, i) => setTimeout(() => d.classList.add("show"), i * 1200));
  // 真實天數
  const startDate = new Date("2026-07-09T03:14:00");
  const now = new Date();
  const days = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
  // 若真實日期比 startDate 早，用 92
  const displayDays = (days > 0 && days < 999) ? days : 92;
  el.querySelector('[data-i="0"]').textContent = `你離開這個房間，已經 ${displayDays} 天了。`;

  setTimeout(() => {
    if (!$("#prologue").classList.contains("hidden")) {
      $("#prologue").classList.add("hidden");
      showRoom();
    }
  }, 4500);
}

$("#skipPrologue").addEventListener("click", () => {
  $("#prologue").classList.add("hidden");
  showRoom();
});

/* ---------- 5. 房間渲染 ---------- */
function showRoom() {
  $("#room").classList.remove("hidden");
  $("#desktop").classList.add("hidden");
  updateRoomSky();
  updateRoomClock();
  bindRoomObjects();
}

function updateRoomSky() {
  const now = new Date();
  const h = now.getHours();
  const month = now.getMonth() + 1;
  const sky = $("#sky");
  let bg, isNight = false;
  if (h >= 6 && h < 8) bg = "linear-gradient(180deg,#ff9a56,#ffd89b)";
  else if (h >= 8 && h < 17) bg = "linear-gradient(180deg,#87ceeb,#b0e0e6)";
  else if (h >= 17 && h < 19) bg = "linear-gradient(180deg,#ff6b35,#c84b31)";
  else { bg = "linear-gradient(180deg,#0a0e2a,#1a1a3a)"; isNight = true; }
  sky.style.background = bg;

  // 星星
  const stars = $("#stars");
  stars.innerHTML = "";
  if (isNight) {
    for (let i = 0; i < 30; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 3 + "s";
      stars.appendChild(s);
    }
  }

  // 天氣
  const weather = $("#weather");
  weather.innerHTML = "";
  if (month >= 3 && month <= 5) weather.innerHTML = "🌸";
  else if (month >= 6 && month <= 8) weather.innerHTML = "☀️";
  else if (month >= 9 && month <= 11) weather.innerHTML = "🍂";
  else weather.innerHTML = "❄️";
  weather.style.fontSize = "24px";
  weather.style.opacity = "0.5";
  weather.style.position = "absolute";
  weather.style.bottom = "8px";
  weather.style.right = "8px";
}

function updateRoomClock() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  $("#roomClock").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
setInterval(updateRoomClock, 1000);

function showRoomMessage(text, duration = 3000) {
  const msg = $("#roomMessage");
  msg.textContent = text;
  msg.classList.add("show");
  clearTimeout(msg._timer);
  msg._timer = setTimeout(() => msg.classList.remove("show"), duration);
}

function bindRoomObjects() {
  const map = {
    objCalendar: "calendar",
    objAlarm: "alarm",
    objNotepad: "notepad",
    objRadio: "radio",
    objMug: "mug",
    objPlant: "plant",
    objPhone: "phone",
    objLamp: "lamp",
    objDrawer: "drawer",
    objTrash: "trash",
    objPhoto: "photo",
    objDoor: "door",
    objComputer: "computer"
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = $("#" + id);
    if (!el) return;
    // 避免重複綁定
    if (el.dataset.bound) return;
    el.dataset.bound = "1";
    el.addEventListener("click", () => handleRoomClick(key));
  });
}

function handleRoomClick(key) {
  if (key === "computer") {
    enterDesktop();
    return;
  }
  if (key === "calendar") {
    if (state.calendarSolved) {
      showRoomMessage("日曆上的日期已經記起來了：03/14。");
      return;
    }
    openCalendarGame();
    return;
  }
  if (key === "radio") {
    if (state.radioSolved) {
      showRoomMessage("收音機調到 H 頻道了。");
      return;
    }
    openRadioGame();
    return;
  }
  if (key === "trash") {
    showRoomMessage("草稿上寫著：\n「請把今天忘掉
