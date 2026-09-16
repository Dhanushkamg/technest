import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    // The backend has already set the HttpOnly cookies for accessToken and refreshToken.
    // We just need to fetch the profile to populate the user state in the store.
    fetchProfile()
      .then(() => {
        navigate('/profile', { replace: true });
      })
      .catch(() => {
        // If it fails, cookies might not have been set properly
        navigate('/login?error=oauth2', { replace: true });
      });
  }, [fetchProfile, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
      <h2 className="text-xl font-bold">Authenticating...</h2>
      <p className="text-slate-500">Please wait while we complete your sign in.</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
