// ==========================================
// 🧠 YUKI MATRIX - THE BRAIN (API ENGINE)
// ==========================================

// API URLs & Keys (Jo tune di thi)
const JIOSAAVN_API = "https://jiosavan-lilac.vercel.app/api/search/songs?query=";
const YT_SHRUTI_KEY = "ShrutiBotshf6Os7VvDAm6M3JeJX36";

// UI Elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const apiSwitch = document.getElementById('api-switch'); // Toggle Switch

// 🛑 Debounce Logic (Spam rokne ke liye - jab typing band hogi tabhi search karega)
let typingTimer;
const typingDelay = 600; // 0.6 seconds delay

searchInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const query = searchInput.value.trim();
    
    if (query.length > 0) {
        typingTimer = setTimeout(() => fetchSongs(query), typingDelay);
    } else {
        searchResults.innerHTML = ''; // Box khali hone par result clear
    }
});

// 🚀 Main Fetch Engine
async function fetchSongs(query) {
    // Loading Animation
    searchResults.innerHTML = `
        <li class="flex flex-col items-center justify-center py-8">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-cyan-400 mb-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"></i>
            <span class="text-xs text-gray-400 tracking-widest uppercase">ꜱᴇᴀʀᴄʜɪɴɢ...</span>
        </li>`;

    const isYouTube = apiSwitch.checked; // Check karo switch kahan hai

    if (!isYouTube) {
        // 🥇 JIOSAAVN SEARCH ENGINE
        try {
            const res = await fetch(JIOSAAVN_API + encodeURIComponent(query));
            const data = await res.json();

            if (data.success && data.data.results.length > 0) {
                renderSongs(data.data.results, 'jiosaavn');
            } else {
                showError("ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲");
            }
        } catch (error) {
            showError("API ᴇʀʀᴏʀ ᴀᴀ ɢᴀʏᴀ! ☠️");
            console.error(error);
        }
    } else {
        // 🥈 YOUTUBE SEARCH ENGINE (SHRUTI API)
        // Note: YT Search ka exact URL next step me set karenge, abhi dummy lagaya hai alert ke liye
        searchResults.innerHTML = `
            <li class="text-center text-red-400 text-xs py-4 font-bold border border-red-900/50 bg-red-900/10 rounded-xl">
                ⚠️ ʏᴏᴜᴛᴜʙᴇ ᴍᴏᴅᴇ ᴀᴄᴛɪᴠᴇ!<br><span class="text-gray-500">(Shruti Key linked, search logic pending)</span>
            </li>`;
    }
}

// 🎨 Render Songs on UI
function renderSongs(songs, platform) {
    searchResults.innerHTML = ''; // Loading hatao

    songs.forEach(song => {
        // JioSaavn Data Extraction (Jo JSON tune dikhaya tha uske hisaab se)
        let title = song.name;
        let artist = song.artists && song.artists.primary.length > 0 ? song.artists.primary[0].name : "Unknown Artist";
        
        // Sabse HD image (500x500) uthana
        let imgUrl = "https://telegra.ph/file/default.jpg";
        if (song.image && song.image.length > 0) {
            imgUrl = song.image[song.image.length - 1].url; 
        }

        // Sabse high quality Audio (320kbps) uthana
        let audioUrl = "";
        if (song.downloadUrl && song.downloadUrl.length > 0) {
            audioUrl = song.downloadUrl[song.downloadUrl.length - 1].url;
        }

        // HTML List Item Banana (Tere CSS wali style me)
        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-800 group";
        li.innerHTML = `
            <div class="flex items-center space-x-3.5 w-[85%]">
                <img src="${imgUrl}" class="w-12 h-12 rounded-lg object-cover shadow-md border border-gray-700 group-hover:border-purple-500 transition-colors">
                <div class="truncate">
                    <h3 class="text-white text-sm font-bold truncate w-full tracking-wide">${title}</h3>
                    <p class="text-[11px] text-gray-400 mt-0.5 truncate">${artist}</p>
                </div>
            </div>
            <i class="fa-solid fa-play text-gray-500 p-2 group-hover:text-cyan-400 transition-colors shadow-cyan"></i>
        `;

        // 🎵 Click Event: Gana play karne ke liye (Ye player.js se link hoga)
        li.addEventListener('click', () => {
            loadAndPlaySong(title, artist, imgUrl, audioUrl);
        });

        searchResults.appendChild(li);
    });
}

function showError(msg) {
    searchResults.innerHTML = `<li class="text-center text-gray-500 text-xs py-4 tracking-widest">${msg}</li>`;
}

// 🎧 PLAYER LINKER (API se data uthakar Player me dalna)
function loadAndPlaySong(title, artist, img, audioLink) {
    // 1. Haptic Feedback
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    // 2. UI Updates (Mini Player & Full Player)
    document.getElementById('mini-title').innerText = title;
    document.getElementById('mini-artist').innerText = artist;
    document.getElementById('mini-cover').src = img;

    document.getElementById('player-title').innerText = title;
    document.getElementById('player-artist').innerText = artist;
    document.getElementById('player-cover').src = img;

    // 3. Audio Engine Start
    const audioEngine = document.getElementById('audio-engine');
    audioEngine.src = audioLink;
    audioEngine.play();

    // 4. Update Play/Pause Buttons (Ye variables player.js se aayenge)
    document.getElementById('play-icon').className = 'fa-solid fa-pause text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 ml-1';
    document.getElementById('mini-play-btn').className = 'fa-solid fa-pause text-white text-lg';
    
    // Global variable update if needed (will sync with player.js logic)
    if(typeof isPlaying !== 'undefined') isPlaying = true;
}
