export interface User {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar: string;
  interests: string[];
  range_miles: number;
  visible: boolean | number;
  points: number;
  created_at?: string;
}

export interface NearbyUser {
  id: number;
  display_name: string;
  avatar: string;
  interests: string[];
  sharedInterests: string[];
  lat: number;
  lng: number;
  distance: number;
}

export interface Friend {
  id: number;
  display_name: string;
  avatar: string;
  interests: string[];
  status: string;
  friend_record_id: number;
}

export interface ChatChannel {
  id: number;
  user1_id: number;
  user2_id: number;
  user1_name: string;
  user1_avatar: string;
  user2_name: string;
  user2_avatar: string;
  last_message?: string;
  last_message_at?: string;
}

export interface Message {
  id: number;
  channel_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender_name: string;
  sender_avatar: string;
}

export interface Mission {
  id: number;
  user_id: number;
  mission_key: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  name: string;
  description: string;
  goal: number;
  timeRemaining: string;
  points: number;
}

export interface AuthState {
  token: string | null;
  userId: number | null;
  username: string | null;
}
