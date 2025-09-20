import { useState, useEffect } from "react";
import { Conversation } from "@/types/chat";
import { conversations, currentUser, createConversation } from "@/data/mockData";
import { ChatScreen } from "@/components/ChatScreen";

const Index = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    // Create a default conversation for testing if none exists
    if (conversations.length === 0) {
      const testUser = {
        id: `user-iqra`,
        name: "iqra",
        email: "iqra@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=iqra",
        isOnline: true,
      };
      
      const testConversation = {
        id: "conv-1", // Fixed conversation ID
        participants: [currentUser, testUser],
        unreadCount: 0,
        updatedAt: new Date(),
      };
      setSelectedConversation(testConversation);
    } else {
      setSelectedConversation(conversations[0]);
    }
  }, []);

  if (!selectedConversation) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl">💬</div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up chat interface</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <div className="w-full">
        <ChatScreen 
          conversation={selectedConversation} 
          onBack={() => {}} // No back functionality for testing
        />
      </div>
    </div>
  );
};

export default Index;
