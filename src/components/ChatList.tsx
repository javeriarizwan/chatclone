import { useState } from "react";
import { Conversation, User } from "@/types/chat";
import { conversations, getUserById, currentUser } from "@/data/mockData";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

export const ChatList = ({ onSelectConversation }: ChatListProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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
    <div className="h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-primary text-primary-foreground relative">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg">Chats</h1>
            <p className="text-sm text-primary-foreground/80">WhatsApp Clone</p>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto">
        {conversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const isSelected = selectedConversationId === conversation.id;
          
          return (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`
                flex items-center gap-3 p-4 hover:bg-secondary/50 cursor-pointer border-b border-border/30 transition-colors
                ${isSelected ? 'bg-secondary' : ''}
              `}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser.avatar} />
                  <AvatarFallback>{otherUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                {otherUser.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-card"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground truncate">{otherUser.name}</h3>
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
      </div>
    </div>
  );
};