const fs = require("fs");

const words = fs.readFileSync("words.txt", "utf-8").split("\r\n");

const WORD_LENGTH = 5;

const newPossibleLetters = () => ({
    spaces: Array(WORD_LENGTH)
        .fill()
        .map((_, i) => ({ blacklist: [] })),
    letterCounts: {},
});

if (words.some((word) => word.length !== WORD_LENGTH))
    throw `Not all words are ${WORD_LENGTH} letters long!`;

// GAME STUFF
const prompt = require("prompt-sync")();

const runGame = () => {
    const WORD = words[Math.floor(Math.random() * words.length)];
    let possibleLetters = newPossibleLetters();
    while (true) {
        console.log(filterWords(words, possibleLetters));
        const guess = prompt("Guess word!");
        if (guess === WORD) {
            console.log("You guessed it!");
            return;
        }
        const guessOutput = makeGuess(guess, WORD);
        console.log(guessOutput);
        possibleLetters = parseGuess(guess, guessOutput, possibleLetters);
        console.log(possibleLetters);
    }
};

const inspect = (obj) => require("util").inspect(obj, false, null, true);

const playGame = () => {
    let possibleLetters = newPossibleLetters();
    while (true) {
        console.log(filterWords(words, possibleLetters));
        const guess = prompt("Guess word! ");
        if (!words.includes(guess)) throw "IDK THAT WORD!";
        const guessOutput = prompt("What was output? ")
            .split(",")
            .map((a) => +a);
        possibleLetters = parseGuess(guess, guessOutput, possibleLetters);
        console.log(inspect(possibleLetters));
    }
};

// this is wrong
const makeGuess = (guess, realWord) => {
    // const counts = realWord.split('').reduce((p, c) => ({ ...p, [c]: (p[c] || 0) + 1 }), {});
    return guess.split("").map((letter, i) => {
        if (letter === realWord[i]) {
            return 2;
        }
        if (realWord.includes(letter)) {
            return 1;
        }
        return 0;
    });
};

// BOT STUFF

const VAction = (possibleLetters) => {
    return words.map((word) => [word, Q(word, possibleLetters)]);
};

const V = (possibleLetters) => {
    const possibleWords = filterWords(words, possibleLetters);

    if (possibleWords.length === 1) {
        return 1;
    }

    const usefulWords = words.filter((word) =>
        isWordUseful(word, possibleLetters)
    );
    console.log(usefulWords);
    let best = 1000000;
    for (let word of usefulWords) {
        best = Math.min(best, Q(word, possibleLetters));
    }
    return 1 + best;
};

const Q = (guess, possibleLetters) => {
    console.log(guess, possibleLetters);
    const possibleWords = filterWords(words, possibleLetters);
    let sum = 0;
    for (let word of possibleWords) {
        if (guess === word) continue;
        sum += V(parseGuess(guess, makeGuess(guess, word), possibleLetters));
    }
    return sum / possibleWords.length;
};

const parseGuess = (guess, guessOutput, oldPossibleLetters) => {
    const possibleLetters = deepCopy(oldPossibleLetters);

    const letterCountsInGuess = guess
        .split("")
        .reduce((p, c) => ({ ...p, [c]: (p[c] || 0) + 1 }), {});
    const letterCountsInAnswer = {};
    const atLeastOneInAnswer = {};
    guessOutput.forEach((result, i) => {
        const letter = guess[i];
        if (result === 2) {
            possibleLetters.spaces[i].letter = letter;
            letterCountsInAnswer[letter] =
                (letterCountsInAnswer[letter] || 0) + 1;
            return;
        }
        if (result === 1) {
            possibleLetters.spaces[i].blacklist.push(letter);
            atLeastOneInAnswer[letter] = true;
            return;
        }
        if (result === 0) {
            possibleLetters.spaces[i].blacklist.push(letter);
            return;
        }
    });

    Object.keys(letterCountsInGuess).forEach((letter) => {
        if (!letterCountsInAnswer[letter]) letterCountsInAnswer[letter] = 0;
        else letterCountsInAnswer[letter] = 1;
        if (!possibleLetters.letterCounts[letter])
            possibleLetters.letterCounts[letter] = [0, 5];
        possibleLetters.letterCounts[letter][0] = Math.max(
            possibleLetters.letterCounts[letter][0],
            letterCountsInAnswer[letter]
        );
        if (letterCountsInAnswer[letter] < letterCountsInGuess[letter])
            possibleLetters.letterCounts[letter][1] =
                letterCountsInAnswer[letter];
    });

    return possibleLetters;
};

const filterWords = (words, possibleLetters) => {
    return words.filter((word) => {
        if (
            word.split("").some((letter, i) => {
                if (possibleLetters.spaces[i].letter)
                    return possibleLetters.spaces[i].letter !== letter;
                return possibleLetters.spaces[i].blacklist.includes(letter);
            })
        )
            return false;

        const counts = word
            .split("")
            .reduce((p, c) => ({ ...p, [c]: (p[c] || 0) + 1 }), {});

        // const
        return Object.keys(counts).every(
            (letter) =>
                !possibleLetters.letterCounts[letter] ||
                (counts[letter] >= possibleLetters.letterCounts[letter][0] &&
                    counts[letter] <= possibleLetters.letterCounts[letter][1])
        );
    });
};

// This might need more work but should work for now
const isWordUseful = (word, possibleLetters) => {
    const counts = word
        .split("")
        .reduce((p, c) => ({ ...p, [c]: (p[c] || 0) + 1 }), {});
    // if (Object.keys(possibleLetters.letterCounts).reduce((sum, letter) => )
    if (
        Object.keys(counts).some(
            (letter) =>
                !possibleLetters.letterCounts[letter] ||
                (counts[letter] > possibleLetters.letterCounts[letter][0] &&
                    counts[letter] <= possibleLetters.letterCounts[letter][1])
        )
    )
        return true;

    return word.split("").some((letter, i) => {
        if (possibleLetters.spaces[i].letter) return false;
        return !possibleLetters.spaces[i].blacklist.includes(letter);
    });
};

const deepCopy = (object) => {
    if (typeof object === "object") {
        if (object.length === undefined)
            return Object.keys(object).reduce(
                (p, key) => ({ ...p, [key]: deepCopy(object[key]) }),
                {}
            );
        return object.map(deepCopy);
    }
    return object;
};

const deepEqual = (obj1, obj2) => {
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 === "object") {
        if (obj1.length !== obj2.length) return false;

        if (obj1.length === undefined) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) return false;
            return keys1.every((key) => deepEqual(obj1[key], obj2[key]));
        }
        return obj1.every((a, i) => deepEqual(a, obj2[i]));
    }
    return obj1 === obj2;
};

// console.log(VAction(newPossibleLetters()));

playGame();
