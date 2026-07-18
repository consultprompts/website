import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { redeemLead, APIError } from '../../lib/api';
import CustomButton from '../ui/CustomButton';

// Manual counterpart of the /redeem email link: paste the project ID from an
// admin invite to attach that project to your account. Rendered as a
// My Projects sub-view (/settings/my-projects/redeem-project), same pattern
// as OldProjectsView and PaymentsView.
export default function RedeemProjectView({ onBack, onRedeemed }: { onBack: () => void; onRedeemed: () => void }) {
  const [leadId, setLeadId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRedeem = async () => {
    const id = leadId.trim();
    if (!id) {
      setError('Enter the project ID from your invite.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await redeemLead(id);
      onRedeemed();
    } catch (e) {
      if (e instanceof APIError && e.code === 'INVALID_ID') {
        setError('Invalid ID — no project found with that ID.');
      } else if (e instanceof APIError && e.code === 'ALREADY_REDEEMED') {
        setError('Already redeemed — this project belongs to another account.');
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong — please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <CustomButton
        onClick={onBack}
        variant="ghost"
        size="none"
        className="hidden settings:flex items-center gap-1.5 text-ink-muted text-[15px] border-none hover:text-white transition-colors mb-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </CustomButton>
      <h2 className="font-display font-bold text-2xl mt-4 mb-1">Redeem project</h2>
      <p className="text-[13px] text-ink-muted mb-6">
        Got a project set up for you? Paste its ID to add it to your account.
      </p>

      <div className="rounded-[14px] border border-white/8 bg-bg-surface p-6 max-w-md">
        <label className="block text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-1.5">Project ID</label>
        <input
          type="text"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !submitting) handleRedeem(); }}
          placeholder="e.g. 6f1c2a4e-…"
          className="w-full rounded-lg px-4 py-3 text-sm font-light text-white focus:outline-none"
          style={{ background: 'color-mix(in srgb, var(--color-ink-base) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)' }}
        />

        {error && (
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#FF6B6B' }}>{error}</p>
        )}

        <CustomButton
          onClick={handleRedeem}
          disabled={submitting}
          size="none"
          className="w-full mt-6 text-[13px] px-[18px] py-3 rounded-[9px] border-none"
          style={{ background: 'var(--color-brand-primary)', color: 'var(--color-bg-base)' }}
        >
          {submitting ? 'Redeeming…' : 'Redeem'}
        </CustomButton>
      </div>
    </div>
  );
}
