import "https://cdn.plot.ly/plotly-3.1.2.min.js"
import {loadAndParseSession} from "./parse_session.mjs";
import proj4 from 'https://cdn.jsdelivr.net/npm/proj4@2.9.2/+esm'


const getTagCoordsForPlot = (tagId, sesh) => {
    const tagSesh = sesh.locations.filter(
        (datum) => datum.tagId == tagId
    )
    const moveDists = [];
    const moveDurations = [];
    const moveSpeeds = [];
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
    }

    const distsPlot = [{
        y: moveDists,
        x: [...Array(moveDists.length).keys()]
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

    await Plotly.newPlot('wave-plot', locnPlot)
}