export const seshGeodataCache = {};
export const seshTimestampCache = {};
export let seshDate;

export function setSeshDate(date) {
  seshDate = date;
}

// It's really about time to add a database
export const timeOffsets = {
  "2026 01 30": {
    1: -17,
    2: -20,
    3: -25,
    4: -26,
    5: -34,
    6: -38
  },
  "2026 01 08": {
    1: -81,
    2: -87,
    3: -86,
    4: -95
  },
  "2026 01 16": {
    2: -27,
    3: -28,
    4: -32,
    5: -39,
    6: -42,
    7: -47
  },
  "2026 01 14": {
    1: -27
  },
  "2026 01 10": {
    2: -35
  }
}