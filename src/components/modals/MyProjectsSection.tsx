import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, FolderOpen, ExternalLink, ChevronLeft } from 'lucide-react';
import { getMyLeads, submitReview, setWantsMaintenance, markPaid, requestMeeting, type Lead } from '../../lib/api';
import { PACKAGES } from '../../data/content';
import { safeUrl } from '../../lib/urls';
import { MILESTONES, MILESTONES_PENDING, MILESTONE, projectStatusText } from '../../lib/milestones';
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

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-6"
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
              style={{ borderTop: '1px solid rgba(255,255,255,0.12)', background: 'rgba(185,140,255,0.06)' }}
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

            <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
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

      {payError && (
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>{payError}</p>
      )}

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full py-3.5 rounded-lg font-black text-[11px] uppercase tracking-widest border-none cursor-pointer disabled:opacity-60"
        style={{ background: '#B98CFF', color: '#050505' }}
      >
        {paying ? 'Processing…' : `Pay $${(lead.package ? (PACKAGE_PRICE[lead.package] ?? 0) : 0) + DOMAIN_FEE + (maintenance ? MAINTENANCE_MONTHLY_PRICE : 0)} & Launch`}
      </button>
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
                style={{ background: '#00F0FF', border: '2px solid #0B0D10' }}
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
          {projectStatusText(lead)}
        </span>
      </div>

      <HorizontalMilestoneTracker lead={lead} />
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

      <div className="rounded-xl p-4 mt-5 bg-white/[0.03] border border-white/10">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">Status</p>
        <p className="text-sm text-white/70 font-light mt-1">
          Your application is in the queue — we'll review it and reach out soon.
        </p>
      </div>

      <button
        onClick={() => navigate(`/settings/my-projects/${lead.id}/edit`, { replace: true })}
        className="mt-3 w-full py-3 border border-white/15 text-ink-muted font-bold text-xs uppercase tracking-widest rounded-xl hover:border-white/30 hover:text-white transition-colors bg-transparent cursor-pointer"
      >
        Edit Submission
      </button>
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

  // Payment panel
  if (lead.milestone_index >= MILESTONE.website) {
    return (
      <div className="rounded-[14px] border border-white/8 bg-bg-surface overflow-hidden">
        <PaymentPanel lead={lead} onUpdate={onUpdate} />
      </div>
    );
  }

  return null;
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
          <p className="text-sm text-ink-muted font-light text-center py-8">No past projects yet.</p>
        )}
      </div>
    </div>
  );
}

function PaymentsView({ leads, onBack }: { leads: Lead[]; onBack: () => void }) {
  const paidLeads = leads.filter((l) => l.is_paid);

  return (
    <div>
      <button
        onClick={onBack}
        className="hidden md:flex items-center gap-1.5 text-ink-muted text-[15px] font-bold cursor-pointer bg-transparent border-none hover:text-white transition-colors mb-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      <h2 className="font-display font-bold text-2xl mt-4 mb-1">Payments</h2>
      <p className="text-[13px] text-ink-muted mb-6">Your billing history with Consult Prompts.</p>

      <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {/* Header row */}
        <div
          className="px-5 py-4 grid"
          style={{
            background: 'rgba(255,255,255,0.03)',
            gridTemplateColumns: '1fr 1.4fr 0.8fr 0.8fr',
          }}
        >
          {['DATE', 'DESCRIPTION', 'AMOUNT', 'STATUS'].map((col) => (
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
                  gridTemplateColumns: '1fr 1.4fr 0.8fr 0.8fr',
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
        <div className="w-full px-4 md:px-8">

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
                </div>
              ))}

              {pendingLeads.map((l) => (
                <div key={l.id} className="mb-5">
                  <PendingProjectCard lead={l} onUpdate={updateLead} />
                </div>
              ))}

              {!loading && !error && !hasActive && (
                <div className="liquid-glass rounded-xl p-12 text-center border-white/5">
                  <FolderOpen className="w-10 h-10 text-ink-muted mx-auto mb-4" />
                  <h3 className="font-display font-bold italic text-xl mb-2">No projects yet</h3>
                  <p className="text-ink-muted text-sm font-light">
                    Start a project and your mockup request will appear here.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
