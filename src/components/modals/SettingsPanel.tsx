import React, { useState, useEffect, useRef } from 'react';
import { User, FolderOpen, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettingsNavigate } from '../../hooks';
import logoSrc from '../../logo.png';
import AccountSection from './AccountSection';
import MyProjectsSection from './MyProjectsSection';
import CustomButton from '../ui/CustomButton';

export const SETTINGS_SECTIONS = ['account', 'my-projects'] as const;
export type Section = (typeof SETTINGS_SECTIONS)[number];
type NavItem = { key: Section; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> };
/** Below `settings` (1250px), Settings navigates as a menu → sub-page hierarchy. */
type MobileScreen = 'menu' | 'detail';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fullScreen?: boolean;
  /** Active section — owned by the route (/settings/:section). */
  section: Section;
  /** True when the route was a bare "/settings" — no section was requested yet, so mobile should land on the section picker instead of jumping into `section`. */
  startOnMenu?: boolean;
  onSectionChange: (s: Section) => void;
}

export default function SettingsPanel({ isOpen, onClose, fullScreen = false, section, startOnMenu = false, onSectionChange }: SettingsPanelProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useSettingsNavigate();
  const inMyProjectsSubView =
    section === 'my-projects' &&
    (location.pathname.endsWith('/payments') || location.pathname.endsWith('/old-projects'));
  // Starts on 'detail' when the route already picked a section — e.g. a deep
  // link to /settings/my-projects — so opening lands directly on it instead
  // of an extra section-picker tap. A bare "/settings" (startOnMenu) has no
  // section to jump into, so it starts on the picker itself.
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>(startOnMenu ? 'menu' : 'detail');

  useEffect(() => {
    if (!isOpen) {
      // Reset to the same screen the panel initially mounts on — 'menu' for a
      // bare /settings, 'detail' otherwise. isOpen is also false for one frame
      // on mount (the clip-path enter transition), so resetting to a flat
      // 'detail' here would clobber the startOnMenu initial state.
      setMobileScreen(startOnMenu ? 'menu' : 'detail');
    }
  }, [isOpen, startOnMenu]);

  // Switch to 'detail' only once `section` itself has updated, not the
  // instant a nav item is tapped — react-router commits the route change as
  // a low-priority transition, so flipping mobileScreen eagerly in the click
  // handler used to render the *old* section's content for a frame before
  // the transition caught up. Piggybacking on `section`'s own update keeps
  // both in the same commit. Compares against the previous section (rather
  // than "skip the first run") so it doesn't fight the startOnMenu default —
  // a run-counting ref breaks under StrictMode's double effect invocation.
  const prevSectionRef = useRef(section);
  useEffect(() => {
    if (prevSectionRef.current !== section) {
      prevSectionRef.current = section;
      setMobileScreen('detail');
    }
  }, [section]);

  const NAV: NavItem[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'my-projects', label: 'My Projects', icon: FolderOpen },
  ];

  const sectionContent = (
    <>
      {section === 'account' && <AccountSection onClose={onClose} />}
      {section === 'my-projects' && <MyProjectsSection onClose={onClose} />}
    </>
  );

  return (
    <>
      {user && (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center ${fullScreen ? 'p-0' : 'p-0'}`}>
          {/* No backdrop here on purpose: the page that opened settings stays
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
                  <span className="font-display font-bold italic text-xl">Settings</span>
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

            {/* Mobile — menu → section hierarchy (<1250px) */}
            <div className="flex settings:hidden flex-1 flex-col min-h-0">
              {mobileScreen === 'menu' ? (
                <div className="flex flex-col h-full min-h-0">
                  <div
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
                    className="px-6 py-2 flex items-center justify-between gap-4 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={logoSrc} alt="ConsultPrompts" className="h-10 w-auto object-contain navbar-logo" />
                      <span className="font-display font-bold italic text-[16px]">Settings</span>
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
                <div className="flex flex-col h-full min-h-0">
                  <div
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
                    className="px-6 py-2 flex items-center justify-between gap-4 flex-shrink-0"
                  >
                    <CustomButton
                      onClick={() => {
                        if (inMyProjectsSubView) { navigate('/settings/my-projects', { replace: true }); return; }
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
                    {sectionContent}
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
