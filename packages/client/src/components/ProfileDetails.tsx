
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { User, MessageCircle, TrendingUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileData {
  id: string;
  name: string;
  type: 'person' | 'device' | 'location';
  risk: 'high' | 'medium' | 'low';
  image?: string;
  mostUsedWords: Array<{ word: string; count: number }>;
  recentChats: Array<{ message: string; timestamp: string; risk: string }>;
}

interface ProfileDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
}

export const ProfileDetails = ({ isOpen, onClose, profile }: ProfileDetailsProps) => {
  if (!profile) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-teal-500" />
            Profile Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className="bg-slate-700 text-white">
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
              <Badge className={getRiskColor(profile.risk)}>
                {profile.risk.toUpperCase()} RISK
              </Badge>
              <p className="text-slate-400 text-sm capitalize">{profile.type}</p>
            </div>
          </div>

          {/* Most Used Words */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-teal-500" />
                Most Used Words
              </h4>
              <div className="space-y-2">
                {profile.mostUsedWords.map((word, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">{word.word}</span>
                    <Badge variant="outline" className="text-xs">
                      {word.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Chats */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-teal-500" />
                Recent Chats
              </h4>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {profile.recentChats.map((chat, index) => (
                    <div key={index} className="border-b border-slate-700 pb-2">
                      <p className="text-slate-300 text-xs mb-1">{chat.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs">{chat.timestamp}</span>
                        <Badge className={`text-xs ${getRiskColor(chat.risk)}`}>
                          {chat.risk}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
