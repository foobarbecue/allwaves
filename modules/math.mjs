export function getClosestIndex(a, x) {
  // This is a binary search, returning the index of the value just below the input x using the list a
  var low = 0,
    hi = a.length - 1;
  while (hi - low > 1) {
    var mid = Math.round((low + hi) / 2);
    if (a[mid] <= x) {
      low = mid;
    } else {
      hi = mid;
    }
  }
  if (a[low] == x) hi = low;
  console.log(
    "closest value to " +
      new Date(x) +
      " is " +
      new Date(a[low]) +
      " at index " +
      low,
  );
  return low;
}

/**
 * Given a time trackStartTime as a js Date object, a video number vidNum and vidTimeMS in milliseconds, return UTC time
 * @param {Date} trackStartTime
 * @param {number} vidNum The soloshot splits up output into roughly 10 minute videos. This is the sequential numerical index of those video sections.
 * @param {number} vidTimeMS
 */
export function vidTimeToUTC(trackStartTime, vidNum, vidTimeMS) {
  const ssVidLengthMS = 623623;
  return new Date(
    trackStartTime.getTime() + vidNum * ssVidLengthMS + vidTimeMS * 1000,
  );
}

export function utcToSStimestamp(trackStartTime, ssTimestamp) {
  return new Date(ssTimestamp - trackStartTime);
}

/**
 * Given a video title in the format 'SS3 TRACK VIDEO 2024 02 10 080301 5', return a Date object
 * @param vidTitle
 */
export function vidTitleToTrackStartTime(vidTitle) {
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
    console.error("Video title format is incorrect.");
    return null;
  }
}

/**
 * Given a video title in the format 'SS3 TRACK VIDEO 2024 02 10 080301 5', return 5, the video sequence number
 * @param vidTitle
 */
export function vidTitleToVidNumber(vidTitle) {
  return vidTitle.match(/.* (\d*)$/)[1];
}

export function triangularMA_uneven(t, v, windowRadius) {
  // t: array of timestamps (sorted)
  // v: array of values
  // windowRadius: half-width of the window in time units

  const result = [];

  for (let i = 0; i < t.length; i++) {
    const center = t[i];
    let sum = 0;
    let weightSum = 0;

    // Look left
    for (let j = i; j >= 0 && center - t[j] <= windowRadius; j--) {
      const dist = Math.abs(t[j] - center);
      const weight = 1 - dist / windowRadius;
      sum += v[j] * weight;
      weightSum += weight;
    }

    // Look right (skip center since we already counted it)
    for (let j = i + 1; j < t.length && t[j] - center <= windowRadius; j++) {
      const dist = Math.abs(t[j] - center);
      const weight = 1 - dist / windowRadius;
      sum += v[j] * weight;
      weightSum += weight;
    }

    result.push(sum / weightSum);
  }

  return result;
}