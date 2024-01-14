import * as leaflet from "https://unpkg.com/leaflet/dist/leaflet-src.esm.js";

export function makeMap(){
    const waveMap = leaflet.map('wave-map');
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(waveMap);
    return waveMap
}

export async function setMapContents(wptListPr, waveMap){
    wptListPr.then(wptList => {
        const coords = wptList.map(
            wpt => [wpt.tagPosition.latitude, wpt.tagPosition.longitude]
        )
        const seshPolyline = leaflet.polyline(coords)
        seshPolyline.addTo(waveMap)
        waveMap.fitBounds(seshPolyline.getBounds())
    });
}