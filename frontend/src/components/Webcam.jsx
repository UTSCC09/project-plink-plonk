import { useState } from "react";

export default function Webcam() {
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [webcam, setWebcam] = useState(null);
  const [mediapipe, setMediapipe] = useState(null);
  const [gesture, setGesture] = useState(null);
  useEffect(() => {
    // this is supposed to be async but i don't think it is rn
    // TODO: look up async functions in useeffect
    // setMediapipe(createGestureRecognizer());
    const gestureRecognizer = createGestureRecognizer();
  }, []);

  function toggleCam() {
    if (isWebcamOn) {
      disableCam();
    } else {
      enableCam();
    }
  }

  function enableCam() {  
    // getUsermedia parameters.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      document.getElementById("webcam").srcObject = stream;
      document.getElementById("webcam").addEventListener("loadeddata", () => {predictWebcam(true);});
    });
  
    setIsWebcamOn(true);
  }

  function disableCam() {
    document.getElementById("webcam").srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  
    setIsWebcamOn(false);
  }

  return (
    <div>
      <video id="webcam" width="480" height="360" />
      <button onClick={toggleCam}>
        {isWebcamOn ? "DisableWebcam" : "Enable Webcam"}
      </button>
      
    </div>
  );
}
