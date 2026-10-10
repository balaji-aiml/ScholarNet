export type Role = 'student' | 'senior' | 'admin';
export type EventCategory = 'academic' | 'cultural' | 'sports' | 'workshop' | 'career' | 'club' | 'other';

export interface ConnectionInfo {
  id: string;
  status: 'pending' | 'accepted';
  direction: 'incoming' | 'outgoing';
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  role: Role;
  department?: string;
  year?: number;
  skills: string[];
  interests: string[];
  bio?: string;
  connection?: ConnectionInfo | null; // present on list/detail endpoints
}

export interface Comment { _id: string; user: Pick<User, '_id' | 'name' | 'role'>; text: string; createdAt: string }

export interface CampusEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  category: EventCategory;
  organizer: Pick<User, '_id' | 'name' | 'role' | 'department'>;
  likeCount: number;
  liked: boolean;
  comments: Comment[];
}

export interface Message {
  _id: string;
  sender: string;
  recipient: string;
  text: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

// Socket.io contract
export interface ClientToServer {
  'message:send': (p: { to: string; text: string }, ack?: (r: { ok: boolean; error?: string }) => void) => void;
  typing: (p: { to: string; isTyping: boolean }) => void;
  'message:read': (p: { from: string }) => void;
}
export interface ServerToClient {
  'message:new': (m: Message) => void;
  typing: (p: { from: string; isTyping: boolean }) => void;
  'message:read': (p: { by: string }) => void;
}
