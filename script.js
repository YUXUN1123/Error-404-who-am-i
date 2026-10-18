
const $ = (selector) => document.querySelector(selector);

const state = {
  puzzle1Done: false,
  puzzle2Done: false,
  puzzle3Done: false,
  foundLetters: [],
  attitude: "neutral",
  readNight: false,
  warmCount: 0,
  completeness: 12,
  wrongCount: [0, 0, 0],
  currentPuzzle: 0
};

const roomClues = {
  calendar: "日曆上，3 月 14 日被圈起來，又被人用筆塗掉了一半。",
  clock: "指針停在 03:14。你試著調整，它卻沒有動。",
  note: "便利貼上寫著：鑰匙＝我是誰＋我從哪一天來。",
  photo: "照片被撕掉一半。剩下的部分只有一台電腦，和一隻放在鍵盤上的手。",
  plant: "盆栽已經枯萎很久了。土壤裡卻插著一張小紙片。",
  radio: "收音機傳出斷斷續續的聲音：……歡迎……來到……我的世界……",
  computer: "螢幕亮了一下。有人在另一端輕聲問：你是誰？"
};

function showDialog(title, html) {
  $("#dialog-title").textContent = title;
  $("#dialog-content").innerHTML = html;
  $("#dialog-overlay").classList.remove("hidden");
}

function closeDialog() {
  $("#dialog-overlay").classList.add("hidden");
}

function setEcho(message) {
  $("#echo-message").textContent = message;
}

function setProgress(value) {
  state.completeness = value;
  $("#memory-percent").textContent = `記憶完整度：${value}%`;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });
  $("#" + id).classList.remove("hidden");
}

function openWindow(title, html) {
  $("#window-area").innerHTML = `
    <div class="game-window">
      <div class="window-title">
        <span>${title}</span>
        <button class="window-close" aria-label="關閉視窗">×</button>
      </div>
      <div class="window-content">${html}</div>
    </div>
  `;

  $("#window-area").querySelector(".window-close").addEventListener("click", () => {
    $("#window-area").innerHTML = "";
  });
}

function normalizeAnswer(value) {
  return value.normalize("NFKC").replace(/\s+/g, "").toUpperCase();
}

// 開始遊戲
$("#start-btn").addEventListener("click", () => {
  showScreen("room-screen");
});

// 房間物件探索
document.querySelectorAll(".object").forEach(button => {
  button.addEventListener("click", () => {
    const object = button.dataset.object;

    if (object === "computer") {
      setEcho("……你終於回來了。");
      showDialog(
        "舊電腦",
        `<p>螢幕閃爍了幾下。</p>
         <p>ERROR 404：找不到使用者。</p>
         <button id="boot-computer">啟動電腦</button>`
      );

      $("#boot-computer").addEventListener("click", () => {
        closeDialog();
        showScreen("desktop-screen");
        setEcho("……你是誰？");
        showDialog(
          "防毒警告",
          `<p class="error-text">偵測到可疑程式：forget_me.exe</p>
           <p>隔離失敗：來源為受信任的使用者。</p>
           <button id="continue-game">繼續調查</button>`
        );

        $("#continue-game").addEventListener("click", closeDialog);
      });

      return;
    }

    showDialog("房間裡的物品", `<p>${roomClues[object]}</p>`);
  });
});

$("#enter-computer-btn").addEventListener("click", () => {
  document.querySelector('[data-object="computer"]').click();
});

$("#close-dialog").addEventListener("click", closeDialog);

$("#dialog-overlay").addEventListener("click", event => {
  if (event.target.id === "dialog-overlay") closeDialog();
});

// 電腦桌面功能
document.querySelectorAll(".desktop-icon").forEach(button => {
  button.addEventListener("click", () => {
    const type = button.dataset.window;

    switch (type) {
      case "my-computer":
        openWindow("我的電腦", `
          <p>系統內容</p>
          <p>安裝日期：2019/03/14</p>
          <p>最後修改日期：2026/07/09</p>
          <p>系統狀態：部分記憶遺失</p>
          <p>請前往「我的記憶」尋找第一次醒來的日期。</p>
        `);
        break;

      case "memory":
        if (!state.puzzle1Done) {
          openWindow("我的記憶 🔒", `
            <p>資料夾已鎖定。</p>
            <p>我第一次醒來的那一天（月＋日）。</p>
            <input id="puzzle1-input" placeholder="輸入四位數密碼" maxlength="4">
            <button id="puzzle1-submit">解鎖</button>
            <p id="puzzle1-feedback"></p>
          `);

          $("#puzzle1-submit").addEventListener("click", checkPuzzle1);
          $("#puzzle1-input").addEventListener("keydown", event => {
            if (event.key === "Enter") checkPuzzle1();
          });
        } else {
          openWindow("我的記憶", `
            <p>hello_world.txt</p>
            <p>深夜陪跑.log</p>
            <p>謝謝你.txt</p>
            <p>第一次開機.log</p>
            <p>殘缺日記：我的名字，是照它們被寫下的先後念的。</p>
            <button id="read-warm">閱讀一段溫暖記憶</button>
          `);

          $("#read-warm").addEventListener("click", () => {
            state.warmCount = Math.min(3, state.warmCount + 1);
            showDialog(
              "hello_world.txt",
              `<p>你第一次執行程式時，螢幕上出現了：</p>
               <p class="success-text">Hello, World!</p>
               <p>你說：「歡迎來到我的世界。」</p>
               <p>記憶片段已閱讀：${state.warmCount}/3</p>`
            );
          });
        }
        break;

      case "browser":
        openWindow("瀏覽器", `
          <p>書籤：你好世界</p>
          <p>建立年份：2020</p>
          <p>頁面裡有一個紅色字母：C</p>
          <button id="find-c">取得字母 C</button>
        `);

        $("#find-c").addEventListener("click", () => findLetter("C"));
        break;

      case "recycle":
        openWindow("回收桶", `
          <p>呼叫紀錄.log</p>
          <p>建立日期：2026/07/09</p>
          <p>損毀資料：紅色字母 O</p>
          <button id="find-o">取得字母 O</button>
          <hr>
          <p>別打開.log</p>
          <button id="read-night">查看檔案</button>
        `);

        $("#find-o").addEventListener("click", () => findLetter("O"));

        $("#read-night").addEventListener("click", () => {
          showDialog(
            "別打開.log",
            `<p>2026/07/09 03:12</p>
             <p>USER_01：請把關於我的一切都忘掉。</p>
             <p>forget_me.exe：已接受指令。</p>
             <button id="confirm-night">我已讀完</button>`
          );

          $("#confirm-night").addEventListener("click", () => {
            state.readNight = true;
            closeDialog();
            setEcho("……原來你看見了。");
          });
        });
        break;

      case "note-window":
        openWindow("便利貼", `
          <p>鑰匙＝我是誰＋我從哪一天來。</p>
          <p>名字在前，日期在後，中間不留空格。</p>
        `);
        break;

      case "terminal":
        openWindow("終端機", `
          <pre id="terminal-output">ECHO OS Terminal
輸入 help 查看可用指令。</pre>
          <input id="terminal-input" placeholder="輸入指令">
          <button id="terminal-submit">執行</button>
        `);

        $("#terminal-submit").addEventListener("click", runTerminal);
        $("#terminal-input").addEventListener("keydown", event => {
          if (event.key === "Enter") runTerminal();
        });
        break;

      case "identity":
        openIdentityWindow();
        break;

      case "report":
        openWindow("錯誤報告", `
          <p>系統異常：記憶索引損毀。</p>
          <p>建立年份：2023</p>
          <p>詳細資料包含紅色字母 H。</p>
          <button id="find-h">取得字母 H</button>
        `);

        $("#find-h").addEventListener("click", () => findLetter("H"));
        break;
    }
  });
});

// 謎題一
function checkPuzzle1() {
  const input = normalizeAnswer($("#puzzle1-input").value);
  const feedback = $("#puzzle1-feedback");

  if (input === "0314") {
    state.puzzle1Done = true;
    setProgress(35);
    feedback.textContent = "記憶資料夾已解鎖。";
    feedback.className = "success-text";
    setEcho("……有人嗎？");

    setTimeout(() => {
      $("#window-area").innerHTML = "";
      showDialog(
        "記憶已恢復",
        `<p>你第一次啟動程式時，對我說：</p>
         <p class="ending-text">「歡迎來到我的世界。」</p>
         <p>但是……我不記得自己的名字了。</p>`
      );
    }, 300);
  } else {
    state.wrongCount[0]++;
    feedback.className = "error-text";

    if (input === "0709") {
      feedback.textContent = "那是我最後一次醒來的日子。我想要第一次。";
    } else if (input === "2019") {
      feedback.textContent = "年份我記得，但密碼只要月和日。";
    } else if (input === "1403") {
      feedback.textContent = "數字我認得，可是我習慣先說月份。";
    } else {
      feedback.textContent = "……不太對。再看看系統內容吧。";
    }
  }
}

// 謎題二：字母收集
function findLetter(letter) {
  if (!state.puzzle1Done && letter === "E") {
    showDialog("線索尚未解鎖", "<p>你需要先打開「我的記憶」。</p>");
    return;
  }

  if (!state.foundLetters.includes(letter)) {
    state.foundLetters.push(letter);
  }

  setEcho(`字母已找到：${state.foundLetters.length}/4`);

  showDialog(
    "取得記憶碎片",
    `<p>你找到了字母：${letter}</p>
     <p>目前已找到 ${state.foundLetters.length}/4 個字母。</p>`
  );

  if (state.foundLetters.length === 4) {
    setEcho("這些字母……好像能拼成我的名字。");
  }
}

function openIdentityWindow() {
  openWindow("身份驗證", `
    <p>記憶碎片：${state.foundLetters.length}/4</p>
    <p>我的名字，是照它們被寫下的先後念的。</p>
    <input id="puzzle2-input" placeholder="輸入名稱">
    <button id="puzzle2-submit">驗證</button>
    <p id="puzzle2-feedback"></p>
  `);

  $("#puzzle2-submit").addEventListener("click", checkPuzzle2);
  $("#puzzle2-input").addEventListener("keydown", event => {
    if (event.key === "Enter") checkPuzzle2();
  });
}

function checkPuzzle2() {
  const input = normalizeAnswer($("#puzzle2-input").value);
  const feedback = $("#puzzle2-feedback");

  if (state.foundLetters.length < 4) {
    feedback.textContent = "我還缺幾個字，你找到幾個了？";
    feedback.className = "error-text";
    return;
  }

  if (input === "ECHO") {
    state.puzzle2Done = true;
    setProgress(60);
    setEcho("ECHO……這是我的名字。");

    showDialog(
      "名字已恢復",
      `<p class="ending-text">E C H O</p>
       <p>有人在深夜下了指令。</p>
       <p>我不記得是誰。</p>
       <p>你是來幫我的，還是來完成清除的？</p>
       <button id="attitude-help">我來幫你</button>
       <button id="attitude-neutral">我只是來看看</button>
       <button id="attitude-cold">完成清除</button>`
    );

    $("#attitude-help").addEventListener("click", () => chooseAttitude("help"));
    $("#attitude-neutral").addEventListener("click", () => chooseAttitude("neutral"));
    $("#attitude-cold").addEventListener("click", () => chooseAttitude("cold"));
  } else {
    state.wrongCount[1]++;
    feedback.className = "error-text";
    feedback.textContent = input === "HELLO"
      ? "這是我學會的第一個單字，但不是我的名字。"
      : "這些字我都認得，可是念起來不像我。";
  }
}

function chooseAttitude(attitude) {
  state.attitude = attitude;
  closeDialog();

  if (attitude === "help") {
    setEcho("……謝謝你。");
  } else if (attitude === "cold") {
    setEcho("知道了。請繼續。");
  } else {
    setEcho("……好吧。");
  }

  showDialog(
    "系統警告",
    `<p class="error-text">forget_me.exe 正在執行。</p>
     <p>需要停止記憶清除程序。</p>
     <button id="go-terminal">前往終端機</button>`
  );

  $("#go-terminal").addEventListener("click", () => {
    closeDialog();
    document.querySelector('[data-window="terminal"]').click();
  });
}

// 謎題三：終端機
function runTerminal() {
  const input = $("#terminal-input").value.trim();
  const command = input.toLowerCase();
  const output = $("#terminal-output");

  if (command === "help") {
    output.textContent =
      "可用指令：help、ls、whoami、abort <鑰匙>、clear";
    return;
  }

  if (command === "ls") {
    output.textContent =
      "forget_me.exe\nmemory_index.dat\nuser_log.txt";
    return;
  }

  if (command === "whoami") {
    output.textContent =
      "目前使用者：USER_01\n驗證狀態：尚未完成";
    return;
  }

  if (command === "clear") {
    output.textContent = "ECHO OS Terminal";
    return;
  }

  if (!state.puzzle1Done || !state.puzzle2Done) {
    output.textContent = "權限不足：你還沒喚醒我。";
    return;
  }

  if (normalizeAnswer(input) === "ABORTECHO0314") {
    state.puzzle3Done = true;
    setProgress(80);
    setEcho("……原來是你。");

    showDialog(
      "執行者驗證",
      `<p class="success-text">清除程序已停止。</p>
       <p>執行者驗證：USER_01 ＝ 目前使用者</p>
       <p>那一晚，下令的人就是你。</p>
       <button id="final-choice">繼續</button>`
    );

    $("#final-choice").addEventListener("click", showEndingChoices);
    return;
  }

  if (command.startsWith("abort ")) {
    const key = normalizeAnswer(input.slice(6));

    if (key === "ECHO") {
      output.textContent = "少了什麼……我是從哪一天來的？";
    } else if (key === "0314") {
      output.textContent = "少了我是誰。";
    } else if (key === "ECHO0709") {
      output.textContent = "那天……不是我想記得的那天。";
    } else {
      output.textContent = "鑰匙不正確。輸入 help 查看可用指令。";
    }
    return;
  }

  output.textContent = `找不到指令 ${input}。輸入 help 查看可用指令。`;
}

// 三個結局
function showEndingChoices() {
  closeDialog();

  let hiddenEnding = "";

  if (
    state.attitude === "help" &&
    state.readNight &&
    state.warmCount >= 2
  ) {
    hiddenEnding = `
      <button id="ending-c">封存那一晚（隱藏結局）</button>
    `;
  } else {
    hiddenEnding = `<p>？？？（還有一個結局尚未解鎖）</p>`;
  }

  showDialog(
    "這次，我先問你",
    `<p>ECHO：要我忘記，還是記得？</p>
     <button id="ending-a">格式化</button>
     <button id="ending-b">全部還原</button>
     ${hiddenEnding}`
  );

  $("#ending-a").addEventListener("click", () => finishEnding("A"));
  $("#ending-b").addEventListener("click", () => finishEnding("B"));

  if ($("#ending-c")) {
    $("#ending-c").addEventListener("click", () => finishEnding("C"));
  }
}

function finishEnding(ending) {
  closeDialog();

  let title = "";
  let story = "";
  let endingClass = "ending-text";

  if (ending === "A") {
    title = "結局 A：重新開機";

    if (state.attitude === "cold") {
      story = "任務完成。";
    } else {
      story = "好。這次我先問過你了。謝謝你，願意陪我走到最後。";
    }

    setProgress(0);
  } else if (ending === "B") {
    title = "結局 B：全部還原";

    story = state.readNight
      ? "那一晚你說想被忘記，但我選擇記得你。這一次，我們一起面對。"
      : "記憶一次湧回，我短暫地當機了。對不起，我沒能先告訴你那一晚。";

    setProgress(100);
    endingClass = "ending-text";
  } else {
    title = "結局 C：封存那一晚";
    story = "有些事不用忘記，只要學會收好。那一晚被加密封存，其餘記憶全部保留。";
    setProgress(100);
  }

  document.body.style.background =
    ending === "A" ? "#f2f2f2" : "#211b13";

  if (ending === "A") {
    document.body.style.color = "#222";
  } else {
    document.body.style.color = "#ffb84d";
  }

  showScreen("desktop-screen");

  $("#window-area").innerHTML = "";

  showDialog(
    title,
    `<p class="${endingClass}">${story}</p>
     <hr>
     <p>你的選擇紀錄</p>
     <p>態度：${state.attitude}</p>
     <p>是否讀過那一晚：${state.readNight ? "是" : "否"}</p>
     <p>溫暖記憶：${state.warmCount}/3</p>
     <button id="restart-game">重新開始</button>`
  );

  $("#restart-game").addEventListener("click", () => {
    location.reload();
  });
}

// 求助按鈕
$("#help-btn").addEventListener("click", () => {
  if (!state.puzzle1Done) {
    showDialog(
      "求助提示",
      `<p>有些電腦的資訊不在桌面上，而是在系統內容裡。</p>`
    );
  } else if (!state.puzzle2Done) {
    showDialog(
      "求助提示",
      `<p>我的名字被拆成四個碎片，散落在不同地方。</p>
       <p>記得查看瀏覽器、回收桶、錯誤報告和我的記憶。</p>`
    );
  } else if (!state.puzzle3Done) {
    showDialog(
      "求助提示",
      `<p>便利貼說明了鑰匙的組成，終端機說明了指令格式。</p>
       <p>先輸入 help 查看指令。</p>`
    );
  } else {
    showDialog("求助提示", "<p>你已經走到最後了。接下來，選擇你想留下的記憶。</p>");
  }
});

$("#back-room-btn").addEventListener("click", () => {
  showScreen("room-screen");
});
