import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, mode, onModeChange, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (mode === 'signup') {
        await register(email, password);
        // Backend requires email verification before first login
        setVerificationSent(true);
      } else {
        await login(email, password);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVerificationSent(false);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto flex items-start md:items-center justify-center p-4 md:p-6 py-12 md:py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-bg-base/95 backdrop-blur-md cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm liquid-glass p-6 md:p-10 rounded-xl border-brand-primary/30 z-10 my-auto"
          >
            {verificationSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MailCheck className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold italic mb-2">Check Your Inbox</h3>
                <p className="text-ink-muted text-sm font-light leading-relaxed mb-8">
                  We sent a verification link to your email. Verify your account, then come back and log in.
                </p>
                <button
                  onClick={() => {
                    setVerificationSent(false);
                    onModeChange('login');
                  }}
                  className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors cursor-pointer"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <UserIcon className="w-6 h-6 md:w-8 md:h-8 text-brand-primary" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold italic mb-1 md:mb-2 tracking-tight">
                    {mode === 'login' ? 'Welcome Back' : 'Join the Agency'}
                  </h3>
                  <p className="text-ink-muted text-xs md:text-sm font-light">
                    {mode === 'login' ? 'Enter credentials to continue.' : 'Create account to request mockup.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">Email</label>
                    <input
                      required
                      name="email"
                      type="email"
                      className="w-full bg-white/5 border border-white/10 p-2.5 md:p-3 font-light focus:border-brand-primary outline-none transition-colors text-sm rounded-xl"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">Password</label>
                    <div className="relative">
                      <input
                        required
                        name="password"
                        minLength={8}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full bg-white/5 border border-white/10 p-2.5 md:p-3 font-light focus:border-brand-primary outline-none transition-colors text-sm pr-10 rounded-xl"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest text-center">{error}</p>
                  )}

                  <button
                    disabled={isSubmitting}
                    className="liquid-glass w-full py-3.5 md:py-4 text-white font-black uppercase tracking-widest hover:border-brand-primary/50 disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl border-white/10 relative group cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Access' : 'Register'}
                    </span>
                  </button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
                    className="text-xs text-ink-muted hover:text-brand-primary font-bold uppercase tracking-widest border-b border-white/10 pb-1 cursor-pointer"
                  >
                    {mode === 'login' ? 'New here? Sign Up' : 'Registered? Login'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
