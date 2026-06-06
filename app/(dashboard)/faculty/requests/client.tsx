'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { LeavesTable } from '@/components/tables/leaves-table';
import { Button } from '@/components/ui/button';

import type { LeaveWithProfile, Profile } from '@/types';

interface FacultyRequestsClientProps {
  profile: Profile;
}

export default function FacultyRequestsClient({
  profile,
}: FacultyRequestsClientProps) {
  const supabase = createClient();

  const [leaves, setLeaves] = useState<LeaveWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('leaves')
      .select(`
        *,
        profiles:student_id (
          id,
          full_name,
          email
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setLeaves((data as any) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Pending Requests
          </h1>

          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve or reject student leave requests
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={fetchLeaves}
          className="h-10 w-10"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <LeavesTable
        leaves={leaves}
        loading={loading}
        role="faculty"
        currentUserId={profile.id}
        showStudent={true}
        onRefresh={fetchLeaves}
      />
    </div>
  );
}