import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks';
import { joinWaitlist, checkWaitlistStatus, getEnrollmentCount } from '../lib/api';
import AuthModal, { type AuthMode } from '../components/modals/AuthModal';
import Logo from '../components/ui/Logo';
import Footer from '../components/layout/Footer';
import CustomButton from '../components/ui/CustomButton';

export default function Ebooks() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState<number | null>(null);

  useBodyScrollLock(isWaitlistModalOpen || isAuthModalOpen);

  useEffect(() => {
    if (user) {
      checkWaitlistStatus().then(setHasJoined);
    } else {
      setHasJoined(false);
    }
    getEnrollmentCount().then(setEnrollmentCount);
  }, [user]);

  const handleWaitlistClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsWaitlistModalOpen(true);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) return;
    setIsJoining(true);
    try {
      await joinWaitlist();
      setHasJoined(true);
      setEnrollmentCount((prev) => (prev !== null ? prev + 1 : prev));
    } catch (err) {
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-ink-base font-sans selection:bg-brand-primary selection:text-bg-base overflow-x-hidden flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 rounded-full blur-[120px]" />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsWaitlistModalOpen(true)}
      />

      {/* Waitlist Modal */}
      <>
        {isWaitlistModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div
              onClick={() => setIsWaitlistModalOpen(false)}
              className="fixed inset-0 bg-bg-base/95 backdrop-blur-md cursor-pointer"
            />
            <div
              className="relative w-full max-w-md liquid-glass p-8 md:p-10 rounded-3xl border-brand-primary/20 z-10 shadow-2xl"
            >
              <CustomButton
                onClick={() => setIsWaitlistModalOpen(false)}
                variant="icon"
                size="none"
                className="absolute top-6 right-6 text-ink-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </CustomButton>

              {!hasJoined && (
                <div className="mb-8">
                  <h3 className="font-display text-3xl font-bold italic mb-3">Pre-Release Exclusive</h3>
                  <p className="text-ink-muted text-sm font-light leading-relaxed">
                    Join the elite circle of prompt engineers. Be the first to receive the{' '}
                    <span className="text-white font-bold italic">TRIO MASTERCLASS</span> and lock in our absolute lowest
                    pre-launch price.
                  </p>
                </div>
              )}

              {!hasJoined ? (
                <div className="space-y-6">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-brand-primary" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest leading-snug">Lock in $0.00 Early Access</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-brand-primary fill-brand-primary" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest leading-snug">First 300 slots only</p>
                    </div>
                  </div>

                  <CustomButton
                    onClick={handleJoinWaitlist}
                    loading={isJoining}
                    variant="ghost"
                    size="none"
                    arrow
                    className="liquid-glass w-full py-5 font-black uppercase tracking-widest hover:border-brand-primary flex items-center justify-center gap-3 rounded-2xl border-white/10"
                  >
                    Join the Waitlist
                  </CustomButton>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h4 className="font-display text-2xl font-bold italic mb-2">Thank You for Joining the waitlist</h4>
                  <p className="text-ink-muted text-xs uppercase tracking-widest font-bold">Priority Status: Confirmed</p>
                  <p className="mt-6 text-ink-muted text-sm font-light">
                    We will notify you the moment we launch. Watch your inbox for the encrypted deployment code.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-white/5 h-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-center relative">
          <Logo size="md" textClassName="font-display font-bold uppercase tracking-tight text-lg" />
        </div>
      </nav>

      <main className="relative flex-grow flex items-center justify-center pt-32 pb-24 px-6">
        <div className="max-w-4xl w-full mx-auto">
          <div
            className="liquid-glass p-8 md:p-12 rounded-[2rem] border-white/10 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left: Ebook Mockup */}
              <div className="w-full lg:w-1/2 perspective-1000 text-white relative">
                {enrollmentCount !== null && (
                  <div
                    className="absolute -top-4 -right-4 z-20 bg-brand-primary text-bg-base px-4 py-2 rounded-full font-display font-black italic text-sm shadow-[0_0_20px_rgba(var(--color-brand-primary),0.4)] flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>{enrollmentCount} ENROLLED</span>
                  </div>
                )}

                <div className="relative transform-gpu group-hover:rotate-y-6 transition-transform duration-700">
                  <div className="absolute -inset-2 bg-linear-to-r from-brand-primary to-brand-secondary rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="aspect-[3/4] bg-linear-to-br from-bg-surface to-bg-base rounded-lg shadow-2xl overflow-hidden flex flex-col justify-between p-8 border border-white/10 relative z-10">
                    <div className="space-y-4">
                      <div className="w-12 h-1 bg-brand-primary/50" />
                      <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter leading-none italic">
                        THE AI <span className="text-brand-primary">TRIO</span>
                        <br />
                        MASTERCLASS
                      </h1>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-brand-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-50">Edition 2026</p>
                    </div>

                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 rotate-90 opacity-10">
                      <span className="text-[40px] font-black text-white/5 uppercase tracking-tighter italic">CONSULT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Product Details */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter italic leading-[0.9] text-white">
                    THE AI <span className="text-brand-primary">TRIO MASTERCLASS</span>
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-display font-bold italic text-white">$0.00</span>
                    <span className="text-ink-muted line-through text-lg font-light">$19.99</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-black uppercase rounded tracking-widest border border-green-500/30">
                      100% OFF
                    </span>
                  </div>
                </div>

                <p className="text-ink-muted leading-relaxed font-light text-sm italic border-l-2 border-brand-primary/30 pl-4">
                  The ultimate speed-guide to ChatGPT, Claude, and Gemini. Know exactly which AI to use, when to use it, and
                  how to prompt with zero wasted tokens.
                </p>

                <ul className="space-y-4">
                  {[
                    'THE BIG 3 SHOWDOWN: ChatGPT vs. Claude vs. Gemini',
                    'DECISION LOGIC: Know exactly which model wins every task',
                    '50+ MICRO-PROMPTS: Copy-paste formulas that save tokens',
                    'ZERO-WASTE PROMPTING: Maximize outputs, minimize costs',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white">
                      <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wide italic">{item}</span>
                    </li>
                  ))}
                </ul>

                <CustomButton
                  onClick={handleWaitlistClick}
                  variant="ghost"
                  size="none"
                  className="w-full liquid-glass group relative py-4 font-black uppercase tracking-widest rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border-brand-primary/40 hover:border-brand-primary"
                >
                  <span>Join the Waitlist</span>
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
