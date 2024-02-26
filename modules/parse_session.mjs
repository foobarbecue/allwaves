// Based on https://github.com/maiermic/soloshot-session-to-gpx-converter/blob/master/index.html
// as retrieved on 2023-11-13

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

    readTimestamp(){
        return hexToSignedInt(bufferToHex(this.read(8)))
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

async function parseSession(sessionReader){
        const session = [];
        const r = new ByteReader(sessionReader);
        const enc = new TextDecoder();
            assert(enc.decode(r.read(4)) === 'SOLO', 'Invalid session file. Expected file content to start with "SOLO"');
            r.read(12);
            const TYPE_ID_LENGTH = 1;
            const DATA_LENGTH = 1;
            const HEADER_LENGTH = 2;
            const TYPE_PREFIX = 170;
            let previousTagId = null;
            while (!r.isEnd()) {
                assert(r.read(1)[0] === TYPE_PREFIX, 'Unexpected file content. Expected type prefix, but got something else');
                const typeId = bufferToHex(r.read(TYPE_ID_LENGTH));
                const dataLength = parseInt(bufferToHex(r.read(DATA_LENGTH)), 16);
                const header = bufferToHex(r.read(HEADER_LENGTH));
                const timestamp = r.readTimestamp();
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
                        session.push({tagId, basePosition, tagPosition, timestamp})
                        r.read(10);
                        previousTagId = tagId;
                        break;
                    default:
                        throw `Unexpected file content. Unknown type ID: ${typeId}`;
                }
            }
        return session
}

export async function loadAndParseSession(url){
    const fileResp = await fetch(url)
    const blob = await fileResp.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const sessionData = await parseSession(arrayBuffer);
    return sessionData;
}