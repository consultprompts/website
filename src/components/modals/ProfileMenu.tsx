import React from 'react';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../ui/CustomButton';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {isOpen && user && (
        <>
          <div
            onClick={onClose}
            className="fixed inset-0 z-[155] bg-transparent cursor-pointer"
          />
          <div className="fixed inset-0 z-[160] flex items-end justify-center p-6 md:items-start md:justify-end md:p-24 overflow-hidden pointer-events-none">
            <div
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
                <CustomButton
                  onClick={() => {
                    navigate('/settings/my-projects');
                    onClose();
                  }}
                  variant="ghost"
                  size="none"
                  className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest rounded-xl"
                >
                  <SettingsIcon className="w-4 h-4" /> Console
                </CustomButton>

                <CustomButton
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  destructive
                  size="none"
                  className="w-full flex items-center gap-3 p-4 transition-all font-bold text-xs uppercase tracking-widest rounded-xl"
                >
                  <LogOut className="w-4 h-4" /> Logout Signal
                </CustomButton>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
