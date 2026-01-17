import "https://cdn.plot.ly/plotly-3.1.2.min.js";
import { getClosestIndex } from "./math.mjs";
import proj4 from "https://cdn.jsdelivr.net/npm/proj4@2.9.2/+esm";
import { seshDate, seshTimestampCache, seshGeodataCache } from "./data.js";

const getTagCoordsForPlot = (tagId) => {
  const moveDists = [];
  const moveDurations = [];
  const moveSpeeds = [];
  const moveTimes = [];
  const geoData = seshGeodataCache[seshDate][tagId];
  const timeData = seshTimestampCache[seshDate][tagId];
  const tagLocnsUTM = geoData.map(
      // Convert to meters in UTM 11N
      (locn) =>
          proj4(
              "EPSG:4326",
              "+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs +type=crs",
              [locn[1], locn[0]],
          ),
  );


  for (let ind = 0; ind < tagLocnsUTM.length - 1; ind++) {
    // Calculate motion distance between each sample (meters)
    moveDists.push(
        Math.sqrt(
            (tagLocnsUTM[ind + 1][0] - tagLocnsUTM[ind][0]) ** 2 +
            (tagLocnsUTM[ind + 1][1] - tagLocnsUTM[ind][1]) ** 2,
        ),
    );

    // Calculate time elapsed between each sample (milliseconds)
    moveDurations.push(timeData[ind + 1] - timeData[ind]);

    // Calculate speed at sample (meters / second)
    moveSpeeds.push(moveDists[ind] / (moveDurations[ind] / 1000));

    moveTimes.push(timeData[ind]);
  }

  // Create blacklist of samples that have less than 100ms spacing
  const moveSpeedsNoShortdur = moveSpeeds.filter((el, ind)=>190 < moveDurations[ind] && moveDurations[ind] < 210)
  const moveTimesNoShortdur = moveTimes.filter((el, ind)=>190 < moveDurations[ind] && moveDurations[ind] < 210)

  document.querySelector("#wave-plot-title").textContent =
      `Mapping: ${seshDate}`;

  const speedsPlot = {
    y: moveSpeeds,
    // y: [...Array(moveTimes.length).keys()],
    x: moveTimes.map((timestamp) => new Date(timestamp)),
    name: `Tag ${tagId}: speed`,
    // mode: 'lines+markers'
  };

  // const locnPlot = {
  //     y: tagLocnsUTM.map(locn => locn.y),
  //     x: tagLocnsUTM.map(locn => locn.x)
  // }
  return speedsPlot;
};

export async function plotSession() {
  const plotData = [];
  const firstTagId = Object.keys(seshGeodataCache[seshDate])[0];
  for (const tagId in seshGeodataCache[seshDate]) {
    plotData.push(getTagCoordsForPlot(tagId));
  }
  const layout = {
    title: { text: "Speed" },
    showLegend: true,
    xaxis: { tickformat: "%H:%M:%S" },
    autoSize: true
  };
  await Plotly.newPlot("wave-plot", plotData, layout, { responsive: true });
}

export function setTimebarToTime(timelist, time) {
  const plot = document.getElementById("wave-plot");
  const wptTimeIdx = getClosestIndex(timelist, time.getTime());
  if (
      wptTimeIdx === null ||
      wptTimeIdx === undefined ||
      Number.isNaN(Number(wptTimeIdx))
  ) {
    // Clear any vertical line
    Plotly.relayout(plot, { shapes: [] });
    return;
  }

  const x = Number(timelist[wptTimeIdx]);
  const timebar = {
    type: "line",
    x0: x,
    x1: x,
    yref: "paper",
    y0: 0,
    y1: 1,
    line: { color: "red", width: 2 },
  };
  Plotly.relayout(plot, { shapes: [timebar] });
}
