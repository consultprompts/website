import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { type Lead } from '../../lib/api';
import CustomButton from '../ui/CustomButton';

export default function PaymentsView({ leads, onBack }: { leads: Lead[]; onBack: () => void }) {
  const paidLeads = leads.filter((l) => l.is_paid);

  return (
    <div className="w-full">
      <CustomButton
        onClick={onBack}
        variant="ghost"
        size="none"
        className="hidden settings:flex items-center gap-1.5 text-ink-muted text-[15px] border-none hover:text-white transition-colors mb-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </CustomButton>
      <h2 className="font-display font-bold text-2xl mt-4 mb-1">Payments</h2>
      <p className="text-[13px] text-ink-muted mb-6">Your billing history with Consult Prompts.</p>

      <div className="w-full rounded-[14px] border overflow-hidden" style={{ borderColor: 'color-mix(in srgb, var(--color-ink-base) 8%, transparent)' }}>
        {/* Header row: NAME | AMOUNT | DATE */}
        <div
          className="px-5 py-4 grid"
          style={{ background: 'color-mix(in srgb, var(--color-ink-base) 3%, transparent)', gridTemplateColumns: '2.2fr 1fr 1fr' }}
        >
          {['NAME', 'AMOUNT', 'DATE'].map((col, i) => (
            <span key={col} className={`text-[11px] font-bold uppercase tracking-widest text-ink-muted${i === 2 ? ' text-right' : ''}`}>{col}</span>
          ))}
        </div>

        {paidLeads.length === 0 ? (
          <p className="text-sm text-ink-muted font-light text-center py-8">No payments yet.</p>
        ) : (
          paidLeads.map((lead) => {
            const dateStr = lead.paid_at
              ? new Date(lead.paid_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
              : '—';
            const description = `${lead.business}`;
            const amount = lead.payment_amount != null ? `$${lead.payment_amount.toFixed(2)}` : '—';

            return (
              <div
                key={lead.id}
                className="px-5 py-[14px] grid"
                style={{ borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)', gridTemplateColumns: '2.2fr 1fr 1fr' }}
              >
                <span className="text-[13px] text-white">{description}</span>
                <span className="text-[13px] font-bold text-white">{amount}</span>
                <span className="text-[13px] text-ink-muted text-right">{dateStr}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
