import React from 'react';

export default function BackLobby({
  handleLeaveClick,
  showPopup,
  confirmLeave,
  cancelLeave,
  showReplay,
  replay
}) {
  
  return (
    <div>
      <button
        className="absolute top-0 right-0 m-2"
        onClick={handleLeaveClick}
      >
        <svg
          width="30px"
          height="30px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 10L3.29289 10.7071L2.58579 10L3.29289 9.29289L4 10ZM21 18C21 18.5523 20.5523 19 20 19C19.4477 19 19 18.5523 19 18L21 18ZM8.29289 15.7071L3.29289 10.7071L4.70711 9.29289L9.70711 14.2929L8.29289 15.7071ZM3.29289 9.29289L8.29289 4.29289L9.70711 5.70711L4.70711 10.7071L3.29289 9.29289ZM4 9L14 9L14 11L4 11L4 9ZM21 16L21 18L19 18L19 16L21 16ZM14 9C17.866 9 21 12.134 21 16L19 16C19 13.2386 16.7614 11 14 11L14 9Z"
            fill="#ecd9d9"
          />
        </svg>
      </button>

      {showReplay && (
        <div className="flex-center">
          <button id="replay" onClick={replay}>
            Replay game
          </button>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup2">
            <p>Are you sure you want to leave the game?</p>
            <button id="leave" onClick={confirmLeave}>
              Yes
            </button>
            <button id="stay" onClick={cancelLeave}>
              I'll Stay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}