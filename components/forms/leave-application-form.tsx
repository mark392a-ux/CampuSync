'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { leaveApplicationSchema, type LeaveApplicationFormData } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { generateFilePath, isValidFileType, formatFileSize, getLeaveTypeLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Profile } from '@/types';

interface LeaveApplicationFormProps {
  profile: Profile;
}

const leaveTypes = ['sick', 'personal', 'medical', 'other'] as const;

export function LeaveApplicationForm({ profile }: LeaveApplicationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveApplicationFormData>({
    resolver: zodResolver(leaveApplicationSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, GIF, or PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
  };

  const onSubmit = async (data: LeaveApplicationFormData) => {
    setLoading(true);
    try {
      let attachment_url: string | null = null;

      // Upload attachment if provided
      if (selectedFile) {
        const filePath = generateFilePath(profile.id, selectedFile.name);
        const { error: uploadError } = await supabase.storage
          .from('leave-attachments')
          .upload(filePath, selectedFile, { upsert: false });

        if (uploadError) {
          throw new Error('Failed to upload attachment: ' + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from('leave-attachments')
          .getPublicUrl(filePath);
        attachment_url = urlData.publicUrl;
      }

      // Insert leave record
      const { error } = await supabase.from('leaves').insert({
        student_id: profile.id,
        leave_type: data.leave_type,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: format(data.end_date, 'yyyy-MM-dd'),
        reason: data.reason,
        attachment_url,
        status: 'pending',
      });

      if (error) throw new Error(error.message);

      toast.success('Leave application submitted successfully!');
      reset();
      setSelectedFile(null);
      setStartDate('');
      setEndDate('');
      router.push('/student/applications');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Leave Details</CardTitle>
          <CardDescription>
            Fill in the details for your leave application. All fields marked are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leave_type">
              Leave Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="leave_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="leave_type" className={errors.leave_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select leave type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getLeaveTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.leave_type && (
              <p className="text-xs text-red-500">{errors.leave_type.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="start_date"
                  type="date"
                  value={startDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (e.target.value) {
                      setValue('start_date', new Date(e.target.value + 'T00:00:00'), { shouldValidate: true });
                    }
                  }}
                  className={`flex h-10 w-full rounded-lg border pl-9 pr-3 py-2 text-sm bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors ${
                    errors.start_date ? 'border-red-500' : 'border-input'
                  }`}
                />
              </div>
              {errors.start_date && (
                <p className="text-xs text-red-500">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                End Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="end_date"
                  type="date"
                  value={endDate}
                  min={startDate || format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (e.target.value) {
                      setValue('end_date', new Date(e.target.value + 'T00:00:00'), { shouldValidate: true });
                    }
                  }}
                  className={`flex h-10 w-full rounded-lg border pl-9 pr-3 py-2 text-sm bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors ${
                    errors.end_date ? 'border-red-500' : 'border-input'
                  }`}
                />
              </div>
              {errors.end_date && (
                <p className="text-xs text-red-500">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for your leave request (minimum 20 characters)..."
              className="min-h-[120px]"
              {...register('reason')}
              error={errors.reason?.message}
            />
            <p className="text-xs text-muted-foreground">
              Be specific and include relevant details to help the reviewer.
            </p>
          </div>

          {/* File Attachment */}
          <div className="space-y-2">
            <Label>Attachment (optional)</Label>
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent transition-all duration-200 group">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">PDF, JPEG, PNG, GIF up to 5MB</p>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-accent/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
