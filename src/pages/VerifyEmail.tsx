import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '../lib/api';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const called = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invocation: the first call consumes
    // the one-time token in the DB, so the second would always fail.
    if (called.current) return;
    called.current = true;

    const token = params.get('token');
    if (!token) {
      setErrorMsg('No verification token found in the link.');
      setState('error');
      return;
    }

    verifyEmail(token)
      .then(() => setState('success'))
      .catch((err: Error) => {
        setErrorMsg(err.message || 'The link may have expired or already been used.');
        setState('error');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
      <div className="liquid-glass max-w-sm w-full p-10 rounded-xl border-brand-primary/30 text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold italic mb-2">Verifying…</h2>
            <p className="text-ink-muted text-sm font-light">Hang tight while we confirm your email.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-brand-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold italic mb-2">Email Verified</h2>
            <p className="text-ink-muted text-sm font-light mb-8">
              Your account is now active. You can log in.
            </p>
            <Link
              to="/"
              className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-display text-2xl font-bold italic mb-2">Verification Failed</h2>
            <p className="text-ink-muted text-sm font-light mb-8">{errorMsg}</p>
            <Link
              to="/"
              className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors"
            >
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
