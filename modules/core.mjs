import {loadAndParseSession} from "./parse_session.mjs";
import {setMapContents} from "./wave_map.mjs";

export const seshGeodataCache = {};
export const seshTimestampCache = {};

export async function drawGeodataForDay(seshDate, seshGeodataCache, seshTimestampCache){
    // seshDate should be a string like "2023 08 20"
    if (! seshGeodataCache.hasOwnProperty(seshDate)){
        const seshData = await loadAndParseSession(
            `seshfiles/SS3_EDIT_${seshDate.replaceAll(" ","_")}.SESSION`
        );
        if (!seshData){
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
            if (!seshDataByTag.hasOwnProperty(datum.tagId)){
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