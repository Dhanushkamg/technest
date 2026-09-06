import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import authApi from '../../api/authApi';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const SecurityPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-full text-primary">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Security</h1>
          <p className="text-gray-500 dark:text-gray-400">Update your password to keep your account secure.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <div className="relative mb-4">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Password must be at least 8 characters long.
          </p>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm New Password
          </label>
          <input
            type={showNew ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            minLength={8}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecurityPage;
