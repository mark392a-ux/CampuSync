'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LeavesTable } from '@/components/tables/leaves-table';
import { Button } from '@/components/ui/button';
import type { LeaveWithProfile } from '@/types';
import type { Profile } from '@/types';

interface StudentApplicationsClientProps {
  profile: Profile;
}

export default function StudentApplicationsClient({ profile }: StudentApplicationsClientProps) {
  const supabase = createClient();
  const [leaves, setLeaves] = useState<LeaveWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leaves')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false });
    setLeaves(data || []);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track all your leave requests and their status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchLeaves} className="h-10 w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/student/apply">
              <PlusCircle className="h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>
      </div>

      <LeavesTable
        leaves={leaves}
        loading={loading}
        role="student"
        currentUserId={profile.id}
        showStudent={false}
        onRefresh={fetchLeaves}
      />
    </div>
  );
}
