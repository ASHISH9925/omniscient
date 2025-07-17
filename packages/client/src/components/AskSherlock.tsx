import { useEffect, useState, useRef, useCallback } from "react";
import { MessageSquare, Send, Eye, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { apiURL } from "@/lib/api";

export const AskSherlock = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(384); // 96 * 4 = 384px (w-96)
  const [height, setHeight] = useState(600); // max-h-[600px]
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState<'width' | 'height' | 'both' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    messages: chatMessages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: apiURL + "/ai",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async (ev: React.KeyboardEvent<unknown>) => {
    handleSubmit(ev, {
      body: {
        message: input,
      },
    });
    ev.preventDefault();
  };

  useEffect(() => {
    console.log("Messages", chatMessages);
  }, [chatMessages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'width' | 'height' | 'both') => {
    e.preventDefault();
    setIsResizing(true);
    setResizeType(type);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handleMouseMove = (e: MouseEvent) => {
      if (type === 'width' || type === 'both') {
        const deltaX = startX - e.clientX; // Negative because we want to increase width when dragging left
        const newWidth = Math.max(320, Math.min(800, startWidth + deltaX));
        setWidth(newWidth);
      }
      
      if (type === 'height' || type === 'both') {
        const deltaY = startY - e.clientY; // Negative because we want to increase height when dragging up
        const newHeight = Math.max(300, Math.min(800, startHeight + deltaY));
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeType(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, height]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
        size="lg"
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Ask Sherlock
      </Button>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-4 right-4 bg-slate-800 rounded-lg border border-slate-700 shadow-xl flex flex-col"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        cursor: isResizing ? (resizeType === 'both' ? 'nw-resize' : resizeType === 'width' ? 'w-resize' : 'n-resize') : 'default'
      }}
    >
      {/* Top resize handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 cursor-n-resize hover:bg-teal-600/50 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, 'height')}
      />
      
      {/* Left resize handle */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize hover:bg-teal-600/50 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, 'width')}
      />
      
      {/* Top-left corner resize handle */}
      <div 
        className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-teal-600/50 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, 'both')}
      />

      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-medium">Ask Sherlock</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              <div className="flex items-start space-x-2">
                {msg.role === "assistant" && (
                  <Bot className="h-4 w-4 mt-0.5 text-teal-400 flex-shrink-0" />
                )}
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                {msg.role === "user" && (
                  <User className="h-4 w-4 mt-0.5 text-teal-200 flex-shrink-0" />
                )}
              </div>
              <div
                className={`text-xs mt-1 ${
                  msg.role === "user" ? "text-teal-200" : "text-slate-400"
                }`}
              >
                {msg.createdAt?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-teal-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            disabled={isLoading}
          />
          <Button
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
