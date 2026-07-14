import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../lib/api';
import CustomButton from '../components/ui/CustomButton';

type State = 'idle' | 'submitting' | 'success';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [state, setState] = useState<State>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setState('submitting');
    try {
      await resetPassword(token, password);
      setState('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setState('idle');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
        <div className="liquid-glass max-w-sm w-full p-10 rounded-xl border-brand-primary/30 text-center">
          <p className="text-ink-muted text-sm font-light mb-6">Invalid or missing reset link.</p>
          <Link to="/" className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
      <div className="liquid-glass max-w-sm w-full p-10 rounded-xl border-brand-primary/30">
        {state === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-brand-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold italic mb-2">Password Updated</h2>
            <p className="text-ink-muted text-sm font-light mb-8">You can now log in with your new password.</p>
            <Link to="/" className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold italic mb-2">Reset Password</h2>
              <p className="text-ink-muted text-sm font-light">Choose a new password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">New Password</label>
                <div className="relative">
                  <input
                    required
                    name="password"
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 p-3 font-light focus:border-brand-primary outline-none transition-colors text-sm pr-10 rounded-xl"
                    placeholder="••••••••"
                  />
                  <CustomButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="icon"
                    size="none"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </CustomButton>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">Confirm Password</label>
                <input
                  required
                  name="confirm"
                  minLength={8}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white/5 border border-white/10 p-3 font-light focus:border-brand-primary outline-none transition-colors text-sm rounded-xl"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest text-center">{error}</p>
              )}

              <CustomButton
                loading={state === 'submitting'}
                variant="ghost"
                size="none"
                className="liquid-glass w-full py-4 font-black uppercase tracking-widest hover:border-brand-primary/50 flex items-center justify-center gap-2 rounded-xl border-white/10"
              >
                Set New Password
              </CustomButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
