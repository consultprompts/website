import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Loader2, FolderOpen } from 'lucide-react';
import logoSrc from '../logo.png';
import { getMyLeads, type Lead } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const MILESTONES = [
  'Deposit Received',
  'Mockup Delivered',
  'Revisions Signed Off',
  'Site in Development',
  'Launched',
];

const STATUS_CONFIG = {
  pending:   { label: 'Under Review', color: '#F5C542', bg: 'rgba(245,197,66,0.12)' },
  accepted:  { label: 'In Progress',  color: '#00F0FF', bg: 'rgba(0,240,255,0.10)' },
  completed: { label: 'Launched',     color: '#B98CFF', bg: 'rgba(112,0,255,0.18)' },
};

function MilestoneTracker({ lead }: { lead: Lead }) {
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

  if (lead.status === 'completed') {
    return (
      <div className="mt-6 p-4 rounded-xl border" style={{ background: 'rgba(0,240,255,0.07)', borderColor: 'rgba(0,240,255,0.25)' }}>
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#00F0FF' }}>
          Project Launched 🎉
        </p>
        <p className="mt-1 text-xs text-ink-muted font-light">All milestones completed.</p>
      </div>
    );
  }

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
                    background: done ? '#00F0FF' : 'rgba(255,255,255,0.1)',
                  }}
                />
              )}
              <div className="flex-shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#00F0FF' }} />
                ) : current ? (
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: '#00F0FF', background: 'rgba(0,240,255,0.15)' }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: '#00F0FF' }} />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-white/20" />
                )}
              </div>
              <div className="pb-7">
                <p
                  className="text-sm font-bold leading-tight"
                  style={{
                    color: done ? '#ffffff' : current ? '#00F0FF' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {label}
                </p>
                {current && (
                  <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: '#00F0FF' }}>
                    Current stage
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectCard({ lead, active }: { lead: Lead; active: boolean }) {
  const cfg = STATUS_CONFIG[lead.status];
  const pkg = lead.package ? lead.package : null;
  const date = new Date(lead.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div
      className="liquid-glass rounded-xl p-6 md:p-8"
      style={{ borderColor: active ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display font-bold italic text-xl md:text-2xl">{lead.business}</h3>
          <p className="text-ink-muted text-xs mt-1">
            Submitted {date}
            {pkg && <> · <span className="text-white/60 uppercase tracking-widest">{pkg}</span></>}
          </p>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>

      <MilestoneTracker lead={lead} />
    </div>
  );
}

export default function MyProjects() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyLeads()
      .then(setLeads)
      .catch(() => setError('Could not load your projects — please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const active = leads.filter((l) => l.status !== 'completed');
  const past   = leads.filter((l) => l.status === 'completed');

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
              {active.map((l) => <ProjectCard key={l.id} lead={l} active />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-4">Past Projects</p>
            <div className="flex flex-col gap-4">
              {past.map((l) => <ProjectCard key={l.id} lead={l} active={false} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
