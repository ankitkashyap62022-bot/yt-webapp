// ==========================================
// 🫀 YUKI MATRIX - ADVANCED AUDIO ENGINE
// ==========================================

const audioEngine = document.getElementById('audio-engine');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const miniProgress = document.getElementById('mini-progress'); 

// State tracking
let isPlaying = false;

// 🕒 Time Format Helper (Seconds to M:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ⏳ Naya Gana Load Hone Par
audioEngine.addEventListener('loadedmetadata', () => {
    seekBar.max = Math.floor(audioEngine.duration);
    totalTimeEl.innerText = formatTime(audioEngine.duration);
});

// 🏃‍♂️ Gana Chalte Waqt UI Update
audioEngine.addEventListener('timeupdate', () => {
    const currentSec = Math.floor(audioEngine.currentTime);
    
    // Seekbar aur Time update
    seekBar.value = currentSec;
    currentTimeEl.innerText = formatTime(currentSec);

    // Mini Player ki progress line
    if(audioEngine.duration && miniProgress) {
        const progressPercent = (audioEngine.currentTime / audioEngine.duration) * 100;
        miniProgress.style.width = `${progressPercent}%`;
    }
});

// 🎯 User jab slider kheeche (Seeking)
seekBar.addEventListener('input', () => {
    audioEngine.currentTime = seekBar.value;
    
    // Haptic Feedback 
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
});

// ==========================================
// 🎮 MEDIA CONTROLS (REAL TRIGGERS)
// ==========================================

// ⏯️ Toggle Play / Pause
function togglePlay() {
    // Agar source nahi hai (koi gana select nahi hua), to kuch mat kar
    if (!audioEngine.src) return; 

    const playIcon = document.getElementById('play-icon');
    const miniPlayBtn = document.getElementById('mini-play-btn');

    if (audioEngine.paused) {
        audioEngine.play();
        isPlaying = true;
        // Icons ko Pause me badlo
        if(playIcon) playIcon.className = 'fa-solid fa-pause text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400';
        if(miniPlayBtn) miniPlayBtn.className = 'fa-solid fa-pause text-white text-lg';
    } else {
        audioEngine.pause();
        isPlaying = false;
        // Icons ko Play me badlo
        if(playIcon) playIcon.className = 'fa-solid fa-play text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 ml-1';
        if(miniPlayBtn) miniPlayBtn.className = 'fa-solid fa-play text-white text-lg';
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

// ⏭️ Next Song (Connects to player.js)
function playNext() {
    if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    
    // Ye function player.js se aayega
    if (typeof playNextSong === "function") {
        playNextSong(); 
    } else {
        console.warn("player.js me playNextSong() function nahi mila!");
    }
}

// ⏮️ Previous Song (Connects to player.js)
function playPrev() {
    if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    
    // Ye function player.js se aayega
    if (typeof playPrevSong === "function") {
        playPrevSong();
    } else {
        console.warn("player.js me playPrevSong() function nahi mila!");
    }
}

// 🔄 Auto-Play Next Song on End
audioEngine.addEventListener('ended', () => {
    isPlaying = false;
    
    // Play next automatically
    playNext();
});
