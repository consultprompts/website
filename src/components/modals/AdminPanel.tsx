import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getLeads, updateLeadMilestone, setMockupURL as apiSetMockupURL, completeSite, launchSite, type Lead } from '../../lib/api';
import { safeUrl } from '../../lib/urls';
import { milestoneStages, milestoneOffset, CORE_IDX } from '../../lib/milestones';
import logo from '../../logo.png';

type Section = 'agency' | 'products' | 'academy';
type Filter = 'all' | 'pending' | 'accepted' | 'completed' | 'launched';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fullScreen?: boolean;
}

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
  accepted:  { bg: 'rgba(0,240,255,0.18)',   fg: '#00F0FF', label: 'in progress' },
  completed: { bg: 'rgba(112,0,255,0.22)',   fg: '#B98CFF', label: 'completed' },
  launched:  { bg: 'rgba(0,240,255,0.18)',   fg: '#00F0FF', label: 'launched' },
};

// Derives how one milestone row renders (and whether it accepts clicks) for a
// lead. Auto-set stages are locked with a tooltip saying what checks them;
// "sent" marks a stage whose admin action fired but is awaiting the client
// (mockup under review, payment email out), so it shows a badge instead of a
// premature checkmark.
function stageRowState(idx: number, lead: Lead) {
  const offset = milestoneOffset(lead.wants_call);
  const current = idx === lead.milestone_index && lead.status !== 'launched';
  const launchLocked = idx === offset + CORE_IDX.launched && !lead.is_paid;
  const lockReason =
    launchLocked ? 'Client must complete payment first'
    : idx === offset + CORE_IDX.designingMockup ? 'Automatically checked when you send the mockup below'
    : idx === offset + CORE_IDX.revisionsSignedOff ? 'Automatically checked when the client accepts their mockup'
    : idx === offset + CORE_IDX.payment ? 'Automatically checked when the client pays'
    : idx === offset + CORE_IDX.waitingForLaunch ? 'Automatically checked once you launch the site below'
    : undefined;
  const sentWebsiteReady =
    idx === offset + CORE_IDX.siteCompleted &&
    lead.milestone_index === offset + CORE_IDX.payment &&
    !lead.is_paid;
  const sent = sentWebsiteReady || (idx === offset + CORE_IDX.mockupDelivered && current);
  const done = idx < lead.milestone_index && !sentWebsiteReady;
  return { current, launchLocked, locked: lockReason !== undefined, lockReason, sent, done };
}

export default function AdminPanel({ isOpen, onClose, fullScreen = false }: AdminPanelProps) {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('agency');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [mockupInputId, setMockupInputId] = useState<string | null>(null);
  const [mockupURL, setMockupURL] = useState('');
  const [launchInputId, setLaunchInputId] = useState<string | null>(null);
  const [launchURL, setLaunchURL] = useState('');

  const refreshLeads = useCallback(async () => {
    try {
      const data = await getLeads(1, 100);
      setLeads(data.leads);
      setError(null);
    } catch {
      setError('Could not load leads — the agency service may not be running yet.');
    }
  }, []);

  useEffect(() => {
    if (isAdmin && isOpen) refreshLeads();
  }, [isAdmin, isOpen, refreshLeads]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setSection('agency');
      setFilter('all');
      setActionError(null);
      setMockupInputId(null);
      setMockupURL('');
      setLaunchInputId(null);
      setLaunchURL('');
    }
  }, [isOpen]);

  const handleAccept = useCallback(async (lead: Lead) => {
    const leadId = lead.id;
    // Always start at the first stage, unchecked — "Discovery Call Completed"
    // when the lead opted into a call, otherwise "Designing Your Website".
    const startIndex = 0;
    setAccepting(leadId);
    setActionError(null);
    try {
      await updateLeadMilestone(leadId, startIndex);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: 'accepted', milestone_index: startIndex } : l)),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept lead');
    } finally {
      setAccepting(null);
    }
  }, []);

  const handleMilestone = useCallback(async (leadId: string, idx: number, lead: Lead) => {
    const offset = milestoneOffset(lead.wants_call);
    // "Design Ready for Your Review" — show URL input before advancing.
    if (idx === offset + CORE_IDX.mockupDelivered) {
      setMockupInputId(leadId);
      setMockupURL('');
      return;
    }
    // "Website Ready" — dedicated complete endpoint + email. Sends the payment
    // email and makes "Payment" current. "Website Ready" itself is rendered as
    // "sent" (not done) until the client actually pays — see the sentWebsiteReady
    // check below.
    if (idx === offset + CORE_IDX.siteCompleted) {
      setActionError(null);
      try {
        await completeSite(leadId);
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, milestone_index: idx + 1, status: 'accepted' } : l)),
        );
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to mark site complete');
      }
      return;
    }
    // "Launched" — requires payment; show site URL input.
    if (idx === offset + CORE_IDX.launched) {
      if (!lead.is_paid) {
        setActionError('Client must complete payment before the site can be launched.');
        return;
      }
      setLaunchInputId(leadId);
      setLaunchURL('');
      return;
    }
    // Auto-set stages ("Designing Your Website", "Design Approved", "Payment",
    // "Waiting for Launch") can't be checked off manually — their rows are
    // also disabled, so this is just a safety net.
    if (stageRowState(idx, lead).locked) {
      return;
    }
    // Clicking a stage marks *that* stage done and advances current to the next one.
    setActionError(null);
    try {
      await updateLeadMilestone(leadId, idx + 1);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, milestone_index: idx + 1, status: 'accepted' } : l,
        ),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update milestone');
    }
  }, []);

  const handleMockupSave = useCallback(async (leadId: string, url: string, lead: Lead) => {
    if (!url.trim()) return;
    setActionError(null);
    // Marks "Designing Your Website" done and advances current to "Design Ready
    // for Your Review", where the client approves it or requests changes.
    const targetIndex = milestoneOffset(lead.wants_call) + CORE_IDX.mockupDelivered;
    try {
      await apiSetMockupURL(leadId, url.trim());
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, milestone_index: targetIndex, mockup_url: url.trim(), status: 'accepted' } : l,
        ),
      );
      setMockupInputId(null);
      setMockupURL('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save mockup URL');
    }
  }, []);

  const handleLaunchSave = useCallback(async (leadId: string, url: string, lead: Lead) => {
    if (!url.trim()) return;
    setActionError(null);
    const targetIndex = milestoneOffset(lead.wants_call) + CORE_IDX.launched;
    try {
      await launchSite(leadId, url.trim());
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, milestone_index: targetIndex, status: 'launched', site_url: url.trim() } : l,
        ),
      );
      setLaunchInputId(null);
      setLaunchURL('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to launch site');
    }
  }, []);

  const filtered = useMemo(
    () => leads.filter((l) => {
      if (filter === 'all') return true;
      if (filter === 'launched') return l.status === 'launched' || l.status === 'completed';
      return l.status === filter;
    }),
    [leads, filter],
  );
  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId],
  );

  const stats = [
    { label: 'Total Leads', value: leads.length, color: '#FFFFFF' },
    { label: 'Pending', value: leads.filter((l) => l.status === 'pending').length, color: '#F5C542' },
    { label: 'In Progress', value: leads.filter((l) => l.status === 'accepted').length, color: '#00F0FF' },
    { label: 'Launched', value: leads.filter((l) => l.status === 'launched' || l.status === 'completed').length, color: '#B98CFF' },
  ];

  const NAV: { key: Section; label: string }[] = [
    { key: 'agency', label: 'Agency' },
    { key: 'products', label: 'Products' },
    { key: 'academy', label: 'Academy' },
  ];

  return (
    <AnimatePresence>
      {isOpen && isAdmin && (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center ${fullScreen ? 'p-0' : 'p-6'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-base"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={fullScreen ? { width: '100%', height: '100vh' } : { maxWidth: 1180, height: '90vh' }}
            className="relative w-full bg-bg-surface border border-white/5 overflow-hidden flex text-white"
          >
            {/* Sidebar */}
            <div
              style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.06)' }}
              className="flex-shrink-0 bg-bg-base flex flex-col py-6"
            >
              <div className="flex items-center gap-2.5 px-5 pb-6">
                <img src={logo} alt="ConsultPrompts" className="w-7 h-7 object-contain" />
                <span className="font-display font-bold italic text-[15px]">Settings</span>
              </div>
              {NAV.map((n) => {
                const active = section === n.key;
                return (
                  <button
                    key={n.key}
                    onClick={() => setSection(n.key)}
                    style={{
                      background: active ? 'rgba(0,240,255,0.08)' : 'transparent',
                      borderLeft: `2px solid ${active ? '#00F0FF' : 'transparent'}`,
                    }}
                    className="flex items-center gap-3 px-5 py-3 w-full text-left border-none cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: active ? '#00F0FF' : 'rgba(255,255,255,0.2)' }}
                    />
                    <span
                      style={{ color: active ? '#FFFFFF' : '#A1A1A1' }}
                      className="text-[11px] font-bold uppercase tracking-[0.1em]"
                    >
                      {n.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {section === 'agency' && (
                <AgencySection
                  leads={leads}
                  filtered={filtered}
                  filter={filter}
                  setFilter={setFilter}
                  stats={stats}
                  selected={selected}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  onAccept={handleAccept}
                  onMilestone={handleMilestone}
                  onMockupSave={handleMockupSave}
                  mockupInputId={mockupInputId}
                  mockupURL={mockupURL}
                  setMockupURL={setMockupURL}
                  onCancelMockup={() => { setMockupInputId(null); setMockupURL(''); }}
                  onLaunchSave={handleLaunchSave}
                  launchInputId={launchInputId}
                  launchURL={launchURL}
                  setLaunchURL={setLaunchURL}
                  onCancelLaunch={() => { setLaunchInputId(null); setLaunchURL(''); }}
                  onClose={onClose}
                  error={error}
                  actionError={actionError}
                  accepting={accepting}
                />
              )}
              {section === 'products' && <StubSection title="Products" subtitle="Ebook Waitlist / Digital Products" onClose={onClose} placeholder="Products admin isn't wired up yet — bring the requirements and we'll build it next." />}
              {section === 'academy' && <StubSection title="Academy" subtitle="Students / Courses" onClose={onClose} placeholder="Academy admin isn't wired up yet — bring the requirements and we'll build it next." />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------

interface AgencySectionProps {
  leads: Lead[];
  filtered: Lead[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  stats: { label: string; value: number; color: string }[];
  selected: Lead | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onAccept: (lead: Lead) => Promise<void>;
  onMilestone: (id: string, idx: number, lead: Lead) => Promise<void>;
  onMockupSave: (leadId: string, url: string, lead: Lead) => Promise<void>;
  mockupInputId: string | null;
  mockupURL: string;
  setMockupURL: (v: string) => void;
  onCancelMockup: () => void;
  onLaunchSave: (leadId: string, url: string, lead: Lead) => Promise<void>;
  launchInputId: string | null;
  launchURL: string;
  setLaunchURL: (v: string) => void;
  onCancelLaunch: () => void;
  onClose: () => void;
  error: string | null;
  actionError: string | null;
  accepting: string | null;
}

function AgencySection({
  filtered, filter, setFilter, stats, selected, selectedId, setSelectedId,
  onAccept, onMilestone, onMockupSave, mockupInputId, mockupURL, setMockupURL, onCancelMockup,
  onLaunchSave, launchInputId, launchURL, setLaunchURL, onCancelLaunch,
  onClose, error, actionError, accepting,
}: AgencySectionProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        className="px-8 py-6 flex items-center justify-between gap-6 flex-shrink-0"
      >
        <div>
          <h1 className="font-display font-bold italic text-[22px] m-0">Admin Command</h1>
          <p className="text-ink-muted text-[11px] uppercase tracking-[0.14em] mt-0.5">Mockup Requests / Pipeline</p>
        </div>
        <button
          onClick={onClose}
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          className="w-8 h-8 rounded-full bg-transparent text-white cursor-pointer text-base leading-none flex items-center justify-center flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex gap-6 px-8 py-6 min-h-0">
        {/* Left column: stats + leads */}
        <div style={{ flex: 1.4 }} className="flex flex-col gap-6 min-w-0 min-h-0">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 flex-shrink-0">
            {stats.map((s) => (
              <div
                key={s.label}
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap flex-shrink-0">
              <div
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                className="flex p-1 rounded-sm"
              >
                {(['all', 'pending', 'accepted', 'launched'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      background: filter === f ? '#00F0FF' : 'transparent',
                      color: filter === f ? '#050505' : '#A1A1A1',
                    }}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] border-none cursor-pointer rounded-[3px] transition-all"
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-ink-muted text-[11px] uppercase tracking-[0.1em] m-0">{filtered.length} shown</p>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
              {error ? (
                <EmptyState text={error} />
              ) : filtered.length === 0 ? (
                <EmptyState text="No matching communications detected in the stream." />
              ) : (
                filtered.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isSelected={lead.id === selectedId}
                    onClick={() => setSelectedId(lead.id === selectedId ? null : lead.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Drawer */}
        <div style={{ flex: 1, minWidth: 340, maxWidth: 720 }} className="flex flex-col">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25 }}
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                className="bg-bg-surface rounded-sm p-7 flex flex-col gap-5 h-full overflow-y-auto"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold italic text-[22px] m-0 mb-1">{selected.name}</h3>
                    <p className="text-brand-primary text-[13px] font-medium m-0">{selected.business}</p>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    className="w-8 h-8 rounded-full bg-transparent text-white cursor-pointer text-base leading-none flex items-center justify-center flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-[13px] m-0">{selected.email}</p>
                  <p className="text-ink-muted text-[10px] uppercase tracking-[0.1em] m-0">
                    {formatDate(selected.created_at)}
                  </p>
                </div>

                <SubmittedBriefButton lead={selected} />

                {selected.status === 'pending' && (
                  <button
                    onClick={() => onAccept(selected)}
                    disabled={accepting === selected.id}
                    className="w-full py-3.5 bg-brand-primary text-bg-base border-none rounded-sm font-black text-[11px] uppercase tracking-[0.12em] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {accepting === selected.id ? 'Accepting...' : 'Accept & Start Milestones'}
                  </button>
                )}

                {actionError && (
                  <p style={{ color: '#FF6B6B' }} className="text-[11px] font-bold uppercase tracking-[0.08em] text-center m-0">
                    {actionError}
                  </p>
                )}

                {selected.status === 'accepted' && (() => {
                  const offset = milestoneOffset(selected.wants_call);
                  const stages = milestoneStages(selected.wants_call);
                  return (
                  <div>
                    <p className="text-ink-muted text-[10px] uppercase tracking-[0.14em] font-bold m-0 mb-3.5">
                      Project Milestones
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {stages.map((label, idx) => {
                        const { current, launchLocked, locked, lockReason, sent, done } = stageRowState(idx, selected);
                        const showingMockupInput = idx === offset + CORE_IDX.mockupDelivered && mockupInputId === selected.id;
                        const showingLaunchInput = idx === offset + CORE_IDX.launched && launchInputId === selected.id;
                        return (
                          <div key={idx}>
                            <button
                              onClick={() => onMilestone(selected.id, idx, selected)}
                              disabled={locked}
                              title={lockReason}
                              className="flex items-center gap-3.5 px-2 py-2.5 bg-transparent border-none text-left w-full rounded-sm hover:bg-white/[0.03] transition-colors"
                              style={{ cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.45 : 1 }}
                            >
                              <div
                                style={{
                                  background: done ? '#00F0FF' : 'transparent',
                                  color: done ? '#050505' : '#A1A1A1',
                                  border: `1px solid ${done ? '#00F0FF' : 'rgba(255,255,255,0.2)'}`,
                                }}
                                className="w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black"
                              >
                                {done ? '✓' : idx + 1}
                              </div>
                              <span
                                style={{
                                  color: done ? '#FFFFFF' : '#A1A1A1',
                                  fontWeight: current ? 700 : 500,
                                }}
                                className="text-[13px]"
                              >
                                {label}
                                {launchLocked && <span className="ml-2 text-[9px] uppercase tracking-widest" style={{ color: '#F5C542' }}>awaiting payment</span>}
                                {sent && <span className="ml-2 text-[9px] uppercase tracking-widest" style={{ color: '#00F0FF' }}>Sent</span>}
                              </span>
                            </button>

                            {/* Mockup URL input — shown when admin clicks "Design Ready for Your Review" */}
                            {showingMockupInput && (
                              <div
                                className="mx-2 mb-2 p-3 rounded-sm flex flex-col gap-2"
                                style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)' }}
                              >
                                <p className="m-0 text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: '#00F0FF' }}>
                                  Paste Mockup Link
                                </p>
                                <input
                                  type="url"
                                  value={mockupURL}
                                  onChange={(e) => setMockupURL(e.target.value)}
                                  placeholder="https://figma.com/..."
                                  className="w-full rounded-sm px-3 py-2 text-[13px] text-white border-none focus:outline-none"
                                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => onMockupSave(selected.id, mockupURL, selected)}
                                    disabled={!mockupURL.trim()}
                                    className="flex-1 py-2 rounded-sm font-black text-[10px] uppercase tracking-[0.1em] border-none cursor-pointer disabled:opacity-50"
                                    style={{ background: '#00F0FF', color: '#050505' }}
                                  >
                                    Save &amp; Notify Client
                                  </button>
                                  <button
                                    onClick={onCancelMockup}
                                    className="px-3 py-2 rounded-sm font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer"
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#A1A1A1' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Launch site URL input — shown when admin clicks "Launched" */}
                            {showingLaunchInput && (
                              <div
                                className="mx-2 mb-2 p-3 rounded-sm flex flex-col gap-2"
                                style={{ background: 'rgba(112,0,255,0.08)', border: '1px solid rgba(112,0,255,0.3)' }}
                              >
                                <p className="m-0 text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: '#B98CFF' }}>
                                  Paste Live Site URL
                                </p>
                                <input
                                  type="url"
                                  value={launchURL}
                                  onChange={(e) => setLaunchURL(e.target.value)}
                                  placeholder="https://clientsite.com"
                                  className="w-full rounded-sm px-3 py-2 text-[13px] text-white border-none focus:outline-none"
                                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => onLaunchSave(selected.id, launchURL, selected)}
                                    disabled={!launchURL.trim()}
                                    className="flex-1 py-2 rounded-sm font-black text-[10px] uppercase tracking-[0.1em] border-none cursor-pointer disabled:opacity-50"
                                    style={{ background: '#B98CFF', color: '#050505' }}
                                  >
                                    Launch &amp; Notify Client
                                  </button>
                                  <button
                                    onClick={onCancelLaunch}
                                    className="px-3 py-2 rounded-sm font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer"
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#A1A1A1' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })()}

                {(selected.status === 'launched' || selected.status === 'completed') && (
                  <LaunchedDetails lead={selected} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
                className="h-full rounded-sm flex items-center justify-center text-center p-10 text-ink-muted italic text-[13px]"
              >
                Select a lead to view details and manage milestones.
              </motion.div>
            )}
          </AnimatePresence>
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
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline break-all" style={{ color: '#00F0FF' }}>
      {label ?? url}
    </a>
  );
}

function SubmittedBriefButton({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex justify-between items-center px-4 py-3 cursor-pointer rounded-sm"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted">View Submitted Brief</span>
        <span className="text-[10px] text-ink-muted">▸</span>
      </button>
      <AnimatePresence>
        {open && <BriefModal lead={lead} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function BriefModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (lead.package) rows.push({ label: 'Package', value: lead.package });
  rows.push({ label: 'Wants a Call', value: lead.wants_call ? 'Yes' : 'No' });
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
  if (lead.phone_number) rows.push({ label: 'Phone', value: <a href={`tel:${lead.phone_number}`} className="hover:underline" style={{ color: '#00F0FF' }}>{lead.phone_number}</a> });
  if (lead.contact_method) rows.push({ label: 'Preferred Contact', value: lead.contact_method });
  if (lead.timeline) rows.push({ label: 'Timeline', value: lead.timeline });

  const colors = lead.has_brand_colors
    ? [lead.primary_color, lead.secondary_color].filter((c): c is string => !!c)
    : [];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="relative w-full flex flex-col text-white"
        style={{ maxWidth: 480, maxHeight: '84vh', background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 flex-shrink-0"
          style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(0,240,255,0.06), rgba(112,0,255,0.05))' }}
        >
          <div>
            <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.16em', color: '#00F0FF', marginBottom: 4 }}>
              Submitted Brief
            </p>
            <h3 className="m-0 font-display font-bold italic" style={{ fontSize: 20 }}>
              {lead.business}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent text-white cursor-pointer text-sm leading-none flex items-center justify-center flex-shrink-0"
            style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex flex-col" style={{ padding: '22px 26px 26px', gap: 20 }}>
          {/* Key fact rows */}
          <div className="flex flex-col">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex" style={{ gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="font-bold uppercase flex-shrink-0" style={{ fontSize: 10, letterSpacing: '0.1em', color: '#A1A1A1', width: 130, paddingTop: 1 }}>
                  {label}
                </span>
                <span className="min-w-0" style={{ fontSize: 13, color: '#FFFFFF' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Pages Needed */}
          {!!lead.pages_needed?.length && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A1A1A1', marginBottom: 10 }}>
                Pages Needed
              </p>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {lead.pages_needed.map((p) => (
                  <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.25)', color: '#00F0FF' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Brand Colors */}
          {colors.length > 0 && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A1A1A1', marginBottom: 10 }}>
                Brand Colors
              </p>
              <div className="flex" style={{ gap: 10 }}>
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center" style={{ gap: 8, padding: '6px 12px 6px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0, display: 'inline-block' }} />
                    <span className="font-display" style={{ fontSize: 11, color: '#FFFFFF' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logo */}
          {lead.has_logo && lead.logo_url && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A1A1A1', marginBottom: 10 }}>
                Logo
              </p>
              <LeadLink url={lead.logo_url} label="View logo" />
            </div>
          )}

          {/* Inspiration */}
          {!!lead.inspiration_urls?.length && (
            <div>
              <p className="m-0 font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A1A1A1', marginBottom: 10 }}>
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
      </motion.div>
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
        style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.25)', color: '#00F0FF' }}
        className="p-3.5 rounded-sm text-[12px] font-bold uppercase tracking-[0.08em] text-center"
      >
        Project Launched 🎉
      </div>

      <div
        style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.06)' }}
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
            <p className="m-0 text-[13px]" style={{ color: lead.wants_maintenance ? '#00F0FF' : '#A1A1A1' }}>
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
  const showBar = lead.status === 'accepted';
  const stages = milestoneStages(lead.wants_call);
  const pct = showBar ? Math.round(((lead.milestone_index + 1) / stages.length) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? 'rgba(0,240,255,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? 'rgba(0,240,255,0.4)' : 'rgba(255,255,255,0.05)'}`,
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
              {stages[lead.milestone_index]}
            </p>
            <p className="m-0 text-[9px] text-ink-muted">
              Stage {lead.milestone_index + 1}/{stages.length}
            </p>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00F0FF, #7000FF)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StubSection({ title, subtitle, onClose, placeholder }: { title: string; subtitle: string; onClose: () => void; placeholder: string }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        className="px-8 py-6 flex items-center justify-between gap-6 flex-shrink-0"
      >
        <div>
          <h1 className="font-display font-bold italic text-[22px] m-0">{title}</h1>
          <p className="text-ink-muted text-[11px] uppercase tracking-[0.14em] mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={onClose}
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          className="w-8 h-8 rounded-full bg-transparent text-white cursor-pointer text-base leading-none flex items-center justify-center"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-10">
        <div
          style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
          className="text-center rounded-sm p-[60px_40px] text-ink-muted italic text-[13px]"
        >
          {placeholder}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
      className="py-[60px] px-5 text-center rounded-sm text-ink-muted italic"
    >
      {text}
    </div>
  );
}
