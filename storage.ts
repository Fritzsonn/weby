import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  session: 'weby.local.session',
  profile: 'weby.local.profile',
  onboarding: 'weby.local.onboardingDone',
  going: 'weby.local.goingEventIds',
  saved: 'weby.local.savedEventIds',
  friends: 'weby.local.friendIds',
  friendRequests: 'weby.local.friendRequests',
  blocked: 'weby.local.blockedIds',
  messages: 'weby.local.messages',
  conversations: 'weby.local.conversations',
  meetups: 'weby.local.meetups',
  photos: 'weby.local.photos',
  notifications: 'weby.local.notifications',
  points: 'weby.local.points',
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

export async function loadJson<T>(key: StorageKey, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: StorageKey, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: StorageKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export { KEYS };
