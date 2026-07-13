import React, { useState } from 'react';
import { KeyRound, MailWarning, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestPasswordReset, resendVerification } from '../../lib/api';

const card = 'bg-bg-surface rounded-sm';
const cardBorder = { border: '1px solid rgba(255,255,255,0.05)' };
const label = 'text-[10px] uppercase tracking-widest font-bold text-ink-muted m-0 mb-1';

export default function AccountSection({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  if (!user) return null;

  const handleChangePassword = async () => {
    setSendingReset(true);
    try {
      await requestPasswordReset(user.email);
    } catch {
      // Don't reveal whether the email exists
    } finally {
      setResetSent(true);
      setSendingReset(false);
    }
  };

  const handleResendVerification = async () => {
    setSendingVerify(true);
    try {
      await resendVerification(user.email);
      setVerifySent(true);
    } catch {
      // Nothing actionable to show differently — same non-committal outcome.
      setVerifySent(true);
    } finally {
      setSendingVerify(false);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-xl flex flex-col gap-6">
          <div className="mb-1">
            <h2 className="font-display font-bold text-2xl">Account</h2>
            <p className="text-[13px] text-ink-muted mt-1">Profile / Security</p>
          </div>
          {/* Identity card */}
          <div style={cardBorder} className={`${card} p-4 sm:p-6 flex items-center gap-4`}>
            <div className="w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center text-bg-base font-black text-2xl flex-shrink-0">
              {(user.displayName || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold italic text-lg m-0 truncate">{user.displayName || 'Prophet'}</h3>
              <p className="text-ink-muted text-[13px] m-0 truncate">{user.email}</p>
              <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-1 m-0">
                {user.roles.join(' / ') || 'member'}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div style={cardBorder} className={`${card} p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5`}>
            <div>
              <p className={label}>Email</p>
              <p className="text-[13px] m-0 truncate">{user.email}</p>
            </div>
            <div>
              <p className={label}>Email Status</p>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: '#00F0FF' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: '#F5C542' }}>
                  <MailWarning className="w-3.5 h-3.5" /> Not verified
                </span>
              )}
            </div>
            {memberSince && (
              <div>
                <p className={label}>Member Since</p>
                <p className="text-[13px] m-0">{memberSince}</p>
              </div>
            )}
            <div>
              <p className={label}>Role</p>
              <p className="text-[13px] m-0 uppercase">{user.roles.join(', ') || 'member'}</p>
            </div>
          </div>

          {/* Verification callout */}
          {!user.emailVerified && (
            <div
              style={{ background: 'rgba(245,197,66,0.08)', border: '1px solid rgba(245,197,66,0.25)' }}
              className="rounded-sm p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <p className="text-[12px] font-bold m-0" style={{ color: '#F5C542' }}>Your email isn't verified yet</p>
                <p className="text-ink-muted text-[12px] mt-1 m-0">Verify it to unlock all account features.</p>
              </div>
              <button
                onClick={handleResendVerification}
                disabled={sendingVerify || verifySent}
                className="px-5 py-2.5 rounded-sm font-black text-[11px] uppercase tracking-widest border-none cursor-pointer disabled:opacity-60"
                style={{ background: '#F5C542', color: '#050505' }}
              >
                {verifySent ? 'Email Sent' : sendingVerify ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          {/* Security */}
          <div style={cardBorder} className={`${card} p-4 sm:p-6 flex items-center justify-between gap-4 flex-wrap`}>
            <div>
              <p className="text-[13px] font-bold m-0">Password</p>
              <p className="text-ink-muted text-[12px] mt-1 m-0">
                {resetSent ? 'Reset link sent — check your inbox.' : 'Send yourself a reset link to change your password.'}
              </p>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={sendingReset || resetSent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-black text-[11px] uppercase tracking-widest border-none cursor-pointer disabled:opacity-60"
              style={{ background: '#00F0FF', color: '#050505' }}
            >
              <KeyRound className="w-3.5 h-3.5" />
              {resetSent ? 'Sent' : sendingReset ? 'Sending...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
