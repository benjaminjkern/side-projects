const rules = {
    N: [
        // { pattern: [{ type: "N" }, { type: "whitespace" }, "^", { type: "whitespace" }, { type: "N" }] },
        // { pattern: [{ type: "N" }, { type: "whitespace" }, "*", { type: "whitespace" }, { type: "N" }] },
        // { pattern: [{ type: "N" }, { type: "whitespace" }, "/", { type: "whitespace" }, { type: "N" }] },
        // { pattern: [{ type: "N" }, { type: "whitespace" }, "+", { type: "whitespace" }, { type: "N" }] },
        { pattern: [{ type: "N" }, { type: "whitespace" }, "-", { type: "whitespace" }, { type: "N" }] },
        // { pattern: ["-", { type: "whitespace" }, { type: "N" }] },
        { pattern: ["n"] },
    ],
    whitespace: [
        { pattern: [] },
        { pattern: [{ type: "space" }] },
        { pattern: [{ type: "space" }, { type: "whitespace" }] }
    ],
    space: [
        { pattern: [" "] },
        { pattern: ["\n"] },
    ]
    // S: [
    //     { pattern: [{ type: "T" }, { type: "T" }] },
    //     { pattern: ["t"] }
    // ],
    // T: [
    //     { pattern: ["s", "r", "q"] },
    //     { pattern: ["t"] }
    // ]
};

const heuristics = {};

const makeAllHeuristics = () => {
    for (const type in rules) {
        heuristics[type] = {};
        getTokenSet(type);
        getStartSet(type);
        getEndSet(type);

        getMinLength(type);
        getMaxLength(type);
    }
}

const getTokenSet = (type) => {
    if (!heuristics[type]) heuristics[type] = {};
    if (heuristics[type].tokenSet) return heuristics[type].tokenSet;
    const typeTokenKey = makeTokenKeyFromType(type);
    heuristics[type].tokenSet = { [typeTokenKey]: true };
    for (const { pattern } of rules[type]) {
        for (const token of pattern) {
            const tokenKey = makeTokenKey(token);
            heuristics[type].tokenSet[tokenKey] = true;
            if (token.type !== undefined) {
                heuristics[type].tokenSet = { ...heuristics[type].tokenSet, ...getTokenSet(token.type) }
            }
        }
    }
    return heuristics[type].tokenSet;
}

const getStartSet = (type) => {
    if (!heuristics[type]) heuristics[type] = {};
    if (heuristics[type].startSet) return heuristics[type].startSet;
    const typeTokenKey = makeTokenKeyFromType(type);
    heuristics[type].startSet = { [typeTokenKey]: true };
    for (const { pattern } of rules[type]) {
        if (pattern.length === 0) continue;
        const token = pattern[0];
        const tokenKey = makeTokenKey(token);
        heuristics[type].startSet[tokenKey] = true;
        if (token.type !== undefined) {
            heuristics[type].startSet = { ...heuristics[type].startSet, ...getStartSet(token.type) }
        }
    }
    return heuristics[type].startSet;
}

const getEndSet = (type) => {
    if (!heuristics[type]) heuristics[type] = {};
    if (heuristics[type].endSet) return heuristics[type].endSet;
    const typeTokenKey = makeTokenKeyFromType(type);
    heuristics[type].endSet = { [typeTokenKey]: true };
    for (const { pattern } of rules[type]) {
        if (pattern.length === 0) continue;
        const token = pattern[pattern.length - 1];
        const tokenKey = makeTokenKey(token);
        heuristics[type].endSet[tokenKey] = true;
        if (token.type !== undefined) {
            heuristics[type].endSet = { ...heuristics[type].endSet, ...getEndSet(token.type) }
        }
    }
    return heuristics[type].endSet;
}

const getMinLength = (type) => {
    if (!heuristics[type]) heuristics[type] = {};
    if (heuristics[type].minLength) return heuristics[type].minLength;
    heuristics[type].minLength = 1;
    for (const { pattern } of rules[type]) {
        if (pattern.length === 0) {
            heuristics[type].minLength = 0;
            return heuristics[type].minLength;
        }
    }
    return heuristics[type].minLength;
}

const getMaxLength = (type, seen = {}) => {
    if (seen[type]) {
        if (heuristics[type].maxLength === -1)
            return Number.MAX_SAFE_INTEGER;
        return heuristics[type].maxLength;
    }
    seen[type] = true;
    heuristics[type].maxLength = -1;
    for (const { pattern } of rules[type]) {
        let runningLength = 0;
        for (const token of pattern) {
            if (runningLength >= Number.MAX_SAFE_INTEGER) {
                heuristics[type].maxLength = Number.MAX_SAFE_INTEGER;
                return heuristics[type].maxLength;
            }
            if (token.type !== undefined) {
                runningLength += getMaxLength(token.type, seen);
            } else {
                runningLength += 1;
            }
        }
        heuristics[type].maxLength = Math.max(runningLength, heuristics[type].maxLength);
    }
    return heuristics[type].maxLength;
}

const makeTokenKeyFromType = type => `type:${type}`

const makeTokenKey = token => token.type === undefined ? token : makeTokenKeyFromType(token.type);

makeAllHeuristics();

const preMatchType = (type, pattern) => {
    const heuristic = heuristics[type];
    if (pattern.length > heuristic.maxLength) return false;
    if (pattern.length < heuristic.minLength) return false;
    for (const [i, token] of pattern.entries()) {
        const tokenKey = makeTokenKey(token);
        if (i === 0 && !(tokenKey in heuristic.startSet)) return false;
        if (i === pattern.length - 1 && !(tokenKey in heuristic.endSet)) return false;
        if (!(tokenKey in heuristic.tokenSet)) return false;
    }
    return true;
}

const stringify = a => {
    if (typeof a === 'object' && a.length !== undefined) return `[ ${a.map(stringify).join(', ')} ]`
    return makeTokenKey(a);
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

console.log(matchType("N", 'n -   n'.split('')));