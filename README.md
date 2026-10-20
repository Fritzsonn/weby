# Weby

**Meet your people before the moment.**

Weby is a friendship-first social app for real-world events — discover gatherings, join event group chats early, plan meetups, and share memories. It is **not** a dating app.

## Stack

- Expo SDK 58 + Expo Router + TypeScript
- React Native (iOS & Android)
- Supabase (auth, Postgres, storage, realtime) when configured
- Local demo mode when Supabase env vars are missing

## Quick start

```bash
npm install
npx expo start
```

Optional: copy `.env.example` to `.env` and add Supabase keys (see `docs/SETUP.md`).

## Project layout

```
app/                 Expo Router screens (auth, tabs, events, chat, settings)
components/          UI + feature components
constants/           Theme, categories
data/                Sample events & profiles (dev only)
providers/           Auth + app data
supabase/            SQL migrations + edge functions
docs/                Setup & safety notes
```

## Features included

- Onboarding, signup/login, profile setup
- Home feed, discover/search, event details
- I’m Going / save favorites, attendees, meetups
- Friends, Weby Match (friend discovery, not dating)
- Private chat + event group chat foundations
- Weby Memories albums with upload window
- Notifications, settings, privacy, block/report
- Full Postgres schema + RLS + scheduled group job design
- Gamification points awarded only via backend validation

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run typecheck` | TypeScript check |
| `npm run android` / `ios` / `web` | Platform targets |

## License

Private project scaffold — update as needed for your org.
