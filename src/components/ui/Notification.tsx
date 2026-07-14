import React from 'react';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks';
import CustomButton from './CustomButton';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Action buttons (links, WhatsApp CTA, etc.), stacked below the description. */
  children?: React.ReactNode;
}

/**
 * Shared popup for surfacing an outcome the user needs to notice and act on
 * — "you already have a project in flight," "we got your submission" — as
 * opposed to page content. Centered, backdrop-dismissible, locks page scroll
 * while open.
 */
export default function Notification({ isOpen, onClose, icon, title, description, children }: NotificationProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm cursor-pointer"
      />
      <div className="relative w-full max-w-md liquid-glass rounded-xl p-8 md:p-10 text-center z-10">
        <CustomButton
          onClick={onClose}
          aria-label="Dismiss"
          variant="icon"
          size="none"
          className="absolute top-5 right-5 text-ink-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </CustomButton>

        {icon && (
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            {icon}
          </div>
        )}

        <h3 className="font-display text-2xl font-bold italic mb-3">{title}</h3>
        {description && (
          <p className="text-ink-muted text-sm font-light leading-relaxed mb-8">{description}</p>
        )}

        {children && <div className="flex flex-col gap-3">{children}</div>}
      </div>
    </div>
  );
}
