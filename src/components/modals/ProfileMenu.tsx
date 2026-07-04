import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export default function ProfileMenu({ isOpen, onClose, onOpenAdmin }: ProfileMenuProps) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[155] bg-transparent cursor-pointer"
          />
          <div className="fixed inset-0 z-[160] flex items-end justify-center p-6 md:items-start md:justify-end md:p-24 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm liquid-glass border-brand-primary/20 pointer-events-auto shadow-2xl p-8 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-bg-base font-black text-xl">
                  {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display font-bold italic">{user.displayName || 'Prophet'}</h4>
                  <p className="text-xs text-ink-muted tracking-widest uppercase">{user.roles.join(' / ') || 'member'}</p>
                </div>
              </div>
              <div className="space-y-4">
                {isAdmin && (
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-brand-primary hover:text-bg-base transition-all font-bold text-xs uppercase tracking-widest cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Console
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log Out Signal
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
