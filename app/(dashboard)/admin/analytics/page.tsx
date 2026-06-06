import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  BarChart3, TrendingUp, Users, CalendarDays,
  CheckCircle2, XCircle, Clock, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { LeaveTypeBadge, StatusBadge } from '@/components/dashboard/status-badge';
import { formatDate } from '@/lib/utils';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/admin');

  const [{ data: leaves }, { data: profiles }] = await Promise.all([
    supabase.from('leaves').select('*, profiles!leaves_student_id_fkey(full_name, email)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*'),
  ]);

  const allLeaves = leaves || [];
  const allProfiles = profiles || [];

  // Core stats
  const stats = {
    total: allLeaves.length,
    pending: allLeaves.filter((l) => l.status === 'pending').length,
    approved: allLeaves.filter((l) => l.status === 'approved').length,
    rejected: allLeaves.filter((l) => l.status === 'rejected').length,
  };

  const approvalRate = (stats.approved + stats.rejected) > 0
    ? ((stats.approved / (stats.approved + stats.rejected)) * 100).toFixed(1)
    : '0.0';

  const rejectionRate = (stats.approved + stats.rejected) > 0
    ? ((stats.rejected / (stats.approved + stats.rejected)) * 100).toFixed(1)
    : '0.0';

  // Leave type breakdown
  const leaveTypes = ['sick', 'personal', 'medical', 'other'] as const;
  const typeBreakdown = leaveTypes.map((type) => {
    const count = allLeaves.filter((l) => l.leave_type === type).length;
    return { type, count, pct: allLeaves.length > 0 ? Math.round((count / allLeaves.length) * 100) : 0 };
  });

  // Monthly trend – last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toISOString().slice(0, 7); // "YYYY-MM"
    const label = d.toLocaleString('default', { month: 'short' });
    const monthLeaves = allLeaves.filter((l) => l.created_at?.startsWith(monthStr));
    return {
      label,
      total: monthLeaves.length,
      approved: monthLeaves.filter((l) => l.status === 'approved').length,
      rejected: monthLeaves.filter((l) => l.status === 'rejected').length,
      pending: monthLeaves.filter((l) => l.status === 'pending').length,
    };
  });

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  // Top students by leave count
  const studentLeaveMap: Record<string, { name: string; email: string; count: number; approved: number }> = {};
  allLeaves.forEach((l: any) => {
    if (!l.profiles) return;
    if (!studentLeaveMap[l.student_id]) {
      studentLeaveMap[l.student_id] = { name: l.profiles.full_name, email: l.profiles.email, count: 0, approved: 0 };
    }
    studentLeaveMap[l.student_id].count++;
    if (l.status === 'approved') studentLeaveMap[l.student_id].approved++;
  });
  const topStudents = Object.values(studentLeaveMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const typeColors: Record<string, string> = {
    sick: 'bg-orange-500',
    personal: 'bg-blue-500',
    medical: 'bg-purple-500',
    other: 'bg-slate-400',
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive insights into leave patterns and trends
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Requests" value={stats.total} icon={BarChart3}
          iconColor="text-indigo-600" iconBg="bg-indigo-100 dark:bg-indigo-900/30" />
        <StatsCard title="Approval Rate" value={`${approvalRate}%`} icon={TrendingUp}
          iconColor="text-emerald-600" iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          description="Of reviewed requests" />
        <StatsCard title="Rejection Rate" value={`${rejectionRate}%`} icon={XCircle}
          iconColor="text-red-500" iconBg="bg-red-100 dark:bg-red-900/30" />
        <StatsCard title="Pending Review" value={stats.pending} icon={Clock}
          iconColor="text-amber-600" iconBg="bg-amber-100 dark:bg-amber-900/30" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Monthly Trend
            </CardTitle>
            <CardDescription>Leave requests over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-3 h-40 px-2">
              {monthlyData.map((m) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">{m.total}</span>
                  <div className="w-full flex flex-col gap-0.5 rounded-t-md overflow-hidden" style={{ height: `${Math.max((m.total / maxMonthly) * 120, m.total > 0 ? 8 : 0)}px` }}>
                    {m.approved > 0 && (
                      <div className="bg-emerald-500 dark:bg-emerald-600" style={{ flex: m.approved }} />
                    )}
                    {m.rejected > 0 && (
                      <div className="bg-red-400 dark:bg-red-500" style={{ flex: m.rejected }} />
                    )}
                    {m.pending > 0 && (
                      <div className="bg-amber-400 dark:bg-amber-500" style={{ flex: m.pending }} />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
              {[
                { color: 'bg-emerald-500', label: 'Approved' },
                { color: 'bg-red-400', label: 'Rejected' },
                { color: 'bg-amber-400', label: 'Pending' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Type Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Leave Type Distribution
            </CardTitle>
            <CardDescription>Breakdown by leave category</CardDescription>
          </CardHeader>
          <CardContent>
            {allLeaves.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No data available
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stacked bar */}
                <div className="h-8 rounded-full overflow-hidden flex">
                  {typeBreakdown.filter(t => t.count > 0).map(({ type, pct }) => (
                    <div
                      key={type}
                      className={`${typeColors[type]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                      title={`${type}: ${pct}%`}
                    />
                  ))}
                </div>
                {/* Legend */}
                <div className="space-y-3">
                  {typeBreakdown.map(({ type, count, pct }) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-sm shrink-0 ${typeColors[type]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium capitalize">{type} Leave</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{count} request{count !== 1 ? 's' : ''}</span>
                            <span className="font-semibold w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${typeColors[type]} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution + Top Students */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Approved', count: stats.approved, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
              { label: 'Pending', count: stats.pending, color: 'bg-amber-400', textColor: 'text-amber-600' },
              { label: 'Rejected', count: stats.rejected, color: 'bg-red-400', textColor: 'text-red-500' },
            ].map(({ label, count, color, textColor }) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className={`font-bold ${textColor}`}>{count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}

            {stats.total === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No requests yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Most Active Students
            </CardTitle>
            <CardDescription>By number of leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No student data yet
              </div>
            ) : (
              <div className="space-y-3">
                {topStudents.map((student, idx) => (
                  <div key={student.email} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{student.count}</p>
                      <p className="text-xs text-muted-foreground">{student.approved} approved</p>
                    </div>
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
