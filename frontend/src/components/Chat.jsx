import { useState } from 'react';

export default function Chat({ messages, inputMessage, setInputMessage, sendMessage }) {
  return (
    <div className="border-2 border-gray-300 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-extrabold md:text-2xl xl:text-3lg" >Lobby Chat</h2>
      <div id="lobby-chat" className='m-0'>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <div className="flex justify-center">
        <input
          className="outline-0 w-3/4 rounded"
          id="chat-input"
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
