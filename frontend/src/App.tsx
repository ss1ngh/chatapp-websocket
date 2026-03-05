import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  user: string;
  text: string;
}

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isJoined) return; 

    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log("Connected to the server as", username);
    };

    ws.current.onmessage = (event) => {
      const incomingData = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, incomingData]);
    };

    return () => {
      ws.current?.close();
    };
  }, [isJoined, username]); 

  const handleJoin = (e?: React.FormEvent) => {
    e?.preventDefault(); 
    if (username.trim() !== '') {
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (inputValue.trim() !== '' && ws.current?.readyState === WebSocket.OPEN) {
      const messageObject = {
        user: username,
        text: inputValue
      };

      ws.current.send(JSON.stringify(messageObject));
      setInputValue('');
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans selection:bg-[#EAE0D5]">
        <div className="w-full max-w-sm bg-white border border-[#EAE0D5] rounded-3xl shadow-[0_20px_60px_-15px_rgba(126,90,68,0.1)] p-8 animate-in fade-in zoom-in duration-300">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5EFEA] mb-4 shadow-inner border border-[#EAE0D5]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#7E5A44]">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#4A3B32] tracking-tight">Gather</h2>
            <p className="text-[#8C7A6B] text-sm mt-2 font-medium">Choose a name to enter the space.</p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Your Name..."
              autoFocus
              className="w-full bg-[#FAF7F2] border border-[#EAE0D5] text-[#4A3B32] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#CBAA94] focus:bg-white focus:ring-4 focus:ring-[#F5EFEA] transition-all placeholder:text-[#BCAAA4] text-center text-lg font-medium"
            />
            <button 
              type="submit"
              disabled={!username.trim()}
              className="w-full bg-[#7E5A44] text-[#FDFBF7] rounded-2xl px-6 py-4 font-bold tracking-wide hover:bg-[#684936] active:scale-95 transition-all shadow-[0_8px_20px_rgba(126,90,68,0.2)] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              Enter Room
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans selection:bg-[#EAE0D5]">
      <div className="w-full max-w-lg bg-white border border-[#EAE0D5] rounded-3xl shadow-[0_20px_60px_-15px_rgba(126,90,68,0.08)] flex flex-col h-[650px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F5EFEA] bg-white/80 backdrop-blur-sm flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-[#4A3B32] tracking-tight">Gather Room</h2>
            <p className="text-xs text-[#8C7A6B] font-medium mt-1">Joined as <span className="text-[#7E5A44] font-bold">{username}</span></p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] rounded-full border border-[#EAE0D5]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3B899] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8CA481]"></span>
            </span>
            <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth bg-[#FAF7F2]/50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#BCAAA4] text-sm italic font-medium">
              The room is quiet. Say hello...
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.user === username;

              return (
                <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[11px] text-[#A6968B] font-semibold mb-1 ml-1 tracking-wide">
                      {msg.user}
                    </span>
                  )}
                  
                  {/* --- THE BUBBLE COLORS ARE HERE --- */}
                  <div className={`px-5 py-3 max-w-[80%] text-sm md:text-base transition-all duration-300 ease-out animate-in slide-in-from-bottom-2 
                      ${isMe 
                        ? 'bg-[#7E5A44] text-[#FDFBF7] rounded-2xl rounded-tr-sm shadow-md shadow-[#7E5A44]/20' 
                        : 'bg-[#EAE0D5] border border-[#DCD0C3] text-[#5C4536] rounded-2xl rounded-tl-sm shadow-sm'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#F5EFEA] z-10">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="Write a message..."
              className="flex-grow bg-[#FAF7F2] border border-[#EAE0D5] text-[#4A3B32] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#CBAA94] focus:bg-white focus:ring-4 focus:ring-[#F5EFEA] focus:scale-[1.01] transition-all duration-300 placeholder:text-[#BCAAA4] font-medium"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className="bg-[#7E5A44] text-[#FDFBF7] rounded-2xl px-6 py-4 font-bold tracking-wide hover:bg-[#684936] active:scale-90 transition-all duration-200 shadow-[0_4px_15px_rgba(126,90,68,0.25)] disabled:opacity-40 disabled:active:scale-100 disabled:hover:bg-[#7E5A44] disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;