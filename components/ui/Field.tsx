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
        className="field-input mt-2 block min-h-11 w-full border-[1.5px] border-ink bg-paper px-4 py-2 font-mono text-base text-ink disabled:border-dashed aria-invalid:border-[3px]"
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

/** A native checkbox drawn as "[ ]" / "[X]" (the X draws in); the input stays in the a11y tree. */
export function Checkbox({ id, children, className = "", ...input }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`group flex min-h-11 cursor-pointer items-start gap-3 py-2 has-disabled:cursor-not-allowed ${className}`}
    >
      <input id={id} type="checkbox" className="peer sr-only" {...input} />
      <span
        aria-hidden="true"
        className="check-mark shrink-0 font-bold whitespace-pre peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink"
      >
        [<span className="mark-x">{"X"}</span>]
      </span>
      <span className="peer-disabled:underline peer-disabled:decoration-dashed">{children}</span>
    </label>
  );
}
