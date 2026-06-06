import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users, CheckSquare, Clock, CheckCircle2, XCircle,
  TrendingUp, ArrowRight, CalendarDays, Activity,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/dashboard/stats-card';
import { StatusBadge, LeaveTypeBadge } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/login');

  const [{ data: leaves }, { data: profiles }] = await Promise.all([
    supabase.from('leaves').select('*, profiles!leaves_student_id_fkey(*)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*'),
  ]);

  const allLeaves = leaves || [];
  const allProfiles = profiles || [];

  const stats = {
    total: allLeaves.length,
    pending: allLeaves.filter((l) => l.status === 'pending').length,
    approved: allLeaves.filter((l) => l.status === 'approved').length,
    rejected: allLeaves.filter((l) => l.status === 'rejected').length,
    students: allProfiles.filter((p) => p.role === 'student').length,
    faculty: allProfiles.filter((p) => p.role === 'faculty').length,
  };

  const approvalRate = stats.total > 0
    ? Math.round((stats.approved / (stats.approved + stats.rejected || 1)) * 100)
    : 0;

  const recentLeaves = allLeaves.slice(0, 8);

  // Leave type breakdown
  const leaveTypeBreakdown = ['sick', 'personal', 'medical', 'other'].map((type) => ({
    type,
    count: allLeaves.filter((l) => l.leave_type === type).length,
    percentage: allLeaves.length > 0
      ? Math.round((allLeaves.filter((l) => l.leave_type === type).length / allLeaves.length) * 100)
      : 0,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          System overview and leave management analytics
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Requests" value={stats.total} icon={CheckSquare} iconColor="text-indigo-600" iconBg="bg-indigo-100 dark:bg-indigo-900/30" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-100 dark:bg-amber-900/30" />
        <StatsCard title="Approved" value={stats.approved} icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-100 dark:bg-emerald-900/30" />
        <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} iconColor="text-red-500" iconBg="bg-red-100 dark:bg-red-900/30" />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold mt-1">{stats.students}</p>
              </div>
              <div className="rounded-xl p-3 bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faculty Members</p>
                <p className="text-3xl font-bold mt-1">{stats.faculty}</p>
              </div>
              <div className="rounded-xl p-3 bg-violet-100 dark:bg-violet-900/30">
                <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
                <p className="text-3xl font-bold mt-1">{approvalRate}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Of reviewed leaves</p>
              </div>
              <div className="rounded-xl p-3 bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leave Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveTypeBreakdown.map(({ type, count, percentage }) => (
              <div key={type} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{type} Leave</span>
                  <span className="text-muted-foreground">{count} ({percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {allLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/requests" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No leave requests yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLeaves.map((leave: any) => (
                  <div key={leave.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{leave.profiles?.full_name || 'Unknown'}</span>
                        <LeaveTypeBadge type={leave.leave_type} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                      </p>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
