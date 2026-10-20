import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { addDays } from 'date-fns';
import { SAMPLE_EVENTS } from '@/data/sample-events';
import { SAMPLE_PROFILES, DEMO_USER_ID } from '@/data/sample-users';
import { KEYS, loadJson, saveJson } from '@/lib/storage';
import {
  Conversation,
  Event,
  EventPhoto,
  FriendRequest,
  Meetup,
  Message,
  NotificationItem,
  Profile,
} from '@/types';
import { useAuth } from './AuthProvider';

interface AppDataContextValue {
  ready: boolean;
  events: Event[];
  goingIds: string[];
  savedIds: string[];
  friendIds: string[];
  friendRequests: FriendRequest[];
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  meetups: Meetup[];
  photos: EventPhoto[];
  notifications: NotificationItem[];
  blockedIds: string[];
  toggleGoing: (eventId: string) => Promise<void>;
  toggleSaved: (eventId: string) => Promise<void>;
  sendFriendRequest: (toUserId: string) => Promise<void>;
  respondFriendRequest: (id: string, accept: boolean) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  ensureDirectConversation: (otherUserId: string) => Promise<string>;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
  markConversationRead: (conversationId: string) => Promise<void>;
  createMeetup: (input: Omit<Meetup, 'id' | 'created_at' | 'member_count' | 'is_joined'>) => Promise<Meetup>;
  toggleMeetupJoin: (meetupId: string) => Promise<void>;
  likePhoto: (photoId: string) => Promise<void>;
  addLocalPhoto: (photo: EventPhoto) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  getCompatibleMatches: () => Profile[];
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function seedConversations(): Conversation[] {
  return [
    {
      id: 'conv-direct-01',
      type: 'direct',
      title: null,
      event_id: null,
      event_group_id: null,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      unread_count: 1,
      members: [
        {
          id: 'cm-1',
          conversation_id: 'conv-direct-01',
          user_id: DEMO_USER_ID,
          last_read_at: null,
          joined_at: new Date().toISOString(),
          left_at: null,
        },
        {
          id: 'cm-2',
          conversation_id: 'conv-direct-01',
          user_id: 'user-sample-01',
          last_read_at: null,
          joined_at: new Date().toISOString(),
          left_at: null,
          profile: SAMPLE_PROFILES[0],
        },
      ],
      last_message: {
        id: 'msg-1',
        conversation_id: 'conv-direct-01',
        sender_id: 'user-sample-01',
        body: 'Are you going to Harbor Lights? Would be fun to meet at the food trucks.',
        message_type: 'text',
        metadata: null,
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 'conv-group-01',
      type: 'event_group',
      title: 'Harbor Lights · Group A',
      event_id: 'evt-sample-01',
      event_group_id: 'eg-01',
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      unread_count: 0,
      last_message: {
        id: 'msg-g1',
        conversation_id: 'conv-group-01',
        sender_id: 'system',
        body: 'Welcome! Icebreaker: What brought you to this event?',
        message_type: 'icebreaker',
        metadata: null,
        created_at: new Date().toISOString(),
      },
    },
  ];
}

function seedMessages(): Record<string, Message[]> {
  return {
    'conv-direct-01': [
      {
        id: 'msg-1',
        conversation_id: 'conv-direct-01',
        sender_id: 'user-sample-01',
        body: 'Are you going to Harbor Lights? Would be fun to meet at the food trucks.',
        message_type: 'text',
        metadata: null,
        created_at: new Date().toISOString(),
        sender: SAMPLE_PROFILES[0],
      },
    ],
    'conv-group-01': [
      {
        id: 'msg-g1',
        conversation_id: 'conv-group-01',
        sender_id: 'system',
        body: 'Welcome! Icebreaker: What brought you to this event?',
        message_type: 'icebreaker',
        metadata: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'msg-g2',
        conversation_id: 'conv-group-01',
        sender_id: 'user-sample-02',
        body: 'First indie night for me — anyone else coming from Capitol Hill?',
        message_type: 'text',
        metadata: null,
        created_at: new Date().toISOString(),
        sender: SAMPLE_PROFILES[1],
      },
    ],
  };
}

function seedNotifications(userId: string): NotificationItem[] {
  return [
    {
      id: 'notif-1',
      user_id: userId,
      type: 'friend_request',
      title: 'New friend request',
      body: 'Jordan Ellis wants to connect on Weby.',
      data: { from_user_id: 'user-sample-02' },
      read_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      user_id: userId,
      type: 'group_open',
      title: 'Your event group is open',
      body: 'Harbor Lights Indie Night group chat is ready.',
      data: { conversation_id: 'conv-group-01', event_id: 'evt-sample-01' },
      read_at: null,
      created_at: new Date().toISOString(),
    },
  ];
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [ready, setReady] = useState(false);
  const [goingIds, setGoingIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessages] = useState<Record<string, Message[]>>({});
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const [
        going,
        saved,
        friends,
        requests,
        convos,
        messages,
        meetupList,
        photoList,
        notifs,
        blocked,
      ] = await Promise.all([
        loadJson<string[]>(KEYS.going, ['evt-sample-01', 'evt-sample-03']),
        loadJson<string[]>(KEYS.saved, ['evt-sample-02']),
        loadJson<string[]>(KEYS.friends, ['user-sample-01']),
        loadJson<FriendRequest[]>(KEYS.friendRequests, [
          {
            id: 'fr-1',
            from_user_id: 'user-sample-02',
            to_user_id: DEMO_USER_ID,
            status: 'pending',
            message: 'Saw you marked going to the trail run!',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            from_profile: SAMPLE_PROFILES[1],
          },
        ]),
        loadJson<Conversation[]>(KEYS.conversations, seedConversations()),
        loadJson<Record<string, Message[]>>(KEYS.messages, seedMessages()),
        loadJson<Meetup[]>(KEYS.meetups, [
          {
            id: 'meetup-1',
            event_id: 'evt-sample-01',
            created_by: 'user-sample-01',
            title: 'Food truck hang before doors',
            description: 'Meet by the taco truck 45 minutes early.',
            meeting_point: 'Pier 14 food truck lane',
            meets_at: SAMPLE_EVENTS[0].starts_at,
            max_attendees: 12,
            created_at: new Date().toISOString(),
            creator: SAMPLE_PROFILES[0],
            member_count: 4,
            is_joined: false,
          },
        ]),
        loadJson<EventPhoto[]>(KEYS.photos, []),
        loadJson<NotificationItem[]>(
          KEYS.notifications,
          seedNotifications(profile?.id ?? DEMO_USER_ID)
        ),
        loadJson<string[]>(KEYS.blocked, []),
      ]);

      setGoingIds(going);
      setSavedIds(saved);
      setFriendIds(friends);
      setFriendRequests(requests);
      setConversations(convos);
      setMessages(messages);
      setMeetups(meetupList);
      setPhotos(photoList);
      setNotifications(notifs);
      setBlockedIds(blocked);
      setReady(true);
    }
    void load();
  }, [profile?.id]);

  const toggleGoing = useCallback(async (eventId: string) => {
    setGoingIds((prev) => {
      const next = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      void saveJson(KEYS.going, next);
      return next;
    });
  }, []);

  const toggleSaved = useCallback(async (eventId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      void saveJson(KEYS.saved, next);
      return next;
    });
  }, []);

  const sendFriendRequest = useCallback(async (toUserId: string) => {
    const req: FriendRequest = {
      id: `fr-${Date.now()}`,
      from_user_id: profile?.id ?? DEMO_USER_ID,
      to_user_id: toUserId,
      status: 'pending',
      message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFriendRequests((prev) => {
      const next = [...prev, req];
      void saveJson(KEYS.friendRequests, next);
      return next;
    });
  }, [profile?.id]);

  const respondFriendRequest = useCallback(async (id: string, accept: boolean) => {
    setFriendRequests((prev) => {
      const next = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: accept ? ('accepted' as const) : ('declined' as const),
              updated_at: new Date().toISOString(),
            }
          : r
      );
      void saveJson(KEYS.friendRequests, next);
      return next;
    });
    if (accept) {
      const req = friendRequests.find((r) => r.id === id);
      if (req) {
        const other =
          req.from_user_id === (profile?.id ?? DEMO_USER_ID)
            ? req.to_user_id
            : req.from_user_id;
        setFriendIds((prev) => {
          const next = prev.includes(other) ? prev : [...prev, other];
          void saveJson(KEYS.friends, next);
          return next;
        });
      }
    }
  }, [friendRequests, profile?.id]);

  const removeFriend = useCallback(async (userId: string) => {
    setFriendIds((prev) => {
      const next = prev.filter((id) => id !== userId);
      void saveJson(KEYS.friends, next);
      return next;
    });
  }, []);

  const blockUser = useCallback(async (userId: string) => {
    setBlockedIds((prev) => {
      const next = prev.includes(userId) ? prev : [...prev, userId];
      void saveJson(KEYS.blocked, next);
      return next;
    });
    await removeFriend(userId);
  }, [removeFriend]);

  const unblockUser = useCallback(async (userId: string) => {
    setBlockedIds((prev) => {
      const next = prev.filter((id) => id !== userId);
      void saveJson(KEYS.blocked, next);
      return next;
    });
  }, []);

  const ensureDirectConversation = useCallback(
    async (otherUserId: string) => {
      const existing = conversations.find(
        (c) =>
          c.type === 'direct' &&
          c.members?.some((m) => m.user_id === otherUserId)
      );
      if (existing) return existing.id;

      const other = SAMPLE_PROFILES.find((p) => p.id === otherUserId);
      const id = `conv-direct-${Date.now()}`;
      const convo: Conversation = {
        id,
        type: 'direct',
        title: null,
        event_id: null,
        event_group_id: null,
        last_message_at: null,
        created_at: new Date().toISOString(),
        unread_count: 0,
        members: [
          {
            id: `${id}-me`,
            conversation_id: id,
            user_id: profile?.id ?? DEMO_USER_ID,
            last_read_at: new Date().toISOString(),
            joined_at: new Date().toISOString(),
            left_at: null,
          },
          {
            id: `${id}-other`,
            conversation_id: id,
            user_id: otherUserId,
            last_read_at: null,
            joined_at: new Date().toISOString(),
            left_at: null,
            profile: other,
          },
        ],
      };
      setConversations((prev) => {
        const next = [convo, ...prev];
        void saveJson(KEYS.conversations, next);
        return next;
      });
      setMessages((prev) => {
        const next = { ...prev, [id]: [] };
        void saveJson(KEYS.messages, next);
        return next;
      });
      return id;
    },
    [conversations, profile?.id]
  );

  const sendMessage = useCallback(
    async (conversationId: string, body: string) => {
      const msg: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: profile?.id ?? DEMO_USER_ID,
        body: body.trim(),
        message_type: 'text',
        metadata: null,
        created_at: new Date().toISOString(),
        sender: profile ?? undefined,
      };
      setMessages((prev) => {
        const list = [...(prev[conversationId] ?? []), msg];
        const next = { ...prev, [conversationId]: list };
        void saveJson(KEYS.messages, next);
        return next;
      });
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === conversationId
            ? { ...c, last_message: msg, last_message_at: msg.created_at }
            : c
        );
        void saveJson(KEYS.conversations, next);
        return next;
      });
    },
    [profile]
  );

  const markConversationRead = useCallback(async (conversationId: string) => {
    setConversations((prev) => {
      const next = prev.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      );
      void saveJson(KEYS.conversations, next);
      return next;
    });
  }, []);

  const createMeetup = useCallback(
    async (
      input: Omit<Meetup, 'id' | 'created_at' | 'member_count' | 'is_joined'>
    ) => {
      const meetup: Meetup = {
        ...input,
        id: `meetup-${Date.now()}`,
        created_at: new Date().toISOString(),
        member_count: 1,
        is_joined: true,
      };
      setMeetups((prev) => {
        const next = [meetup, ...prev];
        void saveJson(KEYS.meetups, next);
        return next;
      });
      return meetup;
    },
    []
  );

  const toggleMeetupJoin = useCallback(async (meetupId: string) => {
    setMeetups((prev) => {
      const next = prev.map((m) => {
        if (m.id !== meetupId) return m;
        const joined = !m.is_joined;
        return {
          ...m,
          is_joined: joined,
          member_count: Math.max(0, (m.member_count ?? 0) + (joined ? 1 : -1)),
        };
      });
      void saveJson(KEYS.meetups, next);
      return next;
    });
  }, []);

  const likePhoto = useCallback(async (photoId: string) => {
    setPhotos((prev) => {
      const next = prev.map((p) =>
        p.id === photoId
          ? {
              ...p,
              liked_by_me: !p.liked_by_me,
              like_count: p.liked_by_me ? p.like_count - 1 : p.like_count + 1,
            }
          : p
      );
      void saveJson(KEYS.photos, next);
      return next;
    });
  }, []);

  const addLocalPhoto = useCallback(async (photo: EventPhoto) => {
    setPhotos((prev) => {
      const next = [photo, ...prev];
      void saveJson(KEYS.photos, next);
      return next;
    });
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      );
      void saveJson(KEYS.notifications, next);
      return next;
    });
  }, []);

  const getCompatibleMatches = useCallback(() => {
    const myInterests = new Set(profile?.interests ?? []);
    return SAMPLE_PROFILES.filter((p) => !friendIds.includes(p.id) && !blockedIds.includes(p.id))
      .map((p) => ({
        profile: p,
        score: p.interests.filter((i) => myInterests.has(i)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.profile);
  }, [profile?.interests, friendIds, blockedIds]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      events: SAMPLE_EVENTS.map((e) => ({
        ...e,
        // Keep sample dates relative to "now" for group-open demos
        starts_at: e.id === 'evt-sample-01' ? addDays(new Date(), 10).toISOString() : e.starts_at,
      })),
      goingIds,
      savedIds,
      friendIds,
      friendRequests,
      conversations,
      messagesByConversation,
      meetups,
      photos,
      notifications,
      blockedIds,
      toggleGoing,
      toggleSaved,
      sendFriendRequest,
      respondFriendRequest,
      removeFriend,
      blockUser,
      unblockUser,
      ensureDirectConversation,
      sendMessage,
      markConversationRead,
      createMeetup,
      toggleMeetupJoin,
      likePhoto,
      addLocalPhoto,
      markNotificationRead,
      getCompatibleMatches,
    }),
    [
      ready,
      goingIds,
      savedIds,
      friendIds,
      friendRequests,
      conversations,
      messagesByConversation,
      meetups,
      photos,
      notifications,
      blockedIds,
      toggleGoing,
      toggleSaved,
      sendFriendRequest,
      respondFriendRequest,
      removeFriend,
      blockUser,
      unblockUser,
      ensureDirectConversation,
      sendMessage,
      markConversationRead,
      createMeetup,
      toggleMeetupJoin,
      likePhoto,
      addLocalPhoto,
      markNotificationRead,
      getCompatibleMatches,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
