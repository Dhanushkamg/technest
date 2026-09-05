import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User as UserIcon, Mail, Phone, ShieldCheck, Edit3, Save, CheckCircle2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import AddressBook from '../components/address/AddressBook';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const setUserStore = useAuthStore((state) => state.setUser);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Query profile
  const { data: userProfile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  // Mutation to update profile
  const updateMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
      setUserStore(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
  });

  const handleStartEdit = () => {
    if (userProfile) {
      setNameInput(userProfile.name || '');
      setPhoneInput(userProfile.phoneNumber || '');
      setIsEditing(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    updateMutation.mutate({
      name: nameInput,
      phoneNumber: phoneInput || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-32 bg-slate-200 dark:bg-slate-900/60 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-900/60 rounded-3xl" />
      </div>
    );
  }

  if (isError || !userProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <ErrorState
          title="Unable to Load Profile"
          description="Could not fetch user profile details from the backend server."
        />
      </div>
    );
  }

  const roleDisplay = (userProfile.role || '').toUpperCase().replace('ROLE_', '');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner Card */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-8 shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 border-2 border-brand-400/30 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-brand-500/20">
            {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{userProfile.name}</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> {roleDisplay}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{userProfile.email}</p>
          </div>
        </div>

        {!isEditing ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStartEdit}
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            Edit Profile
          </Button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Account Info Form Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-8 shadow-md dark:shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Personal Account Details
        </h2>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Full Name
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-bold text-base flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-brand-500 dark:text-brand-400" /> {userProfile.name}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-bold text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500 dark:text-brand-400" /> {userProfile.email}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Phone Number
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-bold text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500 dark:text-brand-400" /> {userProfile.phoneNumber || 'Not provided'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Account Role
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-bold text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 dark:text-brand-400" /> {roleDisplay}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <Input
              label="Full Name"
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />

            <Input
              label="Phone Number"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />

            <div className="pt-2 flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={updateMutation.isPending}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Address Book Section */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-8 shadow-md dark:shadow-2xl">
        <AddressBook />
      </div>
    </div>
  );
};

export default ProfilePage;
