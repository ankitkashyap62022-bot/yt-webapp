// ==========================================
// 🫀 YUKI MATRIX - ADVANCED AUDIO CORE ENGINE
// ==========================================

// 🎛️ Elements Fetch
const audioEngineElement = document.getElementById('audio-engine'); // Renamed inside to avoid global conflicts if any
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
    
    if (hrs > 0) {
        return `${hrs}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ==========================================
// ⏳ TRACK METADATA LOADED (Setup Engine)
// ==========================================
audioEngineElement.addEventListener('loadedmetadata', () => {
    // 1. Set Max Duration for Seekbar
    seekBar.max = audioEngineElement.duration;
    
    // 2. Set UI Text
    totalTimeEl.innerText = formatTimePro(audioEngineElement.duration);
    currentTimeEl.innerText = "0:00";
    
    // 3. Reset UI Progress
    seekBar.value = 0;
    if(miniProgress) miniProgress.style.width = `0%`;
    updateSeekbarVisuals(0, 0);
});

// ==========================================
// 🏃‍♂️ REAL-TIME PROGRESS & BUFFERING SYSTEM
// ==========================================
audioEngineElement.addEventListener('timeupdate', () => {
    // Agar user slider kheech raha hai, to UI update mat karo warna glitch hoga
    if (isDraggingSeekbar) return;

    const currentSec = audioEngineElement.currentTime;
    const totalSec = audioEngineElement.duration || 1;

    // 1. Update Texts & Values
    seekBar.value = currentSec;
    currentTimeEl.innerText = formatTimePro(currentSec);

    // 2. Calculate Progress %
    const progressPercent = (currentSec / totalSec) * 100;
    
    // 3. Calculate Buffering % (Kitna load ho chuka hai)
    let bufferPercent = 0;
    if (audioEngineElement.buffered.length > 0) {
        const bufferedEnd = audioEngineElement.buffered.end(audioEngineElement.buffered.length - 1);
        bufferPercent = (bufferedEnd / totalSec) * 100;
    }

    // 4. Update UI Visuals (Mini Player Line + Full Player Seekbar)
    if (miniProgress) miniProgress.style.width = `${progressPercent}%`;
    updateSeekbarVisuals(progressPercent, bufferPercent);
});

// Seekbar ka background update karne wala engine (Played vs Buffered vs Empty)
function updateSeekbarVisuals(playedPct, bufferedPct) {
    // Premium multi-stop gradient for realistic player feel
    seekBar.style.background = `linear-gradient(to right, 
        #22d3ee ${playedPct}%, /* Cyan Played Part */
        #4b5563 ${playedPct}%, /* Gray Transition */
        #4b5563 ${bufferedPct}%, /* Gray Buffered Part */
        #1f2937 ${bufferedPct}%  /* Dark Empty Part */
    )`;
}

// ==========================================
// 🎯 SMOOTH SCRUBBING (ANTI-GLITCH SEEKING)
// ==========================================

// 1. User ne slider pakda (Drag Start)
const startScrubbing = () => {
    isDraggingSeekbar = true;
};

// 2. User slider kheech raha hai (Real-time UI update but no audio jump)
const whileScrubbing = () => {
    currentTimeEl.innerText = formatTimePro(seekBar.value);
    const totalSec = audioEngineElement.duration || 1;
    const progressPercent = (seekBar.value / totalSec) * 100;
    updateSeekbarVisuals(progressPercent, progressPercent + 5); // Fake buffer logic during drag
    
    // Light Haptic Tick while sliding
    if (window.Telegram?.WebApp?.HapticFeedback && seekBar.value % 5 === 0) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
};

// 3. User ne slider chhod diya (Drag End -> Jump Audio)
const endScrubbing = () => {
    isDraggingSeekbar = false;
    audioEngineElement.currentTime = seekBar.value;
    
    // Heavy Haptic on drop
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
};

// Mouse & Touch Listeners for flawless mobile & desktop experience
seekBar.addEventListener('mousedown', startScrubbing);
seekBar.addEventListener('touchstart', startScrubbing, {passive: true});

seekBar.addEventListener('input', whileScrubbing);

seekBar.addEventListener('change', endScrubbing); // Fires when mouse/touch is released
seekBar.addEventListener('mouseup', endScrubbing);
seekBar.addEventListener('touchend', endScrubbing);

// ==========================================
// 🚨 ERROR HANDLING & NETWORK RECOVERY
// ==========================================
audioEngineElement.addEventListener('stalled', () => {
    console.warn("⚠️ Matrix Engine: Network Stalled. Buffering...");
});

// NOTE: togglePlay, playNext, playPrev have been removed from here 
// because they are now safely built directly into your PRO player.js!
