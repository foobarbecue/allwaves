let player;
// Yeah, I know this is an unsecured API key. Sooner or later I suppose some dickhead will max out my requests on it. Shrug.
const api_key = "AIzaSyA8bV-BGblDIk6m61vjmbI5ugf6gBSKnO0";

function onYouTubeIframeAPIReady() {
  player = new YT.Player("wave-video", {
    playerVars: {
      playsinline: 1,
    },
  });
}

const get_playlists = async () => {
  const resp = await fetch(
    `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&channelId=UCVeahPBre3Q1vC19I5WYP-Q&maxResults=25&key=${api_key}`,
  );
  return await resp.json();
};

const get_vids = async () => {
  const playlists = await get_playlists();
  for (const playlist of playlists.items) {
    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist.id}&key=${api_key}`,
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
        const desc_ul = await format_description(vid);
        vid_li.appendChild(desc_ul);
      }
    }
  }
};

const format_description = async (playlist_vid) => {
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
      player.loadVideoById(playlist_vid.snippet.resourceId.videoId, tot_secs);
    };
    description.appendChild(wave_li);
  });
  return description;
};

get_vids();
