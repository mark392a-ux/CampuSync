import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LeaveApplicationForm } from '@/components/forms/leave-application-form';
import { Button } from '@/components/ui/button';

export default async function ApplyLeavePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'student') redirect('/student');

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Apply for Leave</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fill in the form below to submit your leave request
          </p>
        </div>
      </div>

      <LeaveApplicationForm profile={profile} />
    </div>
  );
}
