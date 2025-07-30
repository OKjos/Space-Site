function pad(num) {
  return num.toString().padStart(2, '0');
}

// Accept a Date object and format it
function getTimestampStr(date) {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minutes = Math.floor(date.getUTCMinutes() / 5) * 5;
  const min = pad(minutes);

  return `${year}-${month}-${day}_${hour}${min}`;
}

async function imgExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function loadLatestImg() {
  let now = new Date();

  // Round down current time to nearest 5 minutes exactly
  now.setUTCMinutes(Math.floor(now.getUTCMinutes() / 5) * 5, 0, 0);

  const maxMinutesBack = 30; // Look back up to 30 minutes
  for (let minutesBack = 0; minutesBack <= maxMinutesBack; minutesBack += 5) {
    const checkDate = new Date(now.getTime() - minutesBack * 60000);
    const timestampStr = getTimestampStr(checkDate);
    const northUrl = `https://services.swpc.noaa.gov/images/animations/ovation/north/aurora_N_${timestampStr}.jpg`;
    const southUrl = `https://services.swpc.noaa.gov/images/animations/ovation/south/aurora_S_${timestampStr}.jpg`;

    const northExist = await imgExists(northUrl);
    const southExist = await imgExists(southUrl);

    if (northExist || southExist) {
      if (northExist) document.getElementById('northHem').src = northUrl;
      if (southExist) document.getElementById('southHem').src = southUrl;
      return;
    }
  }
}

// Initial load
loadLatestImg();

// Refresh every 5 minutes
setInterval(loadLatestImg, 5 * 60 * 1000);