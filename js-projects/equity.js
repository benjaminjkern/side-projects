const equity = [100, 31, 2, 32, 40, 3, 3, 3, 92];

const min = [0.3, 0.1, 0, 0.05, 0, 0, 0, 0, 0.3];

if (min.reduce((p, c) => p + c, 0) > 1)
  console.error("Warning: Promised minimum shares sums to over 1");

const m = Array(min.length)
  .fill()
  .map((_, i) =>
    Array(min.length)
      .fill()
      .map((_, j) => min[i] - (i === j ? 1 : 0))
  );

const matMult = (A, x) => A.map((row) => dot(row, x));

const dot = (a, b) => a.reduce((p, x, i) => p + x * b[i], 0);

loop: while (true) {
  const minShare = matMult(m, equity);
  for (const [i, share] of minShare.entries()) {
    if (share > 0) {
      equity[i]++;
      continue loop;
    }
  }
  break;
}
console.log(equity);
const sum = equity.reduce((p, c) => p + c, 0);

console.log(equity.map((e) => e / sum));
