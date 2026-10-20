export type UUID = string;

export type EventCategory =
  | 'music'
  | 'sports'
  | 'arts'
  | 'food'
  | 'tech'
  | 'outdoors'
  | 'community'
  | 'nightlife'
  | 'wellness'
  | 'film';

export interface Profile {
  id: UUID;
  display_name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  interests: string[];
  languages: string[];
  birth_year: number | null;
  city: string | null;
  show_age: boolean;
  show_city: boolean;
  show_upcoming_events: boolean;
  allow_friend_requests: boolean;
  onboarding_complete: boolean;
  points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: UUID;
  external_id: string | null;
  source: 'sample' | 'manual' | 'provider';
  title: string;
  description: string;
  category: EventCategory;
  image_url: string;
  venue_name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  tags: string[];
  is_public: boolean;
  created_by: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: UUID;
  event_id: UUID;
  user_id: UUID;
  status: 'going' | 'interested' | 'cancelled';
  created_at: string;
  profile?: Profile;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface FriendRequest {
  id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  status: FriendRequestStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
  from_profile?: Profile;
  to_profile?: Profile;
}

export interface Friendship {
  id: UUID;
  user_a_id: UUID;
  user_b_id: UUID;
  created_at: string;
  friend?: Profile;
}

export interface Conversation {
  id: UUID;
  type: 'direct' | 'event_group';
  title: string | null;
  event_id: UUID | null;
  event_group_id: UUID | null;
  last_message_at: string | null;
  created_at: string;
  members?: ConversationMember[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationMember {
  id: UUID;
  conversation_id: UUID;
  user_id: UUID;
  last_read_at: string | null;
  joined_at: string;
  left_at: string | null;
  profile?: Profile;
}

export interface Message {
  id: UUID;
  conversation_id: UUID;
  sender_id: UUID;
  body: string;
  message_type: 'text' | 'system' | 'poll' | 'icebreaker';
  metadata: Record<string, unknown> | null;
  created_at: string;
  sender?: Profile;
}

export interface EventGroup {
  id: UUID;
  event_id: UUID;
  conversation_id: UUID;
  name: string;
  language: string | null;
  age_band: string | null;
  interest_tags: string[];
  opens_at: string;
  max_members: number;
  created_at: string;
  event?: Event;
  member_count?: number;
}

export interface Meetup {
  id: UUID;
  event_id: UUID;
  created_by: UUID;
  title: string;
  description: string | null;
  meeting_point: string;
  meets_at: string;
  max_attendees: number | null;
  created_at: string;
  creator?: Profile;
  member_count?: number;
  is_joined?: boolean;
}

export interface EventAlbum {
  id: UUID;
  event_id: UUID;
  uploads_open_until: string;
  is_read_only: boolean;
  created_at: string;
}

export interface EventPhoto {
  id: UUID;
  album_id: UUID;
  event_id: UUID;
  uploader_id: UUID;
  storage_path: string;
  caption: string | null;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  like_count: number;
  created_at: string;
  uploader?: Profile;
  liked_by_me?: boolean;
  signed_url?: string;
}

export interface NotificationItem {
  id: UUID;
  user_id: UUID;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface PointsTransaction {
  id: UUID;
  user_id: UUID;
  action: string;
  points: number;
  reference_type: string | null;
  reference_id: UUID | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Report {
  id: UUID;
  reporter_id: UUID;
  target_type: 'user' | 'message' | 'photo' | 'meetup';
  target_id: UUID;
  reason: string;
  details: string | null;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
}
