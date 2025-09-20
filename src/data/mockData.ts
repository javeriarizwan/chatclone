import { User, Conversation, Message } from "@/types/chat";

export const currentUser: User = {
  id: "user-1",
  name: "You",
  email: "you@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
  isOnline: true,
};

export const users: User[] = [
  {
    id: "user-2", 
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: "user-3",
    name: "Bob Smith", 
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "user-4",
    name: "Carol White",
    email: "carol@example.com", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: "user-5",
    name: "David Brown",
    email: "david@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

export const messages: Message[] = [
  // Conversation with Alice
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-2",
    type: "text",
    content: "Hey! How are you doing?",
    status: "read",
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: "msg-2", 
    conversationId: "conv-1",
    senderId: "user-1",
    type: "text",
    content: "I'm doing great! Just working on a new messaging app project.",
    status: "read",
    createdAt: new Date(Date.now() - 55 * 60 * 1000),
  },
  {
    id: "msg-3",
    conversationId: "conv-1", 
    senderId: "user-2",
    type: "audio",
    content: "data:audio/wav;base64,mock-audio-data",
    status: "read",
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    duration: 12,
  },
  {
    id: "msg-4",
    conversationId: "conv-1",
    senderId: "user-1", 
    type: "text",
    content: "That sounds awesome! Let me know if you need any help.",
    status: "delivered",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "msg-5",
    conversationId: "conv-1",
    senderId: "user-2", 
    type: "text",
    content: "Will do! Thanks 😊",
    status: "sent",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },

  // Conversation with Bob
  {
    id: "msg-6",
    conversationId: "conv-2",
    senderId: "user-1",
    type: "text", 
    content: "Hey Bob, are we still on for the meeting tomorrow?",
    status: "delivered",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: "msg-7",
    conversationId: "conv-2",
    senderId: "user-3",
    type: "text",
    content: "Yes, absolutely! See you at 2 PM.",
    status: "read",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },

  // Conversation with Carol
  {
    id: "msg-8", 
    conversationId: "conv-3",
    senderId: "user-4",
    type: "text",
    content: "Check out this new restaurant I found!",
    status: "sent",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "msg-9",
    conversationId: "conv-3",
    senderId: "user-4",
    type: "audio",
    content: "data:audio/wav;base64,mock-audio-data-2",
    status: "sent", 
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 8,
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv-1", 
    participants: [currentUser, users[0]],
    lastMessage: messages.find(m => m.id === "msg-5"),
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "conv-2",
    participants: [currentUser, users[1]], 
    lastMessage: messages.find(m => m.id === "msg-7"),
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "conv-3",
    participants: [currentUser, users[2]],
    lastMessage: messages.find(m => m.id === "msg-9"),
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "conv-4", 
    participants: [currentUser, users[3]],
    lastMessage: undefined,
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
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