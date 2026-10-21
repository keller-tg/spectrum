/**
 * Principal component analysis via the cyclic Jacobi eigenvalue method.
 * Deterministic (no random init), exact enough for 12×12 matrices, and small.
 */

export interface PcaResult {
  mean: number[];
  /** components[k] is the k-th unit eigenvector, sorted by variance (largest first). */
  components: number[][];
  variances: number[];
  /** Share of total variance per component (sums to 1). */
  explained: number[];
}

export function covarianceMatrix(
  rows: readonly (readonly number[])[],
  center = true,
): { mean: number[]; cov: number[][] } {
  const n = rows.length;
  const d = rows[0]?.length ?? 0;
  const mean = Array.from({ length: d }, (_, j) =>
    center && n ? rows.reduce((s, r) => s + (r[j] as number), 0) / n : 0,
  );
  const cov = Array.from({ length: d }, () => Array<number>(d).fill(0));
  for (const r of rows) {
    for (let i = 0; i < d; i++) {
      const di = (r[i] as number) - (mean[i] as number);
      for (let j = i; j < d; j++) {
        (cov[i] as number[])[j] =
          ((cov[i] as number[])[j] as number) + di * ((r[j] as number) - (mean[j] as number));
      }
    }
  }
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < d; i++) {
    for (let j = i; j < d; j++) {
      const v = ((cov[i] as number[])[j] as number) / denom;
      (cov[i] as number[])[j] = v;
      (cov[j] as number[])[i] = v;
    }
  }
  return { mean, cov };
}

/** Eigen-decomposition of a symmetric matrix. Returns unsorted values and column eigenvectors as rows. */
export function symmetricEigen(matrix: readonly (readonly number[])[]): {
  values: number[];
  vectors: number[][];
} {
  const n = matrix.length;
  const a = matrix.map((row) => [...row]);
  const v = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
  const get = (m: number[][], i: number, j: number) => (m[i] as number[])[j] as number;
  const set = (m: number[][], i: number, j: number, x: number) => {
    (m[i] as number[])[j] = x;
  };

  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += get(a, i, j) ** 2;
    if (off < 1e-22) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = get(a, p, q);
        if (Math.abs(apq) < 1e-300) continue;
        const theta = (get(a, q, q) - get(a, p, p)) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = get(a, k, p);
          const akq = get(a, k, q);
          set(a, k, p, c * akp - s * akq);
          set(a, k, q, s * akp + c * akq);
        }
        for (let k = 0; k < n; k++) {
          const apk = get(a, p, k);
          const aqk = get(a, q, k);
          set(a, p, k, c * apk - s * aqk);
          set(a, q, k, s * apk + c * aqk);
        }
        for (let k = 0; k < n; k++) {
          const vkp = get(v, k, p);
          const vkq = get(v, k, q);
          set(v, k, p, c * vkp - s * vkq);
          set(v, k, q, s * vkp + c * vkq);
        }
      }
    }
  }
  const values = Array.from({ length: n }, (_, i) => get(a, i, i));
  // Eigenvector i is column i of v; return as rows.
  const vectors = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, k) => get(v, k, i)),
  );
  return { values, vectors };
}

/**
 * PCA of the given rows. Each component's sign is fixed so its largest-magnitude
 * loading is positive (deterministic); callers may re-orient (e.g. indices).
 */
export function pca(rows: readonly (readonly number[])[], { center = true } = {}): PcaResult {
  const { mean, cov } = covarianceMatrix(rows, center);
  const { values, vectors } = symmetricEigen(cov);
  const order = values
    .map((_, i) => i)
    .sort((x, y) => (values[y] as number) - (values[x] as number));
  const variances = order.map((i) => Math.max(0, values[i] as number));
  const total = variances.reduce((s, x) => s + x, 0) || 1;
  const components = order.map((i) => {
    const vec = vectors[i] as number[];
    let big = 0;
    for (const x of vec) if (Math.abs(x) > Math.abs(big)) big = x;
    return big < 0 ? vec.map((x) => -x) : vec;
  });
  return { mean, components, variances, explained: variances.map((x) => x / total) };
}

/** Project a point onto the given components (after subtracting the mean). */
export function project(
  point: readonly number[],
  result: Pick<PcaResult, "mean" | "components">,
  k = 2,
): number[] {
  return result.components
    .slice(0, k)
    .map((c) =>
      c.reduce((s, w, j) => s + w * ((point[j] as number) - (result.mean[j] as number)), 0),
    );
}
