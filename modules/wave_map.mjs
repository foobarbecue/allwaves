import * as leaflet from "https://unpkg.com/leaflet/dist/leaflet-src.esm.js";
import { getClosestIndex } from "./math.mjs";
const colorPalette = ["black", "blue", "green", "red", "black", "orange"];

export async function setMapContents(wptList, timestampList, waveMap) {
  // clear all previously loaded tag tracks
  for (let lyrId in waveMap._layers) {
    if (waveMap._layers[lyrId]?.options?.kindOfLayer == "tagtrack") {
      waveMap.removeLayer(waveMap._layers[lyrId]);
    }
  }

  // add tag track and time highlight layers
  const tagTracks = leaflet.featureGroup();
  const timeHighlights = leaflet.featureGroup();
  for (let tagId in wptList) {
    const seshPolyline = leaflet.polyline(wptList[tagId], {
      color: colorPalette[tagId],
      kindOfLayer: "tagtrack",
      wptTimes: timestampList[tagId],
    });
    tagTracks.addLayer(seshPolyline);
    const highlightPolyline = leaflet.polyline(wptList[tagId].slice(0, 100), {
      color: "red",
      kindOfLayer: "timehighlight",
    });
    timeHighlights.addLayer(highlightPolyline);
    // store a reference to the highlight layer in the tag track layer
    seshPolyline.options["timeHighlightLayer"] = highlightPolyline;
  }
  tagTracks.addTo(waveMap);
  waveMap.tagTracks = tagTracks;
  timeHighlights.addTo(waveMap);
  waveMap.timeHighlights = timeHighlights;
  waveMap.fitBounds(tagTracks.getBounds());
}

export function setMarkerToTime(time, waveMap) {
  for (const layerId in waveMap.tagTracks._layers) {
    const trackLayer = waveMap.tagTracks._layers[layerId];
    const wptTimeIdx = getClosestIndex(
      trackLayer.options.wptTimes,
      time.getTime(),
    );
    waveMap.presentLoc.setLatLng(trackLayer._latlngs[wptTimeIdx]);

    // also highlight a section of the track before and after the current time
    const startInd = wptTimeIdx - 100;
    const endInd = wptTimeIdx + 100;
    const highlightedLatLngs = trackLayer._latlngs.slice(startInd, endInd);
    trackLayer.options.timeHighlightLayer.setLatLngs(highlightedLatLngs);
  }
}

export function makeMap() {
  const waveMap = leaflet.map("wave-map");
  leaflet
    .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 30,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
    .addTo(waveMap);
  waveMap.fitWorld();
  const presentLoc = new leaflet.marker([0, 0]);
  waveMap.addLayer(presentLoc);
  waveMap.presentLoc = presentLoc;
  waveMap.tagTracks = [];
  waveMap.zoomControl.setPosition('bottomleft');
  return waveMap;
}
