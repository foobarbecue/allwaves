import { setTimebarToTime } from "./plot.mjs";
import {
  vidTimeToUTC,
  vidTitleToTrackStartTime,
  vidTitleToVidNumber,
} from "./math.mjs";
import { setMarkerToTime } from "./wave_map.mjs";
import { seshTimestampCache, seshDate } from "./data.js";

/**
 * Updates display widgets (map, plots) with the latest time that the video is seeked to.
 * In addition to ytVidTime, this function also gets data from the DOM:
 *   - Gets the video number from the video title (assumes standard Soloshot 10-min videos)
 *   - Gets the time adjustment from the time adjustment range input element
 * @param ytVidTime Time that the video is showing
 */
export const timechangeEvtHdlr = (ytVidTime) => {
  const trackStartTime = vidTitleToTrackStartTime(player.videoTitle);
  const vidNumber = vidTitleToVidNumber(player.videoTitle);
  let timeAdj = document.querySelector("#time-adj").value;
  timeAdj = timeAdj ? Number(timeAdj) : 0;
  const adjustedYTtime = ytVidTime + timeAdj;
  const latestTime = vidTimeToUTC(
    trackStartTime,
    vidNumber - 1,
    adjustedYTtime,
  );
  setMarkerToTime(latestTime, waveMap);
  // inconsistent signatures between ^ and v . Entire app needs a (OO?) rewrite X-D
  const timestampListPerTag = seshTimestampCache[seshDate];
  for (const tagId in timestampListPerTag) {
    setTimebarToTime(seshTimestampCache[seshDate][tagId], latestTime);
  }
};

export const setupTimechangeEvtHdlr = () => {
  // adding a currenttime event to yt player based on https://codepen.io/zavan/pen/PoGQWmG , so we can update the map
  const playerWindow = window.player.getIframe().contentWindow;
  window.addEventListener("message", function (evt) {
    if (evt.source === playerWindow) {
      const data = JSON.parse(evt.data);
      if (data.event === "infoDelivery" && data.info && data.info.currentTime) {
        timechangeEvtHdlr(data.info.currentTime);
      }
    }
  });
};

export function setupUiEvtHdlrs() {
  document.getElementById("time-adj").oninput = (ev) => {
    document.getElementById("time-adj-disp").innerText = ev.target.value;
    timechangeEvtHdlr(window.player.getCurrentTime());
  };
}
