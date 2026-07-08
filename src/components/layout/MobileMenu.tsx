import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProject: () => void;
  onOpenAuth: () => void;
}

const NAV_LINKS = [
  { href: '#process', label: 'Process' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#reviews', label: 'Results' },
  { href: '#faq', label: 'Faq' },
  { href: '#contact', label: 'Contact' },
];

export default function MobileMenu({ isOpen, onClose, onStartProject, onOpenAuth }: MobileMenuProps) {
  const { user, logout } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[150] bg-bg-base p-8 flex flex-col overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-12 flex-shrink-0">
            <Logo textClassName="font-display font-bold uppercase text-xl" />
            <button onClick={onClose} className="cursor-pointer">
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="flex flex-col gap-8 text-2xl font-display font-bold italic">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={onClose} className="hover:text-brand-primary cursor-pointer">
                {link.label}
              </a>
            ))}
            {user && (
              <Link
                to="/settings"
                onClick={onClose}
                className="text-brand-primary uppercase cursor-pointer"
              >
                CONSOLE
              </Link>
            )}
          </div>

          <div className="mt-auto space-y-6">
            {user ? (
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => {
                    onStartProject();
                    onClose();
                  }}
                  className="liquid-glass w-full py-5 text-white font-black uppercase tracking-widest rounded-xl border-brand-primary/20 relative group cursor-pointer"
                >
                  <span className="relative z-10">START YOUR PROJECT</span>
                </button>
                <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-ink-muted text-center uppercase tracking-widest">{user.email}</p>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="liquid-glass w-full py-4 text-white font-bold uppercase tracking-widest rounded-xl border-white/10 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenAuth();
                    onClose();
                  }}
                  className="liquid-glass w-full py-4 text-white font-bold uppercase tracking-widest rounded-xl border-white/10 cursor-pointer"
                >
                  Sign up
                </button>
                <button
                  onClick={() => {
                    onStartProject();
                    onClose();
                  }}
                  className="liquid-glass w-full py-5 text-white font-black uppercase tracking-widest rounded-xl border-brand-primary/20 relative group cursor-pointer"
                >
                  <span className="relative z-10">START YOUR PROJECT</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
