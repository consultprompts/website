import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getLeads, updateLeadStatus, updateLeadMilestone, type Lead } from '../../lib/api';
import logo from '../../logo.png';

const MILESTONE_STAGES = [
  'Deposit Received',
  'Mockup Delivered',
  'Revisions Signed Off',
  'Site in Development',
  'Launched',
];

type Section = 'agency' | 'products' | 'academy';
type Filter = 'all' | 'pending' | 'accepted' | 'completed';

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

const STATUS_STYLE: Record<Lead['status'], { bg: string; fg: string; label: string }> = {
  pending: { bg: 'rgba(245,197,66,0.18)', fg: '#F5C542', label: 'pending' },
  accepted: { bg: 'rgba(0,240,255,0.18)', fg: '#00F0FF', label: 'in progress' },
  completed: { bg: 'rgba(112,0,255,0.22)', fg: '#B98CFF', label: 'completed' },
};

export default function AdminPanel({ isOpen, onClose, fullScreen = false }: AdminPanelProps) {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('agency');
  const [filter, setFilter] = useState<Filter>('all');
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
    if (isAdmin && isOpen) refreshLeads();
  }, [isAdmin, isOpen, refreshLeads]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setSection('agency');
      setFilter('all');
      setActionError(null);
    }
  }, [isOpen]);

  const handleAccept = useCallback(async (leadId: string) => {
    setAccepting(leadId);
    setActionError(null);
    try {
      await updateLeadMilestone(leadId, 0);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: 'accepted', milestone_index: 0 } : l)),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept lead');
    } finally {
      setAccepting(null);
    }
  }, []);

  const handleMilestone = useCallback(async (leadId: string, idx: number) => {
    setActionError(null);
    try {
      await updateLeadMilestone(leadId, idx);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, milestone_index: idx, status: idx >= MILESTONE_STAGES.length - 1 ? 'completed' : 'accepted' }
            : l,
        ),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update milestone');
    }
  }, []);

  const filtered = useMemo(
    () => leads.filter((l) => filter === 'all' || l.status === filter),
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
    { label: 'Completed', value: leads.filter((l) => l.status === 'completed').length, color: '#B98CFF' },
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
  onAccept: (id: string) => Promise<void>;
  onMilestone: (id: string, idx: number) => Promise<void>;
  onClose: () => void;
  error: string | null;
  actionError: string | null;
  accepting: string | null;
}

function AgencySection({
  filtered, filter, setFilter, stats, selected, selectedId, setSelectedId,
  onAccept, onMilestone, onClose, error, actionError, accepting,
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-8 pt-6 flex-shrink-0">
        {stats.map((s) => (
          <div
            key={s.label}
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            className="bg-bg-surface p-5 rounded-sm flex flex-col gap-1.5"
          >
            <p className="text-ink-muted text-[10px] uppercase tracking-[0.14em] font-bold m-0">{s.label}</p>
            <p className="font-display text-[30px] font-bold m-0" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex gap-6 px-8 py-6 min-h-0">
        {/* Leads column */}
        <div style={{ flex: 1.4 }} className="flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap flex-shrink-0">
            <div
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              className="flex p-1 rounded-sm"
            >
              {(['all', 'pending', 'accepted', 'completed'] as Filter[]).map((f) => (
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

        {/* Drawer */}
        <div style={{ flex: 1, minWidth: 340, maxWidth: 420 }} className="flex flex-col">
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

                {selected.message && (
                  <div
                    style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.05)' }}
                    className="p-4 rounded-sm text-ink-muted text-[13px] font-light whitespace-pre-wrap"
                  >
                    {selected.message}
                  </div>
                )}

                {selected.status === 'pending' && (
                  <button
                    onClick={() => onAccept(selected.id)}
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

                {(selected.status === 'accepted' || selected.status === 'completed') && (
                  <div>
                    <p className="text-ink-muted text-[10px] uppercase tracking-[0.14em] font-bold m-0 mb-3.5">
                      Project Milestones
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {MILESTONE_STAGES.map((label, idx) => {
                        const done = idx <= selected.milestone_index;
                        const current = idx === selected.milestone_index && selected.status !== 'completed';
                        return (
                          <button
                            key={idx}
                            onClick={() => onMilestone(selected.id, idx)}
                            className="flex items-center gap-3.5 px-2 py-2.5 bg-transparent border-none cursor-pointer text-left w-full rounded-sm hover:bg-white/[0.03] transition-colors"
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
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selected.status === 'completed' && (
                  <div
                    style={{
                      background: 'rgba(0,240,255,0.08)',
                      border: '1px solid rgba(0,240,255,0.25)',
                      color: '#00F0FF',
                    }}
                    className="p-3.5 rounded-sm text-[12px] font-bold uppercase tracking-[0.08em] text-center"
                  >
                    Project Launched 🎉
                  </div>
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

function LeadRow({ lead, isSelected, onClick }: { key?: string; lead: Lead; isSelected: boolean; onClick: () => void }) {
  const ss = STATUS_STYLE[lead.status];
  const showBar = lead.status === 'accepted';
  const pct = showBar ? Math.round(((lead.milestone_index + 1) / MILESTONE_STAGES.length) * 100) : 0;

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
              {MILESTONE_STAGES[lead.milestone_index]}
            </p>
            <p className="m-0 text-[9px] text-ink-muted">
              Stage {lead.milestone_index + 1}/{MILESTONE_STAGES.length}
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
