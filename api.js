// ==========================================
// 🧠 YUKI MATRIX - ADVANCED API ENGINE 3.0 (HISTORY, VIDEO & TRENDING READY)
// ==========================================

const JIOSAAVN_API = "https://jiosavan-lilac.vercel.app/api/search/songs?query=";
const YT_RAILWAY_API = "https://worker-production-1ef8.up.railway.app"; 

// 🎛️ UI Elements Cache
const searchInput = document.getElementById('search-input');
const apiSwitch = document.getElementById('api-switch'); 
const jiosaavnContainer = document.getElementById('search-results'); // Fixed ID to match index.html
const youtubeContainer = document.getElementById('search-results'); // Using same container for now, dynamically cleared
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
// 🚀 INITIALIZATION (TRENDING MATRIX)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    loadSearchHistory();
    // No-Search Load: App khulte hi trending gaane laayega
    if (!searchInput.value) {
        fetchTrendingOnLoad();
    }
});

function fetchTrendingOnLoad() {
    // Random trending vibe fetch karega app start hote hi
    const vibes = ["Top 50 India", "Viral Hits", "LoFi Bollywood", "Punjabi Pop"];
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    fetchSongs(randomVibe, true); // true means it's a silent background load, no history saved
}

// ==========================================
// 💾 SEARCH HISTORY ENGINE (LOCAL STORAGE)
// ==========================================
function loadSearchHistory() {
    let history = JSON.parse(localStorage.getItem('yuki_history')) || [];
    if (history.length > 0 && historyContainer && historyList) {
        historyContainer.classList.remove('hidden');
        historyList.innerHTML = history.map(q => 
            `<span class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-cyan-400 text-[10px] font-bold rounded-full border border-white/10 cursor-pointer transition-all shadow-md flex items-center" onclick="executeHistorySearch('${q}')">
                <i class="fa-solid fa-clock-rotate-left mr-1.5 opacity-50"></i>${q}
            </span>`
        ).join('');
    } else if (historyContainer) {
        historyContainer.classList.add('hidden');
    }
}

function saveToHistory(query) {
    if (!query) return;
    let history = JSON.parse(localStorage.getItem('yuki_history')) || [];
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    history.unshift(query); 
    if (history.length > 8) history.pop(); 
    localStorage.setItem('yuki_history', JSON.stringify(history));
    loadSearchHistory();
}

if(clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('yuki_history');
        loadSearchHistory();
    });
}

window.executeHistorySearch = (query) => {
    searchInput.value = query;
    if(emptyState) emptyState.classList.add('hidden');
    fetchSongs(query);
};

// ==========================================
// 🚀 MAIN SEARCH CONTROLLER (SMART TOGGLE FIX)
// ==========================================
apiSwitch.addEventListener('change', () => {
    let query = searchInput.value.trim();
    
    // 🔥 जादू यहाँ है: अगर बॉक्स खाली है, तो खुद ही सर्च मार दो!
    if (query.length === 0) {
        query = apiSwitch.checked ? "Latest YouTube Hits" : "Top 50 JioSaavn";
    }
    
    fetchSongs(query);
});

searchInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const query = searchInput.value.trim();

    if (query.length > 0) {
        if(emptyState) emptyState.classList.add('hidden');
        typingTimer = setTimeout(() => fetchSongs(query), typingDelay);
    } else {
        if(jiosaavnContainer) jiosaavnContainer.innerHTML = ''; 
        if(emptyState) emptyState.classList.remove('hidden');
        loadSearchHistory(); 
        
        // Agar clear kiya box, to wapas trending la do
        const defaultQuery = apiSwitch.checked ? "Latest YouTube Hits" : "Top 50 JioSaavn";
        fetchSongs(defaultQuery, true); 
    }
});

// ==========================================
// 📡 FETCH ENGINE (WITH AUTO-CANCEL)
// ==========================================
async function fetchSongs(query, isSilentLoad = false) {
    if (!isSilentLoad) saveToHistory(query);

    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    // UI States
    if(historyContainer) historyContainer.classList.add('hidden'); 
    
    // Simple Loader logic for index.html compatibility
    if(jiosaavnContainer) {
        jiosaavnContainer.innerHTML = `
        <li class="flex flex-col items-center justify-center py-8">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-cyan-400 mb-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"></i>
            <span class="text-xs text-gray-400 tracking-widest uppercase">ꜱᴇᴀʀᴄʜɪɴɢ ᴍᴀᴛʀɪx...</span>
        </li>`;
    }

    const isYouTube = apiSwitch.checked; 

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
        if (error.name === 'AbortError') return; 
        showError(`⚠️ ᴇʀʀᴏʀ: API Connection Failed`, isYouTube ? 'youtube' : 'jiosaavn');
    }
}

// ==========================================
// 🎨 RENDER ENGINE
// ==========================================
function renderAndQueueSongs(songs, platform) {
    if(jiosaavnContainer) jiosaavnContainer.innerHTML = ''; 

    let formattedPlaylist = [];

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
            videoId: videoId 
        });

        if (platform === 'jiosaavn') {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition cursor-pointer border border-transparent hover:border-purple-500 group`;
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
            li.addEventListener('click', () => { 
                const mode = apiSwitch.checked ? 'video' : 'music';
                if (typeof switchMode === "function") switchMode(mode);
                if (typeof setQueueAndPlay === "function") setQueueAndPlay(formattedPlaylist, index); 
            });
            if(jiosaavnContainer) jiosaavnContainer.appendChild(li);

        } else {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition cursor-pointer border border-transparent hover:border-red-500 group`;
            li.innerHTML = `
                <div class="flex items-center space-x-3.5 w-[85%]">
                    <img src="${imgUrl}" class="w-12 h-12 rounded-lg object-cover shadow-md border border-gray-700 transition-colors">
                    <div class="truncate">
                        <h3 class="text-white text-sm font-bold truncate w-full tracking-wide">${title}</h3>
                        <p class="text-[11px] text-gray-400 mt-0.5 truncate flex items-center"><i class="fa-brands fa-youtube text-red-500 mr-1"></i> ${artist}</p>
                    </div>
                </div>
                <i class="fa-solid fa-play text-gray-500 p-2 group-hover:text-red-500 transition-colors drop-shadow-md"></i>
            `;
            li.addEventListener('click', () => { 
                const mode = apiSwitch.checked ? 'video' : 'music';
                if (typeof switchMode === "function") switchMode(mode);
                if (typeof setQueueAndPlay === "function") setQueueAndPlay(formattedPlaylist, index); 
            });
            if(jiosaavnContainer) jiosaavnContainer.appendChild(li); // Using same list container to avoid UI clutter
        }
    });
}

function showError(msg, platform) {
    if(jiosaavnContainer) {
        if(platform === 'youtube') {
            jiosaavnContainer.innerHTML = `<li class="text-center text-red-500 text-xs py-4 tracking-widest font-bold w-full bg-red-500/10 rounded-xl border border-red-500/20">${msg}</li>`;
        } else {
            jiosaavnContainer.innerHTML = `<li class="text-center text-cyan-400 text-xs py-4 tracking-widest font-bold bg-cyan-500/10 rounded-xl border border-cyan-500/20">${msg}</li>`;
        }
    }
}

// ==========================================
// 📻 AUTO-RADIO ENGINE (RELATED SONGS)
// ==========================================
async function fetchRelatedSongs(platform) {
    try {
        const randomKeywords = ["latest hits", "trending mix", "lofi vibes", "punjabi hits", "bollywood mashup", "party mix"];
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
                    videoId: song.id 
                });
            });
        }

        newPlaylist = newPlaylist.sort(() => Math.random() - 0.5);

        if (typeof appendToQueue === "function" && newPlaylist.length > 0) {
            appendToQueue(newPlaylist);
        }
    } catch (e) {
        console.log("Radio Engine Error: ", e);
    }
}
