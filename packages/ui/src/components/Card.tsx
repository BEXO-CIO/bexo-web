import * as React from 'react';
import { colors, radius, shadows, spacing, typography } from '../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'filled' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<NonNullable<CardProps['variant']>, React.CSSProperties> = {
  default: {
    backgroundColor: colors.ivory,
    border: `1px solid ${colors.sand[300]}`,
    boxShadow: shadows.sm,
  },
  elevated: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.sand[200]}`,
    boxShadow: shadows.md,
  },
  filled: {
    backgroundColor: colors.sand[100],
    border: `1px solid ${colors.sand[200]}`,
    boxShadow: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.sand[300]}`,
    boxShadow: 'none',
  },
};

const paddingMap: Record<NonNullable<CardProps['padding']>, string> = {
  none: '0',
  sm:   spacing[4],
  md:   spacing[6],
  lg:   spacing[8],
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        borderRadius: radius.xl,
        padding: paddingMap[padding],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

// ── Card sub-components ───────────────────────────────────────────────────────

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: string;
}

export function CardHeader({ title, subtitle, action, badge, style, ...props }: CardHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing[3],
        marginBottom: spacing[4],
        ...style,
      }}
      {...props}
    >
      <div>
        {badge && (
          <span
            style={{
              display: 'inline-block',
              padding: '0.2rem 0.6rem',
              backgroundColor: `${colors.terracotta[500]}15`,
              color: colors.terracotta[500],
              borderRadius: radius.full,
              fontSize: typography.scale.xs,
              fontWeight: typography.weight.semibold,
              fontFamily: typography.fontSans,
              textTransform: 'uppercase',
              letterSpacing: typography.tracking.wider,
              marginBottom: spacing[2],
            }}
          >
            {badge}
          </span>
        )}
        <h3
          style={{
            fontFamily: typography.fontSerif,
            fontSize: typography.scale.xl,
            fontWeight: typography.weight.semibold,
            color: colors.brown[900],
            lineHeight: typography.leading.tight,
            margin: 0,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontFamily: typography.fontSans,
              fontSize: typography.scale.sm,
              color: colors.warmGray[600],
              marginTop: spacing[1],
              lineHeight: typography.leading.normal,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

export function CardDivider({ style, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${colors.sand[300]}`,
        margin: `${spacing[4]} 0`,
        ...style,
      }}
      {...props}
    />
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────

export type BadgeColor = 'terracotta' | 'sage' | 'sand' | 'amber';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const badgeColors: Record<BadgeColor, React.CSSProperties> = {
  terracotta: { backgroundColor: '#FDF0EB', color: colors.terracotta[500], border: `1px solid #ECD9C4` },
  sage:       { backgroundColor: '#EEF6EE', color: colors.sage[700],       border: `1px solid ${colors.sage[100]}` },
  sand:       { backgroundColor: colors.sand[100], color: colors.brown[600], border: `1px solid ${colors.sand[300]}` },
  amber:      { backgroundColor: '#FEF3C7', color: '#92400E',              border: '1px solid #FDE68A' },
};

export function Badge({ color = 'sand', children, style, ...props }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        borderRadius: radius.full,
        fontFamily: typography.fontSans,
        fontSize: typography.scale.xs,
        fontWeight: typography.weight.medium,
        lineHeight: 1.4,
        ...badgeColors[color],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
