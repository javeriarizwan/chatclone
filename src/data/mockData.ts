import { User, Conversation, Message } from "@/types/chat";

export const currentUser: User = {
  id: "user-1",
  name: "Me",
  email: "me@example.com", 
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
  isOnline: true,
};

export const users: User[] = [
  // Start with empty users - they'll be added when contacts are saved
];

export const messages: Message[] = [
  // Start with empty messages - they'll be created when users start chatting
];

export const conversations: Conversation[] = [
  // Start with empty conversations - they'll be created when users add contacts and start chatting
];

export const getMessagesForConversation = (conversationId: string): Message[] => {
  return messages.filter(m => m.conversationId === conversationId).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
};

export const getUserById = (userId: string): User | undefined => {
  if (userId === currentUser.id) return currentUser;
  return users.find(u => u.id === userId);
};

// Helper functions to manage contacts and conversations
export const addContact = (contact: User) => {
  users.push(contact);
};

export const createConversation = (otherUser: User): Conversation => {
  const conversation: Conversation = {
    id: `conv-${Date.now()}`,
    participants: [currentUser, otherUser],
    lastMessage: undefined,
    unreadCount: 0,
    updatedAt: new Date(),
  };
  conversations.push(conversation);
  return conversation;
};

export const addMessage = (message: Message) => {
  messages.push(message);
  
  // Update conversation's last message and timestamp
  const conversation = conversations.find(c => c.id === message.conversationId);
  if (conversation) {
    conversation.lastMessage = message;
    conversation.updatedAt = message.createdAt;
  }
};