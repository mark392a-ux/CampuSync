import { z } from 'zod';

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const signUpSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['student', 'faculty', 'admin'], {
    required_error: 'Please select a role',
  }),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// ============================================================
// LEAVE SCHEMAS
// ============================================================

export const leaveApplicationSchema = z.object({
  leave_type: z.enum(['sick', 'personal', 'medical', 'other'], {
    required_error: 'Please select a leave type',
  }),
  start_date: z
    .date({
      required_error: 'Start date is required',
    })
    .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Start date cannot be in the past'),
  end_date: z
    .date({
      required_error: 'End date is required',
    }),
  reason: z
    .string()
    .min(20, 'Reason must be at least 20 characters')
    .max(1000, 'Reason must be less than 1000 characters'),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'End date must be on or after start date',
  path: ['end_date'],
});

export const reviewLeaveSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    required_error: 'Please select an action',
  }),
  reviewer_remark: z
    .string()
    .max(500, 'Remark must be less than 500 characters')
    .optional(),
});

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  department: z
    .string()
    .max(100, 'Department must be less than 100 characters')
    .optional(),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>;
export type ReviewLeaveFormData = z.infer<typeof reviewLeaveSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
