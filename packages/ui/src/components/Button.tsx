import * as React from 'react';
import { colors, typography, radius, shadows } from '../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.terracotta[500],
    color: colors.cream,
    border: `1px solid ${colors.terracotta[600]}`,
    boxShadow: shadows.sm,
  },
  secondary: {
    backgroundColor: colors.sand[100],
    color: colors.brown[700],
    border: `1px solid ${colors.sand[300]}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.brown[600],
    border: '1px solid transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.terracotta[500],
    border: `1px solid ${colors.terracotta[500]}`,
  },
  destructive: {
    backgroundColor: '#D32F2F',
    color: colors.white,
    border: '1px solid #B71C1C',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '0.375rem 0.875rem',
    fontSize: typography.scale.xs,
    borderRadius: radius.md,
    minHeight: 32,
  },
  md: {
    padding: '0.625rem 1.25rem',
    fontSize: typography.scale.sm,
    borderRadius: radius.lg,
    minHeight: 40,
  },
  lg: {
    padding: '0.875rem 1.75rem',
    fontSize: typography.scale.base,
    borderRadius: radius.lg,
    minHeight: 48,
  },
};

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        animation: 'bexo-spin 0.7s linear infinite',
      }}
    />
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontFamily: typography.fontSans,
      fontWeight: typography.weight.medium,
      letterSpacing: typography.tracking.normal,
      lineHeight: 1,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.45 : 1,
      transition: 'background-color 150ms, opacity 150ms, transform 100ms',
      outline: 'none',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      width: fullWidth ? '100%' : undefined,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    return (
      <>
        {/* Inject spin keyframes once */}
        <style>{`@keyframes bexo-spin { to { transform: rotate(360deg); } }`}</style>
        <button ref={ref} disabled={isDisabled} style={baseStyle} {...props}>
          {loading && <Spinner />}
          {!loading && leftIcon}
          {children}
          {!loading && rightIcon}
        </button>
      </>
    );
  },
);

Button.displayName = 'Button';
