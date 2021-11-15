// CONSTANTS
const SPEED_DOWN_KEYS = ["-"];
const SPEED_UP_KEYS = ["+", "="];
const RESET_SPEED_KEYS = ["*"];
const SHOW_OVERLAY_KEYS = ["z"];

const MIN_SPEED = 0.25;
const MAX_SPEED = 2;
const DEFAULT_SPEED = 1;
const SPEED_INCREMENT = 0.25;

const OVERLAY_TIMEOUT_MS = 1000;


// GLOBAL VARIABLES
let currentTimeout;


/**
 * Checks whether a video exists with a playback rate parameter within the current page.
 *
 * @returns {boolean} True if a video exists with a playback rate parameter, false otherwise.
 */
function videoExists() {
    const videoElements = document.getElementsByTagName("video");
    if (videoElements.length > 0) {
        return videoElements[0].playbackRate !== undefined;
    }
    return false;
}


/**
 * Removes the video speed overlay from the page if it exists.
 */
function removeOverlay() {
    if (document.getElementById("video-speed-overlay") != null) {
        document.getElementById("video-speed-overlay").remove();
    }
}


/**
 * Shows the video speed overlay on the current page, using the current video speed. This is done by clearing the
 * current timeout and removing the existing overlay if it exists, then adding the current video speed overlay as a div
 * with a timeout set by OVERLAY_TIMEOUT_MS.
 */
function showSpeedOverlay() {
    clearTimeout(currentTimeout);
    removeOverlay();

    const overlayDiv = document.createElement("div");
    overlayDiv.setAttribute("id", "video-speed-overlay");
    document.body.insertBefore(overlayDiv, document.body.firstChild);
    document.getElementById("video-speed-overlay").innerText =
        document.getElementsByTagName("video")[0].playbackRate.toString();

    currentTimeout = setTimeout(() => {
        removeOverlay();
    }, OVERLAY_TIMEOUT_MS);
}


/**
 * Speeds the video down by the increment set by SPEED_INCREMENT to a minimum of MIN_SPEED.
 */
async function speedDown() {
    const originalSpeed = document.getElementsByTagName("video")[0].playbackRate;
    if (originalSpeed >= MIN_SPEED + SPEED_INCREMENT) {
        document.getElementsByTagName("video")[0].playbackRate -= SPEED_INCREMENT;
        await chrome.storage.local.set(
            {videoSpeed: document.getElementsByTagName("video")[0].playbackRate}
        );
    }
}

/**
 * Speeds the video up by the increment set by SPEED_INCREMENT to a maximum of MAX_SPEED.
 */
async function speedUp() {
    const originalSpeed = document.getElementsByTagName("video")[0].playbackRate;
    if (originalSpeed <= MAX_SPEED - SPEED_INCREMENT) {
        document.getElementsByTagName("video")[0].playbackRate += SPEED_INCREMENT;
        await chrome.storage.local.set(
            {videoSpeed: document.getElementsByTagName("video")[0].playbackRate}
        );
    }
}


/**
 * Sets the video speed to the given value.
 *
 * @param speed Number to set the video speed to.
 */
async function setSpeed(speed) {
    document.getElementsByTagName("video")[0].playbackRate = speed;
    await chrome.storage.local.set({videoSpeed: speed});
}


/**
 * Retrieves the "videoSpeed" key from the chrome.storage API, and sets the video speed according to the key's value.
 * If the key is not set, it is set to DEFAULT_SPEED.
 *
 * @param showOverlay Determines whether the speed overlay should be shown after completion.
 */
function setSpeedFromStorage(showOverlay) {
    chrome.storage.local.get(["videoSpeed"], async function (result) {
        if (!isNaN(result.videoSpeed)) {
            if (result.videoSpeed < MIN_SPEED) {
                await setSpeed(MIN_SPEED);
                await chrome.storage.local.set({videoSpeed: MIN_SPEED});
            } else if (result.videoSpeed > MAX_SPEED) {
                await setSpeed(MAX_SPEED);
                await chrome.storage.local.set({videoSpeed: MAX_SPEED});
            } else {
                await setSpeed(result.videoSpeed);
            }
        } else if (isNaN(result.videoSpeed)) {
            await setSpeed(DEFAULT_SPEED);
            await chrome.storage.local.set({videoSpeed: DEFAULT_SPEED});
        }
        if (showOverlay) {
            showSpeedOverlay();
        }
    });
}


/**
 * Handles any keydown events, which calls the respective function depending on whether one of the set video speed keys
 * is pressed and shows the speed overlay.
 */
async function handleKeyDown(event) {
    if (SPEED_DOWN_KEYS.includes(event.key) && videoExists) {
        speedDown().then(() => showSpeedOverlay());
    } else if (SPEED_UP_KEYS.includes(event.key) && videoExists) {
        speedUp().then(() => showSpeedOverlay());
    } else if (RESET_SPEED_KEYS.includes(event.key) && videoExists) {
        setSpeed(DEFAULT_SPEED).then(() => showSpeedOverlay());
    } else if (SHOW_OVERLAY_KEYS.includes(event.key) && videoExists) {
        setSpeedFromStorage(true);
    }
}


document.addEventListener("keydown", async function (event) {
    await handleKeyDown(event);
});


if (videoExists) {
    setSpeedFromStorage(false);
}
