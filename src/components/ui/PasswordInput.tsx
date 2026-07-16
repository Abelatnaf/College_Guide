"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Password field with a lock icon and a show/hide toggle. Visibility is local to each instance. */
export function PasswordInput({
  value,
  onChange,
  placeholder,
  required = true,
  minLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Icon
        name="lock"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant/50"
      />
      <input
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-outline-variant/60 bg-surface py-3 pl-12 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-0"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 transition-colors hover:text-on-surface-variant"
      >
        <Icon name={visible ? "visibility_off" : "visibility"} className="text-[20px]" />
      </button>
    </div>
  );
}
