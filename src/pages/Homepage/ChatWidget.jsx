import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Maximize2, Minimize2 } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  
  // State cho resize
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! Chào mừng bạn đến với trung tâm. Mình là Tutor AI Support, mình có thể giúp gì cho bạn?", sender: 'bot' }
  ]);

  const suggestionChips = [
    "Tư vấn lộ trình",
    "Học phí bao nhiêu?",
    "Lịch khai giảng",
    "Đăng ký test"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  // Giả lập API call
  const sendMessageToBackend = async (text) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "Cảm ơn bạn đã liên hệ! Đây là câu trả lời mẫu cho câu hỏi của bạn.";
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const newMsg = { id: Date.now(), text: text, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    const botAnswer = await sendMessageToBackend(text);

    const botReply = { 
      id: Date.now() + 1, 
      text: botAnswer, 
      sender: 'bot' 
    };
    
    setMessages(prev => [...prev, botReply]);
    setIsTyping(false);
  };

  // Xử lý resize
  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = resizeStartRef.current.x - e.clientX;
      const deltaY = resizeStartRef.current.y - e.clientY;

      let newWidth = size.width;
      let newHeight = size.height;

      if (resizeDirection.includes('left')) {
        newWidth = Math.max(300, Math.min(800, resizeStartRef.current.width + deltaX));
      }
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(300, Math.min(800, resizeStartRef.current.width - deltaX));
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(400, Math.min(800, resizeStartRef.current.height + deltaY));
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(400, Math.min(800, resizeStartRef.current.height - deltaY));
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, size]);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const currentSize = isMaximized 
    ? { width: 'calc(100vw - 48px)', height: 'calc(100vh - 120px)' }
    : { width: `${size.width}px`, height: `${size.height}px` };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <div 
        ref={chatBoxRef}
        style={{
          width: currentSize.width,
          height: currentSize.height,
        }}
        className={`
          bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right relative
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
          ${isResizing ? 'transition-none' : ''}
        `}
      >
        {/* Resize handles */}
        {!isMaximized && (
          <>
            {/* Top edge */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 cursor-n-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'top')}
            />
            {/* Bottom edge */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
            />
            {/* Left edge */}
            <div 
              className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            />
            {/* Right edge */}
            <div 
              className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
            {/* Corners */}
            <div 
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'top-left')}
            />
            <div 
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'top-right')}
            />
            <div 
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
            />
            <div 
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-purple-300 z-50"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
            />
          </>
        )}

        {/* Header */}
        <div className="bg-purple-600 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-0.5 rounded-full overflow-hidden">
              <img 
                src="/images/AIAvatar.jpg" 
                alt="AI Avatar" 
                className="w-8 h-8 object-cover rounded-full"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm">Tutor AI Support</h3>
              <span className="text-xs text-purple-200 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMaximize} 
              className="hover:bg-purple-700 p-1 rounded transition"
              title={isMaximized ? "Thu nhỏ" : "Phóng to"}
            >
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-purple-700 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 scrollbar-thin scrollbar-thumb-purple-200">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 flex-shrink-0 border border-purple-200 overflow-hidden">
                  <img 
                    src="/images/AIAvatar.jpg" 
                    alt="AI" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`
                max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                ${msg.sender === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'}
              `}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 border border-purple-200 overflow-hidden">
                <img 
                  src="/images/AIAvatar.jpg" 
                  alt="AI" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white p-3 border-t border-gray-100">
          {!isTyping && (
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-1">
              {suggestionChips.map((chip, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="whitespace-nowrap px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 rounded-full hover:bg-purple-100 transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
            <input 
              type="text" 
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              placeholder="Nhập câu hỏi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage(inputValue)}
              disabled={isTyping} 
            />
            <button 
              onClick={() => handleSendMessage(inputValue)}
              disabled={isTyping || !inputValue.trim()}
              className={`p-2 rounded-full transition-all ${inputValue.trim() && !isTyping ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] text-gray-400">Powered by AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group mt-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isOpen ? 'bg-gray-600' : 'bg-purple-600 animate-bounce-slow'}
        `}
      >
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
            <img 
              src="/images/AIAvatar.jpg" 
              alt="Chat Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {!isOpen && (
          <span className="absolute right-16 bg-white text-gray-800 text-xs font-bold py-1 px-3 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-100">
            Chat với chúng tôi!
            <span className="absolute top-1/2 -right-1 -mt-1 border-4 border-transparent border-l-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;