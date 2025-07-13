import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RiskPanel } from "@/components/RiskPanel";
import { SuspiciousChats } from "@/components/SuspiciousChats";
import { RelationshipGraph } from "@/components/RelationshipGraph";
import { AskSherlock } from "@/components/AskSherlock";
import { ChatDetails } from "@/components/ChatDetails";
import { ProfileDetails } from "@/components/ProfileDetails";
import { trpc } from "@/lib/api";

const Index = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const { data: config, isPending: isConfigPending } = trpc.config.useQuery();
  const { data: chatsData, isPending: isChatsPending } = trpc.data.useQuery();

  const handleChatClick = (chatId: number, chatName: string) => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
    setIsChatDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = (node: any) => {
    // Find the chat data for this user
    if (chatsData?.messages) {
      const chatIndex = chatsData.messages.findIndex(
        chat => chat.username.toLowerCase().replace(/\s+/g, '-') === node.id
      );
      
      if (chatIndex !== -1) {
        const chat = chatsData.messages[chatIndex];
        
        // Calculate risk level based on message content
        const allMessages = chat.messages.join(' ').toLowerCase();
        const suspiciousWords = [
          'drug', 'dealer', 'police', 'arrested', 'weed', 'steroids', 
          'abduction', 'trafficking', 'mafia', 'illegal', 'smuggle',
          'organ', 'spare parts', 'black money', 'cash', 'no upi'
        ];
        
        const suspiciousScore = suspiciousWords.reduce((score, word) => {
          return score + (allMessages.includes(word) ? 1 : 0);
        }, 0);
        
        let risk: "high" | "medium" | "low" = "low";
        if (suspiciousScore >= 5) risk = "high";
        else if (suspiciousScore >= 2) risk = "medium";

        // Get most used words from config data
        let mostUsedWords: { word: string; count: number }[] = [];
        if (config?.users) {
          const userConfig = config.users.find(
            user => user.username.toLowerCase().replace(/\s+/g, '-') === node.id
          );
          if (userConfig) {
            mostUsedWords = userConfig.word_freq.map((word, index) => ({
              word,
              count: userConfig.len - index // Higher count for words that appear earlier in the list
            }));
          }
        }

        // Create profile object with all chat messages
        const profile = {
          id: node.id,
          name: node.name,
          type: node.type,
          risk,
          image: node.image,
          mostUsedWords,
          recentChats: chat.messages.map((message, index) => {
            const colonIndex = message.indexOf(':');
            if (colonIndex === -1) return null;
            
            const username = message.substring(0, colonIndex).trim();
            const restOfMessage = message.substring(colonIndex + 1).trim();
            const lastCommaIndex = restOfMessage.lastIndexOf(',');
            
            if (lastCommaIndex === -1) return null;
            
            const messageText = restOfMessage.substring(0, lastCommaIndex).trim();
            const timestamp = restOfMessage.substring(lastCommaIndex + 1).trim();
            
            return {
              message: messageText,
              timestamp: timestamp,
              risk: risk,
            };
          }).filter(Boolean),
        };

        setSelectedProfile(profile);
        setIsProfileDialogOpen(true);
      }
    }
  };

  // Convert server data to the format expected by ChatDetails
  const convertChatMessages = (chatIndex: number) => {
    if (!chatsData?.messages || !chatsData.messages[chatIndex]) {
      return [];
    }

    const chat = chatsData.messages[chatIndex];
    const currentUser = chatsData.current_user.name;
    const otherUser = chat.username;
    
    return chat.messages.map((message, index) => {
      // Parse the message format: "Username: message, timestamp"
      const colonIndex = message.indexOf(':');
      if (colonIndex === -1) return null;
      
      const username = message.substring(0, colonIndex).trim();
      const restOfMessage = message.substring(colonIndex + 1).trim();
      
      // Find the last comma to separate message from timestamp
      const lastCommaIndex = restOfMessage.lastIndexOf(',');
      if (lastCommaIndex === -1) return null;
      
      const messageText = restOfMessage.substring(0, lastCommaIndex).trim();
      const timestamp = restOfMessage.substring(lastCommaIndex + 1).trim();
      
      // Check if the username starts with the current user name (handles "Cosi S" vs "Cosi")
      const isCurrentUser = username.toLowerCase().startsWith(currentUser.toLowerCase());
      
      // Calculate a simple suspicious score based on message content
      const suspiciousWords = ['drug', 'dealer', 'police', 'arrested', 'weed', 'steroids', 'abduction', 'trafficking', 'mafia', 'illegal'];
      const suspiciousScore = suspiciousWords.reduce((score, word) => {
        return score + (messageText.toLowerCase().includes(word.toLowerCase()) ? 200 : 0);
      }, 100);
      
      return {
        id: index + 1,
        text: messageText,
        timestamp: timestamp,
        sender: isCurrentUser ? 'user' as const : 'other' as const,
        senderName: username,
        suspiciousScore: Math.min(suspiciousScore, 1000), // Cap at 1000
      };
    }).filter(Boolean);
  };

  if (isConfigPending || isChatsPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div className="w-80 p-4 space-y-4 border-r border-slate-700 flex flex-col">
          <RiskPanel />
          <div className="flex-1 min-h-0">
            <SuspiciousChats onChatClick={handleChatClick} />
          </div>
        </div>

        {/* Main Content - Relationship Graph */}
        <div className="flex-1 p-4">
          <RelationshipGraph onNodeClick={handleNodeClick} />
        </div>
      </div>

      <AskSherlock />

      {/* Chat Details Dialog */}
      <ChatDetails
        isOpen={isChatDialogOpen}
        onClose={() => setIsChatDialogOpen(false)}
        chatName={selectedChatName}
        messages={selectedChatId !== null ? convertChatMessages(selectedChatId) : []}
      />

      {/* Profile Details Dialog */}
      <ProfileDetails
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        profile={selectedProfile}
      />
    </div>
  );
};

export default Index;
