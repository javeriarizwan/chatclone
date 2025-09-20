import { Message, MessageStatus } from "@/types/chat";
import { getUserById, currentUser } from "@/data/mockData";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CheckCheck, Check, Clock } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const sender = getUserById(message.senderId);
  const isOwnMessage = message.senderId === currentUser.id;

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-status-sent" />;
      case 'delivered':
        return <Check className="w-3 h-3 text-status-delivered" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-status-read" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-2 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={sender?.avatar} />
          <AvatarFallback>{sender?.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`
        max-w-[70%] rounded-2xl px-3 py-2 shadow-sm
        ${isOwnMessage 
          ? 'bg-primary text-primary-foreground rounded-br-sm ml-auto' 
          : 'bg-background text-foreground rounded-bl-sm border border-border'
        }
      `}>
        {message.type === 'text' ? (
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        ) : (
          <AudioPlayer 
            audioUrl={message.content} 
            duration={message.duration || 0}
            isOwnMessage={isOwnMessage}
          />
        )}
        
        <div className={`
          flex items-center gap-1 mt-1 text-xs opacity-70
          ${isOwnMessage ? 'text-primary-foreground' : 'text-muted-foreground'}
        `}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwnMessage && getStatusIcon(message.status)}
        </div>
      </div>
      
      {isOwnMessage && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={currentUser.avatar} />
          <AvatarFallback>{currentUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};