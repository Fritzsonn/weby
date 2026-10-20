# Weby agent notes

- Friendship-first social event app (not dating).
- Expo Router file-based navigation under `app/`.
- Design tokens live in `constants/theme.ts`.
- Local demo mode works without Supabase; see `.env.example` and `docs/SETUP.md`.
- Never put the Supabase service role key in client code.
- Event group open time is backend-controlled (`supabase/functions/create-event-groups`).
- Safety gaps are listed in `docs/SAFETY.md`.
