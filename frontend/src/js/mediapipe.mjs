import {
  GestureRecognizer,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export {
  createGestureRecognizer,
  hasGetUserMedia,
  predictWebcam
}

// let gestureRecognizer;
const video = document.getElementById("webcam");

// Load up the model
async function createGestureRecognizer() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/src/models/gesture_recognizer.task"
    },
    runningMode: "VIDEO",
    numHands: 1
  });

  return gestureRecognizer;
}

createGestureRecognizer();

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

let lastVideoTime = -1;
let results = undefined;

async function predictWebcam(goalSign) {
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }

  if (results.gestures.length > 0) {
    const categoryName = results.gestures[0][0].categoryName;
    if (categoryName = goalSign) {
      //do something
    }
  }

  // Call this function again to keep predicting when the browser is ready.
  window.requestAnimationFrame(() => {predictWebcam();});
}
