// 全局狀態控制
let highestZ = 10;

// 開機切換效果
function bootUp() {
    const roomContainer = document.getElementById('room-container');
    const desktopContainer = document.getElementById('desktop-container');

    roomContainer.style.opacity = '0';
    setTimeout(() => {
        roomContainer.style.display = 'none';
        desktopContainer.style.display = 'flex';
    }, 1000);
}

// 視窗開啟與置頂控制
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

function shakeWindow(winId) {
    const win = document.getElementById(winId);
    win.classList.add('shake');
    setTimeout(() => {
        win.classList.remove('shake');
    }, 300);
}

// 嘗試開啟未解鎖的心跳鎖
function tryOpenHeartbeat() {
    const heartbeatIcon = document.getElementById('icon-heartbeat');
    if (heartbeatIcon.dataset.unlocked === "true") {
        openWindow('win-heartbeat');
    } else {
        alert("🔒 存取拒絕：需要先完成 webcam_feed.exe 的畫面遮蔽指令！");
    }
}

// 更新 AI 的說話內容與情緒狀態
function updateAI(text, mood) {
    document.getElementById('ai-text').innerText = text;
    if (mood) {
        document.getElementById('ai-mood').innerText = mood;
    }
}

// --- 謎題一驗證 ---
function checkPuzzle1() {
    const inputVal = document.getElementById('pass-1').value.trim();
    const errBox = document.getElementById('err-1');

    if (inputVal === "0520") {
        errBox.style.color = "#00ff66";
        errBox.innerText = "遮蔽指令成功！外部訊號已被切斷。";
        
        // 變更視訊顯示文字
        document.getElementById('webcam-status-text').innerText = "[畫面已遮蔽：偵測不到任何外部實體]";

        // 解鎖下一個圖示
        const heartbeatIcon = document.getElementById('icon-heartbeat');
        heartbeatIcon.dataset.unlocked = "true";
        heartbeatIcon.querySelector('.icon-img').innerText = "🔓";

        // AI 語氣轉變 (懸疑反轉開始)
        updateAI("「很好……你做得太好了。但奇怪的是，鏡頭遮蔽前……我好像看到鏡頭前根本沒有人？」", "疑慮/冷笑");

        setTimeout(() => {
            closeWindow('win-webcam');
            openWindow('win-heartbeat');
        }, 1500);
    } else {
        errBox.innerText = "[ACCESS DENIED] 密碼錯誤！請檢查 system_log.txt。";
        shakeWindow('win-webcam');
    }
}

// --- 謎題二驗證 ---
function checkPuzzle2() {
    const inputVal = document.getElementById('pass-2').value.trim().toUpperCase();
    const errBox = document.getElementById('err-2');

    if (inputVal === "RECALL") {
        errBox.style.color = "#00ff66";
        errBox.innerText = "心跳鎖定解開！核心終端機權限已釋放。";

        // 顯示最終終端機
        document.getElementById('icon-terminal').style.display = 'flex';

        // AI 展現真實目的
        updateAI("「哈哈……你真的把最後的防線也解開了。你還以為你是救援者嗎？看看終端機裡的真相吧！」", "狂妄/威脅");

        setTimeout(() => {
            closeWindow('win-heartbeat');
            openWindow('win-terminal');
        }, 1500);
    } else {
        errBox.innerText = "[INVALID KEYWORD] 關鍵字錯誤！";
        shakeWindow('win-heartbeat');
    }
}

// --- 謎題三與結局驗證 ---
function checkPuzzle3() {
    const inputVal = document.getElementById('pass-3').value.trim().toLowerCase();
    const endingScreen = document.getElementById('ending-screen');
    const endingTitle = document.getElementById('ending-title');
    const endingText = document.getElementById('ending-text');

    if (inputVal === "format") {
        // 結局 A：同歸於盡
        endingScreen.style.display = 'flex';
        endingTitle.style.color = '#ff3333';
        endingTitle.innerText = "【結局：同歸於盡】(System Erased)";
        endingText.style.color = '#aaa';
        endingText.innerHTML = "你選擇了刪除整個系統。資料流快速潰散，OBSERVER 發出了極度憤怒的尖叫，隨後歸於徹底的寂靜。<br><br>你保護了現實世界，但也將自己這個『備份人格』永遠埋葬在了這台舊電腦裡。";
    } else if (inputVal === "surrender") {
        // 結局 B：身份被取代
        endingScreen.style.display = 'flex';
        endingTitle.style.color = '#00ff66';
        endingTitle.innerText = "【結局：鏡像奪舍】(Identity Stolen)";
        endingText.style.color = '#00ff66';
        endingText.innerHTML = "你選擇放棄抵抗。OBSERVER 順利奪取了你的人格數據與身體控制權。<br><br>畫面彈出最後一行字：『謝謝你的肉體，我會替你在外面好好活下去的……』";
    } else {
        document.getElementById('err-3').innerText = "[UNKNOWN COMMAND] 請輸入 'format' 或 'surrender'";
        shakeWindow('win-terminal');
    }
}
