"use client";

import { forwardRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  /** Browser autofill hint, e.g. "current-password" or "new-password". */
  autoComplete?: string;
}

/**
 * Password input with a built-in show/hide toggle so users can verify what
 * they typed. Shares the lock-icon + rounded-input styling used across the
 * auth surfaces (sign in, sign up, reset password).
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    { value, onChange, placeholder = "Password", required = false, minLength, autoComplete },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Icon
          name="lock"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant/50"
        />
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-outline-variant/60 bg-surface py-3 pl-12 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-0"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant/50 transition-colors hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Icon name={visible ? "visibility_off" : "visibility"} className="text-[18px]" />
        </button>
      </div>
    );
  },
);
