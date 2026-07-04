import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitLead } from '../../lib/api';

interface MockupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: string;
  onPackageChange: (pkg: string) => void;
}

export default function MockupModal({ isOpen, onClose, selectedPackage, onPackageChange }: MockupModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await submitLead({
        name: formData.get('name') as string,
        email: (formData.get('email') as string) || user?.email || '',
        business: formData.get('business') as string,
        message: formData.get('message') as string,
        package: formData.get('package') as string,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-start md:items-center justify-center p-4 md:p-6 py-12 md:py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg liquid-glass p-8 md:p-12 rounded-xl brutalist-border z-10 my-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-ink-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {!submitted ? (
              <>
                <div className="mb-8">
                  <h3 className="font-display text-3xl font-bold italic mb-2">Claim Your Spot</h3>
                  <p className="text-ink-muted text-sm font-light">
                    Tell us about your business. We'll build the vision for free.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary block">Company Name</label>
                    <input
                      required
                      defaultValue={user?.displayName || ''}
                      name="name"
                      type="text"
                      className="w-full bg-white/5 border border-white/10 p-4 font-light focus:border-brand-primary outline-none transition-colors rounded-xl"
                      placeholder="Agency Name / Business LLC"
                    />
                  </div>
                  <div className="space-y-2 hidden">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary block">Work Email</label>
                    <input
                      required
                      defaultValue={user?.email || ''}
                      name="email"
                      type="email"
                      className="w-full bg-white/5 border border-white/10 p-4 font-light focus:border-brand-primary outline-none transition-colors rounded-xl"
                      placeholder="filip@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary block">Business Type</label>
                    <input
                      required
                      name="business"
                      type="text"
                      className="w-full bg-white/5 border border-white/10 p-4 font-light focus:border-brand-primary outline-none transition-colors rounded-xl"
                      placeholder="Nail Salon / Local Service"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary block">Select Your Package</label>
                    <div className="relative">
                      <select
                        required
                        name="package"
                        value={selectedPackage}
                        onChange={(e) => onPackageChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 font-light focus:border-brand-primary outline-none transition-colors appearance-none cursor-pointer pr-12 rounded-xl"
                      >
                        <option value="facelift" className="bg-bg-surface">Digital Face-Lift ($299)</option>
                        <option value="visibility" className="bg-bg-surface">Visibility Booster ($499)</option>
                        <option value="growth" className="bg-bg-surface">Auto-Pilot Growth ($699)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-primary block">Message (Optional)</label>
                    <textarea
                      name="message"
                      className="w-full bg-white/5 border border-white/10 p-4 font-light focus:border-brand-primary outline-none transition-colors h-24 resize-none rounded-xl"
                      placeholder="Give us a head start..."
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest text-center">{error}</p>
                  )}

                  <button
                    disabled={isSubmitting}
                    className="liquid-glass w-full py-4 text-white font-black uppercase tracking-widest hover:border-brand-primary transition-all flex items-center justify-center gap-2 rounded-xl border-white/10 relative group cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-brand-primary" />
                </div>
                <h3 className="font-display text-3xl font-bold italic mb-4">Transmission Received</h3>
                <p className="text-ink-muted leading-relaxed font-light mb-8">
                  We're already analyzing your business DNA. Expect your mockup within 24-48 hours.
                </p>

                <div className="flex flex-col gap-4 items-center">
                  <a
                    href="https://wa.me/13026622736"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-green-500 text-bg-base font-black uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-center gap-2 rounded-lg cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                  </a>

                  <button
                    onClick={handleClose}
                    className="text-xs font-bold uppercase tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary hover:border-white transition-colors cursor-pointer"
                  >
                    Back Home
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
