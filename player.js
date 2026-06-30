// ==========================================
// 🚀 YUKI MATRIX - PRO PLAYER ENGINE 4.0 (STRICT RANDOM RADIO)
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
// 🎞️ YOUTUBE IFRAME API (VIDEO ENGINE FIX)
// ==========================================
let ytPlayer = null;
let isYtReady = false;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('yt-video-player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'controls': 1, // 🔥 YAHAN 1 KIYA HAI TAAKI QUALITY/SETTINGS DIKHE
            'disablekb': 0, 
            'fs': 1, // 🔥 Fullscreen ka option bhi on kar diya
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
// 🎶 STRICT RANDOM QUEUE SYSTEM (THE FIX)
// ==========================================
function setQueueAndPlay(playlistData, index) {
    // 🚨 FIX: Purani search list ko aag laga do! Sirf click kiya hua ek gaana rakho.
    currentPlaylist = [playlistData[index]];
    currentIndex = 0;
    
    // UI Update karo (Khali queue dikhao loading state me)
    renderUpNextQueue(); 
    loadSongIntoPlayer();

    // 🚀 Turaant API ko signal bhejo ki "Naye aur RANDOM gaane laao!"
    if (typeof fetchRelatedSongs === "function") {
        fetchRelatedSongs(playlistData[index].platform || 'jiosaavn');
    }
}

function appendToQueue(newSongs) {
    const existingNames = currentPlaylist.map(s => s.name);
    newSongs.forEach(song => {
        // Sirf naye aur random gaane add honge
        if (!existingNames.includes(song.name)) {
            currentPlaylist.push(song);
        }
    });
    console.log(`🔥 Random Radio Active: Queue Size -> ${currentPlaylist.length}`);
    renderUpNextQueue(); // Queue update hote hi UI refresh karo
}

// 📜 UP-NEXT UI RENDERER
function renderUpNextQueue() {
    const queueList = document.getElementById('player-queue-list');
    if (!queueList) return;
    queueList.innerHTML = '';

    // Agle 15 gaane dikhao
    const upNextSongs = currentPlaylist.slice(currentIndex + 1, currentIndex + 16);

    // Agar Queue khali hai (matlab API se random gaane aa rahe hain)
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

        // Load YouTube Video
        if (isYtReady && ytPlayer && ytPlayer.loadVideoById) {
            ytPlayer.loadVideoById(song.videoId);
            ytPlayer.mute(); 
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
    renderUpNextQueue(); 

    // 4. Auto-Radio Trigger (Queue me aakhri gaano par pahuche to aur random laao)
    if (typeof fetchRelatedSongs === "function" && currentIndex >= currentPlaylist.length - 3) {
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
    if(isYtReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); 
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

document.getElementById('play-pause-btn').addEventListener('click', togglePlay);
miniPlayBtnNode.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

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
    console.warn("⚠️ Stream Failed! Skipping to completely random track...");
    setTimeout(playNext, 1000); 
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
            album: song.platform === 'youtube' ? 'YouTube Mix' : 'JioSaavn Mix',
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
