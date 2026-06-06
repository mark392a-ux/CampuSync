import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminRequestsClient from './client';

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/admin');
  return <AdminRequestsClient profile={profile} />;
}
