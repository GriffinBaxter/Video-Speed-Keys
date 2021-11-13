// CONSTANTS
const SPEED_DOWN_KEY = "-";
const SPEED_UP_KEY = "+";
const RESET_SPEED_KEY = "*";

const MIN_SPEED = 0.25;
const MAX_SPEED = 2;
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
 * Speeds the video down by the increment set by SPEED_INCREMENT to a minimum of MIN_SPEED, if a video exists.
 */
function speedDown() {
    if (videoExists) {
        const originalSpeed = document.getElementsByTagName("video")[0].playbackRate;
        if (originalSpeed >= MIN_SPEED + SPEED_INCREMENT) {
            document.getElementsByTagName("video")[0].playbackRate -= SPEED_INCREMENT;
        }
        showSpeedOverlay();
    }
}

/**
 * Speeds the video up by the increment set by SPEED_INCREMENT to a maximum of MAX_SPEED, if a video exists.
 */
function speedUp() {
    if (videoExists) {
        const originalSpeed = document.getElementsByTagName("video")[0].playbackRate;
        if (originalSpeed <= MAX_SPEED - SPEED_INCREMENT) {
            document.getElementsByTagName("video")[0].playbackRate += SPEED_INCREMENT;
        }
        showSpeedOverlay();
    }
}


/**
 * Resets the video speed to 1, if a video exists.
 */
function resetSpeed() {
    if (videoExists) {
        document.getElementsByTagName("video")[0].playbackRate = 1;
        showSpeedOverlay();
    }
}


/**
 * Event listener for a keydown event, which calls the respective function depending on whether one of the set video
 * speed keys is pressed.
 */
document.addEventListener("keydown", function(event) {
    if (event.key === SPEED_DOWN_KEY) {
        speedDown();
    } else if (event.key === SPEED_UP_KEY) {
        speedUp();
    } else if (event.key === RESET_SPEED_KEY) {
        resetSpeed();
    }
});
