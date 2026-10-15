'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { MobileNav } from '@/components/dashboard/MobileNav';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  bio: z.string().max(500, 'Bio is too long').optional().or(z.literal('')),
  jobTitle: z.string().max(100, 'Job title is too long').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, isLoading: profileLoading, updateProfileMutation } = useProfile();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || '',
        jobTitle: profile.jobTitle || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSuccessMessage('');
      await updateProfileMutation.mutateAsync(data);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      bio: profile?.bio || '',
      jobTitle: profile?.jobTitle || '',
    });
    setIsEditing(false);
    setSuccessMessage('');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppSidebar />
      <MobileNav />
      
      <div className="lg:pl-52">
        <AppHeader />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#14213D]">My Profile</h1>
            <p className="text-sm text-[#64748B] mt-1">
              Manage your personal information and profile settings
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#14213D]">Profile Information</h2>
                <p className="text-sm text-[#64748B] mt-0.5">
                  Update your personal details and how others see you
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {updateProfileMutation.isError && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">
                    {(updateProfileMutation.error as any)?.response?.data?.message || 
                      'Failed to update profile. Please try again.'}
                  </p>
                </div>
              </div>
            )}

            {/* Profile Content */}
            <div className="p-6">
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  {/* Avatar and Name */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                        {profile.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt="Profile"
                            className="h-20 w-20 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-[#2563EB]">
                            {profile.firstName.charAt(0)}
                            {profile.lastName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-semibold text-[#14213D]">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      {profile.jobTitle && (
                        <p className="text-sm text-[#64748B] mt-1">{profile.jobTitle}</p>
                      )}
                      {profile.emailVerified ? (
                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-6 border-t border-[#E2E8F0]">
                    <div>
                      <dt className="text-xs font-medium text-[#64748B] uppercase tracking-wide">First Name</dt>
                      <dd className="mt-1 text-sm text-[#14213D] font-medium">{profile.firstName}</dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Last Name</dt>
                      <dd className="mt-1 text-sm text-[#14213D] font-medium">{profile.lastName}</dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Email Address</dt>
                      <dd className="mt-1 text-sm text-[#14213D] font-medium">{profile.email}</dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Job Title</dt>
                      <dd className="mt-1 text-sm text-[#14213D] font-medium">
                        {profile.jobTitle || 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Account Status</dt>
                      <dd className="mt-1 text-sm text-[#14213D] font-medium capitalize">
                        {profile.accountStatus}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Member Since</dt>
                      <dd className="mt-1 text-sm text-[#14213D] font-medium">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {profile.bio && (
                    <div className="pt-6 border-t border-[#E2E8F0]">
                      <dt className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Bio</dt>
                      <dd className="mt-2 text-sm text-[#14213D] whitespace-pre-wrap leading-relaxed">
                        {profile.bio}
                      </dd>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-[#14213D] mb-1.5">
                        First Name *
                      </label>
                      <input
                        {...register('firstName')}
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-[#14213D] mb-1.5">
                        Last Name *
                      </label>
                      <input
                        {...register('lastName')}
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-[#14213D] mb-1.5">
                      Job Title
                    </label>
                    <input
                      {...register('jobTitle')}
                      type="text"
                      id="jobTitle"
                      className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Software Engineer, Product Manager"
                    />
                    {errors.jobTitle && (
                      <p className="mt-1 text-xs text-red-600">{errors.jobTitle.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-[#14213D] mb-1.5">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      id="bio"
                      rows={4}
                      className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && (
                      <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p>
                    )}
                    <p className="mt-1.5 text-xs text-[#64748B]">
                      Brief description for your profile. Maximum 500 characters.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#E2E8F0]">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            <strong className="font-semibold">Note:</strong> Email address cannot be changed here. For account security reasons, email changes require additional verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isDirty || updateProfileMutation.isPending}
                        className="px-6 py-2.5 text-sm font-medium bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateProfileMutation.isPending ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
