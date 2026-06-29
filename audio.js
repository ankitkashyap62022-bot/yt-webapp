// ==========================================
// 🫀 YUKI MATRIX - ADVANCED AUDIO CORE ENGINE (PRO SYNC)
// ==========================================

const audioEngine = document.getElementById('audio-engine');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const miniProgress = document.getElementById('mini-progress'); 

// 🧠 Core State
let isDraggingSeekbar = false; 

// ==========================================
// 🕒 ADVANCED TIME FORMATTER (Handles Hours)
// ==========================================
function formatTimePro(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return hrs > 0 ? `${hrs}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}` : `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ==========================================
// ⏳ ENGINE SYNC: Naya Gana Load Hone Par
// ==========================================
audioEngine.addEventListener('loadedmetadata', () => {
    seekBar.max = Math.floor(audioEngine.duration);
    totalTimeEl.innerText = formatTimePro(audioEngine.duration);
    
    // Reset UI when new source is loaded
    seekBar.value = 0;
    currentTimeEl.innerText = "0:00";
    updateSeekbarVisuals(0, 0);
});

// ==========================================
// 🏃‍♂️ REAL-TIME PROGRESS & BUFFERING
// ==========================================
audioEngine.addEventListener('timeupdate', () => {
    if (isDraggingSeekbar) return; // Slider pakda hai to update mat karo

    const currentSec = audioEngine.currentTime;
    const totalSec = audioEngine.duration || 1;

    seekBar.value = currentSec;
    currentTimeEl.innerText = formatTimePro(currentSec);

    // Progress %
    const progressPercent = (currentSec / totalSec) * 100;
    
    // Buffer %
    let bufferPercent = 0;
    if (audioEngine.buffered.length > 0) {
        const bufferedEnd = audioEngine.buffered.end(audioEngine.buffered.length - 1);
        bufferPercent = (bufferedEnd / totalSec) * 100;
    }

    // UI Update
    if(miniProgress) miniProgress.style.width = `${progressPercent}%`;
    updateSeekbarVisuals(progressPercent, bufferPercent);
});

// Gradient Seekbar Painter
function updateSeekbarVisuals(playedPct, bufferedPct) {
    seekBar.style.background = `linear-gradient(to right, 
        #22d3ee ${playedPct}%, 
        #4b5563 ${playedPct}%, 
        #4b5563 ${bufferedPct}%, 
        #1f2937 ${bufferedPct}%
    )`;
}

// ==========================================
// 🎯 SMOOTH SCRUBBING (ANTI-GLITCH)
// ==========================================
const startScrubbing = () => { isDraggingSeekbar = true; };

const whileScrubbing = () => {
    currentTimeEl.innerText = formatTimePro(seekBar.value);
    const totalSec = audioEngine.duration || 1;
    const progressPercent = (seekBar.value / totalSec) * 100;
    updateSeekbarVisuals(progressPercent, progressPercent + 5); 
    
    if (window.Telegram?.WebApp?.HapticFeedback && seekBar.value % 5 === 0) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
};

const endScrubbing = () => {
    isDraggingSeekbar = false;
    audioEngine.currentTime = seekBar.value;
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
};

// Touch/Mouse Listeners
seekBar.addEventListener('mousedown', startScrubbing);
seekBar.addEventListener('touchstart', startScrubbing, {passive: true});
seekBar.addEventListener('input', whileScrubbing);
seekBar.addEventListener('change', endScrubbing);
seekBar.addEventListener('mouseup', endScrubbing);
seekBar.addEventListener('touchend', endScrubbing);

// ==========================================
// 🚨 ADVANCED ERROR RECOVERY
// ==========================================
audioEngine.addEventListener('stalled', () => {
    console.warn("⚠️ Engine: Network Stalled. Re-buffering...");
});

audioEngine.addEventListener('error', (e) => {
    console.error("⚠️ Audio Engine Critical Error:", e);
    // Haptic feedback to alert user
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }
});
