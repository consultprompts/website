import React from 'react';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettingsNavigate } from '../../hooks';
import CustomButton from '../ui/CustomButton';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Underline that grows from the center outward on hover (brand primary).
const MENU_ITEM_CLASSES =
  'w-full flex items-center justify-start gap-2 px-4 py-3 text-sm rounded-xl relative after:content-[""] after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-brand-primary after:origin-center after:scale-x-0 after:transition-transform after:duration-500 hover:after:scale-x-100';

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, logout, loading, isAdmin } = useAuth();
  const navigate = useSettingsNavigate();

  if (!user) return null;

  return (
    <>
      {/* Click-away backdrop starts below the navbar so its buttons stay
          clickable while the menu is open. */}
      {isOpen && (
        <div onClick={onClose} className="fixed top-14.5 inset-x-0 bottom-0 z-[105] bg-transparent cursor-pointer"/>
      )}
      {/* Compact dropdown anchored to the profile icon (relative wrapper in
          Navbar) so its left edge always sits directly below the icon,
          rather than a full-height drawer flush to the viewport edge.
          Always mounted so the open/close can animate both directions;
          closed state is scaled down and non-interactive. Kept under
          z-[120] so the settings overlay covers it — the menu stays open
          through the navigation and Navbar closes it once /settings is
          active, so the close never plays in view. */}
      <div
        style={{ clipPath: isOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }}
        className={`absolute top-full left-0 mt-4 z-[110] w-[240px] rounded-2xl border border-white/5 bg-bg-base/95 md:backdrop-blur-md p-6 overflow-hidden transition-[clip-path] duration-300 ease-in-out ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
          <div className="flex items-center gap-4 mb-2 ml-4">
            <div>
              <h4 className="font-display text-lg font-bold italic">
                {user.displayName || 'Prophet'}
              </h4>
              <p className="text-xs text-ink-muted tracking-widest uppercase">
                {user.roles.join(' / ') || 'member'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <CustomButton onClick={() => {navigate('/settings/my-projects'); onClose();}} variant="ghost" size="none" className={MENU_ITEM_CLASSES} tabIndex={isOpen ? 0 : -1}>
              Settings
            </CustomButton>

            {user && isAdmin && (
              <CustomButton onClick={() => {navigate('/admin-settings/agency'); onClose();}} variant="ghost" size="none" className={MENU_ITEM_CLASSES} tabIndex={isOpen ? 0 : -1}>
                Admin Settings
              </CustomButton>
            )}

            <CustomButton
              onClick={() => {onClose(); logout();}} variant="ghost" size="none" className={MENU_ITEM_CLASSES} tabIndex={isOpen ? 0 : -1}>
              <LogOut className="w-5 h-5" /> Logout Signal
            </CustomButton>
          </div>
      </div>
    </>
  );
}
