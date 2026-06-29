// ==========================================
// 🧠 YUKI MATRIX - THE PRO API ENGINE
// ==========================================

const JIOSAAVN_API = "https://jiosavan-lilac.vercel.app/api/search/songs?query=";
const YT_RAILWAY_API = "https://worker-production-1ef8.up.railway.app"; 

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const apiSwitch = document.getElementById('api-switch'); 

let typingTimer;
const typingDelay = 600; 

searchInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const query = searchInput.value.trim();
    if (query.length > 0) {
        typingTimer = setTimeout(() => fetchSongs(query), typingDelay);
    } else {
        searchResults.innerHTML = ''; 
    }
});

async function fetchSongs(query) {
    searchResults.innerHTML = `
        <li class="flex flex-col items-center justify-center py-8">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-cyan-400 mb-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"></i>
            <span class="text-xs text-gray-400 tracking-widest uppercase">ꜱᴇᴀʀᴄʜɪɴɢ ᴍᴀᴛʀɪx...</span>
        </li>`;

    const isYouTube = apiSwitch.checked; 

    try {
        if (!isYouTube) {
            const res = await fetch(JIOSAAVN_API + encodeURIComponent(query));
            const data = await res.json();
            if (data.success && data.data.results.length > 0) renderAndQueueSongs(data.data.results, 'jiosaavn');
            else showError("ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲");
        } else {
            const res = await fetch(`${YT_RAILWAY_API}/search?query=${encodeURIComponent(query)}`); 
            if (!res.ok) throw new Error("Server Error");
            const data = await res.json();
            if (data.status === "success" && data.results && data.results.length > 0) renderAndQueueSongs(data.results, 'youtube');
            else showError("ʏᴏᴜᴛᴜʙᴇ ᴘᴀʀ ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲");
        }
    } catch (error) {
        showError(`⚠️ ᴇʀʀᴏʀ: API Connection Failed`);
    }
}

function renderAndQueueSongs(songs, platform) {
    searchResults.innerHTML = ''; 
    let formattedPlaylist = [];

    songs.forEach((song, index) => {
        let title = platform === 'jiosaavn' ? song.name : (song.title || "Unknown");
        let artist = platform === 'jiosaavn' ? (song.artists?.primary?.length > 0 ? song.artists.primary[0].name : "Unknown") : (song.channel || "YouTube");
        let imgUrl = platform === 'jiosaavn' ? (song.image?.length > 0 ? song.image[song.image.length - 1].url : "https://telegra.ph/file/default.jpg") : (song.thumbnail || "https://telegra.ph/file/default.jpg");
        let audioUrl = platform === 'jiosaavn' ? (song.downloadUrl?.length > 0 ? song.downloadUrl[song.downloadUrl.length - 1].url : "") : `${YT_RAILWAY_API}/stream/${song.id}?type=audio`;
        
        let iconClass = platform === 'jiosaavn' ? "fa-solid fa-play text-gray-500 group-hover:text-cyan-400" : "fa-brands fa-youtube text-gray-500 group-hover:text-red-500";
        let borderClass = platform === 'jiosaavn' ? "hover:border-purple-500" : "hover:border-red-500";

        // 🔥 Platform tracking added for Radio Engine
        formattedPlaylist.push({ name: title, artist: artist, image: imgUrl, url: audioUrl, platform: platform });

        const li = document.createElement('li');
        li.className = `flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition cursor-pointer border border-transparent ${borderClass} group`;
        li.innerHTML = `
            <div class="flex items-center space-x-3.5 w-[85%]">
                <img src="${imgUrl}" class="w-12 h-12 rounded-lg object-cover shadow-md border border-gray-700 transition-colors">
                <div class="truncate">
                    <h3 class="text-white text-sm font-bold truncate w-full tracking-wide">${title}</h3>
                    <p class="text-[11px] text-gray-400 mt-0.5 truncate">${artist}</p>
                </div>
            </div>
            <i class="${iconClass} p-2 transition-colors drop-shadow-md"></i>
        `;

        li.addEventListener('click', () => {
            if (typeof setQueueAndPlay === "function") setQueueAndPlay(formattedPlaylist, index);
        });
        searchResults.appendChild(li);
    });
}

function showError(msg) {
    searchResults.innerHTML = `<li class="text-center text-red-500 text-xs py-4 tracking-widest font-bold">${msg}</li>`;
}

// 📻 RADIO ENGINE: Background me related songs laane wala function
async function fetchRelatedSongs(artistName, platform) {
    try {
        let targetUrl = platform === 'jiosaavn' ? JIOSAAVN_API + encodeURIComponent(artistName) : `${YT_RAILWAY_API}/search?query=${encodeURIComponent(artistName)}`;
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

        // Chupchap player.js ko naye gaane bhej do
        if (typeof appendToQueue === "function" && newPlaylist.length > 0) {
            appendToQueue(newPlaylist);
        }
    } catch (e) {
        console.log("Auto-Radio Error: ", e);
    }
}
