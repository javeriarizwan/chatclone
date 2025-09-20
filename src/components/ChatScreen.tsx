import { useState, useRef, useEffect } from "react";
import { Conversation, Message } from "@/types/chat";
import { getMessagesForConversation, currentUser, addMessage } from "@/data/mockData";
import { MessageBubble } from "./MessageBubble";
import { AudioRecorder } from "./AudioRecorder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Mic, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ChatScreenProps {
  conversation: Conversation;
  onBack: () => void;
}

export const ChatScreen = ({ conversation, onBack }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>(getMessagesForConversation(conversation.id));
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { logout } = useAuth();

  const otherUser = conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      type: "text",
      content: newMessage.trim(),
      status: "sent",
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, message]);
    addMessage(message); // Add to global messages
    setNewMessage("");

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: "delivered" } : m)
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: "read" } : m)
      );
    }, 3000);

    toast({
      title: "Message sent",
      description: `Your message was sent to ${otherUser.name}`,
    });
  };

  const handleSendAudio = (audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      type: "audio",
      content: audioUrl,
      status: "sent",
      createdAt: new Date(),
      duration,
    };

    setMessages(prev => [...prev, message]);
    addMessage(message); // Add to global messages
    setIsRecording(false);

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: "delivered" } : m)
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: "read" } : m)
      );
    }, 3000);

    toast({
      title: "Audio message sent",
      description: `Your voice message was sent to ${otherUser.name}`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return "offline";
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "online";
    if (diffInMinutes < 60) return `last seen ${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `last seen ${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `last seen ${diffInDays}d ago`;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-background border-b border-border shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-foreground hover:bg-secondary h-8 w-8 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10 bg-secondary text-foreground">
          <AvatarFallback className="bg-secondary text-foreground font-semibold">
            {otherUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{otherUser.name}</h2>
          <p className="text-sm text-muted-foreground">
            {otherUser.isOnline ? "online" : formatLastSeen(otherUser.lastSeen)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm" 
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-chat-bg">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isRecording ? (
        <AudioRecorder
          onSendAudio={handleSendAudio}
          onCancel={() => setIsRecording(false)}
        />
      ) : (
        <div className="flex items-center gap-3 p-4 bg-background border-t border-border">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Say something..."
              className="rounded-full border-border bg-secondary/50 focus:bg-background transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full h-10 w-10 p-0 shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setIsRecording(true)}
                variant="outline"
                className="text-muted-foreground hover:text-foreground border-border rounded-full h-10 w-10 p-0"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};