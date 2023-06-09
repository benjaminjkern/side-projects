const fs = require("fs");
const WORDLENGTH = 4;
const WORDS = fs.readFileSync("fourletters.txt", "utf8").split(" ");

// const WORDS = ['cat', 'man', 'dog', 'dot', 'met', 'cot'];

const match = (guess, answer) => {
    return guess.split("").map((g, i) => {
        if (g === answer[i]) return 2;
        if (answer.includes(g)) return 1;
        return 0;
    });
};

const newKnowledgebase = (kb) => {
    if (!kb)
        return {
            letters: Array(WORDLENGTH)
                .fill()
                .map(() => ({
                    correctLetter: undefined,
                    blacklistLetters: {},
                })),
            requiredLetters: {},
            blacklistLetters: {},
        };
    return {
        letters: Array(WORDLENGTH)
            .fill()
            .map((_, i) => ({
                correctLetter: kb.letters[i].correctLetter,
                blacklistLetters: { ...kb.letters[i].blacklistLetters },
            })),
        requiredLetters: { ...kb.requiredLetters },
        blacklistLetters: { ...kb.blacklistLetters },
    };
};

const parseMatch = (guess, matchResult, knowledgebase) => {
    const kb = newKnowledgebase(knowledgebase);
    matchResult.forEach((m, i) => {
        if (m === 2) {
            kb.letters[i].correctLetter = guess[i];
            return;
        }
        kb.letters[i].blacklistLetters[guess[i]] = true;
        if (m === 1) {
            kb.requiredLetters[guess[i]] = true;
        }
    });
    matchResult.forEach((m, i) => {
        if (m !== 0 || kb.requiredLetters[guess[i]]) return;
        kb.blacklistLetters[guess[i]] = true;
    });
    return kb;
};

const possibleAnswers = (words, kb) => {
    return words.filter((word) => {
        if (
            Object.keys(kb.requiredLetters).some(
                (letter) => !word.includes(letter)
            )
        )
            return false;
        if (
            Object.keys(kb.blacklistLetters).some((letter) =>
                word.includes(letter)
            )
        )
            return false;
        return word
            .split("")
            .every((letter, i) =>
                kb.letters[i].correctLetter
                    ? kb.letters[i].correctLetter === letter
                    : !kb.letters[i].blacklistLetters[letter]
            );
    });
};

const valuableGuessAnswers = (
    words,
    kb,
    possible = possibleAnswers(words, kb)
) => {
    return [
        ...possible,
        ...words.filter((guess) => {
            return (
                !possible.includes(guess) &&
                possible.some(
                    (answer) =>
                        possibleAnswers(
                            possible,
                            parseMatch(guess, match(guess, answer), kb)
                        ).length < possible.length
                )
            );
        }),
    ];
};
const VCache = {};

const makeKey = (possible) => possible.sort().join(",");

const V = (
    words = WORDS,
    kb = newKnowledgebase(),
    possible = possibleAnswers(words, kb)
) => {
    if (possible.length === 1) return 1;
    if (possible.length === 0) throw "Impossible";
    const key = makeKey(possible);
    if (VCache[key]) return VCache[key];
    const guesses = valuableGuessAnswers(words, kb, possible);

    let best = 100000000;
    for (const guess of guesses) {
        const value = Q(guess, words, kb, possible);
        if (value < best) best = value;
    }
    VCache[key] = best;
    return best;
};

const QCache = {};

const Q = (
    guess,
    words = WORDS,
    kb = newKnowledgebase(),
    possible = possibleAnswers(words, kb)
) => {
    const key = guess + ";" + makeKey(possible);
    if (QCache[key]) return QCache[key];
    let sum = 0;
    for (const answer of possible) {
        if (guess === answer) continue;
        sum += V(words, parseMatch(guess, match(guess, answer), kb));
    }
    QCache[key] = 1 + sum / possible.length;
    return QCache[key];
};

const allActions = (words = WORDS, kb = newKnowledgebase()) => {
    return words.map((guess) => [guess, Q(guess, words, kb)]);
};

console.log(allActions());
