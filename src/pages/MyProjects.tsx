import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/ui/StatusBadge';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Loader2, FolderOpen, ExternalLink } from 'lucide-react';
import logoSrc from '../logo.png';
import { getMyLeads, submitReview, setWantsMaintenance, markPaid, type Lead } from '../lib/api';
import { PACKAGES } from '../data/content';
import { safeUrl } from '../lib/urls';
import { useAuth } from '../context/AuthContext';

const MILESTONES = [
  'Designing Mockup',
  'Mockup Delivered',
  'Revisions Signed Off',
  'Site in Development',
  'Site Completed',
  'Launched',
];

// Monthly maintenance price — update this constant when pricing changes.
const MAINTENANCE_MONTHLY_PRICE = 29;
const DOMAIN_FEE = 20;

// Derived from PACKAGES in content.tsx — keep in sync with backend packagePrices map.
const PACKAGE_PRICE: Record<string, number> = Object.fromEntries(
  PACKAGES.map(p => [p.id, parseInt(p.price.replace(/\D/g, ''), 10)])
);
const PACKAGE_NAME: Record<string, string> = Object.fromEntries(
  PACKAGES.map(p => [p.id, p.name])
);

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Under Review', color: '#F5C542', bg: 'rgba(245,197,66,0.12)' },
  accepted:  { label: 'In Progress',  color: 'var(--color-brand-primary)', bg: 'color-mix(in srgb, var(--color-brand-primary) 10%, transparent)' },
  completed: { label: 'Launched',     color: '#B98CFF', bg: 'rgba(112,0,255,0.18)' },
  launched:  { label: 'Launched',     color: '#B98CFF', bg: 'rgba(112,0,255,0.18)' },
};

// ---------------------------------------------------------------------------
// Mockup Review Panel
// ---------------------------------------------------------------------------

function MockupReviewPanel({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setSubmitting(true);
    setError('');
    try {
      await submitReview(lead.id, 'accept');
      onUpdate({ ...lead, milestone_index: 2 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      setError('Please describe the changes you need.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitReview(lead.id, 'request_changes', feedback.trim());
      onUpdate({ ...lead, revision_feedback: feedback.trim() });
      setShowFeedback(false);
      setFeedback('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="mt-4 rounded-xl p-5 flex flex-col gap-4"
      style={{ background: 'color-mix(in srgb, var(--color-brand-primary) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent)' }}
    >
      {safeUrl(lead.mockup_url) && (
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-2">Your Mockup</p>
          <a
            href={safeUrl(lead.mockup_url)!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            <ExternalLink className="w-4 h-4" />
            Open Mockup
          </a>
        </div>
      )}

      {lead.revision_feedback ? (
        <div
          className="rounded-lg p-4"
          style={{ background: 'rgba(245,197,66,0.08)', border: '1px solid rgba(245,197,66,0.2)' }}
        >
          <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: '#F5C542' }}>
            Revision Requested
          </p>
          <p className="text-sm text-white/70 font-light whitespace-pre-wrap">{lead.revision_feedback}</p>
          <p className="text-[10px] text-ink-muted mt-2">We'll deliver an updated mockup shortly.</p>
        </div>
      ) : (
        <>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-3">
              Review Your Mockup
            </p>
            {!showFeedback && (
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleAccept}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest border-none cursor-pointer disabled:opacity-60"
                  style={{ background: 'var(--color-brand-primary)', color: 'var(--color-bg-base)' }}
                >
                  {submitting ? 'Saving…' : 'Accept'}
                </button>
                <button
                  onClick={() => setShowFeedback(true)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest cursor-pointer disabled:opacity-60"
                  style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--color-ink-base) 20%, transparent)', color: 'var(--color-ink-base)' }}
                >
                  Request Changes
                </button>
              </div>
            )}

            {showFeedback && (
              <div className="flex flex-col gap-3">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe what you'd like changed…"
                  rows={4}
                  className="w-full rounded-lg p-3 text-sm font-light text-white resize-none focus:outline-none"
                  style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleRequestChanges}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest border-none cursor-pointer disabled:opacity-60"
                    style={{ background: '#F5C542', color: 'var(--color-bg-base)' }}
                  >
                    {submitting ? 'Submitting…' : 'Submit Feedback'}
                  </button>
                  <button
                    onClick={() => { setShowFeedback(false); setFeedback(''); setError(''); }}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest cursor-pointer disabled:opacity-60"
                    style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)', color: 'var(--color-ink-muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payment & Maintenance Panel
// ---------------------------------------------------------------------------

function PaymentPanel({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [maintenance, setMaintenance] = useState(lead.wants_maintenance);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const toggleMaintenance = async (checked: boolean) => {
    setSavingMaintenance(true);
    try {
      await setWantsMaintenance(lead.id, checked);
      setMaintenance(checked);
      onUpdate({ ...lead, wants_maintenance: checked });
    } catch {
      // silently ignore; user can retry
    } finally {
      setSavingMaintenance(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    setPayError('');
    try {
      await markPaid(lead.id);
      onUpdate({ ...lead, is_paid: true, paid_at: new Date().toISOString() });
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Payment failed — please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (lead.is_paid) {
    const paidDate = lead.paid_at ? new Date(lead.paid_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;
    const renewalDate = lead.domain_renewal_date ? new Date(lead.domain_renewal_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;

    return (
      <div
        className="mt-4 rounded-xl overflow-hidden"
        style={{ border: '1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent)' }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ background: 'color-mix(in srgb, var(--color-brand-primary) 8%, transparent)' }}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
          <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'var(--color-brand-primary)' }}>
            Payment Confirmed
          </p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3" style={{ background: 'color-mix(in srgb, var(--color-brand-primary) 3%, transparent)' }}>
          <p className="text-xs text-ink-muted font-light">
            Your site will be launched shortly. Check your email for a receipt.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {paidDate && (
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Paid On</p>
                <p className="text-[13px] font-bold text-white">{paidDate}</p>
              </div>
            )}
            {renewalDate && (
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Domain Renewal</p>
                <p className="text-[13px] font-bold text-white">{renewalDate}</p>
              </div>
            )}
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Domain</p>
              <p className="text-[13px] font-bold text-white">$20 / year</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Maintenance</p>
              <p className="text-[13px] font-bold" style={{ color: lead.wants_maintenance ? 'var(--color-brand-primary)' : '#555' }}>
                {lead.wants_maintenance ? `$${MAINTENANCE_MONTHLY_PRICE}/mo` : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-4 rounded-xl p-5 flex flex-col gap-6"
      style={{ background: 'rgba(112,0,255,0.07)', border: '1px solid rgba(112,0,255,0.25)' }}
    >
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: '#B98CFF' }}>
          Complete Payment to Launch
        </p>
        <p className="text-xs text-ink-muted font-light">Enter your card details below to finalise and launch your site.</p>
      </div>

      {/* Fee summary */}
      {(() => {
        const pkgPrice = lead.package ? (PACKAGE_PRICE[lead.package] ?? 0) : 0;
        const pkgName  = lead.package ? (PACKAGE_NAME[lead.package] ?? lead.package) : null;
        const total = pkgPrice + DOMAIN_FEE + (maintenance ? MAINTENANCE_MONTHLY_PRICE : 0);
        return (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)' }}>
            <div className="px-4 py-2" style={{ background: 'color-mix(in srgb, var(--color-ink-base) 4%, transparent)' }}>
              <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted">Order Summary</p>
            </div>

            {pkgName && (
              <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}>
                <span className="text-[13px] text-ink-muted">{pkgName}</span>
                <span className="text-[13px] font-bold text-white">${pkgPrice}</span>
              </div>
            )}

            <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}>
              <span className="text-[13px] text-ink-muted">Domain registration</span>
              <span className="text-[13px] font-bold text-white">${DOMAIN_FEE} / year</span>
            </div>

            {maintenance && (
              <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}>
                <span className="text-[13px] text-ink-muted">Site maintenance</span>
                <span className="text-[13px] font-bold text-white">${MAINTENANCE_MONTHLY_PRICE} / month</span>
              </div>
            )}

            {/* Total row */}
            <div
              className="flex justify-between items-center px-4 py-3"
              style={{ borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 12%, transparent)', background: 'rgba(185,140,255,0.06)' }}
            >
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#B98CFF' }}>
                  Due Today
                </span>
                {maintenance && (
                  <span className="ml-2 text-[10px] text-ink-muted font-light">
                    (then ${MAINTENANCE_MONTHLY_PRICE}/mo)
                  </span>
                )}
              </div>
              <span className="text-[20px] font-black" style={{ color: '#B98CFF' }}>
                ${total}
              </span>
            </div>

            <div className="px-4 py-2" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)', background: 'color-mix(in srgb, var(--color-ink-base) 2%, transparent)' }}>
              <p className="text-[10px] text-ink-muted font-light">
                Domain renews annually. You'll be reminded before the renewal date.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Payment form — UI only. TODO: wire to real payment provider (Stripe/PayPal) once Order & Payment service exists */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Card Number</label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
            style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Expiry</label>
            <input
              type="text"
              placeholder="MM / YY"
              maxLength={7}
              className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
              style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">CVV</label>
            <input
              type="text"
              placeholder="123"
              maxLength={4}
              className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
              style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Name on Card</label>
          <input
            type="text"
            placeholder="Jane Smith"
            className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
            style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Billing Address</label>
          <input
            type="text"
            placeholder="123 Main St, City, State, ZIP"
            className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
            style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
          />
        </div>
      </div>

      {/* Maintenance toggle */}
      <div
        className="rounded-lg p-4 flex items-center justify-between gap-4"
        style={{ background: 'color-mix(in srgb, var(--color-ink-base) 3%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)' }}
      >
        <div>
          <p className="text-sm font-bold text-white">Add monthly site maintenance?</p>
          <p className="text-xs text-ink-muted font-light mt-0.5">
            ${MAINTENANCE_MONTHLY_PRICE}/month — updates, backups, and uptime monitoring.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={maintenance}
          onClick={() => !savingMaintenance && toggleMaintenance(!maintenance)}
          disabled={savingMaintenance}
          className="flex-shrink-0 w-12 h-6 rounded-full relative transition-colors focus:outline-none disabled:opacity-60 cursor-pointer border-none p-0"
          style={{ background: maintenance ? 'var(--color-brand-primary)' : 'color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
            style={{ left: maintenance ? '26px' : '2px' }}
          />
        </button>
      </div>

      {payError && (
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>{payError}</p>
      )}

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full py-3.5 rounded-lg font-black text-[11px] uppercase tracking-widest border-none cursor-pointer disabled:opacity-60"
        style={{ background: '#B98CFF', color: 'var(--color-bg-base)' }}
      >
        {paying ? 'Processing…' : `Pay $${(lead.package ? (PACKAGE_PRICE[lead.package] ?? 0) : 0) + DOMAIN_FEE + (maintenance ? MAINTENANCE_MONTHLY_PRICE : 0)} & Launch`}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Milestone Tracker
// ---------------------------------------------------------------------------

function MilestoneTracker({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  if (lead.status === 'pending') {
    return (
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">Status</p>
        <p className="mt-1 text-sm text-white/70 font-light">
          Your application is in the queue — we'll review it and reach out soon.
        </p>
      </div>
    );
  }

  if (lead.status === 'launched' || lead.status === 'completed') {
    const paidDate = lead.paid_at ? new Date(lead.paid_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;
    const renewalDate = lead.domain_renewal_date ? new Date(lead.domain_renewal_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;

    return (
      <div className="mt-6 flex flex-col gap-3">
        <div className="p-4 rounded-xl border" style={{ background: 'color-mix(in srgb, var(--color-brand-primary) 7%, transparent)', borderColor: 'color-mix(in srgb, var(--color-brand-primary) 25%, transparent)' }}>
          <p className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--color-brand-primary)' }}>
            Project Launched 🎉
          </p>
          <p className="mt-1 text-xs text-ink-muted font-light">All milestones completed.</p>
        </div>

        {safeUrl(lead.site_url) && (
          <a
            href={safeUrl(lead.site_url)!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'color-mix(in srgb, var(--color-brand-primary) 10%, transparent)', color: 'var(--color-brand-primary)', border: '1px solid color-mix(in srgb, var(--color-brand-primary) 25%, transparent)' }}
          >
            <ExternalLink className="w-4 h-4" />
            Visit Your Site
          </a>
        )}

        {/* Payment summary */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)' }}
        >
          <div className="px-4 py-2.5" style={{ background: 'color-mix(in srgb, var(--color-ink-base) 4%, transparent)' }}>
            <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted">Billing Summary</p>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 py-3" style={{ background: 'color-mix(in srgb, var(--color-ink-base) 2%, transparent)' }}>
            {paidDate && (
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Paid On</p>
                <p className="text-[13px] font-bold text-white">{paidDate}</p>
              </div>
            )}
            {renewalDate && (
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Domain Renewal</p>
                <p className="text-[13px] font-bold text-white">{renewalDate}</p>
              </div>
            )}
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Domain</p>
              <p className="text-[13px] font-bold text-white">$20 / year</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted mb-0.5">Maintenance</p>
              <p className="text-[13px] font-bold" style={{ color: lead.wants_maintenance ? 'var(--color-brand-primary)' : '#555' }}>
                {lead.wants_maintenance ? `$${MAINTENANCE_MONTHLY_PRICE}/mo` : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showMockupReview = lead.milestone_index === 1 && !!lead.mockup_url;
  const showPayment = lead.milestone_index >= 4;

  return (
    <div className="mt-6">
      <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-4">Project Milestones</p>
      <div className="flex flex-col gap-0">
        {MILESTONES.map((label, idx) => {
          const done = idx < lead.milestone_index;
          const current = idx === lead.milestone_index;
          const upcoming = idx > lead.milestone_index;
          return (
            <div key={idx} className="flex items-start gap-3 relative">
              {/* connector line */}
              {idx < MILESTONES.length - 1 && (
                <div
                  className="absolute left-[10px] top-[22px] w-px"
                  style={{
                    height: 28,
                    background: done ? 'var(--color-brand-primary)' : 'color-mix(in srgb, var(--color-ink-base) 10%, transparent)',
                  }}
                />
              )}
              <div className="flex-shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
                ) : current ? (
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: 'var(--color-brand-primary)', background: 'color-mix(in srgb, var(--color-brand-primary) 15%, transparent)' }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-brand-primary)' }} />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-white/20" />
                )}
              </div>
              <div className="pb-7 w-full">
                <p
                  className="text-sm font-bold leading-tight"
                  style={{
                    color: done ? 'var(--color-ink-base)' : current ? 'var(--color-brand-primary)' : 'color-mix(in srgb, var(--color-ink-base) 35%, transparent)',
                  }}
                >
                  {label}
                </p>
                {current && (
                  <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--color-brand-primary)' }}>
                    Current stage
                  </p>
                )}
                {/* Mockup review UI — shown at "Mockup Delivered" when URL is set */}
                {idx === 1 && current && showMockupReview && (
                  <MockupReviewPanel lead={lead} onUpdate={onUpdate} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment + maintenance — shown when "Site Completed" milestone is active */}
      {showPayment && (
        <PaymentPanel lead={lead} onUpdate={onUpdate} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project Card
// ---------------------------------------------------------------------------

function ProjectCard({ lead, active, onUpdate }: { lead: Lead; active: boolean; onUpdate: (updated: Lead) => void }) {
  const cfg = STATUS_CONFIG[lead.status];
  const pkg = lead.package ? lead.package : null;
  const date = new Date(lead.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div
      className="liquid-glass rounded-xl p-6 md:p-8"
      style={{ borderColor: active ? 'color-mix(in srgb, var(--color-brand-primary) 20%, transparent)' : 'color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display font-bold italic text-xl md:text-2xl">{lead.business}</h3>
          <p className="text-ink-muted text-xs mt-1">
            Submitted {date}
            {pkg && <> · <span className="text-white/60 uppercase tracking-widest">{pkg}</span></>}
          </p>
        </div>
        <StatusBadge label={cfg.label} color={cfg.color} />
      </div>

      <MilestoneTracker lead={lead} onUpdate={onUpdate} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyProjects() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/?auth=login&next=/my-projects', { replace: true });
      return;
    }
    getMyLeads()
      .then(setLeads)
      .catch(() => setError('Could not load your projects — please try again.'))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const updateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const active = leads.filter((l) => l.status !== 'completed' && l.status !== 'launched');
  const past   = leads.filter((l) => l.status === 'completed' || l.status === 'launched');

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-bg-base/95 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-ink-muted hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-3 ml-2">
            <img src={logoSrc} alt="Consult Prompts" className="h-7 w-auto object-contain" />
            <span className="font-display font-bold uppercase tracking-tight text-base">Consult Prompts</span>
          </div>
          {user && (
            <span className="ml-auto text-xs text-ink-muted truncate hidden sm:block">{user.email}</span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold italic tracking-tight">My Projects</h1>
          <p className="text-ink-muted text-sm mt-2 font-light">Track your project status and milestone progress.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        )}

        {error && (
          <div className="liquid-glass rounded-xl p-6 text-center">
            <p className="text-red-400 text-sm font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        {!loading && !error && leads.length === 0 && (
          <div className="liquid-glass rounded-xl p-12 text-center border-white/5">
            <FolderOpen className="w-10 h-10 text-ink-muted mx-auto mb-4" />
            <h3 className="font-display font-bold italic text-xl mb-2">No projects yet</h3>
            <p className="text-ink-muted text-sm font-light mb-8">
              Start a project and your mockup request will appear here.
            </p>
            <Link
              to="/#pricing"
              className="inline-block bg-brand-primary text-bg-base font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              Start a project
            </Link>
          </div>
        )}  

        {active.length > 0 && (
          <section className="mb-10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-4">Active</p>
            <div className="flex flex-col gap-4">
              {active.map((l) => <ProjectCard key={l.id} lead={l} active onUpdate={updateLead} />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-4">Past Projects</p>
            <div className="flex flex-col gap-4">
              {past.map((l) => <ProjectCard key={l.id} lead={l} active={false} onUpdate={updateLead} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
