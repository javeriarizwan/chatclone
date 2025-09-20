import { useState } from "react";
import { Conversation } from "@/types/chat";
import { conversations } from "@/data/mockData";
import { ChatScreen } from "@/components/ChatScreen";

const Index = () => {
  // Skip authentication and directly show chat with first conversation
  const defaultConversation = conversations[0];
  const [selectedConversation] = useState<Conversation>(defaultConversation);

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
