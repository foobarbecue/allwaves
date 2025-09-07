import { parseSession } from '../modules/parse_session.mjs';
import * as fs from 'node:fs';
import tc from 'transform-coordinates';
import { plot } from 'nodeplotlib';

// Parse session
const seshFileData = fs.readFileSync('C:\\Users\\aaron\\IdeaProjects\\allwaves\\seshfiles\\orig\\SS3_EDIT_2025_08_17_083422.SESSION')
const sesh = await parseSession(seshFileData);

// Convert to meters in UTM 11N
const transform = tc('EPSG:4326', 'EPSG:32611');

const tagLocnsUTM = sesh.locations.map(
    locn => transform.forward(
        {x: locn.tagPosition.latitude, y: locn.tagPosition.longitude, z: locn.tagPosition.elevation}
    )
)

const moveDists = [];
const moveDurations = [];
const moveSpeeds = [];
for (let ind=0; ind < tagLocnsUTM.length-1; ind++) {
    moveDists.push(
        Math.sqrt((tagLocnsUTM[ind + 1].x - tagLocnsUTM[ind].x) ** 2 + (tagLocnsUTM[ind + 1].y - tagLocnsUTM[ind].y) ** 2)
    );
    moveDurations.push(
        sesh.locations[ind+1].timestamp - sesh.locations[ind+1].timestamp
    );
    moveSpeeds.push(
        moveDurations[ind] / moveDists[ind]
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

