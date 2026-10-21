import type { AxisId } from "@/data/axes";

export type AxisVector = Record<AxisId, number>;

/** −2 strongly disagree … +2 strongly agree. */
export type RawAnswer = -2 | -1 | 0 | 1 | 2;

/** One answer. `r: null` is an explicit skip ("unsure"), never the same as neutral 0. */
export interface AnswerRecord {
  r: RawAnswer | null;
  /** Milliseconds spent on the question, for the speed check. */
  ms?: number;
}

export type Answers = Readonly<Record<string, AnswerRecord>>;

export interface BankItem {
  id: string;
  axis: AxisId;
  /** 1: agreeing moves toward +100; −1: toward −100. */
  key: 1 | -1;
  order: number;
  weight?: number;
  mirrorOf?: string;
  retired?: boolean;
}

export type Placement = "high" | "medium" | "low";

/** Anything that can be matched: ideology, family centroid, country, figure, party. */
export interface Matchable {
  id: string;
  coords: AxisVector;
  salience: AxisVector;
  family?: string;
  parent?: string;
  placement?: Placement;
  /** Under the atrocity-context policy (D-030): never a share-card hero. */
  atrocity?: boolean;
  /** Excluded from matching (e.g. online-satirical labels). */
  hidden?: boolean;
}

/** A user's position: per-axis score and confidence. */
export interface UserPoint {
  scores: AxisVector;
  confidences: AxisVector;
}
