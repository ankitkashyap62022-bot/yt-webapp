// ==========================================
// 🚀 YUKI MATRIX - PRO PLAYER ENGINE 4.1 (CRASH-PROOF & SAFE MODE)
// ==========================================

// 🛡️ 1. SAFE TELEGRAM INITIALIZATION (Browser Crash Fix)
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
try {
    if (tg && tg.expand) tg.expand();
    if (tg && tg.ready) tg.ready();
} catch(e) {
    console.warn("Telegram WebApp not found, running in browser mode.");
}

function triggerHaptic(style = 'light') {
    try {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
    } catch(e) {}
}

// 🎛️ UI Elements Fetch (Safe Mode)
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
let isRepeat = false; 

// ==========================================
// 🎞️ YOUTUBE IFRAME API (VIDEO ENGINE FIX)
// ==========================================
let ytPlayer = null;
let isYtReady = false;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-video-player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'controls': 1, 
            'disablekb': 0, 
            'fs': 1, 
            'rel': 0, 
            'modestbranding': 1, 
            'playsinline': 1, 
            'autoplay': 1
        },
        events: {
            'onReady': () => { isYtReady = true; console.log("📺 YouTube Video Engine Ready!"); }
        }
    });
};

// ==========================================
// 🌟 PLAYER ANIMATIONS & TOGGLES
// ==========================================
if(miniPlayer) {
    miniPlayer.addEventListener('click', (e) => {
        if(e.target.closest('#mini-play-btn') || e.target.classList.contains('fa-play') || e.target.classList.contains('fa-pause')) return;
        triggerHaptic('medium');
        if(fullPlayer) fullPlayer.classList.remove('translate-y-full'); 
    });
}

if(closePlayerBtn) {
    closePlayerBtn.addEventListener('click', () => {
        triggerHaptic('light');
        if(fullPlayer) fullPlayer.classList.add('translate-y-full'); 
    });
}

// ==========================================
// 🎶 STRICT RANDOM QUEUE SYSTEM 
// ==========================================
function setQueueAndPlay(playlistData, index) {
    try {
        currentPlaylist = [playlistData[index]];
        currentIndex = 0;

        renderUpNextQueue(); 
        loadSongIntoPlayer();

        if (typeof fetchRelatedSongs === "function") {
            fetchRelatedSongs(playlistData[index].platform || 'jiosaavn');
        }
    } catch (error) {
        console.error("Engine Error (setQueue): ", error);
    }
}

function appendToQueue(newSongs) {
    const existingNames = currentPlaylist.map(s => s.name);
    newSongs.forEach(song => {
        if (!existingNames.includes(song.name)) {
            currentPlaylist.push(song);
        }
    });
    renderUpNextQueue(); 
}

// 📜 UP-NEXT UI RENDERER
function renderUpNextQueue() {
    const queueList = document.getElementById('player-queue-list');
    if (!queueList) return;
    queueList.innerHTML = '';

    const upNextSongs = currentPlaylist.slice(currentIndex + 1, currentIndex + 16);

    if (upNextSongs.length === 0) {
        queueList.innerHTML = `
            <li class="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5 shadow-inner">
                <i class="fa-solid fa-satellite-dish fa-beat text-2xl text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"></i>
                <span class="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Fetching Random Mix...</span>
            </li>`;
        return;
    }

    upNextSongs.forEach((song, i) => {
        const actualIndex = currentIndex + 1 + i;
        const iconColor = song.platform === 'youtube' ? 'text-red-500' : 'text-cyan-400';

        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-2.5 hover:bg-white/10 rounded-xl transition cursor-pointer border border-transparent hover:border-white/20 group backdrop-blur-sm";
        li.innerHTML = `
            <div class="flex items-center space-x-3.5 w-[85%]">
                <div class="relative overflow-hidden rounded-md shadow-md border border-gray-700/50">
                    <img src="${song.image}" class="w-11 h-11 object-cover group-hover:scale-110 group-hover:opacity-60 transition-all duration-300">
                    <i class="fa-solid fa-play absolute inset-0 m-auto w-fit h-fit text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_rgba(0,0,0,1)]"></i>
                </div>
                <div class="truncate">
                    <h4 class="text-white text-xs font-bold truncate tracking-wide">${song.name}</h4>
                    <p class="text-[9px] text-gray-400 mt-1.5 truncate flex items-center font-semibold"><i class="fa-solid fa-circle text-[5px] mr-1.5 ${iconColor}"></i> ${song.artist}</p>
                </div>
            </div>
            <i class="fa-solid fa-ellipsis-vertical text-gray-600 px-2 group-hover:text-white transition-colors"></i>
        `;
        li.addEventListener('click', () => {
            triggerHaptic('medium');
            currentIndex = actualIndex;
            loadSongIntoPlayer();
        });
        queueList.appendChild(li);
    });
}

// ==========================================
// 🚀 CORE PLAYBACK ENGINE
// ==========================================
function loadSongIntoPlayer() {
    try {
        if(currentPlaylist.length === 0) return;
        let song = currentPlaylist[currentIndex];

        // 1. Text & Image Updates (Safe Checks)
        if(fsTitle) fsTitle.innerText = song.name || "Unknown Track";
        if(fsArtist) fsArtist.innerText = song.artist || "Unknown Artist";
        if(miniTitle) miniTitle.innerText = song.name || "Unknown Track";
        if(miniArtist) miniArtist.innerText = song.artist || "Unknown Artist";
        if(miniImg) miniImg.src = song.image || "https://telegra.ph/file/default.jpg";
        if(bgBlur) bgBlur.src = song.image || "https://telegra.ph/file/default.jpg";

        const mediaContainer = document.getElementById('media-container');
        const miniProgress = document.getElementById('mini-progress');
        const ytVideoPlayer = document.getElementById('yt-video-player');

        // 2. 📺 VIDEO vs AUDIO UI LOGIC
        if (song.platform === 'youtube' && song.videoId) {
            if(sourceLabel) {
                sourceLabel.innerText = "YOUTUBE MUSIC";
                sourceLabel.className = "text-[11px] text-red-500 font-bold tracking-widest mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
            }
            if(miniProgress) miniProgress.className = "h-full bg-gradient-to-r from-red-600 to-orange-500 w-0 relative transition-all duration-300";

            if(fsImage) fsImage.style.opacity = 0; 
            if(ytVideoPlayer) ytVideoPlayer.classList.remove('opacity-0', 'hidden');
            if(mediaContainer) {
                mediaContainer.classList.add('aspect-video');
                mediaContainer.classList.remove('sm:aspect-square');
            }

            if (isYtReady && ytPlayer && ytPlayer.loadVideoById) {
                ytPlayer.loadVideoById(song.videoId);
                ytPlayer.mute(); 
            }
        } else {
            if(sourceLabel) {
                sourceLabel.innerText = "JIOSAAVN HD";
                sourceLabel.className = "text-[11px] text-cyan-400 font-bold tracking-widest mt-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
            }
            if(miniProgress) miniProgress.className = "h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 w-0 relative transition-all duration-300";

            if(ytVideoPlayer) ytVideoPlayer.classList.add('opacity-0', 'pointer-events-none');
            if(mediaContainer) {
                mediaContainer.classList.remove('aspect-video');
                mediaContainer.classList.add('sm:aspect-square');
            }

            if(fsImage) {
                fsImage.src = song.image || "https://telegra.ph/file/default.jpg";
                fsImage.style.opacity = 1; 
            }

            if (isYtReady && ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
        }

        // 3. Audio Engine Load
        if(audioEngine) {
            audioEngine.src = song.url; 
            audioEngine.load(); 
            playAudio();
        }

        triggerHaptic('heavy');
        updateMediaSession(song);
        renderUpNextQueue(); 

        if (typeof fetchRelatedSongs === "function" && currentIndex >= currentPlaylist.length - 3) {
            fetchRelatedSongs(song.platform || 'jiosaavn');
        }
    } catch (error) {
        console.error("Player Load Error: ", error);
    }
}

// ==========================================
// 🛡️ ADVANCED AUDIO CONTROLS
// ==========================================
function playAudio() {
    if(!audioEngine || !audioEngine.src) return;

    audioEngine.play().then(() => {
        isPlaying = true;
        if(playIcon) playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1';
        if(miniPlayBtnNode) miniPlayBtnNode.className = 'fa-solid fa-pause text-white text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';

        let song = currentPlaylist[currentIndex];
        if(song && song.platform === 'youtube' && isYtReady && ytPlayer && ytPlayer.playVideo) {
            ytPlayer.playVideo();
        }
    }).catch(e => {
        console.log("Autoplay blocked by Browser:", e);
        isPlaying = false;
        pauseUI();
    });
}

function pauseAudio() {
    if(audioEngine) audioEngine.pause();
    isPlaying = false;
    pauseUI();
    if(isYtReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); 
}

function pauseUI() {
    if(playIcon) playIcon.className = 'fa-solid fa-play text-3xl text-black ml-1';
    if(miniPlayBtnNode) miniPlayBtnNode.className = 'fa-solid fa-play text-white text-xl';
}

function togglePlay() {
    triggerHaptic('light');
    if (audioEngine && audioEngine.paused) playAudio();
    else pauseAudio();
}

const mainPlayBtn = document.getElementById('play-pause-btn');
if(mainPlayBtn) mainPlayBtn.addEventListener('click', togglePlay);
if(miniPlayBtnNode) miniPlayBtnNode.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

// ==========================================
// ⏭️ TRACK NAVIGATION
// ==========================================
function playNext() {
    triggerHaptic('light');
    if (currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0; 
    }
    loadSongIntoPlayer();
}

function playPrev() {
    triggerHaptic('light');
    if (audioEngine && audioEngine.currentTime > 3) {
        audioEngine.currentTime = 0; 
        if(isYtReady && ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(0); 
    } else {
        if (currentIndex > 0) currentIndex--;
        else currentIndex = currentPlaylist.length - 1; 
        loadSongIntoPlayer();
    }
}

if(audioEngine) {
    audioEngine.addEventListener('ended', () => {
        if (isRepeat) {
            audioEngine.currentTime = 0;
            if(isYtReady && ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(0);
            playAudio();
        } else {
            playNext();
        }
    });

    audioEngine.addEventListener('error', () => {
        console.warn("⚠️ Stream Failed! Skipping to next track...");
        setTimeout(playNext, 1000); 
    });

    audioEngine.addEventListener('waiting', () => {
        if(playIcon) playIcon.className = 'fa-solid fa-circle-notch fa-spin text-3xl text-black';
    });
    audioEngine.addEventListener('playing', () => {
        if(playIcon) playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1';
    });
}

// ==========================================
// 📱 LOCK SCREEN PLAYER (MEDIA SESSION)
// ==========================================
function updateMediaSession(song) {
    if ('mediaSession' in navigator && song) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name || 'Unknown Track',
            artist: song.artist || 'Unknown Artist',
            album: song.platform === 'youtube' ? 'YouTube Mix' : 'JioSaavn Mix',
            artwork: [
                { src: song.image || '', sizes: '96x96', type: 'image/jpeg' },
                { src: song.image || '', sizes: '512x512', type: 'image/jpeg' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', playAudio);
        navigator.mediaSession.setActionHandler('pause', pauseAudio);
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
}
