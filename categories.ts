import { EventCategory } from '@/types';

export const EVENT_CATEGORIES: {
  id: EventCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { id: 'music', label: 'Music', icon: 'musical-notes', color: '#0F6B6B' },
  { id: 'sports', label: 'Sports', icon: 'football', color: '#2F9E6F' },
  { id: 'arts', label: 'Arts', icon: 'color-palette', color: '#E86F4A' },
  { id: 'food', label: 'Food', icon: 'restaurant', color: '#D4920A' },
  { id: 'tech', label: 'Tech', icon: 'hardware-chip', color: '#2B7A9E' },
  { id: 'outdoors', label: 'Outdoors', icon: 'leaf', color: '#3D8B5F' },
  { id: 'community', label: 'Community', icon: 'people', color: '#0A4F4F' },
  { id: 'nightlife', label: 'Nightlife', icon: 'moon', color: '#4A5A8A' },
  { id: 'wellness', label: 'Wellness', icon: 'fitness', color: '#5B8A7A' },
  { id: 'film', label: 'Film', icon: 'film', color: '#8A5A4A' },
];

export const INTEREST_OPTIONS = [
  'Live music',
  'Hiking',
  'Photography',
  'Cooking',
  'Board games',
  'Running',
  'Art galleries',
  'Startups',
  'Volunteering',
  'Film nights',
  'Coffee chats',
  'Language exchange',
  'Cycling',
  'Yoga',
  'Food markets',
  'Book clubs',
  'Dancing',
  'Travel',
  'Gaming',
  'Sustainability',
];

export const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Italian',
  'Dutch',
  'Arabic',
  'Mandarin',
  'Japanese',
  'Korean',
  'Hindi',
];

export const ICEBREAKER_QUESTIONS = [
  'What brought you to this event?',
  'Coffee or tea before we go in?',
  'First time at this venue?',
  'One song that always puts you in a good mood?',
  'Who here has the best local food tip?',
  'Introvert recharge or social battery full?',
];
