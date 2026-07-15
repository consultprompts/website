import React from 'react';
import { ChevronLeft, FolderOpen } from 'lucide-react';
import { type Lead } from '../../lib/api';
import { PACKAGES } from '../../data/content';
import { safeUrl } from '../../lib/urls';
import CustomButton from '../ui/CustomButton';

const PACKAGE_NAME: Record<string, string> = Object.fromEntries(
  PACKAGES.map(p => [p.id, p.name])
);

export default function OldProjectsView({ past, onBack }: { past: Lead[]; onBack: () => void }) {
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
              className="rounded-[14px] border px-6 py-4 flex items-center justify-between"
              style={{ borderColor: 'color-mix(in srgb, var(--color-ink-base) 8%, transparent)', background: 'var(--bg-surface, color-mix(in srgb, var(--color-ink-base) 3%, transparent))' }}
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
                  style={{ color: 'var(--brand-primary, var(--color-brand-primary))' }}
                >
                  Visit site ↗
                </a>
              )}
            </div>
          );
        })}
        {past.length === 0 && (
          <div className="liquid-glass rounded-xl p-12 text-center border-white/5">
          <FolderOpen className="w-10 h-10 text-ink-muted mx-auto mb-4" />
          <h3 className="font-display font-bold italic text-xl mb-2">No past projects yet.</h3>
          <p className="text-ink-muted text-sm font-light">
            Start a project and your mockup request will appear here.
          </p>
        </div>
        )}
      </div>
    </div>
  );
}
