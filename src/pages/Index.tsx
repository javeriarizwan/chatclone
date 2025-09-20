import { useState } from "react";
import { Conversation } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { ChatList } from "@/components/ChatList";
import { ChatScreen } from "@/components/ChatScreen";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { user, logout } = useAuth();

  // Show auth flow if user is not authenticated
  if (!user) {
    return <AuthFlow />;
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleLogout = () => {
    logout();
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
          <div className="h-full">
            {/* Mobile Header with Logout */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div>
                <h1 className="font-semibold text-lg">Chats</h1>
                <p className="text-sm text-primary-foreground/80">Welcome, {user.name}!</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100vh-80px)]">
              <ChatList onSelectConversation={handleSelectConversation} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Show both panels */}
      <div className="hidden md:flex w-full">
        {/* Chat List Panel */}
        <div className="w-1/3 min-w-[300px] max-w-[400px] relative">
          <ChatList onSelectConversation={handleSelectConversation} />
          
          {/* Desktop Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0 z-10"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
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
                <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome, {user.name}!</h2>
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
