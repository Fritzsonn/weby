# Weby setup

## Run the app (local demo)

Weby runs without Supabase using local demo auth and sample events.

```bash
cd weby
npm install
npx expo start
```

Then open in Expo Go (iOS/Android) or press `w` for web.

Sample events are clearly labeled **Sample** and are not live real-world listings.

## Connect Supabase

1. Create a Supabase project.
2. Copy `.env.example` → `.env` and set:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Apply SQL: `supabase/migrations/20260319120000_init_weby.sql`
4. Deploy edge functions:
   - `create-event-groups`
   - `award-points`
5. **Never** add `SUPABASE_SERVICE_ROLE_KEY` to the mobile app or Expo public env vars.

## Scheduled event group creation

Group chats must open **14 days before** the event based on **server time**.

Recommended schedule (daily):

```bash
# Example: call the edge function with the service role from a trusted scheduler
curl -X POST "$SUPABASE_URL/functions/v1/create-event-groups" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Options:

- Supabase scheduled functions / cron
- GitHub Actions cron
- Any external job runner with the service role secret

The function:

- Selects events ~14 days out
- Groups attendees (~20–30) by language, age band, shared interests
- Prevents duplicate membership
- Creates conversation + icebreaker
- Inserts notifications

RLS also requires `opens_at <= now()` before members can read groups.

## Memories storage

- Bucket: `event-memories` (private)
- Path convention: `{user_id}/{event_id}/{filename}`
- Issue short-lived signed URLs from an edge function after checking attendance + moderation
- Uploads close 7 days after the event (`event_albums.uploads_open_until`)

## Push notifications

Expo Notifications is installed. To enable:

1. Configure an EAS project and set `extra.eas.projectId` in `app.json`
2. Request permissions on a physical device
3. Store push tokens server-side and send via Expo Push API from a trusted backend

## Safety features — implementation status

| Feature | Status |
| --- | --- |
| Block / unblock | Client + schema ready |
| Report user/photo/message | Client flows + `reports` table; human review queue not built |
| Privacy toggles | Implemented |
| Account deletion UI | Confirmation flow; production needs secure backend wipe |
| Age gate | Documented; enforce in auth hook before launch |
| Photo moderation | `pending/approved/flagged` statuses; human review required |
| Points anti-cheat | Edge function + DB constraints; client cannot insert points |

Automated moderation alone is **not** sufficient for photo or chat safety.

## Event provider integration

`events.source` supports `sample | manual | provider` and optional `external_id`.
Add a sync job later that upserts provider events without changing mobile screens.
