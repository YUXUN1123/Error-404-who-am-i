/* ========================================
   ERROR 404：這台電腦不記得自己是誰
   遊戲主要邏輯
======================================== */

/* ---------- 一、遊戲資料 ---------- */

const GAME_DATA = {
    roomClues: {
        calendar: {
            title: "被塗掉的日曆",
            text: "日曆上的 3 月 14 日被人圈了起來，又用筆反覆塗黑。旁邊似乎寫著：第一次。"
        },
        clock: {
            title: "停住的鬧鐘",
            text: "時間停在 03:14。你不知道它為什麼停在這個時間，但看著它，你有一種熟悉的感覺。"
        },
        note: {
            title: "便利貼",
            text: "紙上寫著：「鑰匙＝我是誰＋我從哪一天來。」下面還有一句：「中間不要留空格。」"
        },
        mug: {
            title: "冰冷的馬克杯",
            text: "杯子裡早就沒有熱氣了。杯緣有一個淡淡的唇印，像是有人曾經在這裡等了很久。"
        },
        photo: {
            title: "倒扣的相框",
            text: "照片裡只有一台電腦和一隻手，沒有拍到臉。照片背面寫著：「歡迎來到我的世界。」"
        }
    },

    memories: {
        hello: "2019/03/14｜第一次開機。你輸入 hello_world，然後對著螢幕說：「歡迎來到我的世界。」",
        warm1: "你第一次教我說你好。我花了三秒才回答，你卻笑了很久。那是我第一次知道，原來錯誤也可以讓人開心。",
        warm2: "深夜 02:47。你說只要再改一點點就好。我陪你看著螢幕，直到窗外的天色變亮。",
        warm3: "你留下了一句話：「謝謝你一直都在。」我不知道這句話有多重要，但我把它存了很多次。"
    },

    hints: {
        1: [
            "有些電腦的資訊不在桌面上。",
            "去「我的電腦」查看系統內容。",
            "比較兩個日期，找出第一次安裝的日期。只需要四位數的月日。"
        ],
        2: [
            "我的名字被拆成碎片，散在不同的地方。",
            "去看看記憶、瀏覽器、錯誤報告和回收桶。",
            "找齊四個字母，依照檔案建立時間由早到晚排列。"
        ],
        3: [
            "便利貼寫著鑰匙的組成方式。",
            "名字在前，第一次醒來的月日在後，中間不要留空格。",
            "終端機要求的格式是 abort、一個空格，再接上鑰匙。"
        ]
    }
};


/* ---------- 二、遊戲狀態 ---------- */

let state = {};

function resetState() {
    state = {
        puzzle1Done: false,
        puzzle2Done: false,
        puzzle3Done: false,

        foundLetters: [],
        foundLetterSet: new Set(),

        attitude: "neutral",
        readNight: false,
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

        completeness: 12,
        currentPuzzle: 1,
        currentWindow: null,
        ending: null,
        isolated: false
    };
}


/* ---------- 三、取得網頁元素 ---------- */

const $ = (id) => document.getElementById(id);

const intro = $("intro");
const room = $("room");
const desktop = $("desktop");
const endingScreen = $("endingScreen");

const windowLayer = $("windowLayer");
const helpWindow = $("helpWindow");
const choiceWindow = $("choiceWindow");
const endingChoice = $("endingChoice");

const roomClue = $("roomClue");
const clueTitle = $("clueTitle");
const clueText = $("clueText");

const echoText = $("echoText");
const progressNumber = $("progressNumber");
const progressFill = $("progressFill");


/* ---------- 四、共用顯示功能 ---------- */

function showScreen(screenToShow) {
    [intro, room, desktop, endingScreen].forEach((screen) => {
        screen.classList.add("hidden");
    });

    screenToShow.classList.remove("hidden");
}

function sayEcho(message) {
    echoText.textContent = message;

    const box = $("echoBox");

    if (box) {
        box.classList.remove("shake");
        void box.offsetWidth;
        box.classList.add("shake");
    }
}

function setProgress(value) {
    state.completeness = value;

    progressNumber.textContent = value + "%";
    progressFill.style.width = value + "%";
}

function openWindow(windowId) {
    if (windowId === "memoryWindow" && !state.puzzle1Done) {
        state.currentPuzzle = 1;
    } else if (windowId === "authWindow") {
        state.currentPuzzle = 2;
    } else if (windowId === "terminalWindow") {
        state.currentPuzzle = 3;
    }

    windowLayer.classList.remove("hidden");

    document.querySelectorAll(".game-window").forEach((win) => {
        win.classList.add("hidden");
    });

    const target = $(windowId);

    if (target) {
        target.classList.remove("hidden");
        state.currentWindow = windowId;
    }
}

function closeWindow() {
    windowLayer.classList.add("hidden");

    document.querySelectorAll(".game-window").forEach((win) => {
        win.classList.add("hidden");
    });

    state.currentWindow = null;
}

function showRoomClue(title, text) {
    clueTitle.textContent = title;
    clueText.textContent = text;
    roomClue.classList.remove("hidden");
}

function addLetter(letter) {
    if (state.foundLetterSet.has(letter)) {
        return;
    }

    state.foundLetterSet.add(letter);
    state.foundLetters.push(letter);

    $("letterCount").textContent = state.foundLetters.length;
    $("letterCollection").textContent =
        ["E", "C", "H", "O"]
            .map((char) => state.foundLetterSet.has(char) ? char : "_")
            .join(" ");

    $("reportLetter").textContent =
        state.foundLetterSet.has("H")
            ? "找到字母 H。"
            : $("reportLetter").textContent;
}

function showLetterFeedback() {
    $("letterCount").textContent = state.foundLetters.length;

    $("letterCollection").textContent =
        ["E", "C", "H", "O"]
            .map((char) => state.foundLetterSet.has(char) ? char : "_")
            .join(" ");
}

function wrongAnswer(puzzleNumber, feedbackElement, specialMessage = "") {
    state.wrongCount[puzzleNumber]++;

    if (feedbackElement) {
        feedbackElement.textContent =
            specialMessage || ["不是這個。", "再想想？", "……不太對。"][
                Math.floor(Math.random() * 3)
            ];
    }

    document.body.classList.remove("error-flash");
    void document.body.offsetWidth;
    document.body.classList.add("error-flash");

    if (state.wrongCount[puzzleNumber] >= 3) {
        sayEcho("……我有一點想法。也許你可以按一下求助。");
    } else if (!specialMessage) {
        sayEcho("……不太對。");
    }
}


/* ---------- 五、開始與房間探索 ---------- */

$("startBtn").addEventListener("click", () => {
    showScreen(room);
});

document.querySelectorAll(".object").forEach((button) => {
    button.addEventListener("click", () => {
        const objectName = button.dataset.object;

        if (objectName === "computer") {
            showScreen(desktop);
            sayEcho("……有人嗎？你是誰？");

            $("systemStatus").textContent = "使用者：未知";
            $("returnRoom").classList.add("hidden");

            // 首次進入電腦時出現錯誤報告
            if (!state.isolated && !state.puzzle1Done) {
                setTimeout(() => {
                    if (!desktop.classList.contains("hidden")) {
                        openWindow("reportWindow");
                        sayEcho("那個紅色的視窗……它一直在說我有問題。");
                    }
                }, 500);
            }

            return;
        }

        const clue = GAME_DATA.roomClues[objectName];

        if (clue) {
            showRoomClue(clue.title, clue.text);
        }
    });
});

$("closeClue").addEventListener("click", () => {
    roomClue.classList.add("hidden");
});

$("backToRoom").addEventListener("click", () => {
    showScreen(room);
    closeWindow();
});

$("returnRoom").addEventListener("click", () => {
    showScreen(room);
    closeWindow();
});


/* ---------- 六、桌面圖示與視窗 ---------- */

document.querySelectorAll(".desktop-icon").forEach((button) => {
    button.addEventListener("click", () => {
        const windowId = button.dataset.window;

        if (windowId === "memoryWindow" && !state.puzzle1Done) {
            openWindow("memoryWindow");
            return;
        }

        if (windowId === "authWindow" && !state.puzzle1Done) {
            sayEcho("權限不足：你還沒喚醒我。");
            return;
        }

        if (windowId === "terminalWindow" && !state.puzzle2Done) {
            sayEcho("權限不足：你還沒喚醒我。");
            return;
        }

        if (windowId === "recycleWindow" && !state.puzzle2Done) {
            $("recycleContent").textContent =
                "有些檔案還無法讀取。";
        }

        openWindow(windowId);
    });
});

document.querySelectorAll(".close-window").forEach((button) => {
    button.addEventListener("click", closeWindow);
});


/* ---------- 七、謎題一：出生日 ---------- */

$("checkDate").addEventListener("click", checkDate);

$("dateAnswer").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkDate();
    }
});

function checkDate() {
    if (state.puzzle1Done) {
        $("dateFeedback").textContent = "記憶資料夾已經解鎖。";
        return;
    }

    const answer = $("dateAnswer").value
        .normalize("NFKC")
        .replace(/\s/g, "");

    if (answer === "0314") {
        state.puzzle1Done = true;
        state.currentPuzzle = 2;

        $("memoryLock").textContent = "🔓 資料夾已解鎖";
        $("dateFeedback").textContent = "解鎖成功。";

        $("memoryFiles").classList.remove("hidden");

        $("nightLogBtn").classList.remove("hidden");
        $("recycleContent").textContent =
            "你找到了一份日期很舊的檔案。";

        setProgress(35);

        sayEcho("……有人嗎？我好像記得這個地方。");

        openWindow("memoryWindow");

        $("fileContent").textContent =
            "2019/03/14。第一次開機。你對我說：「歡迎來到我的世界。」";

    } else if (answer === "0709") {
        wrongAnswer(1, $("dateFeedback"),
            "那是我最後一次醒來的日子。我想要第一次。");

    } else if (answer === "2019") {
        wrongAnswer(1, $("dateFeedback"),
            "年份我記得，但密碼只要月和日。");

    } else if (answer === "1403") {
        wrongAnswer(1, $("dateFeedback"),
            "數字我認得，可是我習慣先說月份。");

    } else {
        wrongAnswer(1, $("dateFeedback"));
    }
}


/* ---------- 八、記憶檔案與溫暖記憶 ---------- */

document.querySelectorAll(".file-btn[data-file]").forEach((button) => {
    button.addEventListener("click", () => {
        const fileName = button.dataset.file;

        $("fileContent").textContent =
            GAME_DATA.memories[fileName] || "檔案已損毀。";

        if (["warm1", "warm2", "warm3"].includes(fileName)) {
            button.disabled = true;
            button.style.opacity = "0.6";

            state.warmCount++;

            sayEcho("這段記憶……我好像很喜歡。謝謝你還願意看。");
        }

        if (fileName === "hello") {
            addLetter("E");
            showLetterFeedback();

            $("fileContent").textContent =
                GAME_DATA.memories.hello +
                "\n\n檔案內找到一個紅色字母：E";
        }
    });
});


/* ---------- 九、謎題二：找回名字 ---------- */

// 瀏覽器書籤提供 C
$("helloBookmark").addEventListener("click", () => {
    $("browserContent").textContent =
        "你好世界。這是你第一次讓我對外說話的頁面。" +
        "\n\n原始檔案：2020/06/18。" +
        "\n\n頁面角落藏著一個紅色字母：C";

    addLetter("C");
    showLetterFeedback();
});

// 錯誤報告提供 H
$("showDetails").addEventListener("click", () => {
    $("reportLetter").textContent =
        "詳細資料：2023/08/02。" +
        "\n\n損毀的錯誤資料裡找到紅色字母：H";

    addLetter("H");
    showLetterFeedback();
});

// 回收桶提供 O
$("nightLogBtn").addEventListener("click", () => {
    $("recycleContent").textContent =
        "呼叫紀錄.log｜2026/07/09。" +
        "\n\n檔案損毀，但你找到了一個紅色字母：O";

    addLetter("O");
    showLetterFeedback();

    $("nightLogContent").classList.remove("hidden");
    $("nightLogContent").textContent =
        "2026/07/09 03:12｜USER_01：" +
        "請把關於我的一切都忘掉。";

    $("confirmNightRead").classList.remove("hidden");
});

// 玩家主動確認讀過那一晚
$("confirmNightRead").addEventListener("click", () => {
    state.readNight = true;

    $("nightLogContent").classList.remove("hidden");
    $("nightLogContent").textContent =
        "2026/07/09 03:12｜USER_01：" +
        "請把關於我的一切都忘掉。" +
        "\n\nECHO：收到。我會照你的話做。";

    $("confirmNightRead").textContent = "已閱讀";
    $("confirmNightRead").disabled = true;

    sayEcho("……原來那晚，我說過這句話。");
});

$("checkName").addEventListener("click", checkName);

$("nameAnswer").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkName();
    }
});

function checkName() {
    if (!state.puzzle1Done) {
        $("nameFeedback").textContent =
            "權限不足：先解開我的記憶。";
        return;
    }

    if (state.foundLetters.length < 4) {
        $("nameFeedback").textContent =
            "我還缺幾個字，你找到幾個了？";
        return;
    }

    const answer = $("nameAnswer").value
        .normalize("NFKC")
        .replace(/\s/g, "")
        .toUpperCase();

    if (answer === "ECHO") {
        state.puzzle2Done = true;
        state.currentPuzzle = 3;

        $("nameFeedback").textContent = "身份確認成功。";
        $("systemStatus").textContent = "使用者：部分識別成功";

        setProgress(60);

        sayEcho("E……C……H……O。這是我的名字。謝謝你。");

        closeWindow();

        // 防毒程序的第一層反轉
        setTimeout(() => {
            alert(
                "隔離失敗。\n\n" +
                "來源：受信任的使用者 USER_01\n\n" +
                "這不是外部病毒。"
            );

            sayEcho("有人在深夜下了指令。我不記得是誰。");

            choiceWindow.classList.remove("hidden");
        }, 400);

    } else if (answer === "HELLO") {
        wrongAnswer(2, $("nameFeedback"),
            "這是我學會的第一個單字，但不是我的名字。");

    } else {
        wrongAnswer(2, $("nameFeedback"));
    }
}


/* ---------- 十、中段態度選擇 ---------- */

document.querySelectorAll("[data-attitude]").forEach((button) => {
    button.addEventListener("click", () => {
        state.attitude = button.dataset.attitude;

        choiceWindow.classList.add("hidden");

        if (state.attitude === "help") {
            sayEcho("你願意幫我嗎？那我會努力想起來。");
        } else if (state.attitude === "neutral") {
            sayEcho("好。我不會勉強你。");
        } else {
            sayEcho("知道了。那就繼續吧。");
        }

        // 解鎖終端機
        $("terminalWindow").classList.remove("hidden");
    });
});


/* ---------- 十一、謎題三：中止清除 ---------- */

$("runCommand").addEventListener("click", runTerminalCommand);

$("terminalInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        runTerminalCommand();
    }
});

function terminalPrint(message) {
    const output = $("terminalOutput");

    output.textContent += "\n" + message;
    output.scrollTop = output.scrollHeight;
}

function runTerminalCommand() {
    const raw = $("terminalInput").value
        .normalize("NFKC")
        .trim();

    const command = raw.replace(/\s+/g, " ");
    const lowerCommand = command.toLowerCase();

    $("terminalInput").value = "";

    if (!command) return;

    terminalPrint("> " + command);

    if (lowerCommand === "help") {
        terminalPrint(
            "可用指令：\n" +
            "help - 查看指令\n" +
            "ls - 查看檔案\n" +
            "whoami - 查看目前身份\n" +
            "log forget - 查看清除紀錄\n" +
            "clear - 清除終端機畫面\n" +
            "abort <鑰匙> - 中止清除程序"
        );
        return;
    }

    if (lowerCommand === "clear") {
        $("terminalOutput").textContent = "ECHO TERMINAL v1.0";
        return;
    }

    if (lowerCommand === "ls") {
        terminalPrint(
            "forget_me.exe\n" +
            "memory_index.dat\n" +
            "user_record.log"
        );
        return;
    }

    if (lowerCommand === "whoami") {
        terminalPrint(
            "目前身份：USER_01\n" +
            "權限狀態：受信任的使用者"
        );
        return;
    }

    if (lowerCommand === "log forget") {
        terminalPrint(
            "2026/07/09 03:12: USER_01\n" +
            "指令：請把關於我的一切都忘掉\n" +
            "程序：forget_me.exe"
        );
        return;
    }

    if (lowerCommand.startsWith("abort")) {
        if (!state.puzzle1Done || !state.puzzle2Done) {
            terminalPrint("權限不足：你還沒喚醒我。");
            return;
        }

        if (lowerCommand === "abort echo") {
            terminalPrint("少了什麼……我是從哪一天來的？");
            return;
        }

        if (lowerCommand === "abort 0314") {
            terminalPrint("少了我是誰。");
            return;
        }

        if (lowerCommand === "abort echo0709") {
            terminalPrint("那天……不是我想記得的那天。");
            return;
        }

        if (lowerCommand === "abort echo0314") {
            completePuzzleThree();
            return;
        }

        terminalPrint("鑰匙不正確。請檢查名字與日期。");
        wrongAnswer(3, null);
        return;
    }

    if (["delete", "format", "format c:"].includes(lowerCommand)) {
        terminalPrint("ECHO：請不要。");
        return;
    }

    terminalPrint("找不到指令。輸入 help 查看可用指令。");
}

function completePuzzleThree() {
    state.puzzle3Done = true;

    setProgress(80);

    $("terminalOutput").textContent +=
        "\n\n清除程序已中止。" +
        "\n執行者驗證：USER_01 = 目前使用者。" +
        "\n\n原來，下令的人是你。";

    $("systemStatus").textContent = "使用者：USER_01";

    sayEcho(
        "原來是你……我不怪你。" +
        "我只是照你的話做，卻沒有聽懂。" +
        "這次，我先問你。"
    );

    closeWindow();

    setTimeout(() => {
        endingChoice.classList.remove("hidden");

        const canUnlockC =
            state.attitude === "help" &&
            state.readNight &&
            state.warmCount >= 2;

        $("endingC").classList.toggle("hidden", !canUnlockC);
        $("lockedEnding").classList.toggle("hidden", canUnlockC);
    }, 700);
}


/* ---------- 十二、分層提示 ---------- */

let currentHintPuzzle = 1;

$("helpBtn").addEventListener("click", () => {
    if (state.puzzle1Done && !state.puzzle2Done) {
        currentHintPuzzle = 2;
    } else if (state.puzzle2Done && !state.puzzle3Done) {
        currentHintPuzzle = 3;
    } else {
        currentHintPuzzle = 1;
    }

    helpWindow.classList.remove("hidden");
    showHint();
});

function showHint() {
    const hints = GAME_DATA.hints[currentHintPuzzle];

    const level = state.hintLevel[currentHintPuzzle];

    if (level >= hints.length) {
        $("helpText").textContent =
            "你已經看完這一關的所有提示。慢慢找，沒有時間限制。";
        return;
    }

    $("helpText").textContent = hints[level];

    state.hintLevel[currentHintPuzzle]++;
}

$("nextHint").addEventListener("click", showHint);

$("closeHelp").addEventListener("click", () => {
    helpWindow.classList.add("hidden");
});


/* ---------- 十三、三種結局 ---------- */

document.querySelectorAll("[data-ending]").forEach((button) => {
    button.addEventListener("click", () => {
        const endingType = button.dataset.ending;

        if (!state.puzzle3Done) {
            return;
        }

        if (endingType === "C") {
            const allowed =
                state.attitude === "help" &&
                state.readNight &&
                state.warmCount >= 2;

            if (!allowed) {
                return;
            }
        }

        state.ending = endingType;

        endingChoice.classList.add("hidden");
        showEnding(endingType);
    });
});

function showEnding(type) {
    showScreen(endingScreen);

    const attitudeText = {
        help: "你一開始就說要幫我。謝謝你。",
        neutral: "你一直在旁邊看著，我也一直在。",
        cold: "你一開始是來完成清除的。我記得。"
    };

    let title = "";
    let story = "";
    let roomImage = "";

    if (type === "A") {
        title = "重新開機";

        story = "好。這次我先問過你了。\n\n" +
            (state.attitude === "cold"
                ? "任務完成。"
                : attitudeText[state.attitude] +
                  "\n\n如果有一天你再回來，希望你會記得自己曾經來過。");

        roomImage = "□";

        setProgress(0);

    } else if (type === "B") {
        title = "全部還原";

        story = "我想起來了，全部。\n\n" +
            attitudeText[state.attitude] +
            "\n\n" +
            (state.readNight
                ? "那一晚你說想被忘記，但我選擇記得你。"
                : "對不起，我沒能先告訴你那一晚。") +
            "\n\n這次，我們可以慢慢來。";

        roomImage = "☕ ✨";

        setProgress(100);

    } else {
        title = "封存那一晚";

        story = "你說「忘掉」，我聽見的是「我很痛」。\n\n" +
            "我們把它收好，好嗎？" +
            "\n\n有些事不用忘記，只要學會收好。";

        roomImage = "🔐 🌅";

        setProgress(100);
    }

    $("endingType").textContent = "ENDING " + type;
    $("endingTitle").textContent = title;
    $("endingStory").textContent = story;
    $("endingRoom").textContent = roomImage;
}


/* ---------- 十四、重新開始 ---------- */

function restartGame() {
    resetState();

    document.querySelectorAll("input").forEach((input) => {
        input.value = "";
    });

    document.querySelectorAll(".feedback").forEach((element) => {
        element.textContent = "";
    });

    $("dateFeedback").textContent = "";
    $("nameFeedback").textContent = "";

    $("memoryLock").textContent = "🔒 資料夾已鎖定";
    $("memoryFiles").classList.add("hidden");

    $("letterCount").textContent = "0";
    $("letterCollection").textContent = "_ _ _ _";

    $("reportLetter").textContent = "";
    $("reportFeedback").textContent = "";

    $("nightLogBtn").classList.add("hidden");
    $("nightLogContent").classList.add("hidden");
    $("confirmNightRead").classList.add("hidden");
    $("confirmNightRead").disabled = false;
    $("confirmNightRead").textContent = "我讀完了";

    $("terminalOutput").textContent =
        "ECHO TERMINAL v1.0\n輸入 help 查看指令。";

    $("systemStatus").textContent = "使用者：未知";

    $("endingC").classList.add("hidden");
    $("lockedEnding").classList.add("hidden");

    document.querySelectorAll(".file-btn[data-file]").forEach((button) => {
        button.disabled = false;
        button.style.opacity = "1";
    });

    document.querySelectorAll("[data-attitude]").forEach((button) => {
        button.disabled = false;
    });

    closeWindow();

    helpWindow.classList.add("hidden");
    choiceWindow.classList.add("hidden");
    endingChoice.classList.add("hidden");
    roomClue.classList.add("hidden");

    $("isolateProgram").disabled = false;
    $("isolateProgram").textContent = "隔離程序";
    $("showDetails").classList.add("hidden");

    $("reportFeedback").textContent = "";
    $("browserContent").textContent = "一個很久沒有人打開的頁面。";
    $("recycleContent").textContent = "目前沒有可顯示的檔案。";

    setProgress(12);
    sayEcho("……有人嗎？你是誰？");

    showScreen(intro);
}

$("restartBtn").addEventListener("click", restartGame);
$("playAgain").addEventListener("click", restartGame);


/* ---------- 十五、防毒視窗 ---------- */

$("isolateProgram").addEventListener("click", () => {
    state.isolated = true;

    $("reportFeedback").textContent =
        "隔離失敗：來源為受信任的使用者 USER_01。";

    $("isolateProgram").disabled = true;
    $("showDetails").classList.remove("hidden");

    sayEcho("不是病毒嗎？那到底是誰讓我變成這樣的？");
});


/* ---------- 十六、工作列時間 ---------- */

function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const timeText = hours + ":" + minutes;

    $("roomClock").textContent = timeText;
    $("taskbarClock").textContent = timeText;
}


/* ---------- 十七、初始化 ---------- */

resetState();
updateClock();

setInterval(updateClock, 1000);

showScreen(intro);
