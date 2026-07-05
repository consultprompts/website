import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, LogOut, KeyRound, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestPasswordReset } from '../../lib/api';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordEmailSent, setPasswordEmailSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleChangePassword = async () => {
    if (!user) return;
    setSendingReset(true);
    try {
      await requestPasswordReset(user.email);
    } catch {
      // Don't reveal whether email exists
    } finally {
      setPasswordEmailSent(true);
      setSendingReset(false);
    }
  };

  const handleClose = () => {
    setPasswordEmailSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[155] bg-transparent cursor-pointer"
          />
          <div className="fixed inset-0 z-[160] flex items-end justify-center p-6 md:items-start md:justify-end md:p-24 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm liquid-glass border-brand-primary/20 pointer-events-auto shadow-2xl p-8 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-bg-base font-black text-xl">
                  {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display font-bold italic">{user.displayName || 'Prophet'}</h4>
                  <p className="text-xs text-ink-muted tracking-widest uppercase">{user.roles.join(' / ') || 'member'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Profile section */}
                <div className="rounded-xl bg-white/5 p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted">Profile</p>
                  <p className="text-sm font-light text-white/80 truncate">{user.email}</p>
                  {passwordEmailSent ? (
                    <p className="text-xs text-brand-primary font-bold uppercase tracking-widest">
                      Reset link sent — check your inbox
                    </p>
                  ) : (
                    <button
                      onClick={handleChangePassword}
                      disabled={sendingReset}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-muted hover:text-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {sendingReset ? 'Sending...' : 'Change Password'}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    navigate('/my-projects');
                    handleClose();
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest cursor-pointer rounded-xl"
                >
                  <FolderOpen className="w-4 h-4" /> My Projects
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate('/admin-console');
                      handleClose();
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-brand-primary hover:text-bg-base transition-all font-bold text-xs uppercase tracking-widest cursor-pointer rounded-xl"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Console
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    handleClose();
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest cursor-pointer rounded-xl"
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
