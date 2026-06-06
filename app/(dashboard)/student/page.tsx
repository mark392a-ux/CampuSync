import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/dashboard/stats-card';
import { StatusBadge, LeaveTypeBadge } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, calculateLeaveDays } from '@/lib/utils';

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  // Use getUser() instead of getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile with error handling
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log("USER:", user.id);
  console.log("PROFILE:", profile);
  console.log("PROFILE ERROR:", profileError);

  // Prevent redirect loops
  if (profileError || !profile) {
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold">Profile not found</h1>
        <p>Please logout and login again.</p>
      </div>
    );
  }

  if (profile.role !== 'student') {
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold">
          Wrong Role: {profile.role}
        </h1>
      </div>
    );
  }

  const { data: leaves } = await supabase
    .from('leaves')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  const allLeaves = leaves || [];

  const stats = {
    total: allLeaves.length,
    pending: allLeaves.filter((l) => l.status === 'pending').length,
    approved: allLeaves.filter((l) => l.status === 'approved').length,
    rejected: allLeaves.filter((l) => l.status === 'rejected').length,
  };

  const recentLeaves = allLeaves.slice(0, 5);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {greeting()},
          </p>

          <h1 className="text-2xl font-bold mt-1">
            {profile.full_name} 👋
          </h1>
        </div>

        <Button asChild>
          <Link href="/student/apply">
            <PlusCircle className="h-4 w-4" />
            Apply for Leave
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatsCard
          title="Total"
          value={stats.total}
          description="Applications"
          icon={ClipboardList}
        />

        <StatsCard
          title="Pending"
          value={stats.pending}
          description="Awaiting review"
          icon={Clock}
        />

        <StatsCard
          title="Approved"
          value={stats.approved}
          description="Granted"
          icon={CheckCircle2}
        />

        <StatsCard
          title="Rejected"
          value={stats.rejected}
          description="Declined"
          icon={XCircle}
        />

      </div>

      <Card>

        <CardHeader className="flex flex-row justify-between">

          <CardTitle>
            Recent Applications
          </CardTitle>

          <Button variant="ghost" asChild>
            <Link href="/student/applications">

              View all

              <ArrowRight className="h-4 w-4"/>

            </Link>
          </Button>

        </CardHeader>

        <CardContent>

          {recentLeaves.length === 0 ? (

            <p>No leave applications yet.</p>

          ) : (

            recentLeaves.map((leave) => {

              const days =
                calculateLeaveDays(
                  leave.start_date,
                  leave.end_date
                );

              return (

                <div
                  key={leave.id}
                  className="border rounded p-3 mb-3"
                >

                  <div className="flex gap-2">

                    <LeaveTypeBadge type={leave.leave_type} />

                    <StatusBadge status={leave.status} />

                  </div>

                  <p className="text-sm mt-2">

                    {formatDate(leave.start_date)}
                    {' - '}
                    {formatDate(leave.end_date)}

                  </p>

                  <p className="text-sm">

                    {days} day(s)

                  </p>

                </div>

              );

            })

          )}

        </CardContent>

      </Card>

    </div>
  );
}

