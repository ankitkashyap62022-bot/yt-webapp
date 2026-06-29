// ==========================================
// 🚀 YUKI MATRIX - PRO PLAYER ENGINE 3.0 (VIDEO & UP-NEXT READY)
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
let isRepeat = false; 

// ==========================================
// 🎞️ YOUTUBE IFRAME API (VIDEO ENGINE)
// ==========================================
let ytPlayer = null;
let isYtReady = false;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-video-player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'controls': 0, 'disablekb': 1, 'fs': 0, 'rel': 0, 'modestbranding': 1, 'playsinline': 1, 'mute': 1, 'autoplay': 1
        },
        events: {
            'onReady': () => { isYtReady = true; console.log("📺 YouTube Video Engine Ready!"); }
        }
    });
};

// ==========================================
// 🌟 PLAYER ANIMATIONS & TOGGLES
// ==========================================
miniPlayer.addEventListener('click', (e) => {
    if(e.target.closest('#mini-play-btn') || e.target.classList.contains('fa-play') || e.target.classList.contains('fa-pause')) return;
    triggerHaptic('medium');
    fullPlayer.classList.remove('translate-y-full'); 
});

closePlayerBtn.addEventListener('click', () => {
    triggerHaptic('light');
    fullPlayer.classList.add('translate-y-full'); 
});

// ==========================================
// 🎶 QUEUE, UP-NEXT & PLAYLIST SYSTEM
// ==========================================
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
    renderUpNextQueue(); // Queue update hote hi UI refresh karo
}

// 📜 UP-NEXT UI RENDERER
function renderUpNextQueue() {
    const queueList = document.getElementById('player-queue-list');
    if (!queueList) return;
    queueList.innerHTML = '';

    // Agle 15 gaane dikhao
    const upNextSongs = currentPlaylist.slice(currentIndex + 1, currentIndex + 16);

    if (upNextSongs.length === 0) {
        queueList.innerHTML = '<li class="text-center text-gray-500 text-[10px] py-4 uppercase tracking-widest font-bold">End of Queue</li>';
        return;
    }

    upNextSongs.forEach((song, i) => {
        const actualIndex = currentIndex + 1 + i;
        const iconColor = song.platform === 'youtube' ? 'text-red-500' : 'text-cyan-400';
        
        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-2 hover:bg-white/10 rounded-xl transition cursor-pointer border border-transparent hover:border-white/20 group";
        li.innerHTML = `
            <div class="flex items-center space-x-3 w-[85%]">
                <div class="relative">
                    <img src="${song.image}" class="w-10 h-10 rounded-md object-cover shadow-md group-hover:opacity-50 transition-opacity">
                    <i class="fa-solid fa-play absolute inset-0 m-auto w-fit h-fit text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"></i>
                </div>
                <div class="truncate">
                    <h4 class="text-white text-xs font-bold truncate tracking-wide">${song.name}</h4>
                    <p class="text-[9px] text-gray-400 mt-0.5 truncate flex items-center"><i class="fa-solid fa-circle text-[4px] mr-1 ${iconColor}"></i> ${song.artist}</p>
                </div>
            </div>
            <i class="fa-solid fa-ellipsis-vertical text-gray-600 px-2"></i>
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
    if(currentPlaylist.length === 0) return;

    let song = currentPlaylist[currentIndex];

    // 1. Text & Image Updates
    fsTitle.innerText = song.name || "Unknown Track";
    fsArtist.innerText = song.artist || "Unknown Artist";
    miniTitle.innerText = song.name || "Unknown Track";
    miniArtist.innerText = song.artist || "Unknown Artist";
    miniImg.src = song.image || "https://telegra.ph/file/default.jpg";
    bgBlur.src = song.image || "https://telegra.ph/file/default.jpg";

    const mediaContainer = document.getElementById('media-container');

    // 2. 📺 VIDEO vs AUDIO UI LOGIC
    if (song.platform === 'youtube' && song.videoId) {
        // Video Mode On
        sourceLabel.innerText = "YOUTUBE MUSIC";
        sourceLabel.className = "text-[11px] text-red-500 font-bold tracking-widest mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
        document.getElementById('mini-progress').className = "h-full bg-gradient-to-r from-red-600 to-orange-500 w-0 relative transition-all duration-300";
        
        fsImage.style.opacity = 0; // Hide Cover
        document.getElementById('yt-video-player').classList.remove('opacity-0', 'hidden');
        mediaContainer.classList.add('aspect-video');
        mediaContainer.classList.remove('sm:aspect-square');
        
        // Load YouTube Video (Silently)
        if (isYtReady && ytPlayer && ytPlayer.loadVideoById) {
            ytPlayer.loadVideoById(song.videoId);
            ytPlayer.mute(); // Backgound Audio handled by railway API
        }
    } else {
        // Audio/JioSaavn Mode On
        sourceLabel.innerText = "JIOSAAVN HD";
        sourceLabel.className = "text-[11px] text-cyan-400 font-bold tracking-widest mt-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
        document.getElementById('mini-progress').className = "h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 w-0 relative transition-all duration-300";
        
        document.getElementById('yt-video-player').classList.add('opacity-0', 'pointer-events-none');
        mediaContainer.classList.remove('aspect-video');
        mediaContainer.classList.add('sm:aspect-square');
        
        fsImage.src = song.image || "https://telegra.ph/file/default.jpg";
        fsImage.style.opacity = 1; // Show Cover
        
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
    renderUpNextQueue(); // Update Up-Next List

    // 4. Auto-Radio Trigger
    if (typeof fetchRelatedSongs === "function" && currentIndex >= currentPlaylist.length - 2) {
        fetchRelatedSongs(song.platform || 'jiosaavn');
    }
}

// ==========================================
// 🛡️ ADVANCED AUDIO CONTROLS
// ==========================================
function playAudio() {
    if(!audioEngine.src) return;

    audioEngine.play().then(() => {
        isPlaying = true;
        playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1';
        miniPlayBtnNode.className = 'fa-solid fa-pause text-white text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';
        
        // Resume Video if Youtube mode
        let song = currentPlaylist[currentIndex];
        if(song && song.platform === 'youtube' && isYtReady && ytPlayer && ytPlayer.playVideo) {
            ytPlayer.playVideo();
        }
    }).catch(e => {
        console.log("Autoplay blocked:", e);
        isPlaying = false;
        pauseUI();
    });
}

function pauseAudio() {
    audioEngine.pause();
    isPlaying = false;
    pauseUI();
    if(isYtReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); // Pause Video too
}

function pauseUI() {
    playIcon.className = 'fa-solid fa-play text-3xl text-black ml-1';
    miniPlayBtnNode.className = 'fa-solid fa-play text-white text-xl';
}

function togglePlay() {
    triggerHaptic('light');
    if (audioEngine.paused) playAudio();
    else pauseAudio();
}

// Sync Controls
document.getElementById('play-pause-btn').addEventListener('click', togglePlay);
miniPlayBtnNode.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

// ==========================================
// ⏭️ TRACK NAVIGATION
// ==========================================
function playNext() {
    triggerHaptic('light');
    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
        if (currentIndex < currentPlaylist.length - 1) currentIndex++;
        else currentIndex = 0; 
    }
    loadSongIntoPlayer();
}

function playPrev() {
    triggerHaptic('light');
    if (audioEngine && audioEngine.currentTime > 3) {
        audioEngine.currentTime = 0; 
        if(isYtReady && ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(0); // Rewind video too
    } else {
        if (currentIndex > 0) currentIndex--;
        else currentIndex = currentPlaylist.length - 1; 
        loadSongIntoPlayer();
    }
}

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
    console.warn("⚠️ Stream Failed! Skipping...");
    setTimeout(playNext, 1500); 
});

audioEngine.addEventListener('waiting', () => {
    playIcon.className = 'fa-solid fa-circle-notch fa-spin text-3xl text-black';
});
audioEngine.addEventListener('playing', () => {
    playIcon.className = 'fa-solid fa-pause text-3xl text-black ml-1';
});

// ==========================================
// 📱 LOCK SCREEN PLAYER (MEDIA SESSION)
// ==========================================
function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artist,
            album: song.platform === 'youtube' ? 'YouTube Music' : 'JioSaavn HD',
            artwork: [
                { src: song.image, sizes: '96x96', type: 'image/jpeg' },
                { src: song.image, sizes: '512x512', type: 'image/jpeg' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', playAudio);
        navigator.mediaSession.setActionHandler('pause', pauseAudio);
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
}
