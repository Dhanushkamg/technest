import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) return;
    
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            <h2 className="text-xl font-bold">Verifying your email...</h2>
            <p className="text-slate-500">Please wait a moment while we verify your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Verified!</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Your account has been successfully verified. You can now access all features.
            </p>
            <Button as={Link} to="/login" variant="primary" className="w-full mt-4">
              Continue to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h2>
            <p className="text-slate-500 dark:text-slate-400">
              The verification link is invalid or has expired. Please request a new verification email.
            </p>
            <Button as={Link} to="/login" variant="outline" className="w-full mt-4">
              Return to Login
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;
