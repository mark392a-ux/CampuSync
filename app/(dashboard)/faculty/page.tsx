import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckSquare, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/dashboard/stats-card';
import { StatusBadge, LeaveTypeBadge } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, calculateLeaveDays } from '@/lib/utils';

export default async function FacultyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'faculty') redirect('/login');

  // Fetch all leaves with student profiles
  const { data: leaves } = await supabase
    .from('leaves')
    .select('*, profiles!leaves_student_id_fkey(*)')
    .order('created_at', { ascending: false });

  const allLeaves = leaves || [];
  const stats = {
    total: allLeaves.length,
    pending: allLeaves.filter((l) => l.status === 'pending').length,
    approved: allLeaves.filter((l) => l.status === 'approved').length,
    rejected: allLeaves.filter((l) => l.status === 'rejected').length,
  };

  const pendingLeaves = allLeaves.filter((l) => l.status === 'pending').slice(0, 5);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {profile.full_name}. Here&apos;s what needs your attention.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Requests" value={stats.total} icon={CheckSquare} iconColor="text-indigo-600" iconBg="bg-indigo-100 dark:bg-indigo-900/30" />
        <StatsCard title="Pending Review" value={stats.pending} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-100 dark:bg-amber-900/30" />
        <StatsCard title="Approved" value={stats.approved} icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-100 dark:bg-emerald-900/30" />
        <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} iconColor="text-red-500" iconBg="bg-red-100 dark:bg-red-900/30" />
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Pending Reviews</CardTitle>
            {stats.pending > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                {stats.pending} request{stats.pending > 1 ? 's' : ''} awaiting your review
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/faculty/requests" className="gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pendingLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending leave requests to review.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map((leave: any) => {
                const days = calculateLeaveDays(leave.start_date, leave.end_date);
                return (
                  <div key={leave.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{leave.profiles?.full_name || 'Unknown'}</span>
                        <LeaveTypeBadge type={leave.leave_type} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(leave.start_date)} – {formatDate(leave.end_date)} ({days} day{days > 1 ? 's' : ''})
                      </p>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
