import {parseSession} from '../modules/parse_session.mjs';
import * as fs from 'node:fs';
import tc from 'transform-coordinates';
import {plot} from 'nodeplotlib';

const plotTag = (tagId, sesh) => {
    const tagSesh = sesh.locations.filter(
        (datum) => datum.tagId == tagId
    )
    const moveDists = [];
    const moveDurations = [];
    const moveSpeeds = [];
    const tagLocnsUTM = tagSesh.map(
        locn => transform.forward(
            {x: locn.tagPosition.latitude, y: locn.tagPosition.longitude, z: locn.tagPosition.elevation}
        )
    )
    for (let ind = 0; ind < tagLocnsUTM.length - 1; ind++) {
        moveDists.push(
            Math.sqrt((tagLocnsUTM[ind + 1].x - tagLocnsUTM[ind].x) ** 2 + (tagLocnsUTM[ind + 1].y - tagLocnsUTM[ind].y) ** 2)
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
        x: [...Array(moveDists.length).keys()],
        type: 'scatter'
    }]

    const locnPlot = [{
        y: tagLocnsUTM.map(locn => locn.y),
        x: tagLocnsUTM.map(locn => locn.x)
    }]

    plot(distsPlot)
    plot(locnPlot)
// console.log(transform.forward(seshDf.select(tagPosition,0)));
// Calculate speed

}

// Parse session
const seshFileData = fs.readFileSync('C:\\Users\\aaron\\IdeaProjects\\allwaves\\seshfiles\\orig\\SS3_EDIT_2025_08_17_083422.SESSION')
const sesh = await parseSession(seshFileData);

// find all tag ids
const tagIds = sesh.locations.map(locn => locn.tagId)
const tagIdsSet = new Set(tagIds)

// Convert to meters in UTM 11N
const transform = tc('EPSG:4326', 'EPSG:32611');

tagIdsSet.forEach((tagId) => {
    plotTag(tagId, sesh);
})
