const { inspect } = require("util");

const RULES = {
    Object: [
        ["(", "Object", ")"],
        ["Bool", "?", "Object", ":", "Object"],
        ["Bool"],
        ["Num"],
    ],
    Bool: [
        ["(", "Bool", ")"],
        ["Object", "==", "Object"],
        ["Bool", "and", "Bool"],
        ["Bool", "or", "Bool"],
        ["true"],
        ["false"],
        ["Object", "is", "cool"],
    ],
    Num: [
        ["(", "Num", ")"],
        ["f", "Num"],
        ["f", "Num", "Num"],
        ["Num", "Num"],
        ["0"],
        ["1"],
        ["2"],
        ["3"],
        ["4"],
        ["5"],
        ["6"],
        ["7"],
        ["8"],
        ["9"],
    ],
};

const isTerminal = (token) => !Object.keys(RULES).includes(token);

const getMinLength = (nonTerminal, already = []) =>
    RULES[nonTerminal].reduce(
        (p, rule) =>
        Math.min(
            p,
            rule.reduce(
                (p, token) =>
                p === Number.MAX_SAFE_INTEGER ||
                token === nonTerminal ||
                already.includes(token) ?
                Number.MAX_SAFE_INTEGER :
                p +
                (isTerminal(token) ?
                    1 :
                    getMinLength(token, [...already, token])),
                0
            )
        ),
        Number.MAX_SAFE_INTEGER
    );

const minLengths = Object.keys(RULES).reduce(
    (p, nonTerminal) => ({...p, [nonTerminal]: getMinLength(nonTerminal) }), {}
);

const patternMinLength = (pattern) =>
    pattern.reduce((p, c) => p + (isTerminal(c) ? 1 : minLengths[c]), 0);

const splitByTerminals = (pattern) =>
    pattern.reduce(
        (p, c) =>
        isTerminal(c) ? [...p.slice(0, p.length - 1), [...p[p.length - 1], c]] : [...p, []], [
            []
        ]
    );

const checkPatternsInOrder = (text, listOfNonTerminalPatterns) =>
    listOfNonTerminalPatterns.reduce(
        (p, subPattern) => [
            p[0] && hasSubArray(p[1], subPattern),
            p[0] ? p[1].slice(subPattern.length) : "",
        ], [true, text]
    );

const numMatches = (pattern, text) => {
    if (typeof pattern === "string") return numMatches(pattern.split(""), text);
    if (typeof text === "string") return numMatches(pattern, text.split(""));

    if (pattern.length === 0) return text.length === 0 ? 1 : 0;

    if (isTerminal(pattern[0])) {
        if (text[0] !== pattern[0]) return 0;
        return numMatches(pattern.slice(1), text.slice(1));
    }

    if (patternMinLength(pattern) > text.length) return 0;

    if (!checkPatternsInOrder(text, splitByTerminals(pattern))[0]) return 0;

    return RULES[pattern[0]].reduce(
        (p, rule) => p + numMatches([...rule, ...pattern.slice(1)], text),
        0
    );
};

// boolean if it matches at all, faster than checking for all matches and returning if the length is greater than 0
const doesMatch = (pattern, text) => {
    if (typeof pattern === "string") return doesMatch(pattern.split(""), text);
    if (typeof text === "string") return doesMatch(pattern, text.split(""));

    if (pattern.length === 0) return text.length === 0;

    if (isTerminal(pattern[0])) {
        if (text[0] !== pattern[0]) return false;
        return doesMatch(pattern.slice(1), text.slice(1));
    }

    if (patternMinLength(pattern) > text.length) return false;

    if (!checkPatternsInOrder(text, splitByTerminals(pattern))[0]) return false;

    return RULES[pattern[0]].some((rule) =>
        doesMatch([...rule, ...pattern.slice(1)], text)
    );
};

const match = (pattern, text) => {
    if (typeof pattern === "string") return match(pattern.split(""), text);
    if (typeof text === "string") return match(pattern, text.split(""));

    if (pattern.length === 0) return text.length === 0 ? ["end"] : [];

    if (isTerminal(pattern[0])) {
        if (text[0] !== pattern[0]) return [];
        return [pattern[0], ...match(pattern.slice(1), text.slice(1))];
    }

    if (patternMinLength(pattern) > text.length) return [];

    if (!checkPatternsInOrder(text, splitByTerminals(pattern))[0]) return [];

    return [
        RULES[pattern[0]].reduce(
            (p, rule, i) =>
            isValid((thisMatch = match([...rule, ...pattern.slice(1)], text))) ? {
                ...p,
                [rule.join(" ")]: thisMatch,
            } :
            p, {}
        ),
    ];
};

const isValid = (thisMatch) =>
    typeof thisMatch === "object" ?
    thisMatch.length ?
    isValid(thisMatch[thisMatch.length - 1]) :
    Object.keys(thisMatch).some((rule) => isValid(thisMatch[rule])) :
    thisMatch === "end";

const hasSubArray = (master, sub) =>
    sub.length === 0 ||
    master.some((_, idx) => isEqual(master.slice(idx, idx + sub.length), sub));
const isEqual = (a, b) => {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return a === b;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => isEqual(a[key], b[key]));
};

const reformatMatch = (matchObject, pattern, expectedType) => {
    console.log(
        `reformatMatch(${inspect(matchObject)}, ${pattern}, ${expectedType})`
    );
    if (matchObject.length) {
        if (matchObject[matchObject.length - 1] === "end")
            return matchObject.slice(0, matchObject.length - 1);
        return pattern.map((token, i) =>
            isTerminal(token) ?
            token :
            i === pattern.length - 1 ?
            reformatMatch(matchObject[i], pattern, token) : { type: token, value: [matchObject[i]] }
        );
    }
    const option = Object.keys(matchObject)[0];
    return {
        type: expectedType,
        value: reformatMatch(matchObject[option], option.split(" ")),
    };
};

console.log(
    numMatches(
        ["Num"], ["f", "8", "is", "cool", "f", "9", "f", "8", "is", "cool"]
    )
);