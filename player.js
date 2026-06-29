// ==========================================
// 🚀 YUKI MATRIX - PRO PLAYER ENGINE 2.0 (ADVANCED)
// ==========================================

const tg = window.Telegram.WebApp;
tg.expand(); 
tg.ready();

function triggerHaptic(style = 'light') {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
}

// 🎛️ UI Elements Fetch
const miniPlayer = document.getElementById('mini-player');
const fullPlayer = document.getElementById('full-player');
const closePlayerBtn = document.getElementById('close-player-btn');

const fsImage = document.getElementById('fs-img'); 
const fsTitle = document.getElementById('fs-title'); 
const fsArtist = document.getElementById('fs-artist'); 
const miniImg = document.getElementById('mini-img'); 
const miniTitle = document.getElementById('mini-title'); 
const miniArtist = document.getElementById('mini-artist'); 

const bgBlur = document.getElementById('player-bg-blur');
const sourceLabel = document.getElementById('player-source-label');
const audioEngine = document.getElementById('audio-engine');

const playIcon = document.getElementById('play-icon');
const miniPlayBtnNode = document.getElementById('mini-play-btn');

// 🎵 STATE MANAGEMENT
let currentPlaylist = []; 
let currentIndex = 0;     
let isPlaying = false;
let isShuffle = false;
let isRepeat = false; // false = Off, true = Repeat One

// -------------------------------------------
// 🌟 PLAYER ANIMATIONS & TOGGLES
// -------------------------------------------
miniPlayer.addEventListener('click', (e) => {
    if(e.target.closest('#mini-play-btn') || e.target.classList.contains('fa-play') || e.target.classList.contains('fa-pause')) return;
    triggerHaptic('medium');
    fullPlayer.classList.remove('translate-y-full'); 
});

closePlayerBtn.addEventListener('click', () => {
    triggerHaptic('light');
    fullPlayer.classList.add('translate-y-full'); 
});

// -------------------------------------------
// 🎶 QUEUE & PLAYLIST SYSTEM
// -------------------------------------------
function setQueueAndPlay(playlistData, index) {
    currentPlaylist = playlistData;
    currentIndex = index;
    loadSongIntoPlayer();
}

function appendToQueue(newSongs) {
    const existingNames = currentPlaylist.map(s => s.name);
    newSongs.forEach(song => {
        if (!existingNames.includes(song.name)) currentPlaylist.push(song);
    });
    console.log(`🔥 Radio Active: Queue Size -> ${currentPlaylist.length}`);
}

// -------------------------------------------
// 🚀 CORE PLAYBACK ENGINE
// -------------------------------------------
function loadSongIntoPlayer() {
    if(currentPlaylist.length === 0) return;

    let song = currentPlaylist[currentIndex];

    // 1. Update UI Text & Images (With Fade Effect)
    fsImage.style.opacity = 0;
    setTimeout(() => {
        fsImage.src = song.image || "https://telegra.ph/file/default.jpg";
        fsImage.style.opacity = 1;
    }, 200);

    fsTitle.innerText = song.name || "Unknown Track";
    fsArtist.innerText = song.artist || "Unknown Artist";
    miniTitle.innerText = song.name || "Unknown Track";
    miniArtist.innerText = song.artist || "Unknown Artist";
    miniImg.src = song.image || "https://telegra.ph/file/default.jpg";
    bgBlur.src = song.image || "https://telegra.ph/file/default.jpg";
    
    // 2. Dynamic Platform Branding (JioSaavn vs YouTube)
    if(sourceLabel) {
        if(song.platform === 'youtube') {
            sourceLabel.innerText = "YOUTUBE MUSIC";
            sourceLabel.className = "text-[11px] text-red-500 font-bold tracking-widest mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
            document.getElementById('mini-progress').className = "h-full bg-gradient-to-r from-red-600 to-orange-500 w-0 relative transition-all duration-300";
        } else {
            sourceLabel.innerText = "JIOSAAVN HD";
            sourceLabel.className = "text-[11px] text-cyan-400 font-bold tracking-widest mt-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
            document.getElementById('mini-progress').className = "h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 w-0 relative transition-all duration-300";
        }
    }

    // 3. Audio Engine Load
    if(audioEngine) {
        audioEngine.src = song.url; 
        audioEngine.load(); // Force reload for new source
        playAudio();
    }

    triggerHaptic('heavy');
    updateMediaSession(song);

    // 4. Trigger Auto-Radio (Fetch more songs in background)
    if (typeof fetchRelatedSongs === "function" && currentIndex >= currentPlaylist.length - 2) {
        fetchRelatedSongs(song.platform || 'jiosaavn');
    }
}

// -------------------------------------------
// 🛡️ ADVANCED AUDIO CONTROLS & ERROR HANDLING
// -------------------------------------------
function playAudio() {
    if(!audioEngine.src) return;
    
    audioEngine.play().then(() => {
        isPlaying = true;
        playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1';
        miniPlayBtnNode.className = 'fa-solid fa-pause text-white text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';
    }).catch(e => {
        console.log("Autoplay blocked or stream error:", e);
        isPlaying = false;
        playIcon.className = 'fa-solid fa-play text-3xl text-black ml-1';
        miniPlayBtnNode.className = 'fa-solid fa-play text-white text-xl';
    });
}

function pauseAudio() {
    audioEngine.pause();
    isPlaying = false;
    playIcon.className = 'fa-solid fa-play text-3xl text-black ml-1';
    miniPlayBtnNode.className = 'fa-solid fa-play text-white text-xl';
}

function togglePlay() {
    triggerHaptic('light');
    if (audioEngine.paused) playAudio();
    else pauseAudio();
}

// Button Listeners
document.getElementById('play-pause-btn').addEventListener('click', togglePlay);
miniPlayBtnNode.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

// -------------------------------------------
// ⏭️ TRACK NAVIGATION (Next / Prev / Auto-Skip)
// -------------------------------------------
function playNext() {
    triggerHaptic('light');
    
    if (isShuffle) {
        // Random track if shuffle is ON
        currentIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
        if (currentIndex < currentPlaylist.length - 1) currentIndex++;
        else currentIndex = 0; // Loop to start
    }
    loadSongIntoPlayer();
}

function playPrev() {
    triggerHaptic('light');
    if (audioEngine && audioEngine.currentTime > 3) {
        audioEngine.currentTime = 0; // Restart song if played for 3+ secs
    } else {
        if (currentIndex > 0) currentIndex--;
        else currentIndex = currentPlaylist.length - 1; // Go to last song
        loadSongIntoPlayer();
    }
}

// Auto-play next when song ends
audioEngine.addEventListener('ended', () => {
    if (isRepeat) {
        audioEngine.currentTime = 0;
        playAudio();
    } else {
        playNext();
    }
});

// Auto-Skip Broken Links (Agar YouTube ya JioSaavn ka link toot jaye)
audioEngine.addEventListener('error', () => {
    console.warn("⚠️ Audio Stream Failed! Auto-skipping to next track...");
    setTimeout(playNext, 1500); // Wait 1.5s then skip
});

// Buffering State UI (Optional spinner logic)
audioEngine.addEventListener('waiting', () => {
    playIcon.className = 'fa-solid fa-circle-notch fa-spin text-3xl text-black';
});
audioEngine.addEventListener('playing', () => {
    playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1';
});

// -------------------------------------------
// 📱 LOCK SCREEN PLAYER (MEDIA SESSION API)
// -------------------------------------------
function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artist,
            album: song.platform === 'youtube' ? 'YouTube Music' : 'JioSaavn HD',
            artwork: [
                { src: song.image, sizes: '96x96', type: 'image/jpeg' },
                { src: song.image, sizes: '256x256', type: 'image/jpeg' },
                { src: song.image, sizes: '512x512', type: 'image/jpeg' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', playAudio);
        navigator.mediaSession.setActionHandler('pause', pauseAudio);
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
}
