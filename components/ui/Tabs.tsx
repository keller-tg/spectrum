"use client";

import { useId, useRef, useState } from "react";

export interface Tab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

const KEYS: Record<string, (i: number, n: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
};

/** Tabs as ruled cells; the selected tab is inverted and bracketed. Arrow keys, Home, End. */
export function Tabs({ label, tabs }: { label: string; tabs: readonly Tab[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const move = KEYS[event.key];
    if (!move) return;
    event.preventDefault();
    const next = move(index, tabs.length);
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap border-t-2 border-l-2 border-ink"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="bracketed label min-h-11 border-r-2 border-ink px-4 hover:bg-ink hover:text-paper aria-selected:bg-ink aria-selected:text-paper"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="border-2 border-ink p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
