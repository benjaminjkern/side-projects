const MAX = 27;

const triIntegral = (f, a, b) =>
  ((f(a) + f(b)) * (b - a)) / 2 + recursiveTriangle(f, a, b);

const recursiveTriangle = (f, a, b, n = MAX) => {
  const midpoint = (a + b) / 2;
  const tri = ((b - a) * (2 * f(midpoint) - f(a) - f(b))) / 4;
  if (n <= 0) return tri;
  return (
    tri +
    recursiveTriangle(f, a, midpoint, n - 1) +
    recursiveTriangle(f, midpoint, b, n - 1)
  );
};

const reimannIntegral = (f, a, b) => {
  let sum = 0;
  const NMAX = 2 ** (MAX + 1) - 1;
  const dt = (b - a) / NMAX;

  for (let t = 0; t < NMAX; t++) {
    sum += f(a + (t + 0.5) * dt);
  }

  return sum * dt;
};

console.log(triIntegral((x) => x * x * x, -1, 1));
