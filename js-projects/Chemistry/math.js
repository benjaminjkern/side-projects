export const addVec = (a, b) => a.map((x, i) => x + b[i]);
export const subVec = (a, b) => a.map((x, i) => x - b[i]);
export const multVec = (a, v) => v.map((x) => x * a);
export const dotVec = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);
