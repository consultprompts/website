import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Monitor, Smartphone, ExternalLink, Lock, X } from 'lucide-react';
import { SHOWCASE_TEMPLATES, type ShowcaseTemplateEntry } from './templates';
import { useBodyScrollLock } from '../../hooks';
import AuroraBackground from '../ui/AuroraBackground';
import CustomButton from '../ui/CustomButton';

type Device = 'desktop' | 'mobile';

// Query param names are prefixed so they can't collide with unrelated params
// this page already reads (Home's own ?auth=/?next=).
const TEMPLATE_PARAM = 'showcase';
const DEVICE_PARAM = 'showcase_device';
const FULLSCREEN_PARAM = 'showcase_fullscreen';

// Active toggle (template switcher + device row): brand-primary bottom
// border that grows from the center outward (origin-center scale-x),
// collapsing the same way when another option is picked.
const activeUnderline = (active: boolean) =>
  `relative after:content-[''] after:absolute after:bottom-1 after:inset-x-5 after:h-[2px] after:bg-brand-primary after:origin-center after:transition-transform after:duration-300 ${
    active ? 'after:scale-x-100' : 'after:scale-x-0'
  }`;

export default function ShowcaseSection() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSlug = searchParams.get(TEMPLATE_PARAM) ?? SHOWCASE_TEMPLATES[0].slug;
  const device: Device = searchParams.get(DEVICE_PARAM) === 'mobile' ? 'mobile' : 'desktop';
  const fullscreen = searchParams.get(FULLSCREEN_PARAM) === '1';
  const active = SHOWCASE_TEMPLATES.find(t => t.slug === activeSlug) ?? SHOWCASE_TEMPLATES[0];

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  return (
    <section id="showcase" aria-label="Live Template Showcase" className="py-16 md:py-24 px-6 relative overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pb-12 max-[1250px]:pb-5 px-7">
          <span className="section-badge">
            Live Showcase</span>
          <h2 className="section-title">
            One build. Any brand.</h2>
          <p className="section-sub-title">
            Swap the template below to see how the same fast, high-performance build adapts to a completely different look and feel.
          </p>
        </div>

        {/* Template switcher */}
        <div role="group" aria-label="Choose a template" className="flex flex-wrap justify-center gap-0 mb-4">
          {SHOWCASE_TEMPLATES.map((t) => {
            const isActive = t.slug === activeSlug;
            const Icon = t.icon;
            return (
              <CustomButton
                key={t.slug}
                onClick={() => updateParam(TEMPLATE_PARAM, t.slug)}
                variant="ghost"
                size="lg"
                className={activeUnderline(isActive)}
                aria-pressed={isActive}
                aria-label={`Show the ${t.name} template`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: t.accent }} aria-hidden="true" />
                {t.name}
              </CustomButton>
            );
          })}
        </div>

        {/* Device toggle */}
        <div role="group" aria-label="Choose a preview device" className="flex flex-wrap justify-center gap-2.5 mb-8">
          <CustomButton
            onClick={() => updateParam(DEVICE_PARAM, null)}
            variant="ghost"
            className={activeUnderline(device === 'desktop')}
            aria-pressed={device === 'desktop'}
            aria-label="Preview at desktop width"
          >
            <Monitor className="w-4 h-4" aria-hidden="true" /> Desktop
          </CustomButton>
          <CustomButton
            onClick={() => updateParam(DEVICE_PARAM, 'mobile')}
            variant="ghost"
            className={activeUnderline(device === 'mobile')}
            aria-pressed={device === 'mobile'}
            aria-label="Preview at mobile width"
          >
            <Smartphone className="w-4 h-4" aria-hidden="true" /> Mobile
          </CustomButton>
          <CustomButton
            onClick={() => updateParam(FULLSCREEN_PARAM, '1')}
            variant="ghost"
            aria-label={`Open the ${active.name} template full screen`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" /> Open full screen
          </CustomButton>
        </div>
        <BrowserFrame template={active} device={device} />
      </div>

      {fullscreen && (
        <FullscreenModal template={active} onClose={() => updateParam(FULLSCREEN_PARAM, null)} />
      )}
    </section>
  );
}

function ChromeBar({ domain, onClose }: { domain: string; onClose?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: '#E8E8E8' }}>
      <div className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
        <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
      </div>
      <div className="flex-1 flex justify-center min-w-0">
        <div
          className="flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-medium max-w-[240px] truncate"
          style={{ background: '#FFFFFF', color: '#6B7280' }}
        >
          <Lock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{domain}</span>
        </div>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close full screen preview"
          className="p-1 rounded-md hover:bg-black/10 flex-shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" style={{ color: '#374151' }} />
        </button>
      ) : (
        // Balances the traffic-light dots so the URL bar stays visually centered.
        <div className="w-[52px] flex-shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}

function BrowserFrame({ template, device }: { template: ShowcaseTemplateEntry; device: Device }) {
  const { Component } = template;
  return (
    <div className={`mx-auto transition-[max-width] duration-300 px-5 ${device === 'mobile' ? 'max-w-[380px]' : 'max-w-full'}`}>
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <ChromeBar domain={template.domain} />
        {/* @container: templates size their layout (hamburger vs full nav,
            grid columns) off this pane's width, not the real viewport — so
            "Mobile" genuinely shows the template's mobile layout. */}
        <div
          key={template.slug}
          className={`@container showcase-scrollbar showcase-fade overflow-y-auto transition-[height] duration-300 ${device === 'mobile' ? 'h-[560px]' : 'h-[480px]'}`}
        >
          <Component />
        </div>
      </div>
    </div>
  );
}

function FullscreenModal({ template, onClose }: { template: ShowcaseTemplateEntry; onClose: () => void }) {
  const { Component } = template;
  useBodyScrollLock(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${template.name} template, full screen preview`}
    >
      <ChromeBar domain={template.domain} onClose={onClose} />
      <div key={template.slug} className="@container showcase-scrollbar showcase-fade overflow-y-auto flex-1">
        <Component />
      </div>
    </div>
  );
}
