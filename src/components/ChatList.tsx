import { useState } from "react";
import { Conversation, User } from "@/types/chat";
import { conversations, getUserById, currentUser } from "@/data/mockData";
import { AddContactDialog } from "@/components/AddContactDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

export const ChatList = ({ onSelectConversation }: ChatListProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { logout } = useAuth();

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    onSelectConversation(conversation);
  };

  const getOtherParticipant = (conversation: Conversation): User => {
    return conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.lastMessage) return "No messages yet";
    
    if (conversation.lastMessage.type === "audio") {
      return "🎵 Audio message";
    }
    
    return conversation.lastMessage.content;
  };

  return (
    <div className="h-full bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {currentUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-lg text-foreground">ConnectPro</h1>
            <p className="text-sm text-muted-foreground">Welcome back!</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto relative">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-6">Add a contact to start your first conversation</p>
            <AddContactDialog onContactAdded={handleSelectConversation} />
          </div>
        ) : (
          <>
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`
                    flex items-center gap-3 p-4 hover:bg-secondary/30 cursor-pointer border-b border-border/30 transition-colors
                    ${isSelected ? 'bg-secondary/50' : ''}
                  `}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 bg-secondary text-foreground">
                      <AvatarFallback className="bg-secondary text-foreground font-semibold">
                        {otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {otherUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">{otherUser.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessage && formatLastMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {getLastMessagePreview(conversation)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Floating Add Button */}
            <div className="absolute bottom-4 right-4">
              <AddContactDialog onContactAdded={handleSelectConversation} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};