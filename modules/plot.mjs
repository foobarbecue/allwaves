import "https://cdn.plot.ly/plotly-3.1.2.min.js"
import {loadAndParseSession} from "./parse_session.mjs";
import {getClosestIndex} from "./math.mjs";
import proj4 from 'https://cdn.jsdelivr.net/npm/proj4@2.9.2/+esm'
import {seshDate, seshTimestampCache, seshGeodataCache} from "./data.js";


// TODO use cache
const getTagCoordsForPlot = (tagId, sesh) => {
    const tagSesh = sesh.locations.filter(
        (datum) => datum.tagId == tagId
    )
    const moveDists = [];
    const moveDurations = [];
    const moveSpeeds = [];
    const moveTimes = [];
    const tagLocnsUTM = tagSesh.map(
        // Convert to meters in UTM 11N
        locn => proj4(
            'EPSG:4326',
            '+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs +type=crs',
            [locn.tagPosition.longitude, locn.tagPosition.latitude, locn.tagPosition.elevation])
    )
    for (let ind = 0; ind < tagLocnsUTM.length - 1; ind++) {
        moveDists.push(
            Math.sqrt((tagLocnsUTM[ind + 1][0] - tagLocnsUTM[ind][0]) ** 2 + (tagLocnsUTM[ind + 1][1] - tagLocnsUTM[ind][1]) ** 2)
        );
        moveDurations.push(
            tagSesh[ind + 1].timestamp - tagSesh[ind].timestamp
        );
        moveSpeeds.push(
            moveDists[ind] / (moveDurations[ind] * 1000)
        );
        moveTimes.push(
            tagSesh[ind].timestamp
        )
    }

    document.querySelector("#wave-plot-title").textContent = `Mapping: ${seshDate}`;

    const distsPlot = [{
        y: moveDists,
        x: moveTimes.map(timestamp => new Date(timestamp)),
        name: `Tag ${tagId}: speed`
    }]

    // const locnPlot = {
    //     y: tagLocnsUTM.map(locn => locn.y),
    //     x: tagLocnsUTM.map(locn => locn.x)
    // }

    return distsPlot;
}


export async function plotSession(seshDate) {
    const sesh = await loadAndParseSession(
        `seshfiles/SS3_EDIT_${seshDate.replaceAll(" ", "_")}.SESSION`
    );
    // find all tag ids
    const tagIds = sesh.locations.map(locn => locn.tagId)
    const tagIdsSet = new Set(tagIds)

    const locnPlot = getTagCoordsForPlot(tagIdsSet.entries().toArray()[0][0], sesh)
    const layout = {title: {text: 'Speed'}, showLegend: true, xaxis:{tickformat: '%H:%M'}}
    await Plotly.newPlot('wave-plot', locnPlot, layout)
}

export function setTimebarToTime(timelist, time){
    const plot = document.getElementById('wave-plot');
    const wptTimeIdx = getClosestIndex(timelist, time.getTime())
    if (wptTimeIdx === null || wptTimeIdx === undefined || Number.isNaN(Number(wptTimeIdx))) {
        // Clear any vertical line
        Plotly.relayout(plot, { shapes: [] })
        return
    }

    const x = Number(timelist[wptTimeIdx])
    const timebar = {
        type: 'line',
        x0: x,
        x1: x,
        yref: 'paper',
        y0: 0,
        y1: 1,
        line: { color: 'red', width: 2}
    }
    Plotly.relayout(plot, { shapes: [timebar] })
}