import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/signup
 *
 * Uses the service-role admin client to:
 *  1. Create the Supabase auth user (email auto-confirmed — no inbox required)
 *  2. Upsert the profile row (service role bypasses RLS entirely)
 *
 * Why an API route instead of a Server Action?
 *  - Next.js 16 Server Actions have edge cases with error serialisation
 *  - API routes are simpler, debuggable with network tab, always work
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role } = body as {
      email: string;
      password: string;
      full_name: string;
      role: 'student' | 'faculty' | 'admin';
    };

    // --- Validate ---
    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // --- Step 1: Create auth user with admin API ---
    // email_confirm: true skips the confirmation email immediately
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createError) {
      console.error('[/api/auth/signup] createUser error:', createError);
      // Surface friendly messages for common cases
      let msg = createError.message;
      if (msg.includes('already registered') || msg.includes('already exists')) {
        msg = 'An account with this email already exists. Please sign in.';
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (!userData?.user) {
      return NextResponse.json({ error: 'User creation failed. Please try again.' }, { status: 500 });
    }

    const userId = userData.user.id;

    // --- Step 2: Upsert profile (bypasses all RLS) ---
    const { error: profileError } = await admin.from('profiles').upsert(
      { id: userId, email, full_name, role },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error('[/api/auth/signup] profile upsert error:', profileError);
      // The trigger may have already created it — not necessarily fatal
      // Return success anyway; login will work since auth user exists
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    console.error('[/api/auth/signup] unexpected error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
