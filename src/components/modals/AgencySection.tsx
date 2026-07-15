import React, { useState } from 'react';
import { Search, X, Undo2 } from 'lucide-react';
import { type Lead } from '../../lib/api';
import { safeUrl } from '../../lib/urls';
import { MILESTONES, MILESTONE, projectStatusText } from '../../lib/milestones';
import { PACKAGES } from '../../data/content';
import CustomButton from '../ui/CustomButton';

export type Filter = 'pending' | 'accepted' | 'revision' | 'launched';

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  );
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  pending:   { bg: 'rgba(245,197,66,0.18)',  fg: '#F5C542', label: 'pending' },
  accepted:  { bg: 'color-mix(in srgb, var(--color-brand-primary) 18%, transparent)',   fg: 'var(--color-brand-primary)', label: 'in progress' },
  revision:  { bg: 'rgba(245,197,66,0.18)',  fg: '#F5C542', label: 'revision' },
  completed: { bg: 'rgba(112,0,255,0.22)',   fg: '#B98CFF', label: 'completed' },
  launched:  { bg: 'color-mix(in srgb, var(--color-brand-primary) 18%, transparent)',   fg: 'var(--color-brand-primary)', label: 'launched' },
  suspended: { bg: 'rgba(255,107,107,0.18)', fg: '#FF6B6B', label: 'suspended' },
};

// Admin checklist state for milestone k (1-based). Milestone k is done iff
// milestone_index >= k. Only two rows are plain manual checks (Meeting,
// Website Completed — the latter also fires the payment-request email);
// Mockup opens the send-URL modal and stays unchecked until the client
// approves; Design Approved and Payment Completed are auto-set and always
// disabled; Website is Live opens the launch-URL modal once payment is in.
type RowState = {
  done: boolean;
  clickable: boolean;
  lockReason?: string;
  badge?: { label: string; color: string };
};

function rowState(k: number, lead: Lead): RowState {
  const done = lead.milestone_index >= k;
  if (done && k === MILESTONE.meeting && lead.meeting_skipped) {
    return { done, clickable: false, badge: { label: 'Skipped', color: 'var(--color-ink-muted)' } };
  }
  if (done && k === MILESTONE.mockup) {
    // milestone_index === MILESTONE.mockup means URL sent, awaiting client review.
    if (lead.milestone_index === MILESTONE.mockup) {
      return { done, clickable: false, badge: { label: 'Sent', color: 'var(--color-brand-primary)' } };
    }
    return { done, clickable: false };
  }
  if (done || lead.status === 'launched') return { done, clickable: false };
  const current = lead.milestone_index === k - 1;

  const state = rowStateActive(k, lead, current);
  // Frozen while suspended — visible for reference, but reactivate the
  // project before touching anything. Badges still show for context.
  if (lead.status === 'suspended' && state.clickable) {
    return { ...state, clickable: false, lockReason: 'Reactivate the project to make changes' };
  }
  return state;
}

function rowStateActive(k: number, lead: Lead, current: boolean): RowState {
  const done = lead.milestone_index >= k;
  switch (k) {
    case MILESTONE.meeting:
      return { done, clickable: current };
    case MILESTONE.mockup:
      if (!current) return { done, clickable: false, lockReason: 'Complete previous milestones first' };
      if (lead.revision_feedback) {
        return { done, clickable: true, badge: { label: 'Changes Requested', color: '#F5C542' } };
      }
      return { done, clickable: true };
    case MILESTONE.approved:
      return { done, clickable: false, lockReason: 'Checked automatically when the client approves the design' };
    case MILESTONE.website:
      return current
        ? { done, clickable: true }
        : { done, clickable: false, lockReason: 'Complete previous milestones first' };
    case MILESTONE.payment:
      return { done, clickable: false, lockReason: "Checked automatically when the client's payment is confirmed" };
    default: // MILESTONE.live
      if (current) return { done, clickable: true };
      return {
        done, clickable: false,
        lockReason: lead.milestone_index === MILESTONE.website && !lead.is_paid
          ? 'Client must complete payment first'
          : 'Complete previous milestones first',
      };
  }
}

function normalizeText(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// True when `a` and `b` are within one edit (insert/delete/substitute) of each
// other — enough to forgive a single typo without a full fuzzy-search library.
function withinOneEdit(a: string, b: string) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0, j = 0, edits = 0;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (short.length === long.length) i++; // substitution
    j++; // insertion into `short` / skip in `long`
  }
  return edits + (long.length - j) <= 1;
}

// Matches when every search token appears in the lead's customer name,
// business/project name, or email — as a substring, or as a near-miss
// (one typo) against any single word.
export function leadMatchesSearch(lead: Lead, query: string) {
  const q = normalizeText(query).trim();
  if (!q) return true;
  const haystack = normalizeText(`${lead.name} ${lead.business} ${lead.email}`);
  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  return q.split(/\s+/).every((tok) =>
    haystack.includes(tok) ||
    (tok.length >= 4 && words.some((w) => withinOneEdit(tok, w))),
  );
}

// ---------------------------------------------------------------------------

interface AgencySectionProps {
  leads: Lead[];
  filtered: Lead[];
  filter: Filter | null;
  setFilter: (f: Filter | null) => void;
  search: string;
  setSearch: (v: string) => void;
  stats: { label: string; value: number; color: string }[];
  selected: Lead | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onMobileLeadSelect: () => void;
  onAccept: (lead: Lead) => Promise<void>;
  onCheckMeeting: (leadId: string) => Promise<void>;
  onCompleteSite: (leadId: string) => Promise<void>;
  onMockupSave: (leadId: string, url: string) => Promise<boolean>;
  onLaunchSave: (leadId: string, url: string) => Promise<boolean>;
  onUndo: (leadId: string, targetIndex: number) => Promise<void>;
  onSuspend: (leadId: string, suspended: boolean) => Promise<void>;
  onClose: () => void;
  error: string | null;
  actionError: string | null;
  accepting: string | null;
}

export default function AgencySection({
  filtered, filter, setFilter, search, setSearch, stats, selected, selectedId, setSelectedId,
  onMobileLeadSelect, onAccept, onCheckMeeting, onCompleteSite, onMockupSave, onLaunchSave, onUndo, onSuspend,
  onClose, error, actionError, accepting,
}: AgencySectionProps) {
  const detailProps = {
    selected: selected!,
    onAccept, onCheckMeeting, onCompleteSite, onMockupSave, onLaunchSave, onUndo, onSuspend,
    actionError, accepting,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-8 py-4 md:py-6 min-h-0 overflow-y-auto lg:overflow-visible">
        {/* Left column: stats + leads */}
        <div className="flex flex-col gap-6 min-w-0 lg:min-h-0 lg:flex-[1.4]">
          <div className="mb-1">
            <h2 className="font-display font-bold text-2xl">Admin</h2>
            <p className="text-[13px] text-ink-muted mt-1">Mockup Requests / Pipeline</p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
            {stats.map((s) => (
              <div
                key={s.label}
                style={{ border: '1px solid color-mix(in srgb, var(--color-ink-base) 5%, transparent)' }}
                className="bg-bg-surface p-4 rounded-sm flex flex-col gap-1"
              >
                <p className="text-ink-muted text-[10px] uppercase tracking-[0.14em] font-bold m-0">{s.label}</p>
                <p className="font-display text-[32px] font-bold m-0" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Leads column */}
          <div className="flex flex-col lg:flex-1 lg:min-h-0">
            <div className="flex items-center justify-between mb-3 gap-4 flex-wrap flex-shrink-0">
              <div
                style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 10%, transparent)' }}
                className="flex p-1 rounded-sm"
              >
                {(['pending', 'accepted', 'revision', 'launched'] as Filter[]).map((f) => {
                  const active = filter === f;
                  return (
                    <CustomButton
                      key={f}
                      onClick={() => setFilter(active ? null : f)}
                      variant="ghost"
                      size="none"
                      style={{
                        background: active ? 'var(--color-brand-primary)' : 'transparent',
                        color: active ? 'var(--color-bg-base)' : 'var(--color-ink-muted)',
                      }}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] border-none rounded-[3px] transition-all"
                    >
                      {f}
                    </CustomButton>
                  );
                })}
              </div>
              <p className="text-ink-muted text-[11px] uppercase tracking-[0.1em] m-0">{filtered.length} shown</p>
            </div>

            {/* Search — matches customer name, business/project name, or email; forgives one typo */}
            <div
              style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 10%, transparent)' }}
              className="flex items-center gap-2.5 px-3.5 rounded-sm mb-4 flex-shrink-0"
            >
              <Search className="w-4 h-4 flex-shrink-0 text-ink-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, project name or email..."
                className="flex-1 min-w-0 py-2.5 bg-transparent border-none text-[13px] text-white focus:outline-none placeholder:text-ink-muted"
              />
              {search && (
                <CustomButton
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  variant="icon"
                  size="none"
                  className="border-none p-1 flex items-center justify-center flex-shrink-0 text-ink-muted hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </CustomButton>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pr-1 lg:flex-1 lg:overflow-y-auto">
              {error ? (
                <EmptyState text={error} />
              ) : filtered.length === 0 ? (
                <EmptyState text={search ? `No leads match "${search}".` : 'No matching communications detected in the stream.'} />
              ) : (
                filtered.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isSelected={lead.id === selectedId}
                    onClick={() => {
                      const newId = lead.id === selectedId ? null : lead.id;
                      setSelectedId(newId);
                      if (newId) onMobileLeadSelect();
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Desktop drawer — hidden on mobile (lead detail is in the SettingsPanel hierarchy) */}
        <div className="hidden lg:flex flex-col lg:flex-1 lg:min-w-[340px] lg:max-w-[720px] lg:min-h-0">
          <>
            {selected ? (
              <div
                key={selected.id}
                style={{ border: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
                className="bg-bg-surface rounded-sm p-7 flex flex-col gap-5 lg:h-full lg:overflow-y-auto"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold italic text-[22px] m-0 mb-1">{selected.name}</h3>
                    <p className="text-brand-primary text-[13px] font-medium m-0">{selected.business}</p>
                  </div>
                  <CustomButton
                    onClick={() => setSelectedId(null)}
                    variant="icon"
                    size="sm"
                    style={{ border: '1px solid color-mix(in srgb, var(--color-ink-base) 10%, transparent)' }}
                    className="text-base leading-none"
                  >
                    ✕
                  </CustomButton>
                </div>
                <LeadDetailPanel {...detailProps} />
              </div>
            ) : (
              <div
                key="empty"
                style={{ border: '1px dashed color-mix(in srgb, var(--color-ink-base) 10%, transparent)' }}
                className="flex h-full rounded-sm items-center justify-center text-center p-10 text-ink-muted italic text-[13px]"
              >
                Select a lead to view details and manage milestones.
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface LeadDetailPanelProps {
  selected: Lead;
  onAccept: (lead: Lead) => Promise<void>;
  onCheckMeeting: (leadId: string) => Promise<void>;
  onCompleteSite: (leadId: string) => Promise<void>;
  onMockupSave: (leadId: string, url: string) => Promise<boolean>;
  onLaunchSave: (leadId: string, url: string) => Promise<boolean>;
  onUndo: (leadId: string, targetIndex: number) => Promise<void>;
  onSuspend: (leadId: string, suspended: boolean) => Promise<void>;
  actionError: string | null;
  accepting: string | null;
}

export function LeadDetailPanel({
  selected, onAccept, onCheckMeeting, onCompleteSite, onMockupSave, onLaunchSave, onUndo, onSuspend,
  actionError, accepting,
}: LeadDetailPanelProps) {
  const [urlModal, setUrlModal] = useState<'mockup' | 'launch' | null>(null);

  const handleRowClick = (k: number) => {
    switch (k) {
      case MILESTONE.meeting: onCheckMeeting(selected.id); break;
      case MILESTONE.mockup:  setUrlModal('mockup'); break;
      case MILESTONE.website: onCompleteSite(selected.id); break;
      case MILESTONE.live:    setUrlModal('launch'); break;
      // approved / payment rows are never clickable
    }
  };

  // Undo is offered on the most recent milestone only when it was a plain
  // manual check — client-driven ones (approval, payment) can't be unwound.
  const undoTarget = (k: number): number | null => {
    if (k !== selected.milestone_index || selected.is_paid) return null;
    if (k === MILESTONE.meeting && !selected.mockup_url) return 0;
    if (k === MILESTONE.website) return MILESTONE.approved;
    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] m-0">{selected.email}</p>
        <p className="text-ink-muted text-[10px] uppercase tracking-[0.1em] m-0">
          {formatDate(selected.created_at)}
        </p>
      </div>

      <SubmittedBriefButton lead={selected} />

      {selected.status === 'pending' && (
        <CustomButton
          onClick={() => onAccept(selected)}
          disabled={accepting === selected.id}
          size="none"
          className="w-full py-3.5 border-none rounded-sm font-black text-[11px] uppercase tracking-[0.12em]"
        >
          {accepting === selected.id ? 'Accepting...' : 'Accept & Start Milestones'}
        </CustomButton>
      )}

      {actionError && !urlModal && (
        <p style={{ color: '#FF6B6B' }} className="text-[11px] font-bold uppercase tracking-[0.08em] text-center m-0">
          {actionError}
        </p>
      )}

      {selected.status === 'suspended' && (
        <div className="p-4 rounded-sm" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)' }}>
          <p className="m-0 text-[11px] font-black uppercase tracking-[0.1em]" style={{ color: '#FF6B6B' }}>
            Project Suspended
          </p>
          <p className="mt-1 mb-0 text-[12px] text-ink-muted font-light">
            Reactivate to resume work.
          </p>
        </div>
      )}

      {(selected.status === 'accepted' || selected.status === 'revision') && (
        <div>
          <p className="text-ink-muted text-[10px] uppercase tracking-[0.14em] font-bold m-0 mb-3.5">
            Project Milestones
          </p>
          <div className="flex flex-col gap-0.5">
            {MILESTONES.map((label, i) => {
              const k = i + 1;
              const { done, clickable, lockReason, badge } = rowState(k, selected);
              const undoTo = selected.status !== 'suspended' && done ? undoTarget(k) : null;
              return (
                <div key={label} className="flex items-center gap-1">
                  <CustomButton
                    onClick={() => handleRowClick(k)}
                    disabled={!clickable}
                    title={lockReason}
                    variant="ghost"
                    size="none"
                    className="flex flex-1 items-center gap-3.5 px-2 py-2.5 border-none text-left rounded-sm hover:bg-white/[0.03] transition-colors"
                    style={{ cursor: clickable ? 'pointer' : 'default', opacity: !done && !clickable && !badge ? 0.45 : 1 }}
                  >
                    <div
                      style={{
                        background: done ? 'var(--color-brand-primary)' : 'transparent',
                        color: done ? 'var(--color-bg-base)' : 'var(--color-ink-muted)',
                        border: `1px solid ${done ? 'var(--color-brand-primary)' : 'color-mix(in srgb, var(--color-ink-base) 20%, transparent)'}`,
                      }}
                      className="w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black"
                    >
                      {done ? '✓' : k}
                    </div>
                    <span
                      style={{ color: done ? 'var(--color-ink-base)' : 'var(--color-ink-muted)', fontWeight: clickable ? 700 : 500 }}
                      className="text-[13px]"
                    >
                      {label}
                      {badge && (
                        <span className="ml-2 text-[9px] uppercase tracking-widest" style={{ color: badge.color }}>
                          {badge.label}
                        </span>
                      )}
                    </span>
                  </CustomButton>
                  {undoTo !== null && (
                    <CustomButton
                      onClick={() => onUndo(selected.id, undoTo)}
                      title="Undo this milestone"
                      variant="icon"
                      size="none"
                      className="p-1.5 rounded-sm border-none text-ink-muted hover:text-white transition-colors flex-shrink-0"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </CustomButton>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(selected.status === 'accepted' || selected.status === 'revision' || selected.status === 'suspended') && (
        <SuspendButton lead={selected} onSuspend={onSuspend} />
      )}

      {(selected.status === 'launched' || selected.status === 'completed') && (
        <LaunchedDetails lead={selected} />
      )}

      {urlModal === 'mockup' && (
        <UrlModal
          title="Enter Mockup URL"
          note={selected.revision_feedback ? `Client requested changes: ${selected.revision_feedback}` : undefined}
          placeholder="https://figma.com/..."
          cta="Send to Client"
          accent="var(--color-brand-primary)"
          error={actionError}
          onSubmit={(url) => onMockupSave(selected.id, url)}
          onClose={() => setUrlModal(null)}
        />
      )}
      {urlModal === 'launch' && (
        <UrlModal
          title="Enter Live Site URL"
          placeholder="https://clientsite.com"
          cta="Launch & Notify Client"
          accent="#B98CFF"
          error={actionError}
          onSubmit={(url) => onLaunchSave(selected.id, url)}
          onClose={() => setUrlModal(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

// Pauses (or resumes) an in-flight project. Suspending asks for confirmation
// via an in-app popup (not the browser's native confirm()) since there's no
// separate undo — reactivating restores whatever status the project had
// beforehand.
function SuspendButton({ lead, onSuspend }: { lead: Lead; onSuspend: (leadId: string, suspended: boolean) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const suspended = lead.status === 'suspended';

  const doToggle = async () => {
    setConfirming(false);
    setLoading(true);
    try {
      await onSuspend(lead.id, !suspended);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (suspended) {
      doToggle();
    } else {
      setConfirming(true);
    }
  };

  return (
    <>
      <CustomButton
        onClick={handleClick}
        disabled={loading}
        variant="outline"
        size="none"
        className="w-full py-3.5 rounded-sm font-black text-[11px] uppercase tracking-[0.12em]"
        style={
          suspended
            ? { background: 'transparent', border: '1px solid color-mix(in srgb, var(--color-brand-primary) 30%, transparent)', color: 'var(--color-brand-primary)' }
            : { background: 'transparent', border: '1px solid rgba(255,107,107,0.4)', color: '#FF6B6B' }
        }
      >
        {loading ? (suspended ? 'Reactivating…' : 'Suspending…') : suspended ? 'Reactivate Project' : 'Suspend Project'}
      </CustomButton>

      {confirming && (
        <ConfirmModal
          title="Suspend Project"
          message={`Suspend the project for ${lead.business}? Work will pause until you reactivate it.`}
          confirmLabel="Suspend Project"
          accent="#FF6B6B"
          onConfirm={doToggle}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

// Generic in-app confirm popup — replaces the browser's native window.confirm
// so destructive admin actions get a styled, dismissible dialog instead.
function ConfirmModal({ title, message, confirmLabel, accent, onConfirm, onCancel }: {
  title: string;
  message: string;
  confirmLabel: string;
  accent: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6">
      <div onClick={onCancel} className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />
      <div
        className="relative w-full flex flex-col gap-4 text-white p-6"
        style={{ maxWidth: 420, background: 'var(--color-bg-surface)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)', borderRadius: 6 }}
      >
        <p className="m-0 font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.14em', color: accent }}>
          {title}
        </p>
        <p className="m-0 text-[13px] font-light text-ink-muted">{message}</p>
        <div className="flex gap-2">
          <CustomButton
            onClick={onConfirm}
            variant="ghost"
            size="none"
            className="flex-1 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-[0.1em] border-none"
            style={{ background: accent, color: 'var(--color-bg-base)' }}
          >
            {confirmLabel}
          </CustomButton>
          <CustomButton
            onClick={onCancel}
            variant="ghost"
            size="none"
            className="px-4 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-[0.1em]"
            style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)', color: 'var(--color-ink-muted)' }}
          >
            Cancel
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

// Popup for the two milestones that need a URL before they can act: sending
// the mockup for review, and putting the final website live. Closes only on
// success — a failed save keeps it open with the error shown inline.
function UrlModal({ title, note, placeholder, cta, accent, error, onSubmit, onClose }: {
  title: string;
  note?: string;
  placeholder: string;
  cta: string;
  accent: string;
  error: string | null;
  onSubmit: (url: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!url.trim() || saving) return;
    setSaving(true);
    const ok = await onSubmit(url.trim());
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6">
      <div onClick={onClose} className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />
      <div
        className="relative w-full flex flex-col gap-4 text-white p-6"
        style={{ maxWidth: 420, background: 'var(--color-bg-surface)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)', borderRadius: 6 }}
      >
        <p className="m-0 font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.14em', color: accent }}>
          {title}
        </p>
        {note && (
          <p className="m-0 text-[12px] font-light whitespace-pre-wrap" style={{ color: '#F5C542' }}>{note}</p>
        )}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={placeholder}
          className="w-full rounded-sm px-3 py-2.5 text-[13px] text-white focus:outline-none"
          style={{ background: 'color-mix(in srgb, var(--color-ink-base) 7%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 12%, transparent)' }}
          autoFocus
        />
        {error && (
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: '#FF6B6B' }}>
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <CustomButton
            onClick={submit}
            disabled={!url.trim() || saving}
            variant="ghost"
            size="none"
            className="flex-1 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-[0.1em] border-none disabled:opacity-50"
            style={{ background: accent, color: 'var(--color-bg-base)' }}
          >
            {saving ? 'Sending…' : cta}
          </CustomButton>
          <CustomButton
            onClick={onClose}
            variant="ghost"
            size="none"
            className="px-4 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-[0.1em]"
            style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)', color: 'var(--color-ink-muted)' }}
          >
            Cancel
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function LeadLink({ url, label }: { url: string; label?: string }) {
  const href = safeUrl(url);
  if (!href) return <span className="break-all">{url}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline break-all" style={{ color: 'var(--color-brand-primary)' }}>
      {label ?? url}
    </a>
  );
}

function SubmittedBriefButton({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <CustomButton
        onClick={() => setOpen(true)}
        variant="ghost"
        size="none"
        className="w-full flex justify-between items-center px-4 py-3.5 rounded-sm"
        style={{ background: 'color-mix(in srgb, var(--color-ink-base) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)' }}
      >
        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted">View Submitted Brief</span>
        <span className="text-[10px] text-ink-muted">▸</span>
      </CustomButton>
      <>
        {open && <BriefModal lead={lead} onClose={() => setOpen(false)} />}
      </>
    </>
  );
}

function BriefModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const rows: { label: string; value: React.ReactNode }[] = [];
  rows.push({ label: 'Business Name', value: lead.name });
  rows.push({ label: 'Business Type', value: lead.business });
  rows.push({ label: 'Email', value: <a href={`mailto:${lead.email}`} className="hover:underline" style={{ color: 'var(--color-brand-primary)' }}>{lead.email}</a> });
  if (lead.phone_number) rows.push({ label: 'Phone', value: <a href={`tel:${lead.phone_number}`} className="hover:underline" style={{ color: 'var(--color-brand-primary)' }}>{lead.phone_number}</a> });
  if (lead.contact_method) rows.push({ label: 'Preferred Contact', value: lead.contact_method });
  if (lead.package) {
    const pkg = PACKAGES.find((p) => p.id === lead.package);
    rows.push({
      label: 'Package',
      value: (
        <span className="uppercase" style={{ letterSpacing: '0.04em' }}>
          {pkg?.name ?? lead.package}
          {pkg && <span className="ml-2 font-bold" style={{ color: 'var(--color-brand-primary)' }}>{pkg.price}</span>}
        </span>
      ),
    });
  }
  rows.push({ label: 'Wants a Call', value: lead.wants_call ? 'Yes' : 'No' });
  if (lead.timeline) rows.push({ label: 'Timeline', value: lead.timeline });
  if (lead.location) rows.push({ label: 'Location', value: lead.location });
  if (lead.site_goal) rows.push({ label: 'Site Goal', value: lead.site_goal });
  if (lead.existing_website !== undefined) {
    rows.push({
      label: 'Existing Site',
      value: lead.existing_website
        ? (lead.existing_website_url ? <LeadLink url={lead.existing_website_url} /> : 'Yes')
        : 'No',
    });
  }
  if (lead.style_direction) rows.push({ label: 'Style', value: lead.style_direction });
  if (lead.message) rows.push({ label: 'About the Business', value: <span className="whitespace-pre-wrap">{lead.message}</span> });

  const colors = lead.has_brand_colors
    ? [lead.primary_color, lead.secondary_color].filter((c): c is string => !!c)
    : [];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      />
      <div
        className="relative w-full flex flex-col text-white"
        style={{ maxWidth: 480, maxHeight: '84vh', background: 'var(--color-bg-surface)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)', borderRadius: 6, overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 flex-shrink-0"
          style={{ padding: '22px 26px', borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)', background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-primary) 6%, transparent), rgba(112,0,255,0.05))' }}
        >
          <div>
            <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--color-brand-primary)', marginBottom: 4 }}>
              Submitted Brief
            </p>
            <h3 className="m-0 font-display font-bold italic" style={{ fontSize: 20 }}>
              {lead.name}
            </h3>
          </div>
          <CustomButton
            onClick={onClose}
            variant="icon"
            size="sm"
            className="text-sm leading-none flex-shrink-0"
            style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
          >
            ✕
          </CustomButton>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex flex-col" style={{ padding: '22px 26px 26px', gap: 20 }}>
          {/* Key fact rows */}
          <div className="flex flex-col">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex" style={{ gap: 16, padding: '10px 0', borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 5%, transparent)' }}>
                <span className="font-bold uppercase flex-shrink-0" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--color-ink-muted)', width: 130, paddingTop: 1 }}>
                  {label}
                </span>
                <span className="min-w-0" style={{ fontSize: 13, color: 'var(--color-ink-base)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Pages Needed */}
          {!!lead.pages_needed?.length && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--color-ink-muted)', marginBottom: 10 }}>
                Pages Needed
              </p>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {lead.pages_needed.map((p) => (
                  <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: 'color-mix(in srgb, var(--color-brand-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-brand-primary) 25%, transparent)', color: 'var(--color-brand-primary)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Brand Colors */}
          {colors.length > 0 && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--color-ink-muted)', marginBottom: 10 }}>
                Brand Colors
              </p>
              <div className="flex" style={{ gap: 10 }}>
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center" style={{ gap: 8, padding: '6px 12px 6px 6px', background: 'color-mix(in srgb, var(--color-ink-base) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)', borderRadius: 999 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '1px solid color-mix(in srgb, var(--color-ink-base) 25%, transparent)', flexShrink: 0, display: 'inline-block' }} />
                    <span className="font-display" style={{ fontSize: 11, color: 'var(--color-ink-base)' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logo */}
          {lead.has_logo && lead.logo_url && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--color-ink-muted)', marginBottom: 10 }}>
                Logo
              </p>
              <LeadLink url={lead.logo_url} label="View logo" />
            </div>
          )}

          {/* Inspiration */}
          {!!lead.inspiration_urls?.length && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--color-ink-muted)', marginBottom: 10 }}>
                Inspiration
              </p>
              <div className="flex flex-col" style={{ gap: 6 }}>
                {lead.inspiration_urls.map((u, i) => (
                  <LeadLink key={i} url={u} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LaunchedDetails({ lead }: { lead: Lead }) {
  const paidDate = lead.paid_at ? new Date(lead.paid_at) : null;
  const nextBilling = paidDate && lead.wants_maintenance
    ? new Date(paidDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const domainRenewal = lead.domain_renewal_date ? new Date(lead.domain_renewal_date) : null;

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col gap-2">
      <div
        style={{ background: 'color-mix(in srgb, var(--color-brand-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-brand-primary) 25%, transparent)', color: 'var(--color-brand-primary)' }}
        className="p-3.5 rounded-sm text-[12px] font-bold uppercase tracking-[0.08em] text-center"
      >
        Project Launched 🎉
      </div>

      <div
        style={{ background: 'var(--color-bg-base)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
        className="p-4 rounded-sm flex flex-col gap-2.5"
      >
        {lead.site_url && (
          <div>
            <p className="m-0 text-[9px] uppercase tracking-[0.1em] text-ink-muted font-bold mb-1">Live Site</p>
            <LeadLink url={lead.site_url} />
          </div>
        )}
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="m-0 text-[9px] uppercase tracking-[0.1em] text-ink-muted font-bold mb-0.5">Payment</p>
            <p className="m-0 text-[13px] text-white">
              {lead.is_paid ? (lead.payment_amount ? `$${lead.payment_amount.toFixed(2)}` : 'Confirmed') : 'Pending'}
            </p>
          </div>
          {paidDate && (
            <div>
              <p className="m-0 text-[9px] uppercase tracking-[0.1em] text-ink-muted font-bold mb-0.5">Paid On</p>
              <p className="m-0 text-[13px] text-white">{fmt(paidDate)}</p>
            </div>
          )}
          <div>
            <p className="m-0 text-[9px] uppercase tracking-[0.1em] text-ink-muted font-bold mb-0.5">Maintenance</p>
            <p className="m-0 text-[13px]" style={{ color: lead.wants_maintenance ? 'var(--color-brand-primary)' : 'var(--color-ink-muted)' }}>
              {lead.wants_maintenance ? 'Active' : 'None'}
            </p>
          </div>
          {nextBilling && (
            <div>
              <p className="m-0 text-[9px] uppercase tracking-[0.1em] text-ink-muted font-bold mb-0.5">Next Billing</p>
              <p className="m-0 text-[13px] text-white">{fmt(nextBilling)}</p>
            </div>
          )}
          {domainRenewal && (
            <div>
              <p className="m-0 text-[9px] uppercase tracking-[0.1em] text-ink-muted font-bold mb-0.5">Domain Renewal</p>
              <p className="m-0 text-[13px] text-white">{fmt(domainRenewal)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadRow({ lead, isSelected, onClick }: { key?: string; lead: Lead; isSelected: boolean; onClick: () => void }) {
  const ss = STATUS_STYLE[lead.status] ?? STATUS_STYLE['accepted'];
  const showBar = lead.status === 'accepted' || lead.status === 'revision';
  const pct = showBar ? Math.round((lead.milestone_index / MILESTONES.length) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? 'color-mix(in srgb, var(--color-brand-primary) 6%, transparent)' : 'color-mix(in srgb, var(--color-ink-base) 2%, transparent)',
        border: `1px solid ${isSelected ? 'color-mix(in srgb, var(--color-brand-primary) 40%, transparent)' : 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)'}`,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      className="p-[18px_20px] rounded-sm cursor-pointer hover:border-brand-primary/30"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h4 className="m-0 text-base font-bold text-white">{lead.name}</h4>
            <span
              style={{ background: ss.bg, color: ss.fg }}
              className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
            >
              {ss.label}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="m-0 text-brand-primary text-[13px] font-medium">{lead.business}</p>
            {lead.package && (
              <span className="text-[8px] uppercase tracking-[0.1em] font-black bg-white/10 px-1.5 py-0.5 rounded-[2px] italic">
                {lead.package}
              </span>
            )}
          </div>
        </div>
        <p className="m-0 text-ink-muted text-[10px] uppercase tracking-[0.1em] whitespace-nowrap flex-shrink-0">
          {formatDate(lead.created_at)}
        </p>
      </div>

      {showBar && (
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="m-0 text-[9px] uppercase tracking-[0.1em] text-ink-muted font-bold">
              {projectStatusText(lead)}
            </p>
            <p className="m-0 text-[9px] text-ink-muted">
              {lead.milestone_index}/{MILESTONES.length} complete
            </p>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--color-ink-base) 8%, transparent)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-brand-primary), #7000FF)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{ border: '1px dashed color-mix(in srgb, var(--color-ink-base) 10%, transparent)' }}
      className="py-[60px] px-5 text-center rounded-sm text-ink-muted italic"
    >
      {text}
    </div>
  );
}
