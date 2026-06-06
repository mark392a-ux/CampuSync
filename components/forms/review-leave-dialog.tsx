'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { formatDate, calculateLeaveDays } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  StatusBadge,
  LeaveTypeBadge,
} from '@/components/dashboard/status-badge';

import type { LeaveWithProfile } from '@/types';

interface ReviewLeaveDialogProps {
  leave: LeaveWithProfile;
  reviewerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewLeaveDialog({
  leave,
  reviewerId,
  onClose,
  onSuccess,
}: ReviewLeaveDialogProps) {

  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  const [remark, setRemark] = useState('');

  const [action, setAction] =
    useState<'approved' | 'rejected' | null>(null);

  const days =
    calculateLeaveDays(
      leave.start_date,
      leave.end_date
    );

  async function handleReview() {

    if (!action) {

      toast.error(
        'Please select Approve or Reject'
      );

      return;

    }

    try {

      setLoading(true);

      const { error } =
        await supabase
          .from('leaves')
          .update({

            status: action,

            reviewed_by:
              reviewerId,

            reviewer_remark:
              remark || null,

            reviewed_at:
              new Date()
                .toISOString(),

          })
          .eq(
            'id',
            leave.id
          );

      if (error) {

        toast.error(
          error.message
        );

        setLoading(false);

        return;

      }

      toast.success(
        `Leave ${action} successfully`
      );

      setLoading(false);

      onSuccess();

      return;

    } catch (err) {

      console.error(err);

      toast.error(
        'Failed to update leave'
      );

      setLoading(false);

    }

  }

  return (

    <Dialog
      open
      onOpenChange={onClose}
    >

      <DialogContent className="max-w-lg">

        <DialogHeader>

          <DialogTitle>

            Review Leave Application

          </DialogTitle>

          <DialogDescription>

            Review and approve or reject this leave request.

          </DialogDescription>

        </DialogHeader>

        <div className="space-y-4">

          <div className="rounded-lg bg-muted/50 p-4 space-y-4">

            <div className="flex justify-between">

              <div>

                <p className="font-semibold">

                  {
                    leave.profiles?.full_name
                    ||
                    'Unknown Student'
                  }

                </p>

                <p className="text-sm text-muted-foreground">

                  {
                    leave.profiles?.email
                  }

                </p>

              </div>

              <StatusBadge
                status={leave.status}
              />

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <p className="text-sm">

                  Leave Type

                </p>

                <LeaveTypeBadge
                  type={leave.leave_type}
                />

              </div>

              <div>

                <p className="text-sm">

                  Duration

                </p>

                <p>

                  {days}
                  {' '}
                  day{days > 1 ? 's' : ''}

                </p>

              </div>

              <div>

                <p className="text-sm">

                  Start Date

                </p>

                <p>

                  {
                    formatDate(
                      leave.start_date
                    )
                  }

                </p>

              </div>

              <div>

                <p className="text-sm">

                  End Date

                </p>

                <p>

                  {
                    formatDate(
                      leave.end_date
                    )
                  }

                </p>

              </div>

            </div>

            <div>

              <p className="text-sm">

                Reason

              </p>

              <p>

                {
                  leave.reason
                }

              </p>

            </div>

          </div>

          {

            leave.status ===
            'pending' && (

              <>

                <div className="grid grid-cols-2 gap-3">

                  <button

                    type="button"

                    onClick={() =>
                      setAction(
                        'approved'
                      )
                    }

                    className={`
                      rounded-lg
                      border
                      p-3
                      transition

                      ${
                        action ===
                        'approved'

                        ?

                        'bg-green-100 border-green-500'

                        :

                        ''
                      }
                    `}
                  >

                    <CheckCircle2
                      className="
                      inline
                      h-4
                      w-4
                      mr-2
                    "
                    />

                    Approve

                  </button>

                  <button

                    type="button"

                    onClick={() =>
                      setAction(
                        'rejected'
                      )
                    }

                    className={`
                      rounded-lg
                      border
                      p-3
                      transition

                      ${
                        action ===
                        'rejected'

                        ?

                        'bg-red-100 border-red-500'

                        :

                        ''
                      }
                    `}
                  >

                    <XCircle
                      className="
                      inline
                      h-4
                      w-4
                      mr-2
                    "
                    />

                    Reject

                  </button>

                </div>

                <div>

                  <Label>

                    <MessageSquare
                      className="
                      inline
                      h-4
                      w-4
                      mr-2
                    "
                    />

                    Reviewer Remark

                  </Label>

                  <Textarea

                    value={remark}

                    onChange={(e)=>

                      setRemark(
                        e.target.value
                      )

                    }

                    placeholder="
                    Optional remark
                    "

                  />

                </div>

                <DialogFooter>

                  <Button
                    variant="outline"
                    onClick={onClose}
                  >

                    Cancel

                  </Button>

                  <button

                    onClick={
                      handleReview
                    }

                    disabled={
                      !action
                      ||
                      loading
                    }

                    className="
                    px-4
                    py-2
                    rounded-lg
                    bg-green-600
                    text-white
                    disabled:opacity-50
                    "

                  >

                    {

                      loading

                      ?

                      'Saving...'

                      :

                      action ===
                      'approved'

                      ?

                      'Confirm Approval'

                      :

                      action ===
                      'rejected'

                      ?

                      'Confirm Rejection'

                      :

                      'Select Action'

                    }

                  </button>

                </DialogFooter>

              </>

            )

          }

        </div>

      </DialogContent>

    </Dialog>

  );

}

