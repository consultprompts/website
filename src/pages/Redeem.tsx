import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { XCircle, Loader2 } from 'lucide-react';
import { redeemLead } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Landing page for the invite email's "Claim My Project" link
 * (/redeem?leadId=…). Unauthenticated visitors are bounced to the login
 * modal with this URL as the post-auth destination, so the leadId survives
 * the auth flow. Once logged in the lead is attached to the user and they're
 * dropped on My Projects.
 */
export default function Redeem() {
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const called = useRef(false);

  const leadId = params.get('leadId')?.trim() ?? '';

  useEffect(() => {
    if (loading) return;

    if (!leadId) {
      setErrorMsg('No project ID found in the link.');
      return;
    }

    if (!user) {
      // Same login-with-next pattern MyProjects uses — Home opens the auth
      // modal and navigates to `next` after a successful login.
      navigate(`/?auth=login&next=${encodeURIComponent(`/redeem?leadId=${leadId}`)}`, { replace: true });
      return;
    }

    // Guard against React StrictMode double-invocation firing two redeems.
    if (called.current) return;
    called.current = true;

    redeemLead(leadId)
      .then(() => navigate('/settings/my-projects', { replace: true }))
      .catch((err: Error) => {
        setErrorMsg(err.message || 'Something went wrong — please try again.');
      });
  }, [loading, user, leadId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
      <div className="liquid-glass max-w-sm w-full p-10 rounded-xl border-brand-primary/30 text-center">
        {!errorMsg ? (
          <>
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold italic mb-2">Claiming your project…</h2>
            <p className="text-ink-muted text-sm font-light">
              Hang tight while we attach it to your account.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-display text-2xl font-bold italic mb-2">Couldn't Claim Project</h2>
            <p className="text-ink-muted text-sm font-light mb-8">{errorMsg}</p>
            <div className="flex items-center justify-center gap-6">
              <Link
                to="/settings/my-projects"
                className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors"
              >
                My Projects
              </Link>
              <Link
                to="/"
                className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
