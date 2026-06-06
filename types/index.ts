// ============================================================
// CampuSync - TypeScript Type Definitions
// ============================================================

export type UserRole = 'student' | 'faculty' | 'admin';
export type LeaveType = 'sick' | 'personal' | 'medical' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

// ============================================================
// DATABASE TYPES
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Leave {
  id: string;
  student_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  attachment_url?: string | null;
  status: LeaveStatus;
  reviewed_by?: string | null;
  reviewer_remark?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Leave with joined profile data
export interface LeaveWithProfile extends Leave {
  profiles?: Profile;
  reviewer?: Profile | null;
}

// ============================================================
// FORM TYPES
// ============================================================

export interface SignUpFormData {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface LeaveApplicationFormData {
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  reason: string;
  attachment?: File;
}

export interface ReviewLeaveFormData {
  status: 'approved' | 'rejected';
  reviewer_remark?: string;
}

// ============================================================
// DASHBOARD STATS TYPES
// ============================================================

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface DashboardStats extends LeaveStats {
  totalStudents?: number;
  recentActivity?: Leave[];
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

// ============================================================
// UI TYPES
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}
