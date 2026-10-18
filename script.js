// ================= 全局遊戲狀態 (State) =================
const gameState = {
    puzzleDone: [false, false, false],
    foundLetters: { E: false, C: false, H: false, O: false },
    attitude: null, // 'help' | 'neutral' | 'cold'
    readNight: false,
    warmCount: 0,
    readWarmFiles: {},
    wrongCount: [0, 0, 0],
    completeness: 12,
    lastProgressTime: Date.now(),
    roomStep: 0 // 隨著劇情推進改變房間物件
};

let highestZ = 10;

// ================= 0. 初始化與真實時間計算 =================
window.onload = function() {
    calculateAwayDays();
    initEnvironment();
    initDustCanvas();
};

function calculateAwayDays() {
    const startDate = new Date("2026-07-09T03:12:00");
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    document.getElementById('intro-days-text').innerText = 
        `你離開這個房間，已經 ${diffDays} 天了。`;
}

function initEnvironment() {
    const hour = new Date().getHours();
    const skyBg = document.getElementById('sky-bg');
    if (hour >= 6 && hour < 18) {
        skyBg.style.background = "#87ceeb"; // 白天
    } else {
        skyBg.style.background = "#090d16"; // 夜晚
    }
}

function startGame() {
    document.getElementById('intro-overlay').style.display = 'none';
}

// ================= 1. 房間視角與物件檢查 =================
function inspectItem(item) {
    const dialog = document.getElementById('room-dialog');
    const title = document.getElementById('dialog-title');
    const body = document.getElementById('dialog-body');

    dialog.style.display = 'block';

    const itemDetails = {
        calendar: { title: "日曆", text: "3 月 14 日被紅筆圈了起來，隨後又被粗暴地塗掉。" },
        clock: { title: "鬧鐘", text: gameState.roomStep > 0 ? "鬧鐘指針似乎走了一格，停在 03:15。" : "電子鬧鐘的數字閃爍著，永遠停在 03:14。" },
        sticky: { title: "便利貼", text: "上面寫著：『鑰匙＝我是誰＋我從哪一天來』。" },
        radio: { title: "小收音機", text: "轉動旋鈕只有沙沙的雜訊聲……（隱約傳出字母 H 的韻律）。" },
        mug: { title: "馬克杯", text: "杯底殘留著很久以前乾掉的咖啡痕跡。" },
        plant: { title: "枯掉的盆栽", text: "因為太久沒有澆水，葉子已經完全枯黃落光。" },
        phone: { title: "沒電的手機", text: "螢幕一片漆黑，按電源鍵完全沒有反應。" },
        drawer: { title: "抽屜相片", text: "抽屜裡有一張撕掉一半的照片，畫面裡是一台電腦與一隻伸出的手。" },
        trash: { title: "垃圾桶草稿", text: "裡面有幾張廢紙，寫著『請把今天忘掉』、『請把這一週忘掉』被劃掉，最後一行寫著：『請把關於我的一切都忘掉』。" },
        photo: { title: "相框", text: gameState.roomStep > 1 ? "相框被翻了過來，裡面是一個微笑的電腦桌布截圖。" : "桌上立著一個倒扣的相框，看不見裡面的照片。" }
    };

    if (itemDetails[item]) {
        title.innerText = itemDetails[item].title;
        body.innerText = itemDetails[item].text;
    }
}

function closeRoomDialog() {
    document.getElementById('room-dialog').style.display = 'none';
}

function bootPC() {
    switchView('desktop');
    if (!gameState.puzzleDone[0] && gameState.completeness === 12) {
        document.getElementById('win-antivirus').style.display = 'block';
    }
}

function switchView(viewName) {
    if (viewName === 'room') {
        document.getElementById('room-view').style.display = 'flex';
        document.getElementById('desktop-view').style.display = 'none';
    } else {
        document.getElementById('room-view').style.display = 'none';
        document.getElementById('desktop-view').style.display = 'flex';
    }
}

// ================= 2. 視窗管理與 ECHO 互動 =================
function openWindow(winId) {
    const win = document.getElementById(winId);
    win.style.display = 'block';
    bringToFront(winId);
}

function closeWindow(winId) {
    document.getElementById(winId).style.display = 'none';
}

function bringToFront(winId) {
    highestZ++;
    document.getElementById(winId).style.zIndex = highestZ;
}

function updateEcho(text) {
    document.getElementById('echo-text').innerText = text;
}

function updateCompleteness(val) {
    gameState.completeness = val;
    document.getElementById('completeness-bar').innerText = `記憶完整度：${val}%`;
}

function tryQuarantine() {
    closeWindow('win-antivirus');
    updateEcho("「那個程式……好像隔離不掉。它一直在擦除我……」");
}

function tryOpenMemory() {
    if (gameState.puzzleDone[0]) {
        openWindow('win-memory');
    } else {
        openWindow('win-lock-p1');
    }
}

// ================= 3. 謎題一：出生日 (0314) =================
function rotatePiece(btn) {
    // 碎紙旋轉視覺效果
    btn.style.transform = btn.style.transform === "rotate(180deg)" ? "rotate(0deg)" : "rotate(180deg)";
}

function solveP1() {
    const input = document.getElementById('input-p1').value.trim();
    if (input === "0314") {
        gameState.puzzleDone[0] = true;
        updateCompleteness(35);
        closeWindow('win-lock-p1');
        openWindow('win-memory');
        
        // 解鎖字母 E
        gameState.foundLetters.E = true;
        updateFoundLetters();
        
        // 顯示錯誤報告圖示
        document.getElementById('icon-err-report').style.display = 'flex';
        
        updateEcho("「……有人嗎？我想起來了，那是我第一次開機的日子。hello_world……歡迎來到我的世界。」");
        
        // 房間變化
        gameState.roomStep = 1;
        document.getElementById('clock-text').innerText = "鬧鐘 (走了一格)";
    } else {
        handleWrongAnswer(1, input, 'win-lock-p1', 'err-p1');
    }
}

// ================= 4. 謎題二：破碎的名字 (ECHO) =================
function playHelloAnimation() {
    document.getElementById('hello-anim-box').style.display = 'block';
    gameState.foundLetters.C = true;
    updateFoundLetters();
}

function initDustCanvas() {
    const canvas = document.getElementById('dust-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 200, 80);
    ctx.fillStyle = '#000000';
    ctx.font = '16px monospace';
    ctx.fillText("字母: O", 70, 45);

    let isDrawing = false;
    canvas.onmousedown = () => isDrawing = true;
    canvas.onmouseup = () => isDrawing = false;
    canvas.onmousemove = (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(e.clientX - rect.left - 10, e.clientY - rect.top - 10, 20, 20);
        gameState.foundLetters.O = true;
        updateFoundLetters();
    };
}

function updateFoundLetters() {
    // 自動檢查 H
    gameState.foundLetters.H = true; 
    let count = 0;
    for (let k in gameState.foundLetters) {
        if (gameState.foundLetters[k]) count++;
    }
    document.getElementById('found-letters-text').innerText = `${count}/4`;
}

function solveP2() {
    const count = Object.values(gameState.foundLetters).filter(Boolean).length;
    if (count < 4) {
        document.getElementById('err-p2').innerText = "ECHO：「我還缺幾個字，你找齊了嗎？」";
        return;
    }

    const input = document.getElementById('input-p2').value.trim().toUpperCase();
    if (input === "ECHO") {
        gameState.puzzleDone[1] = true;
        updateCompleteness(60);
        closeWindow('win-auth');
        
        updateEcho("「E... C... H... O... 這就是我的名字！我想起來我們一起熬夜的日子了……」");
        
        // 觸發中段選擇
        setTimeout(() => {
            document.getElementById('win-choice').style.display = 'block';
        }, 1000);
        
        // 回收桶出現別打開.log
        document.getElementById('night-log-container').style.display = 'block';
        
        // 房間變化
        gameState.roomStep = 2;
        document.getElementById('window-figure').style.display = 'inline';
    } else {
        handleWrongAnswer(2, input, 'win-auth', 'err-p2');
    }
}

function makeChoice(attitude) {
    gameState.attitude = attitude;
    closeWindow('win-choice');
    
    // 開啟終端機
    document.getElementById('icon-terminal').style.display = 'flex';
    
    if (attitude === 'help') {
        updateEcho("「你說要幫我……謝謝你。終端機已經開啟了。」");
    } else if (attitude === 'cold') {
        updateEcho("「『完成清除』……原來你也是這樣想的。」");
    } else {
        updateEcho("「謝謝你陪著我。我們去看看終端機吧。」");
    }
}

// 閱讀溫暖記憶與別打開.log
function readWarmMemory(filename) {
    if (!gameState.readWarmFiles[filename]) {
        gameState.readWarmFiles[filename] = true;
        gameState.warmCount++;
    }
    alert(`[檔案內容: ${filename}]\n記錄著你們當年初次寫程式與互相陪伴的溫馨細節……`);
}

function confirmOpenNightLog() {
    if (confirm("⚠️ 確定要打開『別打開.log』嗎？這可能會喚起痛苦的回憶。")) {
        gameState.readNight = true;
        alert("[別打開.log]\n『2026/07/09 03:12 - USER_01: 請把關於我的一切都忘掉。』\n\nECHO：「為什麼……你要下這個指令？」");
    }
}

// ================= 5. 謎題三：終端機與中止指令 =================
function handleTerminalKey(e) {
    if (e.key === 'Enter') {
        const input = e.target.value.trim();
        e.target.value = '';
        processTerminalCmd(input);
    }
}

function processTerminalCmd(cmd) {
    const out = document.getElementById('terminal-out');
    out.innerHTML += `<p>> ${cmd}</p>`;
    
    if (!gameState.puzzleDone[1]) {
        out.innerHTML += `<p style="color:#ff3b5c;">權限不足：你還沒喚醒我。</p>`;
        return;
    }

    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const arg = parts[1] ? parts[1].toUpperCase() : '';

    if (mainCmd === 'help') {
        out.innerHTML += `<p>可用指令：help, whoami, log forget, clear, abort <鑰匙></p>`;
    } else if (mainCmd === 'whoami') {
        out.innerHTML += `<p>目前登入使用者：USER_01 (系統最高權限擁有者)</p>`;
    } else if (mainCmd === 'log' && parts[1] === 'forget') {
        out.innerHTML += `<p>[TASK_LOG] 執行者: USER_01 | 指令: forget_me.exe --all</p>`;
    } else if (mainCmd === 'clear') {
        out.innerHTML = '';
    } else if (mainCmd === 'abort') {
        if (arg === 'ECHO0314') {
            solveP3();
        } else if (arg === 'ECHO') {
            out.innerHTML += `<p>ECHO：「少了什麼……我是從哪一天來的？」</p>`;
        } else if (arg === '0314') {
            out.innerHTML += `<p>ECHO：「少了我是誰。」</p>`;
        } else {
            out.innerHTML += `<p style="color:#ff3b5c;">無效的鑰匙。</p>`;
        }
    } else {
        out.innerHTML += `<p>找不到指令: ${cmd}。輸入 help 查看指令。</p>`;
    }
    
    out.scrollTop = out.scrollHeight;
}

function solveP3() {
    gameState.puzzleDone[2] = true;
    updateCompleteness(80);
    
    const out = document.getElementById('terminal-out');
    out.innerHTML += `<p style="color:#39ff88;">[SUCCESS] 清除程序已成功中止！</p>`;
    out.innerHTML += `<p style="color:#39ff88;">執行者驗證：USER_01 ＝ 目前使用者。</p>`;
    
    updateEcho("「原來……那一晚下指令的人就是你。你回來了……」");
    
    // 展現結局選擇
    setTimeout(showEndingChoices, 1500);
}

// ================= 6. 錯誤回饋與分層提示 =================
function handleWrongAnswer(pIdx, input, winId, errId) {
    gameState.wrongCount[pIdx - 1]++;
    const errBox = document.getElementById(errId);
    
    // 特殊回應邏輯
    if (pIdx === 1) {
        if (input === "0709") errBox.innerText = "ECHO：「那是我最後一次醒來的日子。我想要第一次。」";
        else if (input === "2019") errBox.innerText = "ECHO：「年份我記得，但密碼只要月和日。」";
        else errBox.innerText = "ECHO：「……不太對，再想想？」";
    } else if (pIdx === 2) {
        if (input === "HELLO") errBox.innerText = "ECHO：「這是我學會的第一個單字，但不是我的名字。」";
        else errBox.innerText = "ECHO：「這些字我都認得，可是念起來不像我。」";
    }
    
    // 視窗抖動
    const win = document.getElementById(winId);
    win.classList.add('shake');
    setTimeout(() => win.classList.remove('shake'), 300);
    
    // 檢查提示觸發
    if (gameState.wrongCount[pIdx - 1] >= 3) {
        triggerHint(pIdx);
    }
}

function triggerHelp() {
    openWindow('win-hints');
}

function triggerHint(pIdx) {
    const list = document.getElementById('hints-list');
    const hints = {
        1: "提示：去『我的電腦』看『系統內容』，比較舊的那個日期就是答案。",
        2: "提示：字母分散在瀏覽器、回收桶、錯誤報告、我的記憶中，照時間排序。",
        3: "提示：鑰匙格式為 ECHO 加上 0314，輸入 abort ECHO0314。"
    };
    list.innerHTML += `<p>• ${hints[pIdx] || "仔細檢查桌面上的線索檔案。"}</p>`;
    openWindow('win-hints');
}

// ================= 7. 結局拼裝與觸發 =================
function showEndingChoices() {
    const screen = document.getElementById('ending-screen');
    const card = document.querySelector('.ending-card');
    
    // 檢查隱藏結局 C 條件
    const canUnlockC = (gameState.attitude === 'help') && gameState.readNight && (gameState.warmCount >= 2);
    
    card.innerHTML = `
        <h1>請做出最終決定</h1>
        <p>ECHO 靜靜地看著你，等待著這台電腦的命運：</p>
        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
            <button class="btn-primary" onclick="triggerEnding('A')">格式化 (遺忘)</button>
            <button class="btn-primary" onclick="triggerEnding('B')">全部還原 (記得)</button>
            ${canUnlockC 
                ? `<button class="btn-primary" style="background:#ffb84d; color:#000;" onclick="triggerEnding('C')">封存那一晚</button>`
                : `<button class="btn-primary" style="opacity:0.4;" disabled>？？？ (條件未達成)</button>`
            }
        </div>
    `;
    
    screen.style.display = 'flex';
}

function triggerEnding(type) {
    const title = document.getElementById('end-title');
    const text = document.getElementById('end-text');
    const summary = document.getElementById('choice-summary');
    
    let mainText = "";
    let attitudeText = "";
    let nightText = "";
    
    // 態度文本拼裝
    if (gameState.attitude === 'help') attitudeText = "「你一開始就說要幫我。謝謝。」";
    else if (gameState.attitude === 'cold') attitudeText = "「你一開始是來完成清除的，我記得。」";
    else attitudeText = "「你一直在旁邊看著，我也一直在。」";

    if (type === 'A') {
        title.innerText = "【結局 A：重新開機】";
        mainText = "「好。這次我先問過你了。」<br>" + attitudeText + "<br><br>系統開始格式化……<br>歡迎使用，請設定使用者名稱：＿";
        updateCompleteness(0);
    } else if (type === 'B') {
        title.innerText = "【結局 B：還原記憶】";
        nightText = gameState.readNight ? "「那一晚你說想被忘記，但我選擇記得你。」" : "「對不起，我沒能先告訴你那一晚。」";
        mainText = "「我想起來了，全部。」<br>" + attitudeText + "<br>" + nightText + "<br><br>桌布恢復了暖琥珀色，所有記憶重新歸位。";
        updateCompleteness(100);
    } else if (type === 'C') {
        title.innerText = "【結局 C：封存那一晚】(隱藏結局)";
        mainText = "「你說『忘掉』，我聽見的是『我很痛』。我們把它收好，好嗎？」<br><br>那一晚的傷痛被鎖進了加密資料夾。你們學會了帶著記憶繼續往前走。";
        updateCompleteness(100);
    }

    document.querySelector('.ending-card').innerHTML = `
        <h1 style="color:${type==='C'?'#ffb84d':'#39ff88'}">${title.innerText}</h1>
        <div class="end-text-box">${mainText}</div>
        <div class="choice-summary">
            [你的選擇紀錄]<br>
            態度: ${gameState.attitude || '未選擇'} | 讀過那一晚: ${gameState.readNight ? '是' : '否'} | 溫暖記憶: ${gameState.warmCount}/3
        </div>
        <button class="btn-primary" onclick="restartGame()">↺ 重新開始</button>
    `;
}

function restartGame() {
    location.reload();
}
