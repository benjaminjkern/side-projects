const { Type, optional, anyAmount, atLeastOne, spacedPattern, makeAllHeuristics, DEFAULT_TYPES } = require('./heuristics.js')();

const numlit = new Type('numlit', atLeastOne(DEFAULT_TYPES.digit));
const N = new Type('N', (N) => spacedPattern(N, '-', N), (N) => spacedPattern('-', N), numlit);

makeAllHeuristics();

console.log(N);



const preMatchType = (type, pattern) => {
}


const matchType = (type, pattern) => {

    // console.log(`${type} -> ${stringify(pattern)}`);
    if (!preMatchType(type, pattern)) return { error: "Did not pass the pre-match." }

    for (const rule of rules[type]) {
        const targetPattern = rule.pattern;
        const match = matchPattern(targetPattern, pattern);
        // console.log(match);
        if (match.error) continue;
        return { type, pattern: match };
    }
    return { error: "All patterns did not return a match." };
}

const matchPattern = (targetPattern, pattern) => {

    // console.log(`${stringify(targetPattern)} -> ${stringify(pattern)}`);
    if (targetPattern.length === 0) {
        if (pattern.length === 0) return [];
        return { error: "Empty pattern cannot create a non-empty pattern." };
    }
    if (targetPattern[0].type === undefined) {
        if (targetPattern[0] === pattern[0]) return matchPattern(targetPattern.slice(1), pattern.slice(1));
        return { error: `Failed to match expected terminal token: "${targetPattern[0]}" at beginning of pattern` };
    }
    if (targetPattern[targetPattern.length - 1].type === undefined) {
        if (targetPattern[targetPattern.length - 1] === pattern[pattern.length - 1]) return matchPattern(targetPattern.slice(0, targetPattern.length - 1), pattern.slice(0, pattern.length - 1));
        return { error: `Failed to match expected terminal token: "${pattern[pattern.length - 1]}" at end of pattern` };
    }

    // check first and last line up
    const firstTokenKey = makeTokenKey(pattern[0]);
    if (heuristics[targetPattern[0].type].minLength > 0 && !(firstTokenKey in heuristics[targetPattern[0].type].startSet)) return { error: `A ${targetPattern[0].type} cannot start with a "${firstTokenKey}"` };

    const lastTokenKey = makeTokenKey(pattern[pattern.length - 1]);
    if (heuristics[targetPattern[targetPattern.length - 1].type].minLength > 0 && !(lastTokenKey in heuristics[targetPattern[targetPattern.length - 1].type].endSet)) return { error: `A ${targetPattern[0].type} cannot end with a "${lastTokenKey}"` };

    // check lengths
    let targetMinLength = 0;
    let targetMaxLength = 0;
    for (const token of targetPattern) {
        if (token.type === undefined) {
            targetMinLength++;
            targetMaxLength++;
        } else {
            targetMinLength += heuristics[token.type].minLength;
            targetMaxLength = Math.min(Number.MAX_SAFE_INTEGER, targetMaxLength + heuristics[token.type].maxLength);
        }

        if (pattern.length < targetMinLength) return { error: `Pattern length (${pattern.length}) was less than minimum possible length of target.` };
    }
    if (pattern.length > targetMaxLength) return { error: `Pattern length (${pattern.length}) was greater than minimum possible length of target.` };

    // try to come up with possible matches
    for (let i = heuristics[targetPattern[0].type].minLength; i <= Math.min(pattern.length, heuristics[targetPattern[0].type].maxLength); i++) {

        if (i > 0) {
            const ithTokenKey = makeTokenKey(pattern[i - 1]);
            if (!(ithTokenKey in heuristics[targetPattern[0].type].tokenSet))
                return { error: "All possible matches failed." };
        }

        const firstSlice = pattern.slice(0, i);
        const firstMatch = matchType(targetPattern[0].type, firstSlice);
        // console.log(firstMatch);
        if (firstMatch.error) continue;

        const secondSlice = pattern.slice(i);
        const secondMatch = matchPattern(targetPattern.slice(1), secondSlice);
        // console.log(secondMatch);
        if (secondMatch.error) continue;

        return [firstMatch, ...secondMatch];
    }
    return { error: "All possible matches failed." };
};