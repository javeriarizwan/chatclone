export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline?: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'audio';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string; // text content or audio file URL
  status: MessageStatus;
  createdAt: Date;
  duration?: number; // for audio messages in seconds
}