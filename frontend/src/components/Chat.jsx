import { useRef, useEffect } from 'react';

export default function Chat({ messages, inputMessage, setInputMessage, sendMessage }) {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); 

  return (
    <div className="border-4 [border-color:#742834] [box-shadow:4px_4px_6px_#742834] p-4 rounded-lg ">
      <h2 className="text-xl font-extrabold md:text-2xl xl:text-3lg" >Lobby Chat</h2>
      <div id="lobby-chat" ref={chatContainerRef} className="space-y-4">
        {messages.map((msg, index) => (<p className="text-lg" key={index}>{msg}</p>))}
      </div>
      <div className="flex justify-center">
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
    </div>
  );
}
