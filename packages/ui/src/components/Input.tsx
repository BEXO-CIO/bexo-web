import * as React from 'react';
import { colors, typography, radius } from '../tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      leftAdornment,
      rightAdornment,
      fullWidth = true,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorText);

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      width: fullWidth ? '100%' : undefined,
    };

    const inputWrapStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      backgroundColor: colors.white,
      border: `1px solid ${hasError ? '#D32F2F' : colors.sand[300]}`,
      borderRadius: radius.lg,
      overflow: 'hidden',
      transition: 'border-color 150ms, box-shadow 150ms',
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      padding: '0.625rem 1rem',
      paddingLeft: leftAdornment ? '0.5rem' : '1rem',
      paddingRight: rightAdornment ? '0.5rem' : '1rem',
      fontFamily: typography.fontSans,
      fontSize: typography.scale.sm,
      fontWeight: typography.weight.regular,
      color: colors.brown[900],
      backgroundColor: 'transparent',
      outline: 'none',
      border: 'none',
      lineHeight: 1.5,
      ...style,
    };

    const labelStyle: React.CSSProperties = {
      fontFamily: typography.fontSans,
      fontSize: typography.scale.sm,
      fontWeight: typography.weight.medium,
      color: colors.brown[900],
      lineHeight: 1,
    };

    const helperStyle: React.CSSProperties = {
      fontFamily: typography.fontSans,
      fontSize: typography.scale.xs,
      color: hasError ? '#D32F2F' : colors.warmGray[400],
      lineHeight: 1.4,
    };

    const adornmentStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.75rem',
      color: colors.warmGray[400],
      userSelect: 'none',
      flexShrink: 0,
    };

    return (
      <div style={containerStyle}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <div
          style={inputWrapStyle}
          onFocus={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = hasError ? '#D32F2F' : colors.terracotta[500];
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${hasError ? '#D32F2F' : colors.terracotta[500]}20`;
          }}
          onBlur={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = hasError ? '#D32F2F' : colors.sand[300];
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
        >
          {leftAdornment && <span style={adornmentStyle}>{leftAdornment}</span>}
          <input ref={ref} id={inputId} style={inputStyle} {...props} />
          {rightAdornment && <span style={adornmentStyle}>{rightAdornment}</span>}
        </div>
        {(helperText || errorText) && (
          <p style={helperStyle}>{errorText ?? helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ── Textarea variant ──────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  charLimit?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, errorText, fullWidth = true, charLimit, id, value, style, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorText);
    const currentLen = typeof value === 'string' ? value.length : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: fullWidth ? '100%' : undefined }}>
        {(label || charLimit) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            {label && (
              <label
                htmlFor={inputId}
                style={{ fontFamily: typography.fontSans, fontSize: typography.scale.sm, fontWeight: typography.weight.medium, color: colors.brown[900] }}
              >
                {label}
              </label>
            )}
            {charLimit && (
              <span style={{ fontFamily: typography.fontSans, fontSize: typography.scale.xs, color: currentLen > charLimit ? '#D32F2F' : colors.warmGray[400] }}>
                {currentLen}/{charLimit}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          style={{
            width: '100%',
            padding: '0.625rem 1rem',
            fontFamily: typography.fontSans,
            fontSize: typography.scale.sm,
            color: colors.brown[900],
            backgroundColor: colors.white,
            border: `1px solid ${hasError ? '#D32F2F' : colors.sand[300]}`,
            borderRadius: radius.lg,
            outline: 'none',
            resize: 'vertical',
            lineHeight: typography.leading.relaxed,
            transition: 'border-color 150ms, box-shadow 150ms',
            ...style,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = colors.terracotta[500];
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.terracotta[500]}20`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = hasError ? '#D32F2F' : colors.sand[300];
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />
        {(helperText || errorText) && (
          <p style={{ fontFamily: typography.fontSans, fontSize: typography.scale.xs, color: hasError ? '#D32F2F' : colors.warmGray[400] }}>
            {errorText ?? helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
