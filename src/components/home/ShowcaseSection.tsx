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
  `relative after:content-[''] after:absolute after:bottom-0 after:inset-x-1 after:h-[2px] after:bg-brand-primary after:origin-center after:transition-transform after:duration-300 ${
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
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pb-20 max-[1250px]:pb-5 px-7">
          <span className="section-badge">
            Live Showcase</span>
          <h2 className="section-title">
            One build. Any brand.</h2>
          <p className="section-sub-title">
            Swap the template below to see how the same fast, high-performance build adapts to a completely different look.
          </p>
        </div>

        {/* Template switcher */}
        <div role="group" aria-label="Choose a template" className="flex justify-center gap-0 mb-2 sm:mb-4 max-[1249px]:pt-6 pt-4">
          {SHOWCASE_TEMPLATES.map((t) => {
            const isActive = t.slug === activeSlug;
            const Icon = t.icon;
            return (
              <CustomButton
                key={t.slug}
                onClick={() => updateParam(TEMPLATE_PARAM, t.slug)}
                variant="radio"
                size="none"
                className={
                  isActive
                    ? 'px-4 border-brand-primary bg-brand-primary text-bg-base font-bold'
                    : 'px-4 border-white/10 text-ink-muted hover:border-white/30 hover:text-white'
                }
                aria-pressed={isActive}
                aria-label={`Show the ${t.name} template`}
              >
                <Icon className="hidden sm:unhidden w-4 h-4 flex-shrink-0" style={{ color: t.accent }} aria-hidden="true" />
                {t.name}
              </CustomButton>
            );
          })}
        </div>

        {/* Device toggle */}
        <div role="group" aria-label="Choose a preview device" className="flex flex-wrap justify-center gap-0 mb-8">
          <CustomButton
            onClick={() => updateParam(DEVICE_PARAM, null)}
            variant="radio"
            size="none"
            className={activeUnderline(device === 'desktop')}
            aria-pressed={device === 'desktop'}
            aria-label="Preview at desktop width"
          >
            <Monitor className="w-4 h-4" aria-hidden="true" /> Desktop
          </CustomButton>
          <CustomButton
            onClick={() => updateParam(DEVICE_PARAM, 'mobile')}
            variant="radio"
            size="none"
            className={activeUnderline(device === 'mobile')}
            aria-pressed={device === 'mobile'}
            aria-label="Preview at mobile width"
          >
            <Smartphone className="w-4 h-4" aria-hidden="true" /> Mobile
          </CustomButton>
        </div>
        <BrowserFrame
          template={active}
          device={device}
          onOpenFullscreen={() => updateParam(FULLSCREEN_PARAM, '1')}
        />
      </div>

      {fullscreen && (
        <FullscreenModal template={active} onClose={() => updateParam(FULLSCREEN_PARAM, null)} />
      )}
    </section>
  );
}

function ChromeBar({
  domain,
  onOpenFullscreen,
  onClose,
}: {
  domain: string;
  onOpenFullscreen?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="relative flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: '#E8E8E8' }}>
      <div className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-medium max-w-[240px] truncate"
        style={{ background: '#FFFFFF', color: '#6B7280' }}
      >
        <Lock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">{domain}</span>
      </div>
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        {onOpenFullscreen && (
          <CustomButton
            onClick={onOpenFullscreen}
            variant="icon"
            size="none"
            className="mr-2 sm:mr-5"
            aria-label={`Open the ${domain} template full screen`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </CustomButton>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close full screen preview"
            className="p-1 rounded-md hover:bg-black/10 flex-shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function BrowserFrame({
  template,
  device,
  onOpenFullscreen,
}: {
  template: ShowcaseTemplateEntry;
  device: Device;
  onOpenFullscreen: () => void;
}) {
  const { Component } = template;
  return (
    <div className={`mx-auto transition-[max-width] duration-300 px-5 ${device === 'mobile' ? 'max-w-[380px]' : 'max-w-full'}`}>
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <ChromeBar domain={template.domain} onOpenFullscreen={onOpenFullscreen} />
        <div
          key={template.slug}
          className={`@container showcase-scrollbar showcase-fade overflow-y-auto overflow-x-hidden overscroll-none transition-[height] duration-300 ${device === 'mobile' ? 'h-[560px]' : 'h-[480px]'}`}
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
      <div key={template.slug} className="@container showcase-scrollbar showcase-fade overflow-y-auto overflow-x-hidden overscroll-none flex-1">
        <Component />
      </div>
    </div>
  );
}
