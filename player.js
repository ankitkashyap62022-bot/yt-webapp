// ==========================================
// 🚀 YUKI MATRIX - UI INTERACTIONS & PLAYER ENGINE
// ==========================================

// 1. Telegram WebApp Initialization
const tg = window.Telegram.WebApp;
tg.expand(); // App ko hamesha full screen me open karega
tg.ready();

// 2. Haptic Feedback (Vibration engine for Real App Feel)
function triggerHaptic(style = 'light') {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(style);
    }
}

// 3. UI Elements ko pakadna
const miniPlayer = document.getElementById('mini-player');
const fullPlayer = document.getElementById('full-player');
const closePlayerBtn = document.getElementById('close-player-btn');
const mainContent = document.getElementById('main-content');

// 4. Slide-Up & Slide-Down Magic 🪄
miniPlayer.addEventListener('click', (e) => {
    // Agar play button pe click kiya hai, to player open mat karo (sirf gana play/pause karo)
    if(e.target.id === 'mini-play-btn' || e.target.classList.contains('fa-play')) return;
    
    triggerHaptic('medium');
    fullPlayer.classList.remove('translate-y-full'); // Player upar aayega
});

closePlayerBtn.addEventListener('click', () => {
    triggerHaptic('light');
    fullPlayer.classList.add('translate-y-full'); // Player wapas niche jayega
});

// 5. Basic Play/Pause Button Visual Toggle (Audio logic baad me API ke sath aayega)
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const miniPlayBtn = document.getElementById('mini-play-btn');

let isPlaying = false;

function togglePlayState() {
    triggerHaptic('heavy'); // Play dabane par heavy feel
    isPlaying = !isPlaying;

    if(isPlaying) {
        // Full Player Icon Change
        playIcon.classList.remove('fa-play', 'ml-1');
        playIcon.classList.add('fa-pause');
        // Mini Player Icon Change
        miniPlayBtn.classList.remove('fa-play');
        miniPlayBtn.classList.add('fa-pause');
    } else {
        // Full Player Icon Change
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play', 'ml-1');
        // Mini Player Icon Change
        miniPlayBtn.classList.remove('fa-pause');
        miniPlayBtn.classList.add('fa-play');
    }
}

playPauseBtn.addEventListener('click', togglePlayState);
miniPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Mini player open hone se rokna
    togglePlayState();
});
