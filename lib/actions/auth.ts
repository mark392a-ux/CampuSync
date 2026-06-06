'use server';

import { createAdminClient } from '@/lib/supabase/server';

/**
 * Creates a profile row using the service-role client.
 * Called after signUp() succeeds on the client side.
 * The service-role key bypasses RLS, so the insert always works.
 */
export async function createProfile(params: {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'admin';
}) {
  const admin = createAdminClient();

  // Upsert so re-tries don't fail on duplicate
  const { error } = await admin.from('profiles').upsert(
    {
      id: params.id,
      email: params.email,
      full_name: params.full_name,
      role: params.role,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('[createProfile] error:', error);
    return { error: error.message };
  }

  return { error: null };
}
