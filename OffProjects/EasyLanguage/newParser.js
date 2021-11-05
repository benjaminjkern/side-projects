const { Type, optional, anyAmount, atLeastOne, spacedPattern, makeAllHeuristics, DEFAULT_TYPES } = require('./heuristics.js')();

const numlit = new Type('numlit', atLeastOne(DEFAULT_TYPES.digit));
const N = new Type('N', (N) => spacedPattern(N, '-', N), (N) => spacedPattern('-', N), numlit);

makeAllHeuristics();

console.log(N);



