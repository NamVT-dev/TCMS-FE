import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Grip } from 'lucide-react';
import api from '../../utils/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // --- STATE VÀ REF CHO RESIZE TỐI ƯU HƠN ---
  const [size, setSize] = useState({ width: 350, height: 500 });
  const chatBoxRef = useRef(null);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0 });

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

  // --- LOGIC RESIZE TỐI ƯU HÓA ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current || !chatBoxRef.current) return;

      // Sử dụng requestAnimationFrame để tối ưu performance
      requestAnimationFrame(() => {
        const deltaX = startPos.current.x - e.clientX;
        const deltaY = startPos.current.y - e.clientY;

        const newWidth = Math.max(300, Math.min(startSize.current.w + deltaX, 800));
        const newHeight = Math.max(400, Math.min(startSize.current.h + deltaY, 900));

        // Cập nhật trực tiếp DOM thay vì qua state để tránh re-render
        chatBoxRef.current.style.width = `${newWidth}px`;
        chatBoxRef.current.style.height = `${newHeight}px`;
      });
    };

    const handleMouseUp = () => {
      if (isResizing.current && chatBoxRef.current) {
        isResizing.current = false;
        
        // Chỉ cập nhật state một lần khi kết thúc resize
        const finalWidth = parseInt(chatBoxRef.current.style.width);
        const finalHeight = parseInt(chatBoxRef.current.style.height);
        
        setSize({
          width: finalWidth,
          height: finalHeight
        });

        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { w: size.width, h: size.height };
    
    document.body.style.cursor = 'nwse-resize'; 
    document.body.style.userSelect = 'none';
  };

  const sendMessageToBackend = async (text) => {
    try {
      const response = await api.ai.chat(text);
      
      if (response.data.status === 'success') {
        return response.data.data.answer;
      } else {
        return "Xin lỗi, mình chưa hiểu rõ câu hỏi. Bạn thử diễn đạt lại nhé!";
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "Hệ thống đang quá tải, bạn vui lòng thử lại sau chút xíu nhé!";
    }
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

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <div 
        ref={chatBoxRef}
        style={{ 
          width: `${size.width}px`, 
          height: `${size.height}px`,
          // Thêm will-change để tối ưu hiệu suất khi resize
          willChange: isResizing.current ? 'width, height' : 'auto'
        }}
        className={`
          bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col transition-all duration-200 origin-bottom-right
          ${isOpen ? 'opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        <div className="bg-purple-600 p-4 flex items-center justify-between text-white shadow-md relative">
          {/* --- NÚT KÉO RESIZE TỐI ƯU --- */}
          <div 
            className="absolute top-0 left-0 p-2 cursor-nwse-resize hover:bg-purple-500 rounded-br-lg transition-colors group z-50 touch-none"
            onMouseDown={handleMouseDown}
            title="Kéo để thay đổi kích thước"
          >
            <Grip size={16} className="text-purple-300 group-hover:text-white" />
          </div>

          <div className="flex items-center gap-2 pl-6">
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
          <button onClick={() => setIsOpen(false)} className="hover:bg-purple-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
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

        <div className="bg-white p-3 border-t border-gray-100">
          {!isTyping && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
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

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group mt-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isOpen ? 'bg-gray-600' : 'bg-purple-600'}
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