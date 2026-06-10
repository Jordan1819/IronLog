import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authHeader = req.headers.get('Authorization')

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Account deletion is not configured.' }, 500)
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing authorization token.' }, 401)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const accessToken = authHeader.replace('Bearer ', '')

  const { data: { user }, error: userError } = await adminClient.auth.getUser(accessToken)
  if (userError || !user) {
    return jsonResponse({ error: 'Invalid or expired session.' }, 401)
  }

  const userId = user.id
  const deleteSteps = [
    adminClient.from('sets').delete().eq('user_id', userId),
    adminClient.from('workout_sessions').delete().eq('user_id', userId),
    adminClient.from('exercises').delete().eq('user_id', userId),
  ]

  for (const step of deleteSteps) {
    const { error } = await step
    if (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId)
  if (deleteUserError) {
    return jsonResponse({ error: deleteUserError.message }, 500)
  }

  return jsonResponse({ ok: true })
})

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
