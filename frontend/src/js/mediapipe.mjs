import {
  GestureRecognizer,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export {
  createGestureRecognizer,
  hasGetUserMedia,
  predictWebcam
}

let gestureRecognizer;
let lastVideoTime = -1;

// Load up the model
async function createGestureRecognizer() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/gesture_recognizer.task"
    },
    runningMode: "VIDEO",
    numHands: 1
  });
}

// Checks if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

async function predictWebcam(video, callback) {
  const nowInMs = Date.now();
  let results;

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }

  if (results && results.gestures && results.gestures.length > 0) {
    const categoryName = results.gestures[0][0].categoryName;
    callback(categoryName);
  }

  // Call this function again to keep predicting when the browser is ready.
  window.requestAnimationFrame(() => {predictWebcam(video, callback);});
}
