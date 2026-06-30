// ==========================================
// 🫀 YUKI MATRIX - DUAL CORE AUDIO ENGINE 6.0 (PRO SYNC)
// (Fully Integrated with JioSaavn Audio & YUKI Tube Video)
// ==========================================

const audioEngine = document.getElementById('audio-engine');
const ytVideoEngine = document.getElementById('yt-video-engine'); // Added YT Engine
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const miniProgress = document.getElementById('mini-progress'); 

// 🧠 Core State & Engine Metrics
let isDraggingSeekbar = false; 
let fadeInterval = null;
const FADE_DURATION = 400; 
let isFading = false; // Glitch protection

// ==========================================
// 🕒 1. ADVANCED TIME FORMATTER
// ==========================================
function formatTimePro(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return hrs > 0 ? `${hrs}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}` : `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Helper: Find which engine is active
function getActiveEngine() {
    // Agar YT Video ka source set hai aur wo pause nahi hai (ya YT mode active hai)
    if (ytVideoEngine && ytVideoEngine.src && ytVideoEngine.src !== window.location.href) {
        // Simple check: Is YT UI visible?
        const ytUI = document.getElementById('yt-player-ui');
        if (ytUI && !ytUI.classList.contains('translate-y-full')) return ytVideoEngine;
    }
    return audioEngine;
}

// ==========================================
// 🎚️ 2. SMART FADE ENGINE (Smooth Play/Pause)
// ==========================================
function smoothFadeAudio(targetVolume, callback = null) {
    const engine = getActiveEngine();
    if (!engine) return;

    clearInterval(fadeInterval);
    isFading = true;

    let currentVol = engine.volume;
    const step = targetVolume > currentVol ? 0.1 : -0.1; // Faster fade to avoid spam lag

    fadeInterval = setInterval(() => {
        currentVol += step;
        if ((step > 0 && currentVol >= targetVolume) || (step < 0 && currentVol <= targetVolume)) {
            engine.volume = targetVolume;
            clearInterval(fadeInterval);
            isFading = false;
            if (callback) callback();
        } else {
            // Keep volume between 0 and 1 safely
            engine.volume = Math.max(0, Math.min(1, currentVol));
        }
    }, FADE_DURATION / 10);
}

// ==========================================
// 🎧 3. HARDWARE & EARBUDS CONTROL (MEDIA SESSION)
// ==========================================
function setupHardwareControls() {
    if ('mediaSession' in navigator) {
        // Sync Lock-screen Buttons to our player.js functions
        navigator.mediaSession.setActionHandler('play', () => { if(typeof togglePlay === "function") togglePlay(); });
        navigator.mediaSession.setActionHandler('pause', () => { if(typeof togglePlay === "function") togglePlay(); });
        navigator.mediaSession.setActionHandler('previoustrack', () => { if(typeof playPrev === "function") playPrev(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { if(typeof playNext === "function") playNext(); });
    }
}
setupHardwareControls();

function syncHardwareMediaPosition(engine) {
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
        if (!isNaN(engine.duration) && engine.duration > 0) {
            navigator.mediaSession.setPositionState({
                duration: engine.duration,
                playbackRate: engine.playbackRate,
                position: engine.currentTime
            });
        }
    }
}

// ==========================================
// 🏃‍♂️ 4. REAL-TIME PROGRESS & SYNCING
// ==========================================
function handleTimeUpdate(e) {
    if (isDraggingSeekbar) return; 
    
    const engine = e.target;
    // Sirf active engine ka UI update karo
    if (engine !== getActiveEngine()) return;

    const currentSec = engine.currentTime;
    const totalSec = engine.duration || 1;

    seekBar.max = Math.floor(totalSec);
    seekBar.value = currentSec;
    currentTimeEl.innerText = formatTimePro(currentSec);
    totalTimeEl.innerText = formatTimePro(totalSec);

    const progressPercent = (currentSec / totalSec) * 100;

    let bufferPercent = 0;
    if (engine.buffered.length > 0) {
        const bufferedEnd = engine.buffered.end(engine.buffered.length - 1);
        bufferPercent = (bufferedEnd / totalSec) * 100;
    }

    if(miniProgress) miniProgress.style.width = `${progressPercent}%`;
    updateSeekbarVisuals(progressPercent, Math.max(progressPercent, bufferPercent));

    if (Math.floor(currentSec) % 5 === 0) syncHardwareMediaPosition(engine);
}

audioEngine.addEventListener('timeupdate', handleTimeUpdate);
if(ytVideoEngine) ytVideoEngine.addEventListener('timeupdate', handleTimeUpdate);

function updateSeekbarVisuals(playedPct, bufferedPct) {
    seekBar.style.background = `linear-gradient(to right, 
        #22d3ee ${playedPct}%, 
        #8b5cf6 ${playedPct}%, 
        #4b5563 ${bufferedPct}%, 
        #111827 ${bufferedPct}%
    )`;
}

// ==========================================
// 🎯 5. DUAL-ENGINE SCRUBBING (ANTI-GLITCH)
// ==========================================
const startScrubbing = () => { 
    isDraggingSeekbar = true; 
    smoothFadeAudio(0.3); // Duck volume
};

const whileScrubbing = () => {
    currentTimeEl.innerText = formatTimePro(seekBar.value);
    const engine = getActiveEngine();
    const totalSec = engine.duration || 1;
    const progressPercent = (seekBar.value / totalSec) * 100;

    updateSeekbarVisuals(progressPercent, progressPercent + 2); 

    if (window.Telegram?.WebApp?.HapticFeedback && Math.floor(seekBar.value) % 10 === 0) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
};

const endScrubbing = () => {
    isDraggingSeekbar = false;
    const engine = getActiveEngine();
    
    // 🔥 SYNC CURRENT TIME
    engine.currentTime = seekBar.value;
    syncHardwareMediaPosition(engine); 

    smoothFadeAudio(1.0); // Restore volume
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
};

seekBar.addEventListener('mousedown', startScrubbing);
seekBar.addEventListener('touchstart', startScrubbing, {passive: true});
seekBar.addEventListener('input', whileScrubbing);
seekBar.addEventListener('change', endScrubbing);
seekBar.addEventListener('mouseup', endScrubbing);
seekBar.addEventListener('touchend', endScrubbing);

// ==========================================
// 🚨 6. BULLETPROOF NETWORK & ERROR RECOVERY
// ==========================================
function handleEngineErrors(engineName, e) {
    const errObj = e.target.error;
    let errMsg = "Unknown Error";
    if (errObj) {
        switch (errObj.code) {
            case 1: errMsg = "Fetch Aborted"; break;
            case 2: errMsg = "Network Error"; break;
            case 3: errMsg = "Decode Error (Corrupt File)"; break;
            case 4: errMsg = "Source Not Supported / 403 Forbidden"; break;
        }
    }
    console.error(`💀 ${engineName} FATAL Error: ${errMsg}`, e);
}

audioEngine.addEventListener('error', (e) => handleEngineErrors("Audio Engine", e));
if(ytVideoEngine) ytVideoEngine.addEventListener('error', (e) => handleEngineErrors("Video Engine", e));

// 🔄 Auto-Play Next Song on End (For both engines)
function handleEngineEnd() {
    if (typeof playNext === "function") {
        playNext();
    } else if (typeof playNextSong === "function") {
        playNextSong();
    }
}
audioEngine.addEventListener('ended', handleEngineEnd);
if(ytVideoEngine) ytVideoEngine.addEventListener('ended', handleEngineEnd);
