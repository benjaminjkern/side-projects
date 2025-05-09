const TRUTH_WITNESSES = 0.25;

const generateRandomNumber = (digits) => {
    while (true) {
        const n = BigInt(
            Array(digits)
                .fill()
                .map(() => Math.floor(Math.random() * 10))
                .join("")
        );
        if (n !== 0n) return n;
    }
};

const millerRabin = (n) => {
    const digits = String(n).length;
    // Handle single digits
    if (digits === 1) return [2n, 3n, 5n, 7n].includes(n);
    const witness = generateRandomNumber(digits - 1);
    let power = n - 1n;
    let hasBeenSuccessful = false;
    let tries = 0;
    while (true) {
        if (!bigIsEven(power)) return hasBeenSuccessful;
        const mod = bigMod(witness, power, n);
        if (mod !== 1n) {
            if (!hasBeenSuccessful) return false;
            return mod === n - 1n;
        }
        tries++;
        hasBeenSuccessful = true;
        power /= 2n;
    }
};

const bigIsEven = (n) => n % 2n === 0n;

const bigMod = (a, b, p) => {
    if (a === 0n) return 0n;
    if (b === 0n) return 1n;
    if (b === 1n) return a % p;
    if (a >= p) return bigMod(a % p, b, p);
    if (bigIsEven(b)) return bigMod((a * a) % p, b / 2n, p);
    return (a * bigMod(a, b - 1n, p)) % p;
};

const threshold = 1e-100;

const isProbablyPrime = (n) => {
    let attempts = 0;
    while (true) {
        if (!millerRabin(n)) return false;
        attempts++;
        if (TRUTH_WITNESSES ** attempts < threshold) return true;
    }
};

const countPrimes = (digits) => {
    let triesWithoutMatch = 0;
    const seen = {};

    while (true) {
        triesWithoutMatch++;
        if (triesWithoutMatch > 20 ** digits) break;
        const n = generateRandomNumber(digits);
        if (!isProbablyPrime(n)) continue;
        if (!seen[n]) triesWithoutMatch = 0;
        seen[n] = true;
    }
    return seen;
};

const fs = require("fs");

const writtenPrimes = fs
    .readFileSync("primes.txt", "utf8")
    .split("\n")
    .reduce((p, c) => ({ ...p, [c]: true }), {});

const setSubtract = (a, b) => {
    return Object.keys(a).reduce(
        (p, c) => (b[c] ? p : { ...p, [c]: true }),
        {}
    );
};
const primes5 = countPrimes(5);

console.log(
    setSubtract(primes5, writtenPrimes),
    setSubtract(writtenPrimes, primes5)
);
console.log(Object.keys(primes5).length, Object.keys(writtenPrimes).length);
