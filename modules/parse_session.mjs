// Based on https://github.com/maiermic/soloshot-session-to-gpx-converter/blob/master/index.html
// On 2023-11-13

function toHex(number) {
    return number.toString(16).padStart(2, "0");
}

// https://stackoverflow.com/a/49404499/1065654
function hexToSignedInt(hex) {
    if (hex.length % 2 !== 0) {
        hex = "0" + hex;
    }
    let num = parseInt(hex, 16);
    const maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal
    }
    return num;
}

function bufferToHex(buffer) {
    return Array
        .from(buffer)
        .map(b => toHex(b))
        .join('');

}

function assert(condition, message) {
    if (!condition) {
        throw message;
    }
}

class ByteReader {
    constructor(buffer) {
        this._data = new Uint8Array(buffer);
        this._index = 0;
    }

    read(length) {
        const start = this._index;
        this._index += length;
        return this._data.subarray(start, this._index);
    }

    readInt() {
        return hexToSignedInt(bufferToHex(this.read(4)));
    }

    readByte() {
        return this.read(1)[0];
    }

    readGpsLocation() {
        return {
            latitude: this.readInt() / 1_000_000,
            longitude: this.readInt() / 1_000_000,
            elevation: this.readInt() / 100,
        }
    }

    isEnd() {
        return this._index >= this._data.length
    }
}

class GpxTrack {

    constructor() {
        this._reset();
    }

    _reset() {
        this.buffer = '  <trk>\n    <trkseg>\n';
    }

    add(pos) {
        this.buffer += [
            `      <trkpt lat="${pos.latitude}" lon="${pos.longitude}">`,
            `        <ele>${pos.elevation}</ele>`,
            '      </trkpt>\n'
        ].join('\n');
    }

    flush() {
        const result = this.buffer + '    </trkseg>\n  </trk>\n';
        this._reset();
        return result;
    }

}


class Gpx {
    constructor() {
        this.buffer = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
        this.buffer += '<gpx version="1.1" creator="">\n';
    }

    addTrack(track) {
        this.buffer += track.flush();
    }

    flush() {
        return this.buffer + '</gpx>\n';
    }
}

export async function parseSeshFile(seshUrl) {
    const seshFile = await fetch(seshUrl)
    if (seshFile.ok){
        const seshBlob = await seshFile.blob()
        const reader = new FileReader();
        reader.onload = function (e) {
            const r = new ByteReader(e.target.result);
            const enc = new TextDecoder();
            try {
                assert(enc.decode(r.read(4)) === 'SOLO', 'Invalid session file. Expected file content to start with "SOLO"');
                r.read(12);
                const TYPE_ID_LENGTH = 1;
                const DATA_LENGTH = 1;
                const HEADER_LENGTH = 10;
                const TYPE_PREFIX = 170;
                const gpx = new Gpx();
                const gpxBaseTrack = new GpxTrack();
                const gpxTagTrack = new GpxTrack();
                let previousTagId = null;
                while (!r.isEnd()) {
                    assert(r.read(1)[0] === TYPE_PREFIX, 'Unexpected file content. Expected type prefix, but got something else');
                    const typeId = bufferToHex(r.read(TYPE_ID_LENGTH));
                    const dataLength = parseInt(bufferToHex(r.read(DATA_LENGTH)), 16);
                    const header = bufferToHex(r.read(HEADER_LENGTH));
                    console.debug(`typeId: ${typeId}, dataLength: ${dataLength}`)
                    switch (typeId) {
                        case '1d':
                        case 'a0':
                        case 'a6':
                        case 'a5':
                        case 'a3':
                        case 'a4':
                            r.read(dataLength);
                            break;
                        case '08':
                            const tagId = r.readByte();
                            const basePosition = r.readGpsLocation();
                            const tagPosition = r.readGpsLocation();
                            r.read(10);
                            gpxBaseTrack.add(basePosition);
                            if (previousTagId !== null && previousTagId !== tagId) {
                                gpx.addTrack(gpxTagTrack)
                            }
                            gpxTagTrack.add(tagPosition);
                            previousTagId = tagId;
                            break;
                        default:
                            throw `Unexpected file content. Unknown type ID: ${typeId}`;
                    }
                }
                gpx.addTrack(gpxTagTrack);
                gpx.addTrack(gpxBaseTrack);
                const blob = new Blob([gpx.flush()], {
                    type: 'application/gpx+xml',
                });
                return blob
            } catch (e) {
                alert(e);
            }
        }
        reader.readAsArrayBuffer(seshBlob);
    };
}