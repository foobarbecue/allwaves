import { loadAndParseSession } from "./parse_session.mjs"
import {makeMap, setMapContents} from "./wave_map.mjs";
// Yeah, I know this is an unsecured API key. Sooner or later I suppose some miscreant will max out my requests on it. Shrug.
const api_key = "AIzaSyA8bV-BGblDIk6m61vjmbI5ugf6gBSKnO0";

const get_playlists = async () => {
  const resp = await fetch(
    `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&channelId=UCVeahPBre3Q1vC19I5WYP-Q&maxResults=50&key=${api_key}`,
  );
  return await resp.json();
};

const seshGeodataCache = {};
const seshTimestampCache = {};

const getVids = async () => {
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
        vid_li.textContent = vid.snippet.title;
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
      window.player.loadVideoById(playlist_vid.snippet.resourceId.videoId, tot_secs);
      drawGeodataForDay(
          (/\d{4} \d\d \d\d/.exec(playlist_vid.snippet.title))[0]
      );
    };
    description.appendChild(wave_li);

  });
  return description;
};

async function drawGeodataForDay(seshDate){
  // seshDate should be a string like "2023 08 20"
  if (! seshGeodataCache.hasOwnProperty(seshDate)){
    const seshData = await loadAndParseSession(
        `seshfiles/SS3_EDIT_${seshDate.replaceAll(" ","_")}.SESSION`
    );
    const seshDataByTag = {};
    const timeStampsByTag = {};
    seshData.locations.map(datum => {
      if (!seshDataByTag.hasOwnProperty(datum.tagId)){
        seshDataByTag[datum.tagId] = [];
        timeStampsByTag[datum.tagId] = [];
      }
      seshDataByTag[datum.tagId].push([datum.tagPosition.latitude, datum.tagPosition.longitude]);
      let timeAdj = document.querySelector("#time-adj").value;
      timeAdj = timeAdj ? timeAdj : 0;
      timeStampsByTag[datum.tagId].push(
          seshData.absTimestamps.slice(-1)[0] + datum.timestamp - seshData.locations[0].timestamp + timeAdj * 1000
      )
    })
    seshGeodataCache[seshDate] = seshDataByTag;
    seshTimestampCache[seshDate] = timeStampsByTag;
  }
  await setMapContents(seshGeodataCache[seshDate], seshTimestampCache[seshDate], waveMap)
}

window.onYouTubeIframeAPIReady = ()=>{
  console.debug('setting up youtube iframe player')
  window.player = new YT.Player("wave-video", {
    playerVars: {
      playsinline: 1,
    },
  });
  window.waveMap = makeMap();
  getVids();
  drawGeodataForDay("2023 10 10");
}

const toggleMapCollapse = () => {
  document.getElementById("wave-map").classList.toggle("collapsed");
  document.getElementById("wave-video").classList.toggle("fullheight");
}

const toggleVideoCollapse = () => {
  document.getElementById("wave-video").classList.toggle("collapsed");
  document.getElementById("wave-map").classList.toggle("fullheight");
}

const toggleListCollapse = () => {
  document.getElementById("wave-list").classList.toggle("collapsed");
}
document.getElementById("wave-map-titlebar").onclick = toggleMapCollapse;
document.getElementById("wave-video-titlebar").onclick = toggleVideoCollapse;
document.getElementById("wave-list-titlebar").onclick = toggleListCollapse;
