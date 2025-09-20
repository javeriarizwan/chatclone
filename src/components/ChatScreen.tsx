import { useState, useRef, useEffect } from "react";
import { Conversation, Message, MessageType, MessageStatus } from "@/types/chat";
import { getMessagesForConversation, currentUser, addMessage } from "@/data/mockData";
import { MessageBubble } from "./MessageBubble";
import { AudioRecorder } from "./AudioRecorder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Mic, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ChatScreenProps {
  conversation: Conversation;
  onBack: () => void;
}

export const ChatScreen = ({ conversation, onBack }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { logout } = useAuth();

  // Add null checks for conversation and its properties
  if (!conversation || !conversation.participants || conversation.participants.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Invalid Conversation</h2>
          <p className="text-muted-foreground">Unable to load conversation data</p>
        </div>
      </div>
    );
  }

  const otherUser = conversation.participants.find(p => p.id !== currentUser?.id) || conversation.participants[0];

  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [conversation?.id]);

  const loadMessages = async () => {
    if (!conversation?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      // Convert database format to frontend format
      const formattedMessages: Message[] = data?.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        type: msg.type as MessageType,
        content: msg.content,
        status: msg.status as MessageStatus,
        createdAt: new Date(msg.created_at),
        ...(msg.duration && { duration: msg.duration }),
        // Include sender_name for avatar display
        sender_name: msg.sender_name
      } as any)) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendWebhook = async (message: Message) => {
    console.log('Attempting to send webhook for message:', message.id);
    try {
      const payload = {
        messageId: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: currentUser.name,
        recipientId: otherUser.id,
        recipientName: otherUser.name,
        messageType: message.type,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        status: message.status,
        ...(message.duration && { duration: message.duration }),
      };

      console.log('Sending webhook payload:', payload);

      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: payload,
      });

      if (error) {
        console.error('Webhook error:', error);
      } else {
        console.log('Webhook sent successfully:', data);
      }
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  };

  const handleSendMessage = async () => {
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

    // Save to database
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          conversation_id: message.conversationId,
          sender_id: message.senderId,
          sender_name: currentUser.name,
          type: message.type,
          content: message.content,
          status: message.status,
        });

      if (error) {
        console.error('Error saving message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setNewMessage("");
      // Message will appear via polling
      
      // Send webhook (ignore errors as it's optional)
      try {
        await sendWebhook(message);
      } catch (webhookError) {
        console.warn('Webhook failed (non-critical):', webhookError);
      }

      // Simulate message status updates
      setTimeout(() => {
        // Update status to delivered in database
        supabase
          .from('messages')
          .update({ status: 'delivered' })
          .eq('id', message.id);
      }, 1000);

      setTimeout(() => {
        // Update status to read in database  
        supabase
          .from('messages')
          .update({ status: 'read' })
          .eq('id', message.id);
      }, 3000);

      toast({
        title: "Message sent",
        description: `Your message was sent to ${otherUser.name}`,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSendAudio = async (audioBlob: Blob, duration: number) => {
    try {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      const base64Audio = await base64Promise;
      
      const message: Message = {
        id: `msg-${Date.now()}`,
        conversationId: conversation.id,
        senderId: currentUser.id,
        type: "audio",
        content: base64Audio, // Store base64 instead of blob URL
        status: "sent",
        createdAt: new Date(),
        duration,
      };

      // Save to database
      const { error: dbError } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          conversation_id: message.conversationId,
          sender_id: message.senderId,
          sender_name: currentUser.name,
          type: message.type,
          content: message.content,
          status: message.status,
          duration: message.duration,
          created_at: message.createdAt.toISOString()
        });

      if (dbError) {
        console.error('Error saving audio message:', dbError);
        toast({
          title: "Error",
          description: "Failed to send audio message",
          variant: "destructive",
        });
        return;
      }

      setIsRecording(false);

      // Send webhook (ignore errors as it's optional)
      try {
        await sendWebhook(message);
      } catch (webhookError) {
        console.warn('Webhook failed (non-critical):', webhookError);
      }

      // Simulate message status updates
      setTimeout(() => {
        // Update status to delivered in database
        supabase
          .from('messages')
          .update({ status: 'delivered' })
          .eq('id', message.id);
      }, 1000);

      setTimeout(() => {
        // Update status to read in database  
        supabase
          .from('messages')
          .update({ status: 'read' })
          .eq('id', message.id);
      }, 3000);

      toast({
        title: "Audio message sent",
        description: `Your voice message was sent to ${otherUser.name}`,
      });
    } catch (error) {
      console.error('Failed to send audio message:', error);
      toast({
        title: "Error", 
        description: "Failed to send audio message",
        variant: "destructive",
      });
    }
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