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
 * Main function, sets listener and initialises video speed.
 */
function main() {
    setAndHandleKeyDown();
    if (videoExists) {
        setSpeedFromStorage();
    }
}

/**
 * Sets the key down listener and handles the event.
 */
function setAndHandleKeyDown() {
    document.addEventListener("keydown", async function (event) {
        if (videoExists) {
            await handleKeyDown(event);
            showSpeedOverlay();
        }
    });
}

/**
 * Checks whether a video exists with a playback rate parameter within the current page.
 * @returns {boolean} True if a video exists, false otherwise.
 */
function videoExists() {
    const videoElements = document.getElementsByTagName("video");
    return videoElements.length > 0
        ? videoElements[0].playbackRate !== undefined
        : false;
}

/**
 * Handles any key down events, which calls the respective function depending on whether one of the set video speed keys
 * is pressed.
 */
async function handleKeyDown(event) {
    if (SPEED_DOWN_KEYS.includes(event.key)) {
        await speedDown();
    } else if (SPEED_UP_KEYS.includes(event.key)) {
        await speedUp();
    } else if (RESET_SPEED_KEYS.includes(event.key)) {
        await setSpeed(DEFAULT_SPEED);
    } else if (SHOW_OVERLAY_KEYS.includes(event.key)) {
        setSpeedFromStorage();
    }
}

/**
 * Speeds the video down by the increment set by SPEED_INCREMENT to a minimum of MIN_SPEED.
 */
async function speedDown() {
    const originalSpeed = document.getElementsByTagName("video")[0].playbackRate;
    if (originalSpeed >= MIN_SPEED + SPEED_INCREMENT) {
        document.getElementsByTagName("video")[0].playbackRate -= SPEED_INCREMENT;
        await chrome.storage.local.set(
            { videoSpeed: document.getElementsByTagName("video")[0].playbackRate }
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
            { videoSpeed: document.getElementsByTagName("video")[0].playbackRate }
        );
    }
}

/**
 * Retrieves the "videoSpeed" key from the local chrome.storage API, and sets the video speed according to the key's
 * value. If the key is not set or not within the max and min boundaries, it is set to DEFAULT_SPEED.
 */
function setSpeedFromStorage() {
    chrome.storage.local.get(["videoSpeed"], async function (result) {
        if (isSpeedWithinBoundaries(result.videoSpeed)) {
            await setSpeed(result.videoSpeed);
        } else {
            await setSpeed(DEFAULT_SPEED);
            await chrome.storage.local.set({ videoSpeed: DEFAULT_SPEED });
        }
    });
}

/**
 * Checks if the given video speed is within the max and min boundaries.
 * @param videoSpeed Video speed number.
 * @returns {boolean} True if video speed is within boundaries, false otherwise.
 */
function isSpeedWithinBoundaries(videoSpeed) {
    return !isNaN(videoSpeed) && videoSpeed <= MAX_SPEED && videoSpeed >= MIN_SPEED;
}

/**
 * Sets the video speed to the given value.
 * @param speed Number to set the video speed to.
 */
async function setSpeed(speed) {
    document.getElementsByTagName("video")[0].playbackRate = speed;
    await chrome.storage.local.set({videoSpeed: speed});
}

/**
 * Shows the video speed overlay on the current page, using the current video speed.
 */
function showSpeedOverlay() {
    clearTimeout(currentTimeout);
    removeOverlay();
    setOverlayInDocument();
    setOverlayTimeout();
}

/**
 * Creates and sets the video speed overlay as a div.
 */
function setOverlayInDocument() {
    const overlayDiv = document.createElement("div");
    overlayDiv.setAttribute("id", "video-speed-overlay");
    document.body.insertBefore(overlayDiv, document.body.firstChild);
    document.getElementById("video-speed-overlay").innerText =
        document.getElementsByTagName("video")[0].playbackRate.toString();
}

/**
 * Sets a timeout period for the overlay to stay in view.
 */
function setOverlayTimeout() {
    currentTimeout = setTimeout(() => {
        removeOverlay();
    }, OVERLAY_TIMEOUT_MS);
}

/**
 * Removes the video speed overlay from view.
 */
function removeOverlay() {
    document.getElementById("video-speed-overlay")?.remove();
}


main();
