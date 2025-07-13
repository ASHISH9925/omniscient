
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MessageCircle, User, Users } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  sender: 'user' | 'other';
  senderName: string;
  suspiciousScore?: number;
}

interface ChatDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
  messages: Message[];
}

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timestamp;
  }
};

export const ChatDetails = ({ isOpen, onClose, chatName, messages }: ChatDetailsProps) => {
  const totalMessages = messages.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-teal-500" />
              Chat with {chatName}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">{totalMessages} messages</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh]">
          <div className="space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                No messages found in this chat.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.sender === 'user' ? (
                        <User className="h-3 w-3 mr-1" />
                      ) : (
                        <Users className="h-3 w-3 mr-1" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.senderName}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-end mt-2">
                      <div className="flex items-center text-xs opacity-70">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
