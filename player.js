// ==========================================
// 🚀 YUKI MATRIX - PRO PLAYER ENGINE 4.3 (VIDEO VISIBILITY FIX)
// ==========================================

// 🛡️ 1. SAFE TELEGRAM INITIALIZATION
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
try {
    if (tg && tg.expand) tg.expand();
    if (tg && tg.ready) tg.ready();
} catch(e) {}

function triggerHaptic(style = 'light') {
    try {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
    } catch(e) {}
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

const sysAudio = document.getElementById('audio-engine');

const playIcon = document.getElementById('play-icon');
const miniPlayBtnNode = document.getElementById('mini-play-btn');

// 🎵 STATE MANAGEMENT
let currentPlaylist = []; 
let currentIndex = 0;     
let isPlaying = false;
let isShuffle = false;
let isRepeat = false; 

// ==========================================
// 🎞️ YUKITUBE IFRAME API (VIDEO ENGINE)
// ==========================================
let ytPlayer = null;
let isYtReady = false;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-video-player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'controls': 0, // UI clean rakhne ke liye default YT controls hide
            'disablekb': 1, 
            'fs': 0, 
            'rel': 0, 
            'modestbranding': 1, 
            'playsinline': 1, 
            'autoplay': 1
        },
        events: {
            'onReady': () => { isYtReady = true; console.log("📺 YukiTube Video Engine Ready!"); }
        }
    });
};

// ==========================================
// 🌟 PLAYER ANIMATIONS
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
        if (typeof fetchRelatedSongs === "function") fetchRelatedSongs(playlistData[index].platform || 'jiosaavn');
    } catch (error) { console.error("Engine Error: ", error); }
}

function appendToQueue(newSongs) {
    const existingNames = currentPlaylist.map(s => s.name);
    newSongs.forEach(song => {
        if (!existingNames.includes(song.name)) currentPlaylist.push(song);
    });
    renderUpNextQueue(); 
}

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
                    <p class="text-[9px] text-gray-400 mt-1.5 truncate flex items-center font-semibold"><i class="fa-solid fa-circle text-[5px] mr-1.5 ${iconColor}"></i> ${song.artist === 'YouTube' ? 'YukiTube' : song.artist}</p>
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

        if(fsTitle) fsTitle.innerText = song.name || "Unknown Track";
        if(fsArtist) fsArtist.innerText = song.artist === 'YouTube' ? 'YukiTube' : (song.artist || "Unknown Artist");
        if(miniTitle) miniTitle.innerText = song.name || "Unknown Track";
        if(miniArtist) miniArtist.innerText = song.artist === 'YouTube' ? 'YukiTube' : (song.artist || "Unknown Artist");

        const safeImage = song.image && song.image.length > 5 ? song.image : "https://telegra.ph/file/default.jpg";
        if(miniImg) miniImg.src = safeImage;
        if(bgBlur) bgBlur.src = safeImage;

        const mediaContainer = document.getElementById('media-container');
        const miniProgress = document.getElementById('mini-progress');
        const ytContainer = document.getElementById('yt-container'); // 🔥 Target FIX

        if (song.platform === 'youtube' && song.videoId) {
            // YUKITUBE ON
            if(sourceLabel) {
                sourceLabel.innerText = "YUKITUBE";
                sourceLabel.className = "text-[12px] text-red-500 font-black tracking-widest mt-0.5 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]";
            }
            if(miniProgress) miniProgress.className = "h-full bg-gradient-to-r from-red-600 to-orange-500 w-0 relative transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.8)]";
            if(fsImage) fsImage.style.opacity = 0; 
            
            // 🔥 Yaha Wrapper div (ytContainer) ko visible kiya
            if(ytContainer) {
                ytContainer.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
                ytContainer.classList.add('opacity-100');
            }
            if(mediaContainer) {
                mediaContainer.classList.add('aspect-video');
                mediaContainer.classList.remove('sm:aspect-square');
            }
            if (isYtReady && ytPlayer && ytPlayer.loadVideoById) {
                ytPlayer.loadVideoById(song.videoId);
                ytPlayer.mute(); 
            }
        } else {
            // JIOSAAVN ON
            if(sourceLabel) {
                sourceLabel.innerText = "JIOSAAVN HD";
                sourceLabel.className = "text-[11px] text-cyan-400 font-bold tracking-widest mt-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
            }
            if(miniProgress) miniProgress.className = "h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 w-0 relative transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]";
            
            // 🔥 Yaha Wrapper div (ytContainer) ko hide kiya
            if(ytContainer) {
                ytContainer.classList.remove('opacity-100');
                ytContainer.classList.add('opacity-0', 'pointer-events-none');
            }
            if(mediaContainer) {
                mediaContainer.classList.remove('aspect-video');
                mediaContainer.classList.add('sm:aspect-square');
            }
            if(fsImage) {
                fsImage.src = safeImage;
                fsImage.style.opacity = 1; 
            }
            if (isYtReady && ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
        }

        if(sysAudio) {
            sysAudio.src = song.url; 
            sysAudio.load(); 
            playAudio();
        }

        triggerHaptic('heavy');
        updateMediaSession(song);
        renderUpNextQueue(); 
    } catch (error) { console.error("Player Load Error: ", error); }
}

// ==========================================
// 🛡️ ADVANCED AUDIO CONTROLS
// ==========================================
function playAudio() {
    if(!sysAudio || !sysAudio.src) return;
    sysAudio.play().then(() => {
        isPlaying = true;
        if(playIcon) playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1';
        if(miniPlayBtnNode) miniPlayBtnNode.className = 'fa-solid fa-pause text-white text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';

        let song = currentPlaylist[currentIndex];
        if(song && song.platform === 'youtube' && isYtReady && ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
    }).catch(e => {
        console.log("Autoplay blocked:", e);
        isPlaying = false;
        pauseUI();
    });
}

function pauseAudio() {
    if(sysAudio) sysAudio.pause();
    isPlaying = false;
    pauseUI();
    if(isYtReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); 
}

function pauseUI() {
    if(playIcon) playIcon.className = 'fa-solid fa-play text-3xl text-black ml-1';
    if(miniPlayBtnNode) miniPlayBtnNode.className = 'fa-solid fa-play text-white text-2xl';
}

function togglePlay() {
    triggerHaptic('light');
    if (sysAudio && sysAudio.paused) playAudio();
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
    if (currentIndex < currentPlaylist.length - 1) currentIndex++;
    else currentIndex = 0; 
    loadSongIntoPlayer();
}

function playPrev() {
    triggerHaptic('light');
    if (sysAudio && sysAudio.currentTime > 3) {
        sysAudio.currentTime = 0; 
        if(isYtReady && ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(0); 
    } else {
        if (currentIndex > 0) currentIndex--;
        else currentIndex = currentPlaylist.length - 1; 
        loadSongIntoPlayer();
    }
}

if(sysAudio) {
    sysAudio.addEventListener('ended', () => {
        if (isRepeat) { sysAudio.currentTime = 0; if(isYtReady && ytPlayer) ytPlayer.seekTo(0); playAudio(); } 
        else playNext();
    });
    sysAudio.addEventListener('error', () => setTimeout(playNext, 1000));
    sysAudio.addEventListener('waiting', () => { if(playIcon) playIcon.className = 'fa-solid fa-circle-notch fa-spin text-3xl text-black'; });
    sysAudio.addEventListener('playing', () => { if(playIcon) playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1'; });
}

function updateMediaSession(song) {
    if ('mediaSession' in navigator && song) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name || 'Unknown',
            artist: song.artist === 'YouTube' ? 'YukiTube' : (song.artist || 'Unknown'),
            album: song.platform === 'youtube' ? 'YukiTube' : 'JioSaavn',
            artwork: [
                { src: song.image || 'https://telegra.ph/file/default.jpg', sizes: '512x512', type: 'image/jpeg' }
            ]
        });
        navigator.mediaSession.setActionHandler('play', playAudio);
        navigator.mediaSession.setActionHandler('pause', pauseAudio);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    }
}
