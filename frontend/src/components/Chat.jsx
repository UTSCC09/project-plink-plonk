import { useState } from 'react';

export default function Chat({ messages, inputMessage, setInputMessage, sendMessage }) {
  return (
    <div>
      <h2>Lobby Chat</h2>
      <div id="lobby-chat">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
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
  );
}
