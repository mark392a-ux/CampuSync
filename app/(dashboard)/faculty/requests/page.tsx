import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FacultyRequestsClient from './client';

export default async function FacultyRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'faculty') redirect('/faculty');

  return <FacultyRequestsClient profile={profile} />;
}
