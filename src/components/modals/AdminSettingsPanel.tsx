import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Package, GraduationCap, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getLeads, updateLeadMilestone, setMockupURL as apiSetMockupURL, completeSite, launchSite, setLeadSuspended, type Lead } from '../../lib/api';
import { MILESTONE } from '../../lib/milestones';
import logoSrc from '../../logo.png';
import AgencySection, { LeadDetailPanel, leadMatchesSearch, type Filter } from './AgencySection';
import CustomButton from '../ui/CustomButton';

export const ADMIN_SETTINGS_SECTIONS = ['agency', 'products', 'academy'] as const;
export type AdminSection = (typeof ADMIN_SETTINGS_SECTIONS)[number];
type NavItem = { key: AdminSection; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> };
/** Below `settings` (1250px), the console navigates as a menu → sub-page → lead-detail hierarchy. */
type MobileScreen = 'menu' | 'detail' | 'lead-detail';

interface AdminSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fullScreen?: boolean;
  /** Active section — owned by the route (/admin-settings/:section). */
  section: AdminSection;
  onSectionChange: (s: AdminSection) => void;
}

export default function AdminSettingsPanel({ isOpen, onClose, fullScreen = false, section, onSectionChange }: AdminSettingsPanelProps) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
    if (isAdmin && isOpen && section === 'agency') {
      refreshLeads();
      const id = setInterval(refreshLeads, 15_000);
      return () => clearInterval(id);
    }
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

  // Switch to 'detail' only once `section` itself has updated, not the
  // instant a nav item is tapped — react-router commits the route change as
  // a low-priority transition, so flipping mobileScreen eagerly in the click
  // handler would render the *old* section's content for a frame before the
  // transition caught up. Compares against the previous section so it stays
  // correct under StrictMode's double effect invocation.
  const prevSectionRef = useRef(section);
  useEffect(() => {
    if (prevSectionRef.current !== section) {
      prevSectionRef.current = section;
      setMobileScreen('detail');
    }
  }, [section]);

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
    { label: 'Total Leads', value: leads.length, color: 'var(--color-ink-base)' },
    { label: 'Pending', value: leads.filter((l) => l.status === 'pending').length, color: '#F5C542' },
    { label: 'In Progress', value: leads.filter((l) => l.status === 'accepted' || l.status === 'revision').length, color: 'var(--color-brand-primary)' },
    { label: 'Launched', value: leads.filter((l) => l.status === 'launched' || l.status === 'completed').length, color: '#B98CFF' },
  ];

  const NAV: NavItem[] = [
    { key: 'agency', label: 'Agency', icon: Building2 },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'academy', label: 'Academy', icon: GraduationCap },
  ];

  const sectionContent = (
    <>
      {section === 'agency' && (
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
      {section === 'products' && <StubSection title="Products" subtitle="Ebook Waitlist / Digital Products" onClose={onClose} placeholder="Products admin isn't wired up yet — bring the requirements and we'll build it next." />}
      {section === 'academy' && <StubSection title="Academy" subtitle="Students / Courses" onClose={onClose} placeholder="Academy admin isn't wired up yet — bring the requirements and we'll build it next." />}
    </>
  );

  return (
    <>
      {user && isAdmin && (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center ${fullScreen ? 'p-0' : 'p-0'}`}>
          {/* No backdrop here on purpose: the page that opened the console stays
              mounted behind this overlay (App's background-location routing),
              and it should remain visible while the opaque panel surface
              below wipes over it — a backdrop would blank it out instantly. */}
          <div
            style={{
              ...(fullScreen ? { width: '100%', height: '100dvh' } : { maxWidth: 1000, height: '90vh' }),
              clipPath: isOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
            }}
            className={`relative w-full bg-bg-surface border border-white/5 overflow-hidden flex flex-col text-white transition-none settings:transition-[clip-path] settings:duration-300 settings:ease-in-out ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            aria-hidden={!isOpen}
          >
            {/* Unified top bar — desktop only (≥1250px) */}
            <div
              className="hidden settings:flex flex-shrink-0"
              style={{ height: 56, borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
            >
              <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={logoSrc} alt="ConsultPrompts" className="h-10 w-auto object-contain navbar-logo" />
                  <span className="font-display font-bold italic text-xl">Admin Settings</span>
                </div>
                <CustomButton onClick={onClose} variant="icon" size="lg"><X/></CustomButton>
              </div>
            </div>

            {/* Body row: sidebar + content — desktop only (≥1250px) */}
            <div className="hidden settings:flex flex-row flex-1 min-h-0 overflow-hidden max-w-[1280px] w-full mx-auto">
              {/* Sidebar */}
              <div className="flex flex-shrink-0 flex-col w-[200px] border-r border-white/[0.06]">
                <div className="flex flex-col flex-1 pt-4">
                {NAV.map((n) => {
                  const active = section === n.key;
                  const Icon = n.icon;
                  return (
                    <CustomButton
                        key={n.key}
                        onClick={() => onSectionChange(n.key)}
                        variant="ghost"
                        size="none"
                        className={`flex items-center gap-3 py-4 w-full text-left border-none whitespace-nowrap border-l-2 transition-colors ${
                          active ? 'bg-brand-primary/10 border-brand-primary' : 'bg-transparent border-transparent'
                        }`}
                      >
                        <Icon className="w-6 h-6" style={{ color: active ? 'var(--color-brand-primary)' : "" }} />
                        <span
                          style={{ color: active ? 'var(--color-brand-primary)' : "" }}
                          className="text-sm tracking-[0.1em]"
                        >
                          {n.label}
                        </span>
                      </CustomButton>
                  );
                })}
              </div>
            </div>

              {/* Content */}
              <div className="flex flex-1 flex-col min-w-0 min-h-0">
                {sectionContent}
              </div>
            </div>

            {/* Mobile — menu → section → lead-detail hierarchy (<1250px) */}
            <div className="flex settings:hidden flex-1 flex-col min-h-0">
              {mobileScreen === 'menu' ? (
                <div className="flex flex-col h-full min-h-0">
                  <div
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
                    className="px-6 py-2 flex items-center justify-between gap-4 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={logoSrc} alt="ConsultPrompts" className="h-10 w-auto object-contain navbar-logo" />
                      <span className="font-display font-bold italic text-[16px]">Admin Settings</span>
                    </div>
                    <div className="xl:hidden flex items-center gap-1">
                      <CustomButton onClick={onClose} variant="icon" size="lg"><X/></CustomButton>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}>
                      {NAV.map((n, i) => {
                        const Icon = n.icon;
                        return (
                          <CustomButton
                            key={n.key}
                            onClick={() => {
                              // Tapping the already-active section doesn't change `section`,
                              // so the section-driven effect above won't fire — advance here instead.
                              if (n.key === section) setMobileScreen('detail');
                              else onSectionChange(n.key);
                            }}
                            variant="ghost"
                            size="none"
                            style={{ borderBottom: i < NAV.length - 1 ? '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' : 'none' }}
                            className="flex items-center gap-3.5 px-4 py-4 w-full text-left border-none bg-bg-surface active:bg-white/[0.04] transition-colors"
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'color-mix(in srgb, var(--color-brand-primary) 10%, transparent)' }}
                            >
                              <Icon className="w-4 h-4" style={{ color: 'var(--color-brand-primary)' }} />
                            </div>
                            <span className="flex-1 text-[14px] font-bold text-white">{n.label}</span>
                            <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
                          </CustomButton>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* detail + lead-detail share the same header; only the back target differs */
                <div className="flex flex-col h-full min-h-0">
                  <div
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
                    className="px-6 py-2 flex items-center justify-between gap-4 flex-shrink-0"
                  >
                    <CustomButton
                      onClick={() => {
                        if (mobileScreen === 'lead-detail') { setMobileScreen('detail'); return; }
                        setMobileScreen('menu');
                      }}
                      variant="ghost"
                      size="none"
                      className="flex items-center gap-0.5 pr-3 rounded-lg border-none flex-shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="text-[15px] font-bold uppercase tracking-widest">Back</span>
                    </CustomButton>
                    <div className="xl:hidden flex items-center gap-1">
                      <CustomButton onClick={onClose} variant="icon" size="lg"><X/></CustomButton>
                    </div>
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

function StubSection({ title, subtitle, placeholder }: { title: string; subtitle: string; onClose: () => void; placeholder: string }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-2 flex-shrink-0">
        <h2 className="font-display font-bold text-2xl">{title}</h2>
        <p className="text-[13px] text-ink-muted mt-1">{subtitle}</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div
          style={{ border: '1px dashed color-mix(in srgb, var(--color-ink-base) 10%, transparent)' }}
          className="text-center rounded-sm p-8 md:p-[60px_40px] text-ink-muted italic text-[13px]"
        >
          {placeholder}
        </div>
      </div>
    </div>
  );
}
