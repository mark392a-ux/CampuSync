'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, AlertCircle, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { signUpSchema, type SignUpFormData } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ROLES = [
  { value: 'student' as const, label: 'Student', desc: 'Apply & track leaves', Icon: GraduationCap },
  { value: 'faculty' as const, label: 'Faculty', desc: 'Review & approve leaves', Icon: BookOpen },
  { value: 'admin'   as const, label: 'Admin',   desc: 'Full system access',   Icon: Shield },
];

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');
  const supabase = createClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<SignUpFormData>({
      resolver: zodResolver(signUpSchema),
      defaultValues: { role: 'student' },
    });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setServerError('');

    try {
      // ── Step 1: Call our API route (admin client → email auto-confirmed, RLS bypassed) ──
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:      data.email,
          password:   data.password,
          full_name:  data.full_name,
          role:       data.role,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        const msg = json.error || 'Sign up failed. Please try again.';
        setServerError(msg);
        toast.error(msg);
        return;
      }

      // ── Step 2: Sign in with the newly created credentials ──
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email:    data.email,
        password: data.password,
      });

      if (signInError) {
        // User exists but sign-in failed (shouldn't happen since we auto-confirmed)
        toast.info('Account created! Please sign in.');
        router.push('/login');
        return;
      }

      toast.success('Account created! Welcome to CampuSync 🎓');

      // ── Step 3: Redirect to the right dashboard ──
      if      (data.role === 'admin')   router.push('/admin');
      else if (data.role === 'faculty') router.push('/faculty');
      else                              router.push('/student');

      router.refresh();
    } catch (err: any) {
      console.error('Signup error:', err);
      const msg = 'Network error — please check your connection and try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
        <p className="text-muted-foreground">
          Join CampuSync — no email confirmation required
        </p>
      </div>

      {/* Error banner */}
      {serverError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            placeholder="John Doe"
            autoComplete="name"
            {...register('full_name')}
            error={errors.full_name?.message}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@university.edu"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label>Account type</Label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ value, label, desc, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value)}
                className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                  selectedRole === value
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-accent'
                }`}
              >
                <Icon className={`h-5 w-5 ${selectedRole === value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{desc}</span>
                {selectedRole === value && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
          {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          <UserPlus className="h-4 w-4" />
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
