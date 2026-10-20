/**
 * Creates event group chats for events starting in ~14 days.
 *
 * Schedule with Supabase Cron (pg_cron) or an external scheduler:
 *   POST /functions/v1/create-event-groups
 * Authorization: Bearer <SERVICE_ROLE_KEY>
 *
 * Opening time is evaluated with server time (now()), never the client clock.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const GROUP_SIZE_TARGET = 25;
const GROUP_SIZE_MAX = 30;
const OPEN_WINDOW_DAYS = 14;

type AttendeeRow = {
  user_id: string;
  profiles: {
    interests: string[];
    languages: string[];
    birth_year: number | null;
  } | null;
};

function ageBand(birthYear: number | null): string {
  if (!birthYear) return 'open';
  const age = new Date().getFullYear() - birthYear;
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  return '45+';
}

function sharedInterest(a: string[], b: string[]) {
  return a.filter((x) => b.includes(x));
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response('Missing server secrets', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date();
  const windowStart = new Date(now.getTime() + (OPEN_WINDOW_DAYS - 0.5) * 86400000);
  const windowEnd = new Date(now.getTime() + (OPEN_WINDOW_DAYS + 0.5) * 86400000);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, title, starts_at')
    .gte('starts_at', windowStart.toISOString())
    .lte('starts_at', windowEnd.toISOString());

  if (eventsError) {
    return new Response(JSON.stringify({ error: eventsError.message }), { status: 500 });
  }

  const created: string[] = [];

  for (const event of events ?? []) {
    const { data: existing } = await supabase
      .from('event_groups')
      .select('id')
      .eq('event_id', event.id)
      .limit(1);

    if (existing && existing.length > 0) continue;

    const { data: attendees } = await supabase
      .from('event_attendees')
      .select('user_id, profiles(interests, languages, birth_year)')
      .eq('event_id', event.id)
      .eq('status', 'going');

    const rows = (attendees ?? []) as unknown as AttendeeRow[];
    if (rows.length === 0) continue;

    // Greedy grouping by language + age band + shared interests
    const remaining = [...rows];
    let groupIndex = 0;

    while (remaining.length > 0) {
      groupIndex += 1;
      const seed = remaining.shift()!;
      const seedLang = seed.profiles?.languages?.[0] ?? null;
      const seedBand = ageBand(seed.profiles?.birth_year ?? null);
      const seedInterests = seed.profiles?.interests ?? [];

      const members = [seed];
      for (let i = remaining.length - 1; i >= 0 && members.length < GROUP_SIZE_MAX; i -= 1) {
        const candidate = remaining[i];
        const sameLang =
          !seedLang ||
          (candidate.profiles?.languages ?? []).includes(seedLang);
        const sameBand = ageBand(candidate.profiles?.birth_year ?? null) === seedBand;
        const overlap = sharedInterest(seedInterests, candidate.profiles?.interests ?? []);
        if (sameLang && (sameBand || overlap.length > 0 || remaining.length < GROUP_SIZE_TARGET)) {
          members.push(candidate);
          remaining.splice(i, 1);
        }
      }

      // Absorb leftovers into the last small group gracefully
      if (remaining.length > 0 && remaining.length < 8 && members.length < GROUP_SIZE_MAX) {
        while (remaining.length && members.length < GROUP_SIZE_MAX) {
          members.push(remaining.shift()!);
        }
      }

      const opensAt = new Date(new Date(event.starts_at).getTime() - OPEN_WINDOW_DAYS * 86400000);

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'event_group',
          title: `${event.title} · Group ${String.fromCharCode(64 + groupIndex)}`,
          event_id: event.id,
        })
        .select('id')
        .single();

      if (convError || !conversation) continue;

      const { data: group, error: groupError } = await supabase
        .from('event_groups')
        .insert({
          event_id: event.id,
          conversation_id: conversation.id,
          name: `${event.title} · Group ${String.fromCharCode(64 + groupIndex)}`,
          language: seedLang,
          age_band: seedBand,
          interest_tags: seedInterests.slice(0, 5),
          opens_at: opensAt.toISOString(),
          max_members: GROUP_SIZE_MAX,
        })
        .select('id')
        .single();

      if (groupError || !group) continue;

      await supabase
        .from('conversations')
        .update({ event_group_id: group.id })
        .eq('id', conversation.id);

      const memberRows = members.map((m) => ({
        event_group_id: group.id,
        user_id: m.user_id,
      }));
      await supabase.from('event_group_members').upsert(memberRows);

      const conversationMembers = members.map((m) => ({
        conversation_id: conversation.id,
        user_id: m.user_id,
      }));
      await supabase.from('conversation_members').upsert(conversationMembers);

      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: members[0].user_id,
        body: 'Welcome! Icebreaker: What brought you to this event?',
        message_type: 'icebreaker',
      });

      const notifications = members.map((m) => ({
        user_id: m.user_id,
        type: 'group_open',
        title: 'Your event group is ready',
        body: `${event.title} group chat opens 14 days before the event.`,
        data: { event_id: event.id, conversation_id: conversation.id, event_group_id: group.id },
      }));
      await supabase.from('notifications').insert(notifications);

      created.push(group.id);
    }
  }

  return new Response(JSON.stringify({ created_groups: created.length, group_ids: created }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
