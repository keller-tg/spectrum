/**
 * Privacy guard (D-073): fails if the owner's personal email appears anywhere in
 * the repo, or with --history anywhere in the git history (file contents,
 * author/committer fields and messages of every commit on every ref).
 *
 * The email itself is never stored in the repo. PRIVACY_GUARD_SHA256 holds
 * SHA-256 hashes (hex, comma-separated) of the lowercase email and of its local
 * part; locally it comes from .env.local, in CI from a repository secret. Every
 * email-like string and every word-like token is hashed and compared, and
 * findings are reported by location only, so the log never repeats the address.
 *
 * Runs on plain Node 24 (type stripping), so CI needs no npm install:
 *   node scripts/check-privacy.ts [--history]
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const history = process.argv.includes("--history");
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const hashes = new Set(
  (process.env.PRIVACY_GUARD_SHA256 ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter((h) => /^[0-9a-f]{64}$/.test(h)),
);
if (hashes.size === 0) {
  const msg = "check-privacy: PRIVACY_GUARD_SHA256 is not set, so nothing was checked.";
  if (process.env.CI) {
    console.error(`${msg} Add it as a repository secret.`);
    process.exit(1);
  }
  console.warn(`${msg} Add it to .env.local (see .env.example).`);
  process.exit(0);
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
// Email-like strings, including the %40 and (at)/[at] spellings.
const EMAIL = /[a-z0-9._%+-]+(?:@|%40|\s?[([]at[)\]]\s?)[a-z0-9.-]+\.[a-z]{2,}/gi;
// Word-like tokens catch the local part on its own (e.g. in a URL or a header).
const TOKEN = /[a-z0-9._%+-]{3,}/gi;

function leaks(text: string): number[] {
  const lines: number[] = [];
  text.split("\n").forEach((line, i) => {
    const candidates = [
      ...(line.match(EMAIL) ?? []).map((m) =>
        m
          .toLowerCase()
          .replace(/%40|\s?[([]at[)\]]\s?/g, "@")
          .replace(/\s/g, ""),
      ),
      ...(line.match(TOKEN) ?? []).map((t) => t.toLowerCase()),
    ];
    if (
      candidates.some(
        (c) => hashes.has(sha(c)) || hashes.has(sha(c.replace(/^[._%+-]+|[._%+-]+$/g, ""))),
      )
    )
      lines.push(i + 1);
  });
  return lines;
}

const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "latin1", maxBuffer: 1 << 30 });
const findings: string[] = [];

if (!history) {
  // Tracked files plus new files that are not ignored, i.e. everything a commit could include.
  const files = git("ls-files", "-z", "--cached", "--others", "--exclude-standard")
    .split("\0")
    .filter(Boolean);
  for (const file of files) {
    if (!existsSync(file)) continue;
    const hits = leaks(readFileSync(file, "latin1"));
    if (hits.length) findings.push(`${file}: line ${hits.join(", ")}`);
  }
  if (findings.length === 0) console.log(`check-privacy: ${files.length} files clean.`);
} else {
  const commits = git("rev-list", "--all").split("\n").filter(Boolean);
  for (const c of commits) {
    const meta = git("log", "-1", "--format=%an%n%ae%n%cn%n%ce%n%B", c);
    if (leaks(meta).length) findings.push(`commit ${c.slice(0, 7)}: author, committer or message`);
  }
  // Every blob reachable from any ref, with the first path it appeared under.
  const objects = git("rev-list", "--all", "--objects").split("\n").filter(Boolean);
  const paths = new Map<string, string>();
  for (const line of objects) {
    const [id, ...rest] = line.split(" ");
    if (id && rest.length) paths.set(id, rest.join(" "));
  }
  const types = execFileSync("git", ["cat-file", "--batch-check=%(objectname) %(objecttype)"], {
    input: [...paths.keys()].join("\n"),
    encoding: "latin1",
    maxBuffer: 1 << 30,
  });
  let blobs = 0;
  for (const line of types.split("\n")) {
    const [id, type] = line.split(" ");
    if (!id || type !== "blob") continue;
    blobs++;
    const hits = leaks(git("cat-file", "blob", id));
    if (hits.length)
      findings.push(`blob ${id.slice(0, 7)} (${paths.get(id)}): line ${hits.join(", ")}`);
  }
  if (findings.length === 0)
    console.log(`check-privacy --history: ${commits.length} commits and ${blobs} blobs clean.`);
}

if (findings.length) {
  console.error("check-privacy: personal email found (locations only):");
  for (const f of findings) console.error(`  ${f}`);
  process.exit(1);
}
