import {setupUiEvtHdlrs} from "./ui.mjs";
import {loadAndParseSession} from "./parse_session.mjs";
import {makeMap, setMapContents, setMarkerToTime} from "./wave_map.mjs";
import {plotSession} from "./plot.mjs";

export const seshGeodataCache = {};
export const seshTimestampCache = {};

export async function drawGeodataForDay(seshDate, seshGeodataCache, seshTimestampCache) {
    // seshDate should be a string like "2023 08 20"
    if (!seshGeodataCache.hasOwnProperty(seshDate)) {
        const seshData = await loadAndParseSession(
            `seshfiles/SS3_EDIT_${seshDate.replaceAll(" ", "_")}.SESSION`
        );
        if (!seshData) {
            document.querySelector("#wave-map-title").textContent = `Mapping: no data for ${seshDate}`;
            document.getElementById("wave-map").classList.add("collapsed")
            document.getElementById("wave-plot").classList.add("collapsed")
            return
        } else {
            document.querySelector("#wave-map-title").textContent = `Mapping: ${seshDate}`;
            // I'm not sure if we want to automatically show this when it's available
            // or if it should be per user request
            // document.getElementById("wave-map").classList.remove("collapsed")
            // document.getElementById("wave-plot").classList.remove("collapsed")
        }
        const seshDataByTag = {};
        const timeStampsByTag = {};
        seshData.locations.map(datum => {
            if (!seshDataByTag.hasOwnProperty(datum.tagId)) {
                seshDataByTag[datum.tagId] = [];
                timeStampsByTag[datum.tagId] = [];
            }
            seshDataByTag[datum.tagId].push([datum.tagPosition.latitude, datum.tagPosition.longitude]);
            timeStampsByTag[datum.tagId].push(
                seshData.absTimestamps.slice(-1)[0] + datum.timestamp - seshData.locations[0].timestamp
            )
        })
        seshGeodataCache[seshDate] = seshDataByTag;
        seshTimestampCache[seshDate] = timeStampsByTag;
    }
    await setMapContents(seshGeodataCache[seshDate], seshTimestampCache[seshDate], window.waveMap)
}

// Yeah, I know this is an unsecured API key. Sooner or later I suppose some miscreant will max out my requests on it. Shrug.
const api_key = "AIzaSyA8bV-BGblDIk6m61vjmbI5ugf6gBSKnO0";

const get_playlists = async () => {
    const resp = await fetch(
        `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&channelId=UCVeahPBre3Q1vC19I5WYP-Q&maxResults=50&key=${api_key}`,
    );
    return await resp.json();
};

const getVids = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const seshDate = urlParams.get('seshDate')
    const playlists = await get_playlists();
    for (const playlist of playlists.items) {
        const resp = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlist.id}&key=${api_key}`,
        );
        const playlist_itemlist = await resp.json();
        if (playlist.snippet.title.includes("surfing")) {
            const pl_li = document.createElement("li");
            pl_li.textContent = playlist.snippet.title;
            pl_li.appendChild(document.createElement("ul"));
            pl_li.id = playlist.id;
            document.querySelector("#wave-list>ul").appendChild(pl_li);
            for (const vid of playlist_itemlist.items) {
                const vid_li = document.createElement("li");
                const vid_li_a = document.createElement("a");
                vid_li_a.textContent = vid.snippet.title;
                vid_li_a.href = "javascript:;";
                vid_li_a.onclick = () => {
                    const seshDate = /\d{4} \d\d \d\d/.exec(vid.snippet.title)[0]
                    document.querySelector("#wave-video-title").textContent = `Playing video: ${vid.snippet.title}`;
                    window.player.loadVideoById(vid.snippet.resourceId.videoId);
                    drawGeodataForDay(seshDate, seshGeodataCache, seshTimestampCache);
                    plotSession(seshDate);
                }
                vid_li.appendChild(vid_li_a)
                pl_li.querySelector("ul").appendChild(vid_li);
                const desc_ul = await formatDescription(vid);
                vid_li.appendChild(desc_ul);
            }
        }
    }
};

const formatDescription = async (playlist_vid) => {
    const description = document.createElement("ul");
    const waves = playlist_vid.snippet.description.trim().split("\n");
    // ignore anything that doesn't have a time (check for :) or "No waves"
    const waves_filtered = waves.filter((wave) => wave.includes(":"));
    waves_filtered.map((wave) => {
        const wave_li = document.createElement("li");
        const wave_li_a = document.createElement("a");
        wave_li.appendChild(wave_li_a);
        wave_li_a.textContent = wave.replace("- ", "");
        wave_li_a.href = "javascript:;";
        wave_li_a.onclick = () => {
            const wave_time_re = /(\d\d):(\d\d)/.exec(wave);
            const mins = Number(wave_time_re[1]);
            const secs = Number(wave_time_re[2]);
            const tot_secs = mins * 60 + secs;
            const seshDate = /\d{4} \d\d \d\d/.exec(playlist_vid.snippet.title)[0]
            document.querySelector("#wave-video-title").textContent = `Playing video: ${playlist_vid.snippet.title}`;
            window.player.loadVideoById(playlist_vid.snippet.resourceId.videoId, tot_secs);
            drawGeodataForDay(seshDate, seshGeodataCache, seshTimestampCache);
            plotSession(seshDate);
        };
        description.appendChild(wave_li);

    });
    return description;
};

const setupTimechangeEvtHdlr = ()=>{
// adding a currenttime event to yt player based on https://codepen.io/zavan/pen/PoGQWmG , so we can update the map
    const playerWindow = window.player.getIframe().contentWindow;
    window.addEventListener("message", function (evt) {
        if (evt.source === playerWindow) {
            const data = JSON.parse(evt.data)
            if (
                data.event === "infoDelivery" &&
                data.info &&
                data.info.currentTime
            ) {
                const trackStartTime = vidTitleToTrackStartTime(player.videoTitle)
                const vidNumber = vidTitleToVidNumber(player.videoTitle)
                let timeAdj = document.querySelector("#time-adj").value;
                timeAdj = timeAdj ? Number(timeAdj) : 0;
                const adjustedYTtime = data.info.currentTime + timeAdj
                const latestTime = vidTimeToUTC(trackStartTime, vidNumber - 1, adjustedYTtime)
                setMarkerToTime(latestTime, waveMap)
            }
        }
    })
}

window.onYouTubeIframeAPIReady = () => {
    console.debug('setting up youtube iframe player')
    window.player = new YT.Player("wave-video", {
        playerVars: {
            playsinline: 1,
        },
    });
    window.waveMap = makeMap();
    setupTimechangeEvtHdlr();
}

getVids();
setupUiEvtHdlrs();