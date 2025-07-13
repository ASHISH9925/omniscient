
import { useState } from 'react';
import { MessageSquare, Send, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AskSherlock = () => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

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
    <div className="fixed bottom-4 right-4 w-80 bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
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
      
      <div className="p-4">
        <div className="mb-4">
          <div className="bg-slate-700 rounded-lg p-3 mb-2">
            <div className="text-sm text-slate-300">
              👋 Hi! I'm Sherlock, your AI security assistant. Ask me anything about the current threat analysis or security patterns.
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
