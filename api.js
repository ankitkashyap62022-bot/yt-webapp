// ==========================================
// 🧠 YUKI MATRIX - PRO API ENGINE (DUAL UI & RANDOM RADIO)
// ==========================================

const JIOSAAVN_API = "https://jiosavan-lilac.vercel.app/api/search/songs?query=";
const YT_RAILWAY_API = "https://worker-production-1ef8.up.railway.app"; 

const searchInput = document.getElementById('search-input');
const apiSwitch = document.getElementById('api-switch'); 

// Dual Containers & States (Index.html se match kiya hua)
const jiosaavnContainer = document.getElementById('jiosaavn-results');
const youtubeContainer = document.getElementById('youtube-results');
const emptyState = document.getElementById('empty-state');
const skeletonLoader = document.getElementById('loading-skeleton');

let typingTimer;
const typingDelay = 600; 

// Toggle switch logic (Instantly change UI)
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
    }
});

async function fetchSongs(query) {
    // Show Skeleton Loader, Hide Containers
    jiosaavnContainer.classList.add('hidden');
    youtubeContainer.classList.add('hidden');
    skeletonLoader.classList.remove('hidden');
    skeletonLoader.classList.add('flex');
    jiosaavnContainer.innerHTML = ''; 
    youtubeContainer.innerHTML = '';

    const isYouTube = apiSwitch.checked; 

    // UI skeleton adjustments based on mode
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
            const res = await fetch(JIOSAAVN_API + encodeURIComponent(query));
            const data = await res.json();
            if (data.success && data.data.results.length > 0) {
                renderAndQueueSongs(data.data.results, 'jiosaavn');
            } else {
                showError("ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲", 'jiosaavn');
            }
        } else {
            const res = await fetch(`${YT_RAILWAY_API}/search?query=${encodeURIComponent(query)}`); 
            if (!res.ok) throw new Error("Server Error");
            const data = await res.json();
            if (data.status === "success" && data.results && data.results.length > 0) {
                renderAndQueueSongs(data.results, 'youtube');
            } else {
                showError("ʏᴏᴜᴛᴜʙᴇ ᴘᴀʀ ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲", 'youtube');
            }
        }
    } catch (error) {
        showError(`⚠️ ᴇʀʀᴏʀ: API Connection Failed`, isYouTube ? 'youtube' : 'jiosaavn');
    }
}

function renderAndQueueSongs(songs, platform) {
    // Hide Skeleton, Show correct container
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

        formattedPlaylist.push({ name: title, artist: artist, image: imgUrl, url: audioUrl, platform: platform });

        if (platform === 'jiosaavn') {
            // 🥇 JIOSAAVN LIST UI
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
            // 🥈 YOUTUBE GRID/CARD UI (Video style)
            const div = document.createElement('div');
            div.className = `flex flex-col space-y-3 p-2 group cursor-pointer bg-white/5 hover:bg-white/10 rounded-2xl border border-transparent hover:border-red-500 transition-all`;
            div.innerHTML = `
                <div class="relative w-full h-48 rounded-xl overflow-hidden shadow-lg">
                    <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <i class="fa-brands fa-youtube text-4xl text-white opacity-0 group-hover:opacity-100 group-hover:text-red-500 transition-all scale-75 group-hover:scale-100 drop-shadow-lg"></i>
                    </div>
                    <div class="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md">AUDIO MIX</div>
                </div>
                <div class="flex space-x-3 px-1">
                    <div class="flex-1">
                        <h3 class="text-white text-sm font-bold line-clamp-2 leading-tight">${title}</h3>
                        <p class="text-gray-400 text-[11px] mt-1.5 flex items-center"><i class="fa-solid fa-circle-check text-[9px] mr-1 text-gray-500"></i> ${artist}</p>
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
        youtubeContainer.innerHTML = `<div class="text-center text-red-500 text-xs py-4 tracking-widest font-bold w-full">${msg}</div>`;
    } else {
        jiosaavnContainer.classList.remove('hidden');
        jiosaavnContainer.innerHTML = `<li class="text-center text-red-500 text-xs py-4 tracking-widest font-bold">${msg}</li>`;
    }
}

// 📻 RADIO ENGINE: Ab Random Gaane Layega (No boring same artist)
async function fetchRelatedSongs(platform) {
    try {
        // Random Mix Keywords
        const randomKeywords = ["latest hits", "trending mix", "lofi vibes", "punjabi hits", "bollywood mashup", "party mix", "chill tracks"];
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
                    platform: 'jiosaavn'
                });
            });
        } else if (platform === 'youtube' && data.status === "success" && data.results) {
            data.results.forEach(song => {
                newPlaylist.push({
                    name: song.title || "Unknown",
                    artist: song.channel || "YouTube",
                    image: song.thumbnail || "https://telegra.ph/file/default.jpg",
                    url: `${YT_RAILWAY_API}/stream/${song.id}?type=audio`,
                    platform: 'youtube'
                });
            });
        }

        // 🔀 SHUFFLE ARRAY (Poora Random banayega)
        newPlaylist = newPlaylist.sort(() => Math.random() - 0.5);

        // Chupchap player.js ko naye gaane bhej do
        if (typeof appendToQueue === "function" && newPlaylist.length > 0) {
            appendToQueue(newPlaylist);
        }
    } catch (e) {
        console.log("Auto-Radio Error: ", e);
    }
}
