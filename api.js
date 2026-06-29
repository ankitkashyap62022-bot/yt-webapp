// ==========================================
// 🧠 YUKI MATRIX - ADVANCED API ENGINE 3.0 (HISTORY & VIDEO READY)
// ==========================================

const JIOSAAVN_API = "https://jiosavan-lilac.vercel.app/api/search/songs?query=";
const YT_RAILWAY_API = "https://worker-production-1ef8.up.railway.app"; 

// 🎛️ UI Elements Cache
const searchInput = document.getElementById('search-input');
const apiSwitch = document.getElementById('api-switch'); 
const jiosaavnContainer = document.getElementById('jiosaavn-results');
const youtubeContainer = document.getElementById('youtube-results');
const emptyState = document.getElementById('empty-state');
const skeletonLoader = document.getElementById('loading-skeleton');

// 🕒 History Elements
const historyContainer = document.getElementById('search-history-container');
const historyList = document.getElementById('search-history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

let typingTimer;
const typingDelay = 500; 
let currentAbortController = null; // ⚡ Anti-Lag System

// ==========================================
// 💾 SEARCH HISTORY ENGINE (LOCAL STORAGE)
// ==========================================
function loadSearchHistory() {
    let history = JSON.parse(localStorage.getItem('yuki_history')) || [];
    if (history.length > 0) {
        historyContainer.classList.remove('hidden');
        historyList.innerHTML = history.map(q => 
            `<span class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-cyan-400 text-[10px] font-bold rounded-full border border-white/10 cursor-pointer transition-all shadow-md flex items-center" onclick="executeHistorySearch('${q}')">
                <i class="fa-solid fa-clock-rotate-left mr-1.5 opacity-50"></i>${q}
            </span>`
        ).join('');
    } else {
        historyContainer.classList.add('hidden');
    }
}

function saveToHistory(query) {
    if (!query) return;
    let history = JSON.parse(localStorage.getItem('yuki_history')) || [];
    // Remove if already exists to move it to top
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    history.unshift(query); // Add to start
    if (history.length > 8) history.pop(); // Keep only last 8 searches
    localStorage.setItem('yuki_history', JSON.stringify(history));
    loadSearchHistory();
}

if(clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('yuki_history');
        loadSearchHistory();
    });
}

// Global function to trigger search from history chips
window.executeHistorySearch = (query) => {
    searchInput.value = query;
    emptyState.classList.add('hidden');
    fetchSongs(query);
};

// Initialize History on load
loadSearchHistory();

// ==========================================
// 🚀 MAIN SEARCH CONTROLLER
// ==========================================
apiSwitch.addEventListener('change', () => {
    const query = searchInput.value.trim();
    if (query.length > 0) fetchSongs(query);
});

searchInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const query = searchInput.value.trim();
    
    if (query.length > 0) {
        emptyState.classList.add('hidden');
        typingTimer = setTimeout(() => fetchSongs(query), typingDelay);
    } else {
        jiosaavnContainer.innerHTML = ''; 
        youtubeContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        loadSearchHistory(); // Show history when box is empty
    }
});

// ==========================================
// 📡 FETCH ENGINE (WITH AUTO-CANCEL)
// ==========================================
async function fetchSongs(query) {
    // Save to local storage
    saveToHistory(query);

    // Cancel previous request if typing too fast
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    // UI States
    jiosaavnContainer.classList.add('hidden');
    youtubeContainer.classList.add('hidden');
    historyContainer.classList.add('hidden'); // Hide history while searching
    skeletonLoader.classList.remove('hidden');
    skeletonLoader.classList.add('flex');
    jiosaavnContainer.innerHTML = ''; 
    youtubeContainer.innerHTML = '';

    const isYouTube = apiSwitch.checked; 

    if (isYouTube) {
        document.querySelector('.saavn-skeleton').classList.add('hidden');
        document.querySelector('.yt-skeleton').classList.remove('hidden');
        document.querySelector('.yt-skeleton').classList.add('flex');
    } else {
        document.querySelector('.saavn-skeleton').classList.remove('hidden');
        document.querySelector('.yt-skeleton').classList.add('hidden');
    }

    try {
        if (!isYouTube) {
            const res = await fetch(JIOSAAVN_API + encodeURIComponent(query), { signal });
            const data = await res.json();
            if (data.success && data.data.results.length > 0) {
                renderAndQueueSongs(data.data.results, 'jiosaavn');
            } else {
                showError("ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲", 'jiosaavn');
            }
        } else {
            const res = await fetch(`${YT_RAILWAY_API}/search?query=${encodeURIComponent(query)}`, { signal }); 
            if (!res.ok) throw new Error("Server Error");
            const data = await res.json();
            if (data.status === "success" && data.results && data.results.length > 0) {
                renderAndQueueSongs(data.results, 'youtube');
            } else {
                showError("ʏᴏᴜᴛᴜʙᴇ ᴘᴀʀ ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲", 'youtube');
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') return; // Ignore cancelled requests
        showError(`⚠️ ᴇʀʀᴏʀ: API Connection Failed`, isYouTube ? 'youtube' : 'jiosaavn');
    }
}

// ==========================================
// 🎨 RENDER ENGINE
// ==========================================
function renderAndQueueSongs(songs, platform) {
    skeletonLoader.classList.add('hidden');
    skeletonLoader.classList.remove('flex');

    let formattedPlaylist = [];

    if (platform === 'jiosaavn') {
        youtubeContainer.classList.add('hidden');
        jiosaavnContainer.classList.remove('hidden');
    } else {
        jiosaavnContainer.classList.add('hidden');
        youtubeContainer.classList.remove('hidden');
        youtubeContainer.classList.add('flex');
    }

    songs.forEach((song, index) => {
        let title = platform === 'jiosaavn' ? song.name : (song.title || "Unknown");
        let artist = platform === 'jiosaavn' ? (song.artists?.primary?.length > 0 ? song.artists.primary[0].name : "Unknown") : (song.channel || "YouTube");
        let imgUrl = platform === 'jiosaavn' ? (song.image?.length > 0 ? song.image[song.image.length - 1].url : "https://telegra.ph/file/default.jpg") : (song.thumbnail || "https://telegra.ph/file/default.jpg");
        let audioUrl = platform === 'jiosaavn' ? (song.downloadUrl?.length > 0 ? song.downloadUrl[song.downloadUrl.length - 1].url : "") : `${YT_RAILWAY_API}/stream/${song.id}?type=audio`;
        
        // 🎞️ EXTREMELY IMPORTANT FOR NEXT STEP: Video ID Extraction
        let videoId = platform === 'youtube' ? song.id : null;

        formattedPlaylist.push({ 
            name: title, 
            artist: artist, 
            image: imgUrl, 
            url: audioUrl, 
            platform: platform,
            videoId: videoId // Passes to player.js for IFrame playback
        });

        if (platform === 'jiosaavn') {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition cursor-pointer border border-transparent hover:border-cyan-500 group`;
            li.innerHTML = `
                <div class="flex items-center space-x-3.5 w-[85%]">
                    <img src="${imgUrl}" class="w-12 h-12 rounded-lg object-cover shadow-md border border-gray-700 transition-colors">
                    <div class="truncate">
                        <h3 class="text-white text-sm font-bold truncate w-full tracking-wide">${title}</h3>
                        <p class="text-[11px] text-gray-400 mt-0.5 truncate">${artist}</p>
                    </div>
                </div>
                <i class="fa-solid fa-play text-gray-500 p-2 group-hover:text-cyan-400 transition-colors drop-shadow-md"></i>
            `;
            li.addEventListener('click', () => { if (typeof setQueueAndPlay === "function") setQueueAndPlay(formattedPlaylist, index); });
            jiosaavnContainer.appendChild(li);

        } else {
            const div = document.createElement('div');
            div.className = `flex flex-col space-y-3 p-2 group cursor-pointer bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-red-500 transition-all shadow-lg`;
            div.innerHTML = `
                <div class="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg border border-white/5">
                    <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                        <div class="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-75 group-hover:scale-100 transition-transform duration-300">
                            <i class="fa-solid fa-play text-xl text-white ml-1"></i>
                        </div>
                    </div>
                    <div class="absolute top-2 right-2 bg-black/80 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-md border border-white/10 tracking-widest"><i class="fa-brands fa-youtube text-red-500 mr-1"></i>VIDEO MIX</div>
                </div>
                <div class="flex space-x-3 px-1">
                    <div class="flex-1">
                        <h3 class="text-white text-sm font-bold line-clamp-2 leading-tight drop-shadow-md">${title}</h3>
                        <p class="text-gray-400 text-[11px] mt-1.5 flex items-center"><i class="fa-solid fa-circle-check text-[9px] mr-1.5 text-blue-400"></i> ${artist}</p>
                    </div>
                </div>
            `;
            div.addEventListener('click', () => { if (typeof setQueueAndPlay === "function") setQueueAndPlay(formattedPlaylist, index); });
            youtubeContainer.appendChild(div);
        }
    });
}

function showError(msg, platform) {
    skeletonLoader.classList.add('hidden');
    if(platform === 'youtube') {
        youtubeContainer.classList.remove('hidden');
        youtubeContainer.innerHTML = `<div class="text-center text-red-500 text-xs py-4 tracking-widest font-bold w-full bg-red-500/10 rounded-xl border border-red-500/20">${msg}</div>`;
    } else {
        jiosaavnContainer.classList.remove('hidden');
        jiosaavnContainer.innerHTML = `<li class="text-center text-cyan-400 text-xs py-4 tracking-widest font-bold bg-cyan-500/10 rounded-xl border border-cyan-500/20">${msg}</li>`;
    }
}

// ==========================================
// 📻 AUTO-RADIO ENGINE (RELATED SONGS)
// ==========================================
async function fetchRelatedSongs(platform) {
    try {
        const randomKeywords = ["latest hits", "trending mix", "lofi vibes", "punjabi hits", "bollywood mashup", "party mix", "chill tracks", "slowed reverb"];
        const randomQuery = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];

        let targetUrl = platform === 'jiosaavn' 
            ? JIOSAAVN_API + encodeURIComponent(randomQuery) 
            : `${YT_RAILWAY_API}/search?query=${encodeURIComponent(randomQuery)}`;

        const res = await fetch(targetUrl);
        const data = await res.json();

        let newPlaylist = [];
        if (platform === 'jiosaavn' && data.success && data.data.results) {
            data.data.results.forEach(song => {
                newPlaylist.push({
                    name: song.name,
                    artist: song.artists?.primary?.length > 0 ? song.artists.primary[0].name : "Unknown",
                    image: song.image?.length > 0 ? song.image[song.image.length - 1].url : "https://telegra.ph/file/default.jpg",
                    url: song.downloadUrl?.length > 0 ? song.downloadUrl[song.downloadUrl.length - 1].url : "",
                    platform: 'jiosaavn',
                    videoId: null
                });
            });
        } else if (platform === 'youtube' && data.status === "success" && data.results) {
            data.results.forEach(song => {
                newPlaylist.push({
                    name: song.title || "Unknown",
                    artist: song.channel || "YouTube",
                    image: song.thumbnail || "https://telegra.ph/file/default.jpg",
                    url: `${YT_RAILWAY_API}/stream/${song.id}?type=audio`,
                    platform: 'youtube',
                    videoId: song.id // Extracting Video ID
                });
            });
        }

        newPlaylist = newPlaylist.sort(() => Math.random() - 0.5);

        // Send to player.js to build "Up Next" queue
        if (typeof appendToQueue === "function" && newPlaylist.length > 0) {
            appendToQueue(newPlaylist);
        }
    } catch (e) {
        console.log("Radio Engine Error: ", e);
    }
}
