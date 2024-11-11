import { useState, useEffect, useRef } from "react";
import { createGestureRecognizer, predictWebcam } from "../js/mediapipe.mjs"; 

export default function Webcam({ currentSign, changeSign }) {
  const webcamVideo = useRef(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  useEffect(() => {
    // this may not be async even though it's supposed to be
    createGestureRecognizer();
  });

  function toggleCam() {
    if (isWebcamOn) {
      disableCam();
    } else {
      enableCam();
    }
  }

  async function enableCam() {
    // TODO turn this into try catch just in case

    const constraints = {
      video: true
    };
  
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    webcamVideo.current.srcObject = stream;
    setVideoStream(stream);  
    setIsWebcamOn(true);
  }

  function disableCam() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        track.stop();
      });
      setVideoStream(null);
    }
    setIsWebcamOn(false);
  }

  function readSign() {
    predictWebcam(webcamVideo.current, mediapipeCallback);
  }

  async function mediapipeCallback(sign) {
    if (sign != "None" && sign !== currentSign) {
      console.log("old sign was ", currentSign, ", changed  to ", sign);
      changeSign(sign);
    }
  }

  return (
    <div>
      <video
        ref={webcamVideo}
        autoPlay
        width="360px"
        height="480px"
        onLoadedData={readSign}
      />
      <button onClick={toggleCam}>
        {isWebcamOn ? "Disable Webcam" : "Enable Webcam"}
      </button>
    </div>
  );
}
