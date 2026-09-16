import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cpu, Mail, Lock, User, Phone, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { authApi } from '../api/authApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    phoneNumber: z.string().min(7, 'Please enter a valid phone number').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setApiError(null);
    setIsLoading(true);

    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber || undefined,
      });

      setIsSuccess(true);
      toast.success('Registration successful! Please check your email.');
    } catch (err: unknown) {
      const msg =
        (axios.isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined) ||
        (err instanceof Error ? err.message : 'Registration failed. Email may already be registered.');
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo / Header */}
        {!isSuccess && (
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create an Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join TechNest to unlock premium tech shopping</p>
          </div>
        )}

        {isSuccess ? (
          <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check your email</h2>
            <p className="text-slate-500 dark:text-slate-400">
              We've sent a verification link to your email address. Please verify your email before logging in.
            </p>
            <Button as={Link} to="/login" variant="primary" className="w-full mt-4">
              Go to Login
            </Button>
          </div>
        ) : (
          <>
            {/* API Error Alert */}
            {apiError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-800/50 flex items-center gap-3 text-red-600 dark:text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-rose-400" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Mercer"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.name?.message}
                {...register('name')}
              />

              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Phone Number */}
              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+1 (555) 000-0000"
                leftIcon={<Phone className="w-5 h-5" />}
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
              />

              {/* Password */}
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-4"
                leftIcon={<UserPlus className="w-5 h-5" />}
              >
                Register Account
              </Button>
            </form>

            {/* OAuth Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full relative flex items-center justify-center gap-2"
                onClick={() => {
                  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            </div>

            {/* Link to Login */}
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
