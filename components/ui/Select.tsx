import type { SelectHTMLAttributes } from "react";

export interface SelectGroup<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
}

interface SelectProps<T extends string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "onChange" | "value"
> {
  id: string;
  label: string;
  value: T;
  groups: readonly SelectGroup<T>[];
  onChange: (value: T) => void;
}

/**
 * A native select in the field frame, with a drawn chevron. Native, so the
 * option list, typeahead and screen-reader behaviour are the platform's own.
 */
export function Select<T extends string>({
  id,
  label,
  value,
  groups,
  onChange,
  className = "",
  ...rest
}: SelectProps<T>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label block">
        {label}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="field-input block min-h-11 w-full appearance-none border-[1.5px] border-ink bg-paper py-2 pr-10 pl-4 font-mono text-base text-ink"
          {...rest}
        >
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 1.5 6 6.5l5-5" />
        </svg>
      </div>
    </div>
  );
}
