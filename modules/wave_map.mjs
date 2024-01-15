import * as leaflet from "https://unpkg.com/leaflet/dist/leaflet-src.esm.js";

const colorPalette = ['black', 'blue', 'green']

export function makeMap(){
    const waveMap = leaflet.map('wave-map');
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(waveMap);
    waveMap.fitWorld();
    return waveMap
}

export async function setMapContents(wptList, waveMap){
    const tagTracks = leaflet.featureGroup();
    for (let tagId in wptList){
        const seshPolyline = leaflet.polyline(
            wptList[tagId],
            {color: colorPalette[tagId]}
        );
        tagTracks.addLayer(seshPolyline);
    }
    tagTracks.addTo(waveMap);
    leaflet.control.layers().addTo(waveMap);
    waveMap.fitBounds(tagTracks.getBounds());
}