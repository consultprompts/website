import React, { forwardRef } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export type CustomButtonVariant = 'filled' | 'outline' | 'ghost' | 'icon';
export type CustomButtonSize = 'sm' | 'md' | 'lg' | 'none';

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CustomButtonVariant;
  /** Preset layout/padding/text-size/rounding. Use 'none' to fully control layout & sizing via className. */
  size?: CustomButtonSize;
  /** Appends an arrow icon after the button's content. */
  arrow?: boolean;
  /** Destructive (red) treatment, e.g. logout/delete actions. Overrides variant colors. */
  destructive?: boolean;
  /** Shows a spinner in place of children and disables the button. */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<CustomButtonVariant, string> = {
  filled: 'bg-brand-primary text-bg-base border border-transparent hover:shadow-[0_0_30px_color-mix(in_srgb,var(--color-brand-primary)_40%,transparent)]',
  outline: 'bg-transparent border text-white border-white/30 hover:border-white/50',
  ghost: 'bg-transparent text-white',
  icon: 'bg-transparent text-white rounded-full',
};

// Own layout (display/flex/justify/gap) as well as spacing, so size="none" can opt
// a caller out entirely and drive layout purely through className without fighting
// for utility precedence against a base class.
const SIZE_CLASSES: Record<CustomButtonSize, string> = {
  sm: 'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs rounded-lg',
  md: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-xl',
  lg: 'inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base rounded-xl',
  none: '',
};

const ICON_SIZE_CLASSES: Record<CustomButtonSize, string> = {
  sm: 'inline-flex items-center justify-center w-8 h-8 rounded-full',
  md: 'inline-flex items-center justify-center w-9 h-9 rounded-full',
  lg: 'inline-flex items-center justify-center w-11 h-11 rounded-full',
  none: '',
};

const DESTRUCTIVE_CLASSES = 'border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white';

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(function CustomButton(
  { variant = 'filled', size = 'md', arrow = false, destructive = false, loading = false, disabled, className = '', children, ...rest },
  ref
) {
  const variantClasses = destructive ? DESTRUCTIVE_CLASSES : VARIANT_CLASSES[variant];
  const sizeClasses = variant === 'icon' ? ICON_SIZE_CLASSES[size] : SIZE_CLASSES[size];

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses} ${sizeClasses} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {children}
          {arrow && <ArrowRight className="w-4 h-4" />}
        </>
      )}
    </button>
  );
});

export default CustomButton;
