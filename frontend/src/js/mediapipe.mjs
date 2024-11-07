import {
  GestureRecognizer,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export {
  createGestureRecognizer,
  hasGetUserMedia,
  toggleCam,
  predictWebcam
}

let gestureRecognizer;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
const enableWebcamButton = document.getElementById("webcamButton");
const video = document.getElementById("webcam");
const gestureOutput = document.getElementById("gesture_output");
video.style.height = videoHeight;
video.style.width = videoWidth;

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

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function toggleCam() {
  if (webcamRunning) {
    disableCam();
  } else {
    enableCam();
  }
}

function enableCam() {
  if (!gestureRecognizer) {
    console.log("gestureRecognizer not loaded yet");
    return;
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });

  video.style.visibility = "visible";
  webcamRunning = true;
  enableWebcamButton.innerText = "disable webcam";
}

function disableCam() {
  // Disable the webcam stream.
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  video.style.visibility = "hidden";

  webcamRunning = false;
  enableWebcamButton.innerText = "enable webcam";
}

let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
  if (!webcamRunning) {
    gestureOutput.style.visibility = "hidden";
    return;
  }
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }

  if (results.gestures.length > 0) {
    gestureOutput.style.visibility = "visible";
    const categoryName = results.gestures[0][0].categoryName;
    // const categoryScore = parseFloat(
    //   results.gestures[0][0].score * 100
    // ).toFixed(2);
    gestureOutput.innerText = `Gesture: ${categoryName}`;
    if (categoryName === "ILoveYou") {
      solveProblem();
      disableCam();
    }
  } else {
    gestureOutput.style.visibility = "hidden";
  }

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  }
}

