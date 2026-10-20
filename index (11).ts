/**
 * Awards gamification points after verifying the action server-side.
 * Call only with the service role (from other edge functions or trusted jobs).
 * Clients must never write points_transactions directly.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const POINTS: Record<string, number> = {
  complete_profile: 50,
  attend_event: 40,
  organize_meetup: 60,
  share_memory: 30,
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response('Missing server secrets', { status: 500 });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.includes(serviceKey)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { user_id, action, reference_type, reference_id } = body as {
    user_id?: string;
    action?: string;
    reference_type?: string;
    reference_id?: string;
  };

  if (!user_id || !action || !(action in POINTS)) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  // Do not reward chat spam / repetitive messaging
  if (action === 'send_message') {
    return new Response(JSON.stringify({ error: 'Messaging is not rewarded' }), { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const points = POINTS[action];

  const { error: txError } = await supabase.from('points_transactions').insert({
    user_id,
    action,
    points,
    reference_type: reference_type ?? null,
    reference_id: reference_id ?? null,
  });

  if (txError) {
    // Unique index prevents duplicate rewards for the same reference
    return new Response(JSON.stringify({ error: txError.message, deduped: true }), { status: 409 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user_id)
    .single();

  const nextPoints = (profile?.points ?? 0) + points;
  const nextLevel = Math.max(1, Math.floor(nextPoints / 100) + 1);

  await supabase
    .from('profiles')
    .update({ points: nextPoints, level: nextLevel })
    .eq('id', user_id);

  return new Response(
    JSON.stringify({ ok: true, points_awarded: points, total: nextPoints, level: nextLevel }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
