"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ModeId } from "@/data/modes";
import type { AnswerRecord, RawAnswer } from "@/lib/engine/types";
import { openStore, type Draft, type Store } from "@/lib/storage/db";
import { buildResult } from "@/lib/test/result";

interface TestState {
  ready: boolean;
  persistent: boolean;
  answers: Readonly<Record<string, AnswerRecord>>;
  autoAdvance: boolean;
  setAnswer: (id: string, r: RawAnswer | null, ms: number) => void;
  setAutoAdvance: (on: boolean) => void;
  /** Score, store the result, clear the draft. */
  finish: () => Promise<void>;
}

const Context = createContext<TestState | null>(null);

export function useTest() {
  const state = useContext(Context);
  if (!state) throw new Error("useTest outside <TestProvider>");
  return state;
}

/**
 * The test in progress for one mode. Lives in the [mode] layout, so it
 * survives moving between questions; every answer is written to the local
 * store at once (PLAN §7). Modes are prefixes: a draft from another mode keeps
 * its answers, which is how "36 more questions" continues a finished Quick.
 */
export function TestProvider({
  mode,
  bankVersion,
  children,
}: {
  mode: ModeId;
  bankVersion: string;
  children: React.ReactNode;
}) {
  const [store, setStore] = useState<Store | null>(null);
  // Starts empty at once, so an answer given before the store has loaded is
  // never dropped; the stored draft is merged in when it arrives.
  const [draft, setDraft] = useState<Draft>(() => {
    const now = new Date().toISOString();
    return { mode, answers: {}, startedAt: now, updatedAt: now };
  });
  const [loaded, setLoaded] = useState(false);
  const [autoAdvance, setAuto] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const s = await openStore();
      const existing = await s.getDraft();
      const settings = await s.getSettings();
      if (!alive) return;
      setDraft((current) => {
        const merged: Draft = {
          mode,
          answers: { ...existing?.answers, ...current.answers },
          startedAt: existing?.startedAt ?? current.startedAt,
          updatedAt: new Date().toISOString(),
        };
        void s.putDraft(merged);
        return merged;
      });
      setStore(s);
      setLoaded(true);
      setAuto(settings.autoAdvance);
    })();
    return () => {
      alive = false;
    };
  }, [mode]);

  const setAnswer = useCallback(
    (id: string, r: RawAnswer | null, ms: number) => {
      setDraft((current) => {
        const next: Draft = {
          ...current,
          answers: { ...current.answers, [id]: r === null ? { r } : { r, ms } },
          updatedAt: new Date().toISOString(),
        };
        void store?.putDraft(next);
        return next;
      });
    },
    [store],
  );

  const setAutoAdvance = useCallback(
    (on: boolean) => {
      setAuto(on);
      void store?.putSettings({ autoAdvance: on });
    },
    [store],
  );

  const finish = useCallback(async () => {
    if (!store) return;
    await store.addResult(buildResult(mode, draft.answers, bankVersion));
    await store.clearDraft();
  }, [store, draft, mode, bankVersion]);

  const value = useMemo<TestState>(
    () => ({
      ready: loaded,
      persistent: store?.persistent ?? true,
      answers: draft.answers,
      autoAdvance,
      setAnswer,
      setAutoAdvance,
      finish,
    }),
    [loaded, store, draft, autoAdvance, setAnswer, setAutoAdvance, finish],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
