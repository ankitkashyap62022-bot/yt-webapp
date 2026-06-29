// ==========================================
// 🫀 YUKI MATRIX - ULTRA AUDIO CORE ENGINE 5.0 (PRO SYNC)
// (Standalone File - 100% Safe, No Clash with player.js)
// ==========================================

// NOTE: audioEngine pehle hi player.js me declared hai.
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const miniProgress = document.getElementById('mini-progress'); 

// 🧠 Core State & Engine Metrics
let isDraggingSeekbar = false; 
let fadeInterval = null;
const FADE_DURATION = 400; // ms for smooth audio fade-in/out

// ==========================================
// 🕒 1. ADVANCED TIME FORMATTER (Handles Hours & Glitches)
// ==========================================
function formatTimePro(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return hrs > 0 ? `${hrs}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}` : `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ==========================================
// 🎚️ 2. SMART FADE ENGINE (Smooth Play/Pause transitions)
// ==========================================
function smoothFadeAudio(targetVolume, callback = null) {
    if (!audioEngine) return;
    clearInterval(fadeInterval);
    
    let currentVol = audioEngine.volume;
    const step = targetVolume > currentVol ? 0.05 : -0.05;
    
    fadeInterval = setInterval(() => {
        currentVol += step;
        if ((step > 0 && currentVol >= targetVolume) || (step < 0 && currentVol <= targetVolume)) {
            audioEngine.volume = targetVolume;
            clearInterval(fadeInterval);
            if (callback) callback();
        } else {
            audioEngine.volume = currentVol;
        }
    }, FADE_DURATION / 20);
}

// Intercept play/pause for smooth fades
const originalPlay = audioEngine.play.bind(audioEngine);
audioEngine.play = async function() {
    audioEngine.volume = 0; // Start silent
    try {
        await originalPlay();
        smoothFadeAudio(1.0); // Fade in to 100%
    } catch (e) {
        console.error("AutoPlay Blocked:", e);
    }
};

const originalPause = audioEngine.pause.bind(audioEngine);
audioEngine.pause = function() {
    smoothFadeAudio(0, () => {
        originalPause(); // Pause completely after fade out
    });
};

// ==========================================
// ⏳ 3. ENGINE SYNC: METADATA & LOCK-SCREEN
// ==========================================
audioEngine.addEventListener('loadedmetadata', () => {
    const totalSec = Math.floor(audioEngine.duration);
    seekBar.max = totalSec;
    totalTimeEl.innerText = formatTimePro(totalSec);

    seekBar.value = 0;
    currentTimeEl.innerText = "0:00";
    updateSeekbarVisuals(0, 0);
});

// Update Hardware Lock-Screen Seekbar
function syncHardwareMediaPosition() {
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
        if (!isNaN(audioEngine.duration) && audioEngine.duration > 0) {
            navigator.mediaSession.setPositionState({
                duration: audioEngine.duration,
                playbackRate: audioEngine.playbackRate,
                position: audioEngine.currentTime
            });
        }
    }
}

// ==========================================
// 🏃‍♂️ 4. REAL-TIME PROGRESS & BUFFERING
// ==========================================
audioEngine.addEventListener('timeupdate', () => {
    if (isDraggingSeekbar) return; 

    const currentSec = audioEngine.currentTime;
    const totalSec = audioEngine.duration || 1;

    seekBar.value = currentSec;
    currentTimeEl.innerText = formatTimePro(currentSec);

    // Calc Progress
    const progressPercent = (currentSec / totalSec) * 100;

    // Calc Buffering Health
    let bufferPercent = 0;
    if (audioEngine.buffered.length > 0) {
        const bufferedEnd = audioEngine.buffered.end(audioEngine.buffered.length - 1);
        bufferPercent = (bufferedEnd / totalSec) * 100;
    }

    if(miniProgress) miniProgress.style.width = `${progressPercent}%`;
    updateSeekbarVisuals(progressPercent, bufferPercent);

    // Sync lock-screen every 5 seconds to save CPU
    if (Math.floor(currentSec) % 5 === 0) syncHardwareMediaPosition();
});

function updateSeekbarVisuals(playedPct, bufferedPct) {
    seekBar.style.background = `linear-gradient(to right, 
        #22d3ee ${playedPct}%, 
        #8b5cf6 ${playedPct}%, 
        #4b5563 ${bufferedPct}%, 
        #111827 ${bufferedPct}%
    )`;
}

// ==========================================
// 🎯 5. SMOOTH SCRUBBING (ANTI-GLITCH)
// ==========================================
const startScrubbing = () => { 
    isDraggingSeekbar = true; 
    smoothFadeAudio(0.3); // Duck volume while scrubbing
};

const whileScrubbing = () => {
    currentTimeEl.innerText = formatTimePro(seekBar.value);
    const totalSec = audioEngine.duration || 1;
    const progressPercent = (seekBar.value / totalSec) * 100;
    
    // Show a visual "ghost" buffer while dragging
    updateSeekbarVisuals(progressPercent, progressPercent + 2); 

    if (window.Telegram?.WebApp?.HapticFeedback && seekBar.value % 10 === 0) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
};

const endScrubbing = () => {
    isDraggingSeekbar = false;
    audioEngine.currentTime = seekBar.value;
    syncHardwareMediaPosition(); // Sync hardware immediately

    // 🔥 YT Video Sync
    if (typeof isYtReady !== 'undefined' && isYtReady && ytPlayer && ytPlayer.seekTo) {
        ytPlayer.seekTo(seekBar.value, true); // true = allow seek ahead
    }

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
audioEngine.addEventListener('waiting', () => {
    console.warn("⏳ Engine: Buffering data...");
    // Player.js handles the loading icon, here we can handle internal states
});

audioEngine.addEventListener('canplaythrough', () => {
    console.log("✅ Engine: Buffer healthy, ready for seamless play.");
});

audioEngine.addEventListener('stalled', () => {
    console.error("⚠️ Engine: Network Stalled. Forcing re-buffer...");
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
    }
    // Attempt auto-recovery
    audioEngine.load(); 
    if (isPlaying) audioEngine.play();
});

audioEngine.addEventListener('error', (e) => {
    const errObj = audioEngine.error;
    let errMsg = "Unknown Audio Error";
    if (errObj) {
        switch (errObj.code) {
            case 1: errMsg = "Fetch Aborted"; break;
            case 2: errMsg = "Network Error"; break;
            case 3: errMsg = "Decode Error (Corrupt File)"; break;
            case 4: errMsg = "Source Not Supported / 403 Forbidden"; break;
        }
    }
    console.error(`💀 Audio Engine FATAL Error: ${errMsg}`, e);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }
});

// ==========================================
// 🚀 7. PLAYBACK RATE (Speed Control Engine)
// ==========================================
// Future-proof function: call this from player.js to change speed (e.g., setPlaybackSpeed(1.5))
window.setPlaybackSpeed = function(speed) {
    if (audioEngine) {
        audioEngine.playbackRate = speed;
        if (typeof isYtReady !== 'undefined' && isYtReady && ytPlayer && ytPlayer.setPlaybackRate) {
            ytPlayer.setPlaybackRate(speed);
        }
        syncHardwareMediaPosition();
        console.log(`⏩ Playback speed set to ${speed}x`);
    }
};
