import * as leaflet from "https://unpkg.com/leaflet/dist/leaflet-src.esm.js";

const colorPalette = ['black', 'blue', 'green', 'red', 'black', 'orange']

export async function setMapContents(wptList, timestampList, waveMap) {
    // clear all previously loaded tag tracks
    for (let lyrId in waveMap._layers) {
        if (waveMap._layers[lyrId]?.options?.kindOfLayer == 'tagtrack') {
            waveMap.removeLayer(waveMap._layers[lyrId])
        }
    }

    // add tag track and time highlight layers
    const tagTracks = leaflet.featureGroup();
    const timeHighlights = leaflet.featureGroup();
    for (let tagId in wptList) {
        const seshPolyline = leaflet.polyline(
            wptList[tagId],
            {color: colorPalette[tagId], kindOfLayer: 'tagtrack', wptTimes: timestampList[tagId]}
        );
        tagTracks.addLayer(seshPolyline);
        const highlightPolyline = leaflet.polyline(
            wptList[tagId].slice(0, 100),
            {color: 'red', kindOfLayer: 'timehighlight'}
        );
        timeHighlights.addLayer(highlightPolyline)
        // store a reference to the highlight layer in the tag track layer
        seshPolyline.options['timeHighlightLayer'] = highlightPolyline
    }
    tagTracks.addTo(waveMap);
    waveMap.tagTracks = tagTracks;
    timeHighlights.addTo(waveMap)
    waveMap.timeHighlights = timeHighlights
    waveMap.fitBounds(tagTracks.getBounds())
}

/**
 * Given a time trackStartTime as a js Date object, a video number vidNum and vidTimeMS in milliseconds, return UTC time
 * @param {Date} trackStartTime
 * @param {number} vidNum
 * @param {number} vidTimeMS
 */
function vidTimeToUTC(trackStartTime, vidNum, vidTimeMS) {
    const ssVidLengthMS = 623623;
    return new Date(trackStartTime.getTime() + vidNum * ssVidLengthMS + vidTimeMS * 1000);
}

function utcToSStimestamp(trackStartTime, ssTimestamp) {
    return new Date(ssTimestamp - trackStartTime)
}

function getClosestIndex(a, x) {
    // This is a binary search, returning the index of the value just below the input x using the list a
    var low = 0, hi = a.length - 1;
    while (hi - low > 1) {
        var mid = Math.round((low + hi) / 2);
        if (a[mid] <= x) {
            low = mid;
        } else {
            hi = mid;
        }
    }
    if (a[low] == x) hi = low;
    console.log('closest value to ' + new Date(x) + ' is ' + new Date(a[low]) + ' at index ' + low)
    return low
}

function setMarkerToTime(time, waveMap) {
    for (const layerId in waveMap.tagTracks._layers) {
        const trackLayer = waveMap.tagTracks._layers[layerId]
        const wptTimeIdx = getClosestIndex(trackLayer.options.wptTimes, time.getTime())
        waveMap.presentLoc.setLatLng(trackLayer._latlngs[wptTimeIdx])

        // also highlight a section of the track before and after the current time
        const startInd = wptTimeIdx - 100;
        const endInd = wptTimeIdx + 100;
        const highlightedLatLngs = trackLayer._latlngs.slice(startInd, endInd)
        trackLayer.options.timeHighlightLayer.setLatLngs(highlightedLatLngs)
    }
}

/**
 * Given a video title in the format 'SS3 TRACK VIDEO 2024 02 10 080301 5', return a Date object
 * @param vidTitle
 */
function vidTitleToTrackStartTime(vidTitle) {
    // Use a regular expression to extract the date and time components from the title
    // The expected format is "SS3 TRACK VIDEO YYYY MM DD HHMMSS"
    const regex = /VIDEO (\d{4}) (\d{2}) (\d{2}) (\d{2})(\d{2})(\d{2})/;
    const match = vidTitle.match(regex);

    if (match) {
        // Extract the year, month, day, hour, minute, and second from the regex match
        const year = parseInt(match[1], 10);
        // Subtract 1 from month because JavaScript months are 0-indexed
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        const hour = parseInt(match[4], 10);
        const minute = parseInt(match[5], 10);
        const second = parseInt(match[6], 10);

        // Create and return the Date object
        return new Date(year, month, day, hour, minute, second);
    } else {
        // Return null or throw an error if the format does not match
        console.error('Video title format is incorrect.');
        return null;
    }
}

/**
 * Given a video title in the format 'SS3 TRACK VIDEO 2024 02 10 080301 5', return 5, the video sequence number
 * @param vidTitle
 */
function vidTitleToVidNumber(vidTitle) {
    return vidTitle.match(/.* (\d*)$/)[1]
}

export function makeMap() {
    const waveMap = leaflet.map('wave-map');
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 30,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(waveMap);
    waveMap.fitWorld();
    const presentLoc = new leaflet.marker([0, 0]);
    waveMap.addLayer(presentLoc)
    waveMap.presentLoc = presentLoc;
    waveMap.tagTracks = [];

    // adding a currenttime event to yt player based on https://codepen.io/zavan/pen/PoGQWmG , so we can update the map
    const playerWindow = player.getIframe().contentWindow;
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
    return waveMap
}