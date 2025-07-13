
import { trpc } from '@/lib/api';
import { MessageCircle, Clock, Eye } from 'lucide-react';

interface SuspiciousChatsProps {
  onChatClick?: (chatId: number, chatName: string) => void;
}

export const SuspiciousChats = ({ onChatClick }: SuspiciousChatsProps) => {
  const { data: chats, isPending: isChatsPending } = trpc.data.useQuery();
  
  if (isChatsPending) {
    return <div>Loading...</div>;
  }

  if (!chats || !chats.messages) {
    return <div>No chats available</div>;
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-teal-500" />
          Suspicious Chats
        </h3>
        <p className="text-sm text-slate-400 mt-1">Click on any chat to view all messages</p>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {chats.messages.map((chat, index) => {
          const lastMessage = chat.messages[chat.messages.length - 1] || 'No messages';
          const messageCount = chat.messages.length;
          
          // Calculate a simple risk score based on message count and content
          const suspiciousWords = ['drug', 'dealer', 'police', 'arrested', 'weed', 'steroids', 'abduction', 'trafficking', 'mafia', 'illegal'];
          const contentScore = chat.messages.reduce((score, message) => {
            return score + suspiciousWords.reduce((wordScore, word) => {
              return wordScore + (message.toLowerCase().includes(word.toLowerCase()) ? 50 : 0);
            }, 0);
          }, 0);
          
          const totalScore = Math.min(contentScore + (messageCount * 10), 1000);
          const riskScore = totalScore > 700 ? 'high' : totalScore > 400 ? 'medium' : 'low';
          
          return (
            <div
              key={index}
              className="p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer group"
              onClick={() => onChatClick?.(index, chat.username)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-white">{chat.username}</div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-slate-400 group-hover:text-teal-400 transition-colors" />
                </div>
              </div>
              
              <div className="text-sm text-slate-400 mb-2 line-clamp-2">
                {lastMessage}
              </div>
              
              <div className="flex items-center text-xs text-slate-500">
                <Clock className="h-3 w-3 mr-1" />
                {messageCount} messages
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
