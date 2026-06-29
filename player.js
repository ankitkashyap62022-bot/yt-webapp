// ==========================================
// 🚀 YUKI MATRIX - ADVANCED PLAYER ENGINE & QUEUE
// ==========================================

// 1. Telegram WebApp Initialization
const tg = window.Telegram.WebApp;
tg.expand(); 
tg.ready();

// 2. Haptic Feedback Engine (Vibration)
function triggerHaptic(style = 'light') {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(style);
    }
}

// 3. UI Elements Tracker (HTML ke IDs match kar lena)
const miniPlayer = document.getElementById('mini-player');
const fullPlayer = document.getElementById('full-player');
const closePlayerBtn = document.getElementById('close-player-btn');

// Player ke Text aur Image wale Elements
const fsImage = document.getElementById('fs-img'); // Full Player Photo
const fsTitle = document.getElementById('fs-title'); // Full Player Song Name
const fsArtist = document.getElementById('fs-artist'); // Full Player Singer
const miniImg = document.getElementById('mini-img'); // Mini Player Photo
const miniTitle = document.getElementById('mini-title'); 
const miniArtist = document.getElementById('mini-artist'); 

// 4. Slide-Up & Slide-Down Magic 🪄
miniPlayer.addEventListener('click', (e) => {
    // Agar play/pause icon pe click ho toh slide up mat karna
    if(e.target.closest('#mini-play-btn') || e.target.classList.contains('fa-play') || e.target.classList.contains('fa-pause')) return;
    
    triggerHaptic('medium');
    fullPlayer.classList.remove('translate-y-full'); // Full player upar aayega
});

closePlayerBtn.addEventListener('click', () => {
    triggerHaptic('light');
    fullPlayer.classList.add('translate-y-full'); // Player wapas hide hoga
});

// ==========================================
// 🎵 QUEUE SYSTEM & PLAYBACK LOGIC
// ==========================================
let currentPlaylist = []; // Gano ki list
let currentIndex = 0;     // Konsa gana baj raha hai uski position

// 🔗 (API) Jab koi gana search karke click karega, to wo is function ko call karega
function setQueueAndPlay(playlistData, index) {
    currentPlaylist = playlistData;
    currentIndex = index;
    loadSongIntoPlayer();
}

// 💽 Gaane ka Data UI me dalna aur Play karna
function loadSongIntoPlayer() {
    if(currentPlaylist.length === 0) return;

    let song = currentPlaylist[currentIndex];
    
    // 🖼️ Update UI Texts & Images (Tere HTML elements update honge)
    if(fsTitle) fsTitle.innerText = song.name || "Unknown Song";
    if(fsArtist) fsArtist.innerText = song.artist || "Unknown Artist";
    if(fsImage) fsImage.src = song.image || "";
    
    if(miniTitle) miniTitle.innerText = song.name || "Unknown Song";
    if(miniArtist) miniArtist.innerText = song.artist || "Unknown Artist";
    if(miniImg) miniImg.src = song.image || "";

    // 🔊 Audio Engine Connection (audio.js se)
    const audioEngine = document.getElementById('audio-engine');
    if(audioEngine) {
        audioEngine.src = song.url; // API se aayi streaming URL set kardi
        audioEngine.play().then(() => {
            // Gana successfully chal gaya, ab Icons Pause me badal do
            document.getElementById('play-icon').className = 'fa-solid fa-pause text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 ml-1';
            document.getElementById('mini-play-btn').className = 'fa-solid fa-pause text-white text-lg';
        }).catch(e => console.log("Autoplay blocked by browser:", e));
    }
    
    triggerHaptic('heavy');
}

// ⏭️ Next Song Logic
function playNextSong() {
    if (currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
        loadSongIntoPlayer();
    } else {
        // Agar list ka aakhiri gana tha, to wapas pehle se chalu karo (Loop)
        currentIndex = 0;
        loadSongIntoPlayer();
    }
}

// ⏮️ Previous Song Logic
function playPrevSong() {
    if (currentIndex > 0) {
        currentIndex--;
        loadSongIntoPlayer();
    } else {
        // Agar pehle gaane par back dabaya to gaana shuru se start kardo
        const audioEngine = document.getElementById('audio-engine');
        if(audioEngine) audioEngine.currentTime = 0;
    }
}

// ==========================================
// 🎮 PLAY / PAUSE BUTTONS CONNECTION
// ==========================================
const playPauseBtn = document.getElementById('play-pause-btn'); // Full player ka bada button
const miniPlayBtnNode = document.getElementById('mini-play-btn'); // Mini player ka chhota button

if(playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        if(typeof togglePlay === "function") togglePlay(); // audio.js ka asli Play/Pause function call hoga
    });
}

if(miniPlayBtnNode) {
    miniPlayBtnNode.addEventListener('click', (e) => {
        e.stopPropagation(); // Slide-up rokne ke liye
        if(typeof togglePlay === "function") togglePlay(); 
    });
}
