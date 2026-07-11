function gcdTwo(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function gcdAll(nums) {
  return nums.reduce((a, b) => gcdTwo(a, b), 0) || 1;
}

/**
 * Cari semua kombinasi item yang jumlahnya PERSIS sama dengan targetAmount.
 * items: [{ id, amount }]  amount harus integer > 0
 *
 * Return: { combinations: [{ expenseIds: [], totalAmount }], truncated: boolean }
 * truncated=true artinya pencarian dihentikan karena limit (maxSolutions/maxNodes),
 * jadi mungkin masih ada kombinasi lain yang belum ketemu.
 */
function findAmountCombinations(items, targetAmount, {
  maxSolutions = 15,
  maxNodes = 300000,
  maxDpCells = 4_000_000,
} = {}) {
  if (!targetAmount || targetAmount <= 0) return { combinations: [], truncated: false };

  const candidates = items
    .filter((it) => it.amount > 0 && it.amount <= targetAmount)
    .sort((a, b) => b.amount - a.amount); // besar dulu -> pruning lebih efektif

  if (candidates.length === 0) return { combinations: [], truncated: false };

  const gcd = gcdAll([targetAmount, ...candidates.map((c) => c.amount)]);
  const target = targetAmount / gcd;
  const weights = candidates.map((c) => Math.round(c.amount / gcd));
  const n = weights.length;

  // Suffix sum (dalam unit asli) buat prune murah: kalau sisa target > total sisa item, mustahil.
  const suffixSum = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suffixSum[i] = suffixSum[i + 1] + weights[i];

  // Tabel reachability exact (opsional, dibatasi memori)
  let reachable = null;
  const useDp = target * n <= maxDpCells;
  if (useDp) {
    reachable = new Array(n + 1);
    reachable[n] = new Uint8Array(target + 1);
    reachable[n][0] = 1;
    for (let i = n - 1; i >= 0; i--) {
      const prev = reachable[i + 1];
      const cur = new Uint8Array(target + 1);
      cur.set(prev);
      const w = weights[i];
      for (let s = target; s >= w; s--) {
        if (prev[s - w]) cur[s] = 1;
      }
      reachable[i] = cur;
    }
    if (!reachable[0][target]) {
      return { combinations: [], truncated: false }; // dijamin gak ada solusi sama sekali
    }
  }

  const results = [];
  const path = [];
  let nodes = 0;
  let truncated = false;

  function feasible(i, remaining) {
    if (remaining === 0) return true;
    if (i >= n) return false;
    if (remaining > suffixSum[i]) return false;
    if (reachable) return remaining <= target && !!reachable[i][remaining];
    return true;
  }

  function dfs(i, remaining) {
    if (results.length >= maxSolutions || nodes > maxNodes) {
      truncated = true;
      return;
    }
    nodes++;
    if (remaining === 0) {
      results.push(path.slice());
      return;
    }
    if (i >= n || !feasible(i, remaining)) return;

    if (weights[i] <= remaining) {
      path.push(i);
      dfs(i + 1, remaining - weights[i]);
      path.pop();
      if (results.length >= maxSolutions || nodes > maxNodes) { truncated = true; return; }
    }
    dfs(i + 1, remaining);
  }

  dfs(0, target);

  const combinations = results.map((idxArr) => {
    const combo = idxArr.map((idx) => candidates[idx]);
    return {
      expenseIds: combo.map((c) => c.id),
      totalAmount: combo.reduce((s, c) => s + c.amount, 0),
    };
  });

  combinations.sort((a, b) => a.expenseIds.length - b.expenseIds.length);

  return { combinations, truncated };
}

export { findAmountCombinations };