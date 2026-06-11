'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

/**
 * Canonical field-control styling (redesign spec §4.4).
 *
 * One field system for the whole site. `Input` and `Textarea` live here;
 * `forms/Select`, `forms/DatePicker` and `forms/Textarea` reuse `fieldControlClass`
 * so every control shares the same border, focus ring and radius.
 *
 * - Control: surface bg, 1.5px strong border, 6px radius, 12px/16px padding,
 *   min-height 48px, base font.
 * - Focus: gold-dark border + 4px soft-gold ring, no default outline.
 * - Invalid: danger border.
 */
export const fieldControlClass =
  'block w-full min-w-0 max-w-full rounded-sm border-[1.5px] border-line-strong bg-surface px-4 py-3 text-base text-ink min-h-[48px] ' +
  'placeholder:text-ink-muted transition-colors ' +
  'focus:outline-none focus:border-anchor-gold-dark focus:shadow-[0_0_0_4px_rgba(139,105,20,0.12)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

/** Applied to the control when the field is in an invalid state. */
export const fieldInvalidClass = 'border-anchor-danger focus:border-anchor-danger'

const labelClass = 'block text-sm font-semibold font-sans text-ink-strong mb-2'
const hintClass = 'mt-1.5 text-xs text-ink-muted'
const hintInvalidClass = 'mt-1.5 text-xs text-anchor-danger'

/**
 * Resolve the backward-compatible `error` prop (string or boolean) plus the
 * canonical `invalid` / `hint` props into a single { invalid, hint } pair.
 * `error` string → invalid + hint message. `error` boolean → invalid only.
 * `helperText` is a deprecated alias for `hint`.
 */
function resolveFieldState(opts: {
  error?: string | boolean
  invalid?: boolean
  hint?: React.ReactNode
  helperText?: React.ReactNode
}): { invalid: boolean; hint?: React.ReactNode } {
  const errorIsMessage = typeof opts.error === 'string' && opts.error.length > 0
  const invalid = Boolean(opts.invalid) || opts.error === true || errorIsMessage
  const hint = errorIsMessage ? opts.error : (opts.hint ?? opts.helperText)
  return { invalid, hint }
}

// Deprecated visual props kept only so legacy call sites keep compiling.
// They are no-ops: every control now renders the single canonical style.
type DeprecatedVisualProps = {
  /** @deprecated single canonical style — no longer affects rendering */
  variant?: 'default' | 'error' | 'success'
  /** @deprecated single canonical style — no longer affects rendering */
  size?: 'sm' | 'md' | 'lg'
}

export interface InputProps
  extends BaseComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'>,
    DeprecatedVisualProps {
  label?: string
  /** Helper/hint text below the control; rendered in danger colour when invalid. */
  hint?: React.ReactNode
  /** Marks the field invalid (danger border + danger hint). */
  invalid?: boolean
  /** @deprecated use `hint` */
  helperText?: React.ReactNode
  /** Backward alias: string sets an invalid hint message; boolean toggles invalid. */
  error?: string | boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant: _variant,
      size: _size,
      label,
      hint,
      invalid,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      testId,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const { invalid: isInvalid, hint: hintNode } = resolveFieldState({ error, invalid, hint, helperText })
    const isNativeDateTimeInput =
      props.type === 'date' ||
      props.type === 'time' ||
      props.type === 'datetime-local' ||
      props.type === 'month'

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        )}

        <div className={cn('relative w-full min-w-0', isNativeDateTimeInput && 'overflow-hidden rounded-sm')}>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{leftIcon}</div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              fieldControlClass,
              isInvalid && fieldInvalidClass,
              isNativeDateTimeInput && 'appearance-none text-left',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            data-native-date-time={isNativeDateTimeInput ? 'true' : undefined}
            data-testid={testId}
            aria-invalid={isInvalid || undefined}
            aria-describedby={hintNode ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">{rightIcon}</div>
          )}
        </div>

        {hintNode && (
          <p id={`${inputId}-hint`} className={isInvalid ? hintInvalidClass : hintClass}>
            {hintNode}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps
  extends BaseComponentProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
    DeprecatedVisualProps {
  label?: string
  hint?: React.ReactNode
  invalid?: boolean
  /** @deprecated use `hint` */
  helperText?: React.ReactNode
  error?: string | boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant: _variant,
      size: _size,
      label,
      hint,
      invalid,
      helperText,
      error,
      id,
      testId,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const { invalid: isInvalid, hint: hintNode } = resolveFieldState({ error, invalid, hint, helperText })

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={textareaId} className={labelClass}>
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(fieldControlClass, isInvalid && fieldInvalidClass, 'resize-y min-h-[100px]', className)}
          data-testid={testId}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hintNode ? `${textareaId}-hint` : undefined}
          {...props}
        />

        {hintNode && (
          <p id={`${textareaId}-hint`} className={isInvalid ? hintInvalidClass : hintClass}>
            {hintNode}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
