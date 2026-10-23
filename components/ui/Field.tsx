import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  hint?: string;
  /** Complete message, starting with the localized word for "Error". */
  error?: string;
}

/** Labelled text input. Errors are words plus a heavier frame, never colour. */
export function TextField({ id, label, hint, error, className = "", ...input }: TextFieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label block">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="mt-2 block min-h-11 w-full border-2 border-ink bg-paper px-3 py-2 font-mono text-base text-ink disabled:border-dashed aria-invalid:border-4"
        {...input}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="label mt-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  children: React.ReactNode;
}

/** A native checkbox drawn as "[ ]" / "[X]"; the input stays in the a11y tree. */
export function Checkbox({ id, children, className = "", ...input }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`group flex min-h-11 cursor-pointer items-start gap-3 py-2 has-disabled:cursor-not-allowed ${className}`}
    >
      <input id={id} type="checkbox" className="peer sr-only" {...input} />
      <span
        aria-hidden="true"
        className="check-mark shrink-0 font-bold group-hover:bg-ink group-hover:text-paper peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink peer-disabled:group-hover:bg-paper peer-disabled:group-hover:text-ink"
      />
      <span className="peer-disabled:underline peer-disabled:decoration-dashed">{children}</span>
    </label>
  );
}
