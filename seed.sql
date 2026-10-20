-- Optional seed for a connected Supabase project.
-- Sample events only — not live listings.

insert into public.events (
  id, source, title, description, category, image_url,
  venue_name, address, city, starts_at, ends_at, tags, is_public
) values
(
  '11111111-1111-1111-1111-111111111101',
  'sample',
  'Harbor Lights Indie Night',
  'Sample event for Weby development. Not a live listing.',
  'music',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
  'Pier 14 Amphitheater',
  '14 Harbor Way',
  'Seattle',
  now() + interval '18 days',
  now() + interval '18 days' + interval '3 hours',
  array['indie','live music','outdoor'],
  true
)
on conflict (id) do nothing;
