import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ModeId } from "@/data/modes";
import type { QualityFlag } from "@/lib/engine/quality";
import type { AnswerRecord, AxisVector } from "@/lib/engine/types";

/**
 * Local storage for the test and results (D-019). Everything stays in this
 * browser: IndexedDB when available, otherwise an in-memory store for the
 * session (and the UI says so). Nothing here is ever sent anywhere, and no
 * result ever appears in a URL (D-018).
 */

/** The test in progress. Modes are prefixes, so one draft spans an upgrade. */
export interface Draft {
  mode: ModeId;
  answers: Record<string, AnswerRecord>;
  startedAt: string;
  updatedAt: string;
}

/** A finished result: the answers are the source of truth, scores a snapshot (§6.8). */
export interface StoredResult {
  id?: number;
  createdAt: string;
  mode: ModeId;
  answers: Record<string, AnswerRecord>;
  bankVersion: string;
  engineVersion: string;
  scoresAsTaken: AxisVector;
  confidences: AxisVector;
  overallConfidence: number;
  qualityFlags: QualityFlag[];
  lowQuality: boolean;
}

export interface Settings {
  autoAdvance: boolean;
}

interface Schema extends DBSchema {
  drafts: { key: string; value: Draft };
  results: { key: number; value: StoredResult };
  settings: { key: string; value: unknown };
}

export interface Store {
  /** False when IndexedDB is unavailable and data lasts only for this session. */
  persistent: boolean;
  getDraft(): Promise<Draft | undefined>;
  putDraft(draft: Draft): Promise<void>;
  clearDraft(): Promise<void>;
  addResult(result: StoredResult): Promise<number>;
  latestResult(): Promise<StoredResult | undefined>;
  allResults(): Promise<StoredResult[]>;
  getSettings(): Promise<Settings>;
  putSettings(settings: Settings): Promise<void>;
}

const DEFAULT_SETTINGS: Settings = { autoAdvance: true };
const DRAFT_KEY = "current";

function idbStore(db: IDBPDatabase<Schema>): Store {
  return {
    persistent: true,
    getDraft: () => db.get("drafts", DRAFT_KEY),
    putDraft: async (draft) => void (await db.put("drafts", draft, DRAFT_KEY)),
    clearDraft: () => db.delete("drafts", DRAFT_KEY),
    addResult: (result) => db.add("results", result),
    latestResult: async () => {
      const cursor = await db.transaction("results").store.openCursor(null, "prev");
      return cursor?.value;
    },
    allResults: () => db.getAll("results"),
    getSettings: async () => ({
      ...DEFAULT_SETTINGS,
      ...((await db.get("settings", "ui")) as Partial<Settings> | undefined),
    }),
    putSettings: async (settings) => void (await db.put("settings", settings, "ui")),
  };
}

/** Session-only fallback; module state survives client-side navigation, not a reload. */
const memory: { draft?: Draft; results: StoredResult[]; settings: Settings } = {
  results: [],
  settings: DEFAULT_SETTINGS,
};
function memoryStore(): Store {
  return {
    persistent: false,
    getDraft: async () => memory.draft,
    putDraft: async (draft) => void (memory.draft = draft),
    clearDraft: async () => void (memory.draft = undefined),
    addResult: async (result) => {
      memory.results.push({ ...result, id: memory.results.length + 1 });
      return memory.results.length;
    },
    latestResult: async () => memory.results.at(-1),
    allResults: async () => [...memory.results],
    getSettings: async () => memory.settings,
    putSettings: async (settings) => void (memory.settings = settings),
  };
}

let opening: Promise<Store> | null = null;

export function openStore(): Promise<Store> {
  opening ??= (async () => {
    try {
      if (typeof indexedDB === "undefined") return memoryStore();
      const db = await openDB<Schema>("spectrum", 1, {
        upgrade(database) {
          database.createObjectStore("drafts");
          database.createObjectStore("results", { autoIncrement: true, keyPath: "id" });
          database.createObjectStore("settings");
        },
      });
      return idbStore(db);
    } catch {
      return memoryStore();
    }
  })();
  return opening;
}
