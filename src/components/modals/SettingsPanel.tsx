import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, FolderOpen, Building2, Package, GraduationCap, ChevronRight, ChevronLeft, Search, X, Undo2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getLeads, updateLeadMilestone, setMockupURL as apiSetMockupURL, completeSite, launchSite, setLeadSuspended, type Lead } from '../../lib/api';
import { safeUrl } from '../../lib/urls';
import { MILESTONES, MILESTONE, projectStatusText } from '../../lib/milestones';
import { PACKAGES } from '../../data/content';
import logo from '../../logo.png';
import AccountSection from './AccountSection';
import MyProjectsSection from './MyProjectsSection';
import SettingsHeader from './SettingsHeader';

export const SETTINGS_SECTIONS = ['account', 'my-projects', 'agency', 'products', 'academy'] as const;
export type Section = (typeof SETTINGS_SECTIONS)[number];
/** Sections only rendered for admins — non-admins hitting these URLs get bounced to my-projects. */
export const ADMIN_SECTIONS: readonly Section[] = ['agency', 'products', 'academy'];
type Filter = 'pending' | 'accepted' | 'revision' | 'launched';
type NavItem = { key: Section; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> };
/** Below `md`, Settings navigates as a menu → sub-page → lead-detail hierarchy. */
type MobileScreen = 'menu' | 'detail' | 'lead-detail';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fullScreen?: boolean;
  /** Active section — owned by the route (/settings/:section). */
  section: Section;
  onSectionChange: (s: Section) => void;
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
  revision:  { bg: 'rgba(245,197,66,0.18)',  fg: '#F5C542', label: 'revision' },
  completed: { bg: 'rgba(112,0,255,0.22)',   fg: '#B98CFF', label: 'completed' },
  launched:  { bg: 'rgba(0,240,255,0.18)',   fg: '#00F0FF', label: 'launched' },
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
    return { done, clickable: false, badge: { label: 'Skipped', color: '#A1A1A1' } };
  }
  if (done && k === MILESTONE.mockup) {
    // milestone_index === MILESTONE.mockup means URL sent, awaiting client review.
    if (lead.milestone_index === MILESTONE.mockup) {
      return { done, clickable: false, badge: { label: 'Sent', color: '#00F0FF' } };
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
function leadMatchesSearch(lead: Lead, query: string) {
  const q = normalizeText(query).trim();
  if (!q) return true;
  const haystack = normalizeText(`${lead.name} ${lead.business} ${lead.email}`);
  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  return q.split(/\s+/).every((tok) =>
    haystack.includes(tok) ||
    (tok.length >= 4 && words.some((w) => withinOneEdit(tok, w))),
  );
}

export default function SettingsPanel({ isOpen, onClose, fullScreen = false, section, onSectionChange }: SettingsPanelProps) {
  const { user, isAdmin, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Starts on 'detail', not 'menu' — `section` is always already resolved by
  // the route (Settings.tsx canonicalizes to my-projects), so opening should
  // land directly on that section instead of an extra section-picker tap.
  // 'menu' is still reachable via the in-panel Back button to switch sections.
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>('detail');
  const [filter, setFilter] = useState<Filter | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

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
    if (isAdmin && isOpen && section === 'agency') refreshLeads();
  }, [isAdmin, isOpen, section, refreshLeads]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setMobileScreen('detail');
      setFilter(null);
      setSearch('');
      setActionError(null);
    }
  }, [isOpen]);

  // When lead selection is cleared, step back out of the lead-detail screen.
  useEffect(() => {
    if (!selectedId && mobileScreen === 'lead-detail') setMobileScreen('detail');
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = useCallback(async (lead: Lead) => {
    const leadId = lead.id;
    // Accepting starts the checklist with nothing checked — "Meeting
    // Completed" becomes the first actionable milestone.
    setAccepting(leadId);
    setActionError(null);
    try {
      await updateLeadMilestone(leadId, 0);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, status: 'accepted', milestone_index: l.meeting_skipped ? MILESTONE.meeting : 0 }
            : l,
        ),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept lead');
    } finally {
      setAccepting(null);
    }
  }, []);

  // Checks off "Meeting Completed" — the only milestone that's a plain manual check.
  const handleCheckMeeting = useCallback(async (leadId: string) => {
    setActionError(null);
    try {
      await updateLeadMilestone(leadId, MILESTONE.meeting);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, milestone_index: MILESTONE.meeting, status: 'accepted' } : l)),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update milestone');
    }
  }, []);

  // Checks off "Website Completed" and fires the payment-request email.
  const handleCompleteSite = useCallback(async (leadId: string) => {
    setActionError(null);
    try {
      await completeSite(leadId);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, milestone_index: MILESTONE.website, status: 'accepted' } : l)),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to mark the website complete');
    }
  }, []);

  // Saves the mockup URL and notifies the client. "Mockup Completed" stays
  // UNCHECKED — it only completes when the client approves the design.
  // Returns success so the URL modal knows whether to close.
  const handleMockupSave = useCallback(async (leadId: string, url: string): Promise<boolean> => {
    setActionError(null);
    try {
      await apiSetMockupURL(leadId, url);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                mockup_url: url,
                revision_feedback: undefined,
                status: 'accepted',
                milestone_index: Math.max(l.milestone_index, MILESTONE.mockup),
              }
            : l,
        ),
      );
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save mockup URL');
      return false;
    }
  }, []);

  // Checks off "Website is Live" with the final site URL.
  const handleLaunchSave = useCallback(async (leadId: string, url: string): Promise<boolean> => {
    setActionError(null);
    try {
      await launchSite(leadId, url);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, milestone_index: MILESTONE.live, status: 'launched', site_url: url } : l,
        ),
      );
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to launch site');
      return false;
    }
  }, []);

  const handleUndo = useCallback(async (leadId: string, targetIndex: number) => {
    setActionError(null);
    try {
      await updateLeadMilestone(leadId, targetIndex);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, milestone_index: targetIndex, status: 'accepted' } : l)),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to undo milestone');
    }
  }, []);

  // The server decides what status a reactivated lead resumes to (it's the
  // only place that knows pre_suspend_status), so it returns the resulting
  // status and we patch it in directly — same pattern as every other action
  // here, and avoids a refetch racing a second click before it lands.
  const handleSuspend = useCallback(async (leadId: string, suspended: boolean) => {
    setActionError(null);
    try {
      const { status } = await setLeadSuspended(leadId, suspended);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update project status');
    }
  }, []);

  const filtered = useMemo(
    () => leads.filter((l) => {
      if (!leadMatchesSearch(l, search)) return false;
      if (filter === null) return true;
      if (filter === 'launched') return l.status === 'launched' || l.status === 'completed';
      return l.status === filter;
    }),
    [leads, filter, search],
  );
  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId],
  );

  const stats = [
    { label: 'Total Leads', value: leads.length, color: '#FFFFFF' },
    { label: 'Pending', value: leads.filter((l) => l.status === 'pending').length, color: '#F5C542' },
    { label: 'In Progress', value: leads.filter((l) => l.status === 'accepted' || l.status === 'revision').length, color: '#00F0FF' },
    { label: 'Launched', value: leads.filter((l) => l.status === 'launched' || l.status === 'completed').length, color: '#B98CFF' },
  ];

  const NAV: NavItem[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'my-projects', label: 'My Projects', icon: FolderOpen },
    ...(isAdmin
      ? ([
          { key: 'agency', label: 'Agency', icon: Building2 },
          { key: 'products', label: 'Products', icon: Package },
          { key: 'academy', label: 'Academy', icon: GraduationCap },
        ] as NavItem[])
      : []),
  ];

  const sectionContent = (
    <>
      {section === 'account' && <AccountSection onClose={onClose} />}
      {section === 'my-projects' && <MyProjectsSection onClose={onClose} />}
      {section === 'agency' && isAdmin && (
        <AgencySection
          leads={leads}
          filtered={filtered}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          stats={stats}
          selected={selected}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onMobileLeadSelect={() => setMobileScreen('lead-detail')}
          onAccept={handleAccept}
          onCheckMeeting={handleCheckMeeting}
          onCompleteSite={handleCompleteSite}
          onMockupSave={handleMockupSave}
          onLaunchSave={handleLaunchSave}
          onUndo={handleUndo}
          onSuspend={handleSuspend}
          onClose={onClose}
          error={error}
          actionError={actionError}
          accepting={accepting}
        />
      )}
      {section === 'products' && isAdmin && <StubSection title="Products" subtitle="Ebook Waitlist / Digital Products" onClose={onClose} placeholder="Products admin isn't wired up yet — bring the requirements and we'll build it next." />}
      {section === 'academy' && isAdmin && <StubSection title="Academy" subtitle="Students / Courses" onClose={onClose} placeholder="Academy admin isn't wired up yet — bring the requirements and we'll build it next." />}
    </>
  );

  return (
    <>
      {isOpen && user && (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center ${fullScreen ? 'p-0' : 'p-6'}`}>
          <div className="absolute inset-0 bg-bg-base" />
          <div
            style={fullScreen ? { width: '100%', height: '100vh' } : { maxWidth: 1180, height: '90vh' }}
            className="relative w-full bg-bg-surface border border-white/5 overflow-hidden flex text-white"
          >
            {/* Sidebar — desktop only; mobile uses the menu/detail hierarchy below */}
            <div className="hidden md:flex flex-shrink-0 bg-bg-base flex-col w-[220px] border-r border-white/[0.06]">
              <div className="flex items-center gap-2.5 px-5 pb-6 pt-6 flex-shrink-0">
                <img src={logo} alt="ConsultPrompts" className="w-7 h-7 object-contain" />
                <span className="font-display font-bold italic text-[15px]">Settings</span>
              </div>
              <div className="flex flex-col flex-1">
                {NAV.map((n) => {
                  const active = section === n.key;
                  return (
                    <button
                      key={n.key}
                      onClick={() => onSectionChange(n.key)}
                      className={`flex items-center gap-3 px-5 py-3 w-full text-left border-none cursor-pointer whitespace-nowrap border-l-2 transition-colors ${
                        active ? 'bg-[rgba(0,240,255,0.08)] border-[#00F0FF]' : 'bg-transparent border-transparent'
                      }`}
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
                <div className="mt-auto px-4 py-5 border-t border-white/[0.06]">
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg border-none cursor-pointer transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500/60" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em]">Log Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content — desktop only */}
            <div className="hidden md:flex flex-1 flex-col min-w-0 min-h-0">
              {sectionContent}
            </div>

            {/* Mobile — menu → section → lead-detail hierarchy */}
            <div className="flex md:hidden flex-1 flex-col min-h-0">
              {mobileScreen === 'menu' ? (
                <div className="flex flex-col h-full min-h-0">
                  <div
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    className="px-4 py-4 flex items-center justify-between gap-4 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={logo} alt="ConsultPrompts" className="w-6 h-6 object-contain" />
                      <span className="font-display font-bold italic text-[15px]">Settings</span>
                    </div>
                    <button
                      onClick={onClose}
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      className="w-8 h-8 rounded-full bg-transparent text-white cursor-pointer text-base leading-none flex items-center justify-center flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      {NAV.map((n, i) => {
                        const Icon = n.icon;
                        return (
                          <button
                            key={n.key}
                            onClick={() => { onSectionChange(n.key); setMobileScreen('detail'); }}
                            style={{ borderBottom: i < NAV.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                            className="flex items-center gap-3.5 px-4 py-4 w-full text-left border-none cursor-pointer bg-bg-surface active:bg-white/[0.04] transition-colors"
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(0,240,255,0.1)' }}
                            >
                              <Icon className="w-4 h-4" style={{ color: '#00F0FF' }} />
                            </div>
                            <span className="flex-1 text-[14px] font-bold text-white">{n.label}</span>
                            <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* detail + lead-detail share the same header; only the title and back target differ */
                <div className="flex flex-col h-full min-h-0">
                  <div
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    className="px-2 py-3 flex items-center gap-2 flex-shrink-0"
                  >
                    <button
                      onClick={() => setMobileScreen(mobileScreen === 'lead-detail' ? 'detail' : 'menu')}
                      className="flex items-center gap-0.5 pl-2 pr-3 py-2 rounded-lg bg-transparent border-none cursor-pointer text-white flex-shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="text-[12px] font-bold uppercase tracking-widest">Back</span>
                    </button>
                    <span className="flex-1 text-center text-[12px] font-bold uppercase tracking-widest text-ink-muted truncate">
                      {mobileScreen === 'lead-detail' ? (selected?.name ?? '') : NAV.find((n) => n.key === section)?.label}
                    </span>
                    <button
                      onClick={onClose}
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      className="w-8 h-8 rounded-full bg-transparent text-white cursor-pointer text-base leading-none flex items-center justify-center flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    {mobileScreen === 'detail' ? sectionContent : (
                      /* lead-detail: scrollable lead info + milestones */
                      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
                        {selected && (
                          <>
                            <div>
                              <h3 className="font-display font-bold italic text-[20px] m-0 mb-1">{selected.name}</h3>
                              <p className="text-brand-primary text-[13px] font-medium m-0">{selected.business}</p>
                            </div>
                            <LeadDetailPanel
                              selected={selected}
                              onAccept={handleAccept}
                              onCheckMeeting={handleCheckMeeting}
                              onCompleteSite={handleCompleteSite}
                              onMockupSave={handleMockupSave}
                              onLaunchSave={handleLaunchSave}
                              onUndo={handleUndo}
                              onSuspend={handleSuspend}
                              actionError={actionError}
                              accepting={accepting}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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

function AgencySection({
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
      <SettingsHeader title="Admin Command" subtitle="Mockup Requests / Pipeline" onClose={onClose} />

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-8 py-4 md:py-6 min-h-0 overflow-y-auto lg:overflow-visible">
        {/* Left column: stats + leads */}
        <div className="flex flex-col gap-6 min-w-0 lg:min-h-0 lg:flex-[1.4]">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
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
          <div className="flex flex-col lg:flex-1 lg:min-h-0">
            <div className="flex items-center justify-between mb-3 gap-4 flex-wrap flex-shrink-0">
              <div
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                className="flex p-1 rounded-sm"
              >
                {(['pending', 'accepted', 'revision', 'launched'] as Filter[]).map((f) => {
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(active ? null : f)}
                      style={{
                        background: active ? '#00F0FF' : 'transparent',
                        color: active ? '#050505' : '#A1A1A1',
                      }}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] border-none cursor-pointer rounded-[3px] transition-all"
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
              <p className="text-ink-muted text-[11px] uppercase tracking-[0.1em] m-0">{filtered.length} shown</p>
            </div>

            {/* Search — matches customer name, business/project name, or email; forgives one typo */}
            <div
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
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
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center flex-shrink-0 text-ink-muted hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
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
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                className="bg-bg-surface rounded-sm p-7 flex flex-col gap-5 lg:h-full lg:overflow-y-auto"
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
                <LeadDetailPanel {...detailProps} />
              </div>
            ) : (
              <div
                key="empty"
                style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
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

function LeadDetailPanel({
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
        <button
          onClick={() => onAccept(selected)}
          disabled={accepting === selected.id}
          className="w-full py-3.5 bg-brand-primary text-bg-base border-none rounded-sm font-black text-[11px] uppercase tracking-[0.12em] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {accepting === selected.id ? 'Accepting...' : 'Accept & Start Milestones'}
        </button>
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
                  <button
                    onClick={() => handleRowClick(k)}
                    disabled={!clickable}
                    title={lockReason}
                    className="flex flex-1 items-center gap-3.5 px-2 py-2.5 bg-transparent border-none text-left rounded-sm hover:bg-white/[0.03] transition-colors"
                    style={{ cursor: clickable ? 'pointer' : 'default', opacity: !done && !clickable && !badge ? 0.45 : 1 }}
                  >
                    <div
                      style={{
                        background: done ? '#00F0FF' : 'transparent',
                        color: done ? '#050505' : '#A1A1A1',
                        border: `1px solid ${done ? '#00F0FF' : 'rgba(255,255,255,0.2)'}`,
                      }}
                      className="w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black"
                    >
                      {done ? '✓' : k}
                    </div>
                    <span
                      style={{ color: done ? '#FFFFFF' : '#A1A1A1', fontWeight: clickable ? 700 : 500 }}
                      className="text-[13px]"
                    >
                      {label}
                      {badge && (
                        <span className="ml-2 text-[9px] uppercase tracking-widest" style={{ color: badge.color }}>
                          {badge.label}
                        </span>
                      )}
                    </span>
                  </button>
                  {undoTo !== null && (
                    <button
                      onClick={() => onUndo(selected.id, undoTo)}
                      title="Undo this milestone"
                      className="p-1.5 rounded-sm bg-transparent border-none cursor-pointer text-ink-muted hover:text-white transition-colors flex-shrink-0"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
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
          accent="#00F0FF"
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
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3.5 rounded-sm font-black text-[11px] uppercase tracking-[0.12em] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={
          suspended
            ? { background: 'transparent', border: '1px solid rgba(0,240,255,0.3)', color: '#00F0FF' }
            : { background: 'transparent', border: '1px solid rgba(255,107,107,0.4)', color: '#FF6B6B' }
        }
      >
        {loading ? (suspended ? 'Reactivating…' : 'Suspending…') : suspended ? 'Reactivate Project' : 'Suspend Project'}
      </button>

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
        style={{ maxWidth: 420, background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}
      >
        <p className="m-0 font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.14em', color: accent }}>
          {title}
        </p>
        <p className="m-0 text-[13px] font-light text-ink-muted">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-[0.1em] border-none cursor-pointer"
            style={{ background: accent, color: '#050505' }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#A1A1A1' }}
          >
            Cancel
          </button>
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
        style={{ maxWidth: 420, background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}
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
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          autoFocus
        />
        {error && (
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: '#FF6B6B' }}>
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={!url.trim() || saving}
            className="flex-1 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-[0.1em] border-none cursor-pointer disabled:opacity-50"
            style={{ background: accent, color: '#050505' }}
          >
            {saving ? 'Sending…' : cta}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#A1A1A1' }}
          >
            Cancel
          </button>
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
  rows.push({ label: 'Email', value: <a href={`mailto:${lead.email}`} className="hover:underline" style={{ color: '#00F0FF' }}>{lead.email}</a> });
  if (lead.phone_number) rows.push({ label: 'Phone', value: <a href={`tel:${lead.phone_number}`} className="hover:underline" style={{ color: '#00F0FF' }}>{lead.phone_number}</a> });
  if (lead.contact_method) rows.push({ label: 'Preferred Contact', value: lead.contact_method });
  if (lead.package) {
    const pkg = PACKAGES.find((p) => p.id === lead.package);
    rows.push({
      label: 'Package',
      value: (
        <span className="uppercase" style={{ letterSpacing: '0.04em' }}>
          {pkg?.name ?? lead.package}
          {pkg && <span className="ml-2 font-bold" style={{ color: '#00F0FF' }}>{pkg.price}</span>}
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
              {lead.name}
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
  const showBar = lead.status === 'accepted' || lead.status === 'revision';
  const pct = showBar ? Math.round((lead.milestone_index / MILESTONES.length) * 100) : 0;

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
              {projectStatusText(lead)}
            </p>
            <p className="m-0 text-[9px] text-ink-muted">
              {lead.milestone_index}/{MILESTONES.length} complete
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
      <SettingsHeader title={title} subtitle={subtitle} onClose={onClose} />
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div
          style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
          className="text-center rounded-sm p-8 md:p-[60px_40px] text-ink-muted italic text-[13px]"
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
