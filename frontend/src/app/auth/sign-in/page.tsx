'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoginRequest } from '@/features/auth/types';

// Icon components
const VideoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const MailIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const MicIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const MonitorIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const UsersIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function SignInPage() {
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand & Product Preview */}
      <div className="hidden lg:flex lg:w-[56%] bg-[#101B35] relative overflow-hidden">
        {/* Subtle lighting effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <VideoIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Meetora</h1>
              </div>
            </div>
            <p className="text-blue-200/70 text-sm">Team Collaboration Platform</p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-block">
              <div className="px-3 py-1 rounded-full border border-blue-400/30 bg-blue-500/10">
                <span className="text-blue-200 text-xs font-medium tracking-wide">
                  ENTERPRISE-GRADE COLLABORATION
                </span>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-5xl font-bold text-white leading-tight mb-6">
                Better conversations.
                <br />
                Better work.
              </h2>
              <p className="text-blue-100/80 text-lg">
                Your team's space to meet, share ideas, and move forward together.
              </p>
            </div>

            {/* Product Preview - Meeting Interface */}
            <div className="space-y-4 mt-12">
              <div className="bg-[#1a2744] rounded-xl p-4 border border-blue-500/20 shadow-2xl">
                {/* Meeting Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Product Strategy Meeting</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-300 text-xs">
                    <UsersIcon />
                    <span>4 participants</span>
                  </div>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { name: 'Sarah Chen', speaking: true },
                    { name: 'Alex Rivera', speaking: false },
                    { name: 'Jordan Lee', speaking: false },
                    { name: 'Morgan Blake', speaking: false },
                  ].map((participant, idx) => (
                    <div
                      key={idx}
                      className={`aspect-video rounded-lg bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border ${
                        participant.speaking ? 'border-green-400' : 'border-blue-500/30'
                      } p-3 flex items-end relative overflow-hidden`}
                    >
                      {/* Subtle avatar placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-white font-medium text-sm">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      
                      {/* Name tag */}
                      <div className="relative z-10 flex items-center space-x-1.5">
                        <span className="text-white text-xs font-medium">{participant.name}</span>
                        {participant.speaking && (
                          <div className="flex space-x-0.5">
                            <div className="w-0.5 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <div className="w-0.5 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '75ms' }}></div>
                            <div className="w-0.5 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meeting Controls */}
                <div className="flex items-center justify-center space-x-3 pt-3 border-t border-blue-500/20">
                  <button className="p-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white transition-colors">
                    <MicIcon />
                  </button>
                  <button className="p-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white transition-colors">
                    <VideoIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white transition-colors">
                    <MonitorIcon />
                  </button>
                  <button className="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                    <PhoneIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom tagline */}
            <div className="pt-4">
              <p className="text-blue-100/60 text-sm">One workspace. Every conversation.</p>
            </div>
          </div>

          {/* Footer space */}
          <div></div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-full lg:w-[44%] bg-[#FAFBFD] flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <VideoIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#172033]">Meetora</h1>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#64748B] tracking-widest uppercase">
              WELCOME BACK
            </p>
            <h2 className="text-3xl font-bold text-[#172033]">Sign in to Meetora</h2>
            <p className="text-[#64748B]">Pick up where your team left off.</p>
          </div>

          {/* Error Message */}
          {loginMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {(loginMutation.error as any)?.response?.data?.message || 'Invalid email or password'}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#172033] mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailIcon className="text-[#64748B]" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  id="email"
                  className="w-full h-12 pl-12 pr-4 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white text-[#172033] placeholder-[#94A3B8]"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#172033] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockIcon className="text-[#64748B]" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full h-12 pl-12 pr-12 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white text-[#172033] placeholder-[#94A3B8]"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#64748B] hover:text-[#172033] transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-[#64748B]">Remember me</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#FAFBFD] text-[#64748B]">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            className="w-full h-12 bg-white border-2 border-[#E2E8F0] text-[#172033] rounded-lg hover:bg-gray-50 hover:border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 transition-colors font-medium flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </a>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-[#64748B]">
              New to Meetora?{' '}
              <Link 
                href="/auth/sign-up" 
                className="font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                Create an account
              </Link>
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-[#94A3B8]">
              <a href="#" className="hover:text-[#64748B] transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-[#64748B] transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
