let TYPES = {};

// Default token
class Token {
    constructor(string) {
        if (string !== null) {
            this.string = string;
            this.tokenSet = { [this.string]: true };
        }
    }
    static makeToken(token) {
        if (token instanceof Token) return token;
        if (token instanceof Type) return new TypeToken(token);
        if (token instanceof Array) return new Pattern(token);
        return new Token(token);
    }

    print() {
        return this.string;
    }

    preMatch(listString) {
        if (listString.length > this.getMaxLength()) return false;
        if (listString.length < this.getMinLength()) return false;
        for (const [i, obj] of listString.entries()) {
            const token = typeof obj === 'string' ? obj : `type:${obj.type}`;
            if (i === 0 && !(token in this.getStartSet())) return false;
            if (i === listString.length - 1 && !(token in this.getEndSet())) return false;
            if (!(token in this.getTokenSet())) return false;
        }
        return true;
    }

    validate() {
        // No need to do anything here
    }

    getMinLength() {
        return 1;
    }

    getMaxLength() {
        return 1;
    }

    getTokenSet() {
        return this.tokenSet;
    }

    getStartSet() {
        return this.tokenSet;
    }

    getEndSet() {
        return this.tokenSet;
    }

    parse(listString) {
        if (!this.preMatch(listString)) return { error: "Did not pass the pre-match." };
        return true;
    }
}

// List of tokens, in order
class Pattern extends Token {
    constructor(pattern, separateWithSpaces = false) {
        super(null);
        this.pattern = pattern.reduce((p, token) => [...p, ...(token instanceof Pattern ? token.pattern : [Token.makeToken(token)])], []);
        if (separateWithSpaces) this.pattern = this.pattern.reduce((p, c) => p.length ? [...p, Token.makeToken(TYPES.whitespace), c] : [c], []);
    }

    validate() {
        this.pattern.forEach(token => token.validate());
    }

    getMinLength(seenTypes = {}) {
        if (this.minLength !== undefined) return this.minLength;
        let runningLength = 0;
        for (const token of this.pattern) {
            const length = token.getMinLength(seenTypes);
            // For min length, we have to return -1 because we cant say for sure until the other branches are set
            if (length === -1) return -1;
            // This shouldn't ever happen but whatever
            if (length >= Number.MAX_SAFE_INTEGER) {
                this.minLength = Number.MAX_SAFE_INTEGER;
                return this.minLength;
            }
            runningLength += length;
        }
        this.minLength = Math.min(runningLength, Number.MAX_SAFE_INTEGER);
        return this.minLength;
    }

    getMaxLength(seenTypes = {}) {
        if (this.maxLength !== undefined) return this.maxLength;
        let runningLength = 0;
        for (const token of this.pattern) {
            const length = token.getMaxLength(seenTypes);
            if (length === -1 || length >= Number.MAX_SAFE_INTEGER) {
                this.maxLength = Number.MAX_SAFE_INTEGER;
                return this.maxLength;
            }
            runningLength += length;
        }
        this.maxLength = Math.min(runningLength, Number.MAX_SAFE_INTEGER);
        return this.maxLength;
    }

    getTokenSet() {
        if (this.tokenSet !== undefined) return this.tokenSet;

        this.tokenSet = {};
        for (const token of this.pattern) {
            this.tokenSet = { ...this.tokenSet, ...token.getTokenSet() };
        }
        return this.tokenSet;
    }

    getStartSet() {
        if (this.startSet !== undefined) return this.startSet;
        this.startSet = {}

        for (let i = 0; i < this.pattern.length; i++) {
            this.startSet = { ...this.startSet, ...this.pattern[i].getStartSet() };
            if (this.pattern[i].getMinLength() > 0) break;
        }
        return this.startSet;
    }

    getEndSet() {
        if (this.endSet !== undefined) return this.endSet;
        this.endSet = {}

        for (let i = this.pattern.length - 1; i >= 0; i--) {
            this.endSet = { ...this.endSet, ...this.pattern[i].getEndSet() };
            if (this.pattern[i].getMinLength() > 0) break;
        }
        return this.endSet;
    }

    print() {
        return `[ ${this.pattern.map(token => token.print()).join(', ')} ]`
    }

    parse(listString) {
        console.log(this.print(), '->', listString);
        if (!this.preMatch(listString)) return { error: "Did not pass the pre-match." };

        if (this.pattern.length === 0) return true;

        for (let i = this.pattern[0].getMinLength(); i <= Math.min(listString.length, this.pattern[0].getMaxLength()); i++) {

            if (i > 0) {
                const obj = listString[i - 1];
                const ithTokenKey = typeof obj === 'string' ? obj : `type:${obj.type}`;
                if (!(ithTokenKey in this.pattern[0].getTokenSet()))
                    return { error: "All possible matches failed." };
            }

            const firstSlice = listString.slice(0, i);
            const firstMatch = this.pattern[0].parse(firstSlice);
            // console.log(firstMatch);
            if (firstMatch.error) continue;

            const secondSlice = listString.slice(i);
            const secondMatch = new Pattern(this.pattern.slice(1)).parse(secondSlice);
            // console.log(secondMatch);
            if (secondMatch.error) continue;

            return true;
        }

        return { error: "All possible matches failed." };
    }
}

// Tokens where there might be multiple other tokens inside of it or the number of tokens can be dynamic
class SuperToken extends Token {
    constructor(matchSet, range = [1, 1]) {
        super(null);
        this.matchSet = matchSet.map(token => Token.makeToken(token));
        this.range = range;
        if (this.range[1] === null) this.range[1] = Number.MAX_SAFE_INTEGER;
        if (this.range[1] < this.range[0]) throw `Range must be in the form [min, max] (Given: [${this.range}])`;
    }
    validate() {
        this.matchSet.forEach(token => token.validate());
    }

    print() {
        return `{ ${this.matchSet.map(token => token.print()).join(', ')} }(${this.range})`;
    }

    getMinLength(seenTypes = {}) {
        if (this.minLength !== undefined) return this.minLength;

        if (this.range[0] === 0) {
            this.minLength = 0;
            return this.minLength;
        }

        this.minLength = Number.MAX_SAFE_INTEGER;
        for (const token of this.matchSet) {
            const minLength = token.getMinLength(seenTypes);
            // if the token is a type that called this, dont go down that path.
            if (minLength === -1) continue;
            this.minLength = Math.min(this.minLength, minLength * this.range[0]);
            if (this.minLength === 0) break;
        }
        return this.minLength;
    }

    getMaxLength(seenTypes = {}) {
        if (this.maxLength !== undefined) return this.maxLength;

        if (this.range[1] === 0) {
            this.maxLength = 0;
            return this.maxLength;
        }

        this.maxLength = 0;
        for (const token of this.matchSet) {
            const maxLength = token.getMaxLength(seenTypes);
            // if the token is a type that called this, Then the maximum possible is infinite.
            if (maxLength === -1) {
                this.maxLength = Number.MAX_SAFE_INTEGER;
                return this.maxLength;
            }
            this.maxLength = Math.max(this.maxLength, maxLength * this.range[1]);
            if (this.maxLength >= Number.MAX_SAFE_INTEGER) break;
        }
        return Math.min(this.maxLength, Number.MAX_SAFE_INTEGER);
    }

    getTokenSet() {
        if (this.tokenSet !== undefined) return this.tokenSet;

        this.tokenSet = {};
        for (const token of this.matchSet) {
            this.tokenSet = { ...this.tokenSet, ...token.getTokenSet() };
        }
        return this.tokenSet;
    }

    getStartSet() {
        if (this.startSet !== undefined) return this.startSet;

        this.startSet = {};
        for (const token of this.matchSet) {
            this.startSet = { ...this.startSet, ...token.getStartSet() };
        }
        return this.startSet;
    }

    getEndSet() {
        if (this.endSet !== undefined) return this.endSet;

        this.endSet = {};
        for (const token of this.matchSet) {
            this.endSet = { ...this.endSet, ...token.getEndSet() };
        }
        return this.endSet;
    }

    parse(listString) {
        if (!this.preMatch(listString)) return { error: "Did not pass the pre-match." };

        // might not need to actually check range, if it passed the prematch and the length is 0 then it should return true
        if (listString.length === 0) return true;

        for (let i = this.getMinLength(); i <= Math.min(listString.length, this.getMaxLength()); i++) {

            if (i > 0) {
                const obj = listString[i - 1];
                const ithTokenKey = typeof obj === 'string' ? obj : `type:${obj.type}`;
                if (!(ithTokenKey in this.pattern[0].getTokenSet()))
                    return { error: "All possible matches failed." };
            }

            const firstSlice = listString.slice(0, i);
            const firstMatch = this.pattern[0].parse(firstSlice);
            // console.log(firstMatch);
            if (firstMatch.error) continue;

            const secondSlice = listString.slice(i);
            const secondMatch = new SuperToken(this.matchSet, [range[0] - 1, range[1] - 1]).parse(secondSlice);
            // console.log(secondMatch);
            if (secondMatch.error) continue;

            return true;
        }
        return { error: "All patterns did not return a match." };
    }
}

// Tokens that represent references to other tokens or groups of tokens
class TypeToken extends Token {
    constructor(type) {
        super(null);
        this.type = type;
    }
    validate() {
        if (this.type instanceof Type) return;
        if (!TYPES[this.type]) throw `Type ${this.type} does not exist.`;
        this.type = TYPES[this.type];
    }
    getMinLength(seenTypes = {}) {
        this.validate();
        return this.type.getMinLength(seenTypes);
    }
    getMaxLength(seenTypes = {}) {
        this.validate();
        return this.type.getMaxLength(seenTypes);
    }
    getTokenSet() {
        this.validate();
        return this.type.getTokenSet();
    }
    getStartSet() {
        this.validate();
        return this.type.getStartSet();
    }
    getEndSet() {
        this.validate();
        return this.type.getEndSet();
    }
    print() {
        return this.type.typeName;
    }

    parse(listString) {
        console.log(this.print(), '->', listString);
        if (!this.preMatch(listString)) return { error: "Did not pass the pre-match." };

        for (const pattern of this.type.patterns) {
            const match = pattern.parse(listString);
            if (match.error) continue;
            return true;
        }
        return { error: "All patterns did not return a match." };
    }
}

class Type {
    constructor(name, ...patterns) {
        this.typeName = name;
        TYPES[name] = this;
        this.patterns = patterns.map(pattern => pattern instanceof Function ? Token.makeToken(pattern(this)) : Token.makeToken(pattern));
    }

    addPattern(...pattern) {
        this.patterns.push(Token.makeToken(pattern));
    }

    validate() {
        this.patterns.forEach(pattern => pattern.validate());
    }

    getMinLength(seenTypes = {}) {
        if (this.minLength !== undefined) return this.minLength;
        if (seenTypes[this.typeName]) return -1;

        const newSeenTypes = { ...seenTypes, [this.typeName]: true };

        for (const pattern of this.patterns) {
            if (pattern.getMinLength(newSeenTypes) === 0) {
                // We can write here because this will be true regardless
                this.minLength = 0;
                return 0;
            }
        }
        // Only write if this is a root call
        if (Object.keys(seenTypes).length === 0) this.minLength = 1;
        return 1;
    }

    getMaxLength(seenTypes = {}) {
        if (this.maxLength !== undefined) return this.maxLength;
        if (seenTypes[this.typeName]) return -1;

        const newSeenTypes = { ...seenTypes, [this.typeName]: true };

        let maxLength = 0;
        for (const pattern of this.patterns) {
            let length = pattern.getMaxLength(newSeenTypes);
            if (length >= Number.MAX_SAFE_INTEGER) {
                this.maxLength = Number.MAX_SAFE_INTEGER;
                return this.maxLength;
            }
            maxLength = Math.max(maxLength, length);
        }
        if (Object.keys(seenTypes).length === 0) this.maxLength = maxLength;
        return maxLength;
    }

    getTokenSet() {
        if (this.tokenSet !== undefined) return this.tokenSet;
        let tokenSet = { [`type:${this.typeName}`]: true };
        for (const pattern of this.patterns) {
            tokenSet = { ...tokenSet, ...pattern.getTokenSet() };
        }
        this.tokenSet = tokenSet;
        return this.tokenSet;
    }

    getStartSet() {
        if (this.startSet !== undefined) return this.startSet;
        let startSet = { [`type:${this.typeName}`]: true };
        for (const pattern of this.patterns) {
            startSet = { ...startSet, ...pattern.getStartSet() };
        }
        this.startSet = startSet;
        return this.startSet;
    }

    getEndSet() {
        if (this.endSet !== undefined) return this.endSet;
        let endSet = { [`type:${this.typeName}`]: true };
        for (const pattern of this.patterns) {
            endSet = { ...endSet, ...pattern.getEndSet() };
        }
        this.endSet = endSet;
        return this.endSet;
    }

    makeHeuristics() {
        this.getMinLength();
        this.getMaxLength();
        this.getTokenSet();
        this.getStartSet();
        this.getEndSet();
    }

    parse(listString) {
        return new TypeToken(this).parse(listString);
    }
}

const optional = token => new SuperToken([token], [0, 1]);
const anyAmount = token => new SuperToken([token], [0, null]);
const atLeastOne = token => new SuperToken([token], [1, null]);
const spacedPattern = (...pattern) => new Pattern(pattern, true);

const makeAllHeuristics = () => {
    Object.keys(TYPES).forEach(type => TYPES[type].makeHeuristics());
}

// module.exports = (types = {}) => {
//     TYPES = types;
//     // these are declared by default
//     const space = new Type('space', ' ', '\t', '\n', '\r');
//     const whitespace = new Type('whitespace', anyAmount(space));
//     const digit = new Type('digit', ...'0123456789'.split(''));
//     const letter = new Type('letter', ...'abcdefghijklmnopqrstuvwxyz'.split(''));
//     const alnum = new Type('alnum', digit, letter);

//     // shouldn't really need the first couple with the helper functions
//     return { Token, SuperToken, Pattern, TypeToken, Type, optional, anyAmount, atLeastOne, spacedPattern, makeAllHeuristics, DEFAULT_TYPES: TYPES };
// }


const space = new Type('space', ' ', '\t', '\n', '\r');
const whitespace = new Type('whitespace', anyAmount(space));
const digit = new Type('digit', ...'0123456789'.split(''));
const letter = new Type('letter', ...'abcdefghijklmnopqrstuvwxyz'.split(''));
const alnum = new Type('alnum', digit, letter);

const numlit = new Type('numlit', atLeastOne(digit));
const N = new Type('N', (N) => spacedPattern(N, '-', N), (N) => spacedPattern('-', N), numlit);

setTimeout(() => { throw "DONE" }, 1000);
console.log(N.parse('1-0'.split('')));