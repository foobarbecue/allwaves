import "https://cdn.plot.ly/plotly-3.1.2.min.js";
import { getClosestIndex } from "./math.mjs";
import proj4 from "https://cdn.jsdelivr.net/npm/proj4@2.9.2/+esm";
import { seshDate, seshTimestampCache, seshGeodataCache } from "./data.js";
import { findWaves } from "./math.mjs";

const getSpeedData = (tagId) => {
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
      `Plotting: ${seshDate}`;



  return {moveSpeedsNoShortdur, moveTimesNoShortdur}
};

export async function plotSession() {
  const firstTagId = Object.keys(seshGeodataCache[seshDate])[0];
  const speedsData = getSpeedData(firstTagId);
  const waveIndices = findWaves(speedsData.moveSpeedsNoShortdur, 2.5, 10)
  const moveTimes = speedsData.moveTimesNoShortdur.map((timestamp) => new Date(timestamp))
  const plotData = {
    y: speedsData.moveSpeedsNoShortdur,
    x: moveTimes,
    name: `Tag ${firstTagId}: speed`
  };
  const waveRects = waveIndices.map((wave)=>{
    return {
      type: "rect",
      x0: moveTimes[wave[0]],
      x1: moveTimes[wave[1]],
      xref: "x",
      yref: "paper",
      y0: 0,
      y1: 1,
      fillcolor: 'red',
      opacity: 0.3,
      line: {
        width: 0
      }
    }
  });

  // Add a placeholder shape at index 0 for the timebar. Will be updated later using setTimebarToTime.
  const shapes = [{
    type: "line",
    x0: moveTimes[0],
    x1: moveTimes[0],
    yref: "paper",
    y0: 0,
    y1: 1,
    line: { color: "black", width: 2 },
  }].concat(waveRects)

  const layout = {
    title: { text: "Speed" },
    showLegend: true,
    xaxis: { tickformat: "%H:%M:%S", rangeslider: {} },
    autoSize: true,
    shapes: shapes
  };

  await Plotly.newPlot("wave-plot", [plotData], layout, { responsive: true });

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
  Plotly.relayout(plot, { 'shapes[0].x0': x, 'shapes[0].x1': x});
}
