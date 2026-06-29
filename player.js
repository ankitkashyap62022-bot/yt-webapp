// ==========================================
// 🚀 YUKI MATRIX - ADVANCED PLAYER ENGINE & QUEUE
// ==========================================

const tg = window.Telegram.WebApp;
tg.expand(); 
tg.ready();

function triggerHaptic(style = 'light') {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
}

const miniPlayer = document.getElementById('mini-player');
const fullPlayer = document.getElementById('full-player');
const closePlayerBtn = document.getElementById('close-player-btn');

const fsImage = document.getElementById('fs-img'); 
const fsTitle = document.getElementById('fs-title'); 
const fsArtist = document.getElementById('fs-artist'); 
const miniImg = document.getElementById('mini-img'); 
const miniTitle = document.getElementById('mini-title'); 
const miniArtist = document.getElementById('mini-artist'); 

miniPlayer.addEventListener('click', (e) => {
    if(e.target.closest('#mini-play-btn') || e.target.classList.contains('fa-play') || e.target.classList.contains('fa-pause')) return;
    triggerHaptic('medium');
    fullPlayer.classList.remove('translate-y-full'); 
});

closePlayerBtn.addEventListener('click', () => {
    triggerHaptic('light');
    fullPlayer.classList.add('translate-y-full'); 
});

// 🎵 QUEUE SYSTEM
let currentPlaylist = []; 
let currentIndex = 0;     

function setQueueAndPlay(playlistData, index) {
    currentPlaylist = playlistData;
    currentIndex = index;
    loadSongIntoPlayer();
}

// 📻 RADIO MODE: Naye gano ko list me jodne wala function
function appendToQueue(newSongs) {
    const existingNames = currentPlaylist.map(s => s.name);
    newSongs.forEach(song => {
        // Agar gaana pehle se list me nahi hai, tabhi add karo
        if (!existingNames.includes(song.name)) {
            currentPlaylist.push(song);
        }
    });
    console.log("🔥 Radio Active: Queue me naye gaane add ho gaye! Total: " + currentPlaylist.length);
}

function loadSongIntoPlayer() {
    if(currentPlaylist.length === 0) return;

    let song = currentPlaylist[currentIndex];
    
    if(fsTitle) fsTitle.innerText = song.name || "Unknown Song";
    if(fsArtist) fsArtist.innerText = song.artist || "Unknown Artist";
    if(fsImage) fsImage.src = song.image || "";
    if(miniTitle) miniTitle.innerText = song.name || "Unknown Song";
    if(miniArtist) miniArtist.innerText = song.artist || "Unknown Artist";
    if(miniImg) miniImg.src = song.image || "";

    const audioEngine = document.getElementById('audio-engine');
    if(audioEngine) {
        audioEngine.src = song.url; 
        audioEngine.play().then(() => {
            document.getElementById('play-icon').className = 'fa-solid fa-pause text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 ml-1';
            document.getElementById('mini-play-btn').className = 'fa-solid fa-pause text-white text-lg';
        }).catch(e => console.log("Autoplay blocked:", e));
    }
    
    triggerHaptic('heavy');

    // 📡 Background me Related Songs mangwao (API se)
    if (typeof fetchRelatedSongs === "function") {
        // Hum usi platform par us artist ke aur gaane mangwaenge
        fetchRelatedSongs(song.artist, song.platform || 'jiosaavn');
    }
}

function playNextSong() {
    if (currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
        loadSongIntoPlayer();
    } else {
        currentIndex = 0; // List ke end me wapas shuru se
        loadSongIntoPlayer();
    }
}

function playPrevSong() {
    if (currentIndex > 0) {
        currentIndex--;
        loadSongIntoPlayer();
    } else {
        const audioEngine = document.getElementById('audio-engine');
        if(audioEngine) audioEngine.currentTime = 0;
    }
}

const playPauseBtn = document.getElementById('play-pause-btn'); 
const miniPlayBtnNode = document.getElementById('mini-play-btn'); 

if(playPauseBtn) playPauseBtn.addEventListener('click', () => { if(typeof togglePlay === "function") togglePlay(); });
if(miniPlayBtnNode) miniPlayBtnNode.addEventListener('click', (e) => { e.stopPropagation(); if(typeof togglePlay === "function") togglePlay(); });
