import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { tokenStore } from '../lib/api';

/**
 * Landing page for the Google OAuth redirect. The auth service returns tokens
 * in the URL fragment (never sent to servers); we persist them and reload so
 * AuthProvider restores the session.
 */
export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const oauthError = params.get('error');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const email = params.get('email');

    if (oauthError || !accessToken || !refreshToken) {
      setError(oauthError ?? 'missing_tokens');
      return;
    }

    tokenStore.set({ access_token: accessToken, refresh_token: refreshToken }, email ?? undefined);
    // Hard redirect so the fragment (with tokens) is dropped from history
    // and AuthProvider re-mounts with the fresh session.
    window.location.replace('/');
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>
          Google sign-in failed
        </p>
        <p className="text-xs text-ink-muted font-light max-w-sm">
          {error === 'email_not_verified'
            ? 'Your Google account email is not verified.'
            : 'Something went wrong during sign-in. Please try again.'}
        </p>
        <Link to="/" className="text-sm font-bold hover:underline" style={{ color: 'var(--color-brand-primary)' }}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-white/50" />
    </div>
  );
}
