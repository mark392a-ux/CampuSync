'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { signInSchema, type SignInFormData } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    setServerError('');

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Friendly error messages
        let msg = 'Invalid email or password. Please try again.';
        if (error.message.toLowerCase().includes('email not confirmed')) {
          msg = 'Please confirm your email address before signing in. Check your inbox.';
        } else if (error.message.toLowerCase().includes('invalid login')) {
          msg = 'Invalid email or password.';
        } else if (error.message.toLowerCase().includes('too many')) {
          msg = 'Too many login attempts. Please wait a moment and try again.';
        }
        setServerError(msg);
        toast.error(msg);
        return;
      }

      if (!authData.user) {
        setServerError('Login failed. Please try again.');
        return;
      }

      // Get role from profile to determine where to redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      const role = profile?.role || 'student';
      toast.success('Welcome back! 👋');

      if (role === 'admin') router.push('/admin');
      else if (role === 'faculty') router.push('/faculty');
      else router.push('/student');

      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setServerError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-muted-foreground">
          Sign in to your CampuSync account
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
        </div>
      )}

      {/* Quick-start tip */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">
          New here?
        </p>
        <p className="text-xs text-indigo-600 dark:text-indigo-300">
          Create an account on the{' '}
          <Link href="/signup" className="underline font-medium">sign-up page</Link>.
          Choose your role (Student / Faculty / Admin) — no email confirmation required in dev mode.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
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
          <LogIn className="h-4 w-4" />
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Create one now
        </Link>
      </p>
    </div>
  );
}
