import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RiskPanel } from "@/components/RiskPanel";
import { SuspiciousChats } from "@/components/SuspiciousChats";
import { RelationshipGraph } from "@/components/RelationshipGraph";
import { AskSherlock } from "@/components/AskSherlock";
import { ChatDetails } from "@/components/ChatDetails";
import { ProfileDetails } from "@/components/ProfileDetails";
import { trpc } from "@/lib/api";

// Mock profile data
const mockProfileData = {
  john: {
    id: "john",
    name: "John Doe",
    type: "person" as const,
    risk: "high" as const,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    mostUsedWords: [
      { word: "meeting", count: 15 },
      { word: "project", count: 12 },
      { word: "urgent", count: 8 },
      { word: "deadline", count: 6 },
      { word: "confidential", count: 4 },
    ],
    recentChats: [
      {
        message: "Need to discuss the confidential project",
        timestamp: "2h ago",
        risk: "high",
      },
      {
        message: "Urgent meeting required",
        timestamp: "4h ago",
        risk: "medium",
      },
      {
        message: "Can you share the files?",
        timestamp: "1d ago",
        risk: "high",
      },
    ],
  },
  jane: {
    id: "jane",
    name: "Jane Smith",
    type: "person" as const,
    risk: "medium" as const,
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    mostUsedWords: [
      { word: "help", count: 10 },
      { word: "support", count: 8 },
      { word: "question", count: 6 },
      { word: "issue", count: 5 },
      { word: "problem", count: 4 },
    ],
    recentChats: [
      {
        message: "Can you help me with this?",
        timestamp: "5m ago",
        risk: "medium",
      },
      {
        message: "I have a question about the system",
        timestamp: "1h ago",
        risk: "low",
      },
      {
        message: "Support needed for the project",
        timestamp: "3h ago",
        risk: "medium",
      },
    ],
  },
  mike: {
    id: "mike",
    name: "Mike Johnson",
    type: "person" as const,
    risk: "low" as const,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    mostUsedWords: [
      { word: "schedule", count: 7 },
      { word: "meeting", count: 5 },
      { word: "time", count: 4 },
      { word: "calendar", count: 3 },
      { word: "available", count: 2 },
    ],
    recentChats: [
      { message: "Meeting at 3 PM", timestamp: "12m ago", risk: "low" },
      { message: "Let me check my schedule", timestamp: "2h ago", risk: "low" },
      {
        message: "Are you available tomorrow?",
        timestamp: "1d ago",
        risk: "low",
      },
    ],
  },
};

const Index = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>("");
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

  const handleNodeClick = (node: any) => {
    const profile = mockProfileData[node.id as keyof typeof mockProfileData];
    if (profile) {
      setSelectedProfile(profile);
      setIsProfileDialogOpen(true);
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
