import { useState } from "react";
import { Conversation } from "@/types/chat";
import { ChatList } from "@/components/ChatList";
import { ChatScreen } from "@/components/ChatScreen";

const Index = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile: Show either chat list or chat screen */}
      <div className="md:hidden w-full">
        {selectedConversation ? (
          <ChatScreen 
            conversation={selectedConversation} 
            onBack={handleBackToList}
          />
        ) : (
          <ChatList onSelectConversation={handleSelectConversation} />
        )}
      </div>

      {/* Desktop: Show both panels */}
      <div className="hidden md:flex w-full">
        {/* Chat List Panel */}
        <div className="w-1/3 min-w-[300px] max-w-[400px]">
          <ChatList onSelectConversation={handleSelectConversation} />
        </div>
        
        {/* Chat Screen Panel */}
        <div className="flex-1">
          {selectedConversation ? (
            <ChatScreen 
              conversation={selectedConversation} 
              onBack={handleBackToList}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-chat-bg">
              <div className="text-center">
                <div className="mb-4 text-6xl text-primary">💬</div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">WhatsApp Clone</h2>
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
