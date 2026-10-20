import { SAMPLE_EVENTS, getSampleEventById } from '@/data/sample-events';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Event } from '@/types';

/**
 * Event data access. Today: sample + optional Supabase.
 * Later: swap in a trusted event provider sync without changing screens.
 */
export async function listEvents(filters?: {
  category?: string;
  query?: string;
}): Promise<Event[]> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      let q = supabase.from('events').select('*').eq('is_public', true).order('starts_at');
      if (filters?.category) q = q.eq('category', filters.category);
      if (filters?.query) q = q.ilike('title', `%${filters.query}%`);
      const { data, error } = await q;
      if (!error && data) return data as Event[];
    }
  }

  let events = [...SAMPLE_EVENTS];
  if (filters?.category) {
    events = events.filter((e) => e.category === filters.category);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue_name.toLowerCase().includes(q)
    );
  }
  return events;
}

export async function getEvent(id: string): Promise<Event | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
      if (data) return data as Event;
    }
  }
  return getSampleEventById(id) ?? null;
}
