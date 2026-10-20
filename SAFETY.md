# Weby safety notes

Weby is friendship-first. The following safety-critical areas are partially implemented and must be completed before a public launch.

## Implemented foundations

- Block / unblock users (client + `blocked_users` table)
- Report flows for users and photos (client + `reports` table)
- Privacy toggles for age, city, upcoming events, friend requests
- Private storage bucket for memories (not public by default)
- Photo moderation statuses: pending / approved / rejected / flagged
- RLS so only conversation members can read messages
- Event group open time enforced with server `now()` + edge function
- Points awarded only through service-role edge function

## Not fully implemented (must finish before production)

1. **Human moderation queue** — reports land in the database; there is no staff console yet.
2. **Automated abuse filters** — optional helpers only; never rely on them alone for photos or chat.
3. **Account deletion backend** — UI confirmation exists; production needs a secure wipe of auth user, storage objects, and personal rows.
4. **Age gate enforcement** — document minimum age in product policy and enforce in an auth hook / signup check.
5. **Push notification delivery** — Expo Notifications installed; token registration + server send pipeline still required.
6. **Signed URL issuer for shared memories** — attendees beyond the uploader should receive short-lived signed URLs from an edge function after attendance + moderation checks.
7. **Impersonation / spam rate limits** — add server-side throttles on friend requests, messages, and uploads.

## Product rules

- Weby Match is for **friendship discovery only**, never romantic matching.
- Do not expose precise live location by default in meetups.
- Group chats are limited to “I’m Going” attendees and open 14 days before the event via backend jobs.
