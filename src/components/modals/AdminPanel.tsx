import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getLeads, updateLeadStatus, type Lead } from '../../lib/api';

type Filter = 'all' | 'pending' | 'completed';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);

  const refreshLeads = useCallback(async () => {
    try {
      const data = await getLeads();
      setLeads(data);
      setError(null);
    } catch {
      setError('Could not load leads — the agency service may not be running yet.');
    }
  }, []);

  useEffect(() => {
    if (isAdmin && isOpen) refreshLeads();
  }, [isAdmin, isOpen, refreshLeads]);

  const toggleLeadStatus = async (leadId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await updateLeadStatus(leadId, newStatus);
      refreshLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = leads.filter((l) => filter === 'all' || (l.status || 'pending') === filter);

  return (
    <AnimatePresence>
      {isOpen && isAdmin && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-bg-base" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl h-full md:h-[90vh] bg-bg-surface border border-white/5 md:rounded-sm overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-bg-base flex-shrink-0 gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold italic flex items-center gap-3">
                  <LayoutDashboard className="w-6 h-6 text-brand-primary" />
                  Admin Command
                </h2>
                <p className="text-ink-muted text-xs uppercase tracking-widest mt-1">Mockup Requests / Pipeline</p>
              </div>

              <div className="flex bg-white/5 p-1 rounded-sm border border-white/10">
                {(['all', 'pending', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      filter === f ? 'bg-brand-primary text-bg-base' : 'text-ink-muted hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="absolute top-6 right-6 md:static z-[60] p-2 bg-bg-surface md:bg-transparent border border-white/10 md:border-none rounded-full hover:text-brand-primary transition-colors flex-shrink-0 cursor-pointer"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-bg-base">
              <div className="grid gap-6">
                {error ? (
                  <div className="py-20 text-center border border-dashed border-white/10 italic text-ink-muted">{error}</div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/10 italic text-ink-muted">
                    No matching communications detected in the stream.
                  </div>
                ) : (
                  filtered.map((lead) => (
                    <div key={lead.id} className="p-6 bg-white/[0.02] border border-white/5 hover:border-brand-primary/30 transition-colors group">
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-lg text-white">{lead.name}</h4>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                lead.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                              }`}
                            >
                              {lead.status || 'pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-brand-primary text-sm font-medium">{lead.business}</p>
                            {lead.package && (
                              <span className="text-[8px] uppercase tracking-widest font-black bg-white/10 px-1.5 py-0.5 rounded text-white italic">
                                {lead.package}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">{lead.email}</p>
                          <p className="text-[10px] text-ink-muted uppercase tracking-widest mt-1">
                            {lead.created_at ? new Date(lead.created_at).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      {lead.message && (
                        <div className="p-4 bg-bg-base rounded-sm border border-white/5 text-sm text-ink-muted font-light whitespace-pre-wrap mb-4">
                          {lead.message}
                        </div>
                      )}
                      <div className="flex justify-end pt-4 border-t border-white/5">
                        <button
                          onClick={() => toggleLeadStatus(lead.id, lead.status || 'pending')}
                          className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-brand-primary hover:text-bg-base transition-all rounded-sm cursor-pointer"
                        >
                          Mark as {lead.status === 'completed' ? 'Pending' : 'Completed'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
