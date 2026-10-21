import { AXIS_IDS } from "@/data/axes";
import type { ModeId } from "@/data/modes";
import type { QualityFlag } from "./quality";
import type { AxisVector } from "./types";
import { axisVector, clamp } from "./vector";
import { engineVersionCode } from "./version";

/**
 * Share code (PLAN §6.7): 23 bytes → 31 base64url characters. Scores only,
 * never answers; generated only when the user presses Share (D-018).
 *
 *   [0]      format version (1)
 *   [1]      bits 0–1 mode · bit 2 low quality · bits 3–6 straightline/acquiescence/contradiction/fast
 *   [2..13]  12 × int8 axis scores (−100 … 100)
 *   [14..19] 12 × 4-bit confidences (0 … 15)
 *   [20..21] engine version (major·256 + minor)
 *   [22]     CRC-8 of bytes 0..21
 */
export const CODE_FORMAT = 1;
const LENGTH = 23;
const MODES: readonly ModeId[] = ["quick", "standard", "deep"];
const FLAG_BITS: Partial<Record<QualityFlag, number>> = {
  straightline: 3,
  acquiescence: 4,
  contradiction: 5,
  fast: 6,
};

export interface SharedResult {
  mode: ModeId;
  lowQuality: boolean;
  flags: QualityFlag[];
  scores: AxisVector;
  confidences: AxisVector;
  engineVersionCode: number;
}

export function crc8(bytes: Uint8Array, length = bytes.length): number {
  let crc = 0;
  for (let i = 0; i < length; i++) {
    crc ^= bytes[i] as number;
    for (let b = 0; b < 8; b++) crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
  }
  return crc;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function toBase64Url(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n = ((bytes[i] as number) << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    const chars = Math.min(4, Math.ceil(((bytes.length - i) * 8) / 6));
    for (let c = 0; c < chars; c++) out += ALPHABET[(n >> (18 - 6 * c)) & 63];
  }
  return out;
}

function fromBase64Url(code: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(code)) return null;
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of code) {
    buffer = (buffer << 6) | ALPHABET.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return Uint8Array.from(bytes);
}

export function encodeResult(
  result: Omit<SharedResult, "engineVersionCode"> & { engineVersionCode?: number },
): string {
  const b = new Uint8Array(LENGTH);
  b[0] = CODE_FORMAT;
  let meta = MODES.indexOf(result.mode) & 0b11;
  if (result.lowQuality) meta |= 1 << 2;
  for (const flag of result.flags) {
    const bit = FLAG_BITS[flag];
    if (bit !== undefined) meta |= 1 << bit;
  }
  b[1] = meta;
  AXIS_IDS.forEach((axis, i) => {
    b[2 + i] = Math.round(clamp(result.scores[axis], -100, 100)) & 0xff;
  });
  AXIS_IDS.forEach((axis, i) => {
    const nibble = Math.round(clamp(result.confidences[axis], 0, 1) * 15);
    const at = 14 + (i >> 1);
    b[at] = (b[at] as number) | (i % 2 === 0 ? nibble << 4 : nibble);
  });
  const version = result.engineVersionCode ?? engineVersionCode();
  b[20] = (version >> 8) & 0xff;
  b[21] = version & 0xff;
  b[22] = crc8(b, 22);
  return toBase64Url(b);
}

/** Returns null for anything malformed, tampered with or from an unknown format. */
export function decodeResult(code: string): SharedResult | null {
  const b = fromBase64Url(code);
  if (!b || b.length !== LENGTH || b[0] !== CODE_FORMAT || crc8(b, 22) !== b[22]) return null;
  const meta = b[1] as number;
  const mode = MODES[meta & 0b11];
  if (!mode) return null;
  const flags = (Object.entries(FLAG_BITS) as [QualityFlag, number][])
    .filter(([, bit]) => meta & (1 << bit))
    .map(([f]) => f);
  const scores = axisVector((_, i) => {
    const v = b[2 + i] as number;
    return v > 127 ? v - 256 : v;
  });
  if (AXIS_IDS.some((a) => Math.abs(scores[a]) > 100)) return null;
  const confidences = axisVector((_, i) => {
    const byte = b[14 + (i >> 1)] as number;
    return (i % 2 === 0 ? byte >> 4 : byte & 0x0f) / 15;
  });
  return {
    mode,
    lowQuality: Boolean(meta & (1 << 2)),
    flags,
    scores,
    confidences,
    engineVersionCode: ((b[20] as number) << 8) | (b[21] as number),
  };
}
