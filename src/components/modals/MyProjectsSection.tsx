import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, FolderOpen, ExternalLink, ChevronLeft, X } from 'lucide-react';
import { getMyLeads, submitReview, setWantsMaintenance, markPaid, requestMeeting, getLeadActivity, type Lead, type LeadActivity } from '../../lib/api';
import { PACKAGES } from '../../data/content';
import { safeUrl } from '../../lib/urls';
import { MILESTONES, MILESTONES_PENDING, MILESTONE, projectStatusText } from '../../lib/milestones';
import { useBodyScrollLock } from '../../hooks';
import NewProjectForm from './NewProjectForm';

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
  accepted:  { label: 'In Progress',  color: '#00F0FF', bg: 'rgba(0,240,255,0.10)' },
  revision:  { label: 'Revision',     color: '#F5C542', bg: 'rgba(245,197,66,0.12)' },
  launched:  { label: 'Launched',     color: '#B98CFF', bg: 'rgba(112,0,255,0.18)' },
  suspended: { label: 'Suspended',    color: '#FF6B6B', bg: 'rgba(255,107,107,0.14)' },
};

// ---------------------------------------------------------------------------
// Mockup Review Panel
// ---------------------------------------------------------------------------

function MockupReviewPanel({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setSubmitting(true);
    setError('');
    try {
      await submitReview(lead.id, 'accept');
      // Approving checks off BOTH "Mockup Completed" and "Design Approved" —
      // the tracker moves straight to "Website Building".
      onUpdate({ ...lead, milestone_index: MILESTONE.approved });
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
      // Milestone doesn't move — "Mockup Completed" was never checked; the
      // admin sends a revised mockup and the review starts over.
      onUpdate({ ...lead, revision_feedback: feedback.trim(), status: 'revision', milestone_index: MILESTONE.meeting });
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
      className="mt-4 rounded-xl flex flex-col gap-4"
    >
      {safeUrl(lead.mockup_url) && (
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-2">Your Mockup</p>
          <a
            href={safeUrl(lead.mockup_url)!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm"
            style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)' }}
          >
            <ExternalLink className="w-4 h-4" />
            View Your Mockup
          </a>
        </div>
      )}

      {lead.revision_feedback && (
        <div
          className="rounded-lg p-4"
          style={{ background: 'rgba(245,197,66,0.08)', border: '1px solid rgba(245,197,66,0.2)' }}
        >
          <p className="text-[12px] uppercase tracking-widest font-bold mb-1" style={{ color: '#F5C542' }}>
            Revision Requested
          </p>
          <p className="text-sm text-white/70 font-light whitespace-pre-wrap">{lead.revision_feedback}</p>
          <p className="text-[10px] text-ink-muted mt-2">We'll deliver an updated mockup shortly.</p>
        </div>
      )}

      <div>
        {(!lead.revision_feedback || showFeedback) && (
          <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-3">
            Review Your Mockup
          </p>
        )}
        {!showFeedback && !lead.revision_feedback && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="px-[18px] py-2 rounded-[9px] font-bold text-[13px] border-none cursor-pointer disabled:opacity-60"
              style={{ background: '#00F0FF', color: '#050505' }}
            >
              {submitting ? 'Saving…' : 'Approve Design'}
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              disabled={submitting}
              className="px-[18px] py-2 rounded-[9px] font-bold text-[13px] cursor-pointer disabled:opacity-60"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff' }}
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
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleRequestChanges}
                disabled={submitting}
                className="px-[18px] py-2 rounded-[9px] font-bold text-[13px] border-none cursor-pointer disabled:opacity-60"
                style={{ background: '#F5C542', color: '#050505' }}
              >
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
              <button
                onClick={() => { setShowFeedback(false); setFeedback(''); setError(''); }}
                disabled={submitting}
                className="px-[18px] py-2 rounded-[9px] font-bold text-[13px] cursor-pointer disabled:opacity-60"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#A1A1A1' }}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payment Panel
// ---------------------------------------------------------------------------

function PaymentPanel({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [maintenance, setMaintenance] = useState(lead.wants_maintenance);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);

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
      // Checks off "Payment Completed" — the tracker moves to "Preparing for
      // Launch" while the admin puts the site live.
      onUpdate({ ...lead, is_paid: true, paid_at: new Date().toISOString(), milestone_index: MILESTONE.payment });
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
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(0,240,255,0.2)' }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ background: 'rgba(0,240,255,0.08)' }}
        >
          <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: '#00F0FF' }}>
            ✓ Payment Confirmed
          </span>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3" style={{ background: 'rgba(0,240,255,0.03)' }}>
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
              <p className="text-[13px] font-bold" style={{ color: lead.wants_maintenance ? '#00F0FF' : '#555' }}>
                {lead.wants_maintenance ? `$${MAINTENANCE_MONTHLY_PRICE}/mo` : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pkgPrice = lead.package ? (PACKAGE_PRICE[lead.package] ?? 0) : 0;
  const pkgName  = lead.package ? (PACKAGE_NAME[lead.package] ?? lead.package) : null;
  const total = pkgPrice + DOMAIN_FEE + (maintenance ? MAINTENANCE_MONTHLY_PRICE : 0);

  return (
    <>
      <div className="w-full liquid-glass rounded-xl p-5 flex flex-col gap-6">
        {/* Fee summary */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] uppercase tracking-widest font-bold text-ink-muted">Order Summary</p>
          </div>

          {pkgName && (
            <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[13px] text-ink-muted">{pkgName}</span>
              <span className="text-[13px] font-bold text-white">${pkgPrice}</span>
            </div>
          )}

          <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[13px] text-ink-muted">Domain registration</span>
            <span className="text-[13px] font-bold text-white">${DOMAIN_FEE} / year</span>
          </div>

          {maintenance && (
            <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[13px] text-ink-muted">Site maintenance</span>
              <span className="text-[13px] font-bold text-white">${MAINTENANCE_MONTHLY_PRICE} / month</span>
            </div>
          )}

          {/* Total row */}
          <div
            className="flex justify-between items-center px-4 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,240,255,0.06)' }}
          >
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#00F0FF' }}>
                Due Today
              </span>
              {maintenance && (
                <span className="ml-2 text-[10px] text-ink-muted font-light">
                  (then ${MAINTENANCE_MONTHLY_PRICE}/mo)
                </span>
              )}
            </div>
            <span className="text-[20px] font-black" style={{ color: '#00F0FF' }}>
              ${total}
            </span>
          </div>

          <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[10px] text-ink-muted font-light">
              Domain renews annually. You'll be reminded before the renewal date.
            </p>
          </div>
        </div>

        {/* Maintenance toggle */}
        <div
          className="rounded-lg p-4 flex items-center justify-between gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
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
            style={{ background: maintenance ? '#00F0FF' : 'rgba(255,255,255,0.15)' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
              style={{ left: maintenance ? '26px' : '2px' }}
            />
          </button>
        </div>

        <button
          onClick={() => setShowPayModal(true)}
          className="text-[13px] font-bold px-[18px] py-2 rounded-[9px] border-none cursor-pointer"
          style={{ background: '#00F0FF', color: '#050505' }}
        >
          Pay Now
        </button>
      </div>

      {showPayModal && (
        <PayModal
          total={total}
          paying={paying}
          payError={payError}
          onConfirm={handlePay}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// PayModal
// ---------------------------------------------------------------------------

// Payment form — UI only. TODO: wire to real payment provider (Stripe/PayPal) once Order & Payment service exists.
function PayModal({
  total, paying, payError, onConfirm, onClose,
}: {
  total: number;
  paying: boolean;
  payError: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useBodyScrollLock(true);

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm cursor-pointer" />
      <div className="relative w-full max-w-md liquid-glass rounded-xl p-6 md:p-8 z-10">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-ink-muted hover:text-white transition-colors cursor-pointer bg-transparent border-none"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-[12px] uppercase tracking-widest font-bold mb-1" style={{ color: '#00F0FF' }}>
          Payment Details
        </p>
        <p className="text-xs text-ink-muted font-light mb-6">Enter your card details to pay ${total} and launch your site.</p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
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
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">CVV</label>
              <input
                type="text"
                placeholder="123"
                maxLength={4}
                className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Name on Card</label>
            <input
              type="text"
              placeholder="Jane Smith"
              className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Billing Address</label>
            <input
              type="text"
              placeholder="123 Main St, City, State, ZIP"
              className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
          </div>
        </div>

        {payError && (
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>{payError}</p>
        )}

        <button
          onClick={onConfirm}
          disabled={paying}
          className="w-full mt-6 text-[13px] font-bold px-[18px] py-3 rounded-[9px] border-none cursor-pointer disabled:opacity-60"
          style={{ background: '#00F0FF', color: '#050505' }}
        >
          {paying ? 'Processing…' : `Pay $${total} & Launch`}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HorizontalMilestoneTracker
// ---------------------------------------------------------------------------

function HorizontalMilestoneTracker({ lead }: { lead: Lead }) {
  // When a skipped meeting is re-requested, treat the meeting step as the
  // current in-progress step rather than done. This shifts "current" back
  // so the mockup step doesn't also ping.
  // Requesting a meeting resets milestone_index to 0, so "pending meeting"
  // is identified by milestone_index===0 (not ===1, which means completed).
  const meetingReRequested = lead.wants_call && lead.meeting_skipped && lead.milestone_index === 0;

  return (
    <div className="flex items-start mt-5 pb-1 pt-4">
      {MILESTONES.map((doneLabel, i) => {
        const k = i + 1;
        const rawDone = lead.milestone_index >= k;
        const done = rawDone && !(meetingReRequested && k === MILESTONE.meeting);
        const current = meetingReRequested ? k === MILESTONE.meeting : lead.milestone_index === i;
        // Show "Meeting Skipped" only when skipped and the user never re-requested.
        const isSkippedMeeting = k === MILESTONE.meeting && lead.meeting_skipped && !lead.wants_call && rawDone;

        let label: string;
        if (done) {
          label = isSkippedMeeting ? 'Meeting Skipped' : doneLabel;
        } else if (!done && current && lead.revision_feedback && k === MILESTONE.mockup) {
          label = 'Redesigning Mockup';
        } else {
          label = MILESTONES_PENDING[i];
        }

        const labelColor = done ? '#ffffff' : current ? '#00F0FF' : 'rgba(255,255,255,0.3)';

        return (
          <div key={doneLabel} className="flex-1 flex flex-col items-center relative min-w-[64px]">
            {/* Left half connector: right edge of prev step → this dot */}
            {i !== 0 && (
              <div
                className="absolute h-0.5"
                style={{ top: 14, left: 0, right: '50%', background: done ? '#00F0FF' : 'rgba(255,255,255,0.12)' }}
              />
            )}
            {/* Right half connector: this dot → left edge of next step */}
            {i < MILESTONES.length - 1 && (
              <div
                className="absolute h-0.5"
                style={{ top: 14, left: '50%', right: 0, background: done ? '#00F0FF' : 'rgba(255,255,255,0.12)' }}
              />
            )}

            {/* Dot */}
            {done ? (
              <div
                className="rounded-full flex items-center justify-center w-7 h-7 relative z-10"
                style={{ background: '#00F0FF', border: '2px solid #00F0FF' }}
              >
                <span className="text-xs font-black" style={{ color: '#050505' }}>✓</span>
              </div>
            ) : current ? (
              <div className="relative w-7 h-7 z-10">
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(0,240,255,0.35)', animationDuration: '1.6s' }}
                />
                <div
                  className="relative w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'transparent', border: '2px solid #00F0FF' }}
                >
                  <span className="text-xs font-black" style={{ color: '#00F0FF' }}>{k}</span>
                </div>
              </div>
            ) : (
              <div
                className="rounded-full flex items-center justify-center w-7 h-7 relative z-10"
                style={{ border: '2px solid rgba(255,255,255,0.2)' }}
              >
                <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>{k}</span>
              </div>
            )}

            {/* Label */}
            <p
              className="mt-2 text-[10px] font-semibold text-center leading-tight px-1"
              style={{ color: labelColor }}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectSummaryCard
// ---------------------------------------------------------------------------

function ProjectSummaryCard({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const cfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG['accepted'];
  const pkgName = lead.package ? (PACKAGE_NAME[lead.package] ?? null) : null;
  const date = new Date(lead.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="liquid-glass-tracker rounded-2xl p-8 mb-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display font-bold italic text-2xl">
            {lead.business}{pkgName ? ` — ${pkgName}` : ''}
          </h3>
          <p className="text-xs text-ink-muted mt-1">Started {date}</p>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {projectStatusText(lead)}
        </span>
      </div>

      <HorizontalMilestoneTracker lead={lead} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// LastLaunchedCard — shown on the main view when there's nothing active in
// flight but the client has a previously launched site.
// ---------------------------------------------------------------------------

function LastLaunchedCard({ lead }: { lead: Lead }) {
  const pkgName = lead.package ? (PACKAGE_NAME[lead.package] ?? lead.package) : null;
  const launchedDate = lead.paid_at
    ? new Date(lead.paid_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;
  const siteUrl = safeUrl(lead.site_url);

  return (
    <div className="liquid-glass rounded-2xl flex justify-between p-8">
      <div>
        <h3 className="font-display font-bold italic text-2xl mb-1">{lead.business} is LIVE! 🎉</h3>
        <p className="text-ink-muted text-sm">
          {pkgName ?? lead.package}
          {launchedDate ? ` · Launched ${launchedDate}` : ''}
        </p>
      </div>
      {siteUrl && (
        <div>
          <a
            href={safeUrl(siteUrl)!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm"
            style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)' }}
          >
            <ExternalLink className="w-4 h-4" />
            Visit site
          </a>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PendingProjectCard
// ---------------------------------------------------------------------------

function PendingProjectCard({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG['pending'];
  const pkgName = lead.package ? (PACKAGE_NAME[lead.package] ?? null) : null;
  const date = new Date(lead.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div
      className="rounded-2xl p-8 mb-0"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display font-bold italic text-2xl">
            {lead.business}{pkgName ? ` — ${pkgName}` : ''}
          </h3>
          <p className="text-xs text-ink-muted mt-1">Started {date}</p>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          Under Review
        </span>
      </div>

      <div className="rounded-xl p-4 mt-5" style={{ background: 'rgba(245,197,66,0.08)', border: '1px solid rgba(245,197,66,0.2)' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">Status</p>
        <p className="text-sm text-white/70 font-light mt-1">
          Your application is in the queue — we'll review it and reach out soon.
        </p>
      </div>

      <button
        onClick={() => navigate(`/settings/my-projects/${lead.id}/edit`, { replace: true })}
        className="mt-3 text-[13px] font-bold px-[18px] py-2 rounded-[9px] cursor-pointer"
        style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#ffffff' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      >
        Edit Submission
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CyclingLoader — terminal-style "Thinking… / Cooking…" busy indicator
// ---------------------------------------------------------------------------

function CyclingLoader({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [dots, setDots] = useState(1);

  // Word changes on a random 4–8 minute cadence rather than a fixed tick.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = (4 + Math.random() * 4) * 60_000;
      timeoutId = setTimeout(() => {
        setI((n) => (n + 1) % words.length);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [words.length]);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#00F0FF' }} />
      <span className="text-[13px] font-bold" style={{ color: '#00F0FF' }}>
        {words[i]}
        <span className="inline-block w-[3ch] text-left">{'.'.repeat(dots)}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StageActionPanel — dispatcher
// ---------------------------------------------------------------------------

function StageActionPanel({ lead, onUpdate }: { lead: Lead; onUpdate: (updated: Lead) => void }) {
  const [meetingState, setMeetingState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const meetingRequested = meetingState === 'sent' || lead.wants_call;

  const handleRequestMeeting = async () => {
    setMeetingState('sending');
    try {
      await requestMeeting(lead.id);
      onUpdate({ ...lead, wants_call: true, milestone_index: 0 });
      setMeetingState('sent');
    } catch {
      setMeetingState('error');
    }
  };

  // Meeting panel — also show when admin skipped the meeting and the user
  // hasn't requested one yet (wants_call=false). Once wants_call is true and
  // the admin marks it done (milestone_index back to 1), hide the panel.
  if (lead.meeting_skipped && lead.milestone_index === MILESTONE.meeting && !lead.wants_call) {
    return (
      <div
        className="rounded-[14px] p-6 border border-white/8 bg-bg-surface"
      >
        <p className="font-display font-bold text-[15px] mb-1">Schedule your kickoff meeting</p>
        <p className="text-[13px] text-ink-muted mb-5">
          Let's talk through your goals before we start on your mockup.
        </p>
        <button
          onClick={meetingRequested ? undefined : handleRequestMeeting}
          disabled={meetingState === 'sending' || meetingRequested}
          className="px-[18px] py-2 rounded-[9px] font-bold text-[13px] border-none cursor-pointer disabled:cursor-default transition-colors"
          style={meetingRequested
            ? { background: 'transparent', border: '2px solid #00F0FF', color: '#00F0FF' }
            : { background: '#00F0FF', color: '#050505' }}
        >
          {meetingState === 'sending' ? 'Sending…' : meetingRequested ? '✓ Meeting Requested' : meetingState === 'error' ? 'Try Again' : 'Request a Meeting'}
        </button>
      </div>
    );
  }

  // Nothing done yet — waiting on the kickoff meeting to happen.
  if (lead.milestone_index === 0) {
    return (
      <div className="rounded-[14px] p-6 border border-white/8 bg-bg-surface">
        <p className="font-display font-bold text-[15px] mb-1">Awaiting your meeting</p>
        <p className="text-[13px] text-ink-muted">
          We'll be in touch to schedule your kickoff call — you'll be notified as soon as it's done and we start on your mockup.
        </p>
      </div>
    );
  }

  // Meeting done, mockup not sent yet — admin is designing it.
  if (lead.milestone_index === MILESTONE.meeting && !lead.revision_feedback) {
    return (
      <div className="rounded-[14px] p-6 border border-white/8 bg-bg-surface">
        <p className="font-display font-bold text-[15px] mb-1">Designing your mockup</p>
        <p className="text-[13px] text-ink-muted mb-5">
          We're putting your mockup together — you'll be notified as soon as it's ready to review.
        </p>
        <CyclingLoader words={['Designing', 'Sketching layouts', 'Choosing colors', 'Polishing pixels', 'Cooking']} />
      </div>
    );
  }

  // Mockup review panel — also visible during revision (milestone resets to
  // MilestoneMeeting while admin redesigns, but the feedback notice must persist).
  if (lead.milestone_index === MILESTONE.mockup || (lead.milestone_index === MILESTONE.meeting && !!lead.revision_feedback)) {
    return (
      <div className="rounded-[14px] p-6 border border-white/8 bg-bg-surface">
        <p className="font-display font-bold text-[15px] mb-1">Review your mockup</p>
        <p className="text-[13px] text-ink-muted mb-5">
          Take a look at the design and let us know if it's ready to build.
        </p>
        <MockupReviewPanel lead={lead} onUpdate={onUpdate} />
      </div>
    );
  }

  // Design approved, site not built yet — admin is building it.
  if (lead.milestone_index === MILESTONE.approved) {
    return (
      <div className="rounded-[14px] p-6 border border-white/8 bg-bg-surface">
        <p className="font-display font-bold text-[15px] mb-1">Building your website</p>
        <p className="text-[13px] text-ink-muted mb-5">
          Your design is approved and we're building the site — you'll be notified as soon as it's ready.
        </p>
        <CyclingLoader words={['Building', 'Assembling pages', 'Wiring things up', 'Testing', 'Cooking']} />
      </div>
    );
  }

  // Payment panel
  if (lead.milestone_index >= MILESTONE.website) {
    return (
      <div className="rounded-[14px] p-6 border border-white/8 bg-bg-surface">
        <p className="font-display font-bold text-[15px] mb-1">
          {lead.is_paid ? 'Preparing for Launch' : 'Complete Payment to Launch'}
        </p>
        <p className="text-[13px] text-ink-muted mb-5">
          {lead.is_paid
            ? "Payment's confirmed — we're getting your site ready to go live."
            : 'Review your order, then pay to finalise and launch your site.'}
        </p>
        {lead.is_paid && (
          <div className="mb-5">
            <CyclingLoader words={['Preparing', 'Setting up hosting', 'Configuring domain', 'Final checks', 'Cooking']} />
          </div>
        )}
        <PaymentPanel lead={lead} onUpdate={onUpdate} />
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// ActivityPanel — running log of everything that's happened on the project
// so far. Shown once anything's happened; disappears once the site launches
// (inProgress no longer includes the lead once status flips to 'launched').
// ---------------------------------------------------------------------------

// Human labels for each event_type the backend logs (agency-service/internal/service/lead_service.go).
const ACTIVITY_LABEL: Record<string, string> = {
  project_submitted: 'Project submitted',
  lead_accepted: 'Project accepted',
  meeting_requested: 'Meeting requested',
  meeting_completed: 'Meeting completed',
  mockup_sent: 'Mockup sent for review',
  changes_requested: 'Changes requested',
  design_approved: 'Design approved',
  website_completed: 'Website completed',
  payment_completed: 'Payment completed',
  website_launched: 'Website is live',
};

function formatActivityTimestamp(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) +
    ' · ' +
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
}

function ActivityPanel({ lead }: { lead: Lead }) {
  const [events, setEvents] = useState<LeadActivity[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLeadActivity(lead.id)
      .then((data) => {
        if (cancelled) return;
        // Newest first, regardless of what order the server returned.
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setEvents(sorted);
      })
      .catch(() => { if (!cancelled) setEvents([]); });
    return () => { cancelled = true; };
    // Refetch whenever anything actionable on the lead changes — onUpdate()
    // replaces the lead object on every action, but lead.id alone never
    // changes, so those mutable fields have to be explicit dependencies.
  }, [lead.id, lead.milestone_index, lead.status, lead.is_paid, lead.mockup_url, lead.revision_feedback, lead.wants_call]);

  if (!events || events.length === 0) return null;

  return (
    <div className="rounded-[14px] p-6 border border-white/8 bg-bg-surface">
      <p className="font-display font-bold text-[15px] mb-4">Activity</p>
      <div className="flex flex-col gap-3">
        {events.map((e) => (
          <div key={e.id} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ background: '#00F0FF' }} />
            <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
              <p className="text-[13px] text-white/80 font-light m-0">
                {ACTIVITY_LABEL[e.event_type] ?? e.event_type}
                {e.detail && e.event_type === 'changes_requested' ? `: ${e.detail}` : ''}
              </p>
              <p className="text-[11px] text-ink-muted m-0 flex-shrink-0 whitespace-nowrap">
                {formatActivityTimestamp(e.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

function OldProjectsView({ past, onBack }: { past: Lead[]; onBack: () => void }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="hidden md:flex items-center gap-1.5 text-ink-muted text-[15px] font-bold cursor-pointer bg-transparent border-none hover:text-white transition-colors mb-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      <h2 className="font-display font-bold text-2xl mt-4 mb-1">Old projects</h2>
      <p className="text-[13px] text-ink-muted mb-6">Past sites you've launched with us.</p>
      <div className="flex flex-col gap-3">
        {past.map((lead) => {
          const pkgName = lead.package ? (PACKAGE_NAME[lead.package] ?? lead.package) : null;
          const launchedDate = lead.paid_at
            ? new Date(lead.paid_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            : null;
          const siteUrl = safeUrl(lead.site_url);

          return (
            <div
              key={lead.id}
              className="rounded-[14px] border px-6 py-[22px] flex items-center justify-between"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-surface, rgba(255,255,255,0.03))' }}
            >
              <div>
                <p className="font-display font-bold text-base">{lead.business}</p>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  {pkgName ?? lead.package}
                  {launchedDate ? ` · Launched ${launchedDate}` : ''}
                </p>
              </div>
              {siteUrl && (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-bold"
                  style={{ color: 'var(--brand-primary, #00F0FF)' }}
                >
                  Visit site ↗
                </a>
              )}
            </div>
          );
        })}
        {past.length === 0 && (
          <div className="liquid-glass rounded-xl p-12 text-center border-white/5">
          <FolderOpen className="w-10 h-10 text-ink-muted mx-auto mb-4" />
          <h3 className="font-display font-bold italic text-xl mb-2">No past projects yet.</h3>
          <p className="text-ink-muted text-sm font-light">
            Start a project and your mockup request will appear here.
          </p>
        </div>
        )}
      </div>
    </div>
  );
}

function PaymentsView({ leads, onBack }: { leads: Lead[]; onBack: () => void }) {
  const paidLeads = leads.filter((l) => l.is_paid);

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="hidden md:flex items-center gap-1.5 text-ink-muted text-[15px] font-bold cursor-pointer bg-transparent border-none hover:text-white transition-colors mb-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      <h2 className="font-display font-bold text-2xl mt-4 mb-1">Payments</h2>
      <p className="text-[13px] text-ink-muted mb-6">Your billing history with Consult Prompts.</p>

      <div className="w-full rounded-[14px] border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {/* Header row */}
        <div
          className="px-5 py-4 grid"
          style={{
            background: 'rgba(255,255,255,0.03)',
            gridTemplateColumns: '0.8fr 2.2fr 0.8fr 0.8fr',
          }}
        >
          {['DATE', 'NAME', 'AMOUNT', 'STATUS'].map((col) => (
            <span key={col} className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">{col}</span>
          ))}
        </div>

        {paidLeads.length === 0 ? (
          <p className="text-sm text-ink-muted font-light text-center py-8">No payments yet.</p>
        ) : (
          paidLeads.map((lead) => {
            const dateStr = lead.paid_at
              ? new Date(lead.paid_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
              : '—';
            const description = `${lead.business} — ${PACKAGE_NAME[lead.package ?? ''] ?? lead.package ?? '—'}`;
            const amount = lead.payment_amount != null ? `$${lead.payment_amount.toFixed(2)}` : '—';

            return (
              <div
                key={lead.id}
                className="px-5 py-[14px] grid"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  gridTemplateColumns: '0.8fr 2.2fr 0.8fr 0.8fr',
                }}
              >
                <span className="text-[13px] text-ink-muted">{dateStr}</span>
                <span className="text-[13px] text-white">{description}</span>
                <span className="text-[13px] font-bold text-white">{amount}</span>
                <span className="text-[13px] font-bold" style={{ color: '#22c55e' }}>Paid</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export default function MyProjectsSection({ onClose }: { onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subView, setSubView] = useState<'main' | 'old-projects' | 'payments'>('main');

  const refresh = useCallback((showLoader = true) => {
    if (showLoader) setLoading(true);
    return getMyLeads()
      .then(setLeads)
      .catch(() => setError('Could not load your projects — please try again.'))
      .finally(() => { if (showLoader) setLoading(false); });
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(() => refresh(false), 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const updateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const inProgress = leads.filter((l) => l.status === 'accepted' || l.status === 'revision');
  const pendingLeads = leads.filter((l) => l.status === 'pending');
  const past = leads.filter((l) => l.status === 'completed' || l.status === 'launched' || l.status === 'suspended');
  const hasActive = inProgress.length > 0 || pendingLeads.length > 0;

  // Most recently launched project — surfaced on the main view when there's
  // nothing currently in flight, instead of the plain "No projects yet" state.
  const lastLaunched = leads
    .filter((l) => l.status === 'launched' || l.status === 'completed')
    .sort((a, b) => {
      const dateOf = (l: Lead) => new Date(l.paid_at ?? l.created_at).getTime();
      return dateOf(b) - dateOf(a);
    })[0] ?? null;

  const showNewProjectForm = location.pathname.endsWith('/new-project');
  const editMatch = !loading && location.pathname.match(/\/settings\/my-projects\/([^/]+)\/edit$/);
  const editLead = editMatch ? leads.find((l) => l.id === editMatch[1] && l.status === 'pending') ?? null : null;
  const backToList = () => navigate('/settings/my-projects', { replace: true });

  // Only one project in flight at a time — mirrors the same rule the public
  // "Start a project" CTAs already enforce (see Home.tsx's checkActiveLead).
  // A direct URL hit while one's already active bounces back to the list.
  useEffect(() => {
    if (showNewProjectForm && !loading && hasActive) backToList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewProjectForm, loading, hasActive]);

  if (editLead) {
    return (
      <NewProjectForm
        initialLead={editLead}
        onBack={() => { refresh(); backToList(); }}
        onClose={onClose}
      />
    );
  }

  if (showNewProjectForm) {
    return (
      <NewProjectForm
        onBack={() => { refresh(); backToList(); }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto py-4 md:py-6">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">

          {/* Desktop-only header row — hidden when in a sub-view */}
          <div className={`${subView === 'main' ? 'hidden md:flex' : 'hidden'} items-start justify-between mb-7`}>
            <div>
              <h2 className="font-display font-bold text-2xl">My projects</h2>
              <p className="text-[13px] text-ink-muted mt-1">Track your build from meeting to launch.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSubView('old-projects')}
                className="text-[13px] font-bold px-[18px] py-2 rounded-[9px] cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#ffffff' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
              >
                Old Projects
              </button>
              <button
                onClick={() => setSubView('payments')}
                className="text-[13px] font-bold px-[18px] py-2 rounded-[9px] cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#ffffff' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
              >
                Payments
              </button>
              <button
                onClick={() => navigate('/settings/my-projects/new-project', { replace: true })}
                disabled={hasActive}
                className="text-[13px] font-bold px-[18px] py-2 rounded-[9px] border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-brand-primary text-bg-base hover:bg-brand-primary/90"
              >
                + New project
              </button>
            </div>
          </div>

          {/* Sub-view: old projects */}
          {subView === 'old-projects' && (
            <OldProjectsView past={past} onBack={() => setSubView('main')} />
          )}

          {/* Sub-view: payments */}
          {subView === 'payments' && (
            <PaymentsView leads={leads} onBack={() => setSubView('main')} />
          )}

          {/* Main view */}
          {subView === 'main' && (
            <>
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

              {inProgress.map((l) => (
                <div key={l.id} className="flex flex-col gap-5 mb-5">
                  <ProjectSummaryCard lead={l} onUpdate={updateLead} />
                  <StageActionPanel lead={l} onUpdate={updateLead} />
                  <ActivityPanel lead={l} />
                </div>
              ))}

              {pendingLeads.map((l) => (
                <div key={l.id} className="mb-5">
                  <PendingProjectCard lead={l} onUpdate={updateLead} />
                </div>
              ))}

              {!loading && !error && !hasActive && (
                lastLaunched ? (
                  <LastLaunchedCard lead={lastLaunched} />
                ) : (
                  <div className="liquid-glass rounded-xl p-12 text-center border-white/5">
                    <FolderOpen className="w-10 h-10 text-ink-muted mx-auto mb-4" />
                    <h3 className="font-display font-bold italic text-xl mb-2">No projects yet</h3>
                    <p className="text-ink-muted text-sm font-light">
                      Start a project and your mockup request will appear here.
                    </p>
                  </div>
                )
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
