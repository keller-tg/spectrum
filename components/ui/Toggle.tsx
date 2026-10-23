"use client";

/** An on/off switch drawn as "[ ON / OFF ]"; the active word is the inverted one. */
export function Toggle({
  label,
  onText,
  offText,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  onText: string;
  offText: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const word = (active: boolean) =>
    active
      ? "bg-ink px-1.5 text-paper group-hover:bg-paper group-hover:text-ink group-disabled:bg-paper group-disabled:text-ink group-disabled:underline"
      : "px-1.5";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group label flex min-h-11 flex-wrap items-center gap-x-3 border-2 border-transparent px-2 text-left hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-dashed disabled:border-ink disabled:hover:bg-paper disabled:hover:text-ink"
    >
      <span>{label}</span>
      <span aria-hidden="true" className="flex items-center whitespace-pre">
        {"[ "}
        <span className={word(checked)}>{onText}</span>
        {" / "}
        <span className={word(!checked)}>{offText}</span>
        {" ]"}
      </span>
    </button>
  );
}
