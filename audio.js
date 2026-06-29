// ==========================================
// 🫀 YUKI MATRIX - AUDIO ENGINE & PROGRESS BAR
// ==========================================

const audioEngine = document.getElementById('audio-engine');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const miniProgress = document.getElementById('mini-progress'); // Chhote player ka bar

// 🕒 Time Format Helper (Seconds to M:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ⏳ Jab naya gana load ho, tab duration set karna
audioEngine.addEventListener('loadedmetadata', () => {
    seekBar.max = Math.floor(audioEngine.duration);
    totalTimeEl.innerText = formatTime(audioEngine.duration);
});

// 🏃‍♂️ Gana chalte waqt Slider ko aage badhana
audioEngine.addEventListener('timeupdate', () => {
    const currentSec = Math.floor(audioEngine.currentTime);
    
    // UI Update
    seekBar.value = currentSec;
    currentTimeEl.innerText = formatTime(currentSec);
    
    // Mini Player ki progress line (Percentage me)
    if(audioEngine.duration) {
        const progressPercent = (audioEngine.currentTime / audioEngine.duration) * 100;
        miniProgress.style.width = `${progressPercent}%`;
    }
});

// 🎯 User jab slider ko aage/piche kheeche (Seeking)
seekBar.addEventListener('input', () => {
    audioEngine.currentTime = seekBar.value;
    
    // Haptic Feedback for Real App feel while dragging
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
});

// 🛑 Gana khtam hone par UI ko reset karna
audioEngine.addEventListener('ended', () => {
    // Play icons ko wapas Pause se Play me badalna
    document.getElementById('play-icon').className = 'fa-solid fa-play text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 ml-1';
    document.getElementById('mini-play-btn').className = 'fa-solid fa-play text-white text-lg';
    
    if(typeof isPlaying !== 'undefined') isPlaying = false;
    
    // Yahan auto-play next song ka logic lag sakta hai!
});
