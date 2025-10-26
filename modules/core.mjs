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
    await setMapContents(seshGeodataCache[seshDate], seshTimestampCache[seshDate], window.waveMap)
}