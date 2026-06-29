// ==========================================
// 🧠 YUKI MATRIX - THE ULTIMATE API ENGINE
// ==========================================

// API URLs
const JIOSAAVN_API = "https://jiosavan-lilac.vercel.app/api/search/songs?query=";
const YT_RAILWAY_API = "https://worker-production-1ef8.up.railway.app"; // 🚀 TERA APNA ROOT SERVER

// UI Elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const apiSwitch = document.getElementById('api-switch'); // Toggle Switch

// 🛑 Debounce Logic (Spam rokne ke liye)
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

// 🚀 Main Fetch Engine
async function fetchSongs(query) {
    // Loading Animation
    searchResults.innerHTML = `
        <li class="flex flex-col items-center justify-center py-8">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-cyan-400 mb-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"></i>
            <span class="text-xs text-gray-400 tracking-widest uppercase">ꜱᴇᴀʀᴄʜɪɴɢ ᴍᴀᴛʀɪx...</span>
        </li>`;

    const isYouTube = apiSwitch.checked; 

    if (!isYouTube) {
        // 🥇 JIOSAAVN SEARCH ENGINE
        try {
            const res = await fetch(JIOSAAVN_API + encodeURIComponent(query));
            const data = await res.json();

            if (data.success && data.data.results.length > 0) {
                renderAndQueueSongs(data.data.results, 'jiosaavn');
            } else {
                showError("ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲");
            }
        } catch (error) {
            showError("JioSaavn API ᴇʀʀᴏʀ ᴀᴀ ɢᴀʏᴀ! ☠️");
            console.error(error);
        }
    } else {
        // 🥈 YOUTUBE SEARCH ENGINE (RAILWAY SERVER) 💀🔥
        try {
            const targetUrl = `${YT_RAILWAY_API}/search?query=${encodeURIComponent(query)}`;
            const res = await fetch(targetUrl); 

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Server ${res.status}: ${errText.substring(0, 30)}`);
            }

            const data = await res.json();

            if (data.status === "success" && data.results && data.results.length > 0) {
                renderAndQueueSongs(data.results, 'youtube');
            } else {
                showError("ʏᴏᴜᴛᴜʙᴇ ᴘᴀʀ ᴋᴜᴄʜ ɴᴀʜɪ ᴍɪʟᴀ ʙᴏꜱꜱ! 🥲");
            }
        } catch (error) {
            showError(`⚠️ ᴇʀʀᴏʀ: ${error.name} - ${error.message}`);
        }
    }
}

// 🎨 Render & Prepare Queue Data
function renderAndQueueSongs(songs, platform) {
    searchResults.innerHTML = ''; 
    
    // 1. Array banayenge jo player.js ko samjh aaye
    let formattedPlaylist = [];

    songs.forEach((song, index) => {
        let title, artist, imgUrl, audioUrl, iconClass, borderHoverClass;

        if (platform === 'jiosaavn') {
            title = song.name;
            artist = song.artists?.primary?.length > 0 ? song.artists.primary[0].name : "Unknown Artist";
            imgUrl = song.image?.length > 0 ? song.image[song.image.length - 1].url : "https://telegra.ph/file/default.jpg";
            audioUrl = song.downloadUrl?.length > 0 ? song.downloadUrl[song.downloadUrl.length - 1].url : "";
            iconClass = "fa-solid fa-play text-gray-500 p-2 group-hover:text-cyan-400 transition-colors shadow-cyan";
            borderHoverClass = "hover:border-purple-500";
        } else {
            // YouTube (Railway)
            title = song.title || "Unknown Title"; 
            artist = song.channel || "YouTube"; 
            imgUrl = song.thumbnail || "https://telegra.ph/file/default.jpg";
            audioUrl = `${YT_RAILWAY_API}/stream/${song.id}?type=audio`;
            iconClass = "fa-brands fa-youtube text-gray-500 p-2 group-hover:text-red-500 transition-colors drop-shadow-md";
            borderHoverClass = "hover:border-red-500";
        }

        // 2. Playlist me add karna
        formattedPlaylist.push({
            name: title,
            artist: artist,
            image: imgUrl,
            url: audioUrl
        });

        // 3. UI me HTML element banana (Tera Tailwind Design)
        const li = document.createElement('li');
        li.className = `flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition cursor-pointer border border-transparent ${borderHoverClass} group`;
        li.innerHTML = `
            <div class="flex items-center space-x-3.5 w-[85%]">
                <img src="${imgUrl}" class="w-12 h-12 rounded-lg object-cover shadow-md border border-gray-700 transition-colors">
                <div class="truncate">
                    <h3 class="text-white text-sm font-bold truncate w-full tracking-wide">${title}</h3>
                    <p class="text-[11px] text-gray-400 mt-0.5 truncate">${artist}</p>
                </div>
            </div>
            <i class="${iconClass}"></i>
        `;

        // 4. Click karne par Player ko Queue bhejna
        li.addEventListener('click', () => {
            // Ye line seedha player.js se baat karegi
            if (typeof setQueueAndPlay === "function") {
                setQueueAndPlay(formattedPlaylist, index);
            } else {
                console.error("player.js ka setQueueAndPlay() nahi mila!");
            }
        });

        searchResults.appendChild(li);
    });
}

// Error UI
function showError(msg) {
    searchResults.innerHTML = `<li class="text-center text-red-500 text-xs py-4 tracking-widest font-bold">${msg}</li>`;
}
